<template>
  <div class="top-sites-chart">
    <h3 class="chart-title">Top 4 Sites</h3>
    <div class="chart-layout">
      <div class="chart-container">
        <Doughnut :data="data" :options="options" v-if="data != undefined" />
      </div>
      <div class="sites-list" v-if="topSites && topSites.length > 0">
        <div v-for="(site, index) in topSites" :key="index" class="site-item">
          <div class="site-color" :style="{ backgroundColor: chartColors[index] }"></div>
          <div class="site-info">
            <div class="site-url">{{ site.url }}</div>
            <div class="site-time">{{ convertSummaryTimeToString(getTodaySummaryTime(site)) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TopSitesPieChart',
};
</script>

<script lang="ts" setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { convertSummaryTimeToString } from '../utils/converter';
import { injectStorage } from '../storage/inject-storage';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { DARK_MODE_DEFAULT, StorageParams } from '../storage/storage-params';
import { useTodayTabListSummary } from '../functions/useTodayTabListSummary';
import { SortingBy } from '../utils/enums';
import { Tab } from '../entity/tab';
import { todayLocalDate } from '../utils/date';

const settingsStorage = injectStorage();
const darkMode = ref(false);
const data = ref();
const options = ref();
const isLoading = ref(true);
const topSites = ref<Tab[]>([]);

// Chart colors
const chartColors = [
  '#5668e2',
  '#8a56e2',
  '#cf56e2',
  '#e256ae',
];

// Process tabs to get top 4 sites for the pie chart using TODAY's data
async function processTabsData() {
  isLoading.value = true;
  
  // Get today's tab list summary - same data source as used in TabList.vue
  const tabSummary = await useTodayTabListSummary(SortingBy.UsageTime);
  
  if (!tabSummary || !tabSummary.tabs || tabSummary.tabs.length === 0) {
    isLoading.value = false;
    return;
  }
  
  // Get the tabs data
  const tabs = tabSummary.tabs;
  
  // Extract top 4 sites
  const top4Sites = tabs.slice(0, 4);
  
  // Get TODAY's data for each site - this is what's shown in the table
  const labels = top4Sites.map(tab => tab.url);
  const timeValues = top4Sites.map(tab => {
    // Get today's summary time for this tab - exactly as shown in the table
    const todayData = tab.days.find(day => day.date === todayLocalDate());
    return todayData ? todayData.summary : 0;
  });
  
  // Save top sites for the list - keep the original Tab objects
  topSites.value = top4Sites;
  
  // Set chart data
  setupChartData(labels, timeValues);
  isLoading.value = false;
}

function setupChartData(labels: string[], timeValues: number[]) {
  data.value = {
    labels: labels,
    datasets: [
      {
        borderWidth: 2,
        borderColor: darkMode.value ? '#303030' : '#fff',
        color: '#fff',
        backgroundColor: chartColors,
        data: timeValues,
      },
    ],
  };
  
  options.value = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.label + ': ' + convertSummaryTimeToString(context.raw);
          },
        },
      },
      // Add datalabels plugin configuration
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 12,
        },
        formatter: (value: number, ctx: any) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
        display: function(context: any) {
          // Only display labels for segments that are large enough
          return context.dataset.data[context.dataIndex] / context.dataset.data.reduce((a: number, b: number) => a + b, 0) > 0.05;
        },
      },
    },
  };
}

// Get today's summary time for a tab
function getTodaySummaryTime(tab: Tab): number {
  const todayData = tab.days.find(day => day.date === todayLocalDate());
  return todayData ? todayData.summary : 0;
}

// Handler for refresh events
function handleRefresh() {
  processTabsData();
}

onMounted(async () => {
  darkMode.value = await settingsStorage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);
  await processTabsData();
  
  // Listen for refresh events from parent component
  window.addEventListener('refresh-data', handleRefresh);
});

// Clean up event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<style scoped>
.top-sites-chart {
  margin: 20px auto;
  width: 100%;
}

.chart-title {
  text-align: center;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}

.chart-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  height: 300px;
  width: 50%;
}

.sites-list {
  width: 45%;
  padding-left: 20px;
}

.site-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.site-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 10px;
}

.site-info {
  flex-grow: 1;
}

.site-url {
  font-weight: 500;
  margin-bottom: 3px;
}

.site-time {
  font-size: 14px;
  color: #666;
}
</style>

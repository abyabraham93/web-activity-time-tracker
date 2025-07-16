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
            <div class="site-time">{{ convertSummaryTimeToString(site.summaryTime) }}</div>
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
import { onMounted, ref, watch } from 'vue';
import { DARK_MODE_DEFAULT, StorageParams } from '../storage/storage-params';
import { useTodayTabListSummary } from '../functions/useTodayTabListSummary';
import { SortingBy } from '../utils/enums';
import { Tab } from '../entity/tab';

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

// Process tabs to get top 4 sites and combine the rest as "Others"
async function processTabsData() {
  isLoading.value = true;
  
  // Get today's tab list summary
  const tabSummary = await useTodayTabListSummary(SortingBy.UsageTime);
  
  if (!tabSummary || !tabSummary.tabs || tabSummary.tabs.length === 0) {
    isLoading.value = false;
    return;
  }
  
  const tabs = tabSummary.tabs;
  const summaryTime = tabSummary.summaryTime || 0;
  
  // Extract top 4 sites
  const top4Sites = tabs.slice(0, 4);
  
  // Prepare data for chart - only top 4 sites
  const labels = top4Sites.map(tab => tab.url);
  const timeValues = top4Sites.map(tab => tab.summaryTime);
  
  // Save top sites for the list
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

onMounted(async () => {
  darkMode.value = await settingsStorage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);
  await processTabsData();
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

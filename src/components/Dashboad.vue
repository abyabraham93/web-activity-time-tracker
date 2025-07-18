<template>
  <div class="settings-item">
    <label class="title"> {{ t('dashboard.message') }} </label>
  </div>
  <div class="chart chartByHours">
    <div class="mt-10 mb-20">
      <button
        :class="['chart-btn', chart == TypeOfChart.Horly ? 'active' : '']"
        @click="openChart(TypeOfChart.Horly)"
      >
        <img class="ml-5" src="../assets/icons/by-hours.svg" height="22" />
        {{ t('byHours.message') }}
      </button>
      <button
        :class="['ml-10', 'chart-btn', chart == TypeOfChart.Interval ? 'active' : '']"
        @click="openChart(TypeOfChart.Interval)"
      >
        <img class="ml-5" src="../assets/icons/by-intervals.svg" height="22" />
        {{ t('intervals.message') }}
      </button>
      <button
        :class="['ml-10', 'chart-btn', chart == TypeOfChart.Notes ? 'active' : '']"
        @click="openChart(TypeOfChart.Notes)"
      >
        <span class="ml-5 notes-icon">📝</span>
        {{ t('notes.message') }}
      </button>
      <button
        :class="['ml-10', 'chart-btn', chart == TypeOfChart.Blank ? 'active' : '']"
        @click="openChart(TypeOfChart.Blank)"
      >
        <span class="ml-5 blank-icon">🔒</span>
        {{ t('Blank') }}
      </button>
    </div>
    <HourlyChart v-if="chart == TypeOfChart.Horly" />
    <TimeIntervalChart v-if="chart == TypeOfChart.Interval" />
    <NotesView v-if="chart == TypeOfChart.Notes" />
    <BlankView v-if="chart == TypeOfChart.Blank" />
  </div>
  <div v-if="chart == TypeOfChart.Horly">
    <div v-if="isLoadingData" class="loading-indicator">Loading...</div>
    <template v-else>
      <TopSitesPieChart :tabListData="dashboardData" />
      <div class="tab-items">
        <TabList :type="TypeOfList.Dashboard" :showAllStats="false" :tabListData="dashboardData" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Dashboard',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import TimeIntervalChart from './TimeIntervalChart.vue';
import HourlyChart from './HourlyChart.vue';
import NotesView from './NotesView.vue';
import BlankView from './BlankView.vue';
import TabList from '../components/TabList.vue';
import TopSitesPieChart from './TopSitesPieChart.vue';
import { TypeOfList, SortingBy } from '../utils/enums';
import { onMounted, ref, onUnmounted, watch } from 'vue';
import Browser from 'webextension-polyfill';
import { useTodayTabListSummary } from '../functions/useTodayTabListSummary';
import { TabListSummary } from '../dto/tabListSummary';
import { Tab } from '../entity/tab';

const { t } = useI18n();
const chart = ref<TypeOfChart>();
const refreshTimer = ref<number | null>(null);

// Shared data state for dashboard components
const dashboardData = ref<TabListSummary | null>(null);
const isLoadingData = ref<boolean>(true);

enum TypeOfChart {
  Horly,
  Interval,
  Notes,
  Blank,
}

// Storage key for saving chart preference
const CHART_PREFERENCE_KEY = 'dashboard_chart_preference';

onMounted(async () => {
  try {
    const result = await Browser.storage.local.get([CHART_PREFERENCE_KEY]);
    if (result[CHART_PREFERENCE_KEY] !== undefined) {
      chart.value = result[CHART_PREFERENCE_KEY];
    } else {
      chart.value = TypeOfChart.Horly;
    }
    
    // Load dashboard data on mount
    await loadDashboardData();
    
    if (chart.value === TypeOfChart.Horly) {
      startRefreshTimer();
    }
  } catch (error) {
    console.error('Error loading chart preference:', error);
    chart.value = TypeOfChart.Horly;
  }
});

// Clean up timer when component is unmounted
onUnmounted(() => {
  stopRefreshTimer();
});

// Create a simple event bus for component communication
const refreshEvent = new CustomEvent('refresh-data');

// Function to load dashboard data
async function loadDashboardData() {
  isLoadingData.value = true;
  try {
    // Load data using the same function that TabList and TopSitesPieChart use
    const data = await useTodayTabListSummary(SortingBy.UsageTime);
    dashboardData.value = data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    isLoadingData.value = false;
  }
}

// Function to emit the refresh event to child components and reload data
async function emitRefreshEvent() {
  await loadDashboardData();
  window.dispatchEvent(refreshEvent);
}

// Start the refresh timer for hourly view
function startRefreshTimer() {
  if (refreshTimer.value === null) {
    // Set timer to refresh every 30 seconds (30000 ms)
    refreshTimer.value = window.setInterval(() => {
      emitRefreshEvent();
    }, 30000);
  }
}

// Stop the refresh timer
function stopRefreshTimer() {
  if (refreshTimer.value !== null) {
    window.clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
}

async function openChart(type: TypeOfChart) {
  chart.value = type;
  
  // Start or stop refresh timer based on chart type
  if (type === TypeOfChart.Horly) {
    startRefreshTimer();
  } else {
    stopRefreshTimer();
  }
  
  // Save preference to storage
  try {
    await Browser.storage.local.set({ [CHART_PREFERENCE_KEY]: type });
  } catch (error) {
    console.error('Error saving chart preference:', error);
  }
}
</script>

<style scoped>
.chart {
  margin: 20px 0;
  width: 80%;
}

.notes-icon {
  font-size: 16px;
  vertical-align: middle;
}

.blank-icon {
  font-size: 16px;
  vertical-align: middle;
}

.tab-items {
  width: 80%;
  margin-top: 10px;
}
/* .chartByHours height removed */
.chart-btn {
  background-color: rgb(192, 192, 192);
  color: #000;
  border-radius: 7px;
  height: 36px;
  line-height: 35px;
  padding: 0 20px;
  border: 0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  min-width: 80px;
  text-align: center;
  width: 200px;
}

.chart-btn.active {
  background-color: #5377af !important;
  color: #000;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}
</style>

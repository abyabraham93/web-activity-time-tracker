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
        {{ t('blank') }}
      </button>
    </div>
    <HourlyChart v-if="chart == TypeOfChart.Horly" />
    <TimeIntervalChart v-if="chart == TypeOfChart.Interval" />
    <NotesView v-if="chart == TypeOfChart.Notes" />
    <BlankView v-if="chart == TypeOfChart.Blank" />
  </div>
  <div class="tab-items">
    <TabList :type="TypeOfList.Dashboard" :showAllStats="false" v-if="chart == TypeOfChart.Horly" />
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
import { TypeOfList } from '../utils/enums';
import { onMounted, ref } from 'vue';
import Browser from 'webextension-polyfill';

const { t } = useI18n();
const chart = ref<TypeOfChart>();

enum TypeOfChart {
  Horly,
  Interval,
  Notes,
  Blank,
}

// Storage key for saving chart preference
const CHART_PREFERENCE_KEY = 'dashboard_chart_preference';

onMounted(async () => {
  // Get saved preference from storage
  try {
    const result = await Browser.storage.local.get(CHART_PREFERENCE_KEY);
    const savedPreference = result[CHART_PREFERENCE_KEY];
    
    // If we have a saved preference, use it
    if (savedPreference !== undefined) {
      chart.value = savedPreference;
    } else {
      // Default to hourly view
      chart.value = TypeOfChart.Horly;
    }
  } catch (error) {
    console.error('Error loading chart preference:', error);
    // Default to hourly view if error
    chart.value = TypeOfChart.Horly;
  }
});

async function openChart(type: TypeOfChart) {
  chart.value = type;
  
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
  color: #fff;
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
  color: white;
}
</style>

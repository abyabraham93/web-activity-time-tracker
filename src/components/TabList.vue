<template>
  <div class="no-data" v-if="isLoading">
    <img height="55" src="../assets/icons/preloader.gif" />
  </div>
  <div v-else>
    <div class="no-data" v-if="countOfSites == undefined || countOfSites == 0">
      {{ t('noData.message') }}
    </div>
    <div v-else>
      <OverallStatistics v-if="isShowOverallStats" :data="dataForOvarallStats" />
      <DonutChart
        :time="timeForChart"
        :labels="sitesForChart"
        v-if="type != TypeOfList.Dashboard"
      />
      <TabItemHeader
        :listType="type"
        :summaryTime="summaryTime"
        :countOfSites="countOfSites"
        :firstDay="firstDay"
        :countOfActiveDays="countOfActiveDays"
        @sortingBy="sorting"
      />

      <TabItem
        v-for="(tab, i) of tabs"
        :key="i"
        :item="getItem(tab)"
        :listType="type"
        :summaryTimeForWholeDay="summaryTime"
      />

      <div class="show-all" v-if="showOnlyFirst100Items">
        <button @click="showAllWebSites()">{{ t('showAll.message') }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TabList',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TabItem from '../components/TabItem.vue';
import TabItemHeader from '../components/TabItemHeader.vue';
import DonutChart from '../components/DonutChart.vue';
import OverallStatistics from '../components/OverallStatistics.vue';
import { Tab } from '../entity/tab';
import { SortingBy, TypeOfList } from '../utils/enums';
import { CurrentTabItem } from '../dto/currentTabItem';
import { useTodayTabListSummary } from '../functions/useTodayTabListSummary';
import { useAllTabListSummary } from '../functions/useAllTabListSummary';
import { todayLocalDate } from '../utils/date';
import { OverallStats } from '../dto/tabListSummary';
import { TabListSummary } from '../dto/tabListSummary';

const { t } = useI18n();

const props = defineProps({
  type: {
    type: Number as PropType<TypeOfList>,
    required: true,
  },
  showAllStats: {
    type: Boolean,
    default: true,
  },
  tabListData: {
    type: Object as PropType<TabListSummary | null>,
    default: null
  }
});

const isShowOverallStats = computed(() => props.showAllStats && props.type == TypeOfList.All);

let loadedTabs: Tab[] = [];
const tabs = ref<Tab[]>();
const dataForOvarallStats = ref<OverallStats>();

const timeForChart = ref<number[]>();
const sitesForChart = ref<string[]>();

const summaryTime = ref<number>();
const firstDay = ref<Date>();
const countOfActiveDays = ref<number>();

const countOfSites = computed(() => (tabs.value != undefined ? tabs.value.length : 0));
const isLoading = ref<boolean>(true);

const showOnlyFirst100Items = ref<boolean>();

function showAllWebSites() {
  showOnlyFirst100Items.value = false;
  tabs.value = loadedTabs;
}

async function loadList(sortingBy: SortingBy) {
  let tabSummary = null;
  
  // Use shared data from Dashboard if available
  if (props.tabListData && (props.type == TypeOfList.Today || props.type == TypeOfList.Dashboard)) {
    tabSummary = props.tabListData;
  } else {
    // Otherwise fetch data as before
    if (props.type == TypeOfList.Today || props.type == TypeOfList.Dashboard)
      tabSummary = await useTodayTabListSummary(sortingBy);
    if (props.type == TypeOfList.All) {
      tabSummary = await useAllTabListSummary(sortingBy);
    }
  }
  
  if (tabSummary != null) {
    // Process All type specific data
    if (props.type == TypeOfList.All && tabSummary.firstDay) {
      firstDay.value = tabSummary.firstDay;
      countOfActiveDays.value = tabSummary.activeDaysTotal || 0;
      dataForOvarallStats.value = tabSummary;
    }
    
    // Process common data
    loadedTabs = tabSummary.tabs;
    tabs.value = tabSummary.tabs;
    summaryTime.value = tabSummary.summaryTime || 0;
    
    if (tabSummary.chart) {
      timeForChart.value = tabSummary.chart.timeForChart || [];
      sitesForChart.value = tabSummary.chart.sitesForChart || [];
    }

    // Handle pagination for All type
    if (props.type == TypeOfList.All && loadedTabs.length > 100) {
      showOnlyFirst100Items.value = true;
      tabs.value = tabSummary.tabs.slice(0, 100);
    } else showOnlyFirst100Items.value = false;
  }

  isLoading.value = false;
}

async function sorting(sortingBy: SortingBy) {
  switch (sortingBy) {
    case SortingBy.UsageTime:
      await loadList(SortingBy.UsageTime);
      break;
    case SortingBy.Sessions:
      await loadList(SortingBy.Sessions);
      break;
  }
}

function getItem(tab: Tab): CurrentTabItem {
  return {
    summaryTime:
      props.type == TypeOfList.Today || props.type == TypeOfList.Dashboard
        ? tab.days.find(day => day.date === todayLocalDate())!.summary
        : tab.summaryTime,
    favicon: tab.favicon,
    url: tab.url,
    sessions:
      props.type == TypeOfList.Today || props.type == TypeOfList.Dashboard
        ? tab.days.find(day => day.date === todayLocalDate())!.counter
        : tab.counter,
  };
}

// Handler for refresh events
function handleRefresh() {
  if (props.type === TypeOfList.Today || props.type === TypeOfList.Dashboard) {
    loadList(SortingBy.UsageTime);
  }
}

// Watch for changes in the tabListData prop
watch(() => props.tabListData, (newData) => {
  if (newData && (props.type == TypeOfList.Today || props.type == TypeOfList.Dashboard)) {
    loadList(SortingBy.UsageTime);
  }
}, { deep: true });

onMounted(async () => {
  isLoading.value = true;
  await loadList(SortingBy.UsageTime);
  
  // Listen for refresh events from parent component
  window.addEventListener('refresh-data', handleRefresh);
});

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<style scoped>
.show-all {
  text-align: center;
  padding-bottom: 10px;
}

.show-all button {
  background-color: aliceblue;
  border-radius: 5px;
  border: 1px rgb(202, 202, 202) solid;
  font-size: 13px;
  cursor: pointer;
  padding: 5px 25px;
}
</style>

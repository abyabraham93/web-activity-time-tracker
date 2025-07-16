import Browser from 'webextension-polyfill';
import { initTracker } from './tracker';
import { logger } from './utils/logger';
import { scheduleJobs } from './jobs/sheduler';
import { Settings } from './functions/settings';
import { StorageParams } from './storage/storage-params';
import { injectStorage } from './storage/inject-storage';
import { todayLocalDate } from './utils/date';
import { checkPomodoro } from './functions/pomodoro';
import { Messages } from './utils/messages';
import { injectTabsRepositorySingleton } from './repository/inject-tabs-repository';

logger.log('Start background script');
// Using NodeJS.Timeout type for compatibility with setInterval
let pomodoroTimer: ReturnType<typeof setInterval>;

// Handle new tab creation to show dashboard but keep URL bar empty
Browser.tabs.onCreated.addListener(async (tab) => {
  // Check if this is a new tab page
  if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
    // Get the dashboard URL
    const dashboardUrl = Browser.runtime.getURL('src/dashboard.html') + '?tab=dashboard';
    
    // Update the tab to load our dashboard
    await Browser.tabs.update(tab.id, {
      url: dashboardUrl
    });
  }
});

self.onerror = err => {
  console.error('Unhandled error:', err);
};

Browser.storage.onChanged.addListener(async (changes, namespace) => {
  for (var key in changes) {
    if (Object.values(StorageParams).includes(key as StorageParams))
      await Settings.getInstance().reloadSetting(key as StorageParams);

    if (key == StorageParams.IS_POMODORO_ENABLED) {
      const value = changes[StorageParams.IS_POMODORO_ENABLED].newValue;
      pomodoro(value);
    }
  }
});

Browser.runtime.setUninstallURL('https://webtracker.online/goodbye.html');

Browser.runtime.onInstalled.addListener(async details => {
  if (details.reason == 'install') {
    logger.log('Extension installed:', details);
    const settingsStorage = injectStorage();
    await settingsStorage.saveValue(StorageParams.INSTALL_DATE, todayLocalDate());

    const initialPageUrl = Browser.runtime.getURL('src/welcome.html');
    await Browser.tabs.create({
      url: initialPageUrl,
      active: true,
    });
  }
  if (details.reason == 'update' && !details.previousVersion) {
    const showChangelog = (await Settings.getInstance().getSetting(
      StorageParams.SHOW_CHANGELOG,
    )) as boolean;
    if (showChangelog)
      await Browser.tabs.create({
        url: 'https://webtracker.online/releasenotes.html',
        active: true,
      });
  }
});

Browser.runtime.onStartup.addListener(() => {
  logger.log(`onStartup event`);
});

Browser.windows.onFocusChanged.addListener(() => {
  logger.log('onFocusChanged');
});

async function pomodoro(value?: boolean) {
  if (value == undefined) {
    const settingsStorage = injectStorage();
    value = await settingsStorage.getValue(StorageParams.IS_POMODORO_ENABLED);
  }
  if (value == true) pomodoroTimer = setInterval(checkPomodoro, 1000);
  else clearInterval(pomodoroTimer);
}

pomodoro();
scheduleJobs();
initTracker();

Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message == Messages.ClearAllData) {
    const storage = injectStorage();
    const repo = await injectTabsRepositorySingleton();
    repo.removeAllTabs();
    await storage.saveTabs([]);
  }
  if (message.message == Messages.Restore) {
    const storage = injectStorage();
    await storage.saveTabs(message.data);
    const repo = await injectTabsRepositorySingleton();
    repo.initAsync();
  }
  if (message.action === 'getDashboardUrl') {
    // Handle the dashboard URL request from newtab.html
    const dashboardUrl = Browser.runtime.getURL('src/dashboard.html') + '?tab=dashboard';
    // If the sender has a tab, navigate it directly
    if (sender.tab && sender.tab.id) {
      Browser.tabs.update(sender.tab.id, { url: dashboardUrl });
    }
    return true; // Keep the message channel open for async response
  }
});

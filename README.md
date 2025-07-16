# Web Activity Time Tracker - Enhanced Fork

## 🔍 About This Fork

This is an enhanced fork of the original [Web Activity Time Tracker](https://github.com/Stigmatoz/web-activity-time-tracker/) by [Stigmatoz](https://github.com/Stigmatoz). All credit for the original extension goes to the original author.


This extension tracks your web time and shows you the cold, hard truth about your browsing habits. Set daily limits and get blocked when you've wasted enough time.

Your data stays on YOUR device. We use local [chrome.storage API](https://developer.chrome.com/apps/storage) only - no cloud uploads, no tracking, no judgment (well, maybe a little).

![image](https://user-images.githubusercontent.com/23387046/206865140-875bf7ab-a59e-42e3-bb9e-e348e8b85749.png) ![image](https://user-images.githubusercontent.com/23387046/206865174-aa409efe-495d-450e-a8ea-1d97024c9e23.png)

You can see your daily stats.

![image](https://github.com/Stigmatoz/web-activity-time-tracker/assets/23387046/d67c812c-2ba4-4ef8-a685-ab5fd77c7fbe)


And you can see your overall stats.

![image](https://github.com/Stigmatoz/web-activity-time-tracker/assets/23387046/6ea4547e-8bc6-4df7-ba0c-b5b330117270)


## ✨ New Features in This Fork

### Stats on New Tab = No More Excuses
- Your daily usage stats hit you in the face every time you open a new tab
- No need to click anything - perfect people who forgot to check stats after 3 days of installing the extension.

### Ticking Time Bomb on Your Toolbar
- In the extension icon , Watch seconds count down on the extension icon in real-time.
- Your personal productivity watchdog that silently judges your YouTube rabbit holes

### Stealth Mode Activated 🔒
- One-click blank view that hides all your data but keeps controls visible
- Perfect for when your boss walks by or during that all-hands Zoom call
- Because what happens in your browser should stay in your browser

### Brain Dump Station 🧠
- Jot down ideas without leaving your dashboard
- Notes stick around between sessions (local storage magic)
- Because alt-tabbing to another app is too much work



If you have suggestions or problems using the extension, please submit an issue in this repository.

# Installation Instructions

## Option 1: Install from the dist folder (Easiest)

1. Download this repository by clicking the green "Code" button above and selecting "Download ZIP"
2. Unzip the downloaded file to any location on your computer
3. Open Chrome or Edge and go to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click the "Load unpacked" button
6. Browse to the **dist** folder inside the unzipped directory and click "Select Folder"
7. The extension should now appear in your browser and be ready to use!

## Option 2: Build from source

1. Clone this repository
2. Install dependencies: `npm install` or `pnpm install`
3. Build the extension: `npm run start -- --no-watch` or `pnpm run start -- --no-watch`
4. Follow steps 3-6 from Option 1 to load the extension

# Run

```pnpm run dev```

# License

This work is licensed under an MIT License.

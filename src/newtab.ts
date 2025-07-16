import Browser from 'webextension-polyfill';

document.addEventListener('DOMContentLoaded', () => {
  // Create an iframe for the dashboard
  const iframe = document.createElement('iframe');
  const dashboardUrl = Browser.runtime.getURL('src/dashboard.html') + '?tab=dashboard';
  iframe.src = dashboardUrl;
  document.body.appendChild(iframe);
  
  // Focus the URL bar after a short delay
  setTimeout(() => {
    // Create a dummy input to focus and then remove it
    // This is a trick to focus the URL bar
    const dummy = document.createElement('input');
    dummy.style.position = 'absolute';
    dummy.style.opacity = '0';
    dummy.style.height = '0';
    dummy.style.width = '0';
    document.body.appendChild(dummy);
    dummy.focus();
    document.body.removeChild(dummy);
  }, 100);
});

// ATS Resume Optimizer - Background Service Worker

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
    // Can't programmatically open popup, but we can show a notification
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  }
});

// Clear badge when popup is opened
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});

// Listen for tab updates to detect job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isJobSite = 
      tab.url.includes('linkedin.com/jobs') ||
      tab.url.includes('naukri.com') ||
      tab.url.includes('indeed.com');
    
    if (isJobSite) {
      chrome.action.setBadgeText({ tabId, text: 'JD' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#3b82f6' });
    } else {
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});

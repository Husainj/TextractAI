// This file can be used for handling background tasks
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // Add a context menu item to open options
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Gemini Assistant Settings",
    contexts: ["all"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
}); 
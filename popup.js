document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');

  // Load the current state of the extension from storage
  chrome.storage.sync.get('extensionEnabled', (data) => {
    toggleSwitch.checked = data.extensionEnabled !== false; // Default to enabled if not set
  });

  // Listen for changes to the switch
  toggleSwitch.addEventListener('change', () => {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.sync.set({ extensionEnabled: isEnabled }, () => {
      // Send a message to the background script to update its state
      chrome.runtime.sendMessage({ action: 'updateExtensionStatus', enabled: isEnabled });
    });
  });
});

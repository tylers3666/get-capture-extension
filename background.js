let extensionEnabled = true; // Default to enabled

// Load the initial state from storage
chrome.storage.sync.get('extensionEnabled', (data) => {
  if (typeof data.extensionEnabled !== 'undefined') {
    extensionEnabled = data.extensionEnabled;
  }
});

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateExtensionStatus') {
    extensionEnabled = request.enabled;
  }
});

// Listen for web requests before they are sent
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (!extensionEnabled) {
      return; // If extension is disabled, do nothing
    }
    // Check if the request is a GET request and its URL contains "login"
    if (details.method === "GET" && details.url.includes("login")) {
      // Format the captured request details
      const requestDetails = `URL: ${details.url}\nMethod: ${details.method}`;
      
      // Query for the active tab to inject a script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Ensure an active tab is found
        if (tabs[0] && tabs[0].id) {
          // Execute a script in the active tab to display the captured data
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (data) => {
              // Create a textarea element for displaying copyable text
              const textarea = document.createElement('textarea');
              // Apply styling to text area
              textarea.style.position = 'fixed';
              textarea.style.top = '10px';
              textarea.style.left = '50%';
              textarea.style.transform = 'translateX(-50%)';
              textarea.style.width = '350px';
              textarea.style.height = '180px';
              textarea.style.padding = '15px';
              textarea.style.border = '1px solid #ccc';
              textarea.style.borderRadius = '8px';
              textarea.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              textarea.style.backgroundColor = '#f9f9f9';
              textarea.style.fontSize = '14px';
              textarea.style.lineHeight = '1.5';
              textarea.style.zIndex = '10000';
              textarea.value = `Captured GET Request:\n\n${data}`;
              document.body.appendChild(textarea);
              
              // Define URL portion of the textarea
              const urlPrefix = 'URL: ';
              const urlStartIndex = data.indexOf(urlPrefix) + urlPrefix.length;
              const urlEndIndex = data.indexOf('\nMethod:');
              
              // Select the URL portion of the textarea
              if (urlStartIndex !== -1 && urlEndIndex !== -1 && urlEndIndex > urlStartIndex) {
                // Adjust the indexes for the "Captured GET Request:\n\n" part
                const offset = `Captured GET Request:\n\n`.length;
                const selectionStart = offset + urlStartIndex;
                const selectionEnd = offset + urlEndIndex;
                textarea.setSelectionRange(selectionStart, selectionEnd);
              } else {
                // Fallback to selecting the entire textarea if URL cannot be parsed
                textarea.select();
              }

              // Create and style a button to close the textarea
              const closeButton = document.createElement('button');
              closeButton.style.position = 'fixed';
              closeButton.style.top = '205px'; // Position below the textarea
              closeButton.style.left = '50%';
              closeButton.style.transform = 'translateX(-50%)';
              closeButton.style.padding = '8px 15px';
              closeButton.style.border = 'none';
              closeButton.style.borderRadius = '5px';
              closeButton.style.backgroundColor = '#007bff';
              closeButton.style.color = 'white';
              closeButton.style.cursor = 'pointer';
              closeButton.style.zIndex = '10001';
              closeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              closeButton.textContent = 'Close';
              // Add event listener to remove both elements when clicked
              closeButton.onclick = () => {
                document.body.removeChild(textarea);
                document.body.removeChild(closeButton);
              };
              // Add the close button to the page
              document.body.appendChild(closeButton);

              // Focus the textarea so the user can immediately copy the text
              textarea.focus();
            },
            args: [requestDetails]
          });
          // Log that the request was captured and displayed
          console.log("GET request captured and displayed in-browser: ", details.url);
        }
      });
    }
  },
  // Filter for all URLs
  { urls: ["<all_urls>"] }
);

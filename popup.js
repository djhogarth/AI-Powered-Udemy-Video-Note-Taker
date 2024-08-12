// popup.js
document.getElementById('submitButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { greeting: document.getElementById('prompt').value }, (response) => {
        console.log(response.farewell);
      });
    });
  });

  //when receiving a message asking for the key
//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.greeting !== null) {
//         //respond with the key
//         sendResponse({ greeting: document.getElementById('key').value });
        
//     }
//   });
  
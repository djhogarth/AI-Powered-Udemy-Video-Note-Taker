// import * as dotenv from 'dotenv';
// dotenv.config();

// content.js
let Prompt = "";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting !== null) {
    Prompt = request.greeting;
    getNotes();
    sendResponse({ farewell: 'goodbye from content script' });
  }
});

// Function to call OpenAI API and get the summarized notes
async function callOpenAI(transcriptionText, prompt) {
  apiKey = process.env.API_KEY;

  const endpoint = 'https://api.openai.com/v1/chat/completions'

console.log("calling OpenAI API");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt}, { role: "user", content: transcriptionText}],
      max_tokens: 1500, // Adjust max_tokens based on your needs and OpenAI's limitations
      temperature: 0.7, // Adjust temperature based on your needs
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

/** Helper function that clicks the transcript button on the video to get the 
    transription of the video to show
    *@return {void}
    */
function clickTranscriptionButton() {
  var transcriptionButton = document.querySelector(
    'button[data-purpose="transcript-toggle"]'
  );

  console.log("button clicked");
  transcriptionButton.click();
}

/**  Grab all the text in the transcription of the video and store it in a string
 *@return {string}
 */
function getTranscript() {
  //variable to store the transcription text for the video
  console.log("Tried to get transcript");
  var transcriptionText = "";
  clickTranscriptionButton();

  /* Extract all lines of text in the transcription by getting all elements 
    in the page with data-purpose equals cue-text and put them into an array */
  var transcriptionLines = Array.from(
    document.querySelectorAll('span[data-purpose="cue-text"]')
  );

  /* Compile all the lines of text in the transcription by looping through 
    all the span elemenets contained in the transcriptionLines variable and 
    appending them to the transcriptionText string */
  transcriptionLines.forEach((elem) => {
    transcriptionText += elem.textContent + " ";
  });
  console.log("Transcript: " + transcriptionText);
  return transcriptionText;
}

// Function to get notes by sending the transcription text to OpenAI and receiving the response
async function getNotes() {
  const transcriptionText = getTranscript();
  if (!transcriptionText) {
    console.error('No transcription text available.');
    return;
  }

  const promptInput = Prompt.trim();
  const basePrompt = "Please provide a detailed summary of the following video transcript. Neatly arrange the content into different sections or topics of the course with proper formatting. If applicable, focus on the following specific topic: ";
  const promptText = basePrompt + promptInput;
  
  const notes = await callOpenAI(transcriptionText, promptText);

  // Save the notes to a text file
  createTXT(notes);
}

// Function to create and download a text file with the notes
function createTXT(notes) {
  const element = document.createElement("a");
  const file = new Blob([notes], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = "notes.txt";
  document.body.appendChild(element);
  element.click();
 
}


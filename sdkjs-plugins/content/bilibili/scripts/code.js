//  (c) Copyright Ascensio System SIA 2020

//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

(function (window, undefined) {
  window.Asc.plugin.init = function () {};

  const searchInput = document.querySelector('.search-container input');
const resultsContainer = document.querySelector('.results-container ul');
const iframePlayer = document.querySelector('.player-container iframe');

// Function to render video list
function renderVideos(videosToRender) {
  resultsContainer.innerHTML = ''; // Clear the previous results
  videosToRender.forEach(video => {
      const videoElement = document.createElement('li');
      videoElement.textContent = video.title; // Display the title
      videoElement.addEventListener('click', () => {
          updatePlayer(video.aid); // Pass the 'aid' to updatePlayer when clicked
      });
      resultsContainer.appendChild(videoElement);
  });
}

function updatePlayer(videoId) {
  const videoUrl = `https://player.bilibili.com/player.html?aid=${videoId}`;
  iframePlayer.src = videoUrl; // Set iframe source to the selected video
}

  window.Asc.plugin.onTranslate = function () {

    // userInputLabel.innerText = window.Asc.plugin.tr("Enter the ComboBox name:");
    // fileInputText.innerText = window.Asc.plugin.tr(
    //   "Select or drop a file here"
    // );
    // addDataBtnText.innerText = window.Asc.plugin.tr("Add data from file");

    // comboBoxName.placeholder = window.Asc.plugin.tr(
    //   "Enter the name(default key) of the ComboBox"
    // );

  };


//display various modalBox if required. Will not be required a lot in this plugin. BUt just in case.

//   const displayModalBox = function (errorCase) {
//     let location = window.location;
//     let start = location.pathname.lastIndexOf("/") + 1;
//     let file = location.pathname.substring(start);
//     let variation;

//     switch (errorCase) {
//       case noMatch:
//         variation = {
//           url: location.href.replace(file, "noMatch.html"),
//           description: generateText("Error"),
//           isVisual: true,
//           isModal: true,
//           buttons: [],
//           EditorsSupport: ["word"],
//           size: [392, 250],
//         };
//         break;
//       case noElement:
//         variation = {
//           url: location.href.replace(file, "noFormElement.html"),
//           description: generateText("Error"),
//           isVisual: true,
//           isModal: true,
//           buttons: [],
//           EditorsSupport: ["word"],
//           size: [392, 250],
//         };
//         break;
//       case textSelected:
//         variation = {
//           url: location.href.replace(file, "textSelected.html"),
//           description: generateText("Error"),
//           isVisual: true,
//           isModal: true,
//           buttons: [],
//           EditorsSupport: ["word"],
//           size: [392, 250],
//         };
//         break;

//       default:
//         console.log(
//           "invalid Case. Crash Prevented. Try again with valid inputs."
//         );
//         return;
//     }

//     //create and display modalWindow
//     modalWindow = new window.Asc.PluginWindow();
//     modalWindow.show(variation);
//   };

  // Handle button click events to close the modal window and plugin side panel
  window.Asc.plugin.button = function (id, windowId) {
    switch (true) {
      case windowId !== undefined:
        // Close window if windowId is provided
        switch (id) {
          case -1:
          default:
            window.Asc.plugin.executeMethod("CloseWindow", [windowId]);
            break;
        }
        break;

      default:
        // Close window directly if windowId is not provided
        if (id === -1 && !windowId) {
          this.executeCommand("close", "");
        }
        break;
    }
  };
})(window, undefined);

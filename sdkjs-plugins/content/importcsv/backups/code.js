/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function (window, undefined) {
    document.addEventListener("DOMContentLoaded", function () {
      window.Asc.plugin.init = function () {
  
        //translation generate function
        function generateText(text) {
          let result = window.Asc.plugin.tr(text);
          return result;
        }
  
        let modalWindow;
        const noMatch = 'noMatch';
  
  
        const noElement = 'noElement';
        //all translations for the index.html statically loaded text
        const userInputLabel = document.getElementById("userInputLabel");
        // userInput.innerText
        // userInputLabel.innerHTML = window.Asc.plugin.tr("aasd");
        const fileInputText = document.getElementById("fileInputText");
        // fileInputText.innerHTML = window.Asc.plugin.tr("Select or drop a file here");
        const addDataBtnText = document.getElementById("addDataBtn");
        // addDataBtnText.innerHTML = window.Asc.plugin.tr("Add data from file");
  
        window.Asc.plugin.onTranslate = function () {
          userInputLabel.innerText = window.Asc.plugin.tr(
            "Enter the ComboBox name:"
          );
          fileInputText.innerText = window.Asc.plugin.tr(
            "Select or drop a file here"
          );
          addDataBtnText.innerText = window.Asc.plugin.tr("Add data from file");
        };
  
  
        const displayModalBox = function (errorCase) {
          let location = window.location;
          let start = location.pathname.lastIndexOf("/") + 1;
          let file = location.pathname.substring(start);
          let variation;
  
          switch (errorCase) {
            case noMatch:
              variation = {
                url: location.href.replace(file, "noMatch.html"),
                description: generateText("Error"),
                isVisual: true,
                isModal: true,
                buttons: [],
                EditorsSupport: ["word"],
                size: [392, 250],
              };
              break;
            case noElement:
              variation = {
                url: location.href.replace(file, "noFormElement.html"),
                description: generateText("Error"),
                isVisual: true,
                isModal: true,
                buttons: [],
                EditorsSupport: ["word"],
                size: [392, 250],
              };
              break;
  
            default:
              console.log("invalid Case. Crash Prevented. Try again with valid inputs.")
              return;
          }
  
          //create and display modalWindow
          modalWindow = new window.Asc.PluginWindow();
          modalWindow.show(variation);
  
        };
  
  
  
        // Handle button click events to close the modal window
        window.Asc.plugin.button = function (id, windowId) {
  
          console.log("IDs");
          console.log(id);
          console.log(windowId);
          if (!modalWindow) {
            return;
          }
  
          if (windowId) {
            switch (id) {
              case -1:
                window.Asc.plugin.executeMethod('CloseWindow', [windowId]);
                initializePlugin();
                break;
              default:
                modalWindow.close();
                initializePlugin();
                break;
            }
          }
        };
  
        const comboBoxName = document.getElementById("userInput");
        // var fileContent;
        var dataArray;
        Asc.scope.boxName = comboBoxName.value; //export var to plugin
        const userFileInput = document.getElementById("fileInput");
  
        userFileInput.addEventListener("change", function (event) {
          var selectedFile = event.target.files[0];
          if (selectedFile) {
            processFile(selectedFile);
          }
        });
  
        function processFile(file) {
          var reader = new FileReader();
  
          // Event listener for when the file reading is complete
          reader.onload = function (event) {
            var csvContent = event.target.result;
  
            // Parse CSV content into an array
            dataArray = parseCSV(csvContent);
          };
  
          // Read the file as text
          reader.readAsText(file);
        }
  
        function parseCSV(csvContent) {
          // Split CSV content into lines
          var lines = csvContent.split("\n");
          var dataArray = [];
  
          // Process each line
          for (var i = 0; i < lines.length; i++) {
            // Skip empty lines
            if (lines[i].trim() === "") continue;
  
            // Split the line into values
            var values = lines[i].split(",");
  
            dataArray = dataArray.concat(values);
          }
  
          return dataArray;
        }
  
  
  
        document.getElementById("addDataBtn").onclick = function () {
          Asc.scope.comboBoxName = comboBoxName.value;
          Asc.scope.parsedCsvData = dataArray;
          // console.log(Asc.scope.parsedCsvData);
  
          if (!Asc.scope.comboBoxName) {
            console.log("Name not entered");
            return;
          }
  
  
          if (!Asc.scope.parsedCsvData) {
            console.log("no file selected");
            return;
          }
  
          window.Asc.plugin.callCommand(
            function () {
              const oDocument = Api.GetDocument();
              const wordToSearch = Asc.scope.comboBoxName;
              const aForms = oDocument.GetAllForms();
              const comboBoxForms = aForms.filter(
                (form) => form.GetFormType() === "comboBoxForm"
              );
              let formFound = true;
              console.log(comboBoxForms.length);
              if (comboBoxForms.length > 0) {
                for (let i = 0; i < comboBoxForms.length; i++) {
                  if (comboBoxForms[i].GetText() === wordToSearch) {
                    // console.log("here");
                    comboBoxForms[i].SetListValues(Asc.scope.parsedCsvData);
                  } else {
                    console.log("No combobox form matches the name entered.")
                    formFound = false;
                  }
                }
              } else {
                formFound = -1;
              }
              return formFound;
            },
            false,
            true,
            function (result) {
              console.log(result);
              if (result === false) {
                displayModalBox(noMatch);
                console.log("here");
              } else if (result === -1) {
                displayModalBox(noElement);
              }
            }
          );
        };
      };
  
      window.Asc.plugin.button = function () {
        this.executeCommand("close", "");
      };
    });
  })(window, undefined);
  
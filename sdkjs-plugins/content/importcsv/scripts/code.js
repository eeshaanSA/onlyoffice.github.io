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
  window.Asc.plugin.init = function () { };
  //translation generate function

  let modalWindow;

  const noMatch = "noMatch";

  const noElement = "noElement";

  const textSelected = "textSelected";

  let isSelected;

  const userInputLabel = document.getElementById("userInputLabel");

  const fileInputText = document.getElementById("fileInputText");

  const fileInput = document.getElementById("fileInput");

  const addDataBtnText = document.getElementById("addDataBtn");

  const comboBoxName = document.getElementById("userInput");

  const userFileInput = document.getElementById("fileInput");

  let dataArray; 

  function generateText(text) {
    let result = window.Asc.plugin.tr(text);
    return result;
  }

  //input validation and event listeners
  comboBoxName.addEventListener("input", validateInputs);
  fileInput.addEventListener("change", validateInputs);
  function validateInputs() {
    if (comboBoxName.value.trim() !== "" && fileInput.files.length > 0) {
      //Enable the button for click
      addDataBtnText.removeAttribute("disabled");
    } else {
      addDataBtnText.setAttribute("disabled", "disabled");
    }
  }

  window.Asc.plugin.onTranslate = function () {
    userInputLabel.innerText = window.Asc.plugin.tr(
      "Enter the ComboBox name:"
    );
    fileInputText.innerText = window.Asc.plugin.tr(
      "No file chosen"
    );
    addDataBtnText.innerText = window.Asc.plugin.tr("Add data from file");

    comboBoxName.placeholder = window.Asc.plugin.tr(
      "Enter the name(default key) of the ComboBox"
    );
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
      case textSelected:
        variation = {
          url: location.href.replace(file, "textSelected.html"),
          description: generateText("Error"),
          isVisual: true,
          isModal: true,
          buttons: [],
          EditorsSupport: ["word"],
          size: [392, 250],
        };
        break;

      default:
        console.log(
          "invalid Case. Crash Prevented. Try again with valid inputs."
        );
        return;
    }

    //create and display modalWindow
    modalWindow = new window.Asc.PluginWindow();
    modalWindow.show(variation);
  };

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

  userFileInput.addEventListener("change", function (event) {
    let selectedFile = event.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  });

  const fileInputContainer = document.getElementById('fileInputContainer');
  console.log(fileInputContainer);

    fileInputContainer.addEventListener('dragover', function (e) {
      e.preventDefault();
      this.classList.add('dragover');
    });

    fileInputContainer.addEventListener('dragleave', function () {
      this.classList.remove('dragover');
    });

    fileInputContainer.addEventListener('drop', function (e) {
      e.preventDefault();
      console.log("here in drop")
      this.classList.remove('dragover');
      const fileName = e.dataTransfer.files[0].name;
      updateButtonText(fileName);
    });

    fileInput.addEventListener('change', function () {
      const fileName = this.value.split('\\').pop();
      updateButtonText(fileName);
    });

    function updateButtonText(fileName) {
      if(fileName){

        document.querySelector('.custom-button').innerText = fileName;
      }else{
        document.querySelector('.custom-button').innerText = generateText("No file chosen");

      }

    }

  function processFile(file) {
    let reader = new FileReader();

    // Event listener for when the file reading is complete
    reader.onload = function (event) {
      let csvContent = event.target.result;

      // Parse CSV content into an array
      dataArray = parseCSV(csvContent);
    };

    // Read the file as text
    reader.readAsText(file);
  }

  function parseCSV(csvContent) {
    // Split CSV content into lines
    let lines = csvContent.split("\n");
    let dataArray = [];

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      // Skip empty lines
      if (lines[i].trim() === "") continue;

      // Split the line into values
      let values = lines[i].split(",");

      dataArray = dataArray.concat(values);
    }

    return dataArray;
  }

  document.getElementById("addDataBtn").onclick = function () {
    Asc.scope.comboBoxName = comboBoxName.value;
    Asc.scope.parsedCsvData = dataArray;
    Asc.scope.selectedFlag = isSelected;
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
        let formFound = false;
        if (comboBoxForms.length > 0) {
          for (let i = 0; i < comboBoxForms.length; i++) {
            if (comboBoxForms[i].GetText() === wordToSearch) {
              formFound = true;
              comboBoxForms[i].SetListValues(Asc.scope.parsedCsvData);
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
        if (result === false) {
          displayModalBox(noMatch);
        } else if (result === -1) {
          displayModalBox(noElement);
        } else if (result) {
          console.log("comboBox updated successfully.");
        }
      }
    );
  }

    // window.Asc.plugin.executeMethod("GetSelectionType", [], function (sType) {  //this method doesn't work as expected. Returns none even when text/form is selected in the document.
    //   console.log(sType);
    //   if (sType === "text") {
    //     isSelected = true;
    //   } else {
    //     isSelected = false;
    //   }

    //   if (!isSelected) {
    //     console.log(isSelected);
    //     console.log("entered not selected");
    //     window.Asc.plugin.callCommand(
    //       function () {
    //         const oDocument = Api.GetDocument();
    //         const wordToSearch = Asc.scope.comboBoxName;
    //         const aForms = oDocument.GetAllForms();
    //         const comboBoxForms = aForms.filter(
    //           (form) => form.GetFormType() === "comboBoxForm"
    //         );
    //         let formFound = false;
    //         if (comboBoxForms.length > 0) {
    //           for (let i = 0; i < comboBoxForms.length; i++) {
    //             if (comboBoxForms[i].GetText() === wordToSearch) {
    //               formFound = true;
    //               comboBoxForms[i].SetListValues(Asc.scope.parsedCsvData);
    //             }
    //           }
    //         } else {
    //           formFound = -1;
    //         }
    //         return formFound;
    //       },
    //       false,
    //       true,
    //       function (result) {
    //         if (result === false) {
    //           displayModalBox(noMatch);
    //         } else if (result === -1) {
    //           displayModalBox(noElement);
    //         } else if (result) {
    //           console.log("comboBox updated successfully.");
    //         }
    //       }
    //     );
    //   }

    //   if (isSelected) {
    //     console.log("form/text selected. Operation aborted.");
    //     displayModalBox(textSelected);
    //     return;
    //   }
    // });
  //};
})(window, undefined);

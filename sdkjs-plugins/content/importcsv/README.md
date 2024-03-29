## Overview

This plugin processes data from a CSV file and populates ComboBoxes in PDF Forms.

It is called "Import data to ComboBox" in the interface and isn't installed by default in cloud, [self-hosted](https://github.com/ONLYOFFICE/DocumentServer) and [desktop version](https://github.com/ONLYOFFICE/DesktopEditors) of ONLYOFFICE editors. 

## How to use

1. Open the Plugins tab and click on "Import data to ComboBox".
2. In the first text box (Enter the name of the ComboBox), enter the default value of the ComboBox you want to update.
3. Next, select the CSV File you want to use by clicking on the 'Chose a file' button below.
4. Once the desired file is selected, click the 'Add data from file' button.
5. If the name was correctly entered in step one, your ComboBox should now display the content from your CSV file under the value options tab.

## Known Issues
1. Currently, if the plugin is run whilst a ComboBox is in active selection, the desired ComboBox is not populated with the data. A fix for this issue will be included in the upcoming update. Meanwhile, ensure that there are no active selections before clicking the 'Add data from file' button.

If you need more information about how to use or write your own plugin, please see this [resource](https://api.onlyoffice.com/plugin/basic).
# Google Forms Autofill

A lightweight, efficient Chrome Extension (Manifest V3) designed to seamlessly identify and fill out Google Forms with pre-saved data. It supports various input fields and includes fuzzy matching capabilities to match your stored answers accurately to the form questions.

## Features

- **Automated Filling**: Instantly fills out forms using pre-stored JSON data mapping questions to your answers.
- **Support for Multi-Input Formats**:
  - Text inputs (Short Answer, Number, Email, URL)
  - Textareas (Paragraph)
  - Radio Buttons
  - Checkboxes (Supports multiple values via arrays)
  - Dropdown Menus
- **Fuzzy Matching**: Matches question titles and choice options dynamically using fuzzy string search, meaning exact case sensitivity and formatting are not strictly required.
- **Multiple Triggers**:
  - **Auto-run**: Executes immediately 1 second after the form renders.
  - **Floating Action Button**: Provides an unobtrusive "⚡ Autofill" button dynamically directly on the Google Form itself.
  - **Popup Menu**: Manage your data and trigger the autofill manually from the extension's popup window.
- **Local Storage**: Securely saves data using Chrome's native `chrome.storage.local`.

## Installation

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `google-forms-autofill` directory where you extracted the project.

## How to Use

1. Click on the extension icon in your Chrome toolbar to open the popup.
2. Enter your custom mappings in JSON format and click **Save**. Ensure the format matches:

   ```json
   {
     "Name": "Sumit Das",
     "Email": "sumitdas@example.com",
     "Gender": "Male",
     "Skills": ["Java", "Python"]
   }
   ```

3. Navigate to any Google Form (`docs.google.com/forms`).
4. The extension will attempt to autofill automatically! You can also click the floating **⚡ Autofill** button on the bottom of the page or trigger it via the popup menu to re-run the process.

## Permissions Required

- `storage`: Required to save your inputted JSON rules securely in the browser.
- `activeTab`: Allows the extension to interact with the currently active page.
- `scripting`: Required to inject autofill logic directly into the Google Forms website (`docs.google.com`).

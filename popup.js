document.addEventListener('DOMContentLoaded', () => {
  const jsonDataInput = document.getElementById('jsonData');
  const saveBtn = document.getElementById('saveBtn');
  const autofillBtn = document.getElementById('autofillBtn');
  const statusDiv = document.getElementById('status');

  // Load saved data
  chrome.storage.local.get(['formData'], (result) => {
    if (result.formData) {
      jsonDataInput.value = JSON.stringify(result.formData, null, 2);
    } else {
      jsonDataInput.value = '{\n  "Name": "John Doe",\n  "Email": "john@example.com"\n}';
    }
  });

  // Save data
  saveBtn.addEventListener('click', () => {
    try {
      const data = JSON.parse(jsonDataInput.value);
      chrome.storage.local.set({ formData: data }, () => {
        showStatus('Data saved successfully!', 'success');
      });
    } catch (e) {
      showStatus('Invalid JSON format', 'error');
    }
  });

  // Trigger autofill on the active tab
  autofillBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('docs.google.com/forms')) {
      chrome.tabs.sendMessage(tab.id, { action: 'triggerAutofill' }, (response) => {
        if (chrome.runtime.lastError) {
           showStatus('Form page not fully loaded', 'error');
        } else {
           showStatus('Autofill triggered!', 'success');
        }
      });
    } else {
      showStatus('Not a Google Form page', 'error');
    }
  });

  function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = `status ${type}`;
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 3000);
  }
});

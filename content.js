// --- Utility Features ---

/**
 * Normalizes strings and compares them for fuzzy matching.
 */
function fuzzyMatch(str1, str2) {
  if (typeof str1 !== 'string' || typeof str2 !== 'string') return false;
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!s1 || !s2) return false;
  // Use includes for partial matching
  return s1 === s2 || s1.includes(s2) || s2.includes(s1);
}

/**
 * Triggers necessary events to make react/wiz forms register the value change
 */
function fillNativeInput(element, value) {
  element.focus();
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.blur();
}

/**
 * Delays execution to allow DOM updates
 */
const delay = ms => new Promise(res => setTimeout(res, ms));


// --- Autofill Logic ---

async function autofill(data) {
  // Find all question title elements. Usually div[role="heading"]
  const headings = Array.from(document.querySelectorAll('div[role="heading"]'));
  
  for (let div of headings) {
    const titleText = div.innerText.replace(/\*$/, '').trim();
    // Check if any key in our data matches the question title
    const key = Object.keys(data).find(k => fuzzyMatch(k, titleText));
    
    if (key) {
      // Find the closest container for the entire question.
      let container = div.closest('div[role="listitem"]') || div.closest('.geS5n') || div.parentElement.parentElement.parentElement;
      if (container) {
        await fillQuestion(container, data[key]);
      }
    }
  }
}

async function fillQuestion(container, value) {
  // 1. Text Inputs (Short answer)
  const textInput = container.querySelector('input[type="text"], input[type="email"], input[type="url"], input[type="number"]');
  if (textInput) {
    fillNativeInput(textInput, value);
    return;
  }

  // 2. Textarea (Paragraph)
  const textarea = container.querySelector('textarea');
  if (textarea) {
    fillNativeInput(textarea, value);
    return;
  }

  // 3. Radio buttons
  const radios = Array.from(container.querySelectorAll('div[role="radio"]'));
  if (radios.length > 0) {
    const target = radios.find(r => fuzzyMatch(r.getAttribute('data-value') || '', value) || fuzzyMatch(r.innerText || '', value));
    if (target && target.getAttribute('aria-checked') !== 'true') {
      target.click();
    }
    return;
  }

  // 4. Checkboxes
  const checkboxes = Array.from(container.querySelectorAll('div[role="checkbox"]'));
  if (checkboxes.length > 0) {
    const values = Array.isArray(value) ? value : [value];
    checkboxes.forEach(cb => {
      const match = values.some(v => fuzzyMatch(cb.getAttribute('data-value') || '', v) || fuzzyMatch(cb.innerText || '', v));
      const isChecked = cb.getAttribute('aria-checked') === 'true';
      if ((match && !isChecked) || (!match && isChecked)) {
        cb.click();
      }
    });
    return;
  }

  // 5. Dropdown
  const listbox = container.querySelector('div[role="listbox"]');
  if (listbox) {
    // Check if it already has the desired value
    const currentSelection = listbox.querySelector('div.vRMGwf') || listbox;
    if (currentSelection && fuzzyMatch(currentSelection.innerText || '', value)) {
      return; // Already selected
    }

    listbox.click();
    await delay(300); // give time for the options menu to render in the DOM
    
    // Google forms attaches the options to the body.
    const options = Array.from(document.querySelectorAll('div[role="option"]'));
    const target = options.find(opt => {
      // Ignore hidden or removed elements
      if (!opt.isConnected || opt.offsetParent === null) return false;
      const text = opt.getAttribute('data-value') || opt.innerText || '';
      return fuzzyMatch(text, value);
    });

    if (target) {
      target.click();
      await delay(100);
    } else {
      // Dismiss the dropdown if no match found
      document.body.click();
      await delay(100);
    }
    return;
  }
}


// --- Floating Button & Page Observers ---

function injectFloatingButton() {
  if (document.getElementById('gfa-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'gfa-btn';
  btn.className = 'gfa-floating-btn';
  btn.innerText = '⚡ Autofill';
  btn.title = 'Click to autofill with saved data';
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.local.get(['formData'], (result) => {
      if (result.formData) {
        autofill(result.formData);
      } else {
        alert('No save data found. Please open the extension popup to add data.');
      }
    });
  });
  
  document.body.appendChild(btn);
}

// Initialization and monitoring structure
function init() {
  // Inject the floating button if there are fields available
  injectFloatingButton();
  
  chrome.storage.local.get(['formData'], (result) => {
    if (result.formData) {
      // Auto-trigger autofill after a short delay to ensure form is rendered
      setTimeout(() => autofill(result.formData), 1000);
    }
  });

  // Observe body changes for dynamically loaded sections or multi-page forms
  const observer = new MutationObserver(() => {
    const hasHeadings = document.querySelector('div[role="heading"]');
    if (hasHeadings) {
      injectFloatingButton();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for popup trigger
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerAutofill') {
    chrome.storage.local.get(['formData'], (result) => {
      if (result.formData) {
        autofill(result.formData);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // Keep message channel open for async response
  }
});

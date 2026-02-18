// Browser API compatibility layer
// Ensures chrome.* API works in both Chrome and Firefox

if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  // Firefox: map chrome to browser
  window.chrome = browser;
} else if (typeof chrome !== 'undefined' && typeof browser === 'undefined') {
  // Chrome: map browser to chrome for consistency
  window.browser = chrome;
}

// Ensure chrome namespace exists
if (typeof chrome === 'undefined') {
  console.error('Neither chrome nor browser API is available!');
}

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.sync.get(['apiKey', 'locations', 'travelMode']);
  
  if (result.apiKey) {
    document.getElementById('apiKey').value = result.apiKey;
  }
  
  if (result.travelMode) {
    document.getElementById('travelMode').value = result.travelMode;
  }
  
  if (result.locations && result.locations.length > 0) {
    result.locations.forEach(location => addLocationInput(location));
  } else {
    addLocationInput('');
  }
});

// Add location input field
function addLocationInput(value = '') {
  const locationsList = document.getElementById('locationsList');
  const locationDiv = document.createElement('div');
  locationDiv.className = 'location-item';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'location-input';
  input.placeholder = 'e.g., Via Roma 1, Milano';
  input.value = value;
  
  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'btn-remove';
  removeBtn.onclick = () => {
    locationsList.removeChild(locationDiv);
  };
  
  locationDiv.appendChild(input);
  locationDiv.appendChild(removeBtn);
  locationsList.appendChild(locationDiv);
}

// Add location button
document.getElementById('addLocation').addEventListener('click', () => {
  addLocationInput('');
});

// Save button
document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const travelMode = document.getElementById('travelMode').value;
  const locationInputs = document.querySelectorAll('.location-input');
  const locations = Array.from(locationInputs)
    .map(input => input.value.trim())
    .filter(value => value !== '');
  
  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }
  
  if (locations.length === 0) {
    showStatus('Please add at least one location', 'error');
    return;
  }
  
  await chrome.storage.sync.set({ apiKey, locations, travelMode });
  showStatus('Settings saved successfully!', 'success');
  
  // Notify content script to refresh
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes('idealista.it')) {
    chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' });
  }
});

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

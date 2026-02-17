// Load settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.sync.get(['apiKey', 'locations']);
  
  if (result.apiKey) {
    document.getElementById('apiKey').value = result.apiKey;
  }
  
  if (result.locations && result.locations.length > 0) {
    result.locations.forEach(location => addLocationInput(location));
  } else {
    addLocationInput({ address: '', travelMode: 'driving' });
  }
});

// Add location input field
function addLocationInput(location = { address: '', travelMode: 'driving' }) {
  const locationsList = document.getElementById('locationsList');
  const locationDiv = document.createElement('div');
  locationDiv.className = 'location-item';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'location-input';
  input.placeholder = 'e.g., Via Roma 1, Milano';
  input.value = typeof location === 'string' ? location : location.address;
  
  const select = document.createElement('select');
  select.className = 'travel-mode-select';
  const modes = [
    { value: 'driving', icon: '🚗', label: 'Driving' },
    { value: 'transit', icon: '🚌', label: 'Transit' },
    { value: 'walking', icon: '🚶', label: 'Walking' },
    { value: 'bicycling', icon: '🚴', label: 'Bicycling' }
  ];
  
  modes.forEach(mode => {
    const option = document.createElement('option');
    option.value = mode.value;
    option.textContent = `${mode.icon} ${mode.label}`;
    select.appendChild(option);
  });
  
  select.value = typeof location === 'string' ? 'driving' : location.travelMode;
  
  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'btn-remove';
  removeBtn.onclick = () => {
    locationsList.removeChild(locationDiv);
  };
  
  locationDiv.appendChild(input);
  locationDiv.appendChild(select);
  locationDiv.appendChild(removeBtn);
  locationsList.appendChild(locationDiv);
}

// Add location button
document.getElementById('addLocation').addEventListener('click', () => {
  addLocationInput({ address: '', travelMode: 'driving' });
});

// Save button
document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const locationItems = document.querySelectorAll('.location-item');
  const locations = Array.from(locationItems)
    .map(item => {
      const address = item.querySelector('.location-input').value.trim();
      const travelMode = item.querySelector('.travel-mode-select').value;
      return { address, travelMode };
    })
    .filter(loc => loc.address !== '');
  
  if (locations.length === 0) {
    showStatus('Please add at least one location', 'error');
    return;
  }
  
  await chrome.storage.sync.set({ apiKey, locations });
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

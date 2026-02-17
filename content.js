// Content script for idealista.it
let settings = null;
let observer = null;

// Initialize
async function init() {
  settings = await chrome.storage.sync.get(['apiKey', 'locations', 'travelMode']);
  
  if (!settings.apiKey || !settings.locations || settings.locations.length === 0) {
    console.log('Idealista Distance: Please configure the extension first');
    return;
  }
  
  // Wait for the main listing items to appear
  waitForElement('main.listing-items', () => {
    processListings();
    observeListingChanges();
  });
}

// Wait for an element to appear
function waitForElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback();
    return;
  }
  
  const observer = new MutationObserver(() => {
    const element = document.querySelector(selector);
    if (element) {
      observer.disconnect();
      callback();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Observe changes to listing items (for infinite scroll, etc.)
function observeListingChanges() {
  const listingContainer = document.querySelector('main.listing-items');
  if (!listingContainer) return;
  
  observer = new MutationObserver((mutations) => {
    processListings();
  });
  
  observer.observe(listingContainer, {
    childList: true,
    subtree: true
  });
}

// Process all listing items
async function processListings() {
  const articles = document.querySelectorAll('article.item');
  
  for (const article of articles) {
    // Skip if already processed
    if (article.dataset.distanceProcessed) continue;
    
    const link = article.querySelector('a.item-link');
    const priceRow = article.querySelector('div.price-row');
    
    if (!link || !priceRow) continue;
    
    // Get address from link text or title
    const address = link.textContent.trim() || link.getAttribute('title') || '';
    
    if (!address) continue;
    
    // Mark as processed
    article.dataset.distanceProcessed = 'true';
    
    // Create and insert distance info element
    const distanceEl = document.createElement('div');
    distanceEl.className = 'idealista-distance-info';
    distanceEl.innerHTML = '<span class="loading">Calculating distance...</span>';
    priceRow.parentNode.insertBefore(distanceEl, priceRow);
    
    // Calculate distances
    calculateDistances(address, distanceEl);
  }
}

// Calculate distances from all configured locations
async function calculateDistances(destination, displayElement) {
  if (!settings.apiKey || !settings.locations || settings.locations.length === 0) {
    displayElement.innerHTML = '<span class="error">Extension not configured</span>';
    return;
  }
  
  const travelMode = settings.travelMode || 'driving';
  
  try {
    const results = [];
    
    for (const origin of settings.locations) {
      const distance = await getDistanceFromGoogleMaps(origin, destination, travelMode);
      if (distance) {
        results.push({
          origin: origin,
          duration: distance.duration,
          distance: distance.distance
        });
      }
    }
    
    if (results.length > 0) {
      displayDistanceResults(results, displayElement);
    } else {
      displayElement.innerHTML = '<span class="error">Unable to calculate distance</span>';
    }
  } catch (error) {
    console.error('Distance calculation error:', error);
    displayElement.innerHTML = '<span class="error">Error calculating distance</span>';
  }
}

// Get distance from Google Maps Distance Matrix API via background script
async function getDistanceFromGoogleMaps(origin, destination, travelMode) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'calculateDistance',
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      apiKey: settings.apiKey
    }, (response) => {
      if (response && response.success) {
        resolve(response.data);
      } else {
        console.error('Distance calculation failed:', response?.error);
        resolve(null);
      }
    });
  });
}

// Display distance results
function displayDistanceResults(results, displayElement) {
  let html = '<div class="distance-results">';
  
  results.forEach((result, index) => {
    const locationName = result.origin.split(',')[0]; // Use first part of address
    html += `
      <div class="distance-item">
        <span class="location-label">${locationName}:</span>
        <span class="duration">${result.duration}</span>
        <span class="distance">(${result.distance})</span>
      </div>
    `;
  });
  
  html += '</div>';
  displayElement.innerHTML = html;
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    // Reload settings and reprocess
    settings = null;
    // Reset all processed flags
    document.querySelectorAll('article.item[data-distance-processed]').forEach(article => {
      article.removeAttribute('data-distance-processed');
      const distanceInfo = article.querySelector('.idealista-distance-info');
      if (distanceInfo) {
        distanceInfo.remove();
      }
    });
    init();
  }
});

// Inject styles
const style = document.createElement('style');
style.textContent = `
  .idealista-distance-info {
    margin: 8px 0;
    padding: 8px;
    background: #f0f8ff;
    border-radius: 4px;
    font-size: 13px;
  }
  
  .idealista-distance-info .loading {
    color: #666;
    font-style: italic;
  }
  
  .idealista-distance-info .error {
    color: #d32f2f;
  }
  
  .distance-results {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .distance-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .location-label {
    font-weight: 600;
    color: #1976d2;
  }
  
  .duration {
    font-weight: 500;
    color: #333;
  }
  
  .distance {
    color: #666;
    font-size: 11px;
  }
`;
document.head.appendChild(style);

// Start
init();

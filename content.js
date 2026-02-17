// Content script for idealista.it
let settings = null;
let observer = null;

// Initialize
async function init() {
  console.log('[Idealista Distance] Initializing extension...');
  settings = await chrome.storage.sync.get(['apiKey', 'locations']);
  
  console.log('[Idealista Distance] Settings loaded:', {
    hasApiKey: !!settings.apiKey,
    apiKeyLength: settings.apiKey?.length,
    locationsCount: settings.locations?.length || 0,
    locations: settings.locations
  });
  
  if (!settings.locations || settings.locations.length === 0) {
    console.log('[Idealista Distance] Please configure locations first');
    return;
  }
  
  // Migrate old format if needed
  if (typeof settings.locations[0] === 'string') {
    console.log('[Idealista Distance] Migrating old location format...');
    const travelMode = (await chrome.storage.sync.get(['travelMode'])).travelMode || 'driving';
    settings.locations = settings.locations.map(addr => ({ address: addr, travelMode }));
    console.log('[Idealista Distance] Migration complete:', settings.locations);
  }
  
  console.log('[Idealista Distance] Waiting for listing items...');
  
  // Wait for the main listing items to appear
  waitForElement('main.listing-items', () => {
    console.log('[Idealista Distance] Found listing container, starting to process listings');
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
  console.log(`[Idealista Distance] Found ${articles.length} article items`);
  
  for (const article of articles) {
    // Skip if already processed
    if (article.dataset.distanceProcessed) continue;
    
    const link = article.querySelector('a.item-link');
    const priceRow = article.querySelector('div.price-row');
    
    if (!link || !priceRow) continue;
    
    // Get address from link text or title
    const address = link.textContent.trim() || link.getAttribute('title') || '';
    
    if (!address) continue;
    
    console.log(`[Idealista Distance] Found listing address: "${address}"`);
    
    // Mark as processed
    article.dataset.distanceProcessed = 'true';
    
    // Create and insert distance info element
    const distanceEl = document.createElement('div');
    distanceEl.className = 'idealista-distance-info';
    
    if (!settings.apiKey) {
      distanceEl.innerHTML = '<span class="warning">⚠️ Configure API key to calculate distances</span>';
    } else {
      distanceEl.innerHTML = '<span class="loading">Calculating distance...</span>';
    }
    
    priceRow.parentNode.insertBefore(distanceEl, priceRow);
    
    // Calculate distances only if API key is present
    if (settings.apiKey) {
      calculateDistances(address, distanceEl);
    }
  }
}

// Calculate distances from all configured locations
async function calculateDistances(destination, displayElement) {
  if (!settings.apiKey || !settings.locations || settings.locations.length === 0) {
    displayElement.innerHTML = '<span class="error">Extension not configured</span>';
    return;
  }
  
  console.log(`[Idealista Distance] Processing destination: "${destination}"`);
  console.log('[Idealista Distance] Configured locations:', settings.locations);
  
  try {
    const results = [];
    
    for (const location of settings.locations) {
      const origin = location.address;
      const travelMode = location.travelMode || 'driving';
      console.log(`[Idealista Distance] Calculating from "${origin}" via ${travelMode}`);
      const distance = await getDistanceFromGoogleMaps(origin, destination, travelMode);
      if (distance) {
        console.log(`[Idealista Distance] Result: ${distance.duration}, ${distance.distance}`);
        results.push({
          origin: origin,
          travelMode: travelMode,
          duration: distance.duration,
          distance: distance.distance
        });
      } else {
        console.warn(`[Idealista Distance] No result for "${origin}" -> "${destination}"`);
      }
    }
    
    if (results.length > 0) {
      displayDistanceResults(results, displayElement);
    } else {
      displayElement.innerHTML = '<span class="error">Unable to calculate distance (check console for details)</span>';
    }
  } catch (error) {
    console.error('[Idealista Distance] Calculation error:', error);
    displayElement.innerHTML = '<span class="error">Error calculating distance (check console)</span>';
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
        console.error('[Idealista Distance] API call failed:', {
          origin,
          destination,
          travelMode,
          response
        });
        resolve(null);
      }
    });
  });
}

// Display distance results
function displayDistanceResults(results, displayElement) {
  let html = '<div class="distance-results">';
  
  const modeIcons = {
    driving: '🚗',
    transit: '🚌',
    walking: '🚶',
    bicycling: '🚴'
  };
  
  results.forEach((result, index) => {
    const locationName = result.origin.split(',')[0]; // Use first part of address
    const icon = modeIcons[result.travelMode] || '📍';
    html += `
      <div class="distance-item">
        <span class="mode-icon">${icon}</span>
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
  
  .idealista-distance-info .warning {
    color: #f57c00;
    font-weight: 500;
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
  
  .mode-icon {
    font-size: 14px;
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

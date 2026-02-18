// Browser API compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  self.chrome = browser;
}

// Background service worker for API calls
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'calculateDistance') {
    calculateDistance(request.origin, request.destination, request.travelMode, request.apiKey)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
});

async function calculateDistance(origin, destination, travelMode, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${travelMode}&key=${apiKey}`;
  
  try {
    console.log(`[Distance API] Calculating: "${origin}" -> "${destination}" (${travelMode})`);
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('[Distance API] Full response:', data);
    
    if (data.status !== 'OK') {
      console.error('[Distance API] Overall status error:', data.status, data.error_message);
      throw new Error(`API overall status: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`);
    }
    
    if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
      console.error('[Distance API] Invalid response structure:', data);
      throw new Error('API returned invalid response structure');
    }
    
    const element = data.rows[0].elements[0];
    console.log('[Distance API] Element status:', element.status);
    
    if (element.status === 'OK') {
      const result = {
        distance: element.distance.text,
        duration: element.duration.text
      };
      console.log('[Distance API] Success:', result);
      return result;
    } else {
      console.error('[Distance API] Element status error:', {
        status: element.status,
        origin: data.origin_addresses?.[0],
        destination: data.destination_addresses?.[0]
      });
      throw new Error(`Cannot calculate route: ${element.status} (Origin: "${data.origin_addresses?.[0]}", Destination: "${data.destination_addresses?.[0]}")`);
    }
  } catch (error) {
    console.error('[Distance API] Error:', error);
    throw error;
  }
}

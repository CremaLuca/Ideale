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
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.text,
        duration: element.duration.text
      };
    } else {
      throw new Error(`API returned status: ${data.status}`);
    }
  } catch (error) {
    console.error('Google Maps API error:', error);
    throw error;
  }
}

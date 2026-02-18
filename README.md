# Idealista Distance Calculator Chrome Extension

A Chrome extension that automatically calculates and displays travel times from your specified locations to properties listed on idealista.it.

## Features

- 🗺️ Automatically calculates distances from your locations to each property
- ⏱️ Shows travel time and distance for each configured location
- 🚗 Supports multiple travel modes (driving, transit, walking, bicycling)
- ⚙️ Easy configuration through popup interface
- 🔄 Real-time updates when browsing listings
- 📍 Works on both listing pages and property detail pages
- 💾 Smart caching - distances are cached locally to minimize API calls and improve performance

## Installation

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Distance Matrix API**
4. Create credentials (API key)
5. Copy your API key

### Step 2: Install the Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

## Usage

### Configure the Extension

1. Click on the extension icon in your Chrome toolbar
2. Add one or more locations (e.g., "Via Roma 1, Milano") - **Required**
   - Each location has its own travel mode selector (🚗 Driving, 🚌 Transit, 🚶 Walking, 🚴 Bicycling)
   - You can add the same address multiple times with different travel modes
3. Enter your Google Maps API key - **Optional** (can be added later)
4. Click "Save Settings"

**Note:** You can save your locations first and add the API key later. Without an API key, the extension will show a reminder to configure it on each listing.

### Browse Idealista

1. Go to [idealista.it](https://www.idealista.it)
2. Search for properties
3. The extension will automatically calculate and display:
   - Travel time from each configured location
   - Distance to the property
   - Information appears above the price for each listing
   - **On detail pages**: Information appears before the comments section with enhanced styling

## Configuration Options

- **Google Maps API Key**: Required for distance calculations
- **Locations**: Add multiple locations with individual travel modes:
  - 🚗 **Driving**: Car travel time
  - 🚌 **Transit**: Public transportation
  - 🚶 **Walking**: Walking distance
  - 🚴 **Bicycling**: Cycling distance
  - **Tip**: Add the same address twice with different modes (e.g., driving + transit) to compare options

## Screenshots

The extension displays distance and travel time information directly in the listing:

```
� Ufficio: 15 min (8.5 km)
🚌 Ufficio: 25 min (8.5 km)
🚶 Casa: 35 min (2.1 km)
```

## Caching & Performance

The extension uses smart caching to improve performance and reduce Google Maps API usage:

- **Distance results are cached locally** - Once calculated, distances for a property are stored in your browser
- **Cache is indexed by property ID** - Each property's distances are stored separately
- **Per-location and travel mode** - Different origins and travel modes are cached independently
- **Persistent across sessions** - Cache survives browser restarts
- **Automatic cache use** - Cached results load instantly without API calls

This means:
- ✅ Faster loading when you revisit listings
- ✅ Lower API costs (fewer calls to Google Maps)
- ✅ Works even when scrolling back through listings you've seen before

## Privacy

- Your API key and locations are stored locally in Chrome's sync storage
- Distance cache is stored in Chrome's local storage
- No data is sent to any server except Google Maps API for distance calculations
- The extension only runs on idealista.it

## Troubleshooting

### Distances not showing?

- Make sure you've configured your API key and locations
- Check that the Distance Matrix API is enabled in Google Cloud Console
- Verify your API key has no restrictions preventing its use

### "Error calculating distance"?

- Check your internet connection
- Verify the property address is valid
- Ensure your API key is correct and has usage quota remaining

## Development

### Files

- `manifest.json` - Extension manifest
- `popup.html` - Configuration popup interface
- `popup.js` - Popup logic and settings management
- `popup.css` - Popup styles
- `content.js` - Content script that runs on idealista.it
- `icon*.png` - Extension icons (you need to create these)

### API Usage

The extension uses the Google Maps Distance Matrix API. Be aware of:
- API usage limits and costs
- Each property check makes one API call per configured location

## License

MIT License - feel free to modify and use as needed.

## Support

For issues or feature requests, please open an issue on the repository.

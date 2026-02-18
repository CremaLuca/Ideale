# Ideale Browser Extension

A browser extension for Chrome and Firefox that automatically calculates and displays travel times from your specified locations to properties listed on idealista.it.

## Features

- 🗺️ Automatically calculates distances from your locations to each property
- ⏱️ Shows travel time and distance for each configured location
- 🚗 Supports multiple travel modes (driving, transit, walking, bicycling)
- ⚙️ Easy configuration through popup interface
- 🔄 Real-time updates when browsing listings
- 📍 Works on both listing pages and property detail pages
- 💾 Smart caching - distances are cached locally to minimize API calls and improve performance
- 🌍 **Cross-browser support** - Works on Chrome and Firefox

## Installation

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Distance Matrix API**
4. Create credentials (API key)
5. Copy your API key

### Step 2: Install the Extension

#### Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

#### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select `manifest.json`

**Note**: In Firefox, temporary extensions are removed when you close the browser. For permanent installation, you would need to sign the extension through Mozilla Add-ons.

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
🏢 Ufficio: 15 min (8.5 km)
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

- Your API key and locations are stored locally in browser's sync storage
- Distance cache is stored in browser's local storage
- No data is sent to any server except Google Maps API for distance calculations
- The extension only runs on idealista.it

## Development

### Browser Compatibility

The extension is built using standard WebExtensions APIs and works on:
- **Chrome/Chromium** - Version 109+
- **Firefox** - Version 109+

The `browser-polyfill.js` ensures API compatibility between browsers.

### API Usage

The extension uses the Google Maps Distance Matrix API. Be aware of:
- API usage limits and costs
- Each property check makes one API call per configured location (first time only - results are cached)

## License

MIT License - feel free to modify and use as needed.

## Support

For issues or feature requests, please open an issue on the repository.

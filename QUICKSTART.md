# Quick Start Guide

## Step 1: Create Icon Files

Before loading the extension, you need to create the required icon files. Choose one method:

### Method A: Run PowerShell Script (Recommended)
```powershell
.\create-icons.ps1
```

### Method B: Use HTML Generator
1. Open `generate-icons.html` in your browser
2. Right-click each canvas and save as PNG with the correct name

### Method C: Use Any PNG Images
Create or download three PNG files named `icon16.png`, `icon48.png`, and `icon128.png` of the appropriate sizes.

## Step 2: Get Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable **Distance Matrix API**
4. Create an API key under Credentials
5. Copy the API key

## Step 3: Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select this folder: `c:\Users\lucacrema\dev\ideale`

## Step 4: Configure Extension

1. Click the extension icon in Chrome toolbar
2. Paste your Google Maps API key
3. Add your locations (e.g., "Via Roma 1, Milano, Italy")
4. Select travel mode (driving, transit, walking, or bicycling)
5. Click "Save Settings"

## Step 5: Test It!

1. Go to https://www.idealista.it
2. Search for properties
3. You should see travel time and distance information appear above the price for each listing

## Troubleshooting

### Extension won't load?
- Make sure all three icon files exist
- Check the Chrome extensions page for error messages

### No distances showing?
- Open Chrome DevTools (F12) and check Console for errors
- Verify your API key is correct
- Make sure Distance Matrix API is enabled in Google Cloud Console

### "Error calculating distance"?
- Check your internet connection
- Verify you have API quota remaining
- Make sure the addresses are valid

## Features

- ✅ Automatic distance calculation for all listings
- ✅ Multiple origin locations support
- ✅ Different travel modes (driving, transit, walking, bicycling)
- ✅ Real-time updates as you scroll
- ✅ Clean integration with Idealista's UI

## Files Overview

- `manifest.json` - Extension configuration
- `background.js` - Service worker for API calls
- `content.js` - Script that runs on idealista.it pages
- `popup.html` - Settings interface
- `popup.js` - Settings logic
- `popup.css` - Settings styles
- `create-icons.ps1` - Icon generation script
- `generate-icons.html` - Alternative icon generator

Enjoy your enhanced Idealista experience! 🎉

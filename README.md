# PackageTracker Pro 📦

A modern, iOS-style Progressive Web App for scanning and tracking packages from Amazon, FedEx, UPS, USPS, DHL, and other carriers.

## Features ✨

- **📱 iOS-like Design**: Beautiful glassmorphism UI with smooth animations
- **📷 Package Scanning**: Camera-based barcode scanning (simulated)
- **📝 Manual Entry**: Add packages manually with all necessary details
- **💾 Local Storage**: Data persists locally on your device
- **📊 Dashboard**: View package statistics and recent deliveries
- **🔄 PWA Support**: Install as an app on your phone
- **📱 Mobile Responsive**: Optimized for mobile devices

## How to Use 🚀

### Getting Started
1. Open the app in your web browser
2. Grant camera permissions when prompted (for scanning)
3. Start tracking your packages!

### Scanning Packages
1. Click the "Scan Package" button
2. Position the barcode within the green frame
3. Click "Capture" to scan (currently simulated)
4. Fill in the package details form
5. Save the package information

### Manual Entry
1. Click "Add Manually" from the dashboard
2. Enter the tracking number and select carrier
3. Fill in recipient information, location, and receiver details
4. Add optional notes if needed
5. Save the package

### Package Information Stored
- **Tracking Number**: Package tracking ID
- **Carrier**: Amazon, FedEx, UPS, USPS, DHL, or Other
- **Recipient Name**: Who the package is for
- **Phone Number**: Contact number (auto-formatted)
- **Storage Location**: Where the package is placed
- **Received By**: Who accepted the package
- **Timestamp**: Date and time of entry
- **Notes**: Optional additional information

## Installation 📲

### As a Web App
1. Open the app in Chrome or Safari on your mobile device
2. Look for the "Add to Home Screen" prompt
3. Tap "Add" to install as a native-like app

### Local Development
1. Clone or download the files
2. Serve the files using any web server
3. Access via `http://localhost` or your server address

## Technology Stack 🛠️

- **HTML5**: Semantic markup with modern features
- **CSS3**: Custom properties, flexbox, grid, glassmorphism effects
- **Vanilla JavaScript**: ES6+ features, modules, async/await
- **PWA**: Service worker, web app manifest, offline support
- **MediaDevices API**: Camera access for scanning
- **Local Storage**: Client-side data persistence

## Browser Support 🌐

- Chrome/Chromium 70+
- Safari 12+
- Firefox 70+
- Edge 79+

## Security & Privacy 🔒

- All data is stored locally on your device
- No data is transmitted to external servers
- Camera access is only used for barcode scanning
- No tracking or analytics

## Future Enhancements 🔮

- Real barcode/QR code detection using ML
- Push notifications for package reminders
- Export data to CSV/JSON
- Search and filter packages
- Backend synchronization option
- Package status tracking via carrier APIs

## Troubleshooting Scanning Issues 🔧

### Common Scanning Problems

1. **"No barcode detected" message**
   - Ensure good lighting conditions
   - Hold the device steady
   - Position barcode 6-12 inches from camera
   - Try switching between front/back camera
   - Use the "Manual" entry option as alternative

2. **Camera not working**
   - Check browser permissions for camera access
   - Refresh the page and try again
   - Try a different browser (Chrome/Safari recommended)
   - Ensure no other apps are using the camera

3. **App not detecting packages**
   - Current version uses simulated detection
   - The app analyzes image contrast to simulate barcode presence
   - For real detection, integrate a barcode library (see below)

### Integrating Real Barcode Detection

To add real barcode scanning capabilities, consider these libraries:

#### Option 1: ZXing-js (Recommended)
```html
<script src="https://unpkg.com/@zxing/library@latest"></script>
```

#### Option 2: QuaggaJS
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"></script>
```

#### Option 3: ZBar.wasm
- Modern WebAssembly-based solution
- Supports multiple barcode formats
- Good performance on mobile devices

### Implementation Example (ZXing-js)

Replace the `detectBarcode()` function in `script.js`:

```javascript
async detectBarcode(canvas) {
    try {
        const codeReader = new ZXing.BrowserMultiFormatReader();
        const result = await codeReader.decodeFromCanvas(canvas);
        
        if (result) {
            this.showToast(`Barcode detected: ${result.text}`, 'success');
            this.showFormView(result.text);
        }
    } catch (error) {
        this.showToast('No barcode detected. Try repositioning.', 'error');
    }
}
```

## Support 💬

This is a demo application. For real-world usage, you may want to integrate with actual barcode scanning libraries and carrier tracking APIs.

---

Built with ❤️ using modern web technologies
// Package Tracker Pro - Main JavaScript File

class PackageTracker {
    constructor() {
        this.packages = JSON.parse(localStorage.getItem('packages')) || [];
        this.currentView = 'dashboard';
        this.cameraStream = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderPackageList();
        this.checkCameraSupport();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('scanBtn').addEventListener('click', () => this.showScanView());
        document.getElementById('manualBtn').addEventListener('click', () => this.showFormView());
        document.getElementById('backToMain').addEventListener('click', () => this.showDashboard());
        document.getElementById('backFromForm').addEventListener('click', () => this.showDashboard());
        
        // Scan actions
        document.getElementById('captureBtn').addEventListener('click', () => this.captureImage());
        document.getElementById('switchCameraBtn').addEventListener('click', () => this.switchCamera());
        document.getElementById('manualEntryBtn').addEventListener('click', () => this.showFormView());
        
        // Form submission
        document.getElementById('packageForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Profile button (placeholder)
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
    }

    // View Management
    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });
        document.getElementById(viewId).style.display = 'block';
        this.currentView = viewId.replace('View', '');
        
        if (viewId === 'scanView') {
            this.startCamera();
        } else {
            this.stopCamera();
        }
    }

    showDashboard() {
        this.showView('dashboardView');
        this.updateStats();
        this.renderPackageList();
    }

    showScanView() {
        this.showView('scanView');
    }

    showFormView(trackingNumber = '') {
        this.showView('formView');
        if (trackingNumber) {
            document.getElementById('trackingNumber').value = trackingNumber;
        }
        this.resetForm();
    }

    // Camera Functionality
    async checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showToast('Camera not supported on this device', 'error');
            document.getElementById('scanBtn').style.display = 'none';
        }
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('cameraFeed');
            video.srcObject = this.cameraStream;
            
            this.showToast('Camera ready! Position barcode in frame', 'info');
        } catch (error) {
            console.error('Camera access error:', error);
            this.showToast('Camera access denied', 'error');
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    }

    async switchCamera() {
        this.stopCamera();
        try {
            const constraints = {
                video: {
                    facingMode: this.cameraStream?.getVideoTracks()[0]?.getSettings()?.facingMode === 'environment' 
                        ? 'user' : 'environment'
                }
            };
            await this.startCamera();
        } catch (error) {
            this.showToast('Unable to switch camera', 'error');
        }
    }

    captureImage() {
        const video = document.getElementById('cameraFeed');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Simulate barcode detection
        this.simulateBarcodeDetection();
    }

    simulateBarcodeDetection() {
        // Simulate scanning delay
        this.showToast('Scanning...', 'info');
        
        setTimeout(() => {
            // Generate a mock tracking number
            const carriers = ['amazon', 'fedex', 'ups', 'usps', 'dhl'];
            const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
            const mockTrackingNumber = this.generateMockTrackingNumber(randomCarrier);
            
            this.showToast('Barcode detected!', 'success');
            this.showFormView(mockTrackingNumber);
        }, 1500);
    }

    generateMockTrackingNumber(carrier) {
        const patterns = {
            amazon: 'TBA' + Math.random().toString().substr(2, 12),
            fedex: '1234' + Math.random().toString().substr(2, 8),
            ups: '1Z' + Math.random().toString(36).substr(2, 16).toUpperCase(),
            usps: '9400' + Math.random().toString().substr(2, 16),
            dhl: Math.random().toString().substr(2, 10)
        };
        return patterns[carrier] || Math.random().toString().substr(2, 12);
    }

    // Form Management
    resetForm() {
        const form = document.getElementById('packageForm');
        form.reset();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const packageData = {
            id: Date.now().toString(),
            trackingNumber: formData.get('trackingNumber') || document.getElementById('trackingNumber').value,
            carrier: formData.get('carrier') || document.getElementById('carrier').value,
            recipientName: formData.get('recipientName') || document.getElementById('recipientName').value,
            recipientPhone: formData.get('recipientPhone') || document.getElementById('recipientPhone').value,
            location: formData.get('location') || document.getElementById('location').value,
            receivedBy: formData.get('receivedBy') || document.getElementById('receivedBy').value,
            notes: formData.get('notes') || document.getElementById('notes').value,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        // Validate required fields
        if (!packageData.trackingNumber || !packageData.carrier || !packageData.recipientName || 
            !packageData.recipientPhone || !packageData.location || !packageData.receivedBy) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Save package
        this.packages.unshift(packageData);
        this.savePackages();
        
        this.showToast('Package saved successfully!', 'success');
        this.showDashboard();
    }

    // Data Management
    savePackages() {
        localStorage.setItem('packages', JSON.stringify(this.packages));
    }

    updateStats() {
        const totalPackages = this.packages.length;
        const today = new Date().toLocaleDateString();
        const todayPackages = this.packages.filter(pkg => pkg.date === today).length;
        
        document.getElementById('totalPackages').textContent = totalPackages;
        document.getElementById('todayPackages').textContent = todayPackages;
    }

    renderPackageList() {
        const packageList = document.getElementById('packageList');
        packageList.innerHTML = '';
        
        if (this.packages.length === 0) {
            packageList.innerHTML = `
                <div class="package-item">
                    <div style="text-align: center; color: var(--text-secondary);">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p>No packages yet</p>
                        <p style="font-size: 14px;">Scan or add your first package to get started</p>
                    </div>
                </div>
            `;
            return;
        }

        this.packages.slice(0, 5).forEach(pkg => {
            const packageItem = this.createPackageElement(pkg);
            packageList.appendChild(packageItem);
        });
    }

    createPackageElement(pkg) {
        const div = document.createElement('div');
        div.className = 'package-item';
        
        div.innerHTML = `
            <div class="package-header">
                <span class="package-tracking">${pkg.trackingNumber}</span>
                <span class="package-carrier carrier-${pkg.carrier}">${pkg.carrier.toUpperCase()}</span>
            </div>
            <div class="package-info">
                <div><strong>Recipient:</strong> ${pkg.recipientName}</div>
                <div><strong>Phone:</strong> ${this.formatPhoneNumber(pkg.recipientPhone)}</div>
                <div><strong>Location:</strong> ${pkg.location}</div>
                <div><strong>Received by:</strong> ${pkg.receivedBy}</div>
            </div>
            ${pkg.notes ? `<div style="margin-top: 8px; font-style: italic; color: var(--text-secondary);">${pkg.notes}</div>` : ''}
            <div class="package-time">${pkg.date} at ${pkg.time}</div>
        `;
        
        // Add click handler for package details
        div.addEventListener('click', () => this.showPackageDetails(pkg));
        
        return div;
    }

    formatPhoneNumber(phone) {
        // Simple phone number formatting
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }

    showPackageDetails(pkg) {
        // Create a detailed view modal (simplified for this demo)
        const details = `
            Package Details:
            
            Tracking: ${pkg.trackingNumber}
            Carrier: ${pkg.carrier.toUpperCase()}
            Recipient: ${pkg.recipientName}
            Phone: ${this.formatPhoneNumber(pkg.recipientPhone)}
            Location: ${pkg.location}
            Received by: ${pkg.receivedBy}
            Date/Time: ${pkg.date} at ${pkg.time}
            ${pkg.notes ? `Notes: ${pkg.notes}` : ''}
        `;
        
        alert(details); // In a real app, this would be a proper modal
    }

    // UI Helpers
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `toast-icon ${icons[type]}`;
        messageEl.textContent = message;
        toast.className = `toast ${type} show`;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showProfile() {
        // Placeholder for profile functionality
        this.showToast('Profile feature coming soon!', 'info');
    }

    // Search and Filter (Future Enhancement)
    searchPackages(query) {
        return this.packages.filter(pkg => 
            pkg.trackingNumber.toLowerCase().includes(query.toLowerCase()) ||
            pkg.recipientName.toLowerCase().includes(query.toLowerCase()) ||
            pkg.carrier.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Export Data (Future Enhancement)
    exportData() {
        const dataStr = JSON.stringify(this.packages, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `package-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PackageTracker();
});

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add to home screen prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    // Show install button or prompt user
});

// Handle offline functionality
window.addEventListener('online', () => {
    document.querySelector('.app-title').style.opacity = '1';
});

window.addEventListener('offline', () => {
    document.querySelector('.app-title').style.opacity = '0.7';
});
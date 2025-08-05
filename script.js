// Package Tracker Pro - Enhanced with iOS 26 Liquid Glass Interactions

class PackageTracker {
    constructor() {
        this.packages = JSON.parse(localStorage.getItem('packages')) || [];
        this.currentView = 'dashboard';
        this.cameraStream = null;
        this.isLoggedInToPortal = JSON.parse(localStorage.getItem('portalSession')) || false;
        this.portalUsers = JSON.parse(localStorage.getItem('portalUsers')) || [
            { id: 1, username: 'hilton', role: 'admin', created: new Date().toISOString(), lastLogin: null }
        ];
        this.systemLogs = JSON.parse(localStorage.getItem('systemLogs')) || [];
        this.systemSettings = JSON.parse(localStorage.getItem('systemSettings')) || {
            autoBackup: false,
            retentionDays: 365,
            themeMode: 'dark'
        };
        this.portalCredentials = { username: 'hilton', password: 'hilton2025!' };
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderPackageList();
        this.checkCameraSupport();
        this.logActivity('System', 'Application started');
        this.setupScrollBehavior();
        this.setupMicroInteractions();
        this.applyLiquidGlassTheme();
    }

    setupScrollBehavior() {
        const header = document.querySelector('.header');
        let ticking = false;

        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            this.lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }

    setupMicroInteractions() {
        // Add button press animations
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, .primary-btn, .secondary-btn, .danger-btn')) {
                this.addRippleEffect(e.target, e);
                this.addPressAnimation(e.target);
            }
        });

        // Add hover glow states
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.stat-card, .package-item, .portal-stat-card')) {
                this.addHoverGlow(e.target);
            }
        });

        // Add card bounce on interaction
        const cards = document.querySelectorAll('.stat-card, .package-item, .portal-stat-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                this.addBounceAnimation(card);
            });
        });
    }

    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addPressAnimation(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    addHoverGlow(element) {
        element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.boxShadow = '0 16px 64px rgba(0, 122, 255, 0.2)';
    }

    addBounceAnimation(element) {
        element.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    applyLiquidGlassTheme() {
        // Add CSS for ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
                    transform: translate3d(0,0,0);
                }
                40%, 43% {
                    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                    transform: translate3d(0, -8px, 0);
                }
                70% {
                    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                    transform: translate3d(0, -4px, 0);
                }
                90% {
                    transform: translate3d(0,-1px,0);
                }
            }
            
            /* Smooth page transitions */
            .view {
                transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            /* Enhanced focus states */
            *:focus-visible {
                outline: 2px solid rgba(10, 132, 255, 0.6);
                outline-offset: 2px;
                border-radius: 8px;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('scanBtn').addEventListener('click', () => this.showScanView());
        document.getElementById('manualBtn').addEventListener('click', () => this.showFormView());
        document.getElementById('backToMain').addEventListener('click', () => this.showDashboard());
        document.getElementById('backFromForm').addEventListener('click', () => this.showDashboard());
        
        // Portal Management
        document.getElementById('portalBtn').addEventListener('click', () => this.showPortalLogin());
        document.getElementById('backFromPortalLogin').addEventListener('click', () => this.showDashboard());
        document.getElementById('portalLoginForm').addEventListener('submit', (e) => this.handlePortalLogin(e));
        document.getElementById('togglePassword').addEventListener('click', () => this.togglePasswordVisibility());
        document.getElementById('portalLogoutBtn').addEventListener('click', () => this.handlePortalLogout());
        
        // Portal Tabs
        document.querySelectorAll('.portal-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchPortalTab(tab.dataset.tab));
        });
        
        // Portal Actions
        document.getElementById('addUserBtn').addEventListener('click', () => this.showAddUserForm());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportAllData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());
        document.getElementById('clearLogsBtn').addEventListener('click', () => this.clearSystemLogs());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('importFileInput').addEventListener('change', (e) => this.handleFileImport(e));
        
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

    // Portal Authentication
    showPortalLogin() {
        if (this.isLoggedInToPortal) {
            this.showPortalDashboard();
        } else {
            this.showView('portalLoginView');
        }
    }

    handlePortalLogin(e) {
        e.preventDefault();
        const username = document.getElementById('portalUsername').value;
        const password = document.getElementById('portalPassword').value;
        
        if (username === this.portalCredentials.username && password === this.portalCredentials.password) {
            this.isLoggedInToPortal = true;
            localStorage.setItem('portalSession', JSON.stringify(true));
            
            // Update last login for user
            const user = this.portalUsers.find(u => u.username === username);
            if (user) {
                user.lastLogin = new Date().toISOString();
                this.savePortalUsers();
            }
            
            this.logActivity('Portal', `User ${username} logged in`);
            this.showToast('Portal login successful!', 'success');
            this.showPortalDashboard();
        } else {
            this.logActivity('Portal', `Failed login attempt for user ${username}`);
            this.showToast('Invalid username or password', 'error');
        }
    }

    handlePortalLogout() {
        this.isLoggedInToPortal = false;
        localStorage.removeItem('portalSession');
        this.logActivity('Portal', 'User logged out');
        this.showToast('Logged out successfully', 'info');
        this.showDashboard();
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('portalPassword');
        const toggleIcon = document.getElementById('togglePassword').querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    // Portal Dashboard
    showPortalDashboard() {
        this.showView('portalDashboardView');
        this.updatePortalStats();
        this.renderPortalUsers();
        this.renderSystemLogs();
        this.loadSettings();
        this.generateActivityChart();
        document.getElementById('portalUserName').textContent = this.portalCredentials.username;
    }

    switchPortalTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.portal-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.portal-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load tab-specific data
        if (tabName === 'users') {
            this.renderPortalUsers();
        } else if (tabName === 'logs') {
            this.renderSystemLogs();
        } else if (tabName === 'overview') {
            this.updatePortalStats();
            this.generateActivityChart();
        }
    }

    updatePortalStats() {
        const totalPackages = this.packages.length;
        const totalUsers = this.portalUsers.length;
        const today = new Date().toLocaleDateString();
        const todayActivity = this.systemLogs.filter(log => 
            new Date(log.timestamp).toLocaleDateString() === today
        ).length;
        
        const storageUsed = Math.round(
            (JSON.stringify(this.packages).length + 
             JSON.stringify(this.systemLogs).length + 
             JSON.stringify(this.portalUsers).length) / 1024
        );
        
        document.getElementById('portalTotalPackages').textContent = totalPackages;
        document.getElementById('portalTotalUsers').textContent = totalUsers;
        document.getElementById('portalTodayActivity').textContent = todayActivity;
        document.getElementById('portalStorageUsed').textContent = storageUsed;
    }

    generateActivityChart() {
        const chartContainer = document.getElementById('activityChart');
        chartContainer.innerHTML = '';
        
        // Generate last 7 days of activity
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString();
            
            const dayActivity = this.systemLogs.filter(log => 
                new Date(log.timestamp).toLocaleDateString() === dateStr
            ).length;
            
            last7Days.push({ date: dateStr, count: dayActivity });
        }
        
        const maxCount = Math.max(...last7Days.map(d => d.count), 1);
        
        last7Days.forEach(day => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(day.count / maxCount) * 100}%`;
            bar.title = `${day.date}: ${day.count} activities`;
            chartContainer.appendChild(bar);
        });
    }

    // User Management
    renderPortalUsers() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        this.portalUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <p>Role: ${user.role} | Created: ${new Date(user.created).toLocaleDateString()}</p>
                    <p>Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                <div class="user-actions">
                    <button class="secondary-btn" onclick="packageTracker.editUser(${user.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${user.id !== 1 ? `<button class="danger-btn" onclick="packageTracker.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''}
                </div>
            `;
            usersList.appendChild(userItem);
        });
    }

    showAddUserForm() {
        const username = prompt('Enter username:');
        if (!username) return;
        
        const role = prompt('Enter role (admin/user):', 'user');
        if (!role) return;
        
        if (this.portalUsers.find(u => u.username === username)) {
            this.showToast('Username already exists', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            username: username,
            role: role,
            created: new Date().toISOString(),
            lastLogin: null
        };
        
        this.portalUsers.push(newUser);
        this.savePortalUsers();
        this.logActivity('Portal', `New user created: ${username}`);
        this.showToast('User created successfully!', 'success');
        this.renderPortalUsers();
    }

    editUser(userId) {
        const user = this.portalUsers.find(u => u.id === userId);
        if (!user) return;
        
        const newRole = prompt('Enter new role:', user.role);
        if (newRole && newRole !== user.role) {
            user.role = newRole;
            this.savePortalUsers();
            this.logActivity('Portal', `User ${user.username} role updated to ${newRole}`);
            this.showToast('User updated successfully!', 'success');
            this.renderPortalUsers();
        }
    }

    deleteUser(userId) {
        if (userId === 1) {
            this.showToast('Cannot delete admin user', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to delete this user?')) {
            const user = this.portalUsers.find(u => u.id === userId);
            this.portalUsers = this.portalUsers.filter(u => u.id !== userId);
            this.savePortalUsers();
            this.logActivity('Portal', `User deleted: ${user.username}`);
            this.showToast('User deleted successfully!', 'success');
            this.renderPortalUsers();
        }
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

    // System Logs
    logActivity(category, message) {
        const logEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            category: category,
            message: message,
            user: this.isLoggedInToPortal ? this.portalCredentials.username : 'System'
        };
        
        this.systemLogs.unshift(logEntry);
        
        // Keep only last 1000 logs
        if (this.systemLogs.length > 1000) {
            this.systemLogs = this.systemLogs.slice(0, 1000);
        }
        
        this.saveSystemLogs();
    }

    renderSystemLogs() {
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = '';
        
        if (this.systemLogs.length === 0) {
            logsContainer.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">No logs available</p>';
            return;
        }
        
        this.systemLogs.slice(0, 50).forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <span class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
                <span style="color: var(--primary-blue);">[${log.category}]</span>
                <span>${log.message}</span>
                <span style="color: var(--text-tertiary); margin-left: auto;">(${log.user})</span>
            `;
            logsContainer.appendChild(logEntry);
        });
    }

    clearSystemLogs() {
        if (confirm('Clear all system logs?')) {
            this.systemLogs = [];
            this.saveSystemLogs();
            this.logActivity('Portal', 'System logs cleared');
            this.showToast('System logs cleared!', 'success');
            this.renderSystemLogs();
        }
    }

    // Settings Management
    loadSettings() {
        document.getElementById('autoBackup').checked = this.systemSettings.autoBackup;
        document.getElementById('retentionDays').value = this.systemSettings.retentionDays;
        document.getElementById('themeMode').value = this.systemSettings.themeMode;
    }

    saveSettings() {
        this.systemSettings.autoBackup = document.getElementById('autoBackup').checked;
        this.systemSettings.retentionDays = parseInt(document.getElementById('retentionDays').value);
        this.systemSettings.themeMode = document.getElementById('themeMode').value;
        
        this.saveSystemSettings();
        this.logActivity('Portal', 'System settings updated');
        this.showToast('Settings saved successfully!', 'success');
    }

    // Storage Methods
    savePortalUsers() {
        localStorage.setItem('portalUsers', JSON.stringify(this.portalUsers));
    }

    saveSystemLogs() {
        localStorage.setItem('systemLogs', JSON.stringify(this.systemLogs));
    }

    saveSystemSettings() {
        localStorage.setItem('systemSettings', JSON.stringify(this.systemSettings));
    }

    saveAllData() {
        this.savePackages();
        this.savePortalUsers();
        this.saveSystemLogs();
        this.saveSystemSettings();
    }

    // Data Management
    exportAllData() {
        const exportData = {
            packages: this.packages,
            users: this.portalUsers,
            logs: this.systemLogs,
            settings: this.systemSettings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `packagetracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.logActivity('Portal', 'Data exported');
        this.showToast('Data exported successfully!', 'success');
    }

    importData() {
        document.getElementById('importFileInput').click();
    }

    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    if (importData.packages) this.packages = importData.packages;
                    if (importData.users) this.portalUsers = importData.users;
                    if (importData.logs) this.systemLogs = importData.logs;
                    if (importData.settings) this.systemSettings = importData.settings;
                    
                    this.saveAllData();
                    this.logActivity('Portal', 'Data imported from backup');
                    this.showToast('Data imported successfully!', 'success');
                    this.updateStats();
                    this.updatePortalStats();
                    this.renderPortalUsers();
                    this.renderSystemLogs();
                }
            } catch (error) {
                this.showToast('Invalid backup file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('This will permanently delete ALL data. Are you sure?')) {
            if (confirm('This action cannot be undone. Continue?')) {
                this.packages = [];
                this.systemLogs = [];
                // Keep admin user
                this.portalUsers = [this.portalUsers[0]];
                
                this.saveAllData();
                this.logActivity('Portal', 'All data cleared');
                this.showToast('All data cleared successfully!', 'success');
                this.updateStats();
                this.updatePortalStats();
                this.renderPortalUsers();
                this.renderSystemLogs();
                this.renderPackageList();
            }
        }
    }

    // Enhanced form submission with logging
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
        
        // Log the activity
        this.logActivity('Package', `New package added: ${packageData.trackingNumber}`);
        
        this.showToast('Package saved successfully!', 'success');
        this.showDashboard();
    }
}

// Global reference for inline event handlers
let packageTracker;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    packageTracker = new PackageTracker();
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
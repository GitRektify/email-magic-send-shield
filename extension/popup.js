
// Email Magic: SendShield Popup Script
class SendShieldPopup {
  constructor() {
    this.settings = {
      delayTime: 60,
      isEnabled: true,
      userId: null,
      licenseKey: null,
      licenseExpiry: null,
      demoMode: true,
      customDelayTimes: [15, 30, 60, 120, 300],
      notifications: {
        sound: true,
        desktop: true,
        inGmail: true
      },
      smartDelay: {
        enabled: false,
        afterHours: true,
        weekends: true,
        increasedDelay: 300
      }
    };
    
    this.stats = {
      emailsDelayed: 0,
      emailsCancelled: 0,
      emailsSent: 0,
      mistakesPrevented: 0,
      totalTimeSaved: 0
    };
    
    this.isAuthenticated = false;
    this.init();
  }

  async init() {
    console.log('SendShield Popup: Initializing');
    
    // Load settings and stats
    await this.loadSettings();
    await this.loadStats();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI
    this.updateUI();
    
    // Load detailed statistics
    await this.loadDetailedStatistics();
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response && response.settings) {
        this.settings = { ...this.settings, ...response.settings };
        this.isAuthenticated = !!this.settings.userId && !this.settings.demoMode;
        console.log('SendShield Popup: Settings loaded', this.settings);
      }
    } catch (error) {
      console.error('SendShield Popup: Error loading settings:', error);
    }
  }

  async loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getUsageStats' });
      if (response && response.stats) {
        this.stats = { ...this.stats, ...response.stats };
        console.log('SendShield Popup: Stats loaded', this.stats);
      }
    } catch (error) {
      console.error('SendShield Popup: Error loading stats:', error);
    }
  }

  setupEventListeners() {
    // Authentication button
    const authButton = document.getElementById('authButton');
    if (authButton) {
      authButton.addEventListener('click', () => this.authenticate());
    }

    // Demo mode buttons
    const demoButtons = document.querySelectorAll('#demoButton');
    demoButtons.forEach(button => {
      button.addEventListener('click', () => this.startDemoMode());
    });

    // Delay time options
    const delayOptions = document.querySelectorAll('.delay-option');
    delayOptions.forEach(option => {
      option.addEventListener('click', () => {
        const delayTime = parseInt(option.dataset.delay);
        this.updateDelayTime(delayTime);
      });
    });

    // Enable/disable toggle
    const enableToggle = document.getElementById('enableToggle');
    if (enableToggle) {
      enableToggle.addEventListener('change', () => {
        this.updateEnabled(enableToggle.checked);
      });
    }

    // Advanced settings toggles
    const smartDelayToggle = document.getElementById('smartDelayToggle');
    if (smartDelayToggle) {
      smartDelayToggle.addEventListener('change', () => {
        this.updateSmartDelay(smartDelayToggle.checked);
      });
    }

    // Notification toggles
    const desktopNotificationToggle = document.getElementById('desktopNotificationToggle');
    if (desktopNotificationToggle) {
      desktopNotificationToggle.addEventListener('change', () => {
        this.updateNotificationSetting('desktop', desktopNotificationToggle.checked);
      });
    }

    // Footer links
    const helpLink = document.getElementById('helpLink');
    const upgradeLink = document.getElementById('upgradeLink');
    
    if (helpLink) {
      helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://emailmagic.com/support' });
      });
    }
    
    if (upgradeLink) {
      upgradeLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://emailmagic.com/sendshield' });
      });
    }

    // Export/Import buttons
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    
    if (exportButton) {
      exportButton.addEventListener('click', () => this.exportData());
    }
    
    if (importButton) {
      importButton.addEventListener('click', () => this.importData());
    }
  }

  updateUI() {
    const authSection = document.getElementById('authSection');
    const settingsSection = document.getElementById('settingsSection');
    const licenseSection = document.getElementById('licenseSection');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    const demoIndicator = document.getElementById('demoIndicator');

    // Update demo indicator and main sections
    if (this.settings.demoMode) {
      if (demoIndicator) demoIndicator.style.display = 'block';
      if (authSection) authSection.style.display = 'block';
      if (settingsSection) settingsSection.style.display = 'block';
      if (licenseSection) licenseSection.style.display = 'none';
      
      // Update status for demo mode
      if (statusText && statusDot) {
        if (this.settings.isEnabled) {
          statusText.textContent = 'Demo Mode';
          statusDot.style.background = '#f59e0b';
        } else {
          statusText.textContent = 'Disabled';
          statusDot.style.background = '#ef4444';
        }
      }
    } else if (this.isAuthenticated) {
      if (demoIndicator) demoIndicator.style.display = 'none';
      if (authSection) authSection.style.display = 'none';
      if (settingsSection) settingsSection.style.display = 'block';
      if (licenseSection) licenseSection.style.display = 'block';
      
      this.updateLicenseInfo();
      
      // Update status for authenticated mode
      if (statusText && statusDot) {
        if (this.settings.isEnabled) {
          statusText.textContent = 'Active';
          statusDot.style.background = '#10b981';
        } else {
          statusText.textContent = 'Disabled';
          statusDot.style.background = '#ef4444';
        }
      }
    } else {
      if (demoIndicator) demoIndicator.style.display = 'none';
      if (authSection) authSection.style.display = 'block';
      if (settingsSection) settingsSection.style.display = 'none';
      if (licenseSection) licenseSection.style.display = 'none';
      
      if (statusText && statusDot) {
        statusText.textContent = 'Not Signed In';
        statusDot.style.background = '#f59e0b';
      }
    }

    // Update settings UI
    this.updateDelayTimeUI();
    this.updateToggles();
    this.updateStatistics();
  }

  updateDelayTimeUI() {
    const delayOptions = document.querySelectorAll('.delay-option');
    delayOptions.forEach(option => {
      const delayTime = parseInt(option.dataset.delay);
      if (delayTime === this.settings.delayTime) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  updateToggles() {
    // Main enable toggle
    const enableToggle = document.getElementById('enableToggle');
    if (enableToggle) {
      enableToggle.checked = this.settings.isEnabled;
    }

    // Smart delay toggle
    const smartDelayToggle = document.getElementById('smartDelayToggle');
    if (smartDelayToggle) {
      smartDelayToggle.checked = this.settings.smartDelay?.enabled || false;
    }

    // Desktop notification toggle
    const desktopNotificationToggle = document.getElementById('desktopNotificationToggle');
    if (desktopNotificationToggle) {
      desktopNotificationToggle.checked = this.settings.notifications?.desktop !== false;
    }
  }

  updateStatistics() {
    // Update main stats
    const delayedCountEl = document.getElementById('delayedCount');
    const touchedCountEl = document.getElementById('touchedCount');
    const sentCountEl = document.getElementById('sentCount');
    const savedTimeEl = document.getElementById('savedTime');
    
    if (delayedCountEl) delayedCountEl.textContent = this.stats.emailsDelayed || 0;
    if (touchedCountEl) touchedCountEl.textContent = this.stats.mistakesPrevented || 0;
    if (sentCountEl) sentCountEl.textContent = this.stats.emailsSent || 0;
    if (savedTimeEl) {
      const minutes = Math.round((this.stats.totalTimeSaved || 0) / 60);
      savedTimeEl.textContent = `${minutes}min`;
    }
  }

  updateLicenseInfo() {
    const licenseStatus = document.getElementById('licenseStatus');
    const licenseExpiry = document.getElementById('licenseExpiry');
    
    if (licenseStatus && licenseExpiry) {
      if (this.settings.licenseExpiry) {
        const expiryDate = new Date(this.settings.licenseExpiry);
        const now = new Date();
        
        if (expiryDate > now) {
          licenseStatus.textContent = 'Active';
          licenseStatus.style.color = '#10b981';
          licenseExpiry.textContent = expiryDate.toLocaleDateString();
        } else {
          licenseStatus.textContent = 'Expired';
          licenseStatus.style.color = '#ef4444';
          licenseExpiry.textContent = expiryDate.toLocaleDateString();
        }
      } else {
        licenseStatus.textContent = 'Lifetime';
        licenseStatus.style.color = '#10b981';
        licenseExpiry.textContent = 'Never';
      }
    }
  }

  async authenticate() {
    try {
      const authButton = document.getElementById('authButton');
      if (authButton) {
        authButton.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
          </svg>
          Signing in...
        `;
        authButton.disabled = true;
      }

      const response = await chrome.runtime.sendMessage({ action: 'authenticateUser' });
      
      if (response && response.success) {
        await this.loadSettings();
        this.isAuthenticated = true;
        this.updateUI();
      }
    } catch (error) {
      console.error('SendShield Popup: Authentication error:', error);
      this.showError('Authentication failed. Please try again.');
    } finally {
      const authButton = document.getElementById('authButton');
      if (authButton) {
        authButton.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 1.2-.4 2.3-1 3.2-.6.9-1.4 1.6-2.3 2.1-.9.5-1.9.7-2.9.7H7.8c-1.2 0-2.3-.5-3.1-1.4C3.9 15.7 3.5 14.6 3.5 13.4c0-1.2.4-2.3 1.2-3.2.8-.9 1.9-1.4 3.1-1.4.6 0 1.2.1 1.7.4"/>
          </svg>
          Sign in with Google
        `;
        authButton.disabled = false;
      }
    }
  }

  async startDemoMode() {
    this.settings.demoMode = true;
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { demoMode: true }
      });
      
      this.updateUI();
    } catch (error) {
      console.error('SendShield Popup: Error starting demo mode:', error);
    }
  }

  async updateDelayTime(delayTime) {
    this.settings.delayTime = delayTime;
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { delayTime }
      });
      
      this.updateDelayTimeUI();
    } catch (error) {
      console.error('SendShield Popup: Error updating delay time:', error);
    }
  }

  async updateEnabled(enabled) {
    this.settings.isEnabled = enabled;
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { isEnabled: enabled }
      });
      
      this.updateUI();
    } catch (error) {
      console.error('SendShield Popup: Error updating enabled status:', error);
    }
  }

  async updateSmartDelay(enabled) {
    this.settings.smartDelay = { ...this.settings.smartDelay, enabled };
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { smartDelay: this.settings.smartDelay }
      });
    } catch (error) {
      console.error('SendShield Popup: Error updating smart delay:', error);
    }
  }

  async updateNotificationSetting(type, enabled) {
    this.settings.notifications = { ...this.settings.notifications, [type]: enabled };
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { notifications: this.settings.notifications }
      });
    } catch (error) {
      console.error('SendShield Popup: Error updating notification setting:', error);
    }
  }

  async loadDetailedStatistics() {
    try {
      // Get detailed usage data from storage
      const result = await chrome.storage.local.get();
      
      let monthlyStats = { delayed: 0, cancelled: 0, sent: 0 };
      let weeklyStats = { delayed: 0, cancelled: 0, sent: 0 };
      const currentMonth = new Date().getMonth();
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      Object.keys(result).forEach(key => {
        if (key.startsWith('usage_')) {
          const data = result[key];
          const dataDate = new Date(data.timestamp);
          
          // Monthly stats
          if (dataDate.getMonth() === currentMonth) {
            if (data.type === 'emailDelayed') monthlyStats.delayed++;
            else if (data.type === 'emailCancelled') monthlyStats.cancelled++;
            else if (data.type === 'emailSent') monthlyStats.sent++;
          }
          
          // Weekly stats
          if (data.timestamp > weekAgo) {
            if (data.type === 'emailDelayed') weeklyStats.delayed++;
            else if (data.type === 'emailCancelled') weeklyStats.cancelled++;
            else if (data.type === 'emailSent') weeklyStats.sent++;
          }
        }
      });
      
      // Update detailed stats display if elements exist
      const monthlyDelayedEl = document.getElementById('monthlyDelayed');
      const weeklyCancelledEl = document.getElementById('weeklyCancelled');
      
      if (monthlyDelayedEl) monthlyDelayedEl.textContent = monthlyStats.delayed;
      if (weeklyCancelledEl) weeklyCancelledEl.textContent = weeklyStats.cancelled;
      
    } catch (error) {
      console.error('SendShield Popup: Error loading detailed statistics:', error);
    }
  }

  async exportData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'exportData' });
      if (response && response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sendshield-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('SendShield Popup: Error exporting data:', error);
      this.showError('Failed to export data');
    }
  }

  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          const response = await chrome.runtime.sendMessage({
            action: 'importData',
            data: data
          });
          
          if (response && response.success) {
            await this.loadSettings();
            await this.loadStats();
            this.updateUI();
            this.showSuccess('Data imported successfully');
          }
        } catch (error) {
          console.error('SendShield Popup: Error importing data:', error);
          this.showError('Failed to import data');
        }
      }
    };
    
    input.click();
  }

  showError(message) {
    // Simple error display - could be enhanced with better UI
    console.error('SendShield Popup:', message);
    alert(message);
  }

  showSuccess(message) {
    // Simple success display - could be enhanced with better UI
    console.log('SendShield Popup:', message);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SendShieldPopup();
});

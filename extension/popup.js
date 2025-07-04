
// Email Magic: SendShield Popup Script
class SendShieldPopup {
  constructor() {
    this.settings = {
      delayTime: 60,
      isEnabled: true,
      userId: null,
      licenseKey: null,
      licenseExpiry: null
    };
    
    this.isAuthenticated = false;
    this.init();
  }

  async init() {
    // Load settings from background
    await this.loadSettings();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI based on authentication status
    this.updateUI();
    
    // Load usage statistics
    await this.loadStatistics();
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response.settings) {
        this.settings = response.settings;
        this.isAuthenticated = !!this.settings.userId;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  setupEventListeners() {
    // Authentication button
    const authButton = document.getElementById('authButton');
    if (authButton) {
      authButton.addEventListener('click', () => this.authenticate());
    }

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
  }

  updateUI() {
    const authSection = document.getElementById('authSection');
    const settingsSection = document.getElementById('settingsSection');
    const licenseSection = document.getElementById('licenseSection');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');

    if (this.isAuthenticated) {
      // Show settings, hide auth
      authSection.style.display = 'none';
      settingsSection.style.display = 'block';
      licenseSection.style.display = 'block';
      
      // Update delay time selection
      this.updateDelayTimeUI();
      
      // Update enable toggle
      const enableToggle = document.getElementById('enableToggle');
      if (enableToggle) {
        enableToggle.checked = this.settings.isEnabled;
      }
      
      // Update license info
      this.updateLicenseInfo();
      
      // Update status
      if (this.settings.isEnabled) {
        statusText.textContent = 'Active';
        statusDot.style.background = '#10b981';
      } else {
        statusText.textContent = 'Disabled';
        statusDot.style.background = '#ef4444';
      }
    } else {
      // Show auth, hide settings
      authSection.style.display = 'block';
      settingsSection.style.display = 'none';
      licenseSection.style.display = 'none';
      
      statusText.textContent = 'Not Signed In';
      statusDot.style.background = '#f59e0b';
    }
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
        authButton.textContent = 'Signing in...';
        authButton.disabled = true;
      }

      const response = await chrome.runtime.sendMessage({ action: 'authenticateUser' });
      
      if (response.success) {
        await this.loadSettings();
        this.isAuthenticated = true;
        this.updateUI();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      const authButton = document.getElementById('authButton');
      if (authButton) {
        authButton.textContent = 'Sign in with Google';
        authButton.disabled = false;
      }
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
      console.error('Error updating delay time:', error);
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
      console.error('Error updating enabled status:', error);
    }
  }

  async loadStatistics() {
    try {
      // Get usage statistics from storage
      const result = await chrome.storage.local.get();
      
      let delayedCount = 0;
      let touchedCount = 0;
      const currentMonth = new Date().getMonth();
      
      Object.keys(result).forEach(key => {
        if (key.startsWith('usage_')) {
          const data = result[key];
          const dataDate = new Date(data.timestamp);
          
          if (dataDate.getMonth() === currentMonth) {
            if (data.type === 'emailDelayed') {
              delayedCount++;
            } else if (data.type === 'emailTouched' || data.type === 'emailCancelled') {
              touchedCount++;
            }
          }
        }
      });
      
      // Update UI
      const delayedCountEl = document.getElementById('delayedCount');
      const touchedCountEl = document.getElementById('touchedCount');
      
      if (delayedCountEl) delayedCountEl.textContent = delayedCount;
      if (touchedCountEl) touchedCountEl.textContent = touchedCount;
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SendShieldPopup();
});


// Background script for Email Magic: SendShield
class SendShieldBackground {
  constructor() {
    this.delayedEmails = new Map();
    this.userSettings = {
      delayTime: 60, // Default 60 seconds
      isEnabled: true,
      userId: null,
      licenseKey: null,
      licenseExpiry: null
    };
    
    this.init();
  }

  async init() {
    // Load user settings from storage
    await this.loadSettings();
    
    // Set up message listeners
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });

    // Set up alarm listener for delayed emails
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name.startsWith('sendEmail_')) {
        this.sendDelayedEmail(alarm.name);
      }
    });

    // Check license status on startup
    this.checkLicenseStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'delayTime', 'isEnabled', 'userId', 'licenseKey', 'licenseExpiry'
      ]);
      
      this.userSettings = {
        delayTime: result.delayTime || 60,
        isEnabled: result.isEnabled !== false,
        userId: result.userId || null,
        licenseKey: result.licenseKey || null,
        licenseExpiry: result.licenseExpiry || null
      };
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.userSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'delayEmail':
        await this.delayEmail(request.data);
        sendResponse({ success: true });
        break;
        
      case 'cancelEmail':
        this.cancelDelayedEmail(request.emailId);
        sendResponse({ success: true });
        break;
        
      case 'getSettings':
        sendResponse({ settings: this.userSettings });
        break;
        
      case 'updateSettings':
        this.userSettings = { ...this.userSettings, ...request.settings };
        await this.saveSettings();
        sendResponse({ success: true });
        break;
        
      case 'authenticateUser':
        await this.authenticateUser();
        sendResponse({ success: true });
        break;
        
      case 'trackUsage':
        await this.trackUsage(request.data);
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async delayEmail(emailData) {
    if (!this.userSettings.isEnabled) {
      return;
    }

    const emailId = this.generateEmailId();
    const delayTime = this.userSettings.delayTime * 1000; // Convert to milliseconds
    
    // Store email data temporarily
    this.delayedEmails.set(emailId, {
      ...emailData,
      scheduledTime: Date.now() + delayTime,
      touches: 0
    });

    // Create alarm for sending
    chrome.alarms.create(`sendEmail_${emailId}`, {
      delayInMinutes: this.userSettings.delayTime / 60
    });

    // Track delayed email
    await this.trackUsage({
      type: 'emailDelayed',
      timestamp: Date.now(),
      delayTime: this.userSettings.delayTime
    });

    return emailId;
  }

  cancelDelayedEmail(emailId) {
    if (this.delayedEmails.has(emailId)) {
      // Cancel the alarm
      chrome.alarms.clear(`sendEmail_${emailId}`);
      
      // Remove from delayed emails
      this.delayedEmails.delete(emailId);
      
      // Track cancellation
      this.trackUsage({
        type: 'emailCancelled',
        timestamp: Date.now(),
        emailId
      });
    }
  }

  async sendDelayedEmail(alarmName) {
    const emailId = alarmName.replace('sendEmail_', '');
    const emailData = this.delayedEmails.get(emailId);
    
    if (emailData) {
      // Send message to content script to actually send the email
      try {
        const tabs = await chrome.tabs.query({ 
          url: 'https://mail.google.com/*',
          active: true
        });
        
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'sendEmail',
            emailData: emailData
          });
        }
      } catch (error) {
        console.error('Error sending delayed email:', error);
      }
      
      // Clean up
      this.delayedEmails.delete(emailId);
      
      // Track sent email
      this.trackUsage({
        type: 'emailSent',
        timestamp: Date.now(),
        emailId,
        touches: emailData.touches
      });
    }
  }

  async authenticateUser() {
    try {
      // Use Chrome's identity API for OAuth
      const token = await chrome.identity.getAuthToken({ interactive: true });
      
      if (token) {
        // Verify with backend (you'll need to implement this)
        const userInfo = await this.verifyUserToken(token);
        
        this.userSettings.userId = userInfo.id;
        await this.saveSettings();
        
        return userInfo;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async verifyUserToken(token) {
    // This would connect to your backend to verify the user's license
    // For now, return mock data
    return {
      id: 'user_' + Date.now(),
      email: 'user@example.com',
      licenseValid: true,
      licenseExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  async checkLicenseStatus() {
    if (this.userSettings.licenseExpiry && Date.now() > this.userSettings.licenseExpiry) {
      this.userSettings.isEnabled = false;
      await this.saveSettings();
    }
  }

  async trackUsage(data) {
    try {
      // Store usage data locally
      const usageKey = `usage_${Date.now()}`;
      await chrome.storage.local.set({ [usageKey]: data });
      
      // You could also send to your analytics backend here
      console.log('Usage tracked:', data);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  generateEmailId() {
    return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize the background script
new SendShieldBackground();

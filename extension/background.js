
// Background script for Email Magic: SendShield
class SendShieldBackground {
  constructor() {
    this.delayedEmails = new Map();
    this.userSettings = {
      delayTime: 60,
      isEnabled: true,
      userId: null,
      licenseKey: null,
      licenseExpiry: null,
      demoMode: true,
      customDelayTimes: [15, 30, 60, 120, 300], // 15s, 30s, 1m, 2m, 5m
      notifications: {
        sound: true,
        desktop: true,
        inGmail: true
      },
      smartDelay: {
        enabled: false,
        afterHours: true,
        weekends: true,
        increasedDelay: 300 // 5 minutes for after hours
      }
    };
    
    this.usageStats = {
      emailsDelayed: 0,
      emailsCancelled: 0,
      emailsSent: 0,
      mistakesPrevented: 0,
      totalTimeSaved: 0
    };
    
    this.init();
  }

  async init() {
    console.log('SendShield: Background script initializing');
    
    // Load settings and stats
    await this.loadSettings();
    await this.loadUsageStats();
    
    // Set up message listeners
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });

    // Set up alarm listener for delayed emails
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name.startsWith('sendEmail_')) {
        this.sendDelayedEmail(alarm.name);
      }
    });

    // Set up periodic cleanup
    chrome.alarms.create('cleanup', { periodInMinutes: 60 });
    
    // Check license status periodically (only if not in demo mode)
    if (!this.userSettings.demoMode) {
      chrome.alarms.create('licenseCheck', { periodInMinutes: 1440 }); // Daily
    }

    // Update badge
    this.updateBadge();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'delayTime', 'isEnabled', 'userId', 'licenseKey', 'licenseExpiry', 
        'demoMode', 'customDelayTimes', 'notifications', 'smartDelay'
      ]);
      
      this.userSettings = {
        ...this.userSettings,
        ...result
      };
      
      console.log('SendShield: Settings loaded', this.userSettings);
    } catch (error) {
      console.error('SendShield: Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.userSettings);
      console.log('SendShield: Settings saved');
    } catch (error) {
      console.error('SendShield: Error saving settings:', error);
    }
  }

  async loadUsageStats() {
    try {
      const result = await chrome.storage.local.get(['usageStats']);
      if (result.usageStats) {
        this.usageStats = { ...this.usageStats, ...result.usageStats };
      }
    } catch (error) {
      console.error('SendShield: Error loading usage stats:', error);
    }
  }

  async saveUsageStats() {
    try {
      await chrome.storage.local.set({ usageStats: this.usageStats });
    } catch (error) {
      console.error('SendShield: Error saving usage stats:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'delayEmail':
          const emailId = await this.delayEmail(request.data);
          sendResponse({ success: true, emailId });
          break;
          
        case 'cancelEmail':
          await this.cancelDelayedEmail(request.emailId);
          sendResponse({ success: true });
          break;
          
        case 'getSettings':
          sendResponse({ settings: this.userSettings });
          break;
          
        case 'updateSettings':
          await this.updateSettings(request.settings);
          sendResponse({ success: true });
          break;
          
        case 'getUsageStats':
          sendResponse({ stats: this.usageStats });
          break;
          
        case 'authenticateUser':
          const authResult = await this.authenticateUser();
          sendResponse({ success: true, user: authResult });
          break;
          
        case 'trackUsage':
          await this.trackUsage(request.data);
          sendResponse({ success: true });
          break;

        case 'exportData':
          const exportData = await this.exportUserData();
          sendResponse({ success: true, data: exportData });
          break;

        case 'importData':
          await this.importUserData(request.data);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown action: ' + request.action });
      }
    } catch (error) {
      console.error('SendShield: Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async delayEmail(emailData) {
    if (!this.userSettings.isEnabled) {
      throw new Error('SendShield is disabled');
    }

    const emailId = this.generateEmailId();
    const effectiveDelayTime = this.calculateEffectiveDelay(emailData);
    
    // Store email data
    const delayedEmail = {
      id: emailId,
      ...emailData,
      scheduledTime: Date.now() + (effectiveDelayTime * 1000),
      delayTime: effectiveDelayTime,
      demoMode: this.userSettings.demoMode,
      cancelled: false
    };
    
    this.delayedEmails.set(emailId, delayedEmail);

    // Create alarm for sending
    chrome.alarms.create(`sendEmail_${emailId}`, {
      delayInMinutes: effectiveDelayTime / 60
    });

    // Update stats
    this.usageStats.emailsDelayed++;
    await this.saveUsageStats();

    // Show desktop notification if enabled
    if (this.userSettings.notifications.desktop) {
      this.showDesktopNotification(emailId, effectiveDelayTime);
    }

    // Update badge
    this.updateBadge();

    console.log(`SendShield: Email ${emailId} delayed for ${effectiveDelayTime}s`);
    return emailId;
  }

  calculateEffectiveDelay(emailData) {
    let delayTime = this.userSettings.delayTime;
    
    // Smart delay logic
    if (this.userSettings.smartDelay.enabled) {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      // After hours (before 9 AM or after 6 PM)
      if (this.userSettings.smartDelay.afterHours && (hour < 9 || hour >= 18)) {
        delayTime = Math.max(delayTime, this.userSettings.smartDelay.increasedDelay);
      }
      
      // Weekends (Saturday = 6, Sunday = 0)
      if (this.userSettings.smartDelay.weekends && (day === 0 || day === 6)) {
        delayTime = Math.max(delayTime, this.userSettings.smartDelay.increasedDelay);
      }
    }
    
    return delayTime;
  }

  async cancelDelayedEmail(emailId) {
    const emailData = this.delayedEmails.get(emailId);
    if (emailData && !emailData.cancelled) {
      // Mark as cancelled
      emailData.cancelled = true;
      
      // Cancel the alarm
      chrome.alarms.clear(`sendEmail_${emailId}`);
      
      // Update stats
      this.usageStats.emailsCancelled++;
      this.usageStats.mistakesPrevented++;
      await this.saveUsageStats();
      
      // Update badge
      this.updateBadge();
      
      console.log(`SendShield: Email ${emailId} cancelled`);
    }
  }

  async sendDelayedEmail(alarmName) {
    const emailId = alarmName.replace('sendEmail_', '');
    const emailData = this.delayedEmails.get(emailId);
    
    if (emailData && !emailData.cancelled) {
      try {
        // Find Gmail tabs
        const tabs = await chrome.tabs.query({ 
          url: 'https://mail.google.com/*'
        });
        
        // Send message to content scripts
        for (const tab of tabs) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'sendEmail',
              emailData: emailData
            });
          } catch (error) {
            console.log(`SendShield: Could not send to tab ${tab.id}:`, error);
          }
        }
        
        // Update stats
        this.usageStats.emailsSent++;
        this.usageStats.totalTimeSaved += emailData.delayTime;
        await this.saveUsageStats();
        
      } catch (error) {
        console.error('SendShield: Error sending delayed email:', error);
      }
      
      // Clean up
      this.delayedEmails.delete(emailId);
      this.updateBadge();
      
      console.log(`SendShield: Email ${emailId} sent after delay`);
    }
  }

  async updateSettings(newSettings) {
    const oldEnabled = this.userSettings.isEnabled;
    
    this.userSettings = { ...this.userSettings, ...newSettings };
    await this.saveSettings();
    
    // If extension was disabled, cancel all pending emails
    if (oldEnabled && !this.userSettings.isEnabled) {
      await this.cancelAllDelayedEmails();
    }
    
    // Update all content scripts
    const tabs = await chrome.tabs.query({ url: 'https://mail.google.com/*' });
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: this.userSettings
        });
      } catch (error) {
        console.log(`SendShield: Could not update settings for tab ${tab.id}`);
      }
    }
    
    this.updateBadge();
  }

  async cancelAllDelayedEmails() {
    for (const [emailId, emailData] of this.delayedEmails) {
      if (!emailData.cancelled) {
        await this.cancelDelayedEmail(emailId);
      }
    }
  }

  async authenticateUser() {
    try {
      // Disable demo mode when user authenticates
      this.userSettings.demoMode = false;
      await this.saveSettings();

      // Use Chrome's identity API for OAuth
      const token = await chrome.identity.getAuthToken({ interactive: true });
      
      if (token) {
        const userInfo = await this.verifyUserToken(token);
        
        this.userSettings.userId = userInfo.id;
        this.userSettings.licenseKey = userInfo.licenseKey;
        this.userSettings.licenseExpiry = userInfo.licenseExpiry;
        await this.saveSettings();
        
        return userInfo;
      }
    } catch (error) {
      console.error('SendShield: Authentication error:', error);
      // Re-enable demo mode if authentication fails
      this.userSettings.demoMode = true;
      await this.saveSettings();
      throw error;
    }
  }

  async verifyUserToken(token) {
    // In production, this would connect to your backend
    // For now, return mock data
    return {
      id: 'user_' + Date.now(),
      email: 'user@example.com',
      licenseKey: 'demo_license_' + Date.now(),
      licenseValid: true,
      licenseExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  async trackUsage(data) {
    try {
      // Store detailed usage data
      const usageKey = `usage_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await chrome.storage.local.set({ [usageKey]: data });
      
      // Update aggregate stats
      switch (data.type) {
        case 'emailDelayed':
          this.usageStats.emailsDelayed++;
          break;
        case 'emailCancelled':
          this.usageStats.emailsCancelled++;
          this.usageStats.mistakesPrevented++;
          break;
        case 'emailSent':
          this.usageStats.emailsSent++;
          if (data.delayTime) {
            this.usageStats.totalTimeSaved += data.delayTime;
          }
          break;
      }
      
      await this.saveUsageStats();
      this.updateBadge();
      
      console.log('SendShield: Usage tracked:', data);
    } catch (error) {
      console.error('SendShield: Error tracking usage:', error);
    }
  }

  showDesktopNotification(emailId, delayTime) {
    if (!this.userSettings.notifications.desktop) return;
    
    chrome.notifications.create(`sendshield_${emailId}`, {
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Email Magic: SendShield',
      message: `Email will be sent in ${delayTime} seconds. Click to cancel.`,
      buttons: [{ title: 'Cancel Email' }]
    });
    
    // Handle notification clicks
    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      if (notificationId.startsWith('sendshield_') && buttonIndex === 0) {
        const emailId = notificationId.replace('sendshield_', '');
        this.cancelDelayedEmail(emailId);
        chrome.notifications.clear(notificationId);
      }
    });
  }

  updateBadge() {
    const pendingCount = Array.from(this.delayedEmails.values())
      .filter(email => !email.cancelled).length;
    
    if (pendingCount > 0) {
      chrome.action.setBadgeText({ text: pendingCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
    
    // Update badge tooltip
    const status = this.userSettings.isEnabled ? 
      (this.userSettings.demoMode ? 'Demo Mode' : 'Active') : 'Disabled';
    chrome.action.setTitle({ title: `Email Magic: SendShield - ${status}` });
  }

  async exportUserData() {
    const usageData = await chrome.storage.local.get();
    return {
      settings: this.userSettings,
      stats: this.usageStats,
      usageData: usageData,
      exportDate: new Date().toISOString()
    };
  }

  async importUserData(data) {
    if (data.settings) {
      this.userSettings = { ...this.userSettings, ...data.settings };
      await this.saveSettings();
    }
    
    if (data.stats) {
      this.usageStats = { ...this.usageStats, ...data.stats };
      await this.saveUsageStats();
    }
    
    if (data.usageData) {
      await chrome.storage.local.set(data.usageData);
    }
  }

  generateEmailId() {
    return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize the background script
new SendShieldBackground();


// Content script for Email Magic: SendShield
class SendShieldContent {
  constructor() {
    this.isGmailLoaded = false;
    this.delayedEmails = new Map();
    this.observer = null;
    this.interceptedButtons = new Set();
    this.activeNotifications = new Map();
    this.settings = {
      delayTime: 60,
      isEnabled: true,
      demoMode: true
    };
    
    this.init();
  }

  async init() {
    console.log('SendShield: Content script initializing...');
    
    // Load settings first
    await this.loadSettings();
    
    // Wait for Gmail to load
    this.waitForGmail();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response && response.settings) {
        this.settings = response.settings;
      }
    } catch (error) {
      console.error('SendShield: Error loading settings:', error);
    }
  }

  waitForGmail() {
    const checkGmail = () => {
      const gmailIndicators = [
        document.querySelector('[data-tooltip="Compose"]'),
        document.querySelector('[aria-label*="Compose"]'),
        document.querySelector('.T-I-KE'),
        document.querySelector('div[role="main"]'),
        document.querySelector('.nH'),
        document.querySelector('[data-tooltip*="Send"]')
      ];
      
      const isGmailLoaded = gmailIndicators.some(el => el !== null);
      
      if (isGmailLoaded && !this.isGmailLoaded) {
        console.log('SendShield: Gmail detected and loaded');
        this.isGmailLoaded = true;
        this.setupGmailIntegration();
      } else if (!this.isGmailLoaded) {
        setTimeout(checkGmail, 1000);
      }
    };
    
    checkGmail();
  }

  setupGmailIntegration() {
    if (!this.settings.isEnabled) {
      console.log('SendShield: Extension is disabled');
      return;
    }

    console.log('SendShield: Setting up Gmail integration');
    
    // Set up mutation observer
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForSendButtons(node);
            this.checkForComposeWindows(node);
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial scan
    this.scanForSendButtons();
    this.scanForComposeWindows();
    
    // Periodic check
    setInterval(() => {
      this.scanForSendButtons();
      this.scanForComposeWindows();
    }, 2000);
  }

  scanForSendButtons() {
    const sendButtonSelectors = [
      '[data-tooltip="Send ⌘+Enter"]',
      '[data-tooltip="Send"]',
      '[aria-label*="Send"]',
      '.T-I-KE',
      'div[role="button"][aria-label*="Send"]',
      'div[data-tooltip*="Send"]',
      '[data-tooltip="Send (Ctrl+Enter)"]',
      '.dC .T-I',
      '.btC .T-I-KE'
    ];
    
    sendButtonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!this.interceptedButtons.has(button)) {
          this.interceptSendButton(button);
        }
      });
    });
  }

  scanForComposeWindows() {
    const composeWindows = document.querySelectorAll('[role="dialog"], .nH .M9, .dw, .Ar');
    composeWindows.forEach(window => {
      if (!window.hasAttribute('data-sendshield-monitored')) {
        window.setAttribute('data-sendshield-monitored', 'true');
        this.addComposeIndicator(window);
      }
    });
  }

  checkForSendButtons(element) {
    if (this.isSendButton(element)) {
      this.interceptSendButton(element);
    }
    
    const sendButtonSelectors = [
      '[data-tooltip="Send ⌘+Enter"]',
      '[data-tooltip="Send"]',
      '[aria-label*="Send"]',
      '.T-I-KE',
      'div[role="button"][aria-label*="Send"]',
      'div[data-tooltip*="Send"]'
    ];
    
    sendButtonSelectors.forEach(selector => {
      const buttons = element.querySelectorAll ? element.querySelectorAll(selector) : [];
      buttons.forEach(button => this.interceptSendButton(button));
    });
  }

  checkForComposeWindows(element) {
    if (element.getAttribute && (element.getAttribute('role') === 'dialog' || element.classList.contains('M9'))) {
      this.addComposeIndicator(element);
    }
  }

  isSendButton(element) {
    if (!element || !element.getAttribute) return false;
    
    const tooltip = element.getAttribute('data-tooltip') || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const className = element.className || '';
    
    return (
      tooltip.toLowerCase().includes('send') ||
      ariaLabel.toLowerCase().includes('send') ||
      className.includes('T-I-KE')
    );
  }

  interceptSendButton(sendButton) {
    if (!sendButton || this.interceptedButtons.has(sendButton)) {
      return;
    }
    
    console.log('SendShield: Intercepting send button', sendButton);
    this.interceptedButtons.add(sendButton);
    
    // Create a wrapper to intercept clicks
    const originalClick = sendButton.click.bind(sendButton);
    
    sendButton.click = () => {
      console.log('SendShield: Send button clicked - intercepting');
      this.handleSendClick(sendButton, originalClick);
    };
    
    // Also intercept direct event listeners
    sendButton.addEventListener('click', (event) => {
      if (!event.isTrusted) return; // Only intercept real user clicks
      
      console.log('SendShield: Send click event intercepted');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      this.handleSendClick(sendButton, originalClick);
    }, true);
  }

  async handleSendClick(sendButton, originalSendFunction) {
    console.log('SendShield: Processing send click');
    
    if (!this.settings.isEnabled) {
      console.log('SendShield: Extension disabled, sending immediately');
      originalSendFunction();
      return;
    }
    
    // Extract email data
    const emailData = this.extractEmailData(sendButton);
    
    if (!emailData) {
      console.log('SendShield: No email data found, sending immediately');
      originalSendFunction();
      return;
    }
    
    console.log('SendShield: Email data extracted, initiating delay');
    
    // Generate unique email ID
    const emailId = this.generateEmailId();
    emailData.id = emailId;
    emailData.originalSendFunction = originalSendFunction;
    emailData.sendButton = sendButton;
    
    // Store delayed email
    this.delayedEmails.set(emailId, emailData);
    
    try {
      // Notify background script
      const response = await chrome.runtime.sendMessage({
        action: 'delayEmail',
        data: emailData
      });
      
      if (response && response.success) {
        // Show delay notification
        this.showDelayNotification(emailData);
        
        // Start countdown
        this.startEmailDelay(emailId);
        
        // Track usage
        await chrome.runtime.sendMessage({
          action: 'trackUsage',
          data: {
            type: 'emailDelayed',
            timestamp: Date.now(),
            delayTime: this.settings.delayTime,
            demoMode: this.settings.demoMode
          }
        });
      } else {
        console.error('SendShield: Failed to delay email');
        originalSendFunction();
      }
    } catch (error) {
      console.error('SendShield: Error delaying email:', error);
      originalSendFunction();
    }
  }

  extractEmailData(sendButton) {
    try {
      const composeWindow = sendButton.closest('[role="dialog"]') || 
                           sendButton.closest('.nH') ||
                           sendButton.closest('.Ar') ||
                           sendButton.closest('.dw');
      
      if (!composeWindow) {
        console.log('SendShield: No compose window found');
        return null;
      }

      // Extract recipient information
      const toField = composeWindow.querySelector('[aria-label*="To"]') ||
                     composeWindow.querySelector('input[name="to"]') ||
                     composeWindow.querySelector('.vR') ||
                     composeWindow.querySelector('[name="to"]');
      
      // Extract subject
      const subjectField = composeWindow.querySelector('[aria-label*="Subject"]') ||
                          composeWindow.querySelector('input[name="subject"]') ||
                          composeWindow.querySelector('.aoT') ||
                          composeWindow.querySelector('[name="subjectbox"]');
      
      // Extract body (for analytics only, not stored)
      const bodyField = composeWindow.querySelector('[aria-label*="Message Body"]') ||
                       composeWindow.querySelector('.Ar .Am') ||
                       composeWindow.querySelector('[contenteditable="true"]');
      
      const recipients = toField ? (toField.value || toField.textContent || toField.innerText || '') : '';
      const subject = subjectField ? (subjectField.value || subjectField.textContent || subjectField.innerText || '') : '';
      const hasBody = bodyField ? (bodyField.textContent || bodyField.innerText || '').trim().length > 0 : false;
      
      console.log('SendShield: Email data extracted', {
        hasRecipients: recipients.length > 0,
        hasSubject: subject.length > 0,
        hasBody: hasBody
      });
      
      return {
        timestamp: Date.now(),
        hasRecipients: recipients.length > 0,
        hasSubject: subject.length > 0,
        hasBody: hasBody,
        recipientCount: recipients.split(',').filter(r => r.trim()).length,
        composeWindowId: this.generateComposeId(composeWindow)
      };
    } catch (error) {
      console.error('SendShield: Error extracting email data:', error);
      return null;
    }
  }

  showDelayNotification(emailData) {
    // Remove any existing notification for this email
    const existingNotification = this.activeNotifications.get(emailData.id);
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'sendshield-delay-notification';
    notification.setAttribute('data-email-id', emailData.id);
    
    notification.innerHTML = `
      <div class="sendshield-notification-content">
        <div class="sendshield-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="sendshield-text">
          <div class="sendshield-brand">Email Magic: SendShield</div>
          <div class="sendshield-timer" id="timer-${emailData.id}">${this.settings.delayTime}s</div>
        </div>
        <button class="sendshield-cancel" data-email-id="${emailData.id}">Cancel</button>
      </div>
    `;

    document.body.appendChild(notification);
    this.activeNotifications.set(emailData.id, notification);

    // Add cancel button listener
    const cancelButton = notification.querySelector('.sendshield-cancel');
    cancelButton.addEventListener('click', () => {
      this.cancelEmail(emailData.id);
    });

    // Start visual countdown
    this.startVisualCountdown(emailData.id);
  }

  startEmailDelay(emailId) {
    const delayMs = this.settings.delayTime * 1000;
    
    setTimeout(() => {
      const emailData = this.delayedEmails.get(emailId);
      if (emailData) {
        console.log('SendShield: Delay completed, sending email');
        
        // Remove notification
        const notification = this.activeNotifications.get(emailId);
        if (notification) {
          notification.remove();
          this.activeNotifications.delete(emailId);
        }
        
        // Send the email
        if (emailData.originalSendFunction) {
          emailData.originalSendFunction();
        }
        
        // Clean up
        this.delayedEmails.delete(emailId);
        
        // Track sent email
        chrome.runtime.sendMessage({
          action: 'trackUsage',
          data: {
            type: 'emailSent',
            timestamp: Date.now(),
            emailId: emailId,
            delayTime: this.settings.delayTime
          }
        });
      }
    }, delayMs);
  }

  startVisualCountdown(emailId) {
    const timerElement = document.getElementById(`timer-${emailId}`);
    if (!timerElement) return;

    let remaining = this.settings.delayTime;
    
    const interval = setInterval(() => {
      remaining--;
      if (timerElement) {
        timerElement.textContent = `${remaining}s`;
      }
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  async cancelEmail(emailId) {
    console.log('SendShield: Cancelling email', emailId);
    
    const emailData = this.delayedEmails.get(emailId);
    if (emailData) {
      // Remove from delayed emails
      this.delayedEmails.delete(emailId);
      
      // Remove notification
      const notification = this.activeNotifications.get(emailId);
      if (notification) {
        notification.remove();
        this.activeNotifications.delete(emailId);
      }
      
      // Notify background script
      try {
        await chrome.runtime.sendMessage({
          action: 'cancelEmail',
          emailId: emailId
        });

        // Track cancellation
        await chrome.runtime.sendMessage({
          action: 'trackUsage',
          data: {
            type: 'emailCancelled',
            timestamp: Date.now(),
            emailId: emailId,
            delayTime: this.settings.delayTime
          }
        });
      } catch (error) {
        console.error('SendShield: Error cancelling email:', error);
      }
    }
  }

  addComposeIndicator(composeWindow) {
    if (!this.settings.isEnabled || composeWindow.querySelector('.sendshield-compose-indicator')) {
      return;
    }

    const indicator = document.createElement('div');
    indicator.className = 'sendshield-compose-indicator';
    indicator.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Protected by SendShield</span>
    `;

    // Try to find a good place to insert the indicator
    const footer = composeWindow.querySelector('.btC') || 
                  composeWindow.querySelector('.nH') ||
                  composeWindow.querySelector('.Ar');
    
    if (footer) {
      footer.appendChild(indicator);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'sendEmail':
        await this.sendDelayedEmail(request.emailData);
        sendResponse({ success: true });
        break;
        
      case 'updateSettings':
        this.settings = { ...this.settings, ...request.settings };
        if (!this.settings.isEnabled) {
          this.cleanupAllNotifications();
        }
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async sendDelayedEmail(emailData) {
    console.log('SendShield: Executing delayed send for email:', emailData.id);
    
    const storedEmailData = this.delayedEmails.get(emailData.id);
    if (storedEmailData && storedEmailData.originalSendFunction) {
      storedEmailData.originalSendFunction();
    }
    
    // Clean up
    this.delayedEmails.delete(emailData.id);
    const notification = this.activeNotifications.get(emailData.id);
    if (notification) {
      notification.remove();
      this.activeNotifications.delete(emailData.id);
    }
  }

  cleanupAllNotifications() {
    this.activeNotifications.forEach((notification, emailId) => {
      notification.remove();
      this.delayedEmails.delete(emailId);
    });
    this.activeNotifications.clear();
  }

  generateEmailId() {
    return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateComposeId(composeWindow) {
    return 'compose_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SendShieldContent());
} else {
  new SendShieldContent();
}


// Content script for Email Magic: SendShield
class SendShieldContent {
  constructor() {
    this.isGmailLoaded = false;
    this.delayedEmails = new Map();
    this.observer = null;
    this.interceptedButtons = new Set();
    
    this.init();
  }

  async init() {
    console.log('SendShield: Content script initializing...');
    
    // Wait for Gmail to load
    this.waitForGmail();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  waitForGmail() {
    const checkGmail = () => {
      // More comprehensive Gmail detection
      const gmailIndicators = [
        document.querySelector('[data-tooltip="Compose"]'),
        document.querySelector('[aria-label*="Compose"]'),
        document.querySelector('.T-I-KE'), // Gmail compose button class
        document.querySelector('div[role="main"]'), // Gmail main content
        document.querySelector('.nH') // Gmail container
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
    console.log('SendShield: Setting up Gmail integration');
    
    // Set up mutation observer to watch for compose windows and send buttons
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForSendButtons(node);
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Check for existing send buttons
    this.checkForExistingSendButtons();
    
    // Also set up a periodic check for new send buttons
    setInterval(() => {
      this.checkForExistingSendButtons();
    }, 2000);
  }

  checkForExistingSendButtons() {
    // Multiple selectors to catch different Gmail send button variations
    const sendButtonSelectors = [
      '[data-tooltip="Send ⌘+Enter"]',
      '[data-tooltip="Send"]',
      '[aria-label*="Send"]',
      '.T-I-KE', // Gmail send button class
      'div[role="button"][aria-label*="Send"]',
      'div[data-tooltip*="Send"]'
    ];
    
    sendButtonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => this.interceptSendButton(button));
    });
  }

  checkForSendButtons(element) {
    // Check if the element itself is a send button
    if (this.isSendButton(element)) {
      this.interceptSendButton(element);
    }
    
    // Check for send buttons within the element
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

  isSendButton(element) {
    if (!element || !element.getAttribute) return false;
    
    const tooltip = element.getAttribute('data-tooltip') || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const className = element.className || '';
    
    return (
      tooltip.includes('Send') ||
      ariaLabel.includes('Send') ||
      className.includes('T-I-KE')
    );
  }

  interceptSendButton(sendButton) {
    if (!sendButton || this.interceptedButtons.has(sendButton)) {
      return;
    }
    
    console.log('SendShield: Intercepting send button', sendButton);
    this.interceptedButtons.add(sendButton);
    
    // Store original click handlers
    const originalOnClick = sendButton.onclick;
    const originalEventListeners = [];
    
    // Remove existing click listeners and add our own
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);
    
    // Add our click handler
    newSendButton.addEventListener('click', async (event) => {
      console.log('SendShield: Send button clicked - intercepting');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      try {
        await this.handleSendClick(newSendButton, originalOnClick);
      } catch (error) {
        console.error('SendShield: Error handling send click:', error);
        // Fallback to original behavior if our handler fails
        if (originalOnClick) {
          originalOnClick.call(newSendButton, event);
        }
      }
    }, true);
    
    // Mark as intercepted
    this.interceptedButtons.add(newSendButton);
  }

  async handleSendClick(sendButton, originalHandler) {
    console.log('SendShield: Processing send click');
    
    // Get email data
    const emailData = this.extractEmailData(sendButton);
    
    if (emailData) {
      console.log('SendShield: Email data extracted, showing delay notification');
      
      // Show delay notification
      const notification = this.showDelayNotification(sendButton, emailData);
      
      // Send to background script for processing
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'delayEmail',
          data: emailData
        });
        
        if (response && response.success) {
          console.log('SendShield: Email delay initiated successfully');
          
          // Start the actual delay countdown
          setTimeout(() => {
            console.log('SendShield: Delay completed, sending email');
            // Remove notification
            if (notification && notification.parentNode) {
              notification.remove();
            }
            // Execute original send behavior
            if (originalHandler) {
              originalHandler.call(sendButton);
            } else {
              // Trigger Gmail's send mechanism
              sendButton.click();
            }
          }, 60000); // 60 seconds delay
          
        } else {
          console.error('SendShield: Failed to delay email');
          // Fallback to immediate send
          if (originalHandler) {
            originalHandler.call(sendButton);
          }
        }
      } catch (error) {
        console.error('SendShield: Error communicating with background script:', error);
        // Fallback to immediate send
        if (originalHandler) {
          originalHandler.call(sendButton);
        }
      }
    } else {
      console.log('SendShield: No email data found, proceeding with normal send');
      // No email data, proceed normally
      if (originalHandler) {
        originalHandler.call(sendButton);
      }
    }
  }

  extractEmailData(sendButton) {
    try {
      const composeWindow = sendButton.closest('[role="dialog"]') || 
                           sendButton.closest('.nH') ||
                           sendButton.closest('.Ar');
      
      if (!composeWindow) {
        console.log('SendShield: No compose window found');
        return null;
      }

      // Extract basic email information (not content for privacy)
      const toField = composeWindow.querySelector('[aria-label*="To"]') ||
                     composeWindow.querySelector('input[name="to"]') ||
                     composeWindow.querySelector('.vR');
      
      const subjectField = composeWindow.querySelector('[aria-label*="Subject"]') ||
                          composeWindow.querySelector('input[name="subject"]') ||
                          composeWindow.querySelector('.aoT');
      
      console.log('SendShield: Email data extracted', {
        hasRecipients: toField ? toField.value?.length > 0 : false,
        hasSubject: subjectField ? subjectField.value?.length > 0 : false
      });
      
      return {
        id: this.generateEmailId(),
        timestamp: Date.now(),
        hasRecipients: toField ? (toField.value?.length > 0 || toField.textContent?.length > 0) : false,
        hasSubject: subjectField ? (subjectField.value?.length > 0 || subjectField.textContent?.length > 0) : false,
        composeWindowId: this.generateComposeId(composeWindow)
      };
    } catch (error) {
      console.error('SendShield: Error extracting email data:', error);
      return null;
    }
  }

  showDelayNotification(sendButton, emailData) {
    const composeWindow = sendButton.closest('[role="dialog"]') || 
                         sendButton.closest('.nH') ||
                         document.body;

    // Create delay notification
    const notification = document.createElement('div');
    notification.className = 'sendshield-delay-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1a73e8;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 280px;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div>
          <div style="font-weight: 500;">Email Magic: SendShield</div>
          <div style="font-size: 12px; opacity: 0.9;">Email will send in <span id="timer-${emailData.id}">60</span>s</div>
        </div>
      </div>
      <button style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-left: auto;
      " data-email-id="${emailData.id}">Cancel</button>
    `;

    document.body.appendChild(notification);

    // Start countdown timer
    this.startCountdown(emailData.id, 60);

    // Add cancel button listener
    const cancelButton = notification.querySelector('button');
    cancelButton.addEventListener('click', () => {
      this.cancelEmail(emailData.id);
      notification.remove();
    });

    return notification;
  }

  startCountdown(emailId, seconds) {
    const timerElement = document.getElementById(`timer-${emailId}`);
    if (!timerElement) return;

    let remaining = seconds;
    
    const interval = setInterval(() => {
      remaining--;
      if (timerElement) {
        timerElement.textContent = remaining;
      }
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    // Store interval reference for potential cancellation
    this.delayedEmails.set(emailId, { interval, timerElement });
  }

  async cancelEmail(emailId) {
    console.log('SendShield: Cancelling email', emailId);
    
    // Clear local timer
    const emailData = this.delayedEmails.get(emailId);
    if (emailData) {
      clearInterval(emailData.interval);
      this.delayedEmails.delete(emailId);
    }
    
    // Notify background script
    try {
      await chrome.runtime.sendMessage({
        action: 'cancelEmail',
        emailId: emailId
      });

      // Track the cancellation
      await chrome.runtime.sendMessage({
        action: 'trackUsage',
        data: {
          type: 'emailTouched',
          timestamp: Date.now(),
          emailId: emailId,
          action: 'cancelled'
        }
      });
    } catch (error) {
      console.error('SendShield: Error cancelling email:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'sendEmail':
        await this.sendEmail(request.emailData);
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async sendEmail(emailData) {
    console.log('SendShield: Executing delayed send for email:', emailData.id);
    
    const notification = document.querySelector(`[data-email-id="${emailData.id}"]`);
    if (notification) {
      notification.closest('.sendshield-delay-notification').remove();
    }
  }

  generateEmailId() {
    return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateComposeId(composeWindow) {
    return 'compose_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SendShieldContent());
} else {
  new SendShieldContent();
}

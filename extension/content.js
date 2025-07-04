
// Content script for Email Magic: SendShield
class SendShieldContent {
  constructor() {
    this.isGmailLoaded = false;
    this.delayedEmails = new Map();
    this.observer = null;
    
    this.init();
  }

  async init() {
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
      const composeButton = document.querySelector('[data-tooltip="Compose"]') || 
                           document.querySelector('[role="button"][aria-label*="Compose"]');
      
      if (composeButton && !this.isGmailLoaded) {
        this.isGmailLoaded = true;
        this.setupGmailIntegration();
      } else if (!this.isGmailLoaded) {
        setTimeout(checkGmail, 1000);
      }
    };
    
    checkGmail();
  }

  setupGmailIntegration() {
    console.log('Email Magic: SendShield - Gmail integration loaded');
    
    // Set up mutation observer to watch for compose windows
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForComposeWindow(node);
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Check for existing compose windows
    this.checkForExistingComposeWindows();
  }

  checkForExistingComposeWindows() {
    const composeWindows = document.querySelectorAll('[role="dialog"]');
    composeWindows.forEach(window => this.checkForComposeWindow(window));
  }

  checkForComposeWindow(element) {
    // Look for send buttons in compose windows
    const sendButtons = element.querySelectorAll('[data-tooltip="Send"], [aria-label*="Send"]');
    
    sendButtons.forEach(button => {
      if (!button.dataset.sendShieldInitialized) {
        this.initializeSendButton(button);
        button.dataset.sendShieldInitialized = 'true';
      }
    });
  }

  initializeSendButton(sendButton) {
    const originalSend = sendButton.onclick;
    
    sendButton.onclick = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get email data
      const emailData = this.extractEmailData(sendButton);
      
      if (emailData) {
        // Show delay notification
        const delayNotification = this.showDelayNotification(sendButton, emailData);
        
        // Send to background script for processing
        const response = await chrome.runtime.sendMessage({
          action: 'delayEmail',
          data: emailData
        });
        
        if (response.success) {
          console.log('Email delayed successfully');
        }
      }
    };
  }

  extractEmailData(sendButton) {
    try {
      const composeWindow = sendButton.closest('[role="dialog"]');
      if (!composeWindow) return null;

      // Extract basic email information (not content for privacy)
      const toField = composeWindow.querySelector('[aria-label*="To"]');
      const subjectField = composeWindow.querySelector('[aria-label*="Subject"]');
      
      return {
        id: this.generateEmailId(),
        timestamp: Date.now(),
        hasRecipients: toField ? toField.value.length > 0 : false,
        hasSubject: subjectField ? subjectField.value.length > 0 : false,
        composeWindowId: this.generateComposeId(composeWindow)
      };
    } catch (error) {
      console.error('Error extracting email data:', error);
      return null;
    }
  }

  showDelayNotification(sendButton, emailData) {
    const composeWindow = sendButton.closest('[role="dialog"]');
    if (!composeWindow) return;

    // Create delay notification
    const notification = document.createElement('div');
    notification.className = 'sendshield-delay-notification';
    notification.innerHTML = `
      <div class="sendshield-notification-content">
        <div class="sendshield-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="sendshield-text">
          <span class="sendshield-brand">Email Magic: SendShield</span>
          <span class="sendshield-timer" id="timer-${emailData.id}">60s</span>
        </div>
        <button class="sendshield-cancel" data-email-id="${emailData.id}">Cancel</button>
      </div>
    `;

    // Position notification
    const composeFooter = composeWindow.querySelector('[role="button"][aria-label*="Send"]')?.parentElement;
    if (composeFooter) {
      composeFooter.appendChild(notification);
    }

    // Start countdown timer
    this.startCountdown(emailData.id, 60);

    // Add cancel button listener
    const cancelButton = notification.querySelector('.sendshield-cancel');
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
      timerElement.textContent = `${remaining}s`;
      
      if (remaining <= 0) {
        clearInterval(interval);
        // Notification will be removed by the actual send process
      }
    }, 1000);
    
    // Store interval reference for potential cancellation
    this.delayedEmails.set(emailId, { interval, timerElement });
  }

  async cancelEmail(emailId) {
    // Clear local timer
    const emailData = this.delayedEmails.get(emailId);
    if (emailData) {
      clearInterval(emailData.interval);
      this.delayedEmails.delete(emailId);
    }
    
    // Notify background script
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
    // This would trigger the actual email send
    // For now, just log and remove notification
    console.log('Sending delayed email:', emailData.id);
    
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

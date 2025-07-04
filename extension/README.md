
# Email Magic: SendShield Chrome Extension

A premium Gmail extension that automatically delays emails for 60 seconds, preventing mistakes and regret.

## Features

- **Smart Delay Technology**: Automatically delays emails for customizable time (15s-2min)
- **Enterprise Security**: Zero email content storage, complete privacy
- **Premium Member Access**: Google OAuth authentication with license management
- **Usage Analytics**: Track prevented mistakes with anonymous statistics
- **Seamless Integration**: Works natively with Gmail interface

## Installation

### For Development

1. Clone or download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your Chrome toolbar

### For Production

This extension will be available through the Chrome Web Store for Email Magic members.

## Setup

1. **Install the extension** in Chrome
2. **Sign in** with your Google account to verify Email Magic membership
3. **Configure settings** in the popup (delay time, enable/disable)
4. **Start using Gmail** - emails will automatically be delayed

## How It Works

1. When you click "Send" in Gmail, the extension intercepts the action
2. A discrete notification appears showing the delay countdown
3. You can cancel or edit the email during the delay period
4. After the delay, the email is sent automatically
5. Usage statistics are tracked anonymously

## Security & Privacy

- **No email content is ever stored or transmitted**
- **Zero third-party tracking or analytics**
- **Enterprise-grade security standards**
- **Minimal Gmail permissions required**
- **OAuth authentication only**

## Settings

Access settings by clicking the extension icon in your Chrome toolbar:

- **Delay Time**: Choose from 15s, 30s, 60s, or 2min
- **Enable/Disable**: Turn the extension on or off
- **View Statistics**: See monthly prevented mistakes
- **License Status**: Check your membership status

## License Management

- **Email Magic Members**: Included with active membership
- **30-Day Trial**: Free trial for new users
- **Lifetime License**: Available for purchase separately

## Support

For help and support:
- Visit: https://emailmagic.com/support
- Email: support@emailmagic.com

## Technical Requirements

- Chrome browser (version 88+)
- Gmail account
- Active internet connection for license verification

## Development

This extension is built with:
- Manifest V3
- Vanilla JavaScript
- Chrome Extensions API
- Google OAuth 2.0

### File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js         # Service worker for delay logic
├── content.js           # Gmail integration script
├── popup.html           # Settings interface
├── popup.js             # Settings functionality
├── popup.css            # Settings styling
├── styles.css           # Gmail integration styles
└── icons/               # Extension icons
```

## Privacy Policy

Email Magic: SendShield respects your privacy:

- We do not read, store, or transmit your email content
- Only basic interaction data is collected (anonymously)
- License verification requires minimal Google account info
- No third-party data sharing

## Terms of Service

By using this extension, you agree to:
- Use it responsibly and lawfully
- Maintain an active Email Magic membership (if applicable)
- Not reverse engineer or redistribute the code
- Accept that the service is provided "as-is"

---

© 2024 Email Magic. All rights reserved.

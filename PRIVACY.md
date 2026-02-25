# Privacy Policy

**Last updated:** January 2025

## Overview

Old Reddit Enhanced is a browser extension that automatically redirects Reddit URLs to old.reddit.com. This privacy policy explains what data the extension collects and how it is used.

## Data Collection

**Old Reddit Enhanced does not collect any data.**

Specifically, the extension:

- Does **not** collect personal information
- Does **not** collect browsing history
- Does **not** track which Reddit pages you visit
- Does **not** use analytics or telemetry
- Does **not** make any external network requests
- Does **not** communicate with any servers

## How the Extension Works

The extension operates entirely within your browser using the declarativeNetRequest API. When you navigate to a Reddit URL, the browser automatically redirects it to old.reddit.com before the page loads. This happens locally in your browser without any data leaving your device.

## Permissions Explained

The extension requests the following permissions:

- **declarativeNetRequestWithHostAccess**: Required to redirect Reddit URLs to old.reddit.com
- **contextMenus**: Used to add right-click menu options for opening links in old/new Reddit
- **Host permissions for Reddit domains**: Required for the redirect rules to function

## Local Storage

The extension may store a simple on/off toggle state locally in your browser. This data:

- Never leaves your device
- Is not synced to any external service
- Can be cleared by removing the extension

## Third-Party Services

This extension does not integrate with or send data to any third-party services.

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last updated" date at the top of this document.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/jerdaw/old-reddit-enhanced).

## Open Source

This extension is open source. You can review the complete source code to verify these privacy claims at: https://github.com/jerdaw/old-reddit-enhanced

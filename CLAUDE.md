# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **browser extension** (Chrome/Firefox) that redirects all Reddit URLs to old.reddit.com. The extension uses **Manifest V3** for Chrome (V2 support discontinued) and employs the `declarativeNetRequest` API for URL redirection.

## Architecture

### Manifest V3 Structure

The extension uses Manifest V3 declarative net request rules and a service worker:

- **manifest.json**: Extension metadata, permissions, and declarative net request ruleset registration
- **rules.json**: Array of `declarativeNetRequest` rules that handle URL redirection/modification
- **background.js**: Service worker that handles extension icon clicks to toggle redirect on/off
- **styles.css**: Content script CSS injected into old.reddit.com to hide cookie banners

### Redirect Rule System

Rules in `rules.json` are prioritized and processed in order:

1. **Allowlist rules** (priority 2, IDs 1-2): Bypass redirect for new Reddit-only features:
   - `/media`, `/mod`, `/poll`, `/settings`, `/topics`, `/community-points`, `/appeal(s)`
   - `/notifications`, `/message/compose`, `/r/[subreddit]/s/` (Reddit chat)

2. **Header modification** (priority 2, ID 3): Removes `Accept` header for `i.redd.it` and `preview.redd.it` to force image display instead of HTML

3. **Gallery redirect** (priority 2, ID 4): Rewrites `/gallery/[id]` → `old.reddit.com/comments/[id]`

4. **Domain redirects** (priority 1, IDs 5-9): Transforms hosts to `old.reddit.com`:
   - `reddit.com`, `www.reddit.com`, `np.reddit.com`, `amp.reddit.com`, `i.reddit.com`

### Toggle Mechanism (background.js)

The extension can be toggled on/off by clicking the toolbar icon without requiring storage permissions:

- **Icon click handler**: `chrome.action.onClicked` listener triggers toggle function
- **State management**: Uses `chrome.declarativeNetRequest.getEnabledRulesets()` to check if `ruleset_1` is enabled (no storage API needed)
- **Toggle action**: `chrome.declarativeNetRequest.updateEnabledRulesets()` enables/disables the ruleset
- **UI feedback**: Updates badge text ("OFF" when disabled), badge color, and toolbar tooltip via `chrome.action` API
- **Initialization**: Sets correct badge state on install and browser startup

The toggle state is ephemeral (resets on browser restart) by design to avoid requesting storage permissions.

## Development Commands

### Running the Extension

```bash
# Start live-reload development server (uses web-ext)
make run

# This will:
# - Launch Firefox with the extension loaded
# - Watch for file changes and auto-reload
# - Open browser DevTools for debugging
```

### Building Distribution Package

```bash
# Create zip file for upload to Chrome/Firefox stores
make

# Output: old-reddit-redirect.zip
# Excludes: .git/*, img/screenshot.png, .gitignore, Makefile, _metadata/*
```

### Cleaning Build Artifacts

```bash
make clean
```

## Key Implementation Details

### Permissions Model

The extension requests minimal permissions:

- `declarativeNetRequestWithHostAccess`: Required for URL redirection (Manifest V3)
- `host_permissions`: Scoped to specific Reddit domains only (no broad `<all_urls>`)

**Storage permissions NOT required** - toggle state uses ruleset enable/disable API instead.

### Chrome vs Firefox Compatibility

- **Chrome**: Uses Manifest V3 (V2 being phased out)
- **Firefox**: Currently uses separate Manifest V2 version (V3 support incomplete)
- This repository contains the **V3 version** for Chrome

Firefox-specific settings in manifest.json:
- `browser_specific_settings.gecko.id`: Extension UUID for Firefox
- `browser_specific_settings.gecko.strict_min_version`: Requires Firefox 130+

### Content Script Injection

`styles.css` is injected only on `https://old.reddit.com/*` to:
- Hide `#eu-cookie-policy` (undismissable cookie banner)
- Hide `#redesign-beta-optin-btn` (new Reddit nag prompt)

### Error Handling Pattern

All Chrome API callbacks use `handleLastError()` to suppress error console spam:

```javascript
function handleLastError() {
  void chrome.runtime.lastError;
}
```

This is necessary because some Chrome API calls may fail silently (e.g., when extension context is invalidated).

## File Structure

```
.
├── manifest.json          # Extension manifest (V3)
├── rules.json             # Declarative net request rules
├── background.js          # Service worker for toggle functionality
├── styles.css             # Content script CSS (old.reddit.com only)
├── img/                   # Extension icons (16-128px)
├── LICENSE.txt            # MIT license
├── Makefile               # Build commands
├── README.md              # User documentation
├── CLAUDE.md              # AI development guidance
└── CONTRIBUTING.md        # Contribution guidelines
```

## Git Commit Policy

**IMPORTANT**: Only humans should be credited as authors on commits, pushes, and code contributions. Never include AI attribution (e.g., "Co-Authored-By: Claude") in commit messages or code comments.

## Common Modifications

### Adding New Redirect Rules

Edit `rules.json` and add a new object to the array:

```json
{
  "id": 10,                    // Must be unique
  "priority": 1,               // Higher = processed first (2 > 1)
  "condition": {
    "urlFilter": "||new.reddit.com/*",
    "resourceTypes": ["main_frame"]
  },
  "action": {
    "type": "redirect",
    "redirect": {
      "transform": { "host": "old.reddit.com" }
    }
  }
}
```

Rule types:
- `redirect`: Change URL (transform host, path, or use regex substitution)
- `allow`: Skip other rules (for allowlisting)
- `modifyHeaders`: Add/remove/modify request headers

### Adding New Allowlist Paths

To prevent redirect for specific paths, add to allowlist rules (IDs 1-2) with priority 2:

```json
{
  "id": 11,
  "priority": 2,
  "action": { "type": "allow" },
  "condition": {
    "regexFilter": "^https://\\w*\\.?reddit\\.com/new-feature/.*",
    "resourceTypes": ["main_frame"]
  }
}
```

### Updating Extension Version

1. Edit `manifest.json` → `"version": "X.Y.Z"`
2. Run `make` to create new zip
3. Upload to Chrome Web Store / Firefox Add-ons

## Testing

Manual testing workflow:

1. Run `make run` to launch Firefox with extension
2. Navigate to `https://reddit.com` → should redirect to `old.reddit.com`
3. Test allowlisted paths (e.g., `https://reddit.com/settings`) → should NOT redirect
4. Test gallery redirect: `https://reddit.com/gallery/abc123` → should redirect to `old.reddit.com/comments/abc123`
5. Test toggle: Click extension icon → verify badge shows "OFF" → navigate to `reddit.com` → should NOT redirect
6. Click icon again → badge should clear → redirect should work again

## Debugging

### Chrome DevTools

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Inspect views: service worker" to debug background.js
4. Check "Errors" button for extension errors
5. Use Console tab in service worker inspector to check toggle logic

### Firefox DevTools

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Find "Old Reddit Redirect"
3. Click "Inspect" to open extension console (for background.js)
4. Check Console for any errors or debug output

### Common Issues

- **Rules not applying**: Check `chrome.declarativeNetRequest.getEnabledRulesets()` in service worker console
- **Toggle not working**: Verify ruleset ID matches `RULESET_ID` constant in background.js ("ruleset_1")
- **Icon click does nothing**: Ensure `chrome.action.onClicked` listener is registered in background.js
- **Redirect loops**: Check rule priorities - allowlist rules must have priority >= redirect rules
- **Permissions errors**: Ensure `host_permissions` covers all domains in rules.json

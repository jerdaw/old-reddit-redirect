# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **browser extension** (Chrome/Firefox) that redirects all Reddit URLs to old.reddit.com. The extension uses **Manifest V3** and employs the `declarativeNetRequest` API for URL redirection.

## Git Commit Policy

**IMPORTANT**: Only humans should be credited as authors on commits, pushes, and code contributions. Never include AI attribution (e.g., "Co-Authored-By: Claude") in commit messages or code comments.

## Architecture

### Manifest V3 Structure

The extension uses Manifest V3 declarative net request rules and a service worker:

- **manifest.json**: Extension metadata, permissions, and declarative net request ruleset registration
- **rules.json**: Array of `declarativeNetRequest` rules that handle URL redirection/modification
- **background.js**: Service worker that handles extension icon clicks to toggle redirect on/off
- **styles.css**: Content script CSS injected into old.reddit.com to hide cookie banners

### Redirect Rule System

Rules in `rules.json` use a priority system (higher priority = processed first):

**Priority 3 - Allowlist Rules (IDs 1-5):**

- Paths that don't exist on old Reddit: `/media`, `/mod`, `/poll`, `/settings`, `/topics`, `/community-points`, `/appeals`, `/answers`, `/vault`, `/avatar`, `/talk`, `/coins`, `/premium`, `/predictions`, `/rpan`
- User actions: `/notifications`, `/message/compose`, share links (`/r/*/s/*`)
- Dedicated subdomains: `chat.reddit.com`, `mod.reddit.com`, `sh.reddit.com`

**Priority 2 - Special Redirects (IDs 10-12):**

- Header modification for `i.redd.it` and `preview.redd.it` (removes Accept header to force image display)
- Gallery redirect: `/gallery/ID` → `/comments/ID`
- Videos redirect: `/videos/ID` → `/comments/ID`

**Priority 1 - Domain Redirects (IDs 20-21):**

- Consolidated regex rule for subdomains: `www`, `np`, `nr`, `ns`, `amp`, `i`
- Bare `reddit.com` redirect

### Toggle Mechanism (background.js)

The extension can be toggled on/off by clicking the toolbar icon:

- **Icon click handler**: `chrome.action.onClicked` listener triggers toggle function
- **State management**: Uses `chrome.declarativeNetRequest.getEnabledRulesets()` to check if `ruleset_1` is enabled (no storage API needed)
- **Toggle action**: `chrome.declarativeNetRequest.updateEnabledRulesets()` enables/disables the ruleset
- **UI feedback**: Updates badge text ("OFF" when disabled), badge color, and toolbar tooltip
- **IIFE pattern**: Code wrapped in immediately-invoked function expression to avoid global pollution

## Development Commands

### Setup

```bash
npm install          # Install dependencies
```

### Running the Extension

```bash
npm run dev          # Start live-reload development server (web-ext)
make run             # Alternative using Makefile
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
npm run validate     # Validate JSON and JS syntax
```

### Building

```bash
make                 # Create old-reddit-redirect.zip
make clean           # Remove build artifacts
```

## File Structure

```
.
├── manifest.json          # Extension manifest (V3)
├── rules.json             # Declarative net request rules
├── background.js          # Service worker for toggle functionality
├── styles.css             # Content script CSS (old.reddit.com only)
├── img/                   # Extension icons (16-128px)
├── package.json           # npm dependencies and scripts
├── eslint.config.js       # ESLint configuration (flat config)
├── .prettierrc            # Prettier configuration
├── .github/workflows/     # CI workflow
├── LICENSE.txt            # MIT license
├── Makefile               # Build commands
├── README.md              # User documentation
├── CLAUDE.md              # AI development guidance
└── CONTRIBUTING.md        # Contribution guidelines
```

## Adding New Redirect Rules

Edit `rules.json` and add a new object to the array:

```json
{
  "id": 22,
  "priority": 1,
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

**Rule types:**

- `redirect`: Change URL (transform host, path, or use regex substitution)
- `allow`: Skip other rules (for allowlisting)
- `modifyHeaders`: Add/remove/modify request headers

**Important:** When using `regexFilter` with capture groups, remember that `\\1` refers to the first capture group, `\\2` to the second, etc.

### Adding New Allowlist Paths

Add to the regex in rules 1 or 2, or create a new allowlist rule with priority 3:

```json
{
  "id": 6,
  "priority": 3,
  "action": { "type": "allow" },
  "condition": {
    "urlFilter": "||newfeature.reddit.com/*",
    "resourceTypes": ["main_frame"]
  }
}
```

## Testing

Manual testing workflow:

1. Run `npm run dev` to launch Firefox with extension
2. Navigate to `https://reddit.com` → should redirect to `old.reddit.com`
3. Test allowlisted paths (e.g., `https://reddit.com/settings`) → should NOT redirect
4. Test gallery redirect: `https://reddit.com/gallery/abc123` → should redirect to `old.reddit.com/comments/abc123`
5. Test videos redirect: `https://reddit.com/videos/abc123` → should redirect to `old.reddit.com/comments/abc123`
6. Test new subdomains: `https://nr.reddit.com` and `https://ns.reddit.com` → should redirect
7. Test toggle: Click extension icon → verify badge shows "OFF" → navigate to `reddit.com` → should NOT redirect
8. Click icon again → badge should clear → redirect should work again

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
- **Regex not matching**: Test regex patterns at https://regex101.com (use ECMAScript flavor)

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to master:

1. **Validate job**: JSON syntax, JS syntax, ESLint, Prettier formatting
2. **Build job**: Create zip, verify contents, upload artifact

## Code Style

- **ESLint**: Enforces strict mode, no-var, prefer-const, no global functions
- **Prettier**: 2-space indentation, double quotes, trailing commas (ES5)
- **IIFE pattern**: All code wrapped to avoid global scope pollution
- Run `npm run lint:fix && npm run format` before committing

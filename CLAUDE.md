# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **browser extension** (Chrome/Firefox) that redirects all Reddit URLs to old.reddit.com. The extension uses **Manifest V3** and employs the `declarativeNetRequest` API for URL redirection.

## Testing

The project uses Vitest for unit testing. Tests are located in the `tests/` directory:

- `tests/rules.test.js` - Validates rule structure and manifest configuration (11 tests)
- `tests/patterns.test.js` - Tests URL pattern matching for all redirect rules (21 tests)
- `tests/stats.test.js` - Tests statistics tracking and calculations (19 tests)
- `tests/storage.test.js` - Tests storage schema and sync operations (21 tests)
- `tests/frontends.test.js` - Tests alternative frontend configurations (26 tests)
- `tests/suggestions.test.js` - Tests subreddit suggestion system (22 tests)
- `tests/comments.test.js` - Tests comment enhancements and filtering (77 tests)
- `tests/sort-preferences.test.js` - Tests sort order memory (23 tests)
- `tests/user-tags.test.js` - Tests user tagging system (25 tests)
- `tests/scroll-positions.test.js` - Tests scroll position memory (25 tests)
- `tests/setup.js` - Shared test utilities

**Total: 270 tests across 10 test suites**

Run tests with `npm test` or `npm run test:watch` for watch mode.

## Git Commit Policy

**IMPORTANT**: Only humans should be credited as authors on commits, pushes, and code contributions. Never include AI attribution (e.g., "Co-Authored-By: Claude") in commit messages or code comments.

## Architecture

### Manifest V3 Structure

The extension uses Manifest V3 declarative net request rules and a service worker:

- **manifest.json**: Extension metadata, permissions, and declarative net request ruleset registration
- **rules.json**: Array of `declarativeNetRequest` rules that handle URL redirection/modification
- **background.js**: Service worker for toggle, context menus, stats tracking, and icon behavior
- **storage.js**: Centralized storage abstraction layer with sync support
- **logger.js**: Centralized logging utility with log levels (debug, info, warn, error)
- **popup.html/js/css**: Extension popup UI with quick toggle, stats, and settings
- **options.html/js/css**: Full options page with preferences, whitelist, and URL testing
- **onboarding.html/css/js**: First-run onboarding experience (5 slides)
- **suggestions.js**: Curated list of subreddits that benefit from new Reddit features
- **offscreen.html/js**: Offscreen document for clipboard access (MV3 requirement)
- **content-script.js**: Content script injected into old.reddit.com (redirect notices, dark mode, nag blocking, content filtering)
- **styles.css**: Content script CSS injected into old.reddit.com (dark mode themes, nag blocking, cookie banner removal)

### Redirect Rule System

Rules in `rules.json` use a priority system (higher priority = processed first):

**Priority 3 - Allowlist Rules (IDs 1-5):**

- Paths that don't exist on old Reddit: `/media`, `/mod`, `/poll`, `/settings`, `/topics`, `/community-points`, `/appeals`, `/answers`, `/vault`, `/avatar`, `/talk`, `/coins`, `/premium`, `/predictions`, `/rpan`
- User actions: `/notifications`, `/message/compose`
- Dedicated subdomains: `chat.reddit.com`, `mod.reddit.com`, `sh.reddit.com`
- **Note**: Share links (`/r/*/s/*`) are NOT allowlisted - they redirect through Reddit then to old.reddit.com

**Priority 2 - Special Redirects (IDs 10-12):**

- Header modification for `i.redd.it` and `preview.redd.it` (removes Accept header to force image display)
- Gallery redirect: `/gallery/ID` → `/comments/ID` (supports hyphens in IDs)
- Videos redirect: `/videos/ID` → `/comments/ID` (supports hyphens in IDs)

**Priority 1 - Domain Redirects (IDs 20-22):**

- Consolidated regex rule for subdomains: `www`, `np`, `nr`, `ns`, `amp`, `i`, `m` (mobile)
- Bare `reddit.com` redirect
- Onion domain redirect: `*.reddit.com.onion` → `old.reddit.com`

### Core Features (background.js + storage.js)

**Toggle Mechanism:**

- **Icon click**: Configurable to either open popup (default) or toggle redirect
- **Keyboard shortcut**: Alt+Shift+R (configurable via `chrome://extensions/shortcuts`)
- **Context menu**: Right-click menu items for opening links in old/new Reddit
- **Popup/Options UI**: Toggle switches with real-time feedback
- **State management**: Uses `chrome.declarativeNetRequest.getEnabledRulesets()` + storage.js
- **UI feedback**: Badge text/color, tooltip updates, optional notifications

**Statistics Tracking:**

- Total redirect count across all time
- Daily redirect count (resets at midnight)
- Per-subreddit redirect tracking (top 50)
- Weekly history for trend analysis

**Storage System:**

- Centralized storage API in `storage.js`
- Support for both local and sync storage
- Automatic schema migration from legacy versions
- Import/export settings functionality
- Race condition prevention with proper async/await

**Subreddit Exceptions:**

- User-managed whitelist of subreddits to keep on new Reddit
- Dynamic rule generation for whitelisted subreddits
- Smart suggestions for subreddits using new Reddit features
- Context menu integration for quick whitelist additions

**Logging System:**

- Centralized logger with configurable log levels
- Contextual error messages for debugging
- Integrated across all extension components

**v6.0.0 - Dark Mode & Content Filtering:**

- **Dark Mode**: Auto/Light/Dark/OLED themes with system detection
- **Nag Blocking**: Granular controls for login prompts, email verification, premium ads, app prompts
- **Auto-collapse Bots**: Automatically collapse 13 common bot accounts (AutoModerator, etc.)
- **Subreddit Muting**: Filter unwanted subreddits on /r/all and /r/popular (up to 100)
- **Keyword Muting**: Filter posts by title keywords/phrases with word boundary matching (up to 200)
- **Domain Muting**: Filter posts by linked domains with wildcard subdomain support (up to 100)
- **Import/Export**: JSON-based backup/restore for all filter lists
- **MutationObserver**: Single debounced observer (100ms) watching all dynamic content

**v7.0.0-v7.2.0 - Comment Enhancements:**

- **Color-coded Comments (v7.0.0)**: Visual depth indicators with rainbow/color-blind palettes, customizable stripe width
- **Comment Navigation (v7.1.0)**: Floating buttons for next/previous/top navigation, keyboard shortcuts (Shift+J/K)
- **Inline Image Expansion (v7.2.0)**: Expand images directly in comments, supports imgur/i.redd.it, lazy loading

**v8.0.0-v10.0.0 - User Experience Polish:**

- **Sort Order Memory (v8.0.0)**: Remember preferred sort per subreddit, auto-apply on visit, LRU eviction at 100 entries
- **User Tagging (v9.0.0)**: Custom labels/colors for Reddit users, 12 preset colors, tag management, up to 500 tags
- **Scroll Position Memory (v10.0.0)**: Remember scroll position when navigating back, 24-hour retention, LRU eviction at 100 entries

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
npm test             # Run Vitest test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
npm run validate     # Validate JSON and JS syntax
npm run version:sync # Sync version from package.json to manifest.json
npm run version:check # Check if versions are in sync
```

### Building

```bash
make                 # Create old-reddit-redirect.zip
make clean           # Remove build artifacts
```

## File Structure

```
.
├── manifest.json             # Extension manifest (V3)
├── rules.json                # Declarative net request rules
├── background.js             # Service worker (toggle, stats, context menus)
├── storage.js                # Centralized storage abstraction layer
├── logger.js                 # Centralized logging utility
├── popup.html                # Extension popup UI
├── popup.js                  # Popup logic
├── popup.css                 # Popup styles
├── options.html              # Extension options page
├── options.js                # Options page logic
├── options.css               # Options page styles
├── onboarding.html           # First-run onboarding experience
├── onboarding.js             # Onboarding logic
├── onboarding.css            # Onboarding styles
├── suggestions.js            # Curated subreddit suggestions
├── offscreen.html            # Offscreen document for clipboard
├── offscreen.js              # Offscreen document logic
├── content-script.js         # Content script (redirect notices, dark mode, filtering)
├── styles.css                # Content script CSS (dark mode, nag blocking)
├── img/                      # Extension icons (16-128px)
├── tests/                    # Vitest test suite (270 tests)
│   ├── setup.js              # Test utilities
│   ├── rules.test.js         # Rule validation tests (11 tests)
│   ├── patterns.test.js      # URL pattern matching tests (21 tests)
│   ├── stats.test.js         # Statistics tracking tests (19 tests)
│   ├── storage.test.js       # Storage schema tests (21 tests)
│   ├── frontends.test.js     # Alternative frontends tests (26 tests)
│   ├── suggestions.test.js   # Subreddit suggestions tests (22 tests)
│   ├── comments.test.js      # Comment enhancements tests (77 tests)
│   ├── sort-preferences.test.js # Sort memory tests (23 tests)
│   ├── user-tags.test.js     # User tagging tests (25 tests)
│   └── scroll-positions.test.js # Scroll memory tests (25 tests)
├── scripts/                  # Build and utility scripts
│   └── sync-version.js       # Version synchronization script
├── store/                    # Store metadata
│   ├── description.txt       # Short description
│   └── detailed-description.md # Full store listing
├── package.json              # npm dependencies and scripts
├── vitest.config.js          # Vitest test configuration
├── eslint.config.js          # ESLint configuration (flat config)
├── .prettierrc               # Prettier configuration
├── .github/workflows/        # CI and release workflows
│   ├── ci.yml                # Continuous integration
│   └── release.yml           # Automated releases
├── LICENSE.txt               # MIT license
├── Makefile                  # Build commands
├── README.md                 # User documentation
├── CLAUDE.md                 # AI development guidance
├── CONTRIBUTING.md           # Contribution guidelines
├── PRIVACY.md                # Privacy policy
├── ROADMAP.md                # Feature roadmap
└── CHANGELOG.md              # Version history and changes
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

### Automated Testing

Run the test suite with `npm test`. Tests cover:

- Rule structure validation (unique IDs, required fields, valid actions)
- Manifest configuration validation
- URL pattern matching for all redirect rules
- Allowlist pattern verification
- Gallery and video redirect logic
- Onion domain support

### Manual Testing Workflow

1. Run `npm run dev` to launch Firefox with extension
2. Navigate to `https://reddit.com` → should redirect to `old.reddit.com`
3. Test allowlisted paths (e.g., `https://reddit.com/settings`) → should NOT redirect
4. Test gallery redirect: `https://reddit.com/gallery/abc123` → should redirect to `old.reddit.com/comments/abc123`
5. Test videos redirect: `https://reddit.com/videos/abc123` → should redirect to `old.reddit.com/comments/abc123`
6. Test new subdomains: `https://nr.reddit.com` and `https://ns.reddit.com` → should redirect
7. Test onion domain: `https://reddit.com.onion` → should redirect
8. Test keyboard shortcut: Press Alt+Shift+R → verify toggle works
9. Test context menu: Right-click a Reddit link → verify menu items appear
10. Test options page: Right-click extension icon → Options → verify UI controls work
11. Test toggle: Click extension icon → verify badge shows "OFF" → navigate to `reddit.com` → should NOT redirect
12. Click icon again → badge should clear → redirect should work again

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

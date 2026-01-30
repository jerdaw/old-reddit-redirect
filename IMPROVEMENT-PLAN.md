# Old Reddit Redirect v4.1.0+ Improvement Implementation Plan

## Executive Summary

This plan details the implementation of 10 high-value improvements identified through comprehensive codebase analysis. The improvements are organized into 4 sequential phases based on dependencies, complexity, and user impact.

**Target Versions:**

- v4.1.0: Critical fixes + Quick wins (Phase 1)
- v4.2.0: URL handling improvements (Phase 2)
- v5.0.0: UX enhancements + Advanced features (Phases 3-4)

**Total Improvements:** 10
**Estimated New/Modified Files:** 15+
**New Permissions Required:** 1 (offscreen)

---

## Phase 1: Critical Bug Fixes & Quick Wins

**Goal:** Fix production bugs and implement low-effort, high-impact improvements.
**Target Version:** v4.1.0

---

### 1.1 Fix Storage Race Condition

**Priority:** Critical
**File:** `storage.js`
**Lines:** 96-110

**Current Problem:**

```javascript
async set(key, value) {
  return new Promise((resolve) => {
    // BUG: this.get("sync") is called but creates nested async chain
    // resolve() can be called before sync check completes
    this.get("sync").then((syncConfig) => {
      // ...
    });
  });
}
```

**Root Cause:**
The `set()` method creates a Promise that internally calls `this.get("sync")` which is also async. If two `set()` calls happen rapidly, they can interleave incorrectly.

**Solution:**
Refactor to use proper async/await pattern:

```javascript
async set(key, value) {
  // Determine storage area first
  const syncConfig = await this.get("sync", { enabled: false });
  const syncEnabled = syncConfig.enabled && SYNC_KEYS.includes(key);
  const area = syncEnabled ? "sync" : "local";

  // Then set the value
  return new Promise((resolve) => {
    chrome.storage[area].set({ [key]: value }, () => {
      handleLastError();
      resolve();
    });
  });
}
```

**Additional Fix - get() method consistency:**
The `get()` method currently checks `SYNC_KEYS.includes(key)` without checking if sync is enabled:

```javascript
async get(key, defaultValue) {
  // Current: Always uses sync storage for sync keys
  // Fixed: Check if sync is enabled first
  const syncConfig = await this._getSyncConfigDirect(); // New internal method
  const syncEnabled = syncConfig && syncConfig.enabled && SYNC_KEYS.includes(key);
  const area = syncEnabled ? "sync" : "local";
  // ...
}

// New internal method to avoid infinite recursion
async _getSyncConfigDirect() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ sync: { enabled: false } }, (result) => {
      handleLastError();
      resolve(result.sync);
    });
  });
}
```

**Testing Requirements:**

- Unit test: Rapid sequential `set()` calls maintain data integrity
- Unit test: Concurrent `set()` calls don't corrupt storage
- Integration test: Toggle state survives rapid clicking

**Files Modified:**

- `storage.js`

---

### 1.2 Fix Gallery/Video ID Regex

**Priority:** High
**File:** `rules.json`
**Lines:** 79, 93

**Current Problem:**

```json
"regexFilter": "^https?://(?:www\\.)?reddit\\.com/(gallery)/([a-zA-Z0-9_]+)$"
```

Reddit post IDs can contain hyphens. Example: `gallery/abc-123-xyz`

**Solution:**
Update regex to include hyphens:

```json
"regexFilter": "^https?://(?:www\\.)?reddit\\.com/(gallery)/([a-zA-Z0-9_-]+)$"
```

**Rules to Update:**

1. Rule 11 (Gallery redirect) - Line 79
2. Rule 12 (Videos redirect) - Line 93

**Full Updated Rules:**

```json
{
  "id": 11,
  "priority": 2,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "https://old.reddit.com/comments/\\2"
    }
  },
  "condition": {
    "regexFilter": "^https?://(?:www\\.)?reddit\\.com/(gallery)/([a-zA-Z0-9_-]+)/?$",
    "resourceTypes": ["main_frame"]
  }
},
{
  "id": 12,
  "priority": 2,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "https://old.reddit.com/comments/\\2"
    }
  },
  "condition": {
    "regexFilter": "^https?://(?:www\\.)?reddit\\.com/(videos?)/([a-zA-Z0-9_-]+)/?$",
    "resourceTypes": ["main_frame"]
  }
}
```

**Additional Enhancement - Trailing Slash:**
Added `/?` to handle both `/gallery/abc123` and `/gallery/abc123/`

**Testing Requirements:**

- Test: `reddit.com/gallery/abc123` → redirects
- Test: `reddit.com/gallery/abc-123-xyz` → redirects (NEW)
- Test: `reddit.com/gallery/abc_123` → redirects
- Test: `reddit.com/gallery/abc123/` → redirects (trailing slash)
- Test: `reddit.com/videos/abc-def` → redirects

**Files Modified:**

- `rules.json`
- `tests/patterns.test.js` (add new test cases)

---

### 1.3 Add Error Logging

**Priority:** High
**Files:** `background.js`, `storage.js`, `popup.js`, `options.js`

**Current Problem:**

```javascript
function handleLastError() {
  void chrome.runtime.lastError; // Silently swallows errors
}
```

Errors are completely hidden, making production debugging impossible.

**Solution:**
Create a centralized logging utility:

**New File: `logger.js`**

```javascript
"use strict";

(function () {
  const LOG_PREFIX = "[OldRedditRedirect]";
  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  // Default to WARN in production, DEBUG in development
  let currentLevel = LOG_LEVELS.WARN;

  const Logger = {
    setLevel(level) {
      currentLevel = LOG_LEVELS[level] || LOG_LEVELS.WARN;
    },

    debug(...args) {
      if (currentLevel <= LOG_LEVELS.DEBUG) {
        console.debug(LOG_PREFIX, ...args);
      }
    },

    info(...args) {
      if (currentLevel <= LOG_LEVELS.INFO) {
        console.info(LOG_PREFIX, ...args);
      }
    },

    warn(...args) {
      if (currentLevel <= LOG_LEVELS.WARN) {
        console.warn(LOG_PREFIX, ...args);
      }
    },

    error(...args) {
      if (currentLevel <= LOG_LEVELS.ERROR) {
        console.error(LOG_PREFIX, ...args);
      }
    },

    // Chrome API error handler
    handleChromeError(context = "") {
      if (chrome.runtime.lastError) {
        this.warn(
          `Chrome API error${context ? ` (${context})` : ""}:`,
          chrome.runtime.lastError.message
        );
        return true;
      }
      return false;
    },
  };

  // Export
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Logger;
  } else {
    window.Logger = Logger;
  }
})();
```

**Update handleLastError() calls:**

```javascript
// Before
function handleLastError() {
  void chrome.runtime.lastError;
}

// After
function handleLastError(context) {
  Logger.handleChromeError(context);
}

// Usage
chrome.action.setBadgeText({ text: badgeText }, () => {
  handleLastError("setBadgeText");
});
```

**Files Modified:**

- New: `logger.js`
- `background.js` - Import logger, update all handleLastError calls
- `storage.js` - Import logger, add context to errors
- `popup.js` - Import logger
- `options.js` - Import logger
- `manifest.json` - Add logger.js to service worker imports

**Service Worker Import:**

```javascript
// background.js
if (typeof importScripts === "function") {
  importScripts("logger.js", "storage.js");
}
```

**Testing Requirements:**

- Verify errors appear in console with context
- Verify LOG_PREFIX helps filter extension logs
- Verify no performance impact from logging

---

### 1.4 Fix Popup Shortcut Hardcoding

**Priority:** Medium
**File:** `popup.html`, `popup.js`

**Current Problem:**

```html
<!-- popup.html line 86 -->
<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> to toggle
```

Shortcut is hardcoded, but users can customize it. Options page correctly loads dynamically.

**Solution:**
Load shortcut dynamically in popup, same as options page:

**popup.html update:**

```html
<footer class="popup-footer">
  <span class="shortcut-hint" id="shortcut-hint"> Loading shortcut... </span>
</footer>
```

**popup.js update (loadShortcut function already exists but may not render kbd elements):**

```javascript
async function loadShortcut() {
  chrome.commands.getAll((commands) => {
    handleLastError("getCommands");
    const toggleCommand = commands.find(
      (cmd) => cmd.name === "toggle-redirect"
    );

    if (toggleCommand && toggleCommand.shortcut) {
      const keys = toggleCommand.shortcut.split("+");
      elements.shortcutHint.innerHTML =
        keys.map((k) => `<kbd>${escapeHtml(k)}</kbd>`).join("+") + " to toggle";
    } else {
      elements.shortcutHint.innerHTML =
        '<a href="#" id="set-shortcut">Set keyboard shortcut</a>';

      // Add click handler for setting shortcut
      const link = document.getElementById("set-shortcut");
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          openShortcutSettings();
        });
      }
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function openShortcutSettings() {
  const isFirefox = typeof browser !== "undefined";
  const url = isFirefox ? "about:addons" : "chrome://extensions/shortcuts";
  chrome.tabs.create({ url });
}
```

**Edge Cases:**

- Shortcut not set → Show "Set keyboard shortcut" link
- Custom shortcut → Display correctly
- Very long shortcuts (4+ modifiers) → Should still fit

**Testing Requirements:**

- Test: Default shortcut displays correctly
- Test: Custom shortcut displays correctly
- Test: No shortcut shows setup link
- Test: Setup link opens correct browser page

**Files Modified:**

- `popup.html`
- `popup.js`

---

### 1.5 Proper Clipboard API Implementation

**Priority:** High
**Files:** New `offscreen.html`, `offscreen.js`, update `background.js`

**Current Problem:**
"Copy as Old Reddit Link" context menu just shows a notification instead of copying.

**Solution:**
Use Manifest V3 Offscreen Documents API for clipboard access.

**New File: `offscreen.html`**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Offscreen</title>
  </head>
  <body>
    <textarea id="clipboard-area"></textarea>
    <script src="offscreen.js"></script>
  </body>
</html>
```

**New File: `offscreen.js`**

```javascript
"use strict";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "COPY_TO_CLIPBOARD") {
    copyToClipboard(message.text)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async
  }
});

async function copyToClipboard(text) {
  const textarea = document.getElementById("clipboard-area");
  textarea.value = text;
  textarea.select();
  document.execCommand("copy");
  textarea.value = "";
}
```

**Update manifest.json:**

```json
{
  "permissions": [
    // ... existing permissions
    "offscreen"
  ]
}
```

**Update background.js:**

```javascript
let offscreenDocumentCreated = false;

async function ensureOffscreenDocument() {
  if (offscreenDocumentCreated) return;

  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["CLIPBOARD"],
      justification: "Copy Reddit link to clipboard",
    });
    offscreenDocumentCreated = true;
  } catch (error) {
    // Document may already exist
    if (!error.message.includes("already exists")) {
      Logger.error("Failed to create offscreen document:", error);
      throw error;
    }
    offscreenDocumentCreated = true;
  }
}

async function copyToClipboard(text) {
  await ensureOffscreenDocument();

  const response = await chrome.runtime.sendMessage({
    type: "COPY_TO_CLIPBOARD",
    text,
  });

  if (response.success) {
    // Show success notification
    const prefs = await Storage.getUIPreferences();
    if (prefs.showNotifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "img/icon128.png",
        title: "Link Copied",
        message: "Old Reddit link copied to clipboard",
        silent: true,
      });
    }
  } else {
    Logger.error("Clipboard copy failed:", response.error);
    // Fallback: show URL in notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "img/icon128.png",
      title: "Copy this link",
      message: text,
      silent: true,
    });
  }
}
```

**Firefox Compatibility:**
Firefox doesn't support Offscreen API. Need browser detection and fallback:

```javascript
async function copyToClipboard(text) {
  const isFirefox = typeof browser !== "undefined";

  if (isFirefox) {
    // Firefox: Use navigator.clipboard directly (works in background)
    try {
      await navigator.clipboard.writeText(text);
      showCopySuccessNotification();
    } catch (error) {
      showCopyFallbackNotification(text);
    }
  } else {
    // Chrome: Use offscreen document
    await copyToClipboardViaOffscreen(text);
  }
}
```

**Testing Requirements:**

- Test Chrome: Copy works, notification shows "Link Copied"
- Test Firefox: Copy works via navigator.clipboard
- Test failure: Fallback notification shows URL
- Test rapid copies: Offscreen document reused, not recreated

**Files Created:**

- `offscreen.html`
- `offscreen.js`

**Files Modified:**

- `manifest.json` - Add "offscreen" permission
- `background.js` - New clipboard implementation

---

### 1.6 Restore Icon-Click Toggle Option

**Priority:** High
**Files:** `options.html`, `options.js`, `background.js`, `storage.js`

**Current Problem:**
v4.0.0 changed icon click to open popup. Power users want single-click toggle back.

**Solution:**
Add preference to disable popup and restore icon-click toggle.

**Storage Schema Addition:**

```javascript
// In storage.js DEFAULTS
{
  ui: {
    // ... existing
    iconClickBehavior: "popup", // "popup" | "toggle"
  }
}
```

**Options UI Addition (options.html):**

```html
<div class="option-row">
  <label for="icon-click-behavior">Icon Click Behavior</label>
  <select id="icon-click-behavior" class="select-input">
    <option value="popup">Open popup (default)</option>
    <option value="toggle">Toggle redirect on/off</option>
  </select>
  <p class="option-description">
    Choose what happens when you click the extension icon. Keyboard shortcut
    always toggles regardless of this setting.
  </p>
</div>
```

**Options.js Handler:**

```javascript
async function handleIconClickBehaviorChange() {
  const behavior = elements.iconClickBehavior.value;

  const prefs = await Storage.getUIPreferences();
  prefs.iconClickBehavior = behavior;
  await Storage.setUIPreferences(prefs);

  // Notify background to update popup behavior
  chrome.runtime.sendMessage({
    type: "UPDATE_ICON_BEHAVIOR",
    behavior,
  });

  showToast(
    `Icon click will now ${behavior === "popup" ? "open popup" : "toggle redirect"}`
  );
}
```

**Background.js Implementation:**

```javascript
// On startup/install, check preference and configure
async function configureIconBehavior() {
  const prefs = await Storage.getUIPreferences();
  const behavior = prefs.iconClickBehavior || "popup";

  if (behavior === "toggle") {
    // Disable popup, enable click listener
    chrome.action.setPopup({ popup: "" });
  } else {
    // Enable popup
    chrome.action.setPopup({ popup: "popup.html" });
  }
}

// Message handler
case "UPDATE_ICON_BEHAVIOR":
  if (message.behavior === "toggle") {
    chrome.action.setPopup({ popup: "" });
  } else {
    chrome.action.setPopup({ popup: "popup.html" });
  }
  sendResponse({ success: true });
  break;

// Keep click listener, but check if popup is set
chrome.action.onClicked.addListener(async (tab) => {
  // This only fires when popup is disabled
  await toggleRedirect();
});

// Call on startup
chrome.runtime.onStartup.addListener(async () => {
  await configureIconBehavior();
  // ... rest of startup
});

chrome.runtime.onInstalled.addListener(async () => {
  await configureIconBehavior();
  // ... rest of install
});
```

**UX Consideration:**
When user switches to "toggle" mode, they lose access to popup features (temp disable, per-tab toggle, stats). Show warning:

```javascript
async function handleIconClickBehaviorChange() {
  const behavior = elements.iconClickBehavior.value;

  if (behavior === "toggle") {
    const confirmed = confirm(
      "Switching to toggle mode will disable the popup.\n\n" +
        "You can still access all features from this Options page.\n" +
        "Keyboard shortcut (Alt+Shift+R) will continue to work.\n\n" +
        "Continue?"
    );
    if (!confirmed) {
      elements.iconClickBehavior.value = "popup";
      return;
    }
  }
  // ... rest of handler
}
```

**Testing Requirements:**

- Test: Setting to "toggle" → icon click toggles, no popup
- Test: Setting to "popup" → icon click opens popup
- Test: Keyboard shortcut works in both modes
- Test: Preference persists across browser restart

**Files Modified:**

- `storage.js` - Add iconClickBehavior to defaults
- `options.html` - Add dropdown
- `options.js` - Add handler
- `background.js` - Add dynamic popup configuration

---

### Phase 1 Summary

| Item                       | Priority | Files                                      | New Permissions |
| -------------------------- | -------- | ------------------------------------------ | --------------- |
| 1.1 Storage Race Condition | Critical | storage.js                                 | -               |
| 1.2 Gallery/Video Regex    | High     | rules.json, tests                          | -               |
| 1.3 Error Logging          | High     | logger.js (new), all JS files              | -               |
| 1.4 Popup Shortcut         | Medium   | popup.html, popup.js                       | -               |
| 1.5 Clipboard API          | High     | offscreen.html/js (new), background.js     | offscreen       |
| 1.6 Icon-Click Toggle      | High     | options.html/js, background.js, storage.js | -               |

**Phase 1 Testing Checklist:**

- [ ] Storage operations are thread-safe
- [ ] Gallery/video URLs with hyphens redirect correctly
- [ ] Errors appear in console with context
- [ ] Popup shows dynamic shortcut
- [ ] Clipboard copy actually works
- [ ] Icon-click toggle option works

---

## Phase 2: URL Handling Improvements

**Goal:** Fix gaps in URL redirect coverage.
**Target Version:** v4.2.0
**Dependencies:** Phase 1 complete

---

### 2.1 Share Link Conversion

**Priority:** High
**Files:** `rules.json`, `background.js`

**Current Problem:**
Reddit share links (`reddit.com/r/news/s/abc123`) are allowlisted (Rule 2), meaning they stay on new Reddit.

**Analysis:**
Share links are short URLs that redirect to the actual post. The challenge is:

1. We can't know the destination without following the redirect
2. DNR can't follow redirects and then redirect again
3. If we don't allowlist, the share link redirects to new Reddit, then our rule kicks in

**Solution Options:**

**Option A: Remove from Allowlist (Simplest)**
Remove `/r/*/s/*` from allowlist. Let Reddit's share link redirect happen, then our rule catches the destination.

Test this first:

1. Visit `reddit.com/r/news/s/abc123`
2. Reddit redirects to `reddit.com/r/news/comments/xyz...`
3. Our rule catches this and redirects to `old.reddit.com/r/news/comments/xyz...`

**Potential issue:** Double redirect may cause flash of new Reddit.

**Option B: Web Request Interception**
Use `webRequest` API to intercept share links and handle manually.

```javascript
// In background.js
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const shareMatch = url.pathname.match(/^\/r\/([^/]+)\/s\/([^/]+)/);

    if (shareMatch) {
      // Fetch the share link to get destination
      try {
        const response = await fetch(details.url, {
          method: "HEAD",
          redirect: "follow",
        });
        const finalUrl = new URL(response.url);
        finalUrl.hostname = "old.reddit.com";
        return { redirectUrl: finalUrl.toString() };
      } catch (error) {
        Logger.error("Share link resolution failed:", error);
        // Fall through to normal handling
      }
    }
  },
  { urls: ["*://reddit.com/r/*/s/*", "*://www.reddit.com/r/*/s/*"] },
  ["blocking"]
);
```

**Problem:** `webRequest` blocking requires `webRequestBlocking` permission, which is restricted in MV3.

**Option C: Content Script Redirect (Recommended)**
Inject content script on Reddit that detects share links and redirects.

```javascript
// share-link-handler.js (content script)
"use strict";

(function () {
  // Check if this is a share link page
  const shareMatch = window.location.pathname.match(
    /^\/r\/([^/]+)\/s\/([^/]+)/
  );
  if (!shareMatch) return;

  // Reddit will redirect this page - watch for the redirect
  // and intercept to go to old.reddit.com instead

  // Method 1: Observe URL changes
  const observer = new MutationObserver(() => {
    const newPath = window.location.pathname;
    if (!newPath.match(/^\/r\/[^/]+\/s\//)) {
      // We've been redirected to the actual post
      const newUrl = new URL(window.location.href);
      newUrl.hostname = "old.reddit.com";
      window.location.replace(newUrl.toString());
    }
  });

  observer.observe(document, { childList: true, subtree: true });

  // Method 2: Fallback timeout
  setTimeout(() => {
    const currentPath = window.location.pathname;
    if (!currentPath.match(/^\/r\/[^/]+\/s\//)) {
      const newUrl = new URL(window.location.href);
      newUrl.hostname = "old.reddit.com";
      window.location.replace(newUrl.toString());
    }
  }, 2000);
})();
```

**Manifest Addition:**

```json
{
  "content_scripts": [
    {
      "matches": [
        "https://reddit.com/r/*/s/*",
        "https://www.reddit.com/r/*/s/*"
      ],
      "js": ["share-link-handler.js"],
      "run_at": "document_start"
    }
  ]
}
```

**Update rules.json:**
Remove share link from allowlist (Rule 2):

```json
// Before
"regexFilter": "^https?://(?:www\\.)?reddit\\.com/(notifications|message/compose|r/[^/]+/s/[^/]+)"

// After
"regexFilter": "^https?://(?:www\\.)?reddit\\.com/(notifications|message/compose)"
```

**Testing Requirements:**

- Test: Share link `reddit.com/r/news/s/abc` → ends up on old.reddit.com
- Test: No flash of new Reddit content (or minimal)
- Test: Share links still work when extension is disabled
- Test: Performance impact is minimal

**Files Created:**

- `share-link-handler.js`

**Files Modified:**

- `manifest.json` - Add content script for share links
- `rules.json` - Remove share links from allowlist

---

### 2.2 Mobile Reddit Link Handling

**Priority:** Medium
**Files:** `rules.json`, `manifest.json`

**Current Problem:**
`m.reddit.com` and potentially other mobile domains are not handled.

**Analysis:**

- `m.reddit.com` - Mobile web version
- `i.reddit.com` - Already handled (compact/mobile)
- `reddit.app.link` - App deep links (different domain)

**Solution:**

**Add m.reddit.com to rules:**

Update Rule 20 (subdomain redirects):

```json
// Before
"regexFilter": "^https?://(www|np|nr|ns|amp|i)\\.reddit\\.com/(.*)$"

// After
"regexFilter": "^https?://(www|np|nr|ns|amp|i|m)\\.reddit\\.com/(.*)$"
```

**Add m.reddit.com to host_permissions:**

```json
{
  "host_permissions": [
    // ... existing
    "*://m.reddit.com/*"
  ]
}
```

**Handle reddit.app.link (App Deep Links):**
These are more complex - they're a different domain entirely.

```json
// New rule for app links
{
  "id": 23,
  "priority": 1,
  "action": {
    "type": "redirect",
    "redirect": {
      "transform": { "host": "old.reddit.com" }
    }
  },
  "condition": {
    "urlFilter": "||reddit.app.link/*",
    "resourceTypes": ["main_frame"]
  }
}
```

**Wait:** `reddit.app.link` redirects to reddit.com, which we already handle. Test if this is needed.

**Testing Plan:**

1. Test `m.reddit.com/r/news` → should redirect to `old.reddit.com/r/news`
2. Test `reddit.app.link/xyz` → check if already handled by chain redirect
3. Test mobile share links from apps

**Files Modified:**

- `rules.json` - Add m.reddit.com to regex
- `manifest.json` - Add m.reddit.com to host_permissions
- `tests/patterns.test.js` - Add mobile domain tests

---

### Phase 2 Summary

| Item                      | Priority | Approach                            | Files                                            |
| ------------------------- | -------- | ----------------------------------- | ------------------------------------------------ |
| 2.1 Share Link Conversion | High     | Content script + allowlist update   | share-link-handler.js, rules.json, manifest.json |
| 2.2 Mobile Reddit Links   | Medium   | Update existing regex + permissions | rules.json, manifest.json                        |

**Phase 2 Testing Checklist:**

- [ ] Share links redirect to old Reddit
- [ ] Mobile links (m.reddit.com) redirect correctly
- [ ] No double-redirect flashes
- [ ] All existing redirects still work

---

## Phase 3: User Experience Enhancements

**Goal:** Improve discoverability and usability.
**Target Version:** v5.0.0
**Dependencies:** Phases 1-2 complete

---

### 3.1 First-Run Onboarding Experience

**Priority:** High
**Files:** New `onboarding.html`, `onboarding.css`, `onboarding.js`, update `background.js`

**Current Problem:**
New users don't know about features like keyboard shortcuts, whitelist, temporary disable.

**Solution:**
Show interactive onboarding page on first install.

**Onboarding Flow:**

1. Welcome screen with extension overview
2. Feature highlights (3-4 slides)
3. Quick configuration options
4. Done / Open Options

**New File: `onboarding.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Old Reddit Redirect</title>
    <link rel="stylesheet" href="onboarding.css" />
  </head>
  <body>
    <div class="onboarding-container">
      <!-- Slide 1: Welcome -->
      <section class="slide active" data-slide="1">
        <div class="slide-content">
          <img
            src="img/icon128.png"
            alt="Old Reddit Redirect"
            class="hero-icon"
          />
          <h1>Welcome to Old Reddit Redirect</h1>
          <p class="hero-text">
            Reddit URLs will now automatically redirect to old.reddit.com
          </p>
          <div class="feature-badges">
            <span class="badge">✓ Instant redirects</span>
            <span class="badge">✓ No tracking</span>
            <span class="badge">✓ Lightweight</span>
          </div>
        </div>
        <button class="btn primary" data-action="next">Get Started</button>
      </section>

      <!-- Slide 2: Quick Toggle -->
      <section class="slide" data-slide="2">
        <div class="slide-content">
          <div class="feature-demo">
            <div class="keyboard-visual">
              <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>
            </div>
          </div>
          <h2>Quick Toggle</h2>
          <p>
            Press <strong>Alt+Shift+R</strong> to instantly toggle redirects on
            or off. Works on any page, any time.
          </p>
        </div>
        <div class="btn-group">
          <button class="btn secondary" data-action="prev">Back</button>
          <button class="btn primary" data-action="next">Next</button>
        </div>
      </section>

      <!-- Slide 3: Popup Features -->
      <section class="slide" data-slide="3">
        <div class="slide-content">
          <div class="feature-demo">
            <img
              src="img/popup-preview.png"
              alt="Popup preview"
              class="demo-image"
            />
          </div>
          <h2>Powerful Popup</h2>
          <p>Click the extension icon to access:</p>
          <ul class="feature-list">
            <li>Temporary disable (5-60 minutes)</li>
            <li>Per-tab toggle</li>
            <li>Redirect statistics</li>
          </ul>
        </div>
        <div class="btn-group">
          <button class="btn secondary" data-action="prev">Back</button>
          <button class="btn primary" data-action="next">Next</button>
        </div>
      </section>

      <!-- Slide 4: Subreddit Exceptions -->
      <section class="slide" data-slide="4">
        <div class="slide-content">
          <div class="feature-demo">
            <div class="context-menu-visual">
              <div class="menu-item">Open in Old Reddit</div>
              <div class="menu-item highlight">Keep on New Reddit</div>
            </div>
          </div>
          <h2>Subreddit Exceptions</h2>
          <p>
            Some subreddits use new Reddit features like polls and predictions.
            Right-click any Reddit link and select "Keep on New Reddit" to
            whitelist it.
          </p>
        </div>
        <div class="btn-group">
          <button class="btn secondary" data-action="prev">Back</button>
          <button class="btn primary" data-action="next">Finish Setup</button>
        </div>
      </section>

      <!-- Slide 5: Done -->
      <section class="slide" data-slide="5">
        <div class="slide-content">
          <div class="success-icon">🎉</div>
          <h2>You're All Set!</h2>
          <p>
            Old Reddit Redirect is now active. Visit any Reddit page to see it
            in action.
          </p>
          <div class="quick-actions">
            <label class="checkbox-option">
              <input type="checkbox" id="enable-notifications" />
              <span>Enable notifications for redirects</span>
            </label>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn secondary" data-action="options">
            Open Options
          </button>
          <button class="btn primary" data-action="close">
            Start Browsing
          </button>
        </div>
      </section>

      <!-- Progress dots -->
      <div class="progress-dots">
        <span class="dot active" data-slide="1"></span>
        <span class="dot" data-slide="2"></span>
        <span class="dot" data-slide="3"></span>
        <span class="dot" data-slide="4"></span>
        <span class="dot" data-slide="5"></span>
      </div>
    </div>
    <script src="storage.js"></script>
    <script src="onboarding.js"></script>
  </body>
</html>
```

**New File: `onboarding.css`**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: linear-gradient(135deg, #1a1a1b 0%, #272729 100%);
  color: #d7dadc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-container {
  max-width: 600px;
  width: 100%;
  padding: 40px;
  position: relative;
}

.slide {
  display: none;
  animation: fadeIn 0.3s ease;
}

.slide.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-content {
  text-align: center;
  margin-bottom: 40px;
}

.hero-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

h1 {
  font-size: 28px;
  color: #ff4500;
  margin-bottom: 16px;
}

h2 {
  font-size: 24px;
  margin-bottom: 12px;
}

p {
  font-size: 16px;
  color: #818384;
  line-height: 1.6;
}

.hero-text {
  font-size: 18px;
  margin-bottom: 24px;
}

.feature-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge {
  background: #343536;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.keyboard-visual {
  margin: 20px 0;
}

.keyboard-visual kbd {
  display: inline-block;
  background: #343536;
  border: 1px solid #4a4a4c;
  border-radius: 6px;
  padding: 12px 20px;
  font-family: monospace;
  font-size: 18px;
  margin: 0 4px;
  box-shadow: 0 2px 0 #4a4a4c;
}

.feature-list {
  list-style: none;
  text-align: left;
  max-width: 300px;
  margin: 20px auto;
}

.feature-list li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
}

.feature-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #ff4500;
}

.demo-image {
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.context-menu-visual {
  background: #272729;
  border-radius: 8px;
  padding: 8px 0;
  display: inline-block;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.menu-item {
  padding: 10px 24px;
  font-size: 14px;
}

.menu-item.highlight {
  background: #343536;
  color: #ff4500;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  cursor: pointer;
}

.btn-group {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: #ff4500;
  color: white;
}

.btn.primary:hover {
  background: #ff5722;
}

.btn.secondary {
  background: #343536;
  color: #d7dadc;
}

.btn.secondary:hover {
  background: #4a4a4c;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #343536;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #ff4500;
  width: 24px;
  border-radius: 4px;
}
```

**New File: `onboarding.js`**

```javascript
"use strict";

(function () {
  let currentSlide = 1;
  const totalSlides = 5;

  function showSlide(n) {
    document
      .querySelectorAll(".slide")
      .forEach((s) => s.classList.remove("active"));
    document
      .querySelectorAll(".dot")
      .forEach((d) => d.classList.remove("active"));

    const slide = document.querySelector(`[data-slide="${n}"]`);
    const dot = document.querySelector(`.dot[data-slide="${n}"]`);

    if (slide) slide.classList.add("active");
    if (dot) dot.classList.add("active");

    currentSlide = n;
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      showSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      showSlide(currentSlide - 1);
    }
  }

  async function finishOnboarding() {
    // Save onboarding preference
    const enableNotifications = document.getElementById(
      "enable-notifications"
    ).checked;

    if (enableNotifications) {
      const prefs = await window.Storage.getUIPreferences();
      prefs.showNotifications = true;
      await window.Storage.setUIPreferences(prefs);
    }

    // Mark onboarding complete
    await window.Storage.set("onboardingComplete", true);

    // Close tab
    window.close();
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  // Event listeners
  document.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (!action) return;

    switch (action) {
      case "next":
        nextSlide();
        break;
      case "prev":
        prevSlide();
        break;
      case "close":
        finishOnboarding();
        break;
      case "options":
        openOptions();
        break;
    }
  });

  // Dot navigation
  document.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      const slide = parseInt(dot.dataset.slide, 10);
      showSlide(slide);
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "Enter" && currentSlide === totalSlides) finishOnboarding();
  });
})();
```

**Background.js Update:**

```javascript
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Check if onboarding already shown (shouldn't happen on fresh install)
    const complete = await Storage.get("onboardingComplete", false);
    if (!complete) {
      // Open onboarding page
      chrome.tabs.create({ url: "onboarding.html" });
    }
  }
  // ... rest of onInstalled handler
});
```

**Testing Requirements:**

- Test: Fresh install opens onboarding
- Test: Update from v4.x doesn't show onboarding
- Test: All slides navigate correctly
- Test: Keyboard navigation works
- Test: Settings save correctly
- Test: Close/Options buttons work

**Files Created:**

- `onboarding.html`
- `onboarding.css`
- `onboarding.js`
- `img/popup-preview.png` (screenshot needed)

**Files Modified:**

- `background.js` - Open onboarding on install
- `storage.js` - Add onboardingComplete flag

---

### 3.2 URL Testing Tool

**Priority:** Medium
**Files:** `options.html`, `options.js`, `options.css`

**Purpose:**
Let users test if a URL would redirect without visiting it.

**UI Addition to Options Page:**

```html
<section class="setting">
  <h2>Test a URL</h2>
  <p class="section-description">
    Check if a URL would be redirected before visiting it.
  </p>

  <div class="url-test-container">
    <div class="input-row">
      <input
        type="url"
        id="test-url-input"
        class="text-input"
        placeholder="https://reddit.com/r/news"
      />
      <button class="button" id="test-url-btn">Test</button>
    </div>

    <div class="test-result" id="test-result" hidden>
      <div class="result-icon" id="result-icon"></div>
      <div class="result-text">
        <p id="result-message"></p>
        <p class="result-detail" id="result-detail"></p>
      </div>
    </div>
  </div>
</section>
```

**CSS Addition:**

```css
.url-test-container {
  margin-top: 16px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row .text-input {
  flex: 1;
}

.test-result {
  margin-top: 16px;
  padding: 16px;
  background: #1a1a1b;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.result-icon {
  font-size: 24px;
  line-height: 1;
}

.result-icon.redirect {
  color: #4caf50;
}
.result-icon.allow {
  color: #ff9800;
}
.result-icon.error {
  color: #d14343;
}

.result-text {
  flex: 1;
}

.result-detail {
  font-size: 12px;
  color: #818384;
  margin-top: 4px;
}
```

**JavaScript Implementation:**

```javascript
// URL patterns from rules.json (simplified for testing)
const URL_PATTERNS = {
  allowlist: [
    /\/media\b/,
    /\/mod\b/,
    /\/poll\b/,
    /\/settings\b/,
    /\/topics\b/,
    /\/notifications\b/,
    /\/message\/compose/,
    // ... more patterns
  ],
  subdomainRedirect: /^(www|np|nr|ns|amp|i|m)\.reddit\.com$/,
  galleryRedirect: /\/gallery\/[a-zA-Z0-9_-]+/,
  videoRedirect: /\/videos?\/[a-zA-Z0-9_-]+/,
};

async function testUrl() {
  const input = document.getElementById("test-url-input");
  const resultDiv = document.getElementById("test-result");
  const resultIcon = document.getElementById("result-icon");
  const resultMessage = document.getElementById("result-message");
  const resultDetail = document.getElementById("result-detail");

  const urlString = input.value.trim();
  if (!urlString) {
    showTestError("Please enter a URL");
    return;
  }

  let url;
  try {
    url = new URL(urlString);
  } catch {
    showTestError("Invalid URL format");
    return;
  }

  // Check if it's a Reddit URL
  if (!url.hostname.includes("reddit.com")) {
    showTestResult(
      "skip",
      "Not a Reddit URL",
      "Only Reddit URLs are affected by this extension"
    );
    return;
  }

  // Check if already old.reddit.com
  if (url.hostname === "old.reddit.com") {
    showTestResult(
      "skip",
      "Already old Reddit",
      "This URL is already on old.reddit.com"
    );
    return;
  }

  // Check whitelist
  const overrides = await window.Storage.getSubredditOverrides();
  const subredditMatch = url.pathname.match(/^\/r\/([^/?#]+)/);
  if (
    subredditMatch &&
    overrides.whitelist.includes(subredditMatch[1].toLowerCase())
  ) {
    showTestResult(
      "allow",
      "Whitelisted subreddit",
      `r/${subredditMatch[1]} is in your exceptions list`
    );
    return;
  }

  // Check allowlist paths
  for (const pattern of URL_PATTERNS.allowlist) {
    if (pattern.test(url.pathname)) {
      showTestResult(
        "allow",
        "Allowlisted path",
        "This path doesn't exist on old Reddit and won't be redirected"
      );
      return;
    }
  }

  // Check special redirects
  if (URL_PATTERNS.galleryRedirect.test(url.pathname)) {
    showTestResult(
      "redirect",
      "Will redirect (gallery → comments)",
      `→ old.reddit.com${url.pathname.replace(/\/gallery\//, "/comments/")}`
    );
    return;
  }

  if (URL_PATTERNS.videoRedirect.test(url.pathname)) {
    showTestResult(
      "redirect",
      "Will redirect (video → comments)",
      `→ old.reddit.com${url.pathname.replace(/\/videos?\//, "/comments/")}`
    );
    return;
  }

  // Standard redirect
  showTestResult(
    "redirect",
    "Will redirect to old Reddit",
    `→ old.reddit.com${url.pathname}${url.search}`
  );
}

function showTestResult(type, message, detail) {
  const icons = { redirect: "✅", allow: "⚠️", skip: "ℹ️", error: "❌" };

  document.getElementById("test-result").hidden = false;
  document.getElementById("result-icon").textContent = icons[type];
  document.getElementById("result-icon").className = `result-icon ${type}`;
  document.getElementById("result-message").textContent = message;
  document.getElementById("result-detail").textContent = detail;
}

function showTestError(message) {
  showTestResult("error", message, "");
}

// Event listeners
document.getElementById("test-url-btn").addEventListener("click", testUrl);
document.getElementById("test-url-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") testUrl();
});
```

**Testing Requirements:**

- Test: Standard Reddit URL shows redirect
- Test: Whitelisted subreddit shows allow
- Test: Allowlisted path shows allow
- Test: Gallery URL shows correct redirect
- Test: Invalid URL shows error
- Test: Non-Reddit URL shows skip

**Files Modified:**

- `options.html`
- `options.js`
- `options.css`

---

### 3.3 Smart Allowlist Suggestions

**Priority:** Medium
**Files:** `options.html`, `options.js`, new `suggestions.js`

**Purpose:**
Help users discover subreddits that benefit from new Reddit features.

**New File: `suggestions.js`**

```javascript
"use strict";

/**
 * Curated list of subreddits that use new Reddit features
 * This list is static but can be updated with extension updates
 */
const SUGGESTED_SUBREDDITS = [
  {
    name: "wallstreetbets",
    reason: "Predictions, polls, and live discussions",
    category: "finance",
  },
  {
    name: "nba",
    reason: "Game threads with live comments and polls",
    category: "sports",
  },
  {
    name: "nfl",
    reason: "Game threads with predictions",
    category: "sports",
  },
  {
    name: "soccer",
    reason: "Match threads with live features",
    category: "sports",
  },
  {
    name: "cryptocurrency",
    reason: "Polls and moon distribution",
    category: "finance",
  },
  {
    name: "polls",
    reason: "Entire subreddit is poll-based",
    category: "polls",
  },
  {
    name: "predictions",
    reason: "Prediction tournaments",
    category: "polls",
  },
  {
    name: "rpan",
    reason: "Reddit Public Access Network (live streaming)",
    category: "streaming",
  },
  {
    name: "pan",
    reason: "Reddit Public Access Network content",
    category: "streaming",
  },
  {
    name: "theredditsynth",
    reason: "Live audio features",
    category: "streaming",
  },
];

const Suggestions = {
  /**
   * Get suggestions not already in whitelist
   */
  async getAvailableSuggestions() {
    const { whitelist } = await window.Storage.getSubredditOverrides();
    const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

    return SUGGESTED_SUBREDDITS.filter(
      (s) => !whitelistSet.has(s.name.toLowerCase())
    );
  },

  /**
   * Get all suggestions
   */
  getAll() {
    return SUGGESTED_SUBREDDITS;
  },

  /**
   * Get suggestions by category
   */
  getByCategory(category) {
    return SUGGESTED_SUBREDDITS.filter((s) => s.category === category);
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SUGGESTED_SUBREDDITS, Suggestions };
} else {
  window.Suggestions = Suggestions;
}
```

**UI Addition to Options Page:**

```html
<!-- In Subreddit Exceptions section -->
<div class="suggestions-container" id="suggestions-container">
  <h3>Suggested Exceptions</h3>
  <p class="suggestion-description">
    These subreddits use new Reddit features. Click to add.
  </p>
  <div class="suggestion-chips" id="suggestion-chips">
    <!-- Populated by JS -->
  </div>
</div>
```

**CSS Addition:**

```css
.suggestions-container {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #343536;
}

.suggestion-description {
  font-size: 12px;
  color: #818384;
  margin-bottom: 12px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #1a1a1b;
  border: 1px solid #343536;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  border-color: #ff4500;
  background: #272729;
}

.suggestion-chip .plus {
  color: #ff4500;
  font-weight: bold;
}

.suggestion-chip .reason {
  font-size: 11px;
  color: #818384;
  max-width: 0;
  overflow: hidden;
  transition: max-width 0.3s;
}

.suggestion-chip:hover .reason {
  max-width: 200px;
  margin-left: 4px;
}
```

**JavaScript Implementation:**

```javascript
async function loadSuggestions() {
  const container = document.getElementById("suggestion-chips");
  const suggestions = await window.Suggestions.getAvailableSuggestions();

  if (suggestions.length === 0) {
    document.getElementById("suggestions-container").hidden = true;
    return;
  }

  container.innerHTML = "";

  for (const suggestion of suggestions.slice(0, 6)) {
    // Limit to 6
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.innerHTML = `
      <span class="plus">+</span>
      <span>r/${escapeHtml(suggestion.name)}</span>
      <span class="reason">- ${escapeHtml(suggestion.reason)}</span>
    `;
    chip.addEventListener("click", () => addSuggestion(suggestion.name));
    container.appendChild(chip);
  }
}

async function addSuggestion(subreddit) {
  const overrides = await window.Storage.getSubredditOverrides();

  if (!overrides.whitelist.includes(subreddit.toLowerCase())) {
    overrides.whitelist.push(subreddit.toLowerCase());
    await window.Storage.setSubredditOverrides(overrides);
    await chrome.runtime.sendMessage({ type: "UPDATE_SUBREDDIT_RULES" });
    await loadWhitelist();
    await loadSuggestions(); // Refresh suggestions
    showToast(`r/${subreddit} added to exceptions`);
  }
}
```

**Testing Requirements:**

- Test: Suggestions appear for subreddits not in whitelist
- Test: Click adds subreddit and removes from suggestions
- Test: Suggestion chips show reason on hover
- Test: Empty state when all suggestions added

**Files Created:**

- `suggestions.js`

**Files Modified:**

- `options.html`
- `options.js`
- `options.css`

---

### Phase 3 Summary

| Item                            | Priority | Complexity | Files                                       |
| ------------------------------- | -------- | ---------- | ------------------------------------------- |
| 3.1 First-Run Onboarding        | High     | High       | onboarding.html/css/js (new), background.js |
| 3.2 URL Testing Tool            | Medium   | Medium     | options.html/js/css                         |
| 3.3 Smart Allowlist Suggestions | Medium   | Low        | suggestions.js (new), options.html/js/css   |

**Phase 3 Testing Checklist:**

- [ ] Onboarding shows on fresh install only
- [ ] Onboarding slides work correctly
- [ ] URL tester identifies all redirect types
- [ ] Suggestions update when whitelist changes

---

## Phase 4: Advanced Features

**Goal:** Add significant new capabilities.
**Target Version:** v5.0.0 (continued)
**Dependencies:** Phases 1-3 complete

---

### 4.1 Alternative Frontend Support

**Priority:** High
**Complexity:** High
**Files:** New `frontends.js`, updates to `background.js`, `options.html/js/css`, `storage.js`

**Overview:**
Allow users to redirect to privacy-focused frontends (Teddit, LibReddit, Redlib) instead of old.reddit.com.

**New File: `frontends.js`**

```javascript
"use strict";

/**
 * Supported Reddit frontend definitions
 */
const FRONTENDS = {
  "old.reddit.com": {
    id: "old",
    name: "Old Reddit",
    description: "Official old Reddit interface",
    domain: "old.reddit.com",
    requiresPermission: false,
    pathMapping: null, // 1:1 mapping
    features: {
      subreddits: true,
      users: true,
      comments: true,
      search: true,
      moderation: true,
    },
  },

  "teddit.net": {
    id: "teddit",
    name: "Teddit",
    description: "Privacy-focused, no JavaScript required",
    domain: "teddit.net",
    requiresPermission: true,
    pathMapping: null, // 1:1 mapping
    features: {
      subreddits: true,
      users: true,
      comments: true,
      search: true,
      moderation: false,
    },
    instances: ["teddit.net", "teddit.ggc-project.de", "teddit.zaggy.nl"],
  },

  "libreddit.spike.codes": {
    id: "libreddit",
    name: "LibReddit",
    description: "Privacy-respecting alternative frontend",
    domain: "libreddit.spike.codes",
    requiresPermission: true,
    pathMapping: null,
    features: {
      subreddits: true,
      users: true,
      comments: true,
      search: true,
      moderation: false,
    },
    instances: [
      "libreddit.spike.codes",
      "libreddit.kavin.rocks",
      "reddit.invak.id",
    ],
  },

  "redlib.catsarch.com": {
    id: "redlib",
    name: "Redlib",
    description: "LibReddit fork with improvements",
    domain: "redlib.catsarch.com",
    requiresPermission: true,
    pathMapping: null,
    features: {
      subreddits: true,
      users: true,
      comments: true,
      search: true,
      moderation: false,
    },
    instances: ["redlib.catsarch.com", "redlib.perennialte.ch"],
  },

  custom: {
    id: "custom",
    name: "Custom Instance",
    description: "Self-hosted or other instance",
    domain: null, // User-specified
    requiresPermission: true,
    pathMapping: null,
    features: {
      subreddits: true,
      users: true,
      comments: true,
      search: true,
      moderation: false,
    },
  },
};

const Frontends = {
  getAll() {
    return FRONTENDS;
  },

  getById(id) {
    return Object.values(FRONTENDS).find((f) => f.id === id);
  },

  getByDomain(domain) {
    return FRONTENDS[domain] || null;
  },

  getInstances(id) {
    const frontend = this.getById(id);
    return frontend?.instances || [];
  },

  requiresPermission(id) {
    const frontend = this.getById(id);
    return frontend?.requiresPermission || false;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { FRONTENDS, Frontends };
} else {
  window.Frontends = Frontends;
  window.FRONTENDS = FRONTENDS;
}
```

**Storage Schema Update:**

```javascript
// In storage.js DEFAULTS
{
  frontend: {
    target: "old.reddit.com",
    customDomain: null,
    instance: null // For frontends with multiple instances
  }
}
```

**Options UI Addition:**

```html
<section class="setting">
  <h2>Reddit Frontend</h2>
  <p class="section-description">
    Choose which Reddit frontend to redirect to.
  </p>

  <div class="frontend-options" id="frontend-options">
    <!-- Populated by JS -->
  </div>

  <div class="custom-domain-row" id="custom-domain-section" hidden>
    <label for="custom-domain">Custom Domain</label>
    <input
      type="text"
      id="custom-domain"
      class="text-input"
      placeholder="example.com"
    />
    <p class="help-text">Enter domain without https:// prefix</p>
    <button class="button" id="save-custom-domain">Save</button>
  </div>

  <div class="instance-selector" id="instance-section" hidden>
    <label for="instance-select">Instance</label>
    <select id="instance-select" class="select-input">
      <!-- Populated by JS -->
    </select>
    <p class="help-text">Different instances may have different availability</p>
  </div>

  <div class="permission-notice" id="permission-notice" hidden>
    <p>⚠️ This frontend requires additional permissions.</p>
    <button class="button" id="request-permission">Grant Permission</button>
  </div>
</section>
```

**CSS Addition:**

```css
.frontend-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.frontend-card {
  background: #1a1a1b;
  border: 2px solid #343536;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.frontend-card:hover {
  border-color: #4a4a4c;
}

.frontend-card.selected {
  border-color: #ff4500;
  background: #272729;
}

.frontend-card input {
  display: none;
}

.frontend-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.frontend-description {
  font-size: 12px;
  color: #818384;
}

.frontend-features {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.feature-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #343536;
  border-radius: 4px;
}

.feature-badge.missing {
  opacity: 0.5;
  text-decoration: line-through;
}

.permission-notice {
  margin-top: 16px;
  padding: 12px;
  background: #332211;
  border: 1px solid #ff9800;
  border-radius: 8px;
}

.permission-notice p {
  margin-bottom: 8px;
}
```

**JavaScript Implementation:**

```javascript
async function loadFrontendOptions() {
  const container = document.getElementById("frontend-options");
  const frontendConfig = await window.Storage.getFrontend();
  const frontends = window.Frontends.getAll();

  container.innerHTML = "";

  for (const [domain, frontend] of Object.entries(frontends)) {
    const card = document.createElement("label");
    card.className = `frontend-card ${frontendConfig.target === domain ? "selected" : ""}`;

    const features = Object.entries(frontend.features)
      .map(
        ([name, supported]) =>
          `<span class="feature-badge ${supported ? "" : "missing"}">${name}</span>`
      )
      .join("");

    card.innerHTML = `
      <input type="radio"
             name="frontend"
             value="${escapeHtml(domain)}"
             ${frontendConfig.target === domain ? "checked" : ""}>
      <div class="frontend-name">${escapeHtml(frontend.name)}</div>
      <div class="frontend-description">${escapeHtml(frontend.description)}</div>
      <div class="frontend-features">${features}</div>
    `;

    card.querySelector("input").addEventListener("change", () => {
      selectFrontend(domain);
    });

    container.appendChild(card);
  }

  // Update UI based on selection
  updateFrontendUI(frontendConfig);
}

async function selectFrontend(domain) {
  const frontend =
    window.Frontends.getByDomain(domain) ||
    window.Frontends.getById(domain === "custom" ? "custom" : null);

  // Check if permission needed
  if (frontend?.requiresPermission && domain !== "custom") {
    const hasPermission = await checkPermission(domain);
    if (!hasPermission) {
      showPermissionNotice(domain);
      return;
    }
  }

  // Update selection
  document
    .querySelectorAll(".frontend-card")
    .forEach((c) => c.classList.remove("selected"));
  document
    .querySelector(`input[value="${domain}"]`)
    ?.closest(".frontend-card")
    ?.classList.add("selected");

  // Save config
  const config = {
    target: domain,
    customDomain: null,
    instance: null,
  };

  await window.Storage.setFrontend(config);

  // Update rules
  await chrome.runtime.sendMessage({ type: "UPDATE_FRONTEND_RULES" });

  // Update UI
  updateFrontendUI(config);

  showToast(`Now redirecting to ${frontend?.name || domain}`);
}

async function checkPermission(domain) {
  return new Promise((resolve) => {
    chrome.permissions.contains(
      {
        origins: [`*://${domain}/*`, `*://*.${domain}/*`],
      },
      resolve
    );
  });
}

async function requestPermission(domain) {
  const granted = await new Promise((resolve) => {
    chrome.permissions.request(
      {
        origins: [`*://${domain}/*`, `*://*.${domain}/*`],
      },
      resolve
    );
  });

  if (granted) {
    hidePermissionNotice();
    await selectFrontend(domain);
  } else {
    showToast("Permission denied. Using old Reddit instead.", "error");
  }
}

function updateFrontendUI(config) {
  // Show/hide custom domain section
  document.getElementById("custom-domain-section").hidden =
    config.target !== "custom";

  // Show/hide instance selector
  const frontend = window.Frontends.getByDomain(config.target);
  const instances = frontend?.instances || [];
  const instanceSection = document.getElementById("instance-section");

  if (instances.length > 1) {
    instanceSection.hidden = false;
    const select = document.getElementById("instance-select");
    select.innerHTML = instances
      .map(
        (i) =>
          `<option value="${escapeHtml(i)}" ${config.instance === i ? "selected" : ""}>${escapeHtml(i)}</option>`
      )
      .join("");
  } else {
    instanceSection.hidden = true;
  }

  // Hide permission notice
  document.getElementById("permission-notice").hidden = true;
}
```

**Background.js Update - Dynamic Frontend Rules:**

```javascript
const FRONTEND_RULE_ID_BASE = 2000;

async function updateFrontendRules() {
  const frontendConfig = await Storage.getFrontend();
  let targetDomain = frontendConfig.target;

  // Handle custom domain
  if (targetDomain === "custom") {
    targetDomain = frontendConfig.customDomain;
    if (!targetDomain) {
      Logger.warn("Custom frontend selected but no domain set");
      return;
    }
  }

  // Handle instance selection
  if (frontendConfig.instance) {
    targetDomain = frontendConfig.instance;
  }

  // If using old.reddit.com, just enable static ruleset
  if (targetDomain === "old.reddit.com") {
    await enableStaticRuleset();
    await clearDynamicFrontendRules();
    return;
  }

  // For other frontends, disable static and use dynamic
  await disableStaticRuleset();
  await createDynamicFrontendRules(targetDomain);
}

async function createDynamicFrontendRules(targetDomain) {
  // Clear existing
  await clearDynamicFrontendRules();

  // Create rules that mirror rules.json but with different target
  const rules = [
    // Main domain redirects
    {
      id: FRONTEND_RULE_ID_BASE,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { transform: { host: targetDomain } }
      },
      condition: {
        regexFilter: "^https?://(www|np|nr|ns|amp|i|m)\\.reddit\\.com/(.*)$",
        resourceTypes: ["main_frame"]
      }
    },
    // Bare domain
    {
      id: FRONTEND_RULE_ID_BASE + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { transform: { host: targetDomain } }
      },
      condition: {
        urlFilter: "||reddit.com/*",
        excludedInitiatorDomains: ["reddit.com"],
        resourceTypes: ["main_frame"]
      }
    },
    // Gallery redirect
    {
      id: FRONTEND_RULE_ID_BASE + 2,
      priority: 2,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: `https://${targetDomain}/comments/\\2`
        }
      },
      condition: {
        regexFilter: "^https?://(?:www\\.)?reddit\\.com/(gallery)/([a-zA-Z0-9_-]+)/?$",
        resourceTypes: ["main_frame"]
      }
    },
    // Video redirect
    {
      id: FRONTEND_RULE_ID_BASE + 3,
      priority: 2,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: `https://${targetDomain}/comments/\\2`
        }
      },
      condition: {
        regexFilter: "^https?://(?:www\\.)?reddit\\.com/(videos?)/([a-zA-Z0-9_-]+)/?$",
        resourceTypes: ["main_frame"]
      }
    }
  ];

  await new Promise((resolve) => {
    chrome.declarativeNetRequest.updateDynamicRules(
      { addRules: rules },
      () => {
        Logger.handleChromeError("createDynamicFrontendRules");
        resolve();
      }
    );
  });
}

async function clearDynamicFrontendRules() {
  const existingRules = await new Promise((resolve) => {
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      Logger.handleChromeError("getDynamicRules");
      resolve(rules || []);
    });
  });

  const frontendRuleIds = existingRules
    .filter(r => r.id >= FRONTEND_RULE_ID_BASE && r.id < FRONTEND_RULE_ID_BASE + 100)
    .map(r => r.id);

  if (frontendRuleIds.length > 0) {
    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateDynamicRules(
        { removeRuleIds: frontendRuleIds },
        () => {
          Logger.handleChromeError("clearDynamicFrontendRules");
          resolve();
        }
      );
    });
  }
}

async function enableStaticRuleset() {
  await new Promise((resolve) => {
    chrome.declarativeNetRequest.updateEnabledRulesets(
      { enableRulesetIds: [RULESET_ID] },
      () => {
        Logger.handleChromeError("enableStaticRuleset");
        resolve();
      }
    );
  });
}

async function disableStaticRuleset() {
  await new Promise((resolve) => {
    chrome.declarativeNetRequest.updateEnabledRulesets(
      { disableRulesetIds: [RULESET_ID] },
      () => {
        Logger.handleChromeError("disableStaticRuleset");
        resolve();
      }
    );
  });
}

// Message handler
case "UPDATE_FRONTEND_RULES":
  await updateFrontendRules();
  sendResponse({ success: true });
  break;
```

**Testing Requirements:**

- Test: Selecting Teddit redirects to teddit.net
- Test: Selecting LibReddit redirects to libreddit.spike.codes
- Test: Custom domain works with valid input
- Test: Permission prompt appears for alternative frontends
- Test: Denying permission falls back gracefully
- Test: Instance selector works for multi-instance frontends
- Test: Switching back to old.reddit.com restores static rules
- Test: All redirect types work (gallery, video, etc.) on alternative frontends

**Files Created:**

- `frontends.js`

**Files Modified:**

- `storage.js` - Frontend config schema
- `options.html` - Frontend selection UI
- `options.js` - Frontend handlers
- `options.css` - Frontend cards
- `background.js` - Dynamic frontend rules

---

### 4.2 Statistics Visualization

**Priority:** Medium
**Complexity:** Medium
**Files:** `options.html`, `options.js`, `options.css`

**Overview:**
Add visual charts for redirect statistics (weekly trend, top subreddits).

**UI Addition - Weekly Chart:**

```html
<!-- In Statistics section -->
<div class="chart-container">
  <h3>Last 7 Days</h3>
  <div class="bar-chart" id="weekly-chart">
    <!-- Populated by JS -->
  </div>
</div>
```

**CSS Addition:**

```css
.chart-container {
  margin: 20px 0;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100px;
  padding: 10px 0;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #ff4500, #ff6b3d);
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 10px;
  color: #818384;
}

.bar-value {
  font-size: 11px;
  color: #d7dadc;
  font-weight: 500;
}

/* Top subreddits with bars */
.subreddit-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #1a1a1b;
  border-radius: 4px;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}

.subreddit-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(255, 69, 0, 0.15);
  z-index: 0;
  transition: width 0.3s ease;
}

.subreddit-list li > * {
  position: relative;
  z-index: 1;
}
```

**JavaScript Implementation:**

```javascript
async function loadStats() {
  const stats = await window.Storage.getStats();

  // Update numbers
  document.getElementById("total-redirects").textContent = formatNumber(
    stats.totalRedirects || 0
  );
  document.getElementById("today-redirects").textContent = formatNumber(
    stats.todayRedirects || 0
  );

  // Render weekly chart
  renderWeeklyChart(stats.weeklyHistory || []);

  // Render top subreddits with bars
  renderTopSubreddits(stats.perSubreddit || {});
}

function renderWeeklyChart(history) {
  const container = document.getElementById("weekly-chart");

  // Get last 7 days
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const entry = history.find((h) => h.date === dateStr);
    days.push({
      date: dateStr,
      day: dayNames[date.getDay()],
      count: entry?.count || 0,
    });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  container.innerHTML = days
    .map((d) => {
      const height = (d.count / maxCount) * 80; // Max 80px height
      return `
      <div class="bar-wrapper">
        <span class="bar-value">${d.count || ""}</span>
        <div class="bar" style="height: ${Math.max(height, 2)}px"></div>
        <span class="bar-label">${d.day}</span>
      </div>
    `;
    })
    .join("");
}

function renderTopSubreddits(perSubreddit) {
  const entries = Object.entries(perSubreddit);
  entries.sort((a, b) => b[1] - a[1]);

  const list = document.getElementById("top-subreddits");
  const emptyState = document.getElementById("subreddit-empty");

  if (entries.length === 0) {
    list.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  const maxCount = entries[0][1];

  list.innerHTML = entries
    .slice(0, 10)
    .map(([subreddit, count]) => {
      const percentage = (count / maxCount) * 100;
      return `
      <li>
        <div class="subreddit-bar" style="width: ${percentage}%"></div>
        <span class="subreddit-name">r/${escapeHtml(subreddit)}</span>
        <span class="subreddit-count">${formatNumber(count)}</span>
      </li>
    `;
    })
    .join("");
}
```

**Popup Enhancement - Mini Sparkline:**

```html
<!-- In popup stats section -->
<div class="mini-chart" id="mini-chart">
  <!-- Populated by JS - simple sparkline -->
</div>
```

```css
/* In popup.css */
.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
  margin-top: 8px;
}

.mini-bar {
  flex: 1;
  background: #ff4500;
  border-radius: 2px;
  min-height: 2px;
}
```

```javascript
// In popup.js
async function renderMiniChart() {
  const stats = await window.Storage.getStats();
  const history = stats.weeklyHistory || [];
  const container = document.getElementById("mini-chart");

  // Last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const entry = history.find((h) => h.date === dateStr);
    days.push(entry?.count || 0);
  }

  const max = Math.max(...days, 1);

  container.innerHTML = days
    .map((count) => {
      const height = (count / max) * 20;
      return `<div class="mini-bar" style="height: ${Math.max(height, 2)}px"></div>`;
    })
    .join("");
}
```

**Testing Requirements:**

- Test: Weekly chart displays correctly
- Test: Chart handles empty history
- Test: Bars scale relative to max
- Test: Top subreddits show percentage bars
- Test: Mini sparkline in popup works

**Files Modified:**

- `options.html`
- `options.js`
- `options.css`
- `popup.html`
- `popup.js`
- `popup.css`

---

### Phase 4 Summary

| Item                             | Priority | Complexity | Files                                                              |
| -------------------------------- | -------- | ---------- | ------------------------------------------------------------------ |
| 4.1 Alternative Frontend Support | High     | High       | frontends.js (new), storage.js, options.html/js/css, background.js |
| 4.2 Statistics Visualization     | Medium   | Medium     | options.html/js/css, popup.html/js/css                             |

**Phase 4 Testing Checklist:**

- [ ] All alternative frontends work correctly
- [ ] Custom domain validation works
- [ ] Permission flow works smoothly
- [ ] Weekly chart renders correctly
- [ ] Subreddit bars scale correctly
- [ ] Mini sparkline works in popup

---

## Implementation Schedule

```
v4.1.0 (Phase 1 - Critical Fixes)
├── 1.1 Storage Race Condition Fix
├── 1.2 Gallery/Video Regex Fix
├── 1.3 Error Logging
├── 1.4 Popup Shortcut Fix
├── 1.5 Clipboard API Implementation
└── 1.6 Icon-Click Toggle Option

v4.2.0 (Phase 2 - URL Handling)
├── 2.1 Share Link Conversion
└── 2.2 Mobile Reddit Link Handling

v5.0.0 (Phases 3-4 - Major Features)
├── 3.1 First-Run Onboarding
├── 3.2 URL Testing Tool
├── 3.3 Smart Allowlist Suggestions
├── 4.1 Alternative Frontend Support
└── 4.2 Statistics Visualization
```

---

## Files Summary

### New Files (11)

| File                    | Phase | Purpose                   |
| ----------------------- | ----- | ------------------------- |
| `logger.js`             | 1.3   | Centralized logging       |
| `offscreen.html`        | 1.5   | Clipboard API             |
| `offscreen.js`          | 1.5   | Clipboard API             |
| `share-link-handler.js` | 2.1   | Share link content script |
| `onboarding.html`       | 3.1   | Welcome page              |
| `onboarding.css`        | 3.1   | Welcome page styles       |
| `onboarding.js`         | 3.1   | Welcome page logic        |
| `suggestions.js`        | 3.3   | Allowlist suggestions     |
| `frontends.js`          | 4.1   | Frontend definitions      |
| `img/popup-preview.png` | 3.1   | Onboarding screenshot     |

### Modified Files (10)

| File            | Phases                  | Changes                               |
| --------------- | ----------------------- | ------------------------------------- |
| `storage.js`    | 1.1, 1.6, 4.1           | Race condition fix, new config fields |
| `rules.json`    | 1.2, 2.1, 2.2           | Regex fixes, mobile domain            |
| `manifest.json` | 1.5, 2.1, 2.2, 4.1      | Permissions, content scripts          |
| `background.js` | 1.3, 1.5, 1.6, 2.1, 4.1 | Logging, clipboard, frontend rules    |
| `popup.html`    | 1.4, 4.2                | Dynamic shortcut, mini chart          |
| `popup.js`      | 1.4, 4.2                | Shortcut loading, sparkline           |
| `popup.css`     | 4.2                     | Mini chart styles                     |
| `options.html`  | 1.6, 3.2, 3.3, 4.1, 4.2 | All new UI sections                   |
| `options.js`    | 1.6, 3.2, 3.3, 4.1, 4.2 | All new handlers                      |
| `options.css`   | 3.2, 3.3, 4.1, 4.2      | All new styles                        |

---

## Testing Strategy

### Unit Tests (vitest)

- `tests/storage.test.js` - Race condition, sync logic
- `tests/frontends.test.js` - Frontend definitions, domain mapping
- `tests/suggestions.test.js` - Suggestion filtering
- `tests/patterns.test.js` - Updated for new regex patterns

### Integration Tests

- Test full redirect flow for each frontend
- Test permission request/denial flow
- Test onboarding → options flow

### Manual Testing Checklist

See individual phase testing checklists above.

---

## Risk Assessment

| Risk                                          | Impact | Mitigation                                     |
| --------------------------------------------- | ------ | ---------------------------------------------- |
| Storage race condition causes data corruption | High   | Comprehensive testing, gradual rollout         |
| Alternative frontends become unavailable      | Medium | Instance selection, fallback to old.reddit.com |
| Offscreen API not supported in older Chrome   | Low    | Feature detection, fallback to notification    |
| Onboarding interrupts user flow               | Low    | One-time only, easy to skip                    |
| Share link handling causes redirect loops     | Medium | Careful testing, timeout safeguards            |

---

## Success Metrics

### v4.1.0

- Zero reports of data loss from storage issues
- Clipboard copy success rate > 95%
- Error logs available for debugging

### v4.2.0

- Share links properly redirect to old Reddit
- Mobile links work correctly

### v5.0.0

- > 50% of new users complete onboarding
- > 10% of users try alternative frontends
- Positive feedback on statistics visualization

---

**Document Version:** 1.0
**Created:** 2026-01-30
**Status:** Ready for implementation

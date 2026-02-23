# Implementation Plan: Phase 5 - Feed Enhancements & Performance

> **Version**: 11.0.0-plan-v1
> **Date**: 2026-01-30
> **Target Releases**: v11.0.0 (Feed Enhancements), v11.1.0 (Tracking Protection), v11.2.0 (Advanced Content Blocking)
> **Author**: Development Team

---

## Executive Summary

This document outlines the implementation plan for **Phase 5: Feed Enhancements & Performance** of Old Reddit Redirect. This phase focuses on improving the browsing experience on old.reddit.com through feed customization, privacy enhancements, and additional content blocking capabilities.

**Key Benefits**:

- Enhanced feed readability with compact/text-only modes
- Privacy protection through tracking parameter removal
- Cleaner browsing with advanced content blocking
- Performance improvements for large threads and feeds
- Better visual customization options

---

## Current State Assessment

### Repository Status (v10.0.0)

**Completed Work:**

- ✅ **Phase 1** (v6.0.0): Dark Mode, Enhanced Nag Blocking, Auto-collapse Bots
- ✅ **Phase 2** (v6.0.0): Subreddit/Keyword/Domain Muting
- ✅ **Phase 3** (v7.0.0-v7.2.0): Color-coded Comments, Navigation, Inline Images
- ✅ **Phase 4** (v8.0.0-v10.0.0): Sort Memory, User Tagging, Scroll Memory

**Test Coverage:**

- 270 tests across 10 test suites
- All tests passing

**Architecture:**

- Manifest V3 with declarativeNetRequest
- Service worker (background.js): 954 lines
- Content script (content-script.js): 1,521 lines
- Storage layer (storage.js): 1,094 lines
- Options page (options.js): 2,592 lines

**Key Constraints:**

- Must maintain Manifest V3 compatibility
- No breaking changes to existing features
- Performance-first approach (old.reddit.com already slow)
- Privacy-preserving (no data collection)
- Chrome/Firefox compatibility

**Assumptions:**

- Users value customization and privacy
- Feed enhancements won't conflict with existing RES users
- Performance optimizations won't break Reddit's native functionality
- Storage quota sufficient for new features (current usage modest)

**Unknown Factors:**

- Reddit's evolving promoted content strategies
- Browser API changes in future Manifest versions
- User demand for specific feed customization options

---

## Phase 5 Overview

Phase 5 is organized into 3 sequential releases:

| Release     | Focus Area         | Key Features                                                    |
| ----------- | ------------------ | --------------------------------------------------------------- |
| **v11.0.0** | Feed Enhancements  | Compact mode, text-only, uncropped images, custom CSS injection |
| **v11.1.0** | Privacy & Tracking | URL tracking parameter removal, referrer control                |
| **v11.2.0** | Advanced Blocking  | AI overviews, trending sections, "more posts" blocking          |

**Design Philosophy:**

- Build incrementally on existing infrastructure
- Each release is independently valuable
- Minimal performance overhead
- User control via toggles (sensible defaults)

---

## Feature Specification: v11.0.0 - Feed Enhancements

### Overview

Provide users with visual customization options for Reddit feeds to improve readability, information density, and browsing experience.

### User Stories

- As a user, I want a compact feed mode to see more posts per screen
- As a user, I want text-only mode to reduce distractions and focus on content
- As a user, I want full-size thumbnails instead of cropped preview images
- As a user, I want to hide repetitive UI elements that clutter the feed
- As a user, I want to customize feed appearance with custom CSS

### Feature 5.1: Compact Feed Mode

**Description:** Reduce vertical spacing and padding to show more posts per screen.

**Implementation:**

```css
/* Injected via content script when enabled */
body.orr-compact-feed .thing {
  margin-bottom: 4px !important;
  padding: 4px !important;
}

body.orr-compact-feed .entry {
  padding: 4px 8px !important;
}

body.orr-compact-feed .thumbnail {
  margin: 4px !important;
}
```

**Storage Schema:**

```javascript
feedEnhancements: {
  compactMode: false,        // Toggle compact feed
  hideJoinButtons: false,    // Hide subreddit join buttons
  hideActionLinks: false,    // Hide share/save/hide/report links
  uncropImages: false,       // Show full thumbnails
  textOnlyMode: false,       // Hide all images/thumbnails
  customCSS: "",             // User custom CSS injection
  customCSSEnabled: false,   // Toggle custom CSS
}
```

**Acceptance Criteria:**

- [ ] Compact mode reduces post height by ~30%
- [ ] Toggle persists across sessions
- [ ] Works with RES if installed (no conflicts)
- [ ] Respects user's existing custom CSS
- [ ] Can be toggled real-time via options page

### Feature 5.2: Text-Only Mode

**Description:** Hide all images and thumbnails for distraction-free reading.

**Implementation:**

```css
body.orr-text-only .thumbnail,
body.orr-text-only .expando-button,
body.orr-text-only .media-preview-content {
  display: none !important;
}

body.orr-text-only .thing {
  margin-left: 0 !important;
}
```

**Use Cases:**

- Reading on metered connections (save bandwidth)
- Focus mode for text content
- Accessibility (screen reader users)

### Feature 5.3: Uncropped Image Thumbnails

**Description:** Show full thumbnails instead of cropped squares.

**Implementation:**

```css
body.orr-uncrop-images .thumbnail img {
  max-width: none !important;
  max-height: 140px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
}
```

**Before/After:**

- **Before:** 70x70px cropped square
- **After:** Full aspect ratio, max height 140px

### Feature 5.4: Hide Clutter

**Description:** Remove repetitive UI elements that add noise.

**Options:**

- Hide "join" buttons on subreddit listings
- Hide action links (share, save, hide, report) until hover
- Hide user flair (keep post flair visible)

**Implementation:**

```css
body.orr-hide-join .subscribe-button {
  display: none !important;
}

body.orr-hide-actions .entry .buttons a {
  opacity: 0;
  transition: opacity 0.2s;
}

body.orr-hide-actions .entry:hover .buttons a {
  opacity: 1;
}
```

### Feature 5.5: Custom CSS Injection

**Description:** Advanced users can inject custom CSS for ultimate customization.

**Safety Considerations:**

- CSS only (no JavaScript execution)
- Stored locally (not synced by default for privacy)
- Clear warning about potential layout breakage
- Reset/clear button for troubleshooting

**UI:**

```html
<section class="setting">
  <h2>Custom CSS</h2>
  <p class="section-description warning">
    ⚠️ Advanced feature: Custom CSS can break page layout. Use at your own risk.
  </p>

  <label class="checkbox-label">
    <input type="checkbox" id="custom-css-enabled" />
    <span>Enable custom CSS</span>
  </label>

  <textarea
    id="custom-css"
    rows="10"
    placeholder="/* Your custom CSS here */&#10;.thing { ... }"
    spellcheck="false"
  ></textarea>

  <div class="button-row">
    <button id="save-custom-css" class="primary-button">Save CSS</button>
    <button id="clear-custom-css" class="secondary-button">Clear</button>
    <button id="validate-custom-css" class="secondary-button">Validate</button>
  </div>
</section>
```

**Validation:**

- Check for valid CSS syntax (basic parsing)
- Warn about potentially dangerous selectors
- Preview mode (apply temporarily without saving)

---

## Feature Specification: v11.1.0 - Privacy & Tracking Protection

### Overview

Remove tracking parameters from Reddit URLs and provide privacy-enhancing features.

### User Stories

- As a privacy-conscious user, I want tracking parameters removed from URLs I click
- As a user, I want to control what referrer information is sent
- As a user, I want to know when tracking has been stripped

### Feature 5.6: Tracking Parameter Removal

**Description:** Automatically strip tracking parameters from outbound links and Reddit URLs.

**Common Tracking Parameters:**

```javascript
const TRACKING_PARAMS = [
  // Reddit tracking
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_name",

  // Referral tracking
  "ref",
  "ref_source",
  "share_id",

  // Click tracking
  "click_id",
  "fbclid", // Facebook
  "gclid", // Google
  "msclkid", // Microsoft
  "twclid", // Twitter/X

  // Reddit app tracking
  "rdt_cid",
  "$deep_link",
  "$3p",
  "_branch_match_id",
  "_branch_referrer",
];
```

**Implementation Approach:**

**Option A: Content Script URL Rewriting**

```javascript
// Intercept clicks on links
document.addEventListener(
  "click",
  (e) => {
    const link = e.target.closest("a");
    if (!link || !link.href) return;

    const cleaned = removeTrackingParams(link.href);
    if (cleaned !== link.href) {
      e.preventDefault();
      link.href = cleaned;
      link.click();
    }
  },
  true
);

function removeTrackingParams(url) {
  try {
    const urlObj = new URL(url);
    TRACKING_PARAMS.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch {
    return url;
  }
}
```

**Option B: Declarative Net Request (More Efficient)**

```json
{
  "id": 100,
  "priority": 1,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "\\1"
    }
  },
  "condition": {
    "regexFilter": "^(https?://[^?]+)\\?.*utm_source.*",
    "resourceTypes": ["main_frame"]
  }
}
```

**Recommended:** Hybrid approach

- Use DNR for Reddit domain URLs (performance)
- Use content script for external links (flexibility)

**Visual Feedback:**

```javascript
// Show badge when tracking is stripped
chrome.action.setBadgeText({ text: "🛡️" });
chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
```

**Storage Schema:**

```javascript
privacy: {
  removeTracking: true,           // Enable tracking removal
  trackingParams: [...],          // Custom param list
  showTrackingBadge: true,        // Show when stripped
  cleanReferrer: false,           // Strip referrer headers
  trackingStats: {                // Count cleaned URLs
    totalCleaned: 0,
    lastCleaned: null,
  }
}
```

### Feature 5.7: Referrer Control (Advanced)

**Description:** Control what referrer information is sent when leaving Reddit.

**Options:**

- No referrer (maximum privacy)
- Origin only (domain, no path)
- Same origin (referrer only for Reddit)
- Default (browser behavior)

**Implementation:**

```javascript
// Use Referrer-Policy meta tag injection
const meta = document.createElement("meta");
meta.name = "referrer";
meta.content = "no-referrer"; // or 'origin', 'same-origin'
document.head.appendChild(meta);
```

**User Education:**

```html
<p class="option-description">
  <strong>No referrer:</strong> Maximum privacy, but may break some sites<br />
  <strong>Origin only:</strong> Sends domain (old.reddit.com) but not full
  URL<br />
  <strong>Same origin:</strong> Full referrer only within Reddit
  (recommended)<br />
  <strong>Default:</strong> Browser default behavior
</p>
```

---

## Feature Specification: v11.2.0 - Advanced Content Blocking

### Overview

Block additional Reddit promoted content and annoyances that have emerged recently.

### User Stories

- As a user, I want to hide AI-generated content summaries
- As a user, I want to block "trending" sections
- As a user, I want to hide "more posts you may like" sections
- As a user, I want granular control over what promotional content I see

### Feature 5.8: AI Overview/Answers Blocking

**Description:** Hide Reddit's AI-generated content summaries (if they appear on old Reddit).

**Current Status:** Minimal AI content on old Reddit (mostly new Reddit feature)

**Future-Proofing:**

```javascript
// Watch for AI content containers
const AI_SELECTORS = [
  ".ai-summary",
  ".reddit-answers",
  '[data-testid="ai-overview"]',
  ".ai-generated-content",
];

function blockAIContent() {
  AI_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.display = "none";
    });
  });
}
```

### Feature 5.9: Enhanced Promoted Content Blocking

**Description:** Extend Phase 1 nag blocking with additional promotional content.

**New Targets:**

- "Trending on Reddit" sidebar widgets
- "More posts from this community" sections
- "You might also like" recommendations
- Community highlights in feed
- Sticky promotional posts (beyond ads)

**CSS Selectors:**

```css
/* Trending sections */
.trending-subreddits-container,
.trending-posts,
[data-test-id="trending-container"] {
  display: none !important;
}

/* Recommendations */
.recommended-communities,
.similar-posts-container,
.more-posts-from {
  display: none !important;
}

/* Community highlights */
.community-highlight-card,
.promoted-community {
  display: none !important;
}
```

**Storage Schema Extension:**

```javascript
// Extend existing nagBlocking object
nagBlocking: {
  // ... existing fields
  blockTrending: true,
  blockRecommendations: true,
  blockCommunityHighlights: true,
  blockAIContent: true,
}
```

### Feature 5.10: "Jump to Top" Button

**Description:** Floating button to quickly scroll to top of page (separate from comment navigation).

**Differences from Phase 3 Comment Nav:**

- **Comment nav:** Navigate between comments (context-specific)
- **Jump to top:** Global scroll to top (all pages)

**Implementation:**

```javascript
// Show button when scrolled > 500px
let topButton = null;

function createTopButton() {
  const button = document.createElement("button");
  button.id = "orr-jump-top";
  button.innerHTML = "↑ Top";
  button.className = "orr-jump-top-button";
  button.style.display = "none";

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.body.appendChild(button);
  return button;
}

window.addEventListener("scroll", () => {
  const show = window.scrollY > 500;
  if (topButton) {
    topButton.style.display = show ? "block" : "none";
  }
});
```

**Position Options:**

- Bottom right (default)
- Bottom left
- Top right (when scrolled down)

**Conflict Avoidance:**

- Position differently from comment nav buttons
- Option to disable if user prefers browser/RES behavior

---

## Implementation Phases

### Phase 5.1: v11.0.0 - Feed Enhancements (Priority 1)

**Estimated Scope:** 3-5 days development

**Files to Modify:**

- `storage.js` - Add feedEnhancements schema and methods
- `content-script.js` - Add feed modification logic (~200 lines)
- `styles.css` - Add feed enhancement styles (~150 lines)
- `options.html` - Add Feed Enhancements section
- `options.js` - Add feed settings UI logic (~150 lines)
- `tests/feed-enhancements.test.js` - New test file (~30 tests)

**Implementation Steps:**

1. **Storage Schema (storage.js)**

   ```javascript
   // Add to DEFAULTS
   feedEnhancements: {
     compactMode: false,
     hideJoinButtons: false,
     hideActionLinks: false,
     uncropImages: false,
     textOnlyMode: false,
     customCSS: "",
     customCSSEnabled: false,
   }

   // Add to SYNC_KEYS (optional)
   'feedEnhancements',

   // Add storage methods
   async getFeedEnhancements() { ... }
   async setFeedEnhancements(config) { ... }
   async setCustomCSS(css) { ... }
   ```

2. **Content Script Logic (content-script.js)**

   ```javascript
   async function applyFeedEnhancements() {
     const config = await chrome.storage.local.get({ feedEnhancements: {} });
     const feed = config.feedEnhancements || {};

     // Apply class-based toggles
     document.body.classList.toggle("orr-compact-feed", feed.compactMode);
     document.body.classList.toggle("orr-text-only", feed.textOnlyMode);
     document.body.classList.toggle("orr-uncrop-images", feed.uncropImages);
     document.body.classList.toggle("orr-hide-join", feed.hideJoinButtons);
     document.body.classList.toggle("orr-hide-actions", feed.hideActionLinks);

     // Apply custom CSS
     if (feed.customCSSEnabled && feed.customCSS) {
       injectCustomCSS(feed.customCSS);
     }
   }

   function injectCustomCSS(css) {
     // Remove old custom CSS
     document.getElementById("orr-custom-css")?.remove();

     // Inject new custom CSS
     const style = document.createElement("style");
     style.id = "orr-custom-css";
     style.textContent = css;
     document.head.appendChild(style);
   }

   // Listen for settings changes
   chrome.runtime.onMessage.addListener((message) => {
     if (message.type === "REFRESH_FEED_ENHANCEMENTS") {
       applyFeedEnhancements();
     }
   });

   // Initialize
   applyFeedEnhancements();
   ```

3. **Styles (styles.css)**

   ```css
   /* Compact feed mode */
   body.orr-compact-feed .thing {
     margin-bottom: 4px !important;
     padding: 4px !important;
   }

   /* ... (full styles from spec) */
   ```

4. **Options Page UI (options.html)**

   ```html
   <section class="setting" id="feed-enhancements-section">
     <h2>Feed Enhancements</h2>
     <p class="section-description">
       Customize the appearance and layout of Reddit feeds.
     </p>

     <div class="option-row">
       <label class="checkbox-label">
         <input type="checkbox" id="feed-compact-mode" />
         <span>Compact mode</span>
       </label>
       <p class="option-description">
         Reduce spacing to show more posts per screen
       </p>
     </div>

     <!-- Additional toggles... -->

     <div class="option-row">
       <h3>Custom CSS</h3>
       <!-- Custom CSS section from spec -->
     </div>
   </section>
   ```

5. **Options Page Logic (options.js)**

   ```javascript
   async function loadFeedEnhancements() {
     const config = await window.Storage.getFeedEnhancements();

     document.getElementById("feed-compact-mode").checked = config.compactMode;
     document.getElementById("feed-text-only").checked = config.textOnlyMode;
     // ... other toggles

     document.getElementById("custom-css").value = config.customCSS || "";
     document.getElementById("custom-css-enabled").checked =
       config.customCSSEnabled;
   }

   async function handleFeedEnhancementToggle(e) {
     const config = await window.Storage.getFeedEnhancements();
     config[e.target.dataset.setting] = e.target.checked;
     await window.Storage.setFeedEnhancements(config);

     // Notify content scripts
     chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
       tabs.forEach((tab) => {
         chrome.tabs.sendMessage(tab.id, { type: "REFRESH_FEED_ENHANCEMENTS" });
       });
     });
   }

   async function handleCustomCSSValidation() {
     const css = document.getElementById("custom-css").value;

     // Basic CSS validation
     try {
       const style = document.createElement("style");
       style.textContent = css;
       document.head.appendChild(style);
       document.head.removeChild(style);

       showNotification("CSS is valid!", "success");
     } catch (error) {
       showNotification("CSS validation failed: " + error.message, "error");
     }
   }
   ```

6. **Test Suite (tests/feed-enhancements.test.js)**

   ```javascript
   import { describe, it, expect, beforeEach } from 'vitest';

   describe('Feed Enhancements - Storage', () => {
     it('should save compact mode preference', async () => { ... });
     it('should save custom CSS', async () => { ... });
     // ... ~10 tests
   });

   describe('Feed Enhancements - CSS Validation', () => {
     it('should validate correct CSS', () => { ... });
     it('should reject malformed CSS', () => { ... });
     // ... ~10 tests
   });

   describe('Feed Enhancements - Class Application', () => {
     it('should apply compact mode class', () => { ... });
     it('should remove class when disabled', () => { ... });
     // ... ~10 tests
   });
   ```

**Testing Plan:**

- Unit tests: Storage methods, CSS validation
- Integration tests: Class application, real-time updates
- Manual tests: Visual verification of each mode
- RES compatibility testing (if user has RES installed)

**Rollout Strategy:**

- All features disabled by default (opt-in)
- Add onboarding tip for new feature
- Monitor for performance issues on slower machines

**Rollback Plan:**

- Toggle off features in options
- Clear custom CSS if causing layout issues
- Storage schema is backward compatible (defaults work)

**Success Metrics:**

- No performance degradation (measure page load time)
- No layout breakage (manual testing on diverse subreddits)
- User adoption (track which features are enabled)

---

### Phase 5.2: v11.1.0 - Privacy & Tracking Protection (Priority 2)

**Estimated Scope:** 2-3 days development

**Files to Modify:**

- `storage.js` - Add privacy schema
- `background.js` - Add tracking stats collection (~50 lines)
- `content-script.js` - Add URL cleaning logic (~150 lines)
- `rules.json` - Add DNR rules for tracking params (optional)
- `options.html/js` - Add Privacy section
- `tests/privacy.test.js` - New test file (~25 tests)

**Implementation Steps:**

1. **Storage Schema**

   ```javascript
   privacy: {
     removeTracking: true,
     trackingParams: [...DEFAULT_TRACKING_PARAMS],
     showTrackingBadge: true,
     cleanReferrer: false,
     referrerPolicy: 'same-origin', // 'no-referrer', 'origin', 'same-origin', 'default'
     trackingStats: {
       totalCleaned: 0,
       lastCleaned: null,
       byType: {
         utm: 0,
         fbclid: 0,
         gclid: 0,
         other: 0,
       }
     }
   }
   ```

2. **Content Script - URL Cleaning**

   ```javascript
   async function initTrackingProtection() {
     const config = await chrome.storage.local.get({ privacy: {} });
     const privacy = config.privacy || {};

     if (!privacy.removeTracking) return;

     // Intercept link clicks
     document.addEventListener("click", handleLinkClick, true);

     // Clean current URL if needed
     cleanCurrentUrl();

     // Apply referrer policy
     if (privacy.cleanReferrer) {
       applyReferrerPolicy(privacy.referrerPolicy);
     }
   }

   function handleLinkClick(e) {
     const link = e.target.closest("a");
     if (!link?.href) return;

     const cleaned = removeTrackingParams(link.href);
     if (cleaned !== link.href) {
       e.preventDefault();

       // Update stats
       chrome.runtime.sendMessage({
         type: "TRACKING_PARAM_CLEANED",
         original: link.href,
         cleaned: cleaned,
       });

       // Navigate to cleaned URL
       window.location.href = cleaned;
     }
   }

   function removeTrackingParams(url) {
     // ... implementation from spec
   }
   ```

3. **Background Script - Stats**

   ```javascript
   chrome.runtime.onMessage.addListener((message, sender) => {
     if (message.type === "TRACKING_PARAM_CLEANED") {
       updateTrackingStats(message);

       if (showTrackingBadge) {
         chrome.action.setBadgeText({
           text: "🛡️",
           tabId: sender.tab.id,
         });
         setTimeout(() => {
           chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
         }, 2000);
       }
     }
   });

   async function updateTrackingStats(data) {
     const storage = await chrome.storage.local.get({ privacy: {} });
     const stats = storage.privacy.trackingStats || {};

     stats.totalCleaned = (stats.totalCleaned || 0) + 1;
     stats.lastCleaned = new Date().toISOString();

     // Categorize by param type
     const url = new URL(data.original);
     if (url.searchParams.has("utm_source")) stats.byType.utm++;
     if (url.searchParams.has("fbclid")) stats.byType.fbclid++;
     // ... other types

     storage.privacy.trackingStats = stats;
     await chrome.storage.local.set({ privacy: storage.privacy });
   }
   ```

4. **Options Page - Privacy Section**

   ```html
   <section class="setting">
     <h2>Privacy & Tracking Protection</h2>

     <div class="option-row">
       <label class="checkbox-label">
         <input type="checkbox" id="privacy-remove-tracking" checked />
         <span>Remove tracking parameters from URLs</span>
       </label>
       <p class="option-description">
         Strips utm_source, fbclid, gclid, and other tracking parameters
       </p>
     </div>

     <div class="privacy-stats">
       <p>
         <strong>Total URLs cleaned:</strong>
         <span id="tracking-cleaned-count">0</span>
       </p>
       <p>
         <strong>Last cleaned:</strong>
         <span id="tracking-last-cleaned">Never</span>
       </p>
     </div>

     <div class="option-row">
       <label>Referrer Policy:</label>
       <select id="referrer-policy">
         <option value="default">Default</option>
         <option value="same-origin" selected>Same Origin (Recommended)</option>
         <option value="origin">Origin Only</option>
         <option value="no-referrer">No Referrer</option>
       </select>
     </div>
   </section>
   ```

**Testing Plan:**

- Test tracking param removal on common URLs
- Verify stats collection accuracy
- Test referrer policy application
- Performance testing (no delays on clicks)

---

### Phase 5.3: v11.2.0 - Advanced Content Blocking (Priority 3)

**Estimated Scope:** 2-3 days development

**Files to Modify:**

- `storage.js` - Extend nagBlocking schema
- `content-script.js` - Add new selectors to blocking (~50 lines)
- `styles.css` - Add blocking rules (~50 lines)
- `options.html/js` - Add new toggles to Nag Blocking section
- `tests/nag-blocking.test.js` - Extend existing tests (~15 tests)

**Implementation Steps:**

1. **Storage Schema Extension**

   ```javascript
   // Extend existing nagBlocking object in storage.js
   nagBlocking: {
     // ... existing fields
     blockTrending: true,
     blockRecommendations: true,
     blockCommunityHighlights: true,
     blockAIContent: true,
   }
   ```

2. **Content Script Extension**

   ```javascript
   // Extend existing applyNagBlocking function
   async function applyNagBlocking() {
     const config = await chrome.storage.local.get({ nagBlocking: {} });
     const blocking = config.nagBlocking || {};

     // ... existing blocking code

     // New: Block trending
     if (blocking.blockTrending) {
       blockTrendingContent();
     }

     // New: Block recommendations
     if (blocking.blockRecommendations) {
       blockRecommendations();
     }

     // New: Block AI content
     if (blocking.blockAIContent) {
       blockAIContent();
     }
   }

   function blockTrendingContent() {
     const selectors = [
       ".trending-subreddits-container",
       ".trending-posts",
       '[data-test-id="trending-container"]',
     ];
     selectors.forEach((sel) => {
       document.querySelectorAll(sel).forEach((el) => el.remove());
     });
   }

   // ... similar functions for other blocking
   ```

3. **Options Page Extension**

   ```html
   <!-- Add to existing Nag Blocking section -->
   <div class="option-row">
     <label class="checkbox-label">
       <input type="checkbox" id="block-trending" checked />
       <span>Block trending sections</span>
     </label>
   </div>

   <div class="option-row">
     <label class="checkbox-label">
       <input type="checkbox" id="block-recommendations" checked />
       <span>Block recommended posts</span>
     </label>
   </div>

   <!-- ... other toggles -->
   ```

4. **Jump to Top Button**

   ```javascript
   // In content-script.js
   async function initJumpToTop() {
     const config = await chrome.storage.local.get({
       feedEnhancements: { showJumpToTop: true },
     });

     if (!config.feedEnhancements.showJumpToTop) return;

     const button = createTopButton();
     document.body.appendChild(button);

     window.addEventListener("scroll", () => {
       button.style.display = window.scrollY > 500 ? "block" : "none";
     });
   }

   function createTopButton() {
     const button = document.createElement("button");
     button.id = "orr-jump-top";
     button.textContent = "↑";
     button.className = "orr-jump-top-button";
     button.title = "Jump to top";

     button.addEventListener("click", () => {
       window.scrollTo({ top: 0, behavior: "smooth" });
     });

     return button;
   }
   ```

   ```css
   /* In styles.css */
   .orr-jump-top-button {
     position: fixed;
     bottom: 20px;
     right: 20px;
     width: 48px;
     height: 48px;
     border-radius: 50%;
     background: var(--orr-primary-color, #0079d3);
     color: white;
     border: none;
     font-size: 20px;
     cursor: pointer;
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
     z-index: 9998; /* Below comment nav (9999) */
     transition: opacity 0.2s;
   }

   .orr-jump-top-button:hover {
     opacity: 0.9;
   }

   /* Dark mode support */
   body.orr-dark .orr-jump-top-button {
     background: #1a1a1b;
     border: 1px solid #343536;
   }
   ```

---

## Testing Strategy

### Automated Tests

**New Test Files:**

1. `tests/feed-enhancements.test.js` (~30 tests)
2. `tests/privacy.test.js` (~25 tests)
3. Extend `tests/nag-blocking.test.js` (+15 tests)

**Total New Tests:** ~70 tests (270 → 340 tests)

**Test Categories:**

- Storage schema validation
- CSS class application logic
- URL cleaning algorithm
- Referrer policy application
- Tracking stats collection
- Custom CSS validation

### Manual Testing

**v11.0.0 Checklist:**

- [ ] Compact mode reduces post height visibly
- [ ] Text-only mode hides all images
- [ ] Uncrop images shows full thumbnails
- [ ] Hide toggles work for join/action buttons
- [ ] Custom CSS applies correctly
- [ ] Custom CSS validation catches errors
- [ ] No RES conflicts (if installed)
- [ ] Performance acceptable (no lag)

**v11.1.0 Checklist:**

- [ ] Tracking params removed from clicks
- [ ] Stats increment correctly
- [ ] Badge shows briefly when cleaning
- [ ] Referrer policy applies
- [ ] No navigation delays
- [ ] Works with external links

**v11.2.0 Checklist:**

- [ ] Trending sections hidden
- [ ] Recommendations blocked
- [ ] Jump to top button appears after scroll
- [ ] Jump to top doesn't conflict with comment nav
- [ ] AI content blocked (future-proof)

### Performance Testing

**Metrics to Monitor:**

- Page load time (should not increase >5%)
- Memory usage (check for leaks)
- Scroll performance (60fps)
- Click response time (<100ms)

**Tools:**

- Chrome DevTools Performance tab
- Lighthouse audits
- Manual stopwatch testing

---

## Dependencies & Risks

### Dependencies

**Internal:**

- Builds on existing content script architecture
- Extends storage.js schema (backward compatible)
- Uses existing message passing system
- Leverages existing CSS injection mechanism

**External:**

- Chrome/Firefox extension APIs (stable)
- Reddit DOM structure (subject to change)
- CSS custom properties support (IE11 not supported, acceptable)

### Risk Assessment

| Risk                            | Probability | Impact | Mitigation                                                       |
| ------------------------------- | ----------- | ------ | ---------------------------------------------------------------- |
| **Reddit DOM changes**          | Medium      | Medium | Monitor Reddit for layout changes, update selectors as needed    |
| **RES conflicts**               | Low         | Medium | Test with RES, use specific class names to avoid collisions      |
| **Performance degradation**     | Low         | High   | Profile extensively, use efficient selectors, debounce observers |
| **Storage quota exceeded**      | Very Low    | Low    | Custom CSS size limit (10KB), track storage usage                |
| **CSS injection breaks layout** | Medium      | Medium | Clear warnings, validation, easy reset button                    |
| **Tracking param FPs**          | Low         | Low    | Conservative param list, user can customize                      |
| **Browser API deprecation**     | Very Low    | High   | Monitor Chrome/Firefox release notes, use stable APIs            |

### Critical Risks

**None identified.** All features are:

- Opt-in (disabled by default)
- Reversible (can be toggled off)
- Non-destructive (don't modify Reddit data)
- Isolated (failures don't cascade)

---

## Rollout Strategy

### Phased Release Schedule

**Week 1-2: v11.0.0 Development**

- Implement feed enhancements
- Write tests (target: 30 tests)
- Internal testing and refinement

**Week 3: v11.0.0 Beta Testing**

- Release to beta users (if beta program exists)
- Collect feedback on performance
- Fix critical bugs

**Week 4: v11.0.0 Stable Release**

- Publish to Chrome Web Store / Firefox Add-ons
- Update README and CHANGELOG
- Monitor for issues

**Week 5-6: v11.1.0 Development**

- Implement privacy features
- Write tests (target: 25 tests)
- Internal testing

**Week 7: v11.1.0 Release**

- Stable release
- Monitor tracking stats accuracy

**Week 8-9: v11.2.0 Development**

- Implement advanced blocking
- Write tests (target: 15 tests)
- Internal testing

**Week 10: v11.2.0 Release**

- Final Phase 5 release
- Comprehensive testing
- Documentation updates

### Feature Flags

Consider adding feature flags for gradual rollout:

```javascript
// In background.js or feature-flags.js
const FEATURE_FLAGS = {
  feedEnhancements: true, // v11.0.0
  trackingProtection: false, // v11.1.0 (enable after v11.0.0 stable)
  advancedBlocking: false, // v11.2.0 (enable after v11.1.0 stable)
};

async function isFeatureEnabled(feature) {
  // Check user preference first
  const userPrefs = await chrome.storage.local.get("featureFlags");
  if (userPrefs.featureFlags?.[feature] !== undefined) {
    return userPrefs.featureFlags[feature];
  }

  // Fallback to default flags
  return FEATURE_FLAGS[feature];
}
```

This allows:

- A/B testing
- Gradual rollout to percentage of users
- Quick disable if critical bug found
- User override in advanced settings

---

## Migration & Backward Compatibility

### Storage Schema Migration

**Current Schema Version:** 2 (from v7.0.0)
**Target Schema Version:** 3 (v11.0.0)

**Migration Path:**

```javascript
async function migrateToV3() {
  const data = await chrome.storage.local.get(null);

  // Check current version
  if (data.schemaVersion >= 3) return;

  // Set defaults for new fields
  if (!data.feedEnhancements) {
    data.feedEnhancements = {
      compactMode: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      uncropImages: false,
      textOnlyMode: false,
      customCSS: "",
      customCSSEnabled: false,
    };
  }

  if (!data.privacy) {
    data.privacy = {
      removeTracking: true,
      trackingParams: [...DEFAULT_TRACKING_PARAMS],
      showTrackingBadge: true,
      cleanReferrer: false,
      referrerPolicy: "same-origin",
      trackingStats: {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, fbclid: 0, gclid: 0, other: 0 },
      },
    };
  }

  // Extend existing nagBlocking
  if (data.nagBlocking) {
    data.nagBlocking = {
      ...data.nagBlocking,
      blockTrending: true,
      blockRecommendations: true,
      blockCommunityHighlights: true,
      blockAIContent: true,
    };
  }

  // Update schema version
  data.schemaVersion = 3;

  await chrome.storage.local.set(data);
  console.log("[ORR] Migrated storage schema to v3");
}

// Run migration on install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    migrateToV3();
  }
});
```

### Rollback Plan

If critical issues are found:

1. **Immediate:** Disable feature via feature flag
2. **Short-term:** Publish hotfix release with feature disabled by default
3. **Long-term:** Fix issues, re-enable in next minor version

**Rollback doesn't require data migration** - old versions ignore new storage fields.

---

## Success Criteria

### Quantitative Metrics

**v11.0.0:**

- [ ] Page load time increase <5%
- [ ] 30+ new tests passing
- [ ] No increase in crash reports
- [ ] Custom CSS adoption >5% of users (if analytics available)

**v11.1.0:**

- [ ] Tracking params cleaned on >90% of tracked links
- [ ] No navigation delays (click → navigation <100ms)
- [ ] 25+ new tests passing
- [ ] Zero privacy-related complaints

**v11.2.0:**

- [ ] All new blocking selectors work on test subreddits
- [ ] Jump to top button performs at 60fps
- [ ] 15+ new tests passing
- [ ] Total test count: 340+ tests

### Qualitative Metrics

- User feedback positive (if collected)
- No breaking changes reported
- RES compatibility maintained
- Documentation clear and complete

---

## Documentation Updates

### Files to Update

**README.md:**

- Add Feed Enhancements to feature list
- Add Privacy & Tracking Protection section
- Update Advanced Content Blocking description
- Add screenshots (before/after compact mode, etc.)

**CHANGELOG.md:**

- Add detailed v11.0.0 entry with feature descriptions
- Add v11.1.0 entry for privacy features
- Add v11.2.0 entry for advanced blocking

**CLAUDE.md:**

- Update architecture section with new content script features
- Document new storage schema (v3)
- Update test count (270 → 340)
- Add privacy feature notes

**ROADMAP.md:**

- Mark Phase 5 as "IN PROGRESS" during development
- Mark as "COMPLETE" after v11.2.0 release
- Add Phase 6 considerations (if any)

**Contributing.md:**

- Update test suite count
- Add notes about CSS validation testing
- Add privacy testing guidelines

---

## Future Considerations (Phase 6+)

### Potential Next Features

Based on Sink It analysis and user patterns:

**Performance & Optimization:**

- Lazy loading for large feeds (infinite scroll optimization)
- Image loading optimization (defer offscreen images)
- Memory usage profiling and optimization

**Advanced Filtering:**

- User muting (hide posts/comments from specific users)
- NSFW content preferences (show/hide/blur)
- Age-based filtering (hide posts older than X days)

**Navigation & UX:**

- Keyboard shortcuts for common actions
- Customizable hotkeys
- Enhanced search experience

**Sync & Backup:**

- Cloud backup of all settings
- Import/export profiles
- Multi-device sync improvements

**Accessibility:**

- High contrast mode
- Font size controls
- Screen reader optimizations

**Reddit API Integration (if available):**

- Save/unsave posts from extension
- Quick reply to comments
- Notification integration

**Not Recommended:**

- Mobile app features (out of scope)
- New Reddit enhancements (contradicts mission)
- Social features (privacy concerns)
- Procrastination blocking (different category)

---

## Appendix A: CSS Selectors Reference

### Feed Enhancement Selectors

```css
/* Posts */
.thing                  /* Individual post container */
.entry                  /* Post content area */
.thumbnail              /* Thumbnail image */
.expando-button         /* Expand media button */

/* Actions */
.subscribe-button       /* Subreddit join button */
.buttons a              /* Post action links (save, hide, etc.) */

/* Images */
.thumbnail img          /* Thumbnail image element */
.media-preview-content  /* Media preview container */
```

### Content Blocking Selectors

```css
/* Trending */
.trending-subreddits-container
.trending-posts
[data-test-id="trending-container"]

/* Recommendations */
.recommended-communities
.similar-posts-container
.more-posts-from

/* AI Content (future-proofing) */
.ai-summary
.reddit-answers
[data-testid="ai-overview"]

/* Promoted */
.promoted-community
.community-highlight-card
```

---

## Appendix B: Tracking Parameters Reference

### Default Tracking Parameter List

```javascript
const DEFAULT_TRACKING_PARAMS = [
  // UTM parameters (standard)
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_name",
  "utm_cid",

  // Social media tracking
  "fbclid", // Facebook
  "gclid", // Google Ads
  "msclkid", // Microsoft Advertising
  "twclid", // Twitter/X
  "li_fat_id", // LinkedIn

  // Referral tracking
  "ref",
  "ref_source",
  "ref_url",
  "referrer",
  "share_id",
  "shared",

  // Click tracking
  "click_id",
  "clickid",
  "_ga", // Google Analytics

  // Reddit-specific
  "rdt_cid", // Reddit tracking
  "$deep_link", // Reddit app
  "$3p", // Reddit 3rd party
  "_branch_match_id",
  "_branch_referrer",

  // Other common trackers
  "mc_cid", // Mailchimp
  "mc_eid",
  "yclid", // Yandex
  "zanpid", // Zanox
  "rb_clickid", // Rakuten
];
```

Users can customize this list in advanced settings.

---

## Appendix C: Implementation Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 5 Implementation Timeline (10 weeks)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Week 1-2:  v11.0.0 Development (Feed Enhancements)         │
│             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                  │
│                                                              │
│  Week 3:    v11.0.0 Beta Testing & Refinement               │
│             ▓▓▓▓▓▓▓                                          │
│                                                              │
│  Week 4:    v11.0.0 Stable Release                          │
│             ▓▓▓                                              │
│                                                              │
│  Week 5-6:  v11.1.0 Development (Privacy Features)          │
│             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                  │
│                                                              │
│  Week 7:    v11.1.0 Stable Release                          │
│             ▓▓▓                                              │
│                                                              │
│  Week 8-9:  v11.2.0 Development (Advanced Blocking)         │
│             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                  │
│                                                              │
│  Week 10:   v11.2.0 Release & Documentation                 │
│             ▓▓▓▓▓▓▓                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Key Milestones:
• Week 4:  v11.0.0 released (Feed Enhancements)
• Week 7:  v11.1.0 released (Privacy & Tracking)
• Week 10: v11.2.0 released (Phase 5 Complete)
```

---

## Appendix D: File Change Summary

### New Files

```
docs/IMPLEMENTATION-PLAN-v11.md           (this file)
tests/feed-enhancements.test.js           (~300 lines, ~30 tests)
tests/privacy.test.js                     (~250 lines, ~25 tests)
docs/MANUAL-TEST-v11.0.0.md               (manual test checklist)
docs/MANUAL-TEST-v11.1.0.md               (manual test checklist)
docs/MANUAL-TEST-v11.2.0.md               (manual test checklist)
```

### Modified Files

**v11.0.0:**

```
storage.js              (+150 lines: feedEnhancements schema + methods)
content-script.js       (+200 lines: feed enhancement logic)
styles.css              (+150 lines: feed enhancement styles)
options.html            (+100 lines: feed enhancements section)
options.js              (+150 lines: feed settings UI logic)
manifest.json           (version bump to 11.0.0)
package.json            (version bump to 11.0.0)
README.md               (+50 lines: feature documentation)
CHANGELOG.md            (+30 lines: v11.0.0 entry)
```

**v11.1.0:**

```
storage.js              (+100 lines: privacy schema + methods)
background.js           (+50 lines: tracking stats)
content-script.js       (+150 lines: URL cleaning, referrer policy)
options.html            (+80 lines: privacy section)
options.js              (+100 lines: privacy UI logic)
manifest.json           (version bump to 11.1.0)
package.json            (version bump to 11.1.0)
CHANGELOG.md            (+25 lines: v11.1.0 entry)
```

**v11.2.0:**

```
storage.js              (+30 lines: extend nagBlocking schema)
content-script.js       (+100 lines: advanced blocking + jump to top)
styles.css              (+80 lines: blocking rules + jump button)
options.html            (+50 lines: new blocking toggles)
options.js              (+50 lines: blocking UI logic)
tests/nag-blocking.test.js  (+100 lines: 15 new tests)
manifest.json           (version bump to 11.2.0)
package.json            (version bump to 11.2.0)
CHANGELOG.md            (+25 lines: v11.2.0 entry)
```

**Total Lines of Code Added:** ~1,800 lines
**Total Tests Added:** ~70 tests (270 → 340)

---

## Conclusion

Phase 5 represents a natural evolution of Old Reddit Redirect, focusing on:

1. **User Customization** - Give users control over feed appearance
2. **Privacy** - Protect users from tracking and surveillance
3. **Cleanliness** - Block additional promoted content and clutter

These features align with the project's core mission of improving the old.reddit.com experience while maintaining:

- **Performance** - No degradation, optimizations where possible
- **Privacy** - No data collection, local-first
- **Simplicity** - Sensible defaults, opt-in features
- **Quality** - Comprehensive testing, careful implementation

**Next Steps:**

1. Review this plan with stakeholders
2. Adjust priorities based on feedback
3. Begin v11.0.0 implementation
4. Set up beta testing program (if desired)
5. Monitor user feedback and iterate

---

_Last Updated: 2026-01-30_
_Status: 🟡 PLANNING COMPLETE, AWAITING APPROVAL_
_Estimated Completion: 10 weeks from start (3 releases)_

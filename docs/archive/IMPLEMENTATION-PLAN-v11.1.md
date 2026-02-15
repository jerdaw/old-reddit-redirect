# Implementation Plan: Phase 5.2 - Privacy & Tracking Protection

> **Version**: 11.1.0-plan-v1
> **Date**: 2026-01-30
> **Target Release**: v11.1.0
> **Author**: Development Team
> **Status**: Ready for Implementation

---

## Executive Summary

This document outlines the implementation plan for **Phase 5.2: Privacy & Tracking Protection** (v11.1.0) of Old Reddit Redirect. This phase focuses on protecting user privacy by removing tracking parameters from URLs and providing referrer control when leaving Reddit.

**Key Benefits**:
- Automatic removal of 30+ tracking parameters (utm_*, fbclid, gclid, etc.)
- Real-time URL cleaning on link clicks
- Statistics tracking for transparency
- Referrer policy control for enhanced privacy
- Visual feedback when tracking is stripped

**Previous Release:** v11.0.0 - Feed Enhancements (completed)
- 33 new tests added (303 total)
- Storage schema v3 implemented
- Feed customization features delivered

---

## Current State Assessment

### Repository Status (v11.0.0)

**Recently Completed (v11.0.0):**
- ✅ Feed Enhancements (compact mode, text-only, custom CSS)
- ✅ Storage schema migrated to v3
- ✅ 33 new feed enhancement tests
- ✅ All 303 tests passing
- ✅ Zero lint errors

**Codebase Metrics:**
- storage.js: ~1,150 lines (+56 from v10.0.0)
- content-script.js: ~1,580 lines (+60 from v10.0.0)
- background.js: 954 lines (unchanged)
- options.js: ~2,750 lines (+158 from v10.0.0)
- Total: ~6,446 lines across main files

**Test Coverage:**
- 303 tests across 11 test files
- All passing, zero flakes
- Coverage includes storage, patterns, comments, feed enhancements

**Architecture:**
- Manifest V3 with declarativeNetRequest
- Service worker for background tasks
- Content script for DOM manipulation
- Centralized storage layer with sync support
- Real-time message passing for updates

### Key Constraints

1. **Browser Compatibility:**
   - Must work in Chrome (Manifest V3)
   - Must work in Firefox (Gecko)
   - No access to webRequest API (deprecated in MV3)

2. **Performance:**
   - URL cleaning must be <100ms
   - No noticeable navigation delays
   - Minimal memory overhead

3. **Privacy:**
   - All processing must be client-side
   - No data sent to external servers
   - Stats stored locally only

4. **User Experience:**
   - Opt-in by default (following project pattern)
   - Clear visual feedback
   - Easy to disable if issues occur

### Assumptions

1. **Tracking Parameters:**
   - Common tracking params are well-documented
   - List won't change dramatically month-to-month
   - Users may want to customize the list

2. **URL Structure:**
   - Reddit links follow predictable patterns
   - External links are identifiable via href attribute
   - Browser's URL API is available and reliable

3. **Performance:**
   - Link click interception has minimal overhead
   - Modern browsers handle URL manipulation efficiently
   - Badge updates don't cause UI jank

4. **User Behavior:**
   - Users want transparency (hence stats tracking)
   - Visual feedback is valued but optional
   - Most users won't customize tracking param list

### Unknown Factors

1. **Edge Cases:**
   - How many legitimate URLs use utm_* for non-tracking purposes?
   - Are there tracking params we haven't identified?
   - Will parameter removal break any Reddit functionality?

2. **Browser Differences:**
   - Do Chrome and Firefox handle referrer policies identically?
   - Are there browser-specific URL encoding issues?

3. **User Impact:**
   - Will users notice the feature working?
   - Will removal of params cause navigation failures?
   - Is visual feedback too intrusive?

---

## Feature Specification: v11.1.0

### Overview

Phase 5.2 adds two complementary privacy features:
1. **Tracking Parameter Removal** - Strips known tracking params from URLs
2. **Referrer Control** - Manages what referrer information is sent

Both features are designed to work transparently while providing user control and visibility.

---

### Feature 5.6: Tracking Parameter Removal

**Description:** Automatically detect and remove tracking parameters from URLs when users click links on Reddit pages.

#### Tracking Parameters List

**Default Parameters to Remove (30+):**

```javascript
const DEFAULT_TRACKING_PARAMS = [
  // UTM parameters (standard marketing analytics)
  'utm_source',     // Traffic source
  'utm_medium',     // Marketing medium
  'utm_campaign',   // Campaign name
  'utm_term',       // Paid keyword
  'utm_content',    // Content variant
  'utm_name',       // Campaign name (alternative)
  'utm_cid',        // Campaign ID

  // Social media tracking
  'fbclid',         // Facebook click identifier
  'gclid',          // Google Ads click identifier
  'msclkid',        // Microsoft Advertising click ID
  'twclid',         // Twitter/X click identifier
  'li_fat_id',      // LinkedIn first-party anonymous tracker ID
  'igshid',         // Instagram share ID

  // Referral tracking
  'ref',            // Generic referrer
  'ref_source',     // Referrer source
  'ref_url',        // Referrer URL
  'referrer',       // Referrer (alternate spelling)
  'share_id',       // Share identifier
  'shared',         // Shared flag

  // Click tracking
  'click_id',       // Generic click identifier
  'clickid',        // Click ID (variant)
  '_ga',            // Google Analytics client ID

  // Reddit-specific tracking
  'rdt_cid',        // Reddit tracking cookie ID
  '$deep_link',     // Reddit app deep link
  '$3p',            // Reddit third-party tracking
  '_branch_match_id',     // Branch.io match ID
  '_branch_referrer',     // Branch.io referrer

  // Email marketing
  'mc_cid',         // Mailchimp campaign ID
  'mc_eid',         // Mailchimp email ID

  // Other common trackers
  'yclid',          // Yandex click ID
  'zanpid',         // Zanox affiliate ID
  'rb_clickid',     // Rakuten click ID
];
```

#### Implementation Approach

**Option A: Content Script Interception (Recommended)**

Pros:
- Works for all link types
- Can provide immediate feedback
- Easy to debug and test
- Full control over behavior

Cons:
- Requires click event listener
- Slightly more code in content script

**Option B: Declarative Net Request**

Pros:
- No runtime overhead
- Works even if content script disabled

Cons:
- Limited to 30 rules in Chrome
- Complex regex patterns
- Hard to provide user feedback
- Can't customize per-user

**Decision: Use Option A (Content Script Interception)**

Rationale:
- We already have content script infrastructure
- Need user feedback capability
- Need per-user customization
- DNR rule limit too restrictive for 30+ params

#### Technical Design

**1. URL Cleaning Logic:**

```javascript
/**
 * Remove tracking parameters from a URL
 * @param {string} url - The URL to clean
 * @param {Array<string>} paramsToRemove - List of parameter names
 * @returns {string} Cleaned URL
 */
function removeTrackingParams(url, paramsToRemove) {
  try {
    const urlObj = new URL(url);

    let removed = [];
    paramsToRemove.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.delete(param);
        removed.push(param);
      }
    });

    return {
      cleanUrl: urlObj.toString(),
      paramsRemoved: removed,
      wasModified: removed.length > 0
    };
  } catch (error) {
    // Invalid URL, return original
    return {
      cleanUrl: url,
      paramsRemoved: [],
      wasModified: false
    };
  }
}
```

**2. Click Interception:**

```javascript
/**
 * Initialize tracking protection
 */
async function initTrackingProtection() {
  const config = await chrome.storage.local.get({ privacy: {} });
  const privacy = config.privacy || {};

  if (!privacy.removeTracking) return;

  // Intercept all link clicks
  document.addEventListener('click', handleLinkClick, true);
}

/**
 * Handle link clicks
 */
async function handleLinkClick(event) {
  const link = event.target.closest('a');
  if (!link || !link.href) return;

  const config = await chrome.storage.local.get({ privacy: {} });
  const privacy = config.privacy || {};

  if (!privacy.removeTracking) return;

  const result = removeTrackingParams(
    link.href,
    privacy.trackingParams || DEFAULT_TRACKING_PARAMS
  );

  if (result.wasModified) {
    event.preventDefault();

    // Update link href
    link.href = result.cleanUrl;

    // Send stats to background
    chrome.runtime.sendMessage({
      type: 'TRACKING_PARAMS_CLEANED',
      original: link.href,
      cleaned: result.cleanUrl,
      paramsRemoved: result.paramsRemoved
    });

    // Navigate to cleaned URL
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      // Middle click or Ctrl+click - open in new tab
      window.open(result.cleanUrl, '_blank');
    } else {
      // Normal click - navigate in same tab
      window.location.href = result.cleanUrl;
    }
  }
}
```

**3. Statistics Tracking:**

```javascript
// In background.js
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'TRACKING_PARAMS_CLEANED') {
    updateTrackingStats(message);

    // Show badge if enabled
    const showBadge = privacy.showTrackingBadge;
    if (showBadge) {
      chrome.action.setBadgeText({
        text: '🛡️',
        tabId: sender.tab.id
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#4CAF50',
        tabId: sender.tab.id
      });

      // Clear badge after 2 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({
          text: '',
          tabId: sender.tab.id
        });
      }, 2000);
    }
  }
});

async function updateTrackingStats(data) {
  const storage = await chrome.storage.local.get({ privacy: {} });
  const privacy = storage.privacy || {};
  const stats = privacy.trackingStats || {
    totalCleaned: 0,
    lastCleaned: null,
    byType: {}
  };

  stats.totalCleaned++;
  stats.lastCleaned = new Date().toISOString();

  // Categorize by param type
  data.paramsRemoved.forEach(param => {
    if (param.startsWith('utm_')) {
      stats.byType.utm = (stats.byType.utm || 0) + 1;
    } else if (param === 'fbclid') {
      stats.byType.facebook = (stats.byType.facebook || 0) + 1;
    } else if (param === 'gclid') {
      stats.byType.google = (stats.byType.google || 0) + 1;
    } else {
      stats.byType.other = (stats.byType.other || 0) + 1;
    }
  });

  privacy.trackingStats = stats;
  await chrome.storage.local.set({ privacy });
}
```

#### Storage Schema

```javascript
privacy: {
  removeTracking: true,               // Enable/disable tracking removal
  trackingParams: [                   // Customizable parameter list
    ...DEFAULT_TRACKING_PARAMS
  ],
  showTrackingBadge: true,            // Show badge when params removed
  cleanReferrer: false,               // Enable referrer control (Feature 5.7)
  referrerPolicy: 'same-origin',      // Referrer policy setting
  trackingStats: {
    totalCleaned: 0,                  // Total URLs cleaned
    lastCleaned: null,                // ISO timestamp of last clean
    byType: {
      utm: 0,                         // Count of UTM params removed
      facebook: 0,                    // Count of fbclid removed
      google: 0,                      // Count of gclid removed
      other: 0                        // Count of other params removed
    }
  }
}
```

#### User Interface

**Options Page - Privacy Section:**

```html
<section class="setting">
  <h2>Privacy & Tracking Protection</h2>
  <p class="section-description">
    Protect your privacy by removing tracking parameters from URLs and
    controlling what information is sent when you leave Reddit.
  </p>

  <!-- Tracking Parameter Removal -->
  <div class="option-row">
    <label class="checkbox-label">
      <input type="checkbox" id="privacy-remove-tracking" checked />
      <span>Remove tracking parameters</span>
    </label>
    <p class="option-description">
      Automatically strip utm_source, fbclid, gclid, and other tracking
      parameters from URLs you click
    </p>
  </div>

  <div class="option-row">
    <label class="checkbox-label">
      <input type="checkbox" id="privacy-show-badge" checked />
      <span>Show badge when tracking is removed</span>
    </label>
    <p class="option-description">
      Display a shield icon (🛡️) briefly when tracking parameters are cleaned
    </p>
  </div>

  <!-- Statistics Display -->
  <div class="privacy-stats">
    <h3>Privacy Statistics</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Total URLs Cleaned:</span>
        <span class="stat-value" id="tracking-cleaned-count">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Last Cleaned:</span>
        <span class="stat-value" id="tracking-last-cleaned">Never</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">UTM Parameters:</span>
        <span class="stat-value" id="tracking-utm-count">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Facebook Tracking:</span>
        <span class="stat-value" id="tracking-facebook-count">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Google Tracking:</span>
        <span class="stat-value" id="tracking-google-count">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Other Trackers:</span>
        <span class="stat-value" id="tracking-other-count">0</span>
      </div>
    </div>
    <button id="clear-tracking-stats" class="secondary-button">
      Clear Statistics
    </button>
  </div>

  <!-- Advanced: Custom Parameter List -->
  <details class="advanced-options">
    <summary>Advanced: Custom Tracking Parameters</summary>
    <p class="option-description">
      Customize which URL parameters should be removed. Changes take effect
      immediately.
    </p>
    <textarea
      id="tracking-params-list"
      rows="8"
      placeholder="utm_source&#10;fbclid&#10;gclid"
      class="params-textarea"
    ></textarea>
    <div class="button-row">
      <button id="save-tracking-params" class="primary-button">
        Save Parameters
      </button>
      <button id="reset-tracking-params" class="secondary-button">
        Reset to Defaults
      </button>
    </div>
    <p class="help-text">
      One parameter name per line. Default list includes 30+ common trackers.
    </p>
  </details>
</section>
```

#### Acceptance Criteria

- [ ] Tracking params removed from clicked links
- [ ] Stats accurately track cleaned URLs
- [ ] Badge displays briefly when enabled
- [ ] Custom parameter list can be modified
- [ ] No navigation delays (<100ms overhead)
- [ ] Works with Ctrl+click (new tab)
- [ ] Works with middle-click (new tab)
- [ ] Invalid URLs handled gracefully
- [ ] Feature can be toggled on/off
- [ ] Syncs across browsers (when sync enabled)

---

### Feature 5.7: Referrer Control

**Description:** Control what referrer information is sent when navigating away from Reddit.

#### Referrer Policy Options

| Policy | Behavior | Privacy Level | Compatibility |
|--------|----------|---------------|---------------|
| **no-referrer** | No referrer sent | Maximum | May break some sites |
| **origin** | Only domain sent (old.reddit.com) | High | Good |
| **same-origin** | Full URL only within Reddit | Medium | Excellent |
| **default** | Browser default | Low | Perfect |

**Recommended Default:** `same-origin` (balance of privacy and compatibility)

#### Implementation Approach

**Method: Meta Tag Injection**

```javascript
/**
 * Apply referrer policy
 */
async function applyReferrerPolicy() {
  const config = await chrome.storage.local.get({ privacy: {} });
  const privacy = config.privacy || {};

  if (!privacy.cleanReferrer) return;

  // Remove existing referrer policy meta tag
  const existing = document.querySelector('meta[name="referrer"]');
  if (existing) {
    existing.remove();
  }

  // Inject new referrer policy
  const meta = document.createElement('meta');
  meta.name = 'referrer';
  meta.content = privacy.referrerPolicy || 'same-origin';
  document.head.appendChild(meta);

  console.log(`[ORR] Applied referrer policy: ${meta.content}`);
}
```

#### User Interface

**Options Page - Referrer Control:**

```html
<!-- Add to Privacy section -->
<div class="option-row">
  <label class="checkbox-label">
    <input type="checkbox" id="privacy-clean-referrer" />
    <span>Control referrer information</span>
  </label>
  <p class="option-description">
    Manage what information is sent when you leave Reddit
  </p>
</div>

<div class="referrer-policy-options" id="referrer-policy-options" hidden>
  <label for="referrer-policy">Referrer Policy:</label>
  <select id="referrer-policy" class="select-input">
    <option value="default">Default (Browser Behavior)</option>
    <option value="same-origin" selected>Same Origin (Recommended)</option>
    <option value="origin">Origin Only (High Privacy)</option>
    <option value="no-referrer">No Referrer (Maximum Privacy)</option>
  </select>

  <div class="referrer-policy-info">
    <p class="info-text" id="referrer-policy-description">
      <!-- Dynamically updated based on selection -->
    </p>
  </div>
</div>
```

**Policy Descriptions:**

```javascript
const REFERRER_POLICY_INFO = {
  'default': {
    description: 'Uses your browser\'s default referrer policy. Typically sends full URL to all sites.',
    privacy: 'Low',
    compatibility: 'Perfect'
  },
  'same-origin': {
    description: 'Sends full URL only when staying on Reddit. External sites only see that you came from Reddit.',
    privacy: 'Medium',
    compatibility: 'Excellent'
  },
  'origin': {
    description: 'Only sends domain (old.reddit.com) to all sites. Never sends the specific page URL.',
    privacy: 'High',
    compatibility: 'Good'
  },
  'no-referrer': {
    description: 'No referrer information sent to any site. Maximum privacy but may break some websites.',
    privacy: 'Maximum',
    compatibility: 'May break some sites'
  }
};
```

#### Acceptance Criteria

- [ ] Referrer policy meta tag injected correctly
- [ ] Policy changes apply immediately
- [ ] UI shows policy descriptions
- [ ] Checkbox shows/hides policy selector
- [ ] Works across page navigations
- [ ] No conflicts with Reddit's native meta tags

---

## Implementation Steps

### Phase 5.2.1: Storage Schema (Day 1, 2-3 hours)

**Files to Modify:**
- `storage.js` - Add privacy configuration

**Tasks:**

1. Add privacy defaults to DEFAULTS object
2. Add 'privacy' to SYNC_KEYS (optional)
3. Implement storage methods:
   - `getPrivacy()`
   - `setPrivacy(config)`
   - `getTrackingStats()`
   - `updateTrackingStats(data)`
   - `clearTrackingStats()`
   - `isTrackingRemovalEnabled()`

**Code:**

```javascript
// In DEFAULTS
privacy: {
  removeTracking: true,
  trackingParams: [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'utm_name', 'utm_cid', 'fbclid', 'gclid', 'msclkid', 'twclid',
    'li_fat_id', 'igshid', 'ref', 'ref_source', 'ref_url', 'referrer',
    'share_id', 'shared', 'click_id', 'clickid', '_ga', 'rdt_cid',
    '$deep_link', '$3p', '_branch_match_id', '_branch_referrer',
    'mc_cid', 'mc_eid', 'yclid', 'zanpid', 'rb_clickid'
  ],
  showTrackingBadge: true,
  cleanReferrer: false,
  referrerPolicy: 'same-origin',
  trackingStats: {
    totalCleaned: 0,
    lastCleaned: null,
    byType: {
      utm: 0,
      facebook: 0,
      google: 0,
      other: 0
    }
  }
},

// Storage methods
async getPrivacy() {
  const config = await this.get('privacy', DEFAULTS.privacy);
  return { ...DEFAULTS.privacy, ...config };
},

async setPrivacy(config) {
  await this.set('privacy', config);
},

async getTrackingStats() {
  const privacy = await this.getPrivacy();
  return privacy.trackingStats || DEFAULTS.privacy.trackingStats;
},

async updateTrackingStats(data) {
  const privacy = await this.getPrivacy();
  const stats = privacy.trackingStats || { ...DEFAULTS.privacy.trackingStats };

  stats.totalCleaned = (stats.totalCleaned || 0) + 1;
  stats.lastCleaned = new Date().toISOString();

  // Categorize removed params
  data.paramsRemoved.forEach(param => {
    if (param.startsWith('utm_')) {
      stats.byType.utm = (stats.byType.utm || 0) + 1;
    } else if (param === 'fbclid') {
      stats.byType.facebook = (stats.byType.facebook || 0) + 1;
    } else if (param === 'gclid') {
      stats.byType.google = (stats.byType.google || 0) + 1;
    } else {
      stats.byType.other = (stats.byType.other || 0) + 1;
    }
  });

  privacy.trackingStats = stats;
  await this.setPrivacy(privacy);
},

async clearTrackingStats() {
  const privacy = await this.getPrivacy();
  privacy.trackingStats = { ...DEFAULTS.privacy.trackingStats };
  await this.setPrivacy(privacy);
},

async isTrackingRemovalEnabled() {
  const privacy = await this.getPrivacy();
  return privacy.removeTracking !== false;
}
```

**Validation:**
- Run `npm test` - all existing tests should pass
- Verify schema version still 3 (no migration needed)

---

### Phase 5.2.2: Content Script Logic (Day 1-2, 4-5 hours)

**Files to Modify:**
- `content-script.js` - Add tracking protection logic

**Tasks:**

1. Add tracking parameter removal function
2. Add click interception handler
3. Add referrer policy application
4. Integrate with initialization
5. Add message listener for REFRESH_PRIVACY

**Code Location:** After feed enhancements section, before initialization

**Estimated Lines:** ~200 lines

**Validation:**
- Manual test: Click links with utm_source params
- Verify params removed from final URL
- Check console for any errors

---

### Phase 5.2.3: Background Script Logic (Day 2, 2-3 hours)

**Files to Modify:**
- `background.js` - Add stats tracking and badge display

**Tasks:**

1. Add TRACKING_PARAMS_CLEANED message handler
2. Implement updateTrackingStats function
3. Add badge display logic with timeout
4. Add badge color configuration

**Code:**

```javascript
// In message listener
chrome.runtime.onMessage.addListener(async (message, sender) => {
  // ... existing handlers

  if (message.type === 'TRACKING_PARAMS_CLEANED') {
    await handleTrackingCleaned(message, sender);
  }
});

async function handleTrackingCleaned(data, sender) {
  // Update stats
  await window.Storage.updateTrackingStats({
    paramsRemoved: data.paramsRemoved
  });

  // Show badge if enabled
  const privacy = await window.Storage.getPrivacy();
  if (privacy.showTrackingBadge && sender.tab) {
    chrome.action.setBadgeText({
      text: '🛡️',
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#4CAF50',
      tabId: sender.tab.id
    });

    // Clear after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({
        text: '',
        tabId: sender.tab.id
      });
    }, 2000);
  }
}
```

**Validation:**
- Test badge appears when params cleaned
- Verify badge disappears after 2 seconds
- Check stats increment correctly

---

### Phase 5.2.4: Options Page UI (Day 2-3, 3-4 hours)

**Files to Modify:**
- `options.html` - Add privacy section
- `options.css` - Add privacy section styles

**Tasks:**

1. Add Privacy & Tracking Protection section
2. Add tracking removal toggle
3. Add badge display toggle
4. Add stats display grid
5. Add clear stats button
6. Add advanced custom params section
7. Add referrer control section
8. Style all new elements

**HTML Location:** After Feed Enhancements, before Alternative Frontend

**CSS Additions:**
- `.privacy-stats` - Stats grid container
- `.stats-grid` - 2-column grid layout
- `.stat-item` - Individual stat display
- `.params-textarea` - Custom params textarea
- `.referrer-policy-options` - Referrer policy selector section
- `.referrer-policy-info` - Policy description box

**Validation:**
- Visual inspection of all elements
- Responsive layout on narrow screens
- Dark mode compatibility

---

### Phase 5.2.5: Options Page Logic (Day 3, 4-5 hours)

**Files to Modify:**
- `options.js` - Add privacy settings management

**Tasks:**

1. Add element references for all new controls
2. Implement loadPrivacySettings()
3. Implement handleTrackingToggle()
4. Implement handleBadgeToggle()
5. Implement loadTrackingStats()
6. Implement handleClearStats()
7. Implement handleSaveTrackingParams()
8. Implement handleResetTrackingParams()
9. Implement handleReferrerToggle()
10. Implement handleReferrerPolicyChange()
11. Add event listeners
12. Integrate with init flow

**Code Structure:**

```javascript
// Element references
const elements = {
  // ... existing
  privacyRemoveTracking: document.getElementById('privacy-remove-tracking'),
  privacyShowBadge: document.getElementById('privacy-show-badge'),
  trackingCleanedCount: document.getElementById('tracking-cleaned-count'),
  trackingLastCleaned: document.getElementById('tracking-last-cleaned'),
  trackingUtmCount: document.getElementById('tracking-utm-count'),
  trackingFacebookCount: document.getElementById('tracking-facebook-count'),
  trackingGoogleCount: document.getElementById('tracking-google-count'),
  trackingOtherCount: document.getElementById('tracking-other-count'),
  clearTrackingStats: document.getElementById('clear-tracking-stats'),
  trackingParamsList: document.getElementById('tracking-params-list'),
  saveTrackingParams: document.getElementById('save-tracking-params'),
  resetTrackingParams: document.getElementById('reset-tracking-params'),
  privacyCleanReferrer: document.getElementById('privacy-clean-referrer'),
  referrerPolicy: document.getElementById('referrer-policy'),
  referrerPolicyOptions: document.getElementById('referrer-policy-options'),
  referrerPolicyDescription: document.getElementById('referrer-policy-description'),
};

// Load functions
async function loadPrivacySettings() { ... }
async function loadTrackingStats() { ... }

// Handler functions
async function handleTrackingToggle(e) { ... }
async function handleBadgeToggle(e) { ... }
async function handleClearStats() { ... }
async function handleSaveTrackingParams() { ... }
async function handleResetTrackingParams() { ... }
async function handleReferrerToggle(e) { ... }
async function handleReferrerPolicyChange(e) { ... }

// Event listeners
elements.privacyRemoveTracking.addEventListener('change', handleTrackingToggle);
// ... etc
```

**Validation:**
- Test all toggles update storage
- Verify stats display correctly
- Test clear stats resets counts
- Test custom params save/reset
- Test referrer policy changes

---

### Phase 5.2.6: Test Suite (Day 3-4, 3-4 hours)

**Files to Create:**
- `tests/privacy.test.js` - Privacy feature tests

**Test Categories:**

1. **Storage Schema (5 tests)**
   - Default privacy config structure
   - Privacy methods exist
   - Tracking params list populated
   - Stats structure correct

2. **URL Cleaning (8 tests)**
   - Remove single utm param
   - Remove multiple params
   - Preserve non-tracking params
   - Handle invalid URLs
   - Preserve URL structure (hash, port, etc.)
   - Case sensitivity
   - Multiple params of same type

3. **Statistics Tracking (7 tests)**
   - Stats increment correctly
   - Categorization by type
   - Last cleaned timestamp updated
   - Clear stats resets values
   - Stats persist across sessions

4. **Referrer Policy (5 tests)**
   - Meta tag injection
   - Policy change updates tag
   - Disabled removes tag
   - Default policy value
   - Invalid policy handling

**Total New Tests:** ~25 tests

**Test File Structure:**

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Privacy - Storage Schema', () => {
  // 5 tests
});

describe('Privacy - URL Cleaning', () => {
  // 8 tests
});

describe('Privacy - Statistics Tracking', () => {
  // 7 tests
});

describe('Privacy - Referrer Policy', () => {
  // 5 tests
});
```

**Validation:**
- Run `npm test` - all 328 tests should pass (303 + 25)
- Zero lint errors
- All edge cases covered

---

### Phase 5.2.7: Documentation Updates (Day 4, 1-2 hours)

**Files to Update:**

1. **CHANGELOG.md**
   - Add v11.1.0 section
   - Document all new features
   - List breaking changes (none)

2. **README.md**
   - Add Privacy & Tracking Protection to feature list
   - Add usage examples

3. **CLAUDE.md**
   - Update architecture notes
   - Document privacy storage schema
   - Update test count (303 → 328)

4. **manifest.json / package.json**
   - Update version to 11.1.0

**Validation:**
- Links work correctly
- Markdown renders properly
- Version numbers consistent

---

## Testing Strategy

### Automated Testing

**Test Pyramid:**
- Unit tests: 25 new tests
- Integration tests: Covered by manual testing
- E2E tests: Not applicable (browser extension)

**Coverage Goals:**
- URL cleaning logic: 100%
- Storage methods: 100%
- Stats tracking: 100%
- Referrer policy: 80%

### Manual Testing

**Test Plan: Tracking Parameter Removal**

1. **Basic Functionality:**
   - [ ] Enable tracking removal
   - [ ] Click link with `?utm_source=test`
   - [ ] Verify param removed from destination URL
   - [ ] Check stats incremented

2. **Multiple Parameters:**
   - [ ] Click link with `?utm_source=a&utm_medium=b&ref=c`
   - [ ] Verify all params removed
   - [ ] Stats show correct counts

3. **Preserved Parameters:**
   - [ ] Click link with `?utm_source=test&sort=new`
   - [ ] Verify utm_source removed, sort preserved

4. **Special Cases:**
   - [ ] Ctrl+click opens in new tab with cleaned URL
   - [ ] Middle-click opens in new tab with cleaned URL
   - [ ] Right-click → Open in new tab works

5. **Badge Display:**
   - [ ] Enable badge display
   - [ ] Click tracked link
   - [ ] Verify shield badge appears
   - [ ] Badge disappears after 2 seconds

6. **Performance:**
   - [ ] Click 10 links rapidly
   - [ ] No navigation delays
   - [ ] No console errors

7. **Custom Parameters:**
   - [ ] Add custom param `customtrack`
   - [ ] Click link with `?customtrack=123`
   - [ ] Verify param removed

**Test Plan: Referrer Control**

1. **Policy Application:**
   - [ ] Enable referrer control
   - [ ] Select "same-origin" policy
   - [ ] Verify meta tag injected
   - [ ] Check tag content correct

2. **Policy Changes:**
   - [ ] Change to "no-referrer"
   - [ ] Verify meta tag updates
   - [ ] Change to "origin"
   - [ ] Verify updates again

3. **Disable Feature:**
   - [ ] Disable referrer control
   - [ ] Verify meta tag removed

**Browser Testing:**
- Chrome (latest)
- Firefox (latest)
- Edge (Chromium-based)

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| URL cleaning time | <10ms | Time from click to navigation |
| Badge display time | <50ms | Time from clean to badge visible |
| Stats update time | <20ms | Time to update storage |
| Memory overhead | <500KB | Additional memory for feature |
| Content script size | +200 lines | Total added to content-script.js |

### Performance Testing

**Test Scenarios:**

1. **Rapid Clicks:**
   - Click 20 links in 5 seconds
   - Measure: Average cleaning time
   - Expected: <10ms per link

2. **Large Parameter Lists:**
   - URL with 10 tracking params
   - Measure: Cleaning time
   - Expected: <15ms

3. **Stats Updates:**
   - Clean 100 URLs
   - Measure: Total time for stats updates
   - Expected: <2000ms (20ms average)

**Tools:**
- Chrome DevTools Performance tab
- `console.time()` / `console.timeEnd()`
- Manual stopwatch for navigation delays

---

## Dependencies & Risks

### Dependencies

**Internal:**
- Existing storage infrastructure (v3 schema)
- Content script injection mechanism
- Background message passing
- Options page framework

**External:**
- Chrome/Firefox URL API
- Extension badge API
- Storage API quota (unlimited for extensions)

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **URL cleaning breaks navigation** | Low | High | Comprehensive testing, easy disable toggle |
| **Performance degradation** | Low | Medium | Profile extensively, optimize if needed |
| **False positives (removing needed params)** | Medium | Low | Conservative default list, user customization |
| **Badge API issues** | Very Low | Low | Graceful degradation if badge fails |
| **Referrer policy conflicts** | Low | Medium | Check for existing meta tags, warn user |
| **Storage quota exceeded** | Very Low | Low | Stats limited to simple counters |
| **Browser compatibility** | Low | Medium | Test on Chrome and Firefox |

### Critical Risks

**None identified.** All features:
- Are opt-in (can be disabled)
- Don't modify Reddit's core functionality
- Have fallback behavior if they fail
- Are reversible

### Mitigation Strategies

1. **Performance Issues:**
   - Add performance monitoring
   - Implement debouncing if needed
   - Add option to disable badge

2. **Navigation Failures:**
   - Extensive edge case testing
   - Quick-disable option in popup
   - Clear error messages

3. **Compatibility Issues:**
   - Browser detection for feature support
   - Graceful degradation
   - Clear documentation of limitations

---

## Rollout Strategy

### Phased Rollout (Optional)

**Week 1: Development**
- Complete implementation
- Internal testing

**Week 2: Beta Testing**
- Release to beta users (if program exists)
- Collect feedback
- Fix critical bugs

**Week 3: Stable Release**
- Publish to Chrome Web Store / Firefox Add-ons
- Monitor for issues
- Update documentation

### Feature Flags

Consider adding killswitch for quick disable:

```javascript
// In background.js
const PRIVACY_FEATURE_ENABLED = true; // Can be toggled remotely if needed

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRACKING_PARAMS_CLEANED') {
    if (!PRIVACY_FEATURE_ENABLED) return; // Killswitch
    // ... normal handling
  }
});
```

### Rollback Plan

**If critical issues found:**

1. **Immediate:** Disable feature via options page
2. **Short-term:** Push hotfix with feature disabled by default
3. **Long-term:** Fix issues, re-enable in next release

**Storage Impact:**
- No schema changes (still v3)
- Can rollback without data migration
- Old versions ignore new privacy fields

---

## Success Criteria

### Quantitative Metrics

**Code Quality:**
- [ ] All 328+ tests passing
- [ ] Zero lint errors
- [ ] Zero console errors in manual testing

**Performance:**
- [ ] URL cleaning <10ms average
- [ ] No navigation delays
- [ ] Badge display <50ms

**Coverage:**
- [ ] 25+ new tests added
- [ ] All tracking params in default list tested
- [ ] All referrer policies tested

### Qualitative Metrics

**User Experience:**
- [ ] Feature works transparently (no user intervention)
- [ ] Stats provide useful information
- [ ] UI is clear and understandable

**Code Quality:**
- [ ] Code follows project conventions
- [ ] Comments explain complex logic
- [ ] No code duplication

**Documentation:**
- [ ] README updated with new features
- [ ] CHANGELOG entry complete
- [ ] CLAUDE.md updated

---

## Timeline & Milestones

### Detailed Schedule (4 days)

**Day 1 (6-8 hours):**
- Morning: Storage schema (2-3 hours)
- Afternoon: Content script logic Part 1 (4-5 hours)

**Day 2 (6-8 hours):**
- Morning: Content script logic Part 2 (2 hours)
- Late morning: Background script logic (2-3 hours)
- Afternoon: Options page UI (3-4 hours)

**Day 3 (6-8 hours):**
- Morning: Options page logic (4-5 hours)
- Afternoon: Test suite Part 1 (3-4 hours)

**Day 4 (4-6 hours):**
- Morning: Test suite Part 2 (1-2 hours)
- Late morning: Documentation (1-2 hours)
- Afternoon: Manual testing and fixes (2-3 hours)

**Total Estimated Time:** 22-30 hours over 4 days

### Milestones

- ✅ Day 0: Planning complete (this document)
- 🎯 Day 1 PM: Core logic implemented
- 🎯 Day 2 PM: UI complete
- 🎯 Day 3 PM: All tests written
- 🎯 Day 4 PM: v11.1.0 ready for release

---

## Post-Release

### Monitoring

**Metrics to Track:**
- User adoption rate (if analytics available)
- Feature toggle rates
- Bug reports related to navigation
- Performance complaints

**Tools:**
- GitHub Issues for bug reports
- Extension store reviews
- User feedback channels

### Iteration Plan

**v11.1.1 (Patch):**
- Bug fixes from user reports
- Performance improvements if needed
- Additional tracking params if discovered

**v11.2.0 (Next Phase):**
- Advanced Content Blocking
- Jump to Top button
- AI Overview blocking

---

## Appendix A: Default Tracking Parameters

**Full List (30+ parameters):**

```javascript
const DEFAULT_TRACKING_PARAMS = [
  // UTM (7)
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
  'utm_content', 'utm_name', 'utm_cid',

  // Social Media (6)
  'fbclid', 'gclid', 'msclkid', 'twclid', 'li_fat_id', 'igshid',

  // Referral (6)
  'ref', 'ref_source', 'ref_url', 'referrer', 'share_id', 'shared',

  // Click Tracking (3)
  'click_id', 'clickid', '_ga',

  // Reddit-Specific (5)
  'rdt_cid', '$deep_link', '$3p', '_branch_match_id', '_branch_referrer',

  // Email Marketing (2)
  'mc_cid', 'mc_eid',

  // Other (3)
  'yclid', 'zanpid', 'rb_clickid'
];
```

**Total: 32 parameters**

---

## Appendix B: File Change Summary

### New Files
```
tests/privacy.test.js                    (~250 lines, 25 tests)
```

### Modified Files

**v11.1.0 Changes:**
```
storage.js              (+150 lines: privacy schema + 6 methods)
content-script.js       (+200 lines: tracking removal + referrer control)
background.js           (+80 lines: stats tracking + badge display)
options.html            (+150 lines: privacy section)
options.js              (+180 lines: privacy UI logic + 11 handlers)
options.css             (+80 lines: privacy section styles)
manifest.json           (version: 11.0.0 → 11.1.0)
package.json            (version: 11.0.0 → 11.1.0)
CHANGELOG.md            (+40 lines: v11.1.0 entry)
README.md               (+20 lines: privacy features)
CLAUDE.md               (+15 lines: privacy notes)
```

**Total Impact:**
- +1,115 lines of code added
- +25 tests (303 → 328)
- 1 new test file
- 11 modified files

---

## Appendix C: Message Types

**New Message Types:**

```javascript
// Content Script → Background
{
  type: 'TRACKING_PARAMS_CLEANED',
  original: string,           // Original URL
  cleaned: string,            // Cleaned URL
  paramsRemoved: string[]     // List of removed params
}

// Options Page → Content Script
{
  type: 'REFRESH_PRIVACY'     // Reload privacy settings
}
```

---

## Appendix D: Storage Size Estimation

**Privacy Storage Impact:**

```javascript
privacy: {
  removeTracking: true,                    // 1 byte
  trackingParams: [...32 params],          // ~500 bytes
  showTrackingBadge: true,                 // 1 byte
  cleanReferrer: false,                    // 1 byte
  referrerPolicy: 'same-origin',           // 11 bytes
  trackingStats: {
    totalCleaned: 1000,                    // 4 bytes
    lastCleaned: '2026-01-30...',          // 24 bytes
    byType: {
      utm: 500,                            // 4 bytes each
      facebook: 200,
      google: 200,
      other: 100
    }
  }
}
```

**Total: ~700 bytes (negligible)**

Storage quota for extensions: Unlimited (synced storage has 100KB limit, but privacy uses local storage)

---

_Last Updated: 2026-01-30_
_Status: v11.1.0 - 🟡 PLANNING COMPLETE, READY TO IMPLEMENT_
_Estimated Completion: 4 days (22-30 hours)_

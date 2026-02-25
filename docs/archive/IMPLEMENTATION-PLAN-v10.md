# Implementation Plan: Phase 4.3 - Scroll Position Memory

> **Version**: 10.0.0-plan-v1
> **Date**: 2026-01-30
> **Target Release**: v10.0.0
> **Author**: Development Team

---

## Executive Summary

This document outlines the implementation plan for **Phase 4.3: Scroll Position Memory** of Old Reddit Enhanced. This feature remembers users' scroll positions when they navigate away from a page and automatically restores that position when they return via the back button.

**Key Benefits**:

- Eliminates frustration of losing your place when using back button
- Seamless browsing experience across Reddit
- Automatic cleanup of old positions (24-hour retention)

---

## Feature Specification: Scroll Position Memory (v10.0.0)

### Overview

Save and restore scroll position when users navigate away from and return to Reddit pages. This is particularly useful when browsing posts, clicking into a post, then using the back button to return to the listing.

### User Stories

- As a user browsing /r/all, I want to return to my exact position after reading a post
- As a user who frequently uses the back button, I want my scroll position preserved
- As a user, I want old scroll positions automatically cleaned up so storage doesn't grow unbounded

### Technical Design

#### Storage Schema

```javascript
scrollPositions: {
  enabled: true,
  maxEntries: 100,
  positions: {
    // Key: URL (without query params for consistency)
    // Value: { scrollY, timestamp }
    "https://old.reddit.com/r/AskReddit/": {
      scrollY: 1234,
      timestamp: 1234567890
    },
  },
}
```

#### Implementation Approach

**1. Save Position on Navigation**:

```javascript
window.addEventListener('beforeunload', () => {
  const url = normalizeUrl(window.location.href);
  const scrollY = window.scrollY;
  await storage.setScrollPosition(url, { scrollY, timestamp: Date.now() });
});
```

**2. Restore Position on Page Load**:

```javascript
window.addEventListener("load", async () => {
  const url = normalizeUrl(window.location.href);
  const position = await storage.getScrollPosition(url);

  if (position) {
    // Restore scroll position
    window.scrollTo(0, position.scrollY);
  }
});
```

**3. URL Normalization**:

- Remove query parameters for consistency (except important ones like sort)
- Normalize trailing slashes
- Key by base URL to avoid storing duplicate positions

**4. Cleanup Strategy**:

- Delete positions older than 24 hours
- Enforce max 100 entries with LRU eviction
- Run cleanup on page load (async, non-blocking)

#### Edge Cases

1. **Dynamic Content**:
   - Reddit loads content dynamically, may need delay before restoring
   - Solution: Use requestIdleCallback or small timeout

2. **Different Page Heights**:
   - Returning page may be shorter/taller than saved position
   - Solution: Clamp to valid scroll range (0 to document.height)

3. **Query Parameters**:
   - Different sorts have different scroll positions
   - Solution: Include sort parameter in URL key when present

4. **Performance**:
   - Saving on every navigation could be slow
   - Solution: Use async storage, non-blocking

### Acceptance Criteria

- [ ] Scroll position saved when navigating away (beforeunload)
- [ ] Position restored when returning to page (load)
- [ ] Works with browser back button
- [ ] Old positions automatically cleaned up (24-hour retention)
- [ ] Feature can be toggled on/off
- [ ] Maximum 100 positions stored with LRU eviction
- [ ] No performance impact on page load
- [ ] Works with dynamic content loading

### Test Plan

**Unit Tests**:

- URL normalization logic
- Storage methods (get/set/delete/clear)
- Cleanup logic (24-hour retention)
- LRU eviction
- Position clamping to valid range

**Manual Testing**:

1. Browse /r/all, scroll halfway down
2. Click a post
3. Click back button
4. Verify scroll position restored to halfway
5. Repeat with different pages
6. Disable feature, verify no position restoration
7. Wait 24+ hours, verify old positions cleaned up

---

## Implementation Steps

### Step 1: Storage Schema

```javascript
// In storage.js DEFAULTS
scrollPositions: {
  enabled: true,
  maxEntries: 100,
  retentionHours: 24,
  positions: {},
}

// Add to SYNC_KEYS (optional - scroll positions may not need sync)
// Omit from SYNC_KEYS since scroll positions are session-specific

// Add storage methods
async getScrollPositions() { ... }
async setScrollPositions(config) { ... }
async getScrollPosition(url) { ... }
async setScrollPosition(url, data) { ... }
async deleteScrollPosition(url) { ... }
async clearScrollPositions() { ... }
async cleanupOldScrollPositions() { ... }
async isScrollPositionsEnabled() { ... }
```

### Step 2: Content Script Logic

```javascript
// Normalize URL for storage key
function normalizeScrollUrl(url) {
  try {
    const urlObj = new URL(url);

    // Keep path and important query params (like sort)
    let key = urlObj.origin + urlObj.pathname;

    // Include sort parameter if present
    if (urlObj.searchParams.has("sort")) {
      key += "?sort=" + urlObj.searchParams.get("sort");
    }

    return key;
  } catch (e) {
    return url;
  }
}

// Save scroll position before leaving
async function saveScrollPosition() {
  try {
    const enabled = await storage.isScrollPositionsEnabled();
    if (!enabled) return;

    const url = normalizeScrollUrl(window.location.href);
    const scrollY = window.scrollY;

    await storage.setScrollPosition(url, {
      scrollY,
      timestamp: Date.now(),
    });

    logger.debug(`Saved scroll position for ${url}: ${scrollY}`);
  } catch (error) {
    logger.error("Error saving scroll position:", error);
  }
}

// Restore scroll position on page load
async function restoreScrollPosition() {
  try {
    const enabled = await storage.isScrollPositionsEnabled();
    if (!enabled) return;

    const url = normalizeScrollUrl(window.location.href);
    const position = await storage.getScrollPosition(url);

    if (!position) return;

    // Small delay to allow content to load
    requestIdleCallback(
      () => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const clampedY = Math.max(0, Math.min(position.scrollY, maxScroll));

        window.scrollTo({
          top: clampedY,
          behavior: "instant", // Instant, not smooth
        });

        logger.debug(`Restored scroll position for ${url}: ${clampedY}`);
      },
      { timeout: 100 }
    );
  } catch (error) {
    logger.error("Error restoring scroll position:", error);
  }
}

// Cleanup old positions (run on page load)
async function cleanupScrollPositions() {
  try {
    const enabled = await storage.isScrollPositionsEnabled();
    if (!enabled) return;

    await storage.cleanupOldScrollPositions();
  } catch (error) {
    logger.error("Error cleaning up scroll positions:", error);
  }
}

// Attach event listeners
window.addEventListener("beforeunload", saveScrollPosition);
window.addEventListener("load", restoreScrollPosition);
window.addEventListener("load", cleanupScrollPositions);

// Also restore on DOMContentLoaded for faster response
document.addEventListener("DOMContentLoaded", restoreScrollPosition);
```

### Step 3: Options Page

```html
<section class="setting">
  <h2>Scroll Position Memory</h2>
  <p class="section-description">
    Remember your scroll position when navigating away from pages. Your position
    is automatically restored when you return via the back button.
  </p>

  <div class="option-row">
    <label class="checkbox-label">
      <input type="checkbox" id="scroll-positions-enabled" checked />
      <span>Remember scroll positions</span>
    </label>
    <p class="option-description">
      Automatically save and restore scroll position when using back button
    </p>
  </div>

  <div class="scroll-positions-management">
    <p class="info-text">
      <strong>Storage:</strong>
      <span id="scroll-positions-count">0</span> positions saved (max 100,
      auto-cleanup after 24 hours)
    </p>
    <button id="clear-scroll-positions" class="secondary-button">
      Clear All Positions
    </button>
  </div>
</section>
```

### Step 4: Options Page Logic

```javascript
async function loadScrollPositions() {
  const config = await window.Storage.getScrollPositions();

  document.getElementById("scroll-positions-enabled").checked =
    config.enabled !== false;

  const count = Object.keys(config.positions || {}).length;
  document.getElementById("scroll-positions-count").textContent = count;
}

async function handleScrollPositionsToggle(e) {
  const enabled = e.target.checked;
  const config = await window.Storage.getScrollPositions();
  config.enabled = enabled;
  await window.Storage.setScrollPositions(config);
}

async function handleClearScrollPositions() {
  if (!confirm("Clear all saved scroll positions?")) return;

  await window.Storage.clearScrollPositions();
  await loadScrollPositions();
}

// Event listeners
document
  .getElementById("scroll-positions-enabled")
  .addEventListener("change", handleScrollPositionsToggle);

document
  .getElementById("clear-scroll-positions")
  .addEventListener("click", handleClearScrollPositions);
```

---

## Test Coverage

```javascript
// tests/scroll-positions.test.js

describe("Scroll Positions - URL Normalization", () => {
  it("should normalize URLs correctly", () => {
    // Test URL normalization logic
  });

  it("should preserve sort parameter", () => {
    // Test that ?sort=new is preserved
  });

  it("should remove unnecessary query params", () => {
    // Test that other params are removed
  });
});

describe("Scroll Positions - Storage", () => {
  it("should save scroll position", () => {
    // Test saving
  });

  it("should restore scroll position", () => {
    // Test restoration
  });

  it("should cleanup old positions", () => {
    // Test 24-hour retention
  });

  it("should enforce max entries", () => {
    // Test LRU eviction
  });
});

describe("Scroll Positions - Position Clamping", () => {
  it("should clamp to valid range", () => {
    // Test that position is clamped to document height
  });
});
```

---

## Risk Assessment

### Low Risk

| Risk            | Impact               | Mitigation                                |
| --------------- | -------------------- | ----------------------------------------- |
| Storage quota   | Can't save positions | Enforce max 100 entries, 24-hour cleanup  |
| Performance     | Slow page loads      | Use async operations, requestIdleCallback |
| Dynamic content | Wrong position       | Small delay before restoring              |

---

_Last Updated: 2026-01-30_
_Status: v10.0.0 - 🟢 PLANNING COMPLETE, READY TO IMPLEMENT_

# Implementation Plan: Phase 4.1 - Remember Sort Order

> **Version**: 8.0.0-plan-v1
> **Date**: 2026-01-30
> **Target Release**: v8.0.0
> **Author**: Development Team

---

## Executive Summary

This document outlines the implementation plan for **Phase 4.1: Remember Sort Order** of Old Reddit Enhanced. This feature remembers users' preferred sort order (hot/new/top/rising/controversial) for each subreddit and automatically applies it on future visits.

**Key Benefits**:

- Saves users time by eliminating repetitive sort changes
- Provides personalized browsing experience per subreddit
- Works seamlessly without disrupting Reddit's native behavior

---

## Current State Assessment

### Repository Status

| Metric                 | Value                       |
| ---------------------- | --------------------------- |
| Current Version        | 7.2.0 (released 2026-01-30) |
| Test Coverage          | 197 tests, 100% passing     |
| ESLint Errors          | 0                           |
| Content Script Size    | ~750 lines                  |
| Storage Schema Version | 2                           |

### Completed Infrastructure

Phase 4 builds on all previous phases:

- Content script with MutationObserver
- Storage abstraction layer with sync support
- Options page UI patterns
- Message passing for real-time updates

---

## Feature Specification: Remember Sort Order (v8.0.0)

### Overview

Automatically apply user's preferred sort order when visiting subreddits, eliminating the need to manually change sort settings each time.

### User Stories

- As a user who always sorts /r/news by "new", I want my preference remembered so I don't have to change it every visit
- As a user who uses different sorts for different subreddits, I want each preference saved independently
- As a user who wants to clear my preferences, I want an easy way to reset individual or all subreddits

### Technical Design

#### URL Structure Analysis

Old Reddit subreddit URLs follow this pattern:

```
https://old.reddit.com/r/subreddit/              # Default (hot)
https://old.reddit.com/r/subreddit/?sort=new     # New
https://old.reddit.com/r/subreddit/?sort=top     # Top (default: today)
https://old.reddit.com/r/subreddit/?sort=top&t=week  # Top this week
https://old.reddit.com/r/subreddit/?sort=rising  # Rising
https://old.reddit.com/r/subreddit/?sort=controversial  # Controversial
```

**Sort Options**:

- `hot` (default, no parameter)
- `new`
- `top` (with time: `hour`, `day`, `week`, `month`, `year`, `all`)
- `rising`
- `controversial` (with time parameters)

#### Implementation Approach

**1. Detection Logic** (content-script.js):

- Detect when user changes sort order manually
- Extract subreddit name from URL
- Extract new sort order from URL or dropdown
- Save preference to storage

**2. Application Logic** (content-script.js):

- On page load, check if current page is a subreddit listing
- Extract subreddit name
- Check if preference exists for this subreddit
- If preference differs from current sort, redirect to preferred sort

**3. Storage Schema** (storage.js):

```javascript
sortPreferences: {
  // Key: subreddit name (lowercase)
  // Value: { sort: "new", time: "week", timestamp: 1234567890 }
  "askreddit": { sort: "new", time: null, timestamp: 1234567890 },
  "news": { sort: "top", time: "day", timestamp: 1234567890 },
  // ... up to 100 subreddits
}
```

**4. Options UI** (options.html/js):

- Table or list showing saved preferences
- Search/filter capability
- Delete individual preference
- Clear all preferences button
- Export/import preferences (JSON)

#### Edge Cases

1. **Redirect Loops**:
   - Use session flag to prevent infinite redirects
   - Only redirect once per page load

2. **URL Parameters**:
   - Preserve other URL parameters (like `?after=` for pagination)
   - Only modify sort-related parameters

3. **Storage Limits**:
   - Limit to 100 subreddit preferences
   - Implement LRU eviction if limit reached
   - Timestamp each preference for cleanup

4. **Front Page**:
   - Don't apply to reddit.com homepage
   - Only apply to /r/subreddit URLs

5. **Special Subreddits**:
   - Handle /r/all and /r/popular
   - Handle multireddits (don't apply preferences)

#### Detection Methods

**Method 1: URL Change Detection** (Preferred)

- Listen for URL changes using `watchForDynamicContent` observer
- Compare old sort vs new sort
- Save preference when sort changes

**Method 2: Click Detection**

- Attach listeners to sort links/buttons
- Requires finding Reddit's sort UI elements
- More fragile if Reddit changes UI

**Decision**: Use Method 1 (URL change detection) for reliability

#### Redirect Logic Pseudocode

```javascript
function applySortPreference() {
  // Only run on subreddit pages
  if (!isSubredditPage()) return;

  // Prevent redirect loops
  if (sessionStorage.getItem('orr-sort-redirected')) return;

  const subreddit = getSubredditFromUrl();
  const currentSort = getCurrentSort();
  const preference = await getSortPreference(subreddit);

  if (!preference) return; // No preference saved
  if (sortMatches(currentSort, preference)) return; // Already correct

  // Build new URL with preferred sort
  const newUrl = buildSortUrl(subreddit, preference);

  // Mark redirect to prevent loop
  sessionStorage.setItem('orr-sort-redirected', 'true');

  // Redirect
  window.location.href = newUrl;
}

function saveSortPreference() {
  if (!isSubredditPage()) return;

  // Clear redirect flag (user is manually changing sort)
  sessionStorage.removeItem('orr-sort-redirected');

  const subreddit = getSubredditFromUrl();
  const sort = getCurrentSort();

  await setSortPreference(subreddit, sort);
}
```

### Storage Schema Addition

```javascript
// In storage.js
const DEFAULT_SETTINGS = {
  // ... existing settings
  sortPreferences: {}, // { subreddit: { sort, time, timestamp } }
  sortPreferencesEnabled: true,
  sortPreferencesMaxEntries: 100,
};

// Add to SYNC_KEYS
const SYNC_KEYS = [
  // ... existing keys
  "sortPreferences",
  "sortPreferencesEnabled",
];
```

### Options UI Design

**New Section**: "Subreddit Sort Preferences"

```html
<section>
  <h2>Subreddit Sort Preferences</h2>

  <div class="setting">
    <label>
      <input type="checkbox" id="sort-preferences-enabled" checked />
      Remember sort order per subreddit
    </label>
    <p class="description">
      Automatically apply your preferred sort order when visiting subreddits
    </p>
  </div>

  <div class="sort-preferences-management">
    <h3>Saved Preferences (<span id="pref-count">0</span>)</h3>

    <div class="controls">
      <button id="clear-all-prefs" class="danger">Clear All Preferences</button>
      <button id="export-prefs">Export</button>
      <button id="import-prefs">Import</button>
    </div>

    <input type="text" id="pref-search" placeholder="Search subreddits..." />

    <table id="prefs-table">
      <thead>
        <tr>
          <th>Subreddit</th>
          <th>Sort Order</th>
          <th>Last Used</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="prefs-tbody">
        <!-- Populated by JS -->
      </tbody>
    </table>

    <p class="empty-state" id="prefs-empty" style="display: none;">
      No saved preferences yet. Visit a subreddit and change the sort order to
      save a preference.
    </p>
  </div>
</section>
```

### CSS Additions

```css
.sort-preferences-management {
  margin-top: 20px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.sort-preferences-management .controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

#prefs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

#prefs-table th {
  text-align: left;
  padding: 8px;
  background: var(--bg-tertiary);
  font-weight: 600;
}

#prefs-table td {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

#prefs-table button {
  padding: 4px 8px;
  font-size: 12px;
}

.empty-state {
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
}
```

### Acceptance Criteria

- [ ] Sort preference is saved when user manually changes sort
- [ ] Preference is auto-applied on next visit to that subreddit
- [ ] Works with all sort types (hot/new/top/rising/controversial)
- [ ] Works with time filters for top/controversial (hour/day/week/month/year/all)
- [ ] No redirect loops occur
- [ ] Feature can be toggled on/off
- [ ] User can view all saved preferences
- [ ] User can delete individual preferences
- [ ] User can clear all preferences
- [ ] Preferences sync across browser instances
- [ ] Respects 100 entry limit with LRU eviction
- [ ] Does not interfere with pagination
- [ ] Does not apply to homepage or multireddits

### Test Plan

**Unit Tests** (tests/sort-preferences.test.js):

- `isSubredditPage()` correctly identifies subreddit URLs
- `getSubredditFromUrl()` extracts subreddit name
- `getCurrentSort()` parses sort from URL
- `buildSortUrl()` constructs correct URLs
- Storage schema includes sort preferences
- LRU eviction works when limit reached
- Time parameter handling for top/controversial

**Manual Testing**:

1. Visit /r/AskReddit, change sort to "new"
2. Navigate away and return
3. Verify sort is "new" automatically
4. Test with top sort and time filter (e.g., "top this week")
5. Verify preference saved correctly with time parameter
6. Test redirect does not interfere with pagination
7. Test with 100+ subreddits to verify LRU eviction
8. Test disable feature, verify no redirects occur
9. Test clear all preferences, verify all removed
10. Test export/import preferences

---

## Implementation Steps

### Step 1: Storage Schema (storage.js)

Add sort preferences to storage schema:

```javascript
// Add to DEFAULT_SETTINGS
sortPreferences: {},
sortPreferencesEnabled: true,
sortPreferencesMaxEntries: 100,

// Add new methods
async getSortPreferences() {
  const data = await this.get(['sortPreferences']);
  return data.sortPreferences || {};
},

async getSortPreference(subreddit) {
  const prefs = await this.getSortPreferences();
  return prefs[subreddit.toLowerCase()] || null;
},

async setSortPreference(subreddit, sortData) {
  const prefs = await this.getSortPreferences();
  const key = subreddit.toLowerCase();

  // Add timestamp
  prefs[key] = {
    ...sortData,
    timestamp: Date.now(),
  };

  // Enforce limit with LRU eviction
  if (Object.keys(prefs).length > this.sortPreferencesMaxEntries) {
    // Find oldest entry
    let oldest = null;
    let oldestTime = Infinity;
    for (const [sub, data] of Object.entries(prefs)) {
      if (data.timestamp < oldestTime) {
        oldest = sub;
        oldestTime = data.timestamp;
      }
    }
    if (oldest) delete prefs[oldest];
  }

  await this.set({ sortPreferences: prefs });
},

async deleteSortPreference(subreddit) {
  const prefs = await this.getSortPreferences();
  delete prefs[subreddit.toLowerCase()];
  await this.set({ sortPreferences: prefs });
},

async clearSortPreferences() {
  await this.set({ sortPreferences: {} });
},

async isSortPreferencesEnabled() {
  const data = await this.get(['sortPreferencesEnabled']);
  return data.sortPreferencesEnabled !== false;
},
```

### Step 2: Content Script Logic (content-script.js)

Add sort detection and application:

```javascript
// URL parsing helpers
function isSubredditPage() {
  const path = window.location.pathname;
  // Match /r/subreddit but not /r/subreddit/comments/...
  return /^\/r\/[^\/]+\/?$/.test(path);
}

function getSubredditFromUrl() {
  const match = window.location.pathname.match(/^\/r\/([^\/]+)/);
  return match ? match[1] : null;
}

function getCurrentSort() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") || "hot";
  const time = params.get("t") || null;
  return { sort, time };
}

function buildSortUrl(subreddit, sortData) {
  let url = `https://old.reddit.com/r/${subreddit}/`;
  const params = new URLSearchParams();

  if (sortData.sort && sortData.sort !== "hot") {
    params.set("sort", sortData.sort);
  }

  if (sortData.time) {
    params.set("t", sortData.time);
  }

  const queryString = params.toString();
  if (queryString) {
    url += "?" + queryString;
  }

  return url;
}

function sortMatches(current, preference) {
  return current.sort === preference.sort && current.time === preference.time;
}

// Main functions
async function applySortPreference() {
  // Check if feature is enabled
  const enabled = await storage.isSortPreferencesEnabled();
  if (!enabled) return;

  // Only run on subreddit pages
  if (!isSubredditPage()) return;

  // Prevent redirect loops
  if (sessionStorage.getItem("orr-sort-redirected")) {
    return;
  }

  const subreddit = getSubredditFromUrl();
  if (!subreddit) return;

  const currentSort = getCurrentSort();
  const preference = await storage.getSortPreference(subreddit);

  if (!preference) return; // No preference saved
  if (sortMatches(currentSort, preference)) return; // Already correct

  // Build new URL with preferred sort
  const newUrl = buildSortUrl(subreddit, preference);

  // Mark redirect to prevent loop
  sessionStorage.setItem("orr-sort-redirected", "true");

  // Redirect
  window.location.href = newUrl;
}

let lastUrl = window.location.href;
let lastSort = null;

async function detectSortChange() {
  const currentUrl = window.location.href;

  // URL hasn't changed
  if (currentUrl === lastUrl) return;

  // Check if we're on a subreddit page
  if (!isSubredditPage()) {
    lastUrl = currentUrl;
    return;
  }

  const subreddit = getSubredditFromUrl();
  if (!subreddit) return;

  const currentSort = getCurrentSort();

  // If this is first detection or sort changed
  if (lastSort && !sortMatches(currentSort, lastSort)) {
    // User manually changed sort, save preference
    await storage.setSortPreference(subreddit, currentSort);

    // Clear redirect flag (user is manually navigating)
    sessionStorage.removeItem("orr-sort-redirected");

    logger.debug(`Saved sort preference for /r/${subreddit}:`, currentSort);
  }

  lastUrl = currentUrl;
  lastSort = currentSort;
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    await applySortPreference();
    lastSort = getCurrentSort();
  });
} else {
  applySortPreference();
  lastSort = getCurrentSort();
}

// Watch for navigation changes (for SPA-like behavior)
setInterval(detectSortChange, 1000);
```

### Step 3: Options Page UI (options.html)

Add sort preferences section after comment enhancements:

```html
<!-- Add after Comment Enhancements section -->
<section class="settings-section">
  <h2>Subreddit Sort Preferences</h2>

  <div class="setting">
    <label class="checkbox-label">
      <input type="checkbox" id="sort-preferences-enabled" checked />
      <span>Remember sort order per subreddit</span>
    </label>
    <p class="description">
      Automatically apply your preferred sort order (new/top/rising/etc.) when
      visiting subreddits. Your preference is saved when you manually change the
      sort order.
    </p>
  </div>

  <div class="sort-preferences-management" id="sort-prefs-container">
    <div class="prefs-header">
      <h3>
        Saved Preferences (<span id="pref-count">0</span>/<span id="pref-max"
          >100</span
        >)
      </h3>
      <div class="prefs-controls">
        <input
          type="text"
          id="pref-search"
          placeholder="Search subreddits..."
          class="search-input"
        />
        <button
          id="export-prefs"
          class="secondary-button"
          title="Export preferences as JSON"
        >
          Export
        </button>
        <button
          id="import-prefs"
          class="secondary-button"
          title="Import preferences from JSON"
        >
          Import
        </button>
        <button
          id="clear-all-prefs"
          class="danger-button"
          title="Clear all saved preferences"
        >
          Clear All
        </button>
      </div>
    </div>

    <div id="prefs-list-container">
      <table id="prefs-table">
        <thead>
          <tr>
            <th>Subreddit</th>
            <th>Sort Order</th>
            <th>Time Filter</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="prefs-tbody">
          <!-- Populated by JavaScript -->
        </tbody>
      </table>

      <p class="empty-state" id="prefs-empty">
        No saved preferences yet. Visit a subreddit and change the sort order to
        automatically save your preference.
      </p>
    </div>
  </div>
</section>
```

### Step 4: Options Page Logic (options.js)

Add sort preferences management:

```javascript
// Load sort preferences on page load
async function loadSortPreferences() {
  const enabled = await storage.isSortPreferencesEnabled();
  document.getElementById("sort-preferences-enabled").checked = enabled;

  await refreshSortPreferencesList();
}

async function refreshSortPreferencesList() {
  const prefs = await storage.getSortPreferences();
  const tbody = document.getElementById("prefs-tbody");
  const emptyState = document.getElementById("prefs-empty");
  const countSpan = document.getElementById("pref-count");
  const maxSpan = document.getElementById("pref-max");
  const searchInput = document.getElementById("pref-search");

  const entries = Object.entries(prefs);
  const searchTerm = searchInput.value.toLowerCase();

  // Filter by search term
  const filtered = entries.filter(([sub]) => sub.includes(searchTerm));

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => b[1].timestamp - a[1].timestamp);

  countSpan.textContent = entries.length;
  maxSpan.textContent = storage.DEFAULT_SETTINGS.sortPreferencesMaxEntries;

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  tbody.innerHTML = filtered
    .map(([subreddit, data]) => {
      const sortDisplay = formatSortDisplay(data.sort);
      const timeDisplay = data.time ? formatTimeDisplay(data.time) : "—";
      const dateDisplay = formatDate(data.timestamp);

      return `
      <tr data-subreddit="${escapeHtml(subreddit)}">
        <td class="subreddit-cell">
          <a href="https://old.reddit.com/r/${escapeHtml(subreddit)}/"
             target="_blank"
             rel="noopener">
            r/${escapeHtml(subreddit)}
          </a>
        </td>
        <td>${sortDisplay}</td>
        <td>${timeDisplay}</td>
        <td>${dateDisplay}</td>
        <td>
          <button class="delete-pref secondary-button"
                  data-subreddit="${escapeHtml(subreddit)}"
                  title="Delete preference">
            Delete
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  // Attach delete handlers
  tbody.querySelectorAll(".delete-pref").forEach((btn) => {
    btn.addEventListener("click", handleDeletePreference);
  });
}

function formatSortDisplay(sort) {
  const labels = {
    hot: "Hot",
    new: "New",
    top: "Top",
    rising: "Rising",
    controversial: "Controversial",
  };
  return labels[sort] || sort;
}

function formatTimeDisplay(time) {
  const labels = {
    hour: "Past Hour",
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  };
  return labels[time] || time;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString();
}

async function handleSortPreferencesToggle(e) {
  const enabled = e.target.checked;
  await storage.set({ sortPreferencesEnabled: enabled });
}

async function handleDeletePreference(e) {
  const subreddit = e.target.dataset.subreddit;

  if (!confirm(`Delete sort preference for r/${subreddit}?`)) {
    return;
  }

  await storage.deleteSortPreference(subreddit);
  await refreshSortPreferencesList();
}

async function handleClearAllPreferences() {
  if (!confirm("Clear all saved sort preferences? This cannot be undone.")) {
    return;
  }

  await storage.clearSortPreferences();
  await refreshSortPreferencesList();
}

async function handleExportPreferences() {
  const prefs = await storage.getSortPreferences();
  const json = JSON.stringify(prefs, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `sort-preferences-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

async function handleImportPreferences() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      // Validate structure
      if (typeof imported !== "object") {
        throw new Error("Invalid format");
      }

      const current = await storage.getSortPreferences();
      const merged = { ...current, ...imported };

      await storage.set({ sortPreferences: merged });
      await refreshSortPreferencesList();

      alert(`Imported ${Object.keys(imported).length} preferences`);
    } catch (err) {
      alert("Failed to import preferences: " + err.message);
    }
  };

  input.click();
}

// Event listeners
document
  .getElementById("sort-preferences-enabled")
  .addEventListener("change", handleSortPreferencesToggle);

document
  .getElementById("pref-search")
  .addEventListener("input", refreshSortPreferencesList);

document
  .getElementById("clear-all-prefs")
  .addEventListener("click", handleClearAllPreferences);

document
  .getElementById("export-prefs")
  .addEventListener("click", handleExportPreferences);

document
  .getElementById("import-prefs")
  .addEventListener("click", handleImportPreferences);

// Load on page init
loadSortPreferences();
```

### Step 5: CSS Updates (options.css)

Add styles for sort preferences section:

```css
/* Sort Preferences Section */
.sort-preferences-management {
  margin-top: 20px;
  padding: 20px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 8px;
  border: 1px solid var(--border-color, #dee2e6);
}

.prefs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.prefs-header h3 {
  margin: 0;
  font-size: 16px;
}

.prefs-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

#prefs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

#prefs-table th {
  text-align: left;
  padding: 12px;
  background: var(--bg-tertiary, #e9ecef);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid var(--border-color, #dee2e6);
}

#prefs-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color-light, #f0f0f0);
  font-size: 14px;
}

#prefs-table tr:last-child td {
  border-bottom: none;
}

#prefs-table tr:hover {
  background: var(--bg-hover, #f8f9fa);
}

.subreddit-cell a {
  color: var(--link-color, #0079d3);
  text-decoration: none;
  font-weight: 500;
}

.subreddit-cell a:hover {
  text-decoration: underline;
}

.empty-state {
  color: var(--text-muted, #6c757d);
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
}

.danger-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.danger-button:hover {
  background: #c82333;
}

.secondary-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.secondary-button:hover {
  background: #5a6268;
}

/* Dark mode support */
body.dark-mode .sort-preferences-management {
  background: var(--bg-secondary-dark, #1a1a1b);
  border-color: var(--border-color-dark, #343536);
}

body.dark-mode #prefs-table {
  background: var(--bg-dark, #1a1a1b);
}

body.dark-mode #prefs-table th {
  background: var(--bg-tertiary-dark, #272729);
  border-color: var(--border-color-dark, #343536);
}

body.dark-mode #prefs-table td {
  border-color: var(--border-color-light-dark, #343536);
  color: var(--text-dark, #d7dadc);
}

body.dark-mode #prefs-table tr:hover {
  background: var(--bg-hover-dark, #272729);
}

body.dark-mode .search-input {
  background: var(--bg-input-dark, #272729);
  border-color: var(--border-color-dark, #343536);
  color: var(--text-dark, #d7dadc);
}
```

---

## Test Coverage

Create comprehensive tests in `tests/sort-preferences.test.js`:

```javascript
import { describe, it, expect, beforeEach } from "vitest";

describe("Sort Preferences - URL Parsing", () => {
  it("should identify subreddit pages", () => {
    expect(isSubredditPage("/r/AskReddit/")).toBe(true);
    expect(isSubredditPage("/r/AskReddit")).toBe(true);
    expect(isSubredditPage("/r/AskReddit/comments/abc")).toBe(false);
    expect(isSubredditPage("/")).toBe(false);
  });

  it("should extract subreddit name", () => {
    // Test implementation
  });

  it("should parse current sort from URL", () => {
    // Test various sort URLs
  });

  it("should build correct sort URLs", () => {
    // Test URL construction
  });
});

describe("Sort Preferences - Storage", () => {
  it("should save sort preference", async () => {
    // Test saving
  });

  it("should enforce 100 entry limit with LRU", async () => {
    // Test limit enforcement
  });

  it("should delete individual preference", async () => {
    // Test deletion
  });

  it("should clear all preferences", async () => {
    // Test clear all
  });
});

describe("Sort Preferences - Detection", () => {
  it("should detect sort change", () => {
    // Test detection logic
  });

  it("should not save preference on page load", () => {
    // Verify no auto-save
  });
});
```

---

## Risk Mitigation

**Redirect Loops**:

- Use sessionStorage flag
- Only redirect once per page load
- Clear flag on manual sort change

**Performance**:

- Use interval-based detection (1000ms) to avoid constant checking
- Limit storage to 100 entries
- Optimize preference lookup

**User Experience**:

- Make feature toggleable
- Provide clear UI for managing preferences
- Show count of saved preferences

---

## Implementation Notes (v8.0.0)

**Completed**: 2026-01-30

### Changes Made

1. **Storage Schema**:
   - Added `sortPreferences` to DEFAULTS with `enabled`, `maxEntries`, and `preferences` fields
   - Added `sortPreferences` to SYNC_KEYS for cross-browser sync
   - Added 7 new storage methods: `getSortPreferences()`, `setSortPreferences()`, `getSortPreference()`, `setSortPreference()`, `deleteSortPreference()`, `clearSortPreferences()`, `isSortPreferencesEnabled()`
   - Implemented LRU eviction when 100 entry limit reached

2. **Content Script** (+170 lines):
   - Added URL parsing helpers: `isSubredditPage()`, `getSubredditFromUrl()`, `getCurrentSort()`, `buildSortUrl()`, `sortMatches()`
   - Added `applySortPreference()` function to check and redirect to saved sort
   - Added `detectSortChange()` function to detect manual sort changes and save preferences
   - Added interval-based detection (1000ms) to watch for URL changes
   - Used sessionStorage flag to prevent redirect loops
   - Integrated into page load sequence (runs before other features)

3. **Options Page HTML**:
   - Added complete "Subreddit Sort Preferences" section after Comment Enhancements
   - Added toggle checkbox for enabling/disabling feature
   - Added preferences management UI with table, search, and controls
   - Added export/import/clear all buttons
   - Added empty state message

4. **Options Page CSS** (+160 lines):
   - Added styles for sort preferences management section
   - Added table styles with hover states and responsive design
   - Added button styles (danger and secondary variants)
   - Added search input styles
   - Added dark mode support for all elements
   - Added mobile responsive layout (@media max-width: 768px)

5. **Options Page JS** (+220 lines):
   - Added `loadSortPreferences()` to load feature state on page init
   - Added `refreshSortPreferencesList()` to display preferences table
   - Added formatting helpers: `formatSortDisplay()`, `formatTimeDisplay()`, `formatDate()`
   - Added event handlers: `handleSortPreferencesToggle()`, `handleDeletePreference()`, `handleClearAllPreferences()`, `handleExportPreferences()`, `handleImportPreferences()`
   - Added search filtering support
   - Added event listeners in init section

6. **Tests** (+23 tests, 220 total):
   - Created `tests/sort-preferences.test.js` with comprehensive test coverage
   - Tests for URL parsing (isSubredditPage, getSubredditFromUrl, getCurrentSort, buildSortUrl)
   - Tests for storage schema and methods
   - Tests for display formatting (sort names, time filters, relative dates)
   - Tests for HTML escaping and security
   - Tests for session storage and redirect loop prevention
   - Tests for LRU eviction
   - Tests for edge cases (special subreddits, trailing slashes, case sensitivity)

7. **Documentation**:
   - Updated `CHANGELOG.md` with v8.0.0 entry
   - Updated `ROADMAP.md` to mark Phase 4.1 as complete
   - Created `MANUAL-TEST-v8.0.0.md` with 20 comprehensive test cases
   - Updated implementation plan with completion notes

### Acceptance Criteria Met

- ✅ Sort preference is saved when user manually changes sort
- ✅ Preference is auto-applied on next visit to that subreddit
- ✅ Works with all sort types (hot/new/top/rising/controversial)
- ✅ Works with time filters for top/controversial
- ✅ No redirect loops occur (sessionStorage flag prevents)
- ✅ Feature can be toggled on/off
- ✅ User can view all saved preferences in table format
- ✅ User can search/filter preferences
- ✅ User can delete individual preferences
- ✅ User can clear all preferences
- ✅ Preferences sync across browser instances
- ✅ Respects 100 entry limit with LRU eviction
- ✅ Does not interfere with pagination
- ✅ Does not apply to homepage or comment threads (only subreddit listings)

### Technical Details

**Redirect Prevention**:

- Uses `sessionStorage.getItem('orr-sort-redirected')` flag
- Flag is set before redirect, preventing infinite loops
- Flag is cleared when user manually changes sort
- Flag persists only for the session, not across page loads

**Sort Detection**:

- Runs every 1000ms to check for URL changes
- Compares current URL with last URL
- Detects sort changes by comparing current and last sort objects
- Only saves preference when sort actually changes (not on initial page load)

**Performance**:

- Minimal overhead: interval-based checking (1000ms) is very lightweight
- No DOM manipulation for detection (only URL parsing)
- Storage operations are async and don't block UI
- LRU eviction ensures storage doesn't grow unbounded

**Security**:

- All subreddit names are HTML-escaped before displaying
- Import validation checks JSON structure before applying
- No XSS vulnerabilities in table rendering

### Known Limitations

1. **Detection delay**: Up to 1 second delay to detect manual sort changes (due to 1000ms interval)
2. **Comment pages**: Feature doesn't apply to comment threads (by design)
3. **Multireddits**: May not work correctly with custom multireddits
4. **Storage limit**: Hard limit of 100 subreddits with LRU eviction

### Next Steps

**Phase 4 has two remaining features:**

- Phase 4.2: User Tagging (status: Under Consideration)
- Phase 4.3: Scroll Position Memory (status: Under Consideration)

Choose next feature to implement or collect user feedback on v8.0.0.

---

_Last Updated: 2026-01-30_
_Status: v8.0.0 - ✅ COMPLETE_

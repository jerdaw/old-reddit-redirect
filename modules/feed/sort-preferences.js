/**
 * Sort Preferences Module
 * Remembers and applies sort order preferences per subreddit
 */

import {
  getCurrentSubreddit,
  isSubredditPage,
} from "../shared/page-detection.js";
import { debugLog } from "../shared/debug-helpers.js";

// Store references for cleanup
let sortObserver = null;
let popStateHandler = null;
let hashChangeHandler = null;

/**
 * Get current sort order from URL
 * @returns {Object} { sort, time }
 */
function getCurrentSort() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") || "hot";
  const time = params.get("t") || null;
  return { sort, time };
}

/**
 * Build subreddit URL with sort parameters
 * @param {string} subreddit - Subreddit name
 * @param {Object} sortData - { sort, time }
 * @returns {string}
 */
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

/**
 * Check if two sort objects match
 * @param {Object} current - Current sort
 * @param {Object} preference - Preferred sort
 * @returns {boolean}
 */
function sortMatches(current, preference) {
  return current.sort === preference.sort && current.time === preference.time;
}

/**
 * Apply saved sort preference for current subreddit
 * @returns {Promise<void>}
 */
async function applySortPreference() {
  try {
    // Check if storage API is available
    if (!window.Storage || !window.Storage.isSortPreferencesEnabled) {
      return;
    }

    // Check if feature is enabled
    const enabled = await window.Storage.isSortPreferencesEnabled();
    if (!enabled) return;

    // Only run on subreddit pages
    if (!isSubredditPage()) return;

    // Prevent redirect loops
    if (sessionStorage.getItem("orr-sort-redirected")) {
      return;
    }

    const subreddit = getCurrentSubreddit();
    if (!subreddit) return;

    const currentSort = getCurrentSort();
    const preference = await window.Storage.getSortPreference(subreddit);

    if (!preference) return; // No preference saved
    if (sortMatches(currentSort, preference)) return; // Already correct

    // Build new URL with preferred sort
    const newUrl = buildSortUrl(subreddit, preference);

    // Mark redirect to prevent loop
    sessionStorage.setItem("orr-sort-redirected", "true");

    debugLog(
      `[ORE] Applying sort preference for /r/${subreddit}: ${preference.sort}${preference.time ? ` (${preference.time})` : ""}`
    );

    // Redirect
    window.location.href = newUrl;
  } catch (error) {
    console.error("[ORE] Error applying sort preference:", error);
  }
}

// Track URL and sort changes
let lastUrl = window.location.href;
let lastSort = null;

/**
 * Detect when user manually changes sort order and save preference
 * @returns {Promise<void>}
 */
async function detectSortChange() {
  try {
    // Check if storage API is available
    if (!window.Storage || !window.Storage.setSortPreference) {
      return;
    }

    const currentUrl = window.location.href;

    // URL hasn't changed
    if (currentUrl === lastUrl) return;

    // Check if we're on a subreddit page
    if (!isSubredditPage()) {
      lastUrl = currentUrl;
      return;
    }

    const subreddit = getCurrentSubreddit();
    if (!subreddit) return;

    const currentSort = getCurrentSort();

    // If this is first detection or sort changed
    if (lastSort && !sortMatches(currentSort, lastSort)) {
      // User manually changed sort, save preference
      await window.Storage.setSortPreference(subreddit, currentSort);

      // Clear redirect flag (user is manually navigating)
      sessionStorage.removeItem("orr-sort-redirected");

      debugLog(
        `[ORE] Saved sort preference for /r/${subreddit}: ${currentSort.sort}${currentSort.time ? ` (${currentSort.time})` : ""}`
      );
    }

    lastUrl = currentUrl;
    lastSort = currentSort;
  } catch (error) {
    console.error("[ORE] Error detecting sort change:", error);
  }
}

/**
 * Clean up observers and event listeners
 */
function cleanup() {
  if (sortObserver) {
    sortObserver.disconnect();
    sortObserver = null;
  }
  if (popStateHandler) {
    window.removeEventListener("popstate", popStateHandler);
    popStateHandler = null;
  }
  if (hashChangeHandler) {
    window.removeEventListener("hashchange", hashChangeHandler);
    hashChangeHandler = null;
  }
}

/**
 * Initialize sort preferences module
 * @returns {Promise<void>}
 */
export async function initSortPreferences() {
  try {
    // Apply saved preference first
    await applySortPreference();

    // Initialize lastSort after applying preference
    lastSort = getCurrentSort();

    // Watch for URL changes to detect manual sort changes
    // Use MutationObserver to detect history.pushState
    sortObserver = new MutationObserver(detectSortChange);
    sortObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also watch for popstate (back/forward buttons)
    popStateHandler = detectSortChange;
    window.addEventListener("popstate", popStateHandler);

    // Watch for hash changes as lightweight fallback
    hashChangeHandler = detectSortChange;
    window.addEventListener("hashchange", hashChangeHandler);

    // Register cleanup handler
    if (!window.orrCleanup) window.orrCleanup = [];
    window.orrCleanup.push(cleanup);
  } catch (error) {
    console.error("[ORE] Sort preferences initialization failed:", error);
  }
}

/**
 * Export applySortPreference for direct use
 */
export { applySortPreference, getCurrentSort };

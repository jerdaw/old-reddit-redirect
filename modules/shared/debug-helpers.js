/**
 * Debug Helpers
 *
 * Utilities for conditional debug logging based on user settings.
 */

import { getStorage } from "./storage-helpers.js";

let debugEnabled = false;

// Initialize debug state from storage
(async () => {
  try {
    // In non-extension environments (e.g. unit tests), `chrome` may not exist.
    const chromeApi = globalThis.chrome;
    if (
      !chromeApi ||
      !chromeApi.storage ||
      !chromeApi.storage.local ||
      typeof chromeApi.storage.local.get !== "function"
    ) {
      debugEnabled = false;
      return;
    }

    const prefs = await getStorage({ debug: { enabled: false } });
    debugEnabled = prefs.debug?.enabled || false;
  } catch (_error) {
    // If storage fails, default to disabled
    debugEnabled = false;
  }
})();

/**
 * Log a debug message if debug mode is enabled
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
  if (debugEnabled) {
    console.log(...args);
  }
}

/**
 * Update debug enabled state
 * @param {boolean} enabled - Whether debug mode is enabled
 */
export function setDebugEnabled(enabled) {
  debugEnabled = enabled;
}

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled
 */
export function isDebugEnabled() {
  return debugEnabled;
}

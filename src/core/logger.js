"use strict";

/**
 * Centralized logging utility for Old Reddit Redirect
 * Provides context-aware logging with configurable levels
 */

(function () {
  const LOG_PREFIX = "[OldRedditRedirect]";

  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  // Default to WARN in production to reduce noise
  let currentLevel = LOG_LEVELS.WARN;

  const Logger = {
    /**
     * Set logging level
     * @param {string} level - "DEBUG", "INFO", "WARN", or "ERROR"
     */
    setLevel(level) {
      const upperLevel = level.toUpperCase();
      if (upperLevel in LOG_LEVELS) {
        currentLevel = LOG_LEVELS[upperLevel];
      }
    },

    /**
     * Log debug message (development only)
     * @param {...any} args - Arguments to log
     */
    debug(...args) {
      if (currentLevel <= LOG_LEVELS.DEBUG) {
        console.debug(LOG_PREFIX, ...args);
      }
    },

    /**
     * Log info message
     * @param {...any} args - Arguments to log
     */
    info(...args) {
      if (currentLevel <= LOG_LEVELS.INFO) {
        console.info(LOG_PREFIX, ...args);
      }
    },

    /**
     * Log warning message
     * @param {...any} args - Arguments to log
     */
    warn(...args) {
      if (currentLevel <= LOG_LEVELS.WARN) {
        console.warn(LOG_PREFIX, ...args);
      }
    },

    /**
     * Log error message
     * @param {...any} args - Arguments to log
     */
    error(...args) {
      if (currentLevel <= LOG_LEVELS.ERROR) {
        console.error(LOG_PREFIX, ...args);
      }
    },

    /**
     * Handle Chrome API errors
     * Logs warning if chrome.runtime.lastError exists
     * @param {string} context - Context description (e.g., "setBadgeText")
     * @returns {boolean} True if error was present
     */
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

  // Export for different module systems
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Logger;
  } else {
    window.Logger = Logger;
  }
})();

"use strict";

/**
 * Storage abstraction layer for Old Reddit Redirect
 * Provides a centralized API for managing extension settings and data
 */

(function () {
  // Schema version for future migrations
  const SCHEMA_VERSION = 1;

  // Keys that should be synced across browsers (when sync is enabled)
  const SYNC_KEYS = [
    "frontend",
    "subredditOverrides",
    "ui",
    "darkMode",
    "nagBlocking",
    "contentFiltering",
  ];

  // Default configuration
  const DEFAULTS = {
    _schemaVersion: SCHEMA_VERSION,
    enabled: true,
    stats: {
      totalRedirects: 0,
      todayRedirects: 0,
      todayDate: getTodayDate(),
      lastRedirect: null,
      perSubreddit: {},
      weeklyHistory: [],
    },
    temporaryDisable: {
      active: false,
      expiresAt: null,
      duration: null,
    },
    subredditOverrides: {
      whitelist: [],
      mutedSubreddits: [],
    },
    contentFiltering: {
      mutedKeywords: [],
      mutedDomains: [],
      caseSensitive: false,
    },
    frontend: {
      target: "old.reddit.com",
      customDomain: null,
    },
    ui: {
      showNotifications: false,
      showRedirectNotice: false,
      badgeStyle: "text", // "text" | "count" | "color"
      animateToggle: true,
      iconClickBehavior: "popup", // "popup" | "toggle"
    },
    darkMode: {
      enabled: "auto", // "auto" | "light" | "dark" | "oled"
      autoCollapseAutomod: true,
    },
    nagBlocking: {
      enabled: true,
      blockLoginPrompts: true,
      blockEmailVerification: true,
      blockPremiumBanners: true,
      blockAppPrompts: true,
    },
    sync: {
      enabled: false,
      lastSync: null,
    },
  };

  /**
   * Get today's date in YYYY-MM-DD format
   */
  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Handle Chrome runtime errors
   */
  function handleLastError() {
    void chrome.runtime.lastError;
  }

  /**
   * Storage API
   */
  const Storage = {
    /**
     * Internal method to get sync config directly from local storage
     * Prevents infinite recursion when get() tries to check sync status
     * @returns {Promise<Object>}
     */
    async _getSyncConfigDirect() {
      return new Promise((resolve) => {
        chrome.storage.local.get({ sync: { enabled: false } }, (result) => {
          handleLastError();
          resolve(result.sync);
        });
      });
    },

    /**
     * Get a value from storage
     * @param {string} key - The key to retrieve
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {Promise<*>} The stored value or default
     */
    async get(key, defaultValue) {
      // Determine storage area
      let area = "local";

      if (SYNC_KEYS.includes(key)) {
        const syncConfig = await this._getSyncConfigDirect();
        if (syncConfig && syncConfig.enabled) {
          area = "sync";
        }
      }

      return new Promise((resolve) => {
        chrome.storage[area].get({ [key]: defaultValue }, (result) => {
          handleLastError();
          resolve(result[key]);
        });
      });
    },

    /**
     * Set a value in storage
     * @param {string} key - The key to set
     * @param {*} value - The value to store
     * @returns {Promise<void>}
     */
    async set(key, value) {
      // Determine storage area
      let area = "local";

      if (SYNC_KEYS.includes(key)) {
        const syncConfig = await this._getSyncConfigDirect();
        if (syncConfig && syncConfig.enabled) {
          area = "sync";
        }
      }

      return new Promise((resolve) => {
        chrome.storage[area].set({ [key]: value }, () => {
          handleLastError();
          resolve();
        });
      });
    },

    /**
     * Get all data from storage
     * @returns {Promise<Object>} All stored data
     */
    async getAll() {
      return new Promise((resolve) => {
        chrome.storage.local.get(null, (localData) => {
          handleLastError();
          chrome.storage.sync.get(null, (syncData) => {
            handleLastError();
            resolve({ ...localData, ...syncData });
          });
        });
      });
    },

    /**
     * Clear all data from storage
     * @returns {Promise<void>}
     */
    async clear() {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => {
          handleLastError();
          chrome.storage.sync.clear(() => {
            handleLastError();
            resolve();
          });
        });
      });
    },

    /**
     * Initialize storage with defaults
     * @returns {Promise<void>}
     */
    async initialize() {
      const all = await this.getAll();

      // Set defaults for missing keys
      for (const [key, value] of Object.entries(DEFAULTS)) {
        if (!(key in all)) {
          await this.set(key, value);
        }
      }
    },

    // Typed accessors for better code completion

    /**
     * Get enabled state
     * @returns {Promise<boolean>}
     */
    async getEnabled() {
      return this.get("enabled", DEFAULTS.enabled);
    },

    /**
     * Set enabled state
     * @param {boolean} enabled
     * @returns {Promise<void>}
     */
    async setEnabled(enabled) {
      return this.set("enabled", enabled);
    },

    /**
     * Get statistics with defensive checks
     * @returns {Promise<Object>}
     */
    async getStats() {
      const stats = await this.get("stats", DEFAULTS.stats);
      const today = getTodayDate();

      // Defensive: Ensure stats object has all required fields
      const safeStats = {
        totalRedirects:
          typeof stats.totalRedirects === "number" ? stats.totalRedirects : 0,
        todayRedirects:
          typeof stats.todayRedirects === "number" ? stats.todayRedirects : 0,
        todayDate: stats.todayDate || today,
        lastRedirect: stats.lastRedirect || null,
        perSubreddit:
          stats.perSubreddit && typeof stats.perSubreddit === "object"
            ? stats.perSubreddit
            : {},
        weeklyHistory: Array.isArray(stats.weeklyHistory)
          ? stats.weeklyHistory
          : [],
      };

      // Reset daily count if it's a new day
      if (safeStats.todayDate !== today) {
        safeStats.todayRedirects = 0;
        safeStats.todayDate = today;
        await this.set("stats", safeStats);
      }

      return safeStats;
    },

    /**
     * Increment redirect count
     * @param {string|null} subreddit - The subreddit name (without r/ prefix)
     * @returns {Promise<void>}
     */
    async incrementRedirectCount(subreddit) {
      const stats = await this.getStats();

      stats.totalRedirects++;
      stats.todayRedirects++;
      stats.lastRedirect = new Date().toISOString();

      // Track per-subreddit stats
      if (subreddit) {
        stats.perSubreddit[subreddit] =
          (stats.perSubreddit[subreddit] || 0) + 1;

        // Limit to top 50 subreddits
        const entries = Object.entries(stats.perSubreddit);
        if (entries.length > 50) {
          // Sort by count descending and keep top 50
          const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 50);
          stats.perSubreddit = Object.fromEntries(sorted);
        }
      }

      // Update weekly history
      const today = getTodayDate();
      const todayEntry = stats.weeklyHistory.find((e) => e.date === today);
      if (todayEntry) {
        todayEntry.count++;
      } else {
        stats.weeklyHistory.push({ date: today, count: 1 });
      }

      // Keep only last 7 days
      if (stats.weeklyHistory.length > 7) {
        stats.weeklyHistory = stats.weeklyHistory.slice(-7);
      }

      await this.set("stats", stats);
    },

    /**
     * Clear statistics
     * @returns {Promise<void>}
     */
    async clearStats() {
      return this.set("stats", DEFAULTS.stats);
    },

    /**
     * Get temporary disable configuration
     * @returns {Promise<Object>}
     */
    async getTemporaryDisable() {
      return this.get("temporaryDisable", DEFAULTS.temporaryDisable);
    },

    /**
     * Set temporary disable configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setTemporaryDisable(config) {
      return this.set("temporaryDisable", config);
    },

    /**
     * Get subreddit overrides
     * @returns {Promise<Object>}
     */
    async getSubredditOverrides() {
      return this.get("subredditOverrides", DEFAULTS.subredditOverrides);
    },

    /**
     * Set subreddit overrides
     * @param {Object} overrides
     * @returns {Promise<void>}
     */
    async setSubredditOverrides(overrides) {
      return this.set("subredditOverrides", overrides);
    },

    /**
     * Add subreddit to mute list
     * @param {string} subreddit - Subreddit name without r/ prefix
     * @returns {Promise<void>}
     */
    async addMutedSubreddit(subreddit) {
      const overrides = await this.getSubredditOverrides();
      const normalized = subreddit.toLowerCase().replace(/^r\//, "");

      if (!overrides.mutedSubreddits.includes(normalized)) {
        overrides.mutedSubreddits.push(normalized);
        overrides.mutedSubreddits.sort();
        await this.setSubredditOverrides(overrides);
      }
    },

    /**
     * Remove subreddit from mute list
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<void>}
     */
    async removeMutedSubreddit(subreddit) {
      const overrides = await this.getSubredditOverrides();
      const normalized = subreddit.toLowerCase().replace(/^r\//, "");

      overrides.mutedSubreddits = overrides.mutedSubreddits.filter(
        (s) => s !== normalized
      );
      await this.setSubredditOverrides(overrides);
    },

    /**
     * Get content filtering preferences
     * @returns {Promise<Object>}
     */
    async getContentFiltering() {
      return this.get("contentFiltering", DEFAULTS.contentFiltering);
    },

    /**
     * Set content filtering preferences
     * @param {Object} filtering
     * @returns {Promise<void>}
     */
    async setContentFiltering(filtering) {
      return this.set("contentFiltering", filtering);
    },

    /**
     * Add keyword to mute list
     * @param {string} keyword - Keyword or phrase to mute
     * @returns {Promise<void>}
     */
    async addMutedKeyword(keyword) {
      const filtering = await this.getContentFiltering();
      const normalized = keyword.trim();

      if (normalized && !filtering.mutedKeywords.includes(normalized)) {
        filtering.mutedKeywords.push(normalized);
        filtering.mutedKeywords.sort();
        await this.setContentFiltering(filtering);
      }
    },

    /**
     * Remove keyword from mute list
     * @param {string} keyword - Keyword to remove
     * @returns {Promise<void>}
     */
    async removeMutedKeyword(keyword) {
      const filtering = await this.getContentFiltering();
      filtering.mutedKeywords = filtering.mutedKeywords.filter(
        (k) => k !== keyword
      );
      await this.setContentFiltering(filtering);
    },

    /**
     * Add domain to mute list
     * @param {string} domain - Domain to mute (e.g., "example.com")
     * @returns {Promise<void>}
     */
    async addMutedDomain(domain) {
      const filtering = await this.getContentFiltering();
      const normalized = domain
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, "");

      if (normalized && !filtering.mutedDomains.includes(normalized)) {
        filtering.mutedDomains.push(normalized);
        filtering.mutedDomains.sort();
        await this.setContentFiltering(filtering);
      }
    },

    /**
     * Remove domain from mute list
     * @param {string} domain - Domain to remove
     * @returns {Promise<void>}
     */
    async removeMutedDomain(domain) {
      const filtering = await this.getContentFiltering();
      filtering.mutedDomains = filtering.mutedDomains.filter(
        (d) => d !== domain
      );
      await this.setContentFiltering(filtering);
    },

    /**
     * Get frontend configuration
     * @returns {Promise<Object>}
     */
    async getFrontend() {
      return this.get("frontend", DEFAULTS.frontend);
    },

    /**
     * Set frontend configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setFrontend(config) {
      return this.set("frontend", config);
    },

    /**
     * Get UI preferences
     * @returns {Promise<Object>}
     */
    async getUIPreferences() {
      return this.get("ui", DEFAULTS.ui);
    },

    /**
     * Set UI preferences
     * @param {Object} prefs
     * @returns {Promise<void>}
     */
    async setUIPreferences(prefs) {
      return this.set("ui", prefs);
    },

    /**
     * Get sync configuration
     * @returns {Promise<Object>}
     */
    async getSyncConfig() {
      return this.get("sync", DEFAULTS.sync);
    },

    /**
     * Set sync configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setSyncConfig(config) {
      return this.set("sync", config);
    },

    /**
     * Migrate from legacy storage (v3.0.0)
     * @returns {Promise<void>}
     */
    async migrateFromLegacy() {
      const all = await this.getAll();

      // If schema version exists, no migration needed
      if (all._schemaVersion) {
        return;
      }

      // Legacy version used DNR API for state, no storage
      // Get current DNR state
      const rulesets = await new Promise((resolve) => {
        chrome.declarativeNetRequest.getEnabledRulesets((rs) => {
          handleLastError();
          resolve(rs || []);
        });
      });

      const enabled = rulesets.includes("ruleset_1");

      // Initialize with defaults and current enabled state
      await this.set("_schemaVersion", SCHEMA_VERSION);
      await this.set("enabled", enabled);
      await this.initialize();
    },

    /**
     * Export settings to JSON
     * @returns {Promise<Object>}
     */
    async exportSettings() {
      const all = await this.getAll();

      // Exclude stats (personal data) and temporary state
      const exportData = {
        _exportVersion: 1,
        _exportDate: new Date().toISOString(),
        _extensionVersion: chrome.runtime.getManifest().version,
        frontend: all.frontend || DEFAULTS.frontend,
        subredditOverrides:
          all.subredditOverrides || DEFAULTS.subredditOverrides,
        ui: all.ui || DEFAULTS.ui,
      };

      return exportData;
    },

    /**
     * Import settings from JSON
     * @param {Object} data - Exported settings
     * @returns {Promise<void>}
     */
    async importSettings(data) {
      const validation = this.validateImport(data);
      if (!validation.valid) {
        throw new Error(`Invalid import: ${validation.errors.join(", ")}`);
      }

      // Import each section
      if (data.frontend) {
        await this.setFrontend(data.frontend);
      }
      if (data.subredditOverrides) {
        await this.setSubredditOverrides(data.subredditOverrides);
      }
      if (data.ui) {
        await this.setUIPreferences(data.ui);
      }
    },

    /**
     * Validate import data
     * @param {Object} data - Data to validate
     * @returns {Object} Validation result with valid flag and errors array
     */
    validateImport(data) {
      const errors = [];

      if (!data || typeof data !== "object") {
        errors.push("Data must be an object");
        return { valid: false, errors };
      }

      // Check export version
      if (!data._exportVersion || data._exportVersion > 1) {
        errors.push("Unsupported export version");
      }

      // Validate frontend
      if (data.frontend) {
        if (typeof data.frontend !== "object") {
          errors.push("Invalid frontend config");
        } else {
          if (
            data.frontend.target &&
            typeof data.frontend.target !== "string"
          ) {
            errors.push("Invalid frontend target");
          }
        }
      }

      // Validate subreddit overrides
      if (data.subredditOverrides) {
        if (typeof data.subredditOverrides !== "object") {
          errors.push("Invalid subreddit overrides");
        } else if (data.subredditOverrides.whitelist) {
          if (!Array.isArray(data.subredditOverrides.whitelist)) {
            errors.push("Whitelist must be an array");
          } else {
            const invalid = data.subredditOverrides.whitelist.filter(
              (s) => typeof s !== "string" || !/^[a-z0-9_]+$/i.test(s)
            );
            if (invalid.length > 0) {
              errors.push(`Invalid subreddit names: ${invalid.join(", ")}`);
            }
          }
        }
      }

      // Validate UI preferences
      if (data.ui) {
        if (typeof data.ui !== "object") {
          errors.push("Invalid UI config");
        } else {
          if (
            data.ui.badgeStyle &&
            !["text", "count", "color"].includes(data.ui.badgeStyle)
          ) {
            errors.push("Invalid badge style");
          }
        }
      }

      return { valid: errors.length === 0, errors };
    },

    /**
     * Get dark mode preferences
     * @returns {Promise<Object>}
     */
    async getDarkMode() {
      return this.get("darkMode", DEFAULTS.darkMode);
    },

    /**
     * Set dark mode preferences
     * @param {Object} prefs
     * @returns {Promise<void>}
     */
    async setDarkMode(prefs) {
      return this.set("darkMode", prefs);
    },

    /**
     * Get nag blocking preferences
     * @returns {Promise<Object>}
     */
    async getNagBlocking() {
      return this.get("nagBlocking", DEFAULTS.nagBlocking);
    },

    /**
     * Set nag blocking preferences
     * @param {Object} prefs
     * @returns {Promise<void>}
     */
    async setNagBlocking(prefs) {
      return this.set("nagBlocking", prefs);
    },

    /**
     * Enable sync
     * @returns {Promise<void>}
     */
    async enableSync() {
      // Copy current local settings to sync
      const localData = {};
      for (const key of SYNC_KEYS) {
        localData[key] = await this.get(key);
      }

      await new Promise((resolve) => {
        chrome.storage.sync.set(localData, () => {
          handleLastError();
          resolve();
        });
      });

      await this.setSyncConfig({
        enabled: true,
        lastSync: new Date().toISOString(),
      });
    },

    /**
     * Disable sync
     * @returns {Promise<void>}
     */
    async disableSync() {
      // Copy sync settings to local (preserve them)
      const syncData = await new Promise((resolve) => {
        chrome.storage.sync.get(SYNC_KEYS, (data) => {
          handleLastError();
          resolve(data);
        });
      });

      await new Promise((resolve) => {
        chrome.storage.local.set(syncData, () => {
          handleLastError();
          resolve();
        });
      });

      // Clear sync storage
      await new Promise((resolve) => {
        chrome.storage.sync.clear(() => {
          handleLastError();
          resolve();
        });
      });

      await this.setSyncConfig({ enabled: false, lastSync: null });
    },
  };

  // Export for use in other scripts
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Storage;
  } else {
    window.Storage = Storage;
  }
})();

"use strict";

/**
 * Storage abstraction layer for Old Reddit Redirect
 * Provides a centralized API for managing extension settings and data
 */

(function () {
  // Schema version for future migrations
  const SCHEMA_VERSION = 3;

  // Keys that should be synced across browsers (when sync is enabled)
  const SYNC_KEYS = [
    "frontend",
    "subredditOverrides",
    "ui",
    "darkMode",
    "nagBlocking",
    "contentFiltering",
    "commentEnhancements",
    "sortPreferences",
    "userTags",
    "feedEnhancements",
    "privacy",
    "layoutPresets",
    "accessibility",
    "readingHistory",
    "nsfwControls",
    "commentMinimap",
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
      // v12.1.0: Advanced keyword filtering
      useRegex: false,
      filterContent: false, // Filter post body, not just title
      filterByFlair: false,
      mutedFlairs: [], // Array of flair text strings
      filterByScore: false,
      minScore: 0, // Hide posts below this score
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
      enabled: "auto", // "auto" | "light" | "dark" | "oled" | "high-contrast"
      autoCollapseAutomod: true,
    },
    accessibility: {
      fontSize: "medium", // "small" | "medium" | "large" | "x-large"
      reduceMotion: "auto", // "auto" | "always" | "never"
      highContrast: false, // Separate toggle for high contrast elements
    },
    nagBlocking: {
      enabled: true,
      blockLoginPrompts: true,
      blockEmailVerification: true,
      blockPremiumBanners: true,
      blockAppPrompts: true,
      // v11.2.0: Advanced content blocking
      blockAIContent: true,
      blockTrending: true,
      blockRecommended: true,
      blockCommunityHighlights: true,
      blockMorePosts: true,
    },
    commentEnhancements: {
      colorCodedComments: true,
      colorPalette: "standard", // "standard" | "colorblind"
      stripeWidth: 3,
      navigationButtons: true,
      navButtonPosition: "bottom-right", // "bottom-right" | "bottom-left"
      inlineImages: true,
      maxImageWidth: 600, // pixels, 0 = full width
      // v11.2.0: Jump to top keyboard shortcut
      jumpToTopShortcut: true,
    },
    sortPreferences: {
      enabled: true,
      maxEntries: 100,
      preferences: {}, // { subreddit: { sort, time, timestamp } }
    },
    userTags: {
      enabled: true,
      maxTags: 500,
      tags: {}, // { username: { text, color, timestamp } }
    },
    mutedUsers: {
      enabled: true,
      maxUsers: 500,
      users: {}, // { username: { reason, timestamp } }
    },
    scrollPositions: {
      enabled: true,
      maxEntries: 100,
      retentionHours: 24,
      positions: {}, // { url: { scrollY, timestamp } }
    },
    keyboardShortcuts: {
      enabled: true,
      chordTimeout: 1000, // Milliseconds to wait for chord sequence
      shortcuts: {
        // Existing shortcuts
        "toggle-redirect": {
          keys: "Alt+Shift+R",
          description: "Toggle redirect on/off",
          type: "command",
          context: "any",
          enabled: true,
        },
        "nav-next-comment": {
          keys: "Shift+J",
          description: "Next parent comment",
          type: "content",
          context: "comments",
          enabled: true,
        },
        "nav-prev-comment": {
          keys: "Shift+K",
          description: "Previous parent comment",
          type: "content",
          context: "comments",
          enabled: true,
        },
        "jump-to-top": {
          keys: "Shift+Home",
          description: "Jump to top of page",
          type: "content",
          context: "any",
          enabled: true,
        },
        // New shortcuts (v12.2.0)
        "toggle-dark-mode": {
          keys: "d",
          description: "Toggle dark mode",
          type: "content",
          context: "any",
          enabled: true,
        },
        "toggle-compact-mode": {
          keys: "c",
          description: "Toggle compact feed mode",
          type: "content",
          context: "feed",
          enabled: true,
        },
        "toggle-text-only": {
          keys: "t",
          description: "Toggle text-only mode",
          type: "content",
          context: "feed",
          enabled: true,
        },
        "cycle-color-palette": {
          keys: "p",
          description: "Cycle comment color palette",
          type: "content",
          context: "comments",
          enabled: true,
        },
        "toggle-inline-images": {
          keys: "i",
          description: "Toggle inline image expansion",
          type: "content",
          context: "comments",
          enabled: true,
        },
        "show-help-overlay": {
          keys: "Shift+/",
          description: "Show keyboard shortcuts help",
          type: "content",
          context: "any",
          enabled: true,
        },
        "go-top-vim": {
          keys: "g g",
          description: "Jump to top (Vim-style)",
          type: "content",
          context: "any",
          enabled: false, // Disabled by default, opt-in for Vim users
        },
        "cycle-layout-preset": {
          keys: "l",
          description: "Cycle through layout presets",
          type: "content",
          context: "any",
          enabled: true,
        },
      },
      conflicts: [], // Array of { shortcut1, shortcut2, keys, severity }
    },
    feedEnhancements: {
      compactMode: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      uncropImages: false,
      textOnlyMode: false,
      customCSS: "",
      customCSSEnabled: false,
    },
    layoutPresets: {
      enabled: true,
      maxPresets: 20,
      activePreset: null, // Name of currently active global preset
      presets: {}, // { presetName: { darkMode, compactMode, textOnlyMode, uncropImages, hideJoinButtons, hideActionLinks, colorCodedComments, colorPalette, customCSS, timestamp } }
      subredditLayouts: {}, // { subredditName: presetName }
      maxSubredditMappings: 100,
    },
    privacy: {
      removeTracking: true,
      trackingParams: [
        // UTM parameters (7)
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "utm_name",
        "utm_cid",
        // Social media trackers (12)
        "fbclid", // Facebook
        "igshid", // Instagram
        "twclid", // Twitter/X
        "ttclid", // TikTok
        "li_fat_id", // LinkedIn
        "li_sharer", // LinkedIn
        "pin_share", // Pinterest
        "epik", // Pinterest
        "scid", // Snapchat
        "sclid", // Snapchat
        "vero_id", // Vero
        "wbraid", // Google/YouTube
        // Analytics trackers (10)
        "gclid", // Google Ads
        "gclsrc", // Google Ads
        "dclid", // DoubleClick
        "_ga", // Google Analytics
        "_gl", // Google Linker
        "msclkid", // Microsoft/Bing
        "yclid", // Yandex
        "_ym_uid", // Yandex Metrica
        "_ym_visorc", // Yandex Metrica
        "zanpid", // Zanox/Awin
        // Affiliate/referral trackers (10)
        "ref",
        "ref_source",
        "ref_url",
        "referrer",
        "aff_id",
        "affiliate_id",
        "partner_id",
        "click_id",
        "clickid",
        "rb_clickid",
        // Reddit-specific trackers (6)
        "rdt_cid",
        "share_id",
        "shared",
        "correlation_id",
        "ref_campaign",
        "ref_source",
        // Deep linking/attribution (6)
        "$deep_link",
        "$3p",
        "_branch_match_id",
        "_branch_referrer",
        "adjust_tracker",
        "adjust_campaign",
        // Email marketing (4)
        "mc_cid", // Mailchimp
        "mc_eid", // Mailchimp
        "oly_anon_id", // Omeda
        "oly_enc_id", // Omeda
        // Miscellaneous (3)
        "mkt_tok", // Marketo
        "trk", // Generic tracker
        "campaignid",
      ],
      showTrackingBadge: true,
      cleanReferrer: false,
      referrerPolicy: "same-origin",
      trackingStats: {
        totalCleaned: 0,
        lastCleaned: null,
        byType: {
          utm: 0,
          social: 0,
          analytics: 0,
          affiliate: 0,
          reddit: 0,
          other: 0,
        },
      },
    },
    readingHistory: {
      enabled: true,
      showVisitedIndicator: true,
      maxEntries: 500,
      retentionDays: 30,
      entries: [], // Array of { id, title, subreddit, url, timestamp, commentCount }
    },
    nsfwControls: {
      enabled: false, // NSFW filtering disabled by default (respects user choice)
      visibility: "show", // "show" | "blur" | "hide"
      blurIntensity: 10, // Blur radius in pixels (5-20)
      revealOnHover: true, // Show content when hovering over blurred area
      showWarning: true, // Show NSFW warning overlay on blurred content
      allowedSubreddits: [], // Subreddits where NSFW is always shown (up to 100)
    },
    commentMinimap: {
      enabled: true, // Show minimap on comment pages
      position: "right", // "left" | "right"
      width: 120, // Width in pixels (80-200)
      opacity: 0.9, // Opacity (0.5-1.0)
      showViewportIndicator: true, // Highlight current viewport position
      useDepthColors: true, // Use color-coded comment depth colors
      collapsedIndicator: true, // Show indicator for collapsed comments
      autoHide: false, // Hide minimap when not hovering
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
     * Get comment enhancements preferences
     * @returns {Promise<Object>}
     */
    async getCommentEnhancements() {
      return this.get("commentEnhancements", DEFAULTS.commentEnhancements);
    },

    /**
     * Set comment enhancements preferences
     * @param {Object} prefs
     * @returns {Promise<void>}
     */
    async setCommentEnhancements(prefs) {
      return this.set("commentEnhancements", prefs);
    },

    /**
     * Get sort preferences configuration
     * @returns {Promise<Object>}
     */
    async getSortPreferences() {
      return this.get("sortPreferences", DEFAULTS.sortPreferences);
    },

    /**
     * Set sort preferences configuration
     * @param {Object} prefs
     * @returns {Promise<void>}
     */
    async setSortPreferences(prefs) {
      return this.set("sortPreferences", prefs);
    },

    /**
     * Get sort preference for a specific subreddit
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<Object|null>}
     */
    async getSortPreference(subreddit) {
      const config = await this.getSortPreferences();
      const key = subreddit.toLowerCase();
      return config.preferences[key] || null;
    },

    /**
     * Set sort preference for a specific subreddit
     * @param {string} subreddit - Subreddit name
     * @param {Object} sortData - { sort, time }
     * @returns {Promise<void>}
     */
    async setSortPreference(subreddit, sortData) {
      const config = await this.getSortPreferences();
      const key = subreddit.toLowerCase();

      // Add timestamp
      config.preferences[key] = {
        ...sortData,
        timestamp: Date.now(),
      };

      // Enforce limit with LRU eviction
      const entries = Object.entries(config.preferences);
      if (entries.length > config.maxEntries) {
        // Find oldest entry
        let oldest = null;
        let oldestTime = Infinity;
        for (const [sub, data] of entries) {
          if (data.timestamp < oldestTime) {
            oldest = sub;
            oldestTime = data.timestamp;
          }
        }
        if (oldest) {
          delete config.preferences[oldest];
        }
      }

      await this.setSortPreferences(config);
    },

    /**
     * Delete sort preference for a specific subreddit
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<void>}
     */
    async deleteSortPreference(subreddit) {
      const config = await this.getSortPreferences();
      const key = subreddit.toLowerCase();
      delete config.preferences[key];
      await this.setSortPreferences(config);
    },

    /**
     * Clear all sort preferences
     * @returns {Promise<void>}
     */
    async clearSortPreferences() {
      const config = await this.getSortPreferences();
      config.preferences = {};
      await this.setSortPreferences(config);
    },

    /**
     * Check if sort preferences feature is enabled
     * @returns {Promise<boolean>}
     */
    async isSortPreferencesEnabled() {
      const config = await this.getSortPreferences();
      return config.enabled !== false;
    },

    /**
     * Get user tags configuration
     * @returns {Promise<Object>}
     */
    async getUserTags() {
      return this.get("userTags", DEFAULTS.userTags);
    },

    /**
     * Set user tags configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setUserTags(config) {
      return this.set("userTags", config);
    },

    /**
     * Get tag for a specific user
     * @param {string} username - Username (case-insensitive)
     * @returns {Promise<Object|null>}
     */
    async getUserTag(username) {
      const config = await this.getUserTags();
      const key = username.toLowerCase();
      return config.tags[key] || null;
    },

    /**
     * Set tag for a specific user
     * @param {string} username - Username
     * @param {Object} tagData - { text, color }
     * @returns {Promise<void>}
     */
    async setUserTag(username, tagData) {
      const config = await this.getUserTags();
      const key = username.toLowerCase();

      // Validate tag text length
      if (tagData.text && tagData.text.length > 50) {
        tagData.text = tagData.text.substring(0, 50);
      }

      // Add timestamp
      config.tags[key] = {
        text: tagData.text,
        color: tagData.color,
        timestamp: Date.now(),
      };

      // Enforce limit with LRU eviction
      const entries = Object.entries(config.tags);
      if (entries.length > config.maxTags) {
        // Find oldest entry
        let oldest = null;
        let oldestTime = Infinity;
        for (const [user, data] of entries) {
          if (data.timestamp < oldestTime) {
            oldest = user;
            oldestTime = data.timestamp;
          }
        }
        if (oldest) {
          delete config.tags[oldest];
        }
      }

      await this.setUserTags(config);
    },

    /**
     * Delete tag for a specific user
     * @param {string} username - Username
     * @returns {Promise<void>}
     */
    async deleteUserTag(username) {
      const config = await this.getUserTags();
      const key = username.toLowerCase();
      delete config.tags[key];
      await this.setUserTags(config);
    },

    /**
     * Clear all user tags
     * @returns {Promise<void>}
     */
    async clearUserTags() {
      const config = await this.getUserTags();
      config.tags = {};
      await this.setUserTags(config);
    },

    /**
     * Check if user tagging feature is enabled
     * @returns {Promise<boolean>}
     */
    async isUserTagsEnabled() {
      const config = await this.getUserTags();
      return config.enabled !== false;
    },

    /**
     * Get muted users configuration
     * @returns {Promise<Object>}
     */
    async getMutedUsers() {
      return this.get("mutedUsers", DEFAULTS.mutedUsers);
    },

    /**
     * Set muted users configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setMutedUsers(config) {
      return this.set("mutedUsers", config);
    },

    /**
     * Get mute data for a specific user
     * @param {string} username - Username (case-insensitive)
     * @returns {Promise<Object|null>}
     */
    async getMutedUser(username) {
      const config = await this.getMutedUsers();
      const key = username.toLowerCase();
      return config.users[key] || null;
    },

    /**
     * Set mute for a specific user
     * @param {string} username - Username
     * @param {Object} muteData - { reason }
     * @returns {Promise<void>}
     */
    async setMutedUser(username, muteData) {
      const config = await this.getMutedUsers();
      const key = username.toLowerCase();

      // Validate reason length
      if (muteData.reason && muteData.reason.length > 100) {
        muteData.reason = muteData.reason.substring(0, 100);
      }

      // Add timestamp
      config.users[key] = {
        reason: muteData.reason || "No reason",
        timestamp: Date.now(),
      };

      // Enforce limit with LRU eviction
      const entries = Object.entries(config.users);
      if (entries.length > config.maxUsers) {
        // Find oldest entry
        let oldest = null;
        let oldestTime = Infinity;
        for (const [user, data] of entries) {
          if (data.timestamp < oldestTime) {
            oldest = user;
            oldestTime = data.timestamp;
          }
        }
        if (oldest) {
          delete config.users[oldest];
        }
      }

      await this.setMutedUsers(config);
    },

    /**
     * Delete mute for a specific user
     * @param {string} username - Username
     * @returns {Promise<void>}
     */
    async deleteMutedUser(username) {
      const config = await this.getMutedUsers();
      const key = username.toLowerCase();
      delete config.users[key];
      await this.setMutedUsers(config);
    },

    /**
     * Clear all muted users
     * @returns {Promise<void>}
     */
    async clearMutedUsers() {
      const config = await this.getMutedUsers();
      config.users = {};
      await this.setMutedUsers(config);
    },

    /**
     * Check if user muting feature is enabled
     * @returns {Promise<boolean>}
     */
    async isMutedUsersEnabled() {
      const config = await this.getMutedUsers();
      return config.enabled !== false;
    },

    /**
     * Get scroll positions configuration
     * @returns {Promise<Object>}
     */
    async getScrollPositions() {
      return this.get("scrollPositions", DEFAULTS.scrollPositions);
    },

    /**
     * Set scroll positions configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setScrollPositions(config) {
      return this.set("scrollPositions", config);
    },

    /**
     * Get scroll position for a specific URL
     * @param {string} url - Normalized URL
     * @returns {Promise<Object|null>}
     */
    async getScrollPosition(url) {
      const config = await this.getScrollPositions();
      return config.positions[url] || null;
    },

    /**
     * Set scroll position for a specific URL
     * @param {string} url - Normalized URL
     * @param {Object} data - { scrollY, timestamp }
     * @returns {Promise<void>}
     */
    async setScrollPosition(url, data) {
      const config = await this.getScrollPositions();

      config.positions[url] = {
        scrollY: data.scrollY,
        timestamp: Date.now(),
      };

      // Enforce limit with LRU eviction
      const entries = Object.entries(config.positions);
      if (entries.length > config.maxEntries) {
        let oldest = null;
        let oldestTime = Infinity;
        for (const [urlKey, posData] of entries) {
          if (posData.timestamp < oldestTime) {
            oldest = urlKey;
            oldestTime = posData.timestamp;
          }
        }
        if (oldest) {
          delete config.positions[oldest];
        }
      }

      await this.setScrollPositions(config);
    },

    /**
     * Delete scroll position for a specific URL
     * @param {string} url - Normalized URL
     * @returns {Promise<void>}
     */
    async deleteScrollPosition(url) {
      const config = await this.getScrollPositions();
      delete config.positions[url];
      await this.setScrollPositions(config);
    },

    /**
     * Clear all scroll positions
     * @returns {Promise<void>}
     */
    async clearScrollPositions() {
      const config = await this.getScrollPositions();
      config.positions = {};
      await this.setScrollPositions(config);
    },

    /**
     * Cleanup old scroll positions (older than retention period)
     * @returns {Promise<void>}
     */
    async cleanupOldScrollPositions() {
      const config = await this.getScrollPositions();
      const now = Date.now();
      const maxAge = config.retentionHours * 60 * 60 * 1000; // Convert to ms

      let cleaned = 0;
      for (const [url, data] of Object.entries(config.positions)) {
        if (now - data.timestamp > maxAge) {
          delete config.positions[url];
          cleaned++;
        }
      }

      if (cleaned > 0) {
        await this.setScrollPositions(config);
      }

      return cleaned;
    },

    /**
     * Check if scroll positions feature is enabled
     * @returns {Promise<boolean>}
     */
    async isScrollPositionsEnabled() {
      const config = await this.getScrollPositions();
      return config.enabled !== false;
    },

    /**
     * Get keyboard shortcuts configuration
     * @returns {Promise<Object>}
     */
    async getKeyboardShortcuts() {
      return this.get("keyboardShortcuts", DEFAULTS.keyboardShortcuts);
    },

    /**
     * Set keyboard shortcuts configuration
     * @param {Object} config
     * @returns {Promise<void>}
     */
    async setKeyboardShortcuts(config) {
      return this.set("keyboardShortcuts", config);
    },

    /**
     * Get a specific keyboard shortcut
     * @param {string} id - Shortcut ID
     * @returns {Promise<Object|null>}
     */
    async getKeyboardShortcut(id) {
      const config = await this.getKeyboardShortcuts();
      return config.shortcuts[id] || null;
    },

    /**
     * Set a specific keyboard shortcut
     * @param {string} id - Shortcut ID
     * @param {Object} shortcut - Shortcut configuration
     * @returns {Promise<void>}
     */
    async setKeyboardShortcut(id, shortcut) {
      const config = await this.getKeyboardShortcuts();
      config.shortcuts[id] = {
        ...shortcut,
        // Ensure required fields
        enabled: shortcut.enabled !== false,
        type: shortcut.type || "content",
        context: shortcut.context || "any",
      };
      await this.setKeyboardShortcuts(config);
    },

    /**
     * Reset a keyboard shortcut to default
     * @param {string} id - Shortcut ID
     * @returns {Promise<void>}
     */
    async resetKeyboardShortcut(id) {
      const defaultShortcut = DEFAULTS.keyboardShortcuts.shortcuts[id];
      if (!defaultShortcut) {
        throw new Error(`Unknown shortcut ID: ${id}`);
      }
      await this.setKeyboardShortcut(id, defaultShortcut);
    },

    /**
     * Reset all keyboard shortcuts to defaults
     * @returns {Promise<void>}
     */
    async resetAllKeyboardShortcuts() {
      const config = await this.getKeyboardShortcuts();
      config.shortcuts = { ...DEFAULTS.keyboardShortcuts.shortcuts };
      config.conflicts = [];
      await this.setKeyboardShortcuts(config);
    },

    /**
     * Detect conflicts in keyboard shortcuts
     * @returns {Promise<Array>} Array of conflicts
     */
    async detectKeyboardShortcutConflicts() {
      const config = await this.getKeyboardShortcuts();
      const shortcuts = config.shortcuts;
      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [id1, shortcut1] = entries[i];
          const [id2, shortcut2] = entries[j];

          // Only check enabled shortcuts
          if (!shortcut1.enabled || !shortcut2.enabled) continue;

          // Compare keys (case-insensitive)
          const keys1 = shortcut1.keys.toLowerCase();
          const keys2 = shortcut2.keys.toLowerCase();

          if (keys1 === keys2) {
            // Check if contexts overlap
            const contextsOverlap =
              shortcut1.context === "any" ||
              shortcut2.context === "any" ||
              shortcut1.context === shortcut2.context;

            if (contextsOverlap) {
              conflicts.push({
                shortcut1: id1,
                shortcut2: id2,
                keys: shortcut1.keys,
                severity: "error",
              });
            } else {
              conflicts.push({
                shortcut1: id1,
                shortcut2: id2,
                keys: shortcut1.keys,
                severity: "warning",
              });
            }
          }
        }
      }

      // Update conflicts in storage
      config.conflicts = conflicts;
      await this.setKeyboardShortcuts(config);

      return conflicts;
    },

    /**
     * Check if keyboard shortcuts feature is enabled
     * @returns {Promise<boolean>}
     */
    async isKeyboardShortcutsEnabled() {
      const config = await this.getKeyboardShortcuts();
      return config.enabled !== false;
    },

    /**
     * Get feed enhancements configuration
     * @returns {Promise<Object>} Feed enhancements config
     */
    async getFeedEnhancements() {
      const config = await this.get(
        "feedEnhancements",
        DEFAULTS.feedEnhancements
      );
      return { ...DEFAULTS.feedEnhancements, ...config };
    },

    /**
     * Set feed enhancements configuration
     * @param {Object} config - Feed enhancements config
     * @returns {Promise<void>}
     */
    async setFeedEnhancements(config) {
      await this.set("feedEnhancements", config);
    },

    /**
     * Set custom CSS
     * @param {string} css - Custom CSS string
     * @returns {Promise<void>}
     */
    async setCustomCSS(css) {
      const config = await this.getFeedEnhancements();
      config.customCSS = css;
      await this.setFeedEnhancements(config);
    },

    /**
     * Get custom CSS
     * @returns {Promise<string>} Custom CSS string
     */
    async getCustomCSS() {
      const config = await this.getFeedEnhancements();
      return config.customCSS || "";
    },

    /**
     * Check if feed enhancements feature is enabled
     * @param {string} feature - Feature name (e.g., 'compactMode', 'textOnlyMode')
     * @returns {Promise<boolean>}
     */
    async isFeedEnhancementEnabled(feature) {
      const config = await this.getFeedEnhancements();
      return config[feature] === true;
    },

    /**
     * Get layout presets configuration
     * @returns {Promise<Object>} Layout presets config
     */
    async getLayoutPresets() {
      const config = await this.get("layoutPresets", DEFAULTS.layoutPresets);
      return { ...DEFAULTS.layoutPresets, ...config };
    },

    /**
     * Set layout presets configuration
     * @param {Object} config - Layout presets config
     * @returns {Promise<void>}
     */
    async setLayoutPresets(config) {
      await this.set("layoutPresets", config);
    },

    /**
     * Get a specific layout preset by name
     * @param {string} name - Preset name
     * @returns {Promise<Object|null>} Preset data or null if not found
     */
    async getLayoutPreset(name) {
      const config = await this.getLayoutPresets();
      return config.presets[name] || null;
    },

    /**
     * Set a specific layout preset
     * @param {string} name - Preset name
     * @param {Object} presetData - Preset configuration
     * @returns {Promise<void>}
     */
    async setLayoutPreset(name, presetData) {
      const config = await this.getLayoutPresets();

      // Validate name
      if (!name || typeof name !== "string" || name.length > 50) {
        throw new Error("Invalid preset name");
      }

      // Add timestamp
      config.presets[name] = {
        ...presetData,
        timestamp: Date.now(),
      };

      // Enforce max presets limit with LRU eviction
      const entries = Object.entries(config.presets);
      if (entries.length > config.maxPresets) {
        // Find oldest entry
        let oldest = null;
        let oldestTime = Infinity;
        for (const [presetName, data] of entries) {
          if (data.timestamp < oldestTime) {
            oldest = presetName;
            oldestTime = data.timestamp;
          }
        }
        if (oldest && oldest !== name) {
          delete config.presets[oldest];
        }
      }

      await this.setLayoutPresets(config);
    },

    /**
     * Delete a specific layout preset
     * @param {string} name - Preset name
     * @returns {Promise<void>}
     */
    async deleteLayoutPreset(name) {
      const config = await this.getLayoutPresets();
      delete config.presets[name];

      // Also remove from subredditLayouts if used
      for (const [subreddit, presetName] of Object.entries(
        config.subredditLayouts
      )) {
        if (presetName === name) {
          delete config.subredditLayouts[subreddit];
        }
      }

      // Clear active preset if it was deleted
      if (config.activePreset === name) {
        config.activePreset = null;
      }

      await this.setLayoutPresets(config);
    },

    /**
     * Get all layout preset names
     * @returns {Promise<string[]>} Array of preset names
     */
    async getLayoutPresetNames() {
      const config = await this.getLayoutPresets();
      return Object.keys(config.presets);
    },

    /**
     * Get subreddit layout mapping
     * @param {string} subreddit - Subreddit name (case-insensitive)
     * @returns {Promise<string|null>} Preset name or null
     */
    async getSubredditLayout(subreddit) {
      const config = await this.getLayoutPresets();
      const key = subreddit.toLowerCase();
      return config.subredditLayouts[key] || null;
    },

    /**
     * Set subreddit layout mapping
     * @param {string} subreddit - Subreddit name
     * @param {string} presetName - Preset name to apply
     * @returns {Promise<void>}
     */
    async setSubredditLayout(subreddit, presetName) {
      const config = await this.getLayoutPresets();
      const key = subreddit.toLowerCase();

      // Verify preset exists
      if (!config.presets[presetName]) {
        throw new Error(`Preset "${presetName}" does not exist`);
      }

      config.subredditLayouts[key] = presetName;

      // Enforce max subreddit mappings limit with LRU
      const entries = Object.entries(config.subredditLayouts);
      if (entries.length > config.maxSubredditMappings) {
        // Remove oldest (we don't track timestamps for subreddit mappings, so just remove first)
        const firstKey = entries[0][0];
        if (firstKey !== key) {
          delete config.subredditLayouts[firstKey];
        }
      }

      await this.setLayoutPresets(config);
    },

    /**
     * Delete subreddit layout mapping
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<void>}
     */
    async deleteSubredditLayout(subreddit) {
      const config = await this.getLayoutPresets();
      const key = subreddit.toLowerCase();
      delete config.subredditLayouts[key];
      await this.setLayoutPresets(config);
    },

    /**
     * Clear all subreddit layout mappings
     * @returns {Promise<void>}
     */
    async clearSubredditLayouts() {
      const config = await this.getLayoutPresets();
      config.subredditLayouts = {};
      await this.setLayoutPresets(config);
    },

    /**
     * Set active global preset
     * @param {string|null} presetName - Preset name or null to clear
     * @returns {Promise<void>}
     */
    async setActivePreset(presetName) {
      const config = await this.getLayoutPresets();

      if (presetName !== null && !config.presets[presetName]) {
        throw new Error(`Preset "${presetName}" does not exist`);
      }

      config.activePreset = presetName;
      await this.setLayoutPresets(config);
    },

    /**
     * Get active global preset name
     * @returns {Promise<string|null>} Active preset name or null
     */
    async getActivePreset() {
      const config = await this.getLayoutPresets();
      return config.activePreset;
    },

    /**
     * Clear all layout presets
     * @returns {Promise<void>}
     */
    async clearLayoutPresets() {
      const config = await this.getLayoutPresets();
      config.presets = {};
      config.subredditLayouts = {};
      config.activePreset = null;
      await this.setLayoutPresets(config);
    },

    /**
     * Check if layout presets feature is enabled
     * @returns {Promise<boolean>}
     */
    async isLayoutPresetsEnabled() {
      const config = await this.getLayoutPresets();
      return config.enabled !== false;
    },

    /**
     * Get accessibility settings
     * @returns {Promise<Object>} Accessibility config
     */
    async getAccessibility() {
      const config = await this.get("accessibility", DEFAULTS.accessibility);
      return { ...DEFAULTS.accessibility, ...config };
    },

    /**
     * Set accessibility settings
     * @param {Object} config - Accessibility config
     * @returns {Promise<void>}
     */
    async setAccessibility(config) {
      await this.set("accessibility", config);
    },

    /**
     * Get privacy configuration
     * @returns {Promise<Object>} Privacy config
     */
    async getPrivacy() {
      const config = await this.get("privacy", DEFAULTS.privacy);
      return { ...DEFAULTS.privacy, ...config };
    },

    /**
     * Set privacy configuration
     * @param {Object} config - Privacy config
     * @returns {Promise<void>}
     */
    async setPrivacy(config) {
      await this.set("privacy", config);
    },

    /**
     * Get tracking statistics
     * @returns {Promise<Object>} Tracking stats
     */
    async getTrackingStats() {
      const privacy = await this.getPrivacy();
      return (
        privacy.trackingStats || {
          totalCleaned: 0,
          lastCleaned: null,
          byType: {
            utm: 0,
            social: 0,
            analytics: 0,
            affiliate: 0,
            reddit: 0,
            other: 0,
          },
        }
      );
    },

    /**
     * Categorize a tracking parameter
     * @param {string} param - Parameter name
     * @returns {string} Category name
     */
    categorizeTrackingParam(param) {
      const lowerParam = param.toLowerCase();
      // UTM parameters
      if (lowerParam.startsWith("utm_")) return "utm";
      // Social media trackers
      if (
        [
          "fbclid",
          "igshid",
          "twclid",
          "ttclid",
          "li_fat_id",
          "li_sharer",
          "pin_share",
          "epik",
          "scid",
          "sclid",
          "vero_id",
          "wbraid",
        ].includes(lowerParam)
      )
        return "social";
      // Analytics trackers
      if (
        [
          "gclid",
          "gclsrc",
          "dclid",
          "_ga",
          "_gl",
          "msclkid",
          "yclid",
          "_ym_uid",
          "_ym_visorc",
          "zanpid",
        ].includes(lowerParam)
      )
        return "analytics";
      // Reddit-specific trackers
      if (
        [
          "rdt_cid",
          "share_id",
          "shared",
          "correlation_id",
          "ref_campaign",
        ].includes(lowerParam)
      )
        return "reddit";
      // Affiliate/referral trackers
      if (
        [
          "ref",
          "ref_source",
          "ref_url",
          "referrer",
          "aff_id",
          "affiliate_id",
          "partner_id",
          "click_id",
          "clickid",
          "rb_clickid",
        ].includes(lowerParam)
      )
        return "affiliate";
      // Default to other
      return "other";
    },

    /**
     * Update tracking statistics
     * @param {Object} data - { paramsRemoved: string[] }
     * @returns {Promise<void>}
     */
    async updateTrackingStats(data) {
      const privacy = await this.getPrivacy();
      const stats = privacy.trackingStats || {
        totalCleaned: 0,
        lastCleaned: null,
        byType: {
          utm: 0,
          social: 0,
          analytics: 0,
          affiliate: 0,
          reddit: 0,
          other: 0,
        },
      };

      stats.totalCleaned = (stats.totalCleaned || 0) + 1;
      stats.lastCleaned = new Date().toISOString();

      // Ensure all categories exist
      stats.byType = {
        utm: stats.byType.utm || 0,
        social: stats.byType.social || 0,
        analytics: stats.byType.analytics || 0,
        affiliate: stats.byType.affiliate || 0,
        reddit: stats.byType.reddit || 0,
        other: stats.byType.other || 0,
      };

      // Categorize removed params
      data.paramsRemoved.forEach((param) => {
        const category = this.categorizeTrackingParam(param);
        stats.byType[category] = (stats.byType[category] || 0) + 1;
      });

      privacy.trackingStats = stats;
      await this.setPrivacy(privacy);
    },

    /**
     * Clear tracking statistics
     * @returns {Promise<void>}
     */
    async clearTrackingStats() {
      const privacy = await this.getPrivacy();
      privacy.trackingStats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: {
          utm: 0,
          social: 0,
          analytics: 0,
          affiliate: 0,
          reddit: 0,
          other: 0,
        },
      };
      await this.setPrivacy(privacy);
    },

    /**
     * Calculate privacy score (0-100)
     * @returns {Promise<number>} Privacy score
     */
    async getPrivacyScore() {
      const privacy = await this.getPrivacy();
      let score = 0;

      // Tracking removal enabled (+40 points)
      if (privacy.removeTracking !== false) {
        score += 40;
      }

      // Referrer policy (+30 points based on strictness)
      const referrerScores = {
        "no-referrer": 30,
        origin: 20,
        "same-origin": 15,
        "strict-origin": 15,
        default: 0,
      };
      score += referrerScores[privacy.referrerPolicy] || 0;

      // Number of tracking params configured (+20 points, scaled)
      const paramCount = (privacy.trackingParams || []).length;
      const paramScore = Math.min(20, Math.floor(paramCount / 3));
      score += paramScore;

      // Tracking badge shows user is aware (+10 points)
      if (privacy.showTrackingBadge) {
        score += 10;
      }

      return Math.min(100, score);
    },

    /**
     * Get privacy report for export
     * @returns {Promise<Object>} Privacy report
     */
    async getPrivacyReport() {
      const privacy = await this.getPrivacy();
      const score = await this.getPrivacyScore();
      const stats = await this.getTrackingStats();

      return {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        privacyScore: score,
        settings: {
          trackingRemovalEnabled: privacy.removeTracking !== false,
          referrerPolicy: privacy.referrerPolicy || "default",
          trackingBadgeEnabled: privacy.showTrackingBadge !== false,
          trackingParamsCount: (privacy.trackingParams || []).length,
        },
        statistics: {
          totalUrlsCleaned: stats.totalCleaned || 0,
          lastCleaned: stats.lastCleaned,
          byCategory: stats.byType || {},
        },
        recommendations: await this.getPrivacyRecommendations(),
      };
    },

    /**
     * Get privacy recommendations based on current settings
     * @returns {Promise<string[]>} Array of recommendations
     */
    async getPrivacyRecommendations() {
      const privacy = await this.getPrivacy();
      const recommendations = [];

      if (privacy.removeTracking === false) {
        recommendations.push(
          "Enable tracking parameter removal for better privacy"
        );
      }

      if (privacy.referrerPolicy === "default" || !privacy.referrerPolicy) {
        recommendations.push(
          "Set a stricter referrer policy to prevent tracking"
        );
      }

      if ((privacy.trackingParams || []).length < 30) {
        recommendations.push("Add more tracking parameters to block");
      }

      if (privacy.referrerPolicy !== "no-referrer") {
        recommendations.push(
          "Consider using 'No Referrer' for maximum privacy"
        );
      }

      return recommendations;
    },

    /**
     * Check if tracking removal is enabled
     * @returns {Promise<boolean>}
     */
    async isTrackingRemovalEnabled() {
      const privacy = await this.getPrivacy();
      return privacy.removeTracking !== false;
    },

    // =========================================================================
    // Reading History
    // =========================================================================

    /**
     * Get reading history configuration
     * @returns {Promise<Object>} Reading history config
     */
    async getReadingHistory() {
      const config = await this.get("readingHistory", DEFAULTS.readingHistory);
      return { ...DEFAULTS.readingHistory, ...config };
    },

    /**
     * Set reading history configuration
     * @param {Object} config - Reading history config
     * @returns {Promise<void>}
     */
    async setReadingHistory(config) {
      await this.set("readingHistory", config);
    },

    /**
     * Check if reading history is enabled
     * @returns {Promise<boolean>}
     */
    async isReadingHistoryEnabled() {
      const config = await this.getReadingHistory();
      return config.enabled !== false;
    },

    /**
     * Add entry to reading history
     * @param {Object} entry - { id, title, subreddit, url, commentCount }
     * @returns {Promise<void>}
     */
    async addReadingHistoryEntry(entry) {
      const config = await this.getReadingHistory();
      if (!config.enabled) return;

      const entries = config.entries || [];
      const now = new Date().toISOString();

      // Check for existing entry (by post ID)
      const existingIndex = entries.findIndex((e) => e.id === entry.id);

      if (existingIndex !== -1) {
        // Update existing entry timestamp
        entries[existingIndex].timestamp = now;
        entries[existingIndex].title =
          entry.title || entries[existingIndex].title;
        // Move to front (most recent)
        const [existing] = entries.splice(existingIndex, 1);
        entries.unshift(existing);
      } else {
        // Add new entry at front
        entries.unshift({
          id: entry.id,
          title: entry.title || "Untitled",
          subreddit: entry.subreddit || "",
          url: entry.url || "",
          commentCount: entry.commentCount || 0,
          timestamp: now,
        });

        // Apply LRU eviction if over limit
        const maxEntries = config.maxEntries || 500;
        while (entries.length > maxEntries) {
          entries.pop();
        }
      }

      config.entries = entries;
      await this.setReadingHistory(config);
    },

    /**
     * Get reading history entries
     * @param {number} limit - Max entries to return (default all)
     * @returns {Promise<Array>} Array of history entries
     */
    async getReadingHistoryEntries(limit) {
      const config = await this.getReadingHistory();
      const entries = config.entries || [];

      // Filter out expired entries based on retention
      const retentionDays = config.retentionDays || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffISO = cutoffDate.toISOString();

      const validEntries = entries.filter((e) => e.timestamp >= cutoffISO);

      if (limit && limit > 0) {
        return validEntries.slice(0, limit);
      }
      return validEntries;
    },

    /**
     * Check if a post has been read
     * @param {string} postId - Post ID to check
     * @returns {Promise<boolean>}
     */
    async hasReadPost(postId) {
      const config = await this.getReadingHistory();
      const entries = config.entries || [];
      return entries.some((e) => e.id === postId);
    },

    /**
     * Get read post IDs for quick lookup
     * @returns {Promise<Set<string>>}
     */
    async getReadPostIds() {
      const entries = await this.getReadingHistoryEntries();
      return new Set(entries.map((e) => e.id));
    },

    /**
     * Remove entry from reading history
     * @param {string} postId - Post ID to remove
     * @returns {Promise<void>}
     */
    async removeReadingHistoryEntry(postId) {
      const config = await this.getReadingHistory();
      config.entries = (config.entries || []).filter((e) => e.id !== postId);
      await this.setReadingHistory(config);
    },

    /**
     * Clear all reading history
     * @returns {Promise<void>}
     */
    async clearReadingHistory() {
      const config = await this.getReadingHistory();
      config.entries = [];
      await this.setReadingHistory(config);
    },

    /**
     * Clean up expired reading history entries
     * @returns {Promise<number>} Number of entries removed
     */
    async cleanupReadingHistory() {
      const config = await this.getReadingHistory();
      const entries = config.entries || [];
      const originalCount = entries.length;

      const retentionDays = config.retentionDays || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffISO = cutoffDate.toISOString();

      config.entries = entries.filter((e) => e.timestamp >= cutoffISO);
      await this.setReadingHistory(config);

      return originalCount - config.entries.length;
    },

    /**
     * Export reading history as JSON
     * @returns {Promise<Object>}
     */
    async exportReadingHistory() {
      const config = await this.getReadingHistory();
      return {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        entryCount: (config.entries || []).length,
        entries: config.entries || [],
      };
    },

    /**
     * Import reading history from JSON
     * @param {Object} data - Imported data
     * @param {boolean} merge - Whether to merge with existing (default: true)
     * @returns {Promise<number>} Number of entries imported
     */
    async importReadingHistory(data, merge = true) {
      if (!data || !Array.isArray(data.entries)) {
        throw new Error("Invalid reading history format");
      }

      const config = await this.getReadingHistory();
      const entries = merge ? config.entries || [] : [];

      // Create a map of existing entries by ID
      const existingMap = new Map(entries.map((e) => [e.id, e]));

      // Add/update imported entries
      let importCount = 0;
      for (const entry of data.entries) {
        if (entry.id && entry.timestamp) {
          if (!existingMap.has(entry.id)) {
            entries.push({
              id: entry.id,
              title: entry.title || "Untitled",
              subreddit: entry.subreddit || "",
              url: entry.url || "",
              commentCount: entry.commentCount || 0,
              timestamp: entry.timestamp,
            });
            importCount++;
          }
        }
      }

      // Sort by timestamp (newest first)
      entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply limit
      const maxEntries = config.maxEntries || 500;
      config.entries = entries.slice(0, maxEntries);

      await this.setReadingHistory(config);
      return importCount;
    },

    // =========================================================================
    // NSFW Controls
    // =========================================================================

    /**
     * Get NSFW controls configuration
     * @returns {Promise<Object>} NSFW controls config
     */
    async getNsfwControls() {
      const config = await this.get("nsfwControls", DEFAULTS.nsfwControls);
      return { ...DEFAULTS.nsfwControls, ...config };
    },

    /**
     * Set NSFW controls configuration
     * @param {Object} config - NSFW controls config
     * @returns {Promise<void>}
     */
    async setNsfwControls(config) {
      await this.set("nsfwControls", config);
    },

    /**
     * Check if NSFW controls are enabled
     * @returns {Promise<boolean>}
     */
    async isNsfwControlsEnabled() {
      const config = await this.getNsfwControls();
      return config.enabled === true;
    },

    /**
     * Get NSFW visibility mode
     * @returns {Promise<string>} "show" | "blur" | "hide"
     */
    async getNsfwVisibility() {
      const config = await this.getNsfwControls();
      return config.visibility || "show";
    },

    /**
     * Set NSFW visibility mode
     * @param {string} mode - "show" | "blur" | "hide"
     * @returns {Promise<void>}
     */
    async setNsfwVisibility(mode) {
      if (!["show", "blur", "hide"].includes(mode)) {
        throw new Error(`Invalid NSFW visibility mode: ${mode}`);
      }
      const config = await this.getNsfwControls();
      config.visibility = mode;
      await this.setNsfwControls(config);
    },

    /**
     * Check if subreddit is in NSFW allowlist
     * @param {string} subreddit - Subreddit name (case-insensitive)
     * @returns {Promise<boolean>}
     */
    async isNsfwAllowedSubreddit(subreddit) {
      const config = await this.getNsfwControls();
      const normalized = subreddit.toLowerCase().replace(/^r\//, "");
      return (config.allowedSubreddits || []).includes(normalized);
    },

    /**
     * Add subreddit to NSFW allowlist
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<void>}
     */
    async addNsfwAllowedSubreddit(subreddit) {
      const config = await this.getNsfwControls();
      const normalized = subreddit.toLowerCase().replace(/^r\//, "");

      if (!config.allowedSubreddits) {
        config.allowedSubreddits = [];
      }

      if (!config.allowedSubreddits.includes(normalized)) {
        config.allowedSubreddits.push(normalized);
        config.allowedSubreddits.sort();

        // Enforce limit of 100 subreddits
        if (config.allowedSubreddits.length > 100) {
          config.allowedSubreddits = config.allowedSubreddits.slice(0, 100);
        }

        await this.setNsfwControls(config);
      }
    },

    /**
     * Remove subreddit from NSFW allowlist
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<void>}
     */
    async removeNsfwAllowedSubreddit(subreddit) {
      const config = await this.getNsfwControls();
      const normalized = subreddit.toLowerCase().replace(/^r\//, "");

      config.allowedSubreddits = (config.allowedSubreddits || []).filter(
        (s) => s !== normalized
      );

      await this.setNsfwControls(config);
    },

    /**
     * Get all NSFW allowed subreddits
     * @returns {Promise<string[]>}
     */
    async getNsfwAllowedSubreddits() {
      const config = await this.getNsfwControls();
      return config.allowedSubreddits || [];
    },

    /**
     * Clear all NSFW allowed subreddits
     * @returns {Promise<void>}
     */
    async clearNsfwAllowedSubreddits() {
      const config = await this.getNsfwControls();
      config.allowedSubreddits = [];
      await this.setNsfwControls(config);
    },

    // =========================================================================
    // Comment Minimap
    // =========================================================================

    /**
     * Get comment minimap configuration
     * @returns {Promise<Object>} Comment minimap config
     */
    async getCommentMinimap() {
      const config = await this.get("commentMinimap", DEFAULTS.commentMinimap);
      return { ...DEFAULTS.commentMinimap, ...config };
    },

    /**
     * Set comment minimap configuration
     * @param {Object} config - Comment minimap config
     * @returns {Promise<void>}
     */
    async setCommentMinimap(config) {
      await this.set("commentMinimap", config);
    },

    /**
     * Check if comment minimap is enabled
     * @returns {Promise<boolean>}
     */
    async isCommentMinimapEnabled() {
      const config = await this.getCommentMinimap();
      return config.enabled !== false;
    },

    /**
     * Get comment minimap position
     * @returns {Promise<string>} "left" | "right"
     */
    async getCommentMinimapPosition() {
      const config = await this.getCommentMinimap();
      return config.position || "right";
    },

    /**
     * Set comment minimap position
     * @param {string} position - "left" | "right"
     * @returns {Promise<void>}
     */
    async setCommentMinimapPosition(position) {
      if (!["left", "right"].includes(position)) {
        throw new Error(`Invalid minimap position: ${position}`);
      }
      const config = await this.getCommentMinimap();
      config.position = position;
      await this.setCommentMinimap(config);
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

    // =========================================================================
    // STORAGE PERFORMANCE & OPTIMIZATION (Phase 6)
    // =========================================================================

    /**
     * Get storage usage statistics
     * @returns {Promise<Object>} Usage stats { local, sync, total, breakdown }
     */
    async getStorageUsage() {
      const breakdown = {};

      // Get local storage usage
      const localData = await new Promise((resolve) => {
        chrome.storage.local.get(null, (data) => {
          handleLastError();
          resolve(data);
        });
      });

      // Get sync storage usage
      const syncData = await new Promise((resolve) => {
        chrome.storage.sync.get(null, (data) => {
          handleLastError();
          resolve(data);
        });
      });

      // Calculate sizes
      const localBytes = this._calculateObjectSize(localData);
      const syncBytes = this._calculateObjectSize(syncData);

      // Calculate breakdown by key
      const allData = { ...localData, ...syncData };
      for (const [key, value] of Object.entries(allData)) {
        breakdown[key] = this._calculateObjectSize({ [key]: value });
      }

      // Sort breakdown by size descending
      const sortedBreakdown = Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [key, size]) => {
          acc[key] = size;
          return acc;
        }, {});

      return {
        local: {
          used: localBytes,
          quota: 5242880, // 5MB for local storage
          percentage: Math.round((localBytes / 5242880) * 100),
        },
        sync: {
          used: syncBytes,
          quota: 102400, // 100KB for sync storage
          percentage: Math.round((syncBytes / 102400) * 100),
        },
        total: localBytes + syncBytes,
        breakdown: sortedBreakdown,
      };
    },

    /**
     * Calculate approximate byte size of an object
     * @param {Object} obj - Object to measure
     * @returns {number} Size in bytes
     */
    _calculateObjectSize(obj) {
      try {
        const str = JSON.stringify(obj);
        // JavaScript strings are UTF-16, but storage typically uses UTF-8
        // Estimate UTF-8 byte size
        return new Blob([str]).size;
      } catch (_e) {
        return 0;
      }
    },

    /**
     * Check if storage is near quota limit
     * @param {number} threshold - Percentage threshold (default 80)
     * @returns {Promise<Object>} { isNearLimit, local, sync, recommendations }
     */
    async isNearQuotaLimit(threshold = 80) {
      const usage = await this.getStorageUsage();
      const recommendations = [];

      const localNear = usage.local.percentage >= threshold;
      const syncNear = usage.sync.percentage >= threshold;

      // Generate recommendations based on largest storage consumers
      if (localNear || syncNear) {
        const breakdown = usage.breakdown;

        // Check scroll positions
        if (breakdown.scrollPositions > 50000) {
          recommendations.push({
            action: "cleanup_scroll_positions",
            message:
              "Scroll positions are using significant storage. Consider clearing old positions.",
            savings: breakdown.scrollPositions,
          });
        }

        // Check sort preferences
        if (breakdown.sortPreferences > 30000) {
          recommendations.push({
            action: "cleanup_sort_preferences",
            message:
              "Sort preferences are using significant storage. Consider clearing old preferences.",
            savings: breakdown.sortPreferences,
          });
        }

        // Check user tags
        if (breakdown.userTags > 100000) {
          recommendations.push({
            action: "cleanup_user_tags",
            message:
              "User tags are using significant storage. Consider removing unused tags.",
            savings: breakdown.userTags,
          });
        }

        // Check stats
        if (breakdown.stats > 50000) {
          recommendations.push({
            action: "cleanup_stats",
            message:
              "Statistics are using significant storage. Consider clearing old stats.",
            savings: breakdown.stats,
          });
        }
      }

      return {
        isNearLimit: localNear || syncNear,
        local: {
          isNearLimit: localNear,
          percentage: usage.local.percentage,
        },
        sync: {
          isNearLimit: syncNear,
          percentage: usage.sync.percentage,
        },
        recommendations,
      };
    },

    /**
     * Get storage health report
     * @returns {Promise<Object>} Health report with status and details
     */
    async getStorageHealthReport() {
      const usage = await this.getStorageUsage();
      const quotaCheck = await this.isNearQuotaLimit();

      // Count items in various storage objects
      const all = await this.getAll();
      const counts = {
        userTags: Object.keys(all.userTags?.tags || {}).length,
        mutedUsers: Object.keys(all.mutedUsers?.users || {}).length,
        sortPreferences: Object.keys(all.sortPreferences?.preferences || {})
          .length,
        scrollPositions: Object.keys(all.scrollPositions?.positions || {})
          .length,
        layoutPresets: Object.keys(all.layoutPresets?.presets || {}).length,
        subredditLayouts: Object.keys(all.layoutPresets?.subredditLayouts || {})
          .length,
        mutedSubreddits: (all.subredditOverrides?.mutedSubreddits || []).length,
        mutedKeywords: (all.contentFiltering?.mutedKeywords || []).length,
        mutedDomains: (all.contentFiltering?.mutedDomains || []).length,
        mutedFlairs: (all.contentFiltering?.mutedFlairs || []).length,
      };

      // Determine overall health status
      let status = "healthy";
      const issues = [];

      if (
        quotaCheck.local.percentage >= 90 ||
        quotaCheck.sync.percentage >= 90
      ) {
        status = "critical";
        issues.push("Storage is critically full (>90%)");
      } else if (quotaCheck.isNearLimit) {
        status = "warning";
        issues.push("Storage is approaching quota limit (>80%)");
      }

      // Check for potential issues
      if (counts.scrollPositions > 80) {
        issues.push(
          `Scroll positions near limit (${counts.scrollPositions}/100)`
        );
      }
      if (counts.sortPreferences > 80) {
        issues.push(
          `Sort preferences near limit (${counts.sortPreferences}/100)`
        );
      }
      if (counts.userTags > 400) {
        issues.push(`User tags near limit (${counts.userTags}/500)`);
      }

      return {
        status,
        issues,
        usage,
        counts,
        recommendations: quotaCheck.recommendations,
        lastChecked: new Date().toISOString(),
      };
    },

    /**
     * Cleanup expired and stale data
     * @returns {Promise<Object>} Cleanup results
     */
    async cleanupExpiredData() {
      const results = {
        scrollPositions: 0,
        sortPreferences: 0,
        totalBytesFreed: 0,
        startUsage: 0,
        endUsage: 0,
      };

      // Get initial usage
      const startUsage = await this.getStorageUsage();
      results.startUsage = startUsage.total;

      // 1. Cleanup old scroll positions (24-hour retention)
      results.scrollPositions = await this.cleanupOldScrollPositions();

      // 2. Cleanup old sort preferences (30-day retention)
      const sortConfig = await this.getSortPreferences();
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      let sortCleaned = 0;

      for (const [subreddit, data] of Object.entries(sortConfig.preferences)) {
        if (data.timestamp && now - data.timestamp > thirtyDaysMs) {
          delete sortConfig.preferences[subreddit];
          sortCleaned++;
        }
      }

      if (sortCleaned > 0) {
        await this.setSortPreferences(sortConfig);
        results.sortPreferences = sortCleaned;
      }

      // 3. Trim per-subreddit stats to top 25 (was 50)
      const stats = await this.getStats();
      const entries = Object.entries(stats.perSubreddit);
      if (entries.length > 25) {
        const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 25);
        stats.perSubreddit = Object.fromEntries(sorted);
        await this.set("stats", stats);
      }

      // Get final usage
      const endUsage = await this.getStorageUsage();
      results.endUsage = endUsage.total;
      results.totalBytesFreed = results.startUsage - results.endUsage;

      return results;
    },

    /**
     * Compact storage by removing empty/null values
     * @returns {Promise<Object>} Compaction results
     */
    async compactStorage() {
      const results = {
        keysCompacted: 0,
        bytesFreed: 0,
      };

      const startUsage = await this.getStorageUsage();
      const all = await this.getAll();

      // Remove null/undefined values from objects
      const compactObject = (obj) => {
        if (!obj || typeof obj !== "object") return obj;
        if (Array.isArray(obj))
          return obj.filter((v) => v !== null && v !== undefined);

        const compacted = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== null && value !== undefined) {
            compacted[key] =
              typeof value === "object" ? compactObject(value) : value;
          }
        }
        return compacted;
      };

      // Compact each storage key
      for (const [key, value] of Object.entries(all)) {
        if (key.startsWith("_")) continue; // Skip internal keys

        const compacted = compactObject(value);
        const originalSize = this._calculateObjectSize({ [key]: value });
        const compactedSize = this._calculateObjectSize({ [key]: compacted });

        if (compactedSize < originalSize) {
          await this.set(key, compacted);
          results.keysCompacted++;
        }
      }

      const endUsage = await this.getStorageUsage();
      results.bytesFreed = startUsage.total - endUsage.total;

      return results;
    },

    /**
     * Run automatic maintenance (called periodically)
     * @returns {Promise<Object>} Maintenance results
     */
    async runMaintenance() {
      const results = {
        timestamp: new Date().toISOString(),
        cleanup: null,
        compact: null,
        healthReport: null,
      };

      try {
        // Run cleanup
        results.cleanup = await this.cleanupExpiredData();

        // Run compaction if significant cleanup occurred
        if (results.cleanup.totalBytesFreed > 1000) {
          results.compact = await this.compactStorage();
        }

        // Generate health report
        results.healthReport = await this.getStorageHealthReport();
      } catch (error) {
        results.error = error.message;
      }

      return results;
    },
  };

  // Export for use in other scripts
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Storage;
  } else {
    window.Storage = Storage;
  }
})();

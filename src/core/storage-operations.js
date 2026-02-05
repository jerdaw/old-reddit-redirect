"use strict";

/**
 * Storage operations module
 * Provides core storage operations, sync helpers, quota monitoring, and health checks
 */

(function () {
  // Assumes StorageSchema is already loaded
  const { DEFAULTS, SYNC_KEYS } = window.StorageSchema;

  /**
   * Handle Chrome runtime errors
   */
  function handleLastError() {
    void chrome.runtime.lastError;
  }

  /**
   * Core storage operations
   */
  const StorageOperations = {
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

      await this.set("sync", {
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

      await this.set("sync", { enabled: false, lastSync: null });
    },

    // =========================================================================
    // STORAGE PERFORMANCE & OPTIMIZATION
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
     * @param {Function} getStats - Function to get stats
     * @param {Function} getSortPreferences - Function to get sort preferences
     * @param {Function} setSortPreferences - Function to set sort preferences
     * @param {Function} cleanupOldScrollPositions - Function to cleanup scroll positions
     * @returns {Promise<Object>} Cleanup results
     */
    async cleanupExpiredData(
      getStats,
      getSortPreferences,
      setSortPreferences,
      cleanupOldScrollPositions
    ) {
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
      results.scrollPositions = await cleanupOldScrollPositions();

      // 2. Cleanup old sort preferences (30-day retention)
      const sortConfig = await getSortPreferences();
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
        await setSortPreferences(sortConfig);
        results.sortPreferences = sortCleaned;
      }

      // 3. Trim per-subreddit stats to top 25 (was 50)
      const stats = await getStats();
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
     * @param {Function} getStats - Function to get stats
     * @param {Function} getSortPreferences - Function to get sort preferences
     * @param {Function} setSortPreferences - Function to set sort preferences
     * @param {Function} cleanupOldScrollPositions - Function to cleanup scroll positions
     * @returns {Promise<Object>} Maintenance results
     */
    async runMaintenance(
      getStats,
      getSortPreferences,
      setSortPreferences,
      cleanupOldScrollPositions
    ) {
      const results = {
        timestamp: new Date().toISOString(),
        cleanup: null,
        compact: null,
        healthReport: null,
      };

      try {
        // Run cleanup
        results.cleanup = await this.cleanupExpiredData(
          getStats,
          getSortPreferences,
          setSortPreferences,
          cleanupOldScrollPositions
        );

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

  // Export to window object for IIFE pattern compatibility
  // In test environments, window may be globalThis
  const globalObject = typeof window !== "undefined" ? window : globalThis;
  globalObject.StorageOperations = StorageOperations;
})();

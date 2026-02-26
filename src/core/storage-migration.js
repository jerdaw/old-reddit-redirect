"use strict";

/**
 * Storage migration module
 * Handles schema migrations and version upgrades
 */

(function () {
  // Assumes StorageSchema is already loaded
  const { SCHEMA_VERSION, DEFAULTS } = window.StorageSchema;

  /**
   * Handle Chrome runtime errors
   */
  function handleLastError() {
    void chrome.runtime.lastError;
  }

  /**
   * Storage migration functions
   */
  const StorageMigration = {
    /**
     * Migrate from legacy storage (v3.0.0)
     * @param {Function} getAll - Function to get all storage data
     * @param {Function} set - Function to set storage data
     * @param {Function} initialize - Function to initialize storage
     * @returns {Promise<void>}
     */
    async migrateFromLegacy(getAll, set, initialize) {
      const all = await getAll();

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
      await set("_schemaVersion", SCHEMA_VERSION);
      await set("enabled", enabled);
      await initialize();
    },

    /**
     * Export settings to JSON
     * @param {Function} getAll - Function to get all storage data
     * @returns {Promise<Object>} Exported settings
     */
    async exportSettings(getAll) {
      const all = await getAll();

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
     * @param {Function} setFrontend - Function to set frontend config
     * @param {Function} setSubredditOverrides - Function to set subreddit overrides
     * @param {Function} setUIPreferences - Function to set UI preferences
     * @returns {Promise<void>}
     */
    async importSettings(
      data,
      setFrontend,
      setSubredditOverrides,
      setUIPreferences
    ) {
      const validation = this.validateImport(data);
      if (!validation.valid) {
        throw new Error(`Invalid import: ${validation.errors.join(", ")}`);
      }

      // Import each section
      if (data.frontend) {
        await setFrontend(data.frontend);
      }
      if (data.subredditOverrides) {
        await setSubredditOverrides(data.subredditOverrides);
      }
      if (data.ui) {
        await setUIPreferences(data.ui);
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

      // Overall size cap (5MB)
      try {
        if (JSON.stringify(data).length > 5 * 1024 * 1024) {
          errors.push("Import data exceeds 5MB size limit");
          return { valid: false, errors };
        }
      } catch {
        errors.push("Import data is not serializable");
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
            if (data.subredditOverrides.whitelist.length > 500) {
              errors.push("Whitelist exceeds 500 entry limit");
            }
            const invalid = data.subredditOverrides.whitelist.filter(
              (s) => typeof s !== "string" || !/^[a-z0-9_]+$/i.test(s)
            );
            if (invalid.length > 0) {
              errors.push(`Invalid subreddit names: ${invalid.join(", ")}`);
            }
          }
        }
      }

      // Validate content filtering
      if (data.contentFiltering) {
        if (typeof data.contentFiltering === "object") {
          const cf = data.contentFiltering;
          if (Array.isArray(cf.mutedKeywords)) {
            if (cf.mutedKeywords.length > 200) {
              errors.push("Muted keywords exceeds 200 entry limit");
            }
            // Validate regex patterns are safe
            for (const keyword of cf.mutedKeywords) {
              if (typeof keyword === "string" && cf.useRegex) {
                try {
                  new RegExp(keyword);
                } catch {
                  errors.push(`Invalid regex pattern: ${keyword}`);
                }
              }
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
  };

  // Export to window object for IIFE pattern compatibility
  // In test environments, window may be globalThis
  const globalObject = typeof window !== "undefined" ? window : globalThis;
  globalObject.StorageMigration = StorageMigration;
})();

"use strict";

/**
 * Supported Reddit frontend definitions
 * Provides configuration for old.reddit.com and alternative privacy-focused frontends
 */
(function () {
  const FRONTENDS = {
    "old.reddit.com": {
      id: "old",
      name: "Old Reddit",
      description: "Official old Reddit interface (default)",
      domain: "old.reddit.com",
      requiresPermission: false,
      icon: "🔴",
    },
    "teddit.net": {
      id: "teddit",
      name: "Teddit",
      description: "Privacy-focused, no JavaScript required",
      domain: "teddit.net",
      requiresPermission: true,
      icon: "🟠",
      instances: ["teddit.net", "teddit.zaggy.nl", "teddit.namazso.eu"],
    },
    "redlib.catsarch.com": {
      id: "redlib",
      name: "Redlib",
      description: "Modern LibReddit fork with enhanced features",
      domain: "redlib.catsarch.com",
      requiresPermission: true,
      icon: "🟢",
      instances: [
        "redlib.catsarch.com",
        "redlib.perennialte.ch",
        "libreddit.bus-hit.me",
      ],
    },
    custom: {
      id: "custom",
      name: "Custom Instance",
      description: "Self-hosted or other instance",
      domain: null,
      requiresPermission: true,
      icon: "⚙️",
    },
  };

  const Frontends = {
    /**
     * Get all available frontends
     * @returns {Array} Array of frontend objects
     */
    getAll() {
      return Object.values(FRONTENDS);
    },

    /**
     * Get frontend by ID
     * @param {string} id - Frontend ID
     * @returns {Object|undefined} Frontend object or undefined
     */
    getById(id) {
      return Object.values(FRONTENDS).find((f) => f.id === id);
    },

    /**
     * Get frontend by domain
     * @param {string} domain - Frontend domain
     * @returns {Object|undefined} Frontend object or undefined
     */
    getByDomain(domain) {
      return FRONTENDS[domain];
    },

    /**
     * Get default frontend (old.reddit.com)
     * @returns {Object} Default frontend object
     */
    getDefault() {
      return FRONTENDS["old.reddit.com"];
    },

    /**
     * Check if domain is a known frontend
     * @param {string} domain - Domain to check
     * @returns {boolean} True if domain is a known frontend
     */
    isKnownFrontend(domain) {
      return domain in FRONTENDS;
    },
  };

  // Export for use in other scripts
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { FRONTENDS, Frontends };
  } else {
    window.Frontends = Frontends;
    window.FRONTENDS = FRONTENDS;
  }
})();

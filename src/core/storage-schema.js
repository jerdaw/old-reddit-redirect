"use strict";

/**
 * Storage schema and configuration constants
 * Defines default settings, storage keys, and application limits
 */

(function () {
  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {string} Date string in YYYY-MM-DD format
   */
  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  // Schema version for future migrations
  const SCHEMA_VERSION = 3;

  // Application Constants
  const MAX_USER_TAGS = 500;
  const MAX_MUTED_USERS = 500;
  const MAX_SORT_PREFERENCES = 100;
  const MAX_SCROLL_POSITIONS = 100;
  const MAX_SUBREDDIT_MAPPINGS = 100;
  const MAX_LAYOUT_PRESETS = 20;
  const MAX_READING_HISTORY = 500;
  const SCROLL_RETENTION_HOURS = 24;
  const READING_HISTORY_RETENTION_DAYS = 30;
  const KEYBOARD_CHORD_TIMEOUT_MS = 1000;
  const MAX_INLINE_IMAGE_WIDTH = 600;
  const COLOR_STRIPE_WIDTH = 3;
  const MINIMAP_DEFAULT_WIDTH = 120;

  // Keys that should be synced across browsers (when sync is enabled)
  const SYNC_KEYS = [
    "frontend",
    "subredditOverrides",
    "ui",
    "debug",
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
    debug: {
      enabled: false, // Enable debug logging (console.log statements)
    },
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
      stripeWidth: COLOR_STRIPE_WIDTH,
      navigationButtons: true,
      navButtonPosition: "bottom-right", // "bottom-right" | "bottom-left"
      inlineImages: true,
      maxImageWidth: MAX_INLINE_IMAGE_WIDTH, // pixels, 0 = full width
      // v11.2.0: Jump to top keyboard shortcut
      jumpToTopShortcut: true,
    },
    sortPreferences: {
      enabled: true,
      maxEntries: MAX_SORT_PREFERENCES,
      preferences: {}, // { subreddit: { sort, time, timestamp } }
    },
    userTags: {
      enabled: true,
      maxTags: MAX_USER_TAGS,
      tags: {}, // { username: { text, color, timestamp } }
    },
    mutedUsers: {
      enabled: true,
      maxUsers: MAX_MUTED_USERS,
      users: {}, // { username: { reason, timestamp } }
    },
    scrollPositions: {
      enabled: true,
      maxEntries: MAX_SCROLL_POSITIONS,
      retentionHours: SCROLL_RETENTION_HOURS,
      positions: {}, // { url: { scrollY, timestamp } }
    },
    keyboardShortcuts: {
      enabled: true,
      chordTimeout: KEYBOARD_CHORD_TIMEOUT_MS, // Milliseconds to wait for chord sequence
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
      maxPresets: MAX_LAYOUT_PRESETS,
      activePreset: null, // Name of currently active global preset
      presets: {}, // { presetName: { darkMode, compactMode, textOnlyMode, uncropImages, hideJoinButtons, hideActionLinks, colorCodedComments, colorPalette, customCSS, timestamp } }
      subredditLayouts: {}, // { subredditName: presetName }
      maxSubredditMappings: MAX_SUBREDDIT_MAPPINGS,
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
      maxEntries: MAX_READING_HISTORY,
      retentionDays: READING_HISTORY_RETENTION_DAYS,
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
      width: MINIMAP_DEFAULT_WIDTH, // Width in pixels (80-200)
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

  // Export to window object for IIFE pattern compatibility
  // In test environments, window may be globalThis
  const globalObject = typeof window !== "undefined" ? window : globalThis;
  globalObject.StorageSchema = {
    SCHEMA_VERSION,
    DEFAULTS,
    SYNC_KEYS,
    // Application constants
    MAX_USER_TAGS,
    MAX_MUTED_USERS,
    MAX_SORT_PREFERENCES,
    MAX_SCROLL_POSITIONS,
    MAX_SUBREDDIT_MAPPINGS,
    MAX_LAYOUT_PRESETS,
    MAX_READING_HISTORY,
    SCROLL_RETENTION_HOURS,
    READING_HISTORY_RETENTION_DAYS,
    KEYBOARD_CHORD_TIMEOUT_MS,
    MAX_INLINE_IMAGE_WIDTH,
    COLOR_STRIPE_WIDTH,
    MINIMAP_DEFAULT_WIDTH,
  };
})();

/**
 * Application Constants
 *
 * Centralized configuration values used throughout the extension.
 * Modify these values to adjust limits, timeouts, and other settings.
 */

// Storage Limits
export const MAX_USER_TAGS = 500;
export const MAX_MUTED_USERS = 500;
export const MAX_SORT_PREFERENCES = 100;
export const MAX_SCROLL_POSITIONS = 100;
export const MAX_SUBREDDIT_MAPPINGS = 100;
export const MAX_LAYOUT_PRESETS = 20;
export const MAX_READING_HISTORY = 500;
export const MAX_MUTED_SUBREDDITS = 100;
export const MAX_KEYWORDS = 200;
export const MAX_DOMAINS = 100;
export const MAX_FLAIRS = 100;

// Time Periods (in various units)
export const SCROLL_RETENTION_HOURS = 24;
export const READING_HISTORY_RETENTION_DAYS = 30;
export const KEYBOARD_CHORD_TIMEOUT_MS = 1000;

// UI Dimensions
export const MAX_INLINE_IMAGE_WIDTH = 600; // pixels, 0 = full width
export const COLOR_STRIPE_WIDTH = 3; // pixels
export const MINIMAP_DEFAULT_WIDTH = 120; // pixels
export const MINIMAP_MIN_WIDTH = 60; // pixels
export const MINIMAP_MAX_WIDTH = 200; // pixels

// NSFW Controls
export const MIN_BLUR_INTENSITY = 5; // pixels
export const MAX_BLUR_INTENSITY = 20; // pixels
export const DEFAULT_BLUR_INTENSITY = 10; // pixels

// Performance
export const DEBOUNCE_DELAY_MS = 250;
export const THROTTLE_DELAY_MS = 100;

// Misc
export const RULESET_ID = "ruleset_1";
export const LOG_PREFIX = "[ORE]";

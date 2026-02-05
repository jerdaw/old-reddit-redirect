/**
 * UI Constants
 * Centralized configuration values for UI elements and behaviors
 *
 * These constants control visual appearance, animations, and layout.
 * For data storage limits, see src/core/storage-schema.js
 */

// ============================================================================
// Layout & Spacing
// ============================================================================

/**
 * Height of Reddit's fixed header (used for scroll offset calculations)
 * @const {number}
 */
export const REDDIT_HEADER_HEIGHT = 60;

/**
 * Additional scroll offset for better visibility when navigating
 * @const {number}
 */
export const SCROLL_OFFSET = 100;

/**
 * Scroll offset when clicking minimap entries (accounts for header + padding)
 * @const {number}
 */
export const MINIMAP_SCROLL_OFFSET = 80;

// ============================================================================
// Comment Minimap
// ============================================================================

/**
 * Fixed height for minimap content area (in pixels)
 * @const {number}
 */
export const MINIMAP_CONTENT_HEIGHT = 400;

/**
 * Default width for comment minimap sidebar (in pixels)
 * Can be overridden in user settings
 * @const {number}
 */
export const MINIMAP_DEFAULT_WIDTH = 120;

/**
 * Indentation per comment depth level in minimap (in pixels)
 * @const {number}
 */
export const MINIMAP_DEPTH_INDENT = 4;

/**
 * Right padding for minimap entries (in pixels)
 * @const {number}
 */
export const MINIMAP_ENTRY_PADDING = 20;

/**
 * Maximum height for minimap entry blocks (in pixels)
 * @const {number}
 */
export const MINIMAP_MAX_ENTRY_HEIGHT = 20;

/**
 * Minimum height for minimap entry blocks (in pixels)
 * @const {number}
 */
export const MINIMAP_MIN_ENTRY_HEIGHT = 2;

// ============================================================================
// Comment Color Coding
// ============================================================================

/**
 * Width of color stripe for comment depth indicators (in pixels)
 * @const {number}
 */
export const COLOR_STRIPE_WIDTH = 3;

/**
 * Color palette for comment depth levels
 * Each color represents a nesting level (1-10+)
 * @const {string[]}
 */
export const DEPTH_COLORS = [
  "#ff4500", // Level 1 - Reddit orange
  "#0079d3", // Level 2 - Blue
  "#46d160", // Level 3 - Green
  "#ff8b60", // Level 4 - Light orange
  "#7193ff", // Level 5 - Light blue
  "#ffd635", // Level 6 - Yellow
  "#ff66ac", // Level 7 - Pink
  "#9147ff", // Level 8 - Purple
  "#00d5fa", // Level 9 - Cyan
  "#cccccc", // Level 10+ - Gray
];

// ============================================================================
// Images & Media
// ============================================================================

/**
 * Maximum width for inline expanded images (in pixels)
 * @const {number}
 */
export const MAX_INLINE_IMAGE_WIDTH = 600;

// ============================================================================
// Animations & Timing
// ============================================================================

/**
 * Timeout for keyboard chord sequences (in milliseconds)
 * Used for multi-key shortcuts like "g h" (go home)
 * @const {number}
 */
export const KEYBOARD_CHORD_TIMEOUT = 1000;

/**
 * Duration of comment highlight animation when navigating (in milliseconds)
 * @const {number}
 */
export const COMMENT_HIGHLIGHT_DURATION = 600;

/**
 * Transition duration for smooth animations (in seconds)
 * @const {number}
 */
export const TRANSITION_DURATION = 0.3;

// ============================================================================
// Comment Highlighting
// ============================================================================

/**
 * Background color for highlighted comments (RGBA)
 * Used when navigating between comments
 * @const {string}
 */
export const HIGHLIGHT_COLOR = "rgba(255, 69, 0, 0.15)";

// ============================================================================
// Data Limits (Reference)
// ============================================================================
// Note: These are defined in src/core/storage-schema.js
// Listed here for reference only (DO NOT export from here)
//
// MAX_USER_TAGS = 500
// MAX_MUTED_USERS = 500
// MAX_SORT_PREFERENCES = 100
// MAX_SCROLL_POSITIONS = 100
// MAX_SUBREDDIT_MAPPINGS = 100
// MAX_LAYOUT_PRESETS = 20
// MAX_READING_HISTORY = 500
// SCROLL_RETENTION_HOURS = 24
// READING_HISTORY_RETENTION_DAYS = 30

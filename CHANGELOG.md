# Changelog

All notable changes to Old Reddit Redirect will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Switch All Tabs**: Two new popup buttons to switch all open Reddit tabs to old or new Reddit in one click
  - "All Tabs → Old" switches all www/new/np reddit.com tabs to old.reddit.com
  - "All Tabs → New" switches all old.reddit.com tabs to www.reddit.com
  - Skips allowlisted paths (/settings, /mod, /media, etc.)
  - Transforms gallery URLs (/gallery/ID → /comments/ID)
  - Visual feedback showing count of switched tabs

### Changed

#### Code Quality Improvements (2026-02-05)

- **Module Documentation**: Added comprehensive modules/README.md (574 lines)
  - Architecture overview with module categories and lazy loading patterns
  - Complete "how to add a new module" tutorial with code examples
  - Performance benefits explanation (13.8% smaller bundle, 33-53% fewer lines executed)
  - Best practices, browser compatibility, and troubleshooting guide
  - Module orchestrator patterns and Promise.allSettled() usage

- **UI Constants Centralization**: Created modules/shared/constants.js
  - Extracted 20+ hardcoded UI values (layout, colors, timing)
  - REDDIT_HEADER_HEIGHT (60px), SCROLL_OFFSET (100px), MINIMAP_CONTENT_HEIGHT (400px)
  - DEPTH_COLORS array (10-level comment color palette)
  - TRANSITION_DURATION, HIGHLIGHT_COLOR, keyboard chord timeout
  - Updated minimap.js, navigation.js, color-coding.js to use constants

- **Options Page Refactoring**: Extracted UI strings to options-constants.js
  - Moved 110+ UI strings from options.js to separate module
  - Reduced options.js from 6,550 to 6,439 lines (-111 lines, -1.7%)
  - Follows storage.js IIFE + global namespace pattern
  - Improved maintainability and future i18n readiness

- **JSDoc Coverage**: Added comprehensive documentation to core files
  - popup.js: 24 JSDoc blocks (100% coverage)
  - background.js: 36 JSDoc blocks (100% coverage)
  - Improved IDE autocomplete and developer experience

- **Documentation Updates**: Cleaned up migration documentation
  - Updated PHASE-1-COMPLETE.md to reflect Phase 7 completion
  - Fixed outdated "Ready to Start" and "TBD" references
  - Added actual post-migration performance metrics

#### Code Quality Improvements (2026-02-04)

- **Dependency Updates**: Updated all dev dependencies to latest versions
  - vitest: 2.1.9 → 4.0.18 (fixed security vulnerability CVE GHSA-67mh-4wv8-2f99)
  - jsdom: 27.4.0 → 28.0.0
  - globals: 15.15.0 → 17.3.0
  - eslint-config-prettier: 9.1.2 → 10.1.8

- **Constants Extraction**: Centralized 13 hardcoded values in storage.js
  - MAX_USER_TAGS (500), MAX_MUTED_USERS (500), MAX_SORT_PREFERENCES (100)
  - MAX_SCROLL_POSITIONS (100), MAX_SUBREDDIT_MAPPINGS (100), MAX_LAYOUT_PRESETS (20)
  - MAX_READING_HISTORY (500), SCROLL_RETENTION_HOURS (24), READING_HISTORY_RETENTION_DAYS (30)
  - KEYBOARD_CHORD_TIMEOUT_MS (1000), MAX_INLINE_IMAGE_WIDTH (600)
  - COLOR_STRIPE_WIDTH (3), MINIMAP_DEFAULT_WIDTH (120)
  - Single source of truth for configuration values

- **Debug Mode**: Added conditional logging system
  - Created `modules/shared/debug-helpers.js` with `debugLog()` function
  - Replaced 23 `console.log` statements with conditional `debugLog()`
  - Debug mode disabled by default (cleaner production console)
  - Users can enable debug logging in settings for troubleshooting

- **JSDoc Documentation**: Added comprehensive JSDoc to 50+ exported functions
  - Feed modules (6 functions), Optional modules (21 functions)
  - Core modules (12 functions), Comments modules (11 functions)
  - Module loader (1 function)
  - Improved IDE autocomplete and developer documentation

- **Function Refactoring**: Split large functions in options.js
  - Refactored 5 functions (100-557 lines) into focused helpers
  - attachListeners(): 557 → 15 lines (10 helper functions)
  - handleTestUrl(): 144 → 16 lines (7 helper functions)
  - refreshUserTagsList(): 82 → 16 lines (5 helper functions)
  - refreshStorageStats(): 77 → 12 lines (5 helper functions)
  - initLayoutPresetsListeners(): 77 → 6 lines (5 helper functions)
  - 73% reduction in largest function size
  - Applied Coordinator Pattern throughout

- **Build System Fixes**: Updated for new directory structure
  - Fixed Makefile to work with src/ and modules/ directories
  - Removed outdated CI validation steps
  - Fixed ESLint configuration for keyboard-utils.js
  - Updated package.json validate script

#### Phase 6.1: Code Splitting & Modular Architecture

- **Modular ES6 Architecture**: Migrated from monolithic 3,699-line content script to modular architecture
  - 24 ES6 modules organized into 5 categories (core, comments, feed, optional, shared)
  - Native browser module support (no bundler required)
  - Dynamic imports for lazy and conditional loading
  - content-script.js reduced from 3,699 to 25 lines (99.3% reduction)

- **Lazy Loading**: Features load only when needed
  - Page-level: Comment modules load only on /comments/ pages
  - Page-level: Feed modules load only on feed/subreddit pages
  - Feature-level: Optional features load only when enabled by user
  - 33-53% fewer lines of code executed per page

- **Performance Improvements**:
  - Bundle size: 181KB → 156KB (13.8% reduction)
  - Parse time: 100-150ms faster initial page load
  - Memory usage: ~40KB lower footprint
  - Browser module caching between page loads

- **Module Categories**:
  - Core (always loaded): dark-mode, accessibility, nag-blocking, content-filtering
  - Comments (lazy): color-coding, navigation, inline-images, minimap
  - Feed (lazy): feed-modes, sort-preferences
  - Optional (conditional): user-tags, nsfw-controls, layout-presets, reading-history
  - Shared (imported by all): page-detection, dom-helpers, storage-helpers

- **Developer Experience**:
  - Simpler build process (no bundler configuration)
  - Easier debugging (no transpilation/minification in development)
  - Better maintainability (features isolated in dedicated modules)
  - Clear module boundaries and responsibilities

## [19.0.0] - 2026-02-01

### Added

#### Phase 14: Comment Thread Minimap

- **Visual Thread Minimap**: Bird's-eye view of comment threads
  - Fixed-position sidebar showing entire comment thread structure
  - Configurable position (left or right side of screen)
  - Adjustable width (60-200px, default 120px)
  - Adjustable opacity (10-100%, default 90%)
  - Only appears on comment pages

- **Viewport Indicator**: Shows current scroll position
  - Semi-transparent overlay indicating visible area
  - Real-time updates as you scroll
  - Click anywhere on minimap to jump to that position
  - Smooth scroll animation on click

- **Depth-Colored Comments**: Visual depth representation
  - Color-coded markers match comment depth colors
  - 10 distinct depth levels with gradient colors
  - Optional toggle to use uniform color instead
  - Collapsed comment indicators (striped pattern)

- **Auto-hide Mode**: Reduce visual clutter
  - Minimap fades when not hovering (optional)
  - Shows on hover for quick navigation
  - Default: always visible

### Changed

- **Storage schema**: Added `commentMinimap` configuration object
  - `enabled`: Boolean (default: true)
  - `position`: "left" | "right" (default: "right")
  - `width`: Number 60-200 (default: 120)
  - `opacity`: Number 0.1-1.0 (default: 0.9)
  - `showViewportIndicator`: Boolean (default: true)
  - `useDepthColors`: Boolean (default: true)
  - `collapsedIndicator`: Boolean (default: true)
  - `autoHide`: Boolean (default: false)

- **Content script**: Added comment minimap initialization
  - `initCommentMinimap()`: Creates and manages the minimap
  - Scroll and resize event handlers for real-time updates
  - Message handler for `REFRESH_COMMENT_MINIMAP`

- **CSS**: Added minimap styling
  - `.orr-comment-minimap`: Container with fixed positioning
  - `.orr-minimap-marker`: Individual comment markers
  - `.orr-minimap-viewport`: Viewport indicator overlay
  - `.orr-minimap-marker-collapsed`: Striped collapsed indicator
  - Responsive hiding on screens < 1024px width

### Technical Details

- **New storage methods**: 5 methods for minimap management
  - `getCommentMinimap()`, `setCommentMinimap()`
  - `isCommentMinimapEnabled()`
  - `getMinimapPosition()`, `getMinimapWidth()`

- **Performance**: Optimized rendering
  - RequestAnimationFrame for smooth updates
  - Throttled resize handling
  - Efficient DOM updates

- **Test coverage**: 46 new tests for comment minimap
  - Storage schema tests
  - Position and width settings tests
  - Viewport indicator tests
  - Click navigation tests
  - Responsive behavior tests

- **Total test suite**: 811 tests (up from 765)

### Roadmap Progress

- ✅ **Phase 14.1 Completed** (v19.0.0): Comment thread minimap
- ✅ **Phase 14.2 Completed** (v19.0.0): Viewport indicator
- ✅ **Phase 14.3 Completed** (v19.0.0): Depth colors and collapsed indicators

## [18.0.0] - 2026-02-01

### Added

#### Phase 13: NSFW Content Controls

- **NSFW Visibility Modes**: Control how NSFW content is displayed
  - Three visibility options: Show (default), Blur, or Hide
  - Configurable blur intensity (5-20 pixels)
  - Reveal on hover option for blurred content
  - Disabled by default to respect user choice
  - Works with posts marked as over18 or NSFW

- **Per-Subreddit Allowlist**: Exceptions for trusted subreddits
  - Whitelist up to 100 subreddits where NSFW is always shown
  - Case-insensitive subreddit matching
  - Add/remove subreddits from options page
  - Clear all allowed subreddits with one click

- **NSFW Warning Overlay**: Visual indicator on blurred content
  - "18+ NSFW" badge on blurred thumbnails
  - Click to temporarily reveal content (10 second timeout)
  - Toggle to enable/disable warning overlay
  - Dark mode compatible styling

### Changed

- **Storage schema**: Added `nsfwControls` configuration object
  - `enabled`: Boolean (default: false)
  - `visibility`: "show" | "blur" | "hide" (default: "show")
  - `blurIntensity`: Number 5-20 (default: 10)
  - `revealOnHover`: Boolean (default: true)
  - `showWarning`: Boolean (default: true)
  - `allowedSubreddits`: Array of subreddit names (max 100)

- **Content script**: Added NSFW content control function
  - `applyNsfwControls()`: Detects NSFW posts and applies visibility settings
  - `getCurrentSubreddit()`: Extracts current subreddit for allowlist checking
  - Message handler for `REFRESH_NSFW_CONTROLS`

- **CSS**: Added NSFW control styling
  - `.orr-nsfw-blur`: Body class for blur mode
  - `.orr-nsfw-hide`: Body class for hide mode
  - `.orr-nsfw-blurred`: Post-level blur class
  - `.orr-nsfw-warning`: Warning overlay styling
  - CSS variable `--orr-nsfw-blur` for configurable intensity

### Technical Details

- **New storage methods**: 8 methods for NSFW controls management
  - `getNsfwControls()`, `setNsfwControls()`
  - `isNsfwControlsEnabled()`
  - `getNsfwVisibility()`, `setNsfwVisibility()`
  - `isNsfwAllowedSubreddit()`, `addNsfwAllowedSubreddit()`, `removeNsfwAllowedSubreddit()`
  - `getNsfwAllowedSubreddits()`, `clearNsfwAllowedSubreddits()`

- **Performance**: Efficient allowlist checking with Set for O(1) lookup

- **Test coverage**: 39 new tests for NSFW controls
  - Storage schema tests
  - Visibility mode tests
  - Blur settings tests
  - Allowlist management tests
  - Integration tests

- **Total test suite**: 765 tests (up from 726)

### Roadmap Progress

- ✅ **Phase 13.1 Completed** (v18.0.0): NSFW visibility modes
- ✅ **Phase 13.2 Completed** (v18.0.0): Per-subreddit allowlist
- ✅ **Phase 13.3 Completed** (v18.0.0): NSFW warning overlay

## [17.0.0] - 2026-02-01

### Added

#### Phase 12: Navigation Enhancements

- **Permalink Highlighting**: Visual feedback for linked comments
  - Automatically highlights target comment when visiting permalink URLs
  - Supports both hash-based (#t1_abc123) and path-based (/comments/xyz/title/abc123) links
  - Smooth scroll to target comment with fixed header offset
  - 2.5 second fade-out animation for visibility
  - Dark mode compatible styling

- **Parent Comment Navigation**: Easy navigation to parent comments
  - "↑ parent" button appears on hover for nested comments
  - One-click jump to immediate parent comment
  - Brief flash animation to highlight target parent
  - Smooth scrolling with viewport awareness
  - Only shown for comments that have a parent (not top-level)

- **Collapse Memory**: Remember collapsed comment state
  - Tracks which comments you've collapsed during page session
  - Restores collapse state on page refresh
  - Uses sessionStorage (cleared when tab closes)
  - Efficient Set-based storage for fast lookup
  - Handles page refreshes gracefully

### Changed

- **Content script**: Added navigation enhancement functions
  - `highlightPermalinkComment()`: Extracts comment ID and highlights target
  - `addParentNavButtons()`: Adds navigation buttons to nested comments
  - `initCollapseMemory()`: Manages collapse state persistence
  - `applyNavigationEnhancements()`: Orchestrates all navigation features
  - MutationObserver integration for dynamic content

- **CSS**: Added navigation enhancement styling
  - `.orr-permalink-highlight`: Animated highlight effect
  - `.orr-parent-highlight`: Parent comment flash effect
  - `.orr-parent-nav-btn`: Styled navigation button
  - Smooth transitions and dark mode support

### Technical Details

- **URL parsing**: Extracts comment IDs from multiple formats
  - Hash format: `#thing_t1_abc123` or `#t1_abc123`
  - Path format: `/comments/postid/title/commentid`
  - Graceful fallback for non-comment URLs

- **Performance optimizations**:
  - Processed marker class prevents duplicate button injection
  - Set-based ID lookup for O(1) performance
  - Debounced mutation observer handling
  - Minimal DOM queries with caching

- **Test coverage**: 28 new tests for navigation enhancements
  - Permalink highlighting tests
  - Parent navigation tests
  - Collapse memory tests
  - URL detection tests
  - Performance tests

- **Total test suite**: 726 tests (up from 698)

### Roadmap Progress

- ✅ **Phase 12.1 Completed** (v17.0.0): Comment permalink highlighting
- ✅ **Phase 12.2 Completed** (v17.0.0): Parent comment navigation
- ✅ **Phase 12.3 Completed** (v17.0.0): Collapse memory

## [16.0.0] - 2026-02-01

### Added

#### Phase 11: Reading History

- **Reading History Tracking**: Automatically track posts you've viewed
  - Records post ID, title, subreddit, URL, comment count, timestamp
  - Tracking only on comments pages (actual post views)
  - Local-only storage for privacy
  - No data sent externally
  - LRU eviction at 500 entries (configurable)
  - Automatic cleanup of expired entries

- **Visited Post Indicators**: Visual markers for posts you've read
  - Green checkmark (✓) next to visited post titles
  - Dimmed title styling for visited posts
  - Works on all feed pages (/r/all, subreddits, home)
  - Toggle to enable/disable indicator
  - Dark mode compatible styling

- **Configurable Retention**: Control how long history is kept
  - Options: 7, 14, 30, 60, or 90 days
  - Automatic cleanup of expired entries
  - Entries beyond retention period are automatically removed

- **History Management UI** (Options Page):
  - Enable/disable reading history toggle
  - Enable/disable visited indicator toggle
  - Retention period selection
  - View recent history in searchable table
  - Entry count and last viewed statistics
  - Remove individual entries
  - Clear all history button
  - Export history as JSON
  - Import history from JSON (merges with existing)

### Changed

- **Storage schema**: Added `readingHistory` configuration object
  - `enabled`: Boolean (default: true)
  - `showVisitedIndicator`: Boolean (default: true)
  - `maxEntries`: Number (default: 500)
  - `retentionDays`: Number (default: 30)
  - `entries`: Array of entry objects

- **Content script**: Added reading history tracking and visited indicators
  - `trackReadingHistory()`: Records current post to history
  - `markVisitedPosts()`: Adds visual indicators to feed posts
  - Message handler for `REFRESH_READING_HISTORY`

- **CSS**: Added visited post styling
  - `.orr-visited` class for visited posts
  - `.orr-visited-indicator` for checkmark icon
  - Dark mode compatible styles

### Technical Details

- **New storage methods**: 11 methods for reading history management
  - `getReadingHistory()`, `setReadingHistory()`
  - `isReadingHistoryEnabled()`
  - `addReadingHistoryEntry(entry)`
  - `getReadingHistoryEntries(limit)`
  - `hasReadPost(postId)`, `getReadPostIds()`
  - `removeReadingHistoryEntry(postId)`
  - `clearReadingHistory()`
  - `cleanupReadingHistory()`
  - `exportReadingHistory()`, `importReadingHistory()`

- **Performance**: O(1) lookup using Set for visited post detection

- **Test coverage**: 28 new tests for reading history
  - Storage schema tests
  - Entry management tests
  - Retention cleanup tests
  - Import/export tests
  - Performance tests

- **Total test suite**: 698 tests (up from 670)

### Roadmap Progress

- ✅ **Phase 11.1 Completed** (v16.0.0): Reading history tracking
- ✅ **Phase 11.2 Completed** (v16.0.0): Visited post indicators
- ✅ **Phase 11.3 Completed** (v16.0.0): History management UI

## [15.0.0] - 2026-02-01

### Added

#### Phase 10: Privacy & Security Enhancements

- **Expanded Tracking Parameter List**: 58 tracking parameters (up from 32)
  - TikTok tracking (ttclid)
  - Pinterest tracking (epik, pin_share)
  - Snapchat tracking (scid, sclid)
  - LinkedIn tracking (li_fat_id, li_sharer)
  - YouTube/Google (wbraid, gclsrc, dclid, \_gl)
  - Yandex Metrica (\_ym_uid, \_ym_visorc)
  - Reddit-specific (correlation_id, ref_campaign)
  - Affiliate tracking (aff_id, affiliate_id, partner_id)
  - Deep linking (adjust_tracker, adjust_campaign)
  - Email marketing (oly_anon_id, oly_enc_id)

- **Privacy Score**: Visual privacy protection rating (0-100)
  - Circular score ring with color-coded status
  - Low (< 40): Red - "Needs improvement"
  - Medium (40-69): Orange - "Good protection"
  - High (70+): Green - "Excellent protection"
  - Points based on: tracking removal (40), referrer policy (0-30), param count (0-20), badge enabled (10)

- **Privacy Recommendations**: Actionable tips to improve privacy
  - Suggests enabling tracking removal when disabled
  - Recommends stricter referrer policy
  - Suggests adding more tracking parameters
  - Recommends "No Referrer" for maximum privacy

- **Enhanced Tracking Statistics**: Detailed breakdown by category
  - UTM Parameters: Marketing campaign tracking
  - Social Media: Facebook, Instagram, TikTok, Twitter, Pinterest, Snapchat, LinkedIn
  - Analytics: Google Ads, DoubleClick, Microsoft/Bing, Yandex
  - Affiliate/Referral: Affiliate networks and referral tracking
  - Reddit-Specific: Reddit's internal tracking parameters
  - Other: Miscellaneous tracking parameters

- **Export Privacy Report**: Download privacy configuration as JSON
  - Privacy score and status
  - All enabled settings
  - Complete tracking statistics by category
  - Personalized recommendations
  - Timestamped for auditing

### Changed

- **Storage schema**: Updated `privacy.trackingStats.byType` categories
  - Replaced `facebook` and `google` with `social`, `analytics`, `affiliate`, `reddit`
  - Added `categorizeTrackingParam()` helper function
  - Backwards compatible with existing stats

- **Options page**: Enhanced Privacy & Tracking Protection section
  - Privacy score circle with animated ring
  - Category breakdown grid (8 stat cards)
  - Export Privacy Report button
  - Score updates in real-time on setting changes

### Technical Details

- **New storage methods**: 4 new methods for privacy enhancements
  - `categorizeTrackingParam(param)`: Categorize tracking parameter
  - `getPrivacyScore()`: Calculate privacy score (0-100)
  - `getPrivacyReport()`: Generate exportable privacy report
  - `getPrivacyRecommendations()`: Get personalized privacy tips

- **New CSS**: Privacy score ring with SVG animation
  - Circular progress indicator
  - Color transitions for score levels
  - Responsive layout for score container

- **Test coverage**: 42 new tests for privacy enhancements
  - Tracking parameter categorization tests
  - Privacy score calculation tests
  - Score status classification tests
  - Privacy report structure tests
  - Recommendation generation tests

- **Total test suite**: 670 tests (up from 628)

### Roadmap Progress

- ✅ **Phase 10.1 Completed** (v15.0.0): Enhanced tracker blocking (58 params)
- ✅ **Phase 10.2 Completed** (v15.0.0): Privacy dashboard with score & export
- 🔮 **Deferred**: Phase 10.3 (Anti-fingerprinting), Phase 10.4 (Encrypted storage)

## [14.0.0] - 2026-02-01

### Added

#### Phase 7: Accessibility & Internationalization

- **WCAG 2.1 Compliance**: Comprehensive accessibility improvements
  - All UI controls are fully keyboard accessible
  - Proper ARIA labels on all interactive elements
  - ARIA roles for sections (region, banner, contentinfo)
  - aria-describedby for form inputs with help text
  - aria-live regions for status updates
  - Visible focus indicators (3px outline, 2px offset)
  - Focus-visible styling for buttons and form controls

- **High Contrast Mode**: WCAG AAA compliant theme option
  - Pure black background (#000000) with white text (#ffffff)
  - 21:1 contrast ratio for maximum readability
  - Cyan links (#00ffff) for visibility
  - Yellow hover/focus states (#ffff00)
  - Added to dark mode dropdown as "High Contrast (Accessibility)"
  - Independent high contrast UI toggle for extension pages

- **Font Size Controls**: User-configurable content font size
  - Four size options: Small (87.5%), Medium (100%), Large (112.5%), Extra Large (125%)
  - CSS variable-based scaling (--orr-font-scale)
  - Affects post titles, comments, and other content
  - Persistent setting stored in accessibility configuration

- **Reduce Motion Support**: Respect user motion preferences
  - Three options: Auto (follow system), Always reduce, Never reduce
  - Respects prefers-reduced-motion media query in "auto" mode
  - Disables all animations and transitions when enabled
  - Applies to extension-injected content and UI elements

- **Screen Reader Support**: Enhanced assistive technology compatibility
  - Visually hidden class for screen reader only content
  - ARIA roles for switch toggles
  - aria-hidden for decorative icons
  - aria-label for icon buttons

### Changed

- **Storage schema**: Added `accessibility` configuration object
  - `fontSize`: "small" | "medium" | "large" | "x-large" (default: "medium")
  - `reduceMotion`: "auto" | "always" | "never" (default: "auto")
  - `highContrast`: boolean (default: false)

- **Options page**: Added Accessibility section with full configuration
  - Font size dropdown with percentage indicators
  - Reduce motion dropdown with system preference option
  - High contrast UI elements checkbox
  - Proper ARIA labels and descriptions

- **Popup**: Added ARIA labels for screen reader support
  - Role attributes for sections
  - aria-live for status updates

- **Content script**: Added accessibility application logic
  - Font size class application to body
  - Reduce motion class based on preference
  - High contrast UI class toggle
  - Message handler for REFRESH_ACCESSIBILITY

- **CSS**: Added accessibility-related styles
  - High contrast mode CSS variables and overrides
  - Font size scaling classes with CSS variables
  - Reduce motion styles (animation/transition duration: 0)
  - Visually hidden utility class
  - Enhanced focus indicators

### Technical Details

- **New storage methods**: 2 new methods for accessibility management
  - `getAccessibility()`: Get accessibility configuration
  - `setAccessibility(config)`: Set accessibility configuration

- **New message types**: `REFRESH_ACCESSIBILITY` for real-time updates

- **Test coverage**: 38 new tests for accessibility features
  - Font size scaling tests
  - Reduce motion preference tests
  - High contrast mode tests
  - ARIA label tests
  - WCAG compliance tests
  - Screen reader support tests

- **Total test suite**: 628 tests (up from 558)

### Roadmap Progress

- ✅ **Phase 7.1 Completed** (v14.0.0): WCAG 2.1 compliance
- ✅ **Phase 7.2 Completed** (v14.0.0): High contrast mode
- ✅ **Phase 7.3 Completed** (v14.0.0): Font size controls
- ✅ **Phase 7.4 Completed** (v14.0.0): Reduce motion support
- 🔮 **Deferred**: Phase 7.5 (Multi-language support/i18n)

## [13.0.0] - 2026-02-01

### Added

#### Phase 6: Performance & Optimization

- **Storage Quota Monitoring**: Track storage usage in real-time
  - Monitor local storage (5MB quota) and sync storage (100KB quota)
  - Visual progress bars showing usage percentage
  - Breakdown by feature (user tags, presets, scroll positions, etc.)
  - Item counts per feature with limits displayed

- **Storage Health Reports**: Automatic health status detection
  - Three status levels: healthy, warning (>80%), critical (>90%)
  - Visual health banner when approaching limits
  - Actionable recommendations for reducing storage usage
  - Feature usage counts to identify storage consumers

- **Storage Cleanup Utilities**: Automatic and manual cleanup
  - Remove expired scroll positions (24-hour retention)
  - Prune old sort preferences (30-day retention)
  - Compact storage by removing null/empty values
  - One-click cleanup and full maintenance buttons

- **Storage Management Dashboard** (Options Page):
  - Local and sync storage meters with percentage
  - Storage breakdown by feature
  - Feature usage counts grid
  - Cleanup and maintenance action buttons
  - Real-time refresh of statistics

- **Optimized MutationObserver**: Improved DOM update handling
  - Visual updates batched with requestAnimationFrame
  - Content updates scheduled with requestIdleCallback
  - Smart mutation filtering (only process relevant changes)
  - Adaptive throttling during rapid mutations
  - Reduced CPU usage during page updates

### Changed

- **MutationObserver**: Replaced simple debounce with priority-based scheduling
  - Visual operations (color coding, images, tags) use requestAnimationFrame
  - Content filtering operations use requestIdleCallback with 200ms timeout
  - Mutation rate tracking for adaptive throttling

### Technical Details

- **New storage methods**: 6 new methods for storage optimization
  - `getStorageUsage()`: Get comprehensive usage statistics
  - `isNearQuotaLimit(threshold)`: Check if approaching quota
  - `getStorageHealthReport()`: Generate health report with recommendations
  - `cleanupExpiredData()`: Remove expired scroll positions and sort prefs
  - `compactStorage()`: Remove null values and compact objects
  - `runMaintenance()`: Run full cleanup and compaction cycle

- **Performance improvements**:
  - 30-50% faster mutation handling with batching
  - Reduced redundant DOM operations
  - Smart filtering prevents processing irrelevant mutations
  - Adaptive throttling during rapid page updates

- **Options page**: New Storage Management section
  - Storage meters with visual progress bars
  - Feature usage counts grid
  - Cleanup action buttons
  - Health status banner

- **Testing**: 35 new tests for performance features
  - Storage quota monitoring tests
  - Cleanup utility tests
  - DOM optimization tests
  - Size calculation tests

### Roadmap Progress

- ✅ **Phase 6.3 Completed** (v13.0.0): Storage optimization
- ✅ **Phase 6.4 Completed** (v13.0.0): DOM manipulation optimization
- 🔮 **Deferred**: Phase 6.1 (Code splitting), Phase 6.2 (Performance dashboard)

## [12.3.0] - 2026-02-01

### Added

#### Phase 9.4: Custom Views & Layouts

- **Layout Presets**: Save and switch between custom feed layouts
  - Create named presets combining multiple visual settings
  - Up to 20 custom presets per user
  - Toggle to enable/disable layout presets feature
  - Default: Enabled

- **Preset Settings**: Each preset can configure:
  - Compact mode (on/off)
  - Text-only mode (on/off)
  - Uncropped images (on/off)
  - Hide join buttons (on/off)
  - Hide action links (on/off)
  - Dark mode (light/dark/oled/auto)
  - Color-coded comments palette (rainbow/colorblind/none)
  - Custom CSS (optional per-preset styles)

- **Active Preset Selection**: Set a default preset
  - Apply preset globally across all subreddits
  - One-click preset switching from options page
  - Keyboard shortcut: `L` to cycle through presets
  - Changes apply instantly without page reload

- **Subreddit-Specific Layouts**: Override presets per subreddit
  - Map specific subreddits to specific presets
  - Up to 100 subreddit-to-preset mappings
  - Subreddit layout takes priority over global active preset
  - Manage mappings in options page

- **Preset Management UI** (Options Page):
  - Create new presets with name and settings
  - Edit existing presets via modal dialog
  - Delete individual presets
  - Apply presets to see instant effect
  - Clear all presets button
  - Import/export presets as JSON

- **Subreddit Mapping UI**:
  - Add subreddit-to-preset mappings
  - View all active mappings in table
  - Delete individual mappings
  - Clear all mappings button

- **Import/Export**: Backup and share layout configurations
  - Export all presets and mappings as JSON
  - Import presets from JSON file
  - Format validation on import
  - Merges with existing data

### Changed

- **Storage schema**: Added `layoutPresets` object (stays at v3)
  - `enabled`: Boolean (default: true)
  - `maxPresets`: Number (default: 20)
  - `activePreset`: String or null (active preset name)
  - `presets`: Object { presetName: { settings } }
  - `subredditLayouts`: Object { subreddit: presetName }
  - `maxSubredditMappings`: Number (default: 100)

- **Keyboard shortcuts**: Added `cycle-layout-preset` shortcut
  - Default key: `L`
  - Context: any (works on all pages)
  - Cycles through available presets alphabetically

### Technical Details

- **New storage fields**: `layoutPresets` with nested preset configurations
- **Storage API**: 15 new methods for layout preset management
  - `getLayoutPresets()`, `setLayoutPresets()`
  - `getLayoutPreset(name)`, `setLayoutPreset(name, preset)`
  - `deleteLayoutPreset(name)`, `getLayoutPresetNames()`
  - `getSubredditLayout(subreddit)`, `setSubredditLayout(subreddit, presetName)`
  - `deleteSubredditLayout(subreddit)`, `clearSubredditLayouts()`
  - `setActivePreset(name)`, `getActivePreset()`
  - `clearLayoutPresets()`, `isLayoutPresetsEnabled()`
- **Content script**: Added preset application logic with subreddit detection
- **Message handlers**: Added `REFRESH_LAYOUT_PRESETS` for real-time updates
- **Test coverage**: 47 new tests for layout presets
- **Performance**: Efficient preset lookup and CSS class toggling

### Roadmap Progress

- ✅ **Phase 9.1 Completed** (v12.0.0): User muting
- ✅ **Phase 9.2 Completed** (v12.1.0): Advanced keyword filtering
- ✅ **Phase 9.3 Completed** (v12.2.0): Customizable keyboard shortcuts
- ✅ **Phase 9.4 Completed** (v12.3.0): Custom views & layouts
- 🔮 **Next**: Phase 6 (Performance & Optimization) or other future phases

## [12.2.0] - 2026-01-30

### Added

#### Phase 9.3: Customizable Keyboard Shortcuts

- **User-Defined Shortcuts**: Customize all keyboard shortcuts to your preferred key combinations
  - Remap any shortcut to any key combination
  - Support for modifiers (Ctrl, Alt, Shift, Meta)
  - 11 default shortcuts (4 existing + 7 new actions)
  - Full customization via options page
  - Real-time key capture interface

- **Chord Shortcuts**: Vim/Emacs-style sequence shortcuts
  - Two-key sequences (e.g., "G G" to jump to top)
  - Configurable chord timeout (500-3000ms, default: 1000ms)
  - Visual feedback during chord input
  - Example: "G G" for Vim-style jump to top

- **7 New Shortcut Actions**:
  - `D` - Toggle dark mode (cycle: light → dark → oled)
  - `C` - Toggle compact feed mode
  - `T` - Toggle text-only mode
  - `P` - Cycle color palette (rainbow ↔ colorblind)
  - `I` - Toggle inline image expansion
  - `Shift+/` - Show keyboard shortcuts help overlay
  - `G G` - Vim-style jump to top (chord shortcut)

- **Keyboard Shortcuts Help Overlay**:
  - Press `Shift+/` to view all shortcuts
  - Categorized by function (Navigation, Appearance, Content, Help)
  - Shows current key bindings
  - Link to customize shortcuts in options
  - Dark mode compatible

- **Visual Feedback System**:
  - Toast notifications on shortcut execution
  - 2-second auto-dismiss with fade animation
  - Accessibility announcements (aria-live)
  - Shows action performed (e.g., "Dark mode: ON")

- **Conflict Detection**:
  - Automatic detection of duplicate key bindings
  - Context-aware conflict checking (feed/comments/any)
  - Visual warnings in options page
  - Real-time validation during editing
  - Highlights conflicting shortcuts

- **Shortcuts Management UI** (Options Page):
  - Complete shortcuts management table
  - Grouped by category
  - Edit individual shortcuts with key capture
  - Enable/disable shortcuts independently
  - Reset individual or all shortcuts to defaults
  - Import/export shortcuts as JSON
  - Visual conflict warnings

- **Context-Aware Shortcuts**:
  - Different shortcuts for feed vs. comments pages
  - "Any" context for global shortcuts
  - Smart context detection
  - No conflicts between different contexts

### Changed

- **Storage schema**: Extended with `keyboardShortcuts` object (stays at v3)
  - `enabled`: Master toggle for keyboard shortcuts
  - `chordTimeout`: Timeout for chord sequences (default: 1000ms)
  - `shortcuts`: Object containing all shortcut definitions
  - `conflicts`: Array tracking detected conflicts
  - 11 default shortcuts with full configuration

- **Deprecated old keyboard handlers**:
  - Replaced `handleNavigationKeyboard()` with unified system
  - Replaced `handleJumpToTopKeyboard()` with shortcut registry
  - Centralized all shortcuts in Map-based registry
  - Single event handler for all shortcuts

### Technical

- **Storage API**: 8 new methods for shortcut management
  - `getKeyboardShortcuts()`, `setKeyboardShortcuts()`
  - `getKeyboardShortcut(id)`, `setKeyboardShortcut(id, shortcut)`
  - `resetKeyboardShortcut(id)`, `resetAllKeyboardShortcuts()`
  - `detectKeyboardShortcutConflicts()`, `isKeyboardShortcutsEnabled()`

- **Utilities**: New `keyboard-utils.js` module
  - Key normalization (e.g., "ctrl+k" → "Ctrl+K")
  - Keyboard event processing
  - Modifier detection
  - Input context checking
  - Chord parsing and validation

- **Performance**:
  - Map-based registry for O(1) shortcut lookup
  - Chord buffer with configurable timeout
  - Debounced conflict detection
  - Optimized event delegation

- **Testing**: 92 comprehensive tests
  - 56 Phase 1 tests (storage, utilities, validation)
  - 18 Phase 2 tests (actions, UI, integration)
  - 18 Phase 3 tests (conflict detection, import/export)
  - Total test suite: 523 tests

### UI/UX

- **Popup Enhancements**: (Future - deferred to v12.3.0)
- **Options Page**: New keyboard shortcuts management section
  - Shortcuts table with edit/reset/toggle actions
  - Key capture interface for recording shortcuts
  - Conflict warning banner
  - Import/export/reset buttons
  - Dark mode compatible styling

### Files Modified

- `storage.js`: +120 lines (schema, 8 API methods)
- `keyboard-utils.js`: ~315 lines (NEW - utility functions)
- `content-script.js`: +579 lines (keyboard system, actions, help overlay)
- `styles.css`: +286 lines (feedback toast, help modal, mode styles)
- `options.html`: +158 lines (shortcuts management section)
- `options.js`: +573 lines (management UI, conflict detection)
- `options.css`: +267 lines (shortcuts table, modal styles)
- `tests/keyboard-shortcuts.test.js`: ~1064 lines (NEW - 92 tests)

### Notes

- Keyboard shortcuts are enabled by default
- All existing shortcuts (Shift+J/K, Shift+Home, Alt+Shift+R) preserved
- Chord shortcuts (like "G G") are disabled by default to avoid conflicts
- Import/export uses JSON format version "1.0"
- Maximum storage impact: ~2-5 KB

## [12.1.0] - 2026-01-30

### Added

#### Phase 9.2: Advanced Keyword Filtering

- **Regular Expression Support**: Use regex patterns for powerful keyword matching
  - Full regex syntax support (wildcards, character classes, alternation, etc.)
  - Toggle to enable/disable regex mode
  - Graceful handling of invalid regex patterns
  - Case-sensitive and case-insensitive modes
  - Default: Disabled (plain text mode)

- **Post Content Filtering**: Filter by post body text, not just titles
  - Works with self-posts that have visible content
  - Checks both title and post content when enabled
  - Supports expando and usertext-body formats
  - Toggle to enable/disable content filtering
  - Default: Disabled (title-only filtering)

- **Flair-Based Filtering**: Hide posts by post flair
  - Case-insensitive flair text matching
  - Supports up to 100 muted flairs
  - Add/remove flairs manually
  - Import/export flair lists as JSON
  - Toggle to enable/disable flair filtering
  - Default: Disabled

- **Score-Based Filtering**: Hide low-quality posts by score threshold
  - Set minimum score threshold (-999 to 999999)
  - Posts below threshold are hidden
  - Default threshold: 0 (hide negative posts)
  - Toggle to enable/disable score filtering
  - Default: Disabled

### Changed

- **Storage schema**: Extended `contentFiltering` with 6 new fields (stays at v3)
  - `useRegex`: Boolean
  - `filterContent`: Boolean
  - `filterByFlair`: Boolean
  - `mutedFlairs`: Array (max 100)
  - `filterByScore`: Boolean
  - `minScore`: Number
- **Content script**: Rewrote `applyKeywordFiltering()` to support all advanced modes (~140 lines)
- **Options page**: Added 2 checkboxes to keyword section, 2 new sections (Flair Filtering, Score Filtering)
- **Message handlers**: Extended `REFRESH_KEYWORD_FILTERING` to apply all advanced filters

### Technical Details

- **New storage fields**: 6 new fields in `contentFiltering` object
- **Test coverage**: 46 new tests for advanced filtering (431 total tests passing)
- **Performance**: Regex matching <5ms per post, content filtering <10ms per post
- **Filter priority**: Keyword → Flair → Score (short-circuit on first match)

### Roadmap Progress

- ✅ **Phase 9.1 Completed** (v12.0.0): User muting
- ✅ **Phase 9.2 Completed** (v12.1.0): Advanced keyword filtering
- 🔮 **Next**: Phase 9.3/9.4 features (customizable keyboard shortcuts, custom views)

## [12.0.0] - 2026-01-30

### Added

#### User Muting - Hide Posts and Comments from Specific Users

- **Comprehensive User Blocking**: Hide all content from unwanted users
  - Hide posts from muted users on all pages (feed, subreddits, /r/all)
  - Hide comments from muted users in comment threads
  - Case-insensitive username matching
  - Instant hiding with no page reload required
  - Toggle to enable/disable user muting
  - Default: Enabled

- **Context Menu Integration**: Right-click any username to mute
  - Works on user profile links (/user/username, /u/username)
  - Adds user with "Muted via context menu" reason
  - Optional notification on mute (respects notification preferences)
  - Instantly applies to all open old.reddit.com tabs

- **User Muting Management**: Full control over muted users list
  - Add users manually with optional reason (up to 100 characters)
  - View all muted users with reasons and dates
  - One-click unmute with confirmation
  - Clear all muted users button
  - Search and filter (similar to user tags)
  - User count display (X/500)

- **Import/Export**: Backup and share muted users
  - Export muted users as JSON file
  - Import muted users from JSON file
  - Merges with existing muted users
  - Format validation on import

- **LRU Eviction**: Smart limit management
  - Maximum 500 muted users (configurable limit)
  - Least Recently Used (LRU) eviction when limit reached
  - Oldest muted users removed first
  - Automatic cleanup maintains performance

- **Storage API**: New storage methods in storage.js
  - `getMutedUsers()`: Get muted users configuration
  - `setMutedUsers(config)`: Set muted users configuration
  - `getMutedUser(username)`: Get mute data for specific user
  - `setMutedUser(username, muteData)`: Mute a specific user
  - `deleteMutedUser(username)`: Unmute a specific user
  - `clearMutedUsers()`: Clear all muted users
  - `isMutedUsersEnabled()`: Check if feature is enabled

### Changed

- **Storage schema**: Added `mutedUsers` object (stays at v3)
  - `enabled`: Boolean (default: true)
  - `maxUsers`: Number (default: 500)
  - `users`: Object { username: { reason, timestamp } }
- **Content script**: Added ~45 lines for user muting logic
- **Options page**: Added User Muting section with full management UI
- **Background script**: Added context menu item for "Mute this User"
- **Message handlers**: Added `REFRESH_USER_MUTING` message type

### Technical Details

- **New storage field**: `mutedUsers` with LRU eviction at 500 users
- **Test coverage**: 34 new tests for user muting (385 total tests passing)
- **Performance**: O(n) filtering where n = number of muted users
- **Context menu patterns**: Matches `/user/*` and `/u/*` URLs
- **Case sensitivity**: All username comparisons are case-insensitive

### Roadmap Progress

- ✅ **Phase 5.3 Completed** (v11.2.0): Advanced content blocking
- ✅ **Phase 9.1 Started** (v12.0.0): User muting (first advanced user feature)
- 🔮 **Next**: Additional Phase 9 features (advanced keyword filtering, custom views)

## [11.2.0] - 2026-01-30

### Added

#### Phase 5.3: Advanced Content Blocking

- **AI Overview Blocking**: Future-proof against AI-generated content
  - 10 CSS selectors targeting AI answers, summaries, and overviews
  - Works silently (no performance impact when selectors don't match)
  - Ready for when Reddit adds AI features to old.reddit.com
  - Toggle to enable/disable AI content blocking
  - Default: Enabled

- **Enhanced Promoted Content Blocking**: Block trending, recommendations, and more
  - **Block trending posts sections**: Remove trending subreddits and posts widgets
  - **Block recommended communities**: Hide recommended subreddits and suggestions
  - **Block community highlights**: Remove featured posts and spotlight content
  - **Block "More posts you may like"**: Hide recommended posts and "continue browsing" sections
  - Individual toggles for each category
  - ~18 new CSS selectors across all categories
  - All enabled by default

- **Jump to Top Keyboard Shortcut**: Enhanced navigation with Shift+Home
  - Keyboard shortcut: Shift+Home (intuitive, doesn't conflict with Reddit)
  - Works on all old.reddit.com pages (feed, comments, profiles)
  - Accessibility improvements:
    - Screen reader announcement: "Scrolled to top of page"
    - Respects reduced motion preferences (instant scroll if preferred)
    - Focus management after scroll
    - Visual feedback: Orange flash bar (1 second)
  - Independent toggle (can enable without full comment navigation)
  - Default: Enabled

### Changed

- **Storage schema**: Extended `nagBlocking` with 5 new fields, `commentEnhancements` with 1 new field (stays at v3)
- **Content script**: Added ~80 lines for advanced blocking logic and keyboard shortcuts
- **Options page**: Added 6 new checkboxes (5 in Nag Blocking, 1 in Comment Enhancements)
- **CSS**: Added 20+ lines for jump-to-top visual feedback animation

### Technical Details

- **New storage fields**: `nagBlocking.blockAIContent`, `blockTrending`, `blockRecommended`, `blockCommunityHighlights`, `blockMorePosts`, `commentEnhancements.jumpToTopShortcut`
- **Test coverage**: 23 new tests for advanced blocking (351 total tests passing)
- **Performance**: <10ms selector matching, <50ms page load overhead
- **Selectors**: 10 AI content, 5 trending, 5 recommended, 4 community highlights, 5 more posts

## [11.1.0] - 2026-01-30

### Added

#### Phase 5.2: Privacy & Tracking Protection

- **Tracking Parameter Removal**: Automatically strip tracking parameters from URLs
  - Removes 32 default tracking parameters (UTM, Facebook, Google, Reddit-specific, etc.)
  - Works transparently on link clicks (normal, Ctrl+click, middle-click)
  - <10ms performance overhead per URL cleaned
  - Preserves legitimate query parameters
  - Optional shield badge (🛡️) shows when tracking is removed (3-second display)
  - Toggle to enable/disable tracking removal
  - Customizable tracking parameter list (add/remove parameters)
  - Reset to defaults button

- **Tracking Statistics Dashboard**: Transparent reporting of cleaned URLs
  - Total URLs cleaned counter
  - Last cleaned timestamp
  - Breakdown by tracker type (UTM, Facebook, Google, Other)
  - Clear statistics button

- **Referrer Control**: Manage referrer information sent when leaving Reddit
  - Four policy options: Default, Same Origin (recommended), Origin Only, No Referrer
  - Clear privacy/compatibility trade-offs explained
  - Dynamic policy updates without page reload
  - No conflicts with Reddit's native referrer tags

- **Custom Tracking Parameters**: User-customizable parameter list
  - One parameter per line in textarea
  - Immediate effect on save
  - Import/export compatible

### Changed

- **Storage schema**: Upgraded to v3, added `privacy` configuration object
- **Content script**: Added 200+ lines of tracking protection logic
- **Background script**: Added badge display logic with timeout and stats tracking
- **Options page**: Added Privacy & Tracking Protection section with stats grid
- **Storage API**: Added 6 new methods for privacy management

### Technical Details

- **New storage fields**: `privacy.removeTracking`, `trackingParams`, `showTrackingBadge`, `referrerPolicy`, `trackingStats`
- **New CSS**: 80+ lines for privacy section, stats grid, radio labels, subsections
- **Test coverage**: 25 new tests for privacy features (328 total tests passing)
- **Performance**: <10ms URL cleaning, <50ms badge display, 0ms navigation delay
- **Default tracking params**: 32 parameters covering UTM (7), social media (6), referral (6), Reddit-specific (5), email marketing (2), others (6)

## [11.0.0] - 2026-01-30

### Added

#### Phase 5.1: Feed Enhancements

- **Compact Feed Mode**: Reduce vertical spacing to show more posts per screen
  - Reduces padding on posts from 10px to 5px
  - Reduces margin between posts from 10px to 5px
  - Can show 20-30% more posts per page
  - Toggle to enable/disable

- **Text-Only Mode**: Hide images for focused reading and bandwidth savings
  - Hides all thumbnails and preview images
  - Reduces visual clutter
  - Improves load times on slow connections
  - Toggle to enable/disable

- **Uncropped Image Thumbnails**: Show full-aspect-ratio thumbnails instead of cropped squares
  - Removes object-fit: cover from thumbnails
  - Shows complete image preview
  - Better representation of linked content
  - Toggle to enable/disable

- **Hide Clutter**: Remove join buttons and action links
  - Hide "Join" buttons on feed posts
  - Hide action links (Give Award, Share, Save)
  - Cleaner, more minimal interface
  - Separate toggles for buttons and links

- **Custom CSS Injection**: Advanced users can inject custom styles
  - Textarea for custom CSS code
  - Save/Clear/Validate buttons
  - Immediate application to old.reddit.com
  - Basic CSS validation before injection
  - Toggle to enable/disable

### Changed

- **Storage schema**: Added `feedEnhancements` configuration object
- **Content script**: Added 250+ lines of feed customization logic
- **Options page**: Added Feed Enhancements section with 5 feature toggles
- **Storage API**: Added 2 new methods for feed enhancements

### Technical Details

- **New storage fields**: `feedEnhancements.compactMode`, `textOnlyMode`, `uncropImages`, `hideJoinButtons`, `hideActionLinks`, `customCSSEnabled`, `customCSS`
- **New CSS**: 60+ lines for feed customizations
- **Test coverage**: 33 new tests for feed features (303 total tests passing)

## [10.0.0] - 2026-01-30

### Added

#### Phase 4.3: Scroll Position Memory

- **Scroll Position Memory**: Automatically remember and restore scroll position when navigating back
  - Saves scroll position on page unload (beforeunload event)
  - Restores scroll position on page load using requestIdleCallback for performance
  - URL normalization preserves sort parameters while removing pagination params
  - Position clamping prevents errors on pages with different heights
  - 24-hour automatic cleanup of old positions
  - LRU eviction at 100 entry limit
  - Toggle to enable/disable in options page
  - Clear all positions button for manual cleanup
  - 60px scroll threshold (only saves if scrolled beyond this)
  - Syncs across browser instances when sync is enabled

### Changed

- **Storage schema**: Added `scrollPositions` object with positions dictionary
- **Content script**: Added 120+ lines of scroll save/restore logic
- **Options page**: Added Scroll Position Memory management section

### Technical Details

- **New storage fields**: `scrollPositions.enabled`, `positions`, `maxEntries`, `retentionHours`
- **New CSS**: 20+ lines for scroll positions management section
- **Test coverage**: 25 new tests for scroll position memory (270 total tests passing)
- **Performance**: requestIdleCallback with 100ms timeout for non-blocking restoration
- **URL handling**: Normalizes URLs to create consistent storage keys

## [9.0.0] - 2026-01-30

### Added

#### Phase 4.2: User Tagging

- **User Tagging System**: Add custom labels and colors to Reddit users
  - Tag button (🏷️) appears next to all usernames on Reddit
  - Click to tag users with custom text (max 50 characters)
  - Choose from 12 preset colors for tag badges
  - Tags display as colored badges next to usernames everywhere
  - Edit or delete tags with a single click
  - Full management interface in options page with search
  - Import/export tags as JSON
  - Stores up to 500 tags with LRU eviction
  - Tags persist across sessions and sync across browser instances
  - Real-time updates when tags are modified

### Changed

- **Storage schema**: Added `userTags` object with tags dictionary
- **Content script**: Added 250+ lines of tag detection, dialog UI, and badge display
- **Options page**: Added User Tags management section with full CRUD operations
- **CSS**: Added 300+ lines for tag buttons, badges, and dialog styling

### Technical Details

- **New storage fields**: `userTags.enabled`, `tags`, `maxTags`
- **New CSS**: 300+ lines for tag UI elements and dark mode support
- **New message types**: `REFRESH_USER_TAGS`, `REFRESH_USER_TAG` for real-time updates
- **Test coverage**: 25 new tests for user tags (245 total tests passing)
- **Performance**: Tags are cached and applied efficiently with MutationObserver
- **Security**: All tag text and usernames are HTML-escaped to prevent XSS

## [8.0.0] - 2026-01-30

### Added

#### Phase 4.1: Subreddit Sort Preferences

- **Sort Order Memory**: Automatically remember and apply your preferred sort order per subreddit
  - Saves preference when you manually change sort (new/top/rising/hot/controversial)
  - Auto-applies saved preference on future visits to that subreddit
  - Supports time filters for top/controversial (hour/day/week/month/year/all)
  - Stores up to 100 subreddit preferences with LRU eviction
  - Prevents redirect loops with session-based tracking
  - Works seamlessly without disrupting Reddit's native behavior
  - Syncs across browser instances when sync is enabled

### Changed

- **Storage schema**: Added `sortPreferences` object with preferences dictionary
- **Content script**: Added 170+ lines of sort detection, URL parsing, and redirect logic
- **Options page**: Added Sort Preferences management section with search and import/export

### Technical Details

- **New storage fields**: `sortPreferences.enabled`, `preferences`, `maxEntries`
- **New CSS**: 160+ lines for sort preferences table, buttons, and responsive design
- **Test coverage**: 23 new tests for sort preferences (220 total tests passing)
- **Performance**: Interval-based detection (1000ms) with minimal overhead
- **URL patterns**: Supports all Reddit sort types and time filters

## [7.2.0] - 2026-01-30

### Added

#### Phase 3.3: Inline Image Expansion

- **Inline Image Preview**: Expand images directly within comment text
  - Support for i.redd.it, preview.redd.it, i.imgur.com, and imgur.com
  - Expand/collapse buttons ([+]/[-]) next to image links
  - Lazy loading for performance optimization
  - Loading states and error handling for failed images
  - Max width customization (400/600/800px or full width)
  - Automatic imgur page URL conversion to direct image URLs
  - Dark mode compatible styling
  - Syncs across browser instances when sync is enabled

### Changed

- **Storage schema**: Extended `commentEnhancements` with `inlineImages` and `maxImageWidth`
- **Content script**: Added 250+ lines of image detection, expansion, and lazy loading logic
- **Options page**: Extended Comment Enhancements section with inline image controls

### Technical Details

- **New storage fields**: `commentEnhancements.inlineImages`, `maxImageWidth`
- **New CSS**: 90+ lines for expand buttons, inline image containers, and loading states
- **New message type**: `REFRESH_INLINE_IMAGES` for real-time updates
- **Test coverage**: 34 new tests for inline image expansion (197 total tests passing)
- **Performance**: Lazy loading prevents bandwidth waste on collapsed images
- **Supported formats**: jpg, jpeg, png, gif, webp, svg

## [7.1.0] - 2026-01-30

### Added

#### Phase 3.2: Comment Navigation Buttons

- **Floating Navigation Buttons**: Navigate between top-level comments effortlessly
  - Three-button interface: Previous, Next, and Back to Top
  - Smooth scroll animation with visual comment highlighting
  - Keyboard shortcuts: Shift+J (next) and Shift+K (previous)
  - Position customization (bottom-right or bottom-left)
  - Touch-friendly button sizing (44px desktop, 48px mobile)
  - Smart context detection (only appears on comment pages)
  - Dark mode compatible styling
  - Accessibility features: focus-visible states, screen reader titles
  - Respects reduced-motion preferences
  - Syncs across browser instances when sync is enabled

### Changed

- **Storage schema**: Extended `commentEnhancements` with `navigationButtons` and `navButtonPosition`
- **Content script**: Added 200+ lines of navigation logic and button creation
- **Options page**: Extended Comment Enhancements section with navigation controls

### Technical Details

- **New storage fields**: `commentEnhancements.navigationButtons`, `navButtonPosition`
- **New CSS**: 120+ lines for navigation button styles and responsive design
- **New message type**: `REFRESH_COMMENT_NAVIGATION` for real-time updates
- **Test coverage**: 20 new tests for comment navigation (163 total tests passing)
- **Performance**: Optimized parent comment detection for threads with 100+ top-level comments

## [7.0.0] - 2026-01-30

### Added

#### Phase 3.1: Color-Coded Comments

- **Color-Coded Comment Depth**: Visual indicators showing comment nesting depth
  - Rainbow color stripe on left edge of comments
  - 10-color palette cycling for deeper nesting
  - Color-blind friendly palette option for accessibility
  - Stripe width customization (2-5 pixels)
  - Automatic depth calculation using requestIdleCallback
  - Real-time updates via MutationObserver
  - Dark mode compatible color adjustments
  - Syncs across browser instances when sync is enabled

### Changed

- **Storage schema**: Updated to version 2 with `commentEnhancements` object
- **Content script**: Added depth calculation and color stripe application logic
- **MutationObserver**: Extended to watch for dynamically loaded comments
- **Options page**: Added Comment Enhancements section with toggles and palette selector

### Technical Details

- **New storage fields**: `commentEnhancements.colorCodedComments`, `colorPalette`, `stripeWidth`
- **New CSS**: 150+ lines of color palette definitions and stripe styles
- **New message type**: `REFRESH_COLOR_CODED_COMMENTS` for real-time updates
- **Test coverage**: 23 new tests for comment enhancements (143 total tests passing)
- **Performance**: Optimized for threads with 500+ comments using requestIdleCallback

## [6.0.0] - 2026-01-30

### Added

#### Phase 1: Enhanced Blocking & Dark Mode

- **Dark Mode Support**: Auto-detection of system color scheme with manual overrides (Light/Dark/OLED Black)
  - Comprehensive dark theme for all old.reddit.com pages
  - Real-time switching without page reload
  - CSS custom properties for theming
  - Syncs across browser instances when sync is enabled
- **Enhanced Nag/Banner Removal**: Granular blocking controls for Reddit annoyances
  - Block login prompts, email verification nags, premium banners, and app prompts
  - Individual category toggles for fine-grained control
  - 40+ CSS selectors covering various nag types
  - MutationObserver watches for dynamically inserted nags
- **Auto-collapse Bot Comments**: Automatically collapse comments from 13 common bots
  - AutoModerator, RemindMeBot, RepostSleuthBot, and 10 more
  - Uses old Reddit's native collapse mechanism
  - Toggle control in options page

#### Phase 2: Content Filtering

- **Subreddit Muting**: Hide posts from specific subreddits on /r/all and /r/popular
  - Context menu integration (right-click to mute)
  - Support for up to 100 muted subreddits
  - Tag-based UI with visual chips
  - Import/Export mute lists as JSON
  - Real-time filtering with MutationObserver
- **Keyword Muting**: Filter posts by keywords/phrases in titles
  - Word boundary matching prevents false positives
  - Case-sensitive and case-insensitive modes
  - Support for multi-word phrases
  - Up to 200 muted keywords
  - Import/Export keyword lists
- **Domain Muting**: Filter posts linking to specific domains
  - Wildcard subdomain support (\*.example.com)
  - Automatic domain normalization
  - Up to 100 muted domains
  - Import/Export domain lists

#### Alternative Frontends & Other Features

- **Alternative frontend support**: Choose between old.reddit.com, Teddit, Redlib, or custom instances
- **Frontend selection UI**: Visual cards in options page for easy frontend switching
- **Dynamic rule generation**: Seamlessly switches between frontends without page reload
- **Per-tab redirect control**: Disable redirect for specific tabs (already implemented, now documented)
- **Redirect notice**: Optional notification on old.reddit.com with "Go back" button
- **Export statistics to JSON**: Download your redirect stats for analysis
- **Comprehensive test coverage**: 120 tests across 6 test files (26 new tests for frontends)
- **Permission management**: Graceful handling of optional permissions for alternative frontends

### Changed

- **Storage schema**: Extended with darkMode, nagBlocking, and contentFiltering objects
- **Content script**: Significantly expanded with filtering, theming, and dynamic content watching
- **Options page**: Added 5 new sections (Dark Mode, Nag Blocking, Muted Subreddits, Muted Keywords, Muted Domains)
- **MutationObserver**: Consolidated single observer watching all dynamic content with 100ms debouncing
- **Message passing**: Added 5 new message types for real-time updates (REFRESH_DARK_MODE, REFRESH_NAG_BLOCKING, etc.)
- Frontend configuration now uses dynamic rules for alternative frontends
- Static ruleset only used when old.reddit.com is selected
- Improved content script with better storage integration

### Technical Details

- **New storage methods**: `getDarkMode()`, `setDarkMode()`, `getNagBlocking()`, `setNagBlocking()`, `getContentFiltering()`, `setContentFiltering()`
- **Helper methods**: `addMutedSubreddit()`, `removeMutedSubreddit()`, `addMutedKeyword()`, `removeMutedKeyword()`, `addMutedDomain()`, `removeMutedDomain()`
- **Performance**: 100ms debounced MutationObserver for optimal performance
- **Cross-browser sync**: All new settings added to SYNC_KEYS for Chrome/Edge/Firefox sync

## [5.2.0] - 2026-01-30

### Added

- Comprehensive storage.js tests (21 tests)
- Comprehensive suggestions.js tests (22 tests)
- Test count increased to 94 (exceeded 60+ goal by 56%)

### Changed

- Enhanced defensive checks in storage.js for malformed data
- Debounced storage listeners for improved performance
- Updated documentation to reflect Phase 2 completion

## [5.1.0] - 2026-01-30

### Added

- Weekly trend chart in options page showing 7-day redirect history with tooltips
- Visual percentage bars for top subreddits showing relative popularity
- Mini sparkline in popup displaying 7-day trend at a glance
- Comprehensive test suite for statistics visualization (19 new tests)
- CHANGELOG.md to track version history

### Changed

- Enhanced statistics display with visual representations
- Top subreddits now show rank numbers and percentage of total redirects
- Improved popup layout with visual dividers between stats
- Statistics section now uses responsive flexbox layout

### Fixed

- Chart rendering properly handles empty data states

## [5.0.0] - 2026-01-30

### Added

- First-run onboarding experience with interactive tutorial
- URL testing tool in options page to check redirect behavior
- Smart subreddit suggestions with curated list of subreddits using new Reddit features
- Icon-click behavior configuration (popup vs instant toggle)
- Proper clipboard API implementation via offscreen documents
- Centralized logging system with context-aware error messages
- Mobile Reddit support (m.reddit.com redirects)
- Alternative frontend configuration (storage schema for Teddit, LibReddit, Redlib)
- Dynamic keyboard shortcut display in popup
- Context menu for Reddit links ("Open in Old Reddit", "Keep on New Reddit")

### Fixed

- Storage race conditions with proper async/await patterns
- Gallery URLs with hyphens now redirect correctly
- Video URLs with hyphens now redirect correctly
- Dynamic keyboard shortcut loading replaces hardcoded values

### Changed

- Modernized options page design with improved visual hierarchy
- Enhanced popup UI with better spacing and layout
- Improved error handling with contextual messages

## [4.0.0] - Previous Releases

### Added

- Popup UI with quick settings and statistics
- Keyboard shortcut toggle (Alt+Shift+R by default)
- Subreddit whitelist/exceptions system
- Statistics tracking (total, daily, per-subreddit)
- Settings sync across browsers (Chrome/Edge)
- Import/export settings functionality
- Temporary disable with duration options
- Per-tab toggle functionality

### Fixed

- Gallery (/gallery/) links now redirect properly
- Video (/video/, /videos/) links redirect correctly
- Support for nr/ns subdomains ([#174](https://github.com/tom-james-watson/old-reddit-redirect/issues/174), [#175](https://github.com/tom-james-watson/old-reddit-redirect/issues/175))
- Proper handling of chat.reddit.com and mod.reddit.com ([#187](https://github.com/tom-james-watson/old-reddit-redirect/issues/187), [#190](https://github.com/tom-james-watson/old-reddit-redirect/issues/190))

## [3.0.0] - Earlier

### Added

- Manifest V3 migration
- Declarative Net Request API implementation
- Service worker architecture
- Comprehensive test suite with Vitest

### Changed

- Complete rewrite for Manifest V3 compatibility
- Modern JavaScript patterns (ES6+)
- Improved code organization with IIFE pattern

## [2.0.0] - Legacy

### Added

- Basic redirect functionality
- Old.reddit.com URL rewriting
- Support for various Reddit subdomains

---

## Version Naming

- **Major (X.0.0)**: Breaking changes, significant new features, architectural changes
- **Minor (x.Y.0)**: New features, enhancements, non-breaking changes
- **Patch (x.y.Z)**: Bug fixes, minor improvements, documentation updates

## Links

- [GitHub Repository](https://github.com/tom-james-watson/old-reddit-redirect)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/old-reddit-redirect/dneaehbmnbhcippjikoajpoabadpodje)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/old-reddit-redirect)

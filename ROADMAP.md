# Old Reddit Redirect - Feature Roadmap

> **Purpose**: Prioritized feature roadmap for enhancing Old Reddit Redirect based on analysis of competing extensions and user needs.
>
> **Reference**: See `docs/SINK-IT-FEATURE-ANALYSIS.md` for detailed competitive analysis.

---

## Overview

This roadmap organizes new features into phases. Each phase has a theme and builds on previous work. Features are designed to be implemented independently where possible.

**Current Version**: 19.0.0
**Architecture**: Manifest V3, declarativeNetRequest, service worker, modular ES modules
**Completed Phases**: Phase 1 (3 features), Phase 2 (3 features), Phase 3 (3 features), Phase 4 (3 features), Phase 5 (10 features), Phase 6 (3 features), Phase 7 (4 features), Phase 9.1-9.4 (7 features), Phase 10 (3 features), Phase 11 (2 features), Phase 12 (3 features), Phase 13 (3 features), Phase 14 (3 features)
**Current Focus**: Future phases under consideration
**Status**: Production ready with 50 major features, modular architecture with lazy loading

---

## 🎉 Completed Features

All five phases of the roadmap have been successfully implemented:

### Phase 1: Enhanced Blocking & Dark Mode ✅ (v6.0.0)

- **1.1 Dark Mode Support** - Auto/Light/Dark/OLED themes
- **1.2 Enhanced Nag/Banner Removal** - Granular blocking controls
- **1.3 Auto-collapse Automod Comments** - 13 bot accounts

### Phase 2: Content Filtering ✅ (v6.0.0)

- **2.1 Subreddit Muting** - Filter unwanted communities (up to 100)
- **2.2 Keyword Muting** - Filter by title keywords/phrases (up to 200)
- **2.3 Domain Muting** - Filter by linked domains with wildcards (up to 100)

### Phase 3: Comment Enhancements ✅ (v7.0.0 - v7.2.0)

- **3.1 Color-Coded Comments** - Visual depth indicators with customizable palettes (v7.0.0)
- **3.2 Comment Navigation Buttons** - Floating UI with keyboard shortcuts (v7.1.0)
- **3.3 Inline Image Expansion** - Expand images directly in comments (v7.2.0)

### Phase 4: User Experience Polish ✅ (v8.0.0 - v10.0.0)

- **4.1 Remember Sort Order** - Auto-apply preferred sort per subreddit (v8.0.0)
- **4.2 User Tagging** - Custom labels/tags for Reddit users (v9.0.0)
- **4.3 Scroll Position Memory** - Remember scroll position when navigating back (v10.0.0)

**See CHANGELOG.md for detailed feature documentation and README.md for usage instructions.**

---

## ✅ Phase 5: Feed Enhancements & Performance (Completed)

**Status**: All features implemented and released (v11.0.0, v11.1.0, v11.2.0)
**Timeline**: Completed in 3 releases
**Documentation**: `docs/IMPLEMENTATION-PLAN-v11.md`, `docs/IMPLEMENTATION-PLAN-v11.1.md`, `docs/IMPLEMENTATION-PLAN-v11.2.md`

### Phase 5.1: Feed Enhancements (v11.0.0)

- **5.1 Compact Feed Mode** - Reduce spacing to show more posts per screen
- **5.2 Text-Only Mode** - Hide images for focused reading and bandwidth savings
- **5.3 Uncropped Image Thumbnails** - Full-aspect-ratio thumbnails instead of cropped squares
- **5.4 Hide Clutter** - Remove join buttons and action links
- **5.5 Custom CSS Injection** - Advanced users can inject custom styles

### Phase 5.2: Privacy & Tracking Protection (v11.1.0)

- **5.6 Tracking Parameter Removal** - Strip utm_source, fbclid, gclid, and 30+ other trackers
- **5.7 Referrer Control** - Choose what referrer information is sent when leaving Reddit

### Phase 5.3: Advanced Content Blocking (v11.2.0)

- **5.8 AI Overview Blocking** - Future-proof against AI-generated content
- **5.9 Enhanced Promoted Content Blocking** - Block trending, recommendations, community highlights
- **5.10 Jump to Top Button** - Floating button for quick scroll to top

**Benefits**:

- More control over feed appearance
- Better privacy protection from tracking
- Cleaner browsing experience
- Advanced customization options

**Technical Impact**:

- +1,800 lines of code
- +70 tests (270 → 340 total)
- Storage schema v2 → v3
- 3 new storage objects

---

### Phase 9.1: User Muting ✅ (v12.0.0)

- **9.1 User Muting** - Hide posts and comments from specific Reddit users
  - Context menu integration (right-click any username)
  - Manual user management (add/remove with optional reasons)
  - Import/export muted user lists as JSON
  - Up to 500 muted users with LRU eviction
  - Case-insensitive username matching
  - Real-time updates across all tabs

**Benefits**:

- Enhanced content curation by filtering unwanted users
- Cleaner comment threads and feed
- Import/export for backup and sharing

**Technical Impact**:

- +230 lines of code (content script, options page, background script)
- +34 tests (351 → 385 total)
- 1 new storage object (`mutedUsers`)
- 7 new storage API methods
- 1 new context menu item

---

### Phase 9.2: Advanced Keyword Filtering ✅ (v12.1.0)

- **9.2.1 Regular Expression Support** - Use regex patterns for powerful keyword matching
  - Full regex syntax support (wildcards, character classes, alternation, anchors)
  - Toggle to enable/disable regex mode
  - Graceful handling of invalid regex patterns
  - Case-sensitive and case-insensitive modes

- **9.2.2 Post Content Filtering** - Filter by post body text, not just titles
  - Works with self-posts that have visible content
  - Supports expando and usertext-body formats
  - Toggle to enable/disable content filtering

- **9.2.3 Flair-Based Filtering** - Hide posts by post flair
  - Case-insensitive flair text matching
  - Up to 100 muted flairs
  - Add/remove flairs manually
  - Import/export flair lists as JSON
  - Toggle to enable/disable flair filtering

- **9.2.4 Score-Based Filtering** - Hide low-quality posts by score threshold
  - Set minimum score threshold (-999 to 999999)
  - Default threshold: 0 (hide negative posts)
  - Toggle to enable/disable score filtering

**Benefits**:

- Extremely powerful content curation with regex
- Filter entire post content, not just titles
- Hide posts by category (flair) across all subreddits
- Automatically filter low-quality content

**Technical Impact**:

- +370 lines of code (content script rewrite, options page UI, handlers)
- +46 tests (385 → 431 total)
- 6 new storage fields in `contentFiltering`
- Rewrote `applyKeywordFiltering()` with filter priority system

---

### Phase 9.3: Customizable Keyboard Shortcuts ✅ (v12.2.0)

- **User-Defined Shortcuts** - Remap any shortcut to preferred keys
  - 11 default shortcuts (4 existing + 7 new)
  - Customize all shortcuts via options page
  - Enable/disable individual shortcuts
  - Reset to defaults (individual or all)

- **Chord Support** - Vim/Emacs-style two-key sequences
  - Support for sequences like "G G" for jump to top
  - Configurable chord timeout (500-3000ms, default: 1000ms)
  - Visual feedback during chord entry
  - Buffer clearing on timeout

- **7 New Shortcut Actions**:
  - `D` - Toggle dark mode
  - `C` - Toggle compact mode
  - `T` - Toggle text-only mode
  - `P` - Cycle color palette (rainbow → color-blind → off)
  - `I` - Toggle inline images
  - `Shift+/` - Show help overlay
  - `G G` - Vim-style jump to top (disabled by default)

- **Conflict Detection** - Automatic duplicate key detection
  - O(n²) conflict scanner with context awareness
  - Visual warning banner with conflict details
  - Highlights conflicting shortcuts in table
  - Real-time validation during editing
  - Case-insensitive key comparison

- **Management UI** - Complete options page interface
  - Shortcuts table grouped by category
  - Edit modal with key capture interface
  - Real-time key combination recording
  - Manual entry support
  - Import/export configurations

**Benefits**:

- Full customization of all keyboard shortcuts
- Power user efficiency with chord shortcuts
- 7 new quick actions for common tasks
- Prevents broken shortcuts with conflict detection
- Easy backup and sharing via import/export

**Technical Impact**:

- +1,250 lines of code (storage, keyboard handler, options UI, tests)
- +92 tests (431 → 523 total)
- 1 new storage object (`keyboardShortcuts`)
- 8 new storage API methods
- Map-based O(1) lookup registry (<1ms latency)
- Event delegation pattern for optimal performance

---

## 🔮 Future Phases (Under Consideration)

After Phase 5 & 9.1-9.2 completion, potential future enhancements organized by priority and theme:

---

## Phase 6: Performance & Optimization ✅ (v13.0.0)

**Status**: Completed
**Focus**: Improve extension performance and reduce resource usage

### 6.3 Storage Optimization ✅ (v13.0.0)

- Storage quota monitoring (local + sync usage tracking)
- Storage health reports with status (healthy/warning/critical)
- Automatic cleanup of expired data (scroll positions, sort preferences)
- Storage compaction to remove null values
- Storage management dashboard in options page
- **Benefit**: Prevent quota errors, visual usage tracking

### 6.4 DOM Manipulation Optimization ✅ (v13.0.0)

- Batched DOM updates using requestAnimationFrame
- Non-critical operations using requestIdleCallback
- Adaptive throttling for rapid mutations
- Smart mutation filtering (only process relevant changes)
- **Benefit**: Smoother scrolling, reduced CPU usage

### 6.1 Code Splitting & Lazy Loading ✅ (v19.0.0)

- Split features into 24 modular ES6 modules (core, comments, feed, optional)
- Page-level lazy loading (comments modules only on /comments/ pages)
- Feature-level conditional loading (optional features only when enabled)
- Native browser ES modules (no bundler required)
- **Result**: 13.8% bundle reduction (181KB → 156KB), 99.3% content-script reduction
- **Documentation**: MIGRATION-COMPLETE.md, PHASE-1 through PHASE-7 completion docs
- **Status**: Complete - Modular architecture now production default

### 6.2 Performance Profiling Dashboard (Deferred)

- Track extension performance metrics
- Identify bottlenecks in content blocking and filtering
- **Status**: Planned for future release

**Achieved Impact**:

- Storage quota monitoring prevents data loss
- 30-50% faster mutation handling with batching
- Reduced CPU usage during rapid page updates
- 13.8% bundle size reduction with modular architecture
- 33-53% fewer lines executed per page (via lazy loading)
- 100-150ms faster initial page load
- ~40KB lower memory footprint

---

## Phase 7: Accessibility & Internationalization ✅ (v14.0.0)

**Status**: Completed
**Focus**: Make extension accessible to all users

### 7.1 WCAG 2.1 Compliance ✅ (v14.0.0)

- All UI controls are keyboard accessible
- Proper ARIA labels on all interactive elements (options.html, popup.html)
- Visible focus indicators (3px outline, 2px offset)
- Screen reader support with aria-live regions and role attributes

### 7.2 High Contrast Mode ✅ (v14.0.0)

- High contrast theme option (21:1 contrast ratio - WCAG AAA)
- Pure black background (#000000) with white text (#ffffff)
- Cyan links (#00ffff) with yellow hover (#ffff00)
- Independent high contrast UI toggle for options page elements

### 7.3 Font Size Controls ✅ (v14.0.0)

- Four font size options: Small (87.5%), Medium (100%), Large (112.5%), Extra Large (125%)
- CSS variable-based scaling for consistent typography
- Affects post titles, comments, and other content

### 7.4 Reduce Motion Support ✅ (v14.0.0)

- Three reduce motion options: Auto (system preference), Always, Never
- Respects prefers-reduced-motion media query
- Disables animations and transitions when enabled

### 7.5 Multi-Language Support (Deferred)

- Internationalize options page UI
- Translate help text and descriptions
- Support for RTL (right-to-left) languages
- **Status**: Planned for future release

**Achieved Impact**:

- WCAG 2.1 AA/AAA compliance for key features
- Accessible to users with visual impairments
- Better support for users with motor disabilities
- Respects system accessibility preferences

---

## Phase 8: Community & Collaboration Features (Proposed)

**Timeline**: 4-5 weeks
**Focus**: Enable community-driven improvements

### 8.1 Shared Filter Lists

- Import/export filter lists in standardized format
- Community-curated blocklists (subreddits, domains, keywords)
- One-click subscription to popular filter lists
- **Example**: "Block political subreddits", "Block sports", "Block memes"

### 8.2 Custom Selector Contributions

- User interface for submitting new CSS selectors
- Community voting on selector effectiveness
- Automated selector testing pipeline
- GitHub integration for selector PRs

### 8.3 Reddit DOM Change Monitoring

- Automated detection of Reddit DOM changes
- Notify users when selectors may be outdated
- Crowdsourced selector update system

### 8.4 Filter List Marketplace

- Browse and install community filter lists
- Rate and review filter lists
- Privacy-preserving analytics (which filters are most popular)

**Estimated Impact**:

- Faster response to Reddit changes
- Reduced maintenance burden
- Stronger community engagement

---

## Phase 9: Advanced User Features (Proposed)

**Timeline**: 3-4 weeks
**Focus**: Power user tools and customization

### 9.1 User Muting

- Hide posts from specific Reddit users
- Hide comments from specific users
- User mute list management (import/export)
- Temporary mutes (24hr, 7 days, 30 days)
- **Limit**: 500 muted users (LRU eviction)

### 9.2 Advanced Keyword Filtering

- Regular expression support for keywords
- Post content filtering (not just titles)
- Flair-based filtering
- Score-based filtering (hide posts below X score)

### 9.3 Customizable Keyboard Shortcuts ✅ (v12.2.0)

- User-defined keyboard shortcuts for all features
- Chord shortcuts (e.g., G G for jump to top)
- Keyboard shortcut conflict detection
- Import/export keyboard mappings

### 9.4 Custom Views & Layouts ✅ (v12.3.0)

- Save custom feed layouts (compact + text-only, etc.)
- Quick-switch between layout presets
- Per-subreddit layout preferences
- Custom CSS templates

**Estimated Impact**:

- Enhanced power user experience
- Deeper personalization
- Competitive with Reddit Enhancement Suite

---

## Phase 10: Privacy & Security Enhancements ✅ (v15.0.0)

**Status**: Completed
**Focus**: Strengthen privacy protections

### 10.1 Enhanced Tracker Blocking ✅ (v15.0.0)

- Expanded tracking parameter list to 58 params (from 32)
- New categories: Social media (TikTok, Pinterest, Snapchat), Analytics, Affiliate, Reddit-specific
- Organized parameters by category for better tracking statistics

### 10.2 Privacy Dashboard ✅ (v15.0.0)

- Privacy score (0-100) based on enabled features
- Visual score ring with color-coded status (low/medium/high)
- Detailed breakdown by 6 tracker categories
- Privacy recommendations for improving settings
- Export privacy reports as JSON

### 10.3 Anti-Fingerprinting (Deferred)

- Canvas fingerprinting protection
- User agent randomization options
- **Status**: Planned for future release

### 10.4 Local-First Architecture (Deferred)

- Encrypted storage option for sensitive data
- **Status**: Planned for future release

**Achieved Impact**:

- 58 tracking parameters blocked (up from 32)
- Privacy score helps users understand their protection level
- Detailed statistics by tracker category
- Export capability for privacy auditing

---

## Phase 11: Reading History ✅ (v16.0.0)

**Status**: Completed
**Focus**: Track and manage reading history for posts

### 11.1 Reading History Tracking ✅ (v16.0.0)

- Automatic tracking of viewed posts (comments pages)
- Stores post ID, title, subreddit, URL, comment count, timestamp
- Local-only storage (privacy-preserving)
- LRU eviction at 500 entries
- Configurable retention period (7-90 days)

### 11.2 Visited Post Indicators ✅ (v16.0.0)

- Visual checkmark (✓) next to posts you've already read
- Dimmed title styling for visited posts
- Toggle to enable/disable indicator
- Works on all feed pages (/r/all, subreddits, home)

### 11.3 History Management UI ✅ (v16.0.0)

- Reading History section in options page
- View recent history with search
- Remove individual entries
- Clear all history
- Export/import history as JSON

**Achieved Impact**:

- Easy identification of posts you've already read
- Privacy-preserving local storage
- Full control over history data
- 28 new tests

---

## Phase 12: Navigation Enhancements ✅ (v17.0.0)

**Status**: Completed
**Focus**: Improve comment thread navigation

### 12.1 Permalink Comment Highlighting ✅ (v17.0.0)

- Automatic highlight when navigating via permalink URL
- Support for hash (#thing_t1_xxx) and path-based links
- Smooth scroll to target comment
- 2-second fade-out animation
- Dark mode compatible styling

### 12.2 Parent Comment Navigation ✅ (v17.0.0)

- "↑ parent" button on nested comments
- Appears on hover to reduce visual clutter
- Smooth scroll to parent comment
- Brief highlight flash on parent
- Works with dynamically loaded comments

### 12.3 Comment Collapse Memory ✅ (v17.0.0)

- Remember collapsed comments across page reloads
- Session storage (cleared when browser closes)
- Automatic restore on page load
- Click tracking for expand/collapse

**Achieved Impact**:

- Easier navigation of deeply nested threads
- Quick access to context via parent navigation
- Persistent collapse state during browsing session
- 28 new tests

---

## Phase 13: NSFW Content Controls ✅ (v18.0.0)

**Status**: Completed
**Focus**: Control how NSFW content is displayed

### 13.1 NSFW Visibility Modes ✅ (v18.0.0)

- Three visibility options: Show, Blur, or Hide
- Configurable blur intensity (5-20px)
- Reveal on hover option for blurred content
- Warning overlay with click-to-reveal
- Disabled by default (respects user choice)

### 13.2 Per-Subreddit Allowlist ✅ (v18.0.0)

- Whitelist subreddits where NSFW is always shown
- Up to 100 allowed subreddits
- Case-insensitive matching
- Easy add/remove from options page

### 13.3 NSFW Warning Overlay ✅ (v18.0.0)

- "18+ NSFW" badge on blurred thumbnails
- Click to temporarily reveal (10 second timeout)
- Dark mode compatible styling
- Toggle to enable/disable

**Achieved Impact**:

- Complete control over NSFW content visibility
- Privacy-conscious browsing in shared spaces
- Subreddit-specific exceptions for trusted content
- 39 new tests

---

## Phase 14: Comment Thread Minimap ✅ (v19.0.0)

**Status**: Completed
**Focus**: Visual overview and navigation for comment threads

### 14.1 Visual Thread Minimap ✅ (v19.0.0)

- Bird's-eye view of entire comment thread
- Fixed-position sidebar (left or right side)
- Adjustable width (60-200px, default 120px)
- Adjustable opacity (10-100%, default 90%)
- Only appears on comment pages

### 14.2 Viewport Indicator ✅ (v19.0.0)

- Semi-transparent overlay showing visible area
- Real-time updates as you scroll
- Click anywhere to jump to that position
- Smooth scroll animation

### 14.3 Depth Colors & Collapsed Indicators ✅ (v19.0.0)

- Color-coded markers match comment depth colors
- 10 distinct depth levels with gradient colors
- Optional toggle for uniform color
- Collapsed comment indicators (striped pattern)
- Auto-hide mode for reduced visual clutter

**Achieved Impact**:

- Quick visual overview of thread structure
- Easy navigation to any part of the thread
- Depth visualization for understanding comment hierarchy
- 46 new tests

---

## 🔄 Deferred Features Summary

Features planned for future releases but deferred from their original phases:

### Performance & Optimization (Phase 6)

- **6.2 Performance Profiling Dashboard** - Track extension performance metrics and identify bottlenecks

### Accessibility & Internationalization (Phase 7)

- **7.5 Multi-Language Support** - Internationalize options page UI, translate help text, RTL language support

### Privacy & Security (Phase 10)

- **10.3 Anti-Fingerprinting** - Canvas fingerprinting protection, user agent randomization
- **10.4 Local-First Architecture** - Encrypted storage option for sensitive data

**Status**: All deferred features are planned for future releases when resources and community demand align.

---

## Lower Priority Ideas

### Navigation Enhancements

- ~~Jump to specific comment by permalink~~ ✅ Implemented in v17.0.0
- Breadcrumb navigation for nested threads
- ~~Comment thread minimap~~ ✅ Implemented in v19.0.0

### Content Discovery

- Related post suggestions (privacy-preserving)
- Saved post organization (tags, folders)
- ~~Reading history (optional, local-only)~~ ✅ Implemented in v16.0.0

### NSFW Content Controls

- ~~Advanced NSFW filtering (by type, by subreddit)~~ ✅ Implemented in v18.0.0
- ~~NSFW blur options~~ ✅ Implemented in v18.0.0
- Age verification reminder

### Monetization (Optional)

- Donation button (Ko-fi, GitHub Sponsors)
- Patron-exclusive beta features
- Open Collective for transparency
- **Note**: Extension remains 100% free, donations optional

---

## Decision Criteria for Future Phases

When selecting the next phase, consider:

1. **User demand**: GitHub issues, user requests, competitive analysis
2. **Maintenance burden**: Will this reduce or increase ongoing work?
3. **Technical debt**: Does this clean up existing code or add complexity?
4. **Competitive position**: Does this differentiate us from alternatives?
5. **Resource availability**: Developer time, testing capacity
6. **Risk vs. reward**: High-impact, low-risk features prioritized

---

## Community Input

Feature requests and suggestions are welcome! Please open an issue on GitHub with:

- **Use case**: Why you need this feature
- **Priority**: How important is it to you?
- **Alternatives**: What workarounds do you currently use?

We prioritize features with strong community support and clear use cases.

---

## Version Planning

| Version | Phase | Target Features                  | Status          |
| ------- | ----- | -------------------------------- | --------------- |
| 6.0.0   | 1 & 2 | All Phase 1 and Phase 2 features | ✅ **Released** |
| 7.0.0   | 3     | Color-coded comments             | ✅ **Released** |
| 7.1.0   | 3     | Comment navigation               | ✅ **Released** |
| 7.2.0   | 3     | Inline image expansion           | ✅ **Released** |
| 8.0.0   | 4     | Sort memory                      | ✅ **Released** |
| 9.0.0   | 4     | User tagging                     | ✅ **Released** |
| 10.0.0  | 4     | Scroll memory                    | ✅ **Released** |
| 11.0.0  | 5     | Feed enhancements                | ✅ **Released** |
| 11.1.0  | 5     | Privacy & tracking protection    | ✅ **Released** |
| 11.2.0  | 5     | Advanced content blocking        | ✅ **Released** |
| 12.0.0  | 9.1   | User muting                      | ✅ **Released** |
| 12.1.0  | 9.2   | Advanced keyword filtering       | ✅ **Released** |
| 12.2.0  | 9.3   | Customizable keyboard shortcuts  | ✅ **Released** |
| 12.3.0  | 9.4   | Custom views & layouts           | ✅ **Released** |
| 13.0.0  | 6     | Performance & optimization       | ✅ **Released** |
| 14.0.0  | 7     | Accessibility features           | ✅ **Released** |
| 15.0.0  | 10    | Privacy & security enhancements  | ✅ **Released** |
| 16.0.0  | 11    | Reading history                  | ✅ **Released** |
| 17.0.0  | 12    | Navigation enhancements          | ✅ **Released** |
| 18.0.0  | 13    | NSFW content controls            | ✅ **Released** |
| 18.x.x  | 7/10  | i18n / Anti-fingerprinting       | 🔮 **Future**   |
| 19.x.x  | 8     | Community features               | 🔮 **Future**   |

**v7.1.0 includes:**

- Phase 3.2: Comment navigation buttons (floating UI, keyboard shortcuts Shift+J/K, position customization)

**v7.0.0 includes:**

- Phase 3.1: Color-coded comments (rainbow + color-blind palettes, stripe width customization)

**v6.0.0 includes:**

- Phase 1: Dark mode (4 modes), nag blocking (4 categories), auto-collapse bots (13 accounts)
- Phase 2: Subreddit muting, keyword muting, domain muting (all with import/export)

---

## References

- **Competitive Analysis**: `docs/SINK-IT-FEATURE-ANALYSIS.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Architecture Notes**: `CLAUDE.md`

---

_Last updated: 2026-02-01_

# Changelog

All notable changes to Old Reddit Redirect will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.0.0] - 2026-01-30

### Added

- **Alternative frontend support**: Choose between old.reddit.com, Teddit, Redlib, or custom instances
- **Frontend selection UI**: Visual cards in options page for easy frontend switching
- **Dynamic rule generation**: Seamlessly switches between frontends without page reload
- **Per-tab redirect control**: Disable redirect for specific tabs (already implemented, now documented)
- **Redirect notice**: Optional notification on old.reddit.com with "Go back" button
- **Export statistics to JSON**: Download your redirect stats for analysis
- **Comprehensive test coverage**: 120 tests across 6 test files (26 new tests for frontends)
- **Permission management**: Graceful handling of optional permissions for alternative frontends

### Changed

- Frontend configuration now uses dynamic rules for alternative frontends
- Static ruleset only used when old.reddit.com is selected
- Improved content script with better storage integration

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

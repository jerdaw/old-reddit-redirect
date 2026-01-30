# Old Reddit Redirect - Feature Roadmap

> **Purpose**: Prioritized feature roadmap for enhancing Old Reddit Redirect based on analysis of competing extensions and user needs.
>
> **Reference**: See `docs/SINK-IT-FEATURE-ANALYSIS.md` for detailed competitive analysis.

---

## Overview

This roadmap organizes new features into phases. Each phase has a theme and builds on previous work. Features are designed to be implemented independently where possible.

**Current Version**: 6.0.0
**Architecture**: Manifest V3, declarativeNetRequest, service worker
**Completed Phases**: Phase 1 (3 features), Phase 2 (3 features)
**Status**: Production ready with 6 major features implemented

---

## 🎉 Completed Features

The following features have been successfully implemented and are available in v6.0.0:

### Phase 1: Enhanced Blocking & Dark Mode ✅

- **1.1 Dark Mode Support** - Auto/Light/Dark/OLED themes
- **1.2 Enhanced Nag/Banner Removal** - Granular blocking controls
- **1.3 Auto-collapse Automod Comments** - 13 bot accounts

### Phase 2: Content Filtering ✅

- **2.1 Subreddit Muting** - Filter unwanted communities (up to 100)
- **2.2 Keyword Muting** - Filter by title keywords/phrases (up to 200)
- **2.3 Domain Muting** - Filter by linked domains with wildcards (up to 100)

**See CHANGELOG.md for detailed feature documentation.**

---

## 🚧 Future Phases (Under Consideration)

The following phases are planned for future releases but not currently prioritized:

---

## Phase 3: Comment Enhancements

**Theme**: Improve the comment reading and navigation experience.

**Prerequisites**: Phase 1 completion (content script infrastructure).

### 3.1 Color-Coded Comments

**Status**: 🟡 Under Consideration

**Description**: Add visual color indicators to show comment nesting depth.

**Features**:

- [ ] Rainbow color stripe on left edge of comments
- [ ] Colors cycle through palette based on depth
- [ ] Color-blind friendly palette option
- [ ] Toggle to enable/disable
- [ ] Works with collapsed comments

**Implementation Notes**:

- Add CSS classes `.depth-1`, `.depth-2`, etc. or use CSS `attr()` with data attributes
- Old Reddit uses `.child` nesting structure
- Define 8-10 color palette, cycle for deeper nesting
- Color-blind palette: use distinct hues + patterns/shapes

**Files to modify**:

- `styles.css` - Add color stripe CSS
- `content-script.js` - Add depth classes to comments if needed
- `options.js` / `options.html` - Add toggle and palette selection

**Acceptance Criteria**:

- [ ] Each comment depth level has distinct color
- [ ] Colors help visually track reply chains
- [ ] Color-blind mode available
- [ ] Feature can be disabled

---

### 3.2 Comment Navigation Buttons

**Status**: 🟡 Under Consideration

**Description**: Add floating buttons to navigate between top-level comments.

**Features**:

- [ ] "Next parent" button - jump to next top-level comment
- [ ] "Previous parent" button - jump to previous top-level comment
- [ ] "Back to top" button
- [ ] Buttons appear as floating overlay
- [ ] Keyboard shortcuts (optional)

**Implementation Notes**:

- Inject floating button container via content script
- Find `.thing.comment` elements at depth 0
- Use `scrollIntoView()` for navigation
- Consider button positioning (bottom-right corner)
- Mobile-friendly touch targets

**Files to modify**:

- `content-script.js` - Add navigation logic and buttons
- `styles.css` - Add floating button styles
- `options.js` / `options.html` - Add enable/disable toggle

**Acceptance Criteria**:

- [ ] Buttons appear on comment pages
- [ ] "Next" navigates to next top-level comment
- [ ] "Previous" navigates to previous top-level comment
- [ ] "Top" scrolls to page top
- [ ] Feature can be disabled

---

### 3.3 Inline Image Expansion

**Status**: 🟡 Under Consideration

**Description**: Expand image links directly in comments without opening new tab.

**Features**:

- [ ] Detect image links in comments (imgur, i.redd.it, etc.)
- [ ] Add expand/collapse toggle next to link
- [ ] Show image inline when expanded
- [ ] Support common image hosts

**Implementation Notes**:

- Parse comment body for image URLs
- Supported formats: jpg, png, gif, webp
- Supported hosts: i.redd.it, i.imgur.com, imgur.com (convert to direct)
- Add expand button after link
- Create img element on expand, remove on collapse

**Files to modify**:

- `content-script.js` - Add image detection and expansion
- `styles.css` - Add inline image styles
- `options.js` / `options.html` - Add enable/disable toggle

**Acceptance Criteria**:

- [ ] Image links have expand button
- [ ] Clicking expand shows image inline
- [ ] Clicking again collapses image
- [ ] Works with common image hosts

---

## Phase 4: User Experience Polish

**Theme**: Quality of life improvements for power users.

**Prerequisites**: Phases 1-3 establish the infrastructure these features build on.

### 4.1 Remember Sort Order

**Status**: 🟡 Under Consideration

**Description**: Remember preferred sort order per subreddit.

**Features**:

- [ ] Detect current subreddit and sort order
- [ ] Store preference when user changes sort
- [ ] Auto-apply preferred sort on subreddit visit
- [ ] Reset option to clear stored preferences

**Implementation Notes**:

- Parse URL for subreddit and sort parameter
- Store as `{ "subreddit": "sort" }` mapping
- Redirect to sorted URL if preference exists and current sort differs
- Be careful not to cause redirect loops

**Files to modify**:

- `content-script.js` - Add sort detection and redirect
- `storage.js` - Add `sortPreferences` object
- `options.js` / `options.html` - Add management UI

**Acceptance Criteria**:

- [ ] Sort preference saved when user changes sort
- [ ] Preference applied on next visit to that subreddit
- [ ] User can clear individual or all preferences
- [ ] No redirect loops

---

### 4.2 User Tagging

**Status**: 🟡 Under Consideration

**Description**: Add custom labels/tags to Reddit users (similar to RES).

**Features**:

- [ ] Click to add tag next to username
- [ ] Custom tag text and color
- [ ] Tags display next to username everywhere
- [ ] Tag management in options

**Implementation Notes**:

- Inject tag button next to `.author` elements
- Store tags as `{ "username": { "text": "...", "color": "..." } }`
- Display tag as badge after username
- Apply tags via content script on page load

**Files to modify**:

- `content-script.js` - Add tagging UI and display
- `styles.css` - Add tag badge styles
- `storage.js` - Add `userTags` object
- `options.js` / `options.html` - Add tag management

**Acceptance Criteria**:

- [ ] User can add tag to any username
- [ ] Tags appear next to username on all pages
- [ ] Tags have customizable text and color
- [ ] Tags persist across sessions

---

### 4.3 Scroll Position Memory

**Status**: 🟡 Under Consideration

**Description**: Remember scroll position when navigating away and back.

**Features**:

- [ ] Save scroll position when leaving page
- [ ] Restore scroll position when returning via back button
- [ ] Clear old positions after 24 hours
- [ ] Toggle to enable/disable

**Implementation Notes**:

- Use `beforeunload` event to save position
- Use `pageshow` event to restore
- Store as `{ "url": { "position": Y, "timestamp": T } }`
- Clean up old entries periodically

**Files to modify**:

- `content-script.js` - Add scroll tracking
- `storage.js` - Add scroll position storage

**Acceptance Criteria**:

- [ ] Scroll position saved when leaving page
- [ ] Position restored when using back button
- [ ] Old positions cleaned up automatically

---

## Status Legend

| Status                 | Meaning                                  |
| ---------------------- | ---------------------------------------- |
| 🔵 Planned             | Committed to implementing                |
| 🟡 Under Consideration | Evaluating, not yet committed            |
| 🟢 In Progress         | Currently being worked on                |
| ✅ Complete            | Implemented and released                 |
| ⏸️ On Hold             | Paused for dependencies or other reasons |
| ❌ Rejected            | Decided not to implement                 |

---

## Implementation Guidelines

### For Contributors

1. **One feature per PR** - Keep changes focused
2. **Update tests** - Add tests for new functionality
3. **Follow existing patterns** - Match code style in existing files
4. **Update docs** - Add feature to README if user-facing

### Content Script Considerations

- Old Reddit uses jQuery - don't conflict with it
- Pages load dynamically - use MutationObserver when needed
- Test with RES installed - many users have both
- Performance matters - avoid expensive DOM operations in loops

### Storage Schema

When adding new storage fields:

1. Add to `storage.js` with default value
2. Add migration logic for existing users
3. Document the field in storage.js comments

---

## Version Planning

| Version | Phase | Target Features                          | Status          |
| ------- | ----- | ---------------------------------------- | --------------- |
| 6.0.0   | 1 & 2 | All Phase 1 and Phase 2 features         | ✅ **Released** |
| 7.0.0   | 3     | Color-coded comments                     | 🟡 Planned      |
| 7.1.0   | 3     | Comment navigation                       | 🟡 Planned      |
| 7.2.0   | 3     | Inline image expansion                   | 🟡 Planned      |
| 8.0.0   | 4     | Sort memory, user tagging, scroll memory | 🟡 Planned      |

**v6.0.0 includes:**

- Phase 1: Dark mode (4 modes), nag blocking (4 categories), auto-collapse bots (13 accounts)
- Phase 2: Subreddit muting, keyword muting, domain muting (all with import/export)

---

## References

- **Competitive Analysis**: `docs/SINK-IT-FEATURE-ANALYSIS.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Architecture Notes**: `CLAUDE.md`

---

_Last updated: 2026-01-30_

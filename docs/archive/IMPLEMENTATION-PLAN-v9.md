# Implementation Plan: Phase 4.2 - User Tagging

> **Version**: 9.0.0-plan-v1
> **Date**: 2026-01-30
> **Target Release**: v9.0.0
> **Author**: Development Team

---

## Executive Summary

This document outlines the implementation plan for **Phase 4.2: User Tagging** of Old Reddit Redirect. This feature allows users to add custom labels/tags to Reddit users, making it easier to identify and track users across different threads and subreddits.

**Key Benefits**:
- Quickly identify users you've tagged (friends, helpful commenters, trolls, etc.)
- Add custom notes and colors to user tags
- Tags appear consistently across all Reddit pages
- Full tag management interface in options page

---

## Current State Assessment

### Repository Status

| Metric | Value |
|--------|-------|
| Current Version | 8.0.0 (released 2026-01-30) |
| Test Coverage | 220 tests, 100% passing |
| ESLint Errors | 0 |
| Content Script Size | ~1,106 lines |
| Storage Schema Version | 2 |

---

## Feature Specification: User Tagging (v9.0.0)

### Overview

Add the ability to tag Reddit users with custom text and colors. Tags appear as badges next to usernames throughout Reddit.

### User Stories

- As a user, I want to tag helpful commenters so I can recognize them in future threads
- As a user, I want to tag users with different colors to categorize them (friends, experts, trolls)
- As a user, I want to manage all my tags from a central location
- As a user, I want my tags to sync across browser instances

### Technical Design

#### UI Components

**1. Tag Button (next to username)**
```html
<!-- Injected after .author element -->
<a class="author">username</a>
<button class="orr-tag-btn" data-username="username" title="Tag user">🏷️</button>

<!-- When tag exists -->
<a class="author">username</a>
<span class="orr-user-tag" data-username="username" style="background: #color">
  Tag Text
</span>
<button class="orr-tag-edit" data-username="username" title="Edit tag">✏️</button>
```

**2. Tag Dialog**
```html
<div class="orr-tag-dialog">
  <div class="orr-tag-dialog-header">
    <h3>Tag User: u/username</h3>
    <button class="orr-tag-dialog-close">×</button>
  </div>
  <div class="orr-tag-dialog-body">
    <label>
      Tag Text
      <input type="text" id="orr-tag-text" maxlength="50" placeholder="e.g., Friend, Expert, etc.">
    </label>
    <label>
      Color
      <div class="orr-color-picker">
        <!-- 12 preset colors -->
        <button class="orr-color-option" data-color="#e74c3c"></button>
        <button class="orr-color-option" data-color="#3498db"></button>
        <!-- ... more colors -->
      </div>
    </label>
  </div>
  <div class="orr-tag-dialog-footer">
    <button class="orr-tag-save">Save Tag</button>
    <button class="orr-tag-delete">Remove Tag</button>
    <button class="orr-tag-cancel">Cancel</button>
  </div>
</div>
```

#### Storage Schema

```javascript
userTags: {
  enabled: true,
  tags: {
    // Key: username (lowercase)
    // Value: { text, color, timestamp }
    "username1": {
      text: "Friend",
      color: "#3498db",
      timestamp: 1234567890
    },
    "username2": {
      text: "Expert in Python",
      color: "#2ecc71",
      timestamp: 1234567891
    },
  },
  maxTags: 500, // Limit to prevent storage abuse
}
```

#### Content Script Logic

**1. Find and Mark Usernames**
```javascript
function findUsernames() {
  // Find all .author elements that don't have tag buttons yet
  const authors = document.querySelectorAll('.author:not(.orr-tagged)');

  for (const author of authors) {
    const username = author.textContent;

    // Mark as processed
    author.classList.add('orr-tagged');

    // Check if user has a tag
    const tag = await storage.getUserTag(username);

    if (tag) {
      // Show tag badge
      showTagBadge(author, username, tag);
    } else {
      // Show tag button
      showTagButton(author, username);
    }
  }
}
```

**2. Tag Dialog Management**
```javascript
let currentDialog = null;

function showTagDialog(username, existingTag = null) {
  // Create dialog
  const dialog = createTagDialog(username, existingTag);

  // Show dialog
  document.body.appendChild(dialog);
  currentDialog = dialog;

  // Focus input
  dialog.querySelector('#orr-tag-text').focus();

  // Attach event handlers
  attachDialogHandlers(dialog, username);
}

function closeTagDialog() {
  if (currentDialog) {
    currentDialog.remove();
    currentDialog = null;
  }
}
```

**3. Tag Application**
```javascript
async function saveUserTag(username, text, color) {
  await storage.setUserTag(username, { text, color, timestamp: Date.now() });

  // Refresh all instances of this username on page
  refreshUsernameTags(username);

  closeTagDialog();
}

function refreshUsernameTags(username) {
  // Find all instances of this username on the page
  const authors = document.querySelectorAll(`.author.orr-tagged`);

  for (const author of authors) {
    if (author.textContent === username) {
      // Remove old tag button/badge
      const oldTag = author.nextElementSibling;
      if (oldTag && (oldTag.classList.contains('orr-tag-btn') ||
                     oldTag.classList.contains('orr-user-tag'))) {
        oldTag.remove();
      }

      // Re-apply tag
      const tag = await storage.getUserTag(username);
      if (tag) {
        showTagBadge(author, username, tag);
      } else {
        showTagButton(author, username);
      }
    }
  }
}
```

#### Options Page UI

**Tag Management Section**:
```html
<section class="setting">
  <h2>User Tags</h2>
  <p class="section-description">
    Add custom labels and colors to Reddit users. Tags appear as badges next to usernames.
  </p>

  <div class="option-row">
    <label class="checkbox-label">
      <input type="checkbox" id="user-tags-enabled" checked />
      <span>Enable user tagging</span>
    </label>
  </div>

  <div class="user-tags-management">
    <div class="tags-header">
      <h3>Saved Tags (<span id="tag-count">0</span>/<span id="tag-max">500</span>)</h3>
      <div class="tags-controls">
        <input type="text" id="tag-search" placeholder="Search users..." class="search-input">
        <button id="export-tags" class="secondary-button">Export</button>
        <button id="import-tags" class="secondary-button">Import</button>
        <button id="clear-all-tags" class="danger-button">Clear All</button>
      </div>
    </div>

    <table id="tags-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Tag</th>
          <th>Color</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="tags-tbody">
        <!-- Populated by JS -->
      </tbody>
    </table>

    <p class="empty-state" id="tags-empty">
      No tags yet. Visit Reddit and click the tag button (🏷️) next to any username to add a tag.
    </p>
  </div>
</section>
```

#### CSS Styling

**Tag Badge**:
```css
.orr-user-tag {
  display: inline-block;
  margin-left: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: #3498db;
  border-radius: 3px;
  cursor: pointer;
  vertical-align: middle;
}

.orr-user-tag:hover {
  opacity: 0.8;
}
```

**Tag Button**:
```css
.orr-tag-btn {
  display: inline-block;
  margin-left: 4px;
  padding: 0 4px;
  font-size: 12px;
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.orr-tag-btn:hover {
  opacity: 1;
  border-color: #0079d3;
}
```

**Tag Dialog**:
```css
.orr-tag-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-width: 90%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
}

.orr-tag-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}
```

### Preset Colors

12 carefully chosen colors for tags:
```javascript
const TAG_COLORS = [
  '#e74c3c', // Red
  '#e67e22', // Orange
  '#f39c12', // Yellow
  '#2ecc71', // Green
  '#1abc9c', // Teal
  '#3498db', // Blue
  '#9b59b6', // Purple
  '#e91e63', // Pink
  '#607d8b', // Gray
  '#795548', // Brown
  '#ff5722', // Deep Orange
  '#00bcd4', // Cyan
];
```

### Acceptance Criteria

- [ ] Tag button appears next to all usernames on Reddit
- [ ] Clicking tag button opens tag dialog
- [ ] User can enter tag text (max 50 characters)
- [ ] User can select from 12 preset colors
- [ ] Saving tag displays badge next to username
- [ ] Tags persist across page loads and browser sessions
- [ ] Tags appear on all Reddit pages (posts, comments, profiles)
- [ ] User can edit existing tags
- [ ] User can delete tags
- [ ] Options page shows all tags in searchable table
- [ ] Tags can be exported/imported as JSON
- [ ] Feature can be toggled on/off
- [ ] Tags sync across browser instances
- [ ] Maximum 500 tags enforced
- [ ] Dark mode compatible

### Test Plan

**Unit Tests** (tests/user-tags.test.js):
- Storage methods (getUserTag, setUserTag, deleteUserTag, clearUserTags)
- Username normalization (case-insensitive)
- Max tag limit enforcement
- Tag validation (text length, color format)
- HTML escaping for tag text

**Manual Testing**:
1. Find a username on Reddit, click tag button
2. Enter tag text "Friend" and select blue color
3. Verify badge appears next to username
4. Refresh page, verify tag persists
5. Click on tag badge to edit
6. Change to "Best Friend" and green color
7. Verify all instances of username update
8. Navigate to different page with same username
9. Verify tag appears there too
10. Open options page, verify tag in table
11. Delete tag from options page
12. Verify tag disappears from Reddit

---

## Implementation Timeline

### Milestone: v9.0.0 - User Tagging

**Deliverables**:
- User tag storage schema
- Tag button injection next to usernames
- Tag dialog UI
- Tag badge display
- Options page management UI
- Import/export functionality
- Unit tests

**Files to Modify**:
- `storage.js` - Add userTags schema and methods
- `content-script.js` - Add tag detection, dialog, and display logic
- `styles.css` - Add tag button, badge, and dialog styles
- `options.html` - Add user tags section
- `options.js` - Add tag management logic
- `options.css` - Add tag management styles
- `tests/user-tags.test.js` - New test file

**Definition of Done**:
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Manual testing complete
- [ ] Dark mode compatible
- [ ] Syncs across browsers

---

## Risk Assessment

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with many tags | Slow page rendering | Use efficient DOM queries, cache tag lookups |
| Dialog positioning issues | Poor UX on small screens | Use responsive positioning, max-width |
| Tag text XSS | Security vulnerability | Escape all tag text before display |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Storage quota limits | Can't save more tags | Enforce 500 tag limit, provide warning |
| Color contrast issues | Tags hard to read | Use white text on all colors, ensure good contrast |

---

## Implementation Notes (v9.0.0)

**Completed**: 2026-01-30

### Changes Made

1. **Storage Schema**:
   - Added `userTags` to DEFAULTS with `enabled`, `maxTags`, and `tags` fields
   - Added `userTags` to SYNC_KEYS for cross-browser sync
   - Added 7 new storage methods: `getUserTags()`, `setUserTags()`, `getUserTag()`, `setUserTag()`, `deleteUserTag()`, `clearUserTags()`, `isUserTagsEnabled()`
   - Implemented LRU eviction when 500 tag limit reached
   - Usernames normalized to lowercase for case-insensitive matching
   - Tag text limited to 50 characters

2. **Content Script** (+250 lines):
   - Added `TAG_COLORS` array with 12 preset colors
   - Added `applyUserTags()` function to find and process all usernames
   - Added `showTagButton()` to inject tag buttons next to untagged users
   - Added `showTagBadge()` to display tag badges for tagged users
   - Added `showTagDialog()` to create modal dialog for tagging
   - Added `closeTagDialog()` to handle dialog cleanup
   - Added `refreshUsernameTags()` to update all instances of a username
   - Added message handlers for `REFRESH_USER_TAGS` and `REFRESH_USER_TAG`
   - Integrated into `watchForDynamicContent()` MutationObserver
   - Dialog includes color picker with 12 preset colors
   - Escape key and overlay click close dialog

3. **CSS** (+300 lines):
   - Added tag button styles (`.orr-tag-btn`) with hover states
   - Added tag badge styles (`.orr-user-tag`) with custom colors
   - Added dialog overlay (`.orr-tag-dialog-overlay`) with fade-in animation
   - Added dialog styles (`.orr-tag-dialog`) with slide-in animation
   - Added dialog header, body, and footer layouts
   - Added color picker grid layout with hover and selected states
   - Added button styles for save/delete/cancel actions
   - Full dark mode support for all elements
   - Mobile responsive design (@media max-width: 768px)

4. **Options Page HTML** (+83 lines):
   - Added complete "User Tags" section after Sort Preferences
   - Added toggle checkbox for enabling/disabling feature
   - Added tags management UI with searchable table
   - Added export/import/clear all buttons
   - Added empty state message

5. **Options Page CSS** (+120 lines):
   - Added styles for tags management section
   - Added table styles with hover states
   - Added tag badge preview and color preview elements
   - Added responsive layout for mobile
   - Dark mode support throughout

6. **Options Page JS** (+220 lines):
   - Added `loadUserTags()` to load feature state
   - Added `refreshUserTagsList()` to display tags table
   - Added `handleUserTagsToggle()` to enable/disable feature
   - Added `handleEditTag()` to edit existing tags
   - Added `handleDeleteTag()` to delete individual tags
   - Added `handleClearAllTags()` to clear all tags
   - Added `handleExportTags()` to export as JSON
   - Added `handleImportTags()` to import from JSON
   - Real-time updates via chrome.tabs.sendMessage

7. **Tests** (+25 tests, 245 total):
   - Created `tests/user-tags.test.js` with comprehensive coverage
   - Tests for storage methods
   - Tests for username normalization (lowercase)
   - Tests for tag validation (text length, color format)
   - Tests for LRU eviction
   - Tests for HTML escaping (security)
   - Tests for color presets
   - Tests for CSS selectors
   - Tests for DOM manipulation
   - Tests for edge cases

8. **Documentation**:
   - Updated `CHANGELOG.md` with v9.0.0 entry
   - Updated `ROADMAP.md` to mark Phase 4.2 as complete
   - Updated implementation plan with completion notes

### Acceptance Criteria Met

- ✅ Tag button appears next to all usernames on Reddit
- ✅ Clicking tag button opens tag dialog
- ✅ User can enter tag text (max 50 characters enforced)
- ✅ User can select from 12 preset colors
- ✅ Saving tag displays badge next to username
- ✅ Tags persist across page loads and browser sessions
- ✅ Tags appear on all Reddit pages (posts, comments, profiles)
- ✅ User can edit existing tags (click badge or use options page)
- ✅ User can delete tags (dialog or options page)
- ✅ Options page shows all tags in searchable table
- ✅ Tags can be exported/imported as JSON
- ✅ Feature can be toggled on/off
- ✅ Tags sync across browser instances
- ✅ Maximum 500 tags enforced with LRU eviction
- ✅ Dark mode compatible throughout

### Technical Details

**Tag Colors**:
- 12 carefully chosen colors with good contrast against white text
- Colors include: Red, Orange, Yellow, Green, Teal, Blue, Purple, Pink, Gray, Brown, Deep Orange, Cyan
- All colors use 6-digit hex format (#RRGGBB)

**Security**:
- All tag text HTML-escaped using div.textContent before display
- All usernames HTML-escaped to prevent XSS
- No eval() or innerHTML with user content

**Performance**:
- Tags applied efficiently with querySelector and MutationObserver
- Usernames marked as processed (`.orr-tagged`) to avoid duplicate processing
- Dialog is singleton - only one can be open at a time
- Real-time updates use targeted message passing

**UX Features**:
- Dialog animations (fade-in overlay, slide-in dialog)
- Color picker with visual selection feedback
- Escape key closes dialog
- Click overlay to close dialog
- Focus input on dialog open
- Confirm dialogs for destructive actions
- Loading states handled gracefully

### Known Limitations

1. **Username detection**: Only detects usernames in `.author` elements (standard Reddit structure)
2. **Tag limit**: Hard limit of 500 tags with LRU eviction
3. **Color picker**: Fixed 12 presets, no custom color input
4. **Edit in options**: Basic prompt dialog, not full modal

### Next Steps

**Phase 4 has one remaining feature:**
- Phase 4.3: Scroll Position Memory (status: Under Consideration)

Or move to Phase 5 features if more capabilities are desired.

---

_Last Updated: 2026-01-30_
_Status: v9.0.0 - ✅ COMPLETE_

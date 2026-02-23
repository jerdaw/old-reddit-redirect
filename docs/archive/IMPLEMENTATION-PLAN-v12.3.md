# Implementation Plan: v12.3.0 - Custom Views & Layouts (Phase 9.4)

**Version**: 12.3.0
**Phase**: 9.4 - Custom Views & Layouts
**Target Release**: 2026-02-07
**Estimated Duration**: 4-5 days
**Document Version**: 1.0
**Created**: 2026-01-30

---

## Executive Summary

This document outlines the implementation plan for **v12.3.0 - Custom Views & Layouts**, which will allow users to save and quickly switch between custom combinations of feed enhancement settings. This addresses Phase 9.4 of the roadmap and completes the "Advanced User Features" phase alongside user muting (9.1), advanced keyword filtering (9.2), and customizable keyboard shortcuts (9.3).

**Key Deliverables**:

- Layout preset system with save/load/delete functionality
- Quick-switch interface in popup and keyboard shortcuts
- Per-subreddit layout preferences with auto-apply
- Import/export layout configurations as JSON
- Keyboard shortcuts for switching between layouts
- Comprehensive test coverage (30+ new tests)

---

## Current State Assessment

### Repository Overview

**Current Version**: 12.1.0 (v12.2.0 pending documentation and release)
**Architecture**: Manifest V3 browser extension (Chrome/Firefox)
**Test Coverage**: 523 tests across 16 test suites
**Recent Changes**:

- v12.0.0: User muting (34 tests, 230 LOC)
- v12.1.0: Advanced keyword filtering (46 tests, 370 LOC)
- v12.2.0: Customizable keyboard shortcuts (92 tests, ~1400 LOC) - **in progress**

### Existing Feed Enhancement Settings

The extension currently has **7 feed enhancement toggles**:

1. **compactMode** - Reduce spacing between posts
2. **textOnlyMode** - Hide all images and thumbnails
3. **hideJoinButtons** - Remove join buttons from subreddit headers
4. **hideActionLinks** - Remove action links (save, hide, report)
5. **uncropImages** - Show full aspect ratio thumbnails
6. **customCSS** - User-provided CSS injection
7. **customCSSEnabled** - Toggle for custom CSS

**Current Limitations**:

- Users must manually toggle each setting individually
- No way to save combinations as named presets
- No quick-switch mechanism between different "modes"
- No per-subreddit layout preferences
- Switching between reading modes requires multiple clicks

**User Pain Points** (from competitive analysis):

- Want "reading mode" preset (compact + text-only)
- Want "image browsing mode" preset (uncropped images, no compact)
- Want "clean mode" preset (hide all clutter)
- Want different layouts for different subreddits (e.g., r/pics vs r/AskReddit)
- Want keyboard shortcuts to switch layouts quickly

### Technical Foundation

**Storage Infrastructure**:

- `feedEnhancements` object with 7 boolean/string fields
- All settings sync across browsers via `chrome.storage.sync`
- Settings persistence and validation in `storage.js`

**UI Integration Points**:

- Popup UI (`popup.js`) - Current location for toggle switches
- Options page (`options.js`) - Detailed settings management
- Content script (`content-script.js`) - Applies feed enhancements
- Background script (`background.js`) - Messaging and state management

**Related Features**:

- Keyboard shortcuts system (v12.2.0) - Can be extended for layout switching
- Storage API (v11.0.0+) - Robust storage abstraction layer
- Import/export infrastructure (v12.0.0+) - Pattern established for JSON export

---

## Feature Specification

### 1. Layout Presets

**Definition**: A layout preset is a named combination of feed enhancement settings that can be saved, loaded, and quickly switched.

**Preset Structure**:

```javascript
{
  id: "preset-uuid",
  name: "Reading Mode",
  description: "Compact text-only view for focused reading",
  icon: "📖", // Optional emoji icon
  settings: {
    compactMode: true,
    textOnlyMode: true,
    hideJoinButtons: true,
    hideActionLinks: true,
    uncropImages: false,
    customCSSEnabled: false
  },
  createdAt: "2026-01-30T12:00:00Z",
  lastUsed: "2026-01-30T14:30:00Z"
}
```

**Default Presets** (5 built-in, non-deletable):

1. **Default** - All enhancements disabled (Reddit's default appearance)
2. **Reading Mode** - Compact + text-only for focused reading
3. **Image Browsing** - Uncropped images + clean layout
4. **Minimal** - Hide all clutter, keep images
5. **Power User** - Compact + uncropped + clean (everything enabled)

**User Presets** (up to 10 custom):

- User-created presets
- Fully customizable names and settings
- Can be edited, deleted, exported, imported
- LRU eviction if limit exceeded

### 2. Quick-Switch Interface

**Popup Integration**:

- Add "Layout" section above or below current toggles
- Show current active preset name
- Dropdown or button grid to switch presets
- "Save Current as Preset" button
- "Manage Presets" link to options page

**Keyboard Shortcuts** (extends v12.2.0 system):

- `1` - Switch to preset #1 (Default)
- `2` - Switch to preset #2 (Reading Mode)
- `3` - Switch to preset #3 (Image Browsing)
- `4` - Switch to preset #4 (Minimal)
- `5` - Switch to preset #5 (Power User)
- `Ctrl+Shift+1-5` - Switch to user preset #1-5
- `L` - Open layout quick-switcher overlay

**Quick-Switcher Overlay** (similar to help overlay):

- Press `L` to show floating layout switcher
- Grid of preset cards with icons and names
- Click to switch, ESC to close
- Shows which preset is currently active
- "Create New" and "Manage" buttons

### 3. Per-Subreddit Layout Preferences

**Feature**: Automatically apply specific layouts when visiting certain subreddits

**Storage Structure**:

```javascript
{
  subredditLayouts: {
    "pics": "preset-image-browsing",
    "AskReddit": "preset-reading-mode",
    "programming": "preset-minimal",
    // ...up to 100 subreddit mappings
  }
}
```

**Behavior**:

- When navigating to r/pics, automatically apply "Image Browsing" preset
- When navigating to r/AskReddit, automatically apply "Reading Mode" preset
- Visual indicator in popup showing "Auto-applied: Reading Mode (r/AskReddit)"
- Option to disable auto-apply per subreddit
- Option to globally disable auto-apply

**UI**:

- Options page: Table of subreddit → layout mappings
- Add mapping: Subreddit input + preset dropdown
- Remove mapping: Delete button per row
- Import/export subreddit mappings as JSON

### 4. Preset Management

**Options Page UI**:

- New "Layout Presets" section
- Table of all presets (default + user)
- Actions per preset:
  - **Edit** - Modify name, description, icon, settings
  - **Duplicate** - Create copy for customization
  - **Delete** - Remove user preset (default presets can't be deleted)
  - **Set as Default** - Auto-apply when extension loads
  - **Test** - Apply temporarily to preview

**Create/Edit Modal**:

- Preset name input (required, max 50 chars)
- Description textarea (optional, max 200 chars)
- Icon picker (emoji or text, max 5 chars)
- Checkboxes for each feed enhancement setting
- "Apply Custom CSS" checkbox
- Save/Cancel buttons

**Import/Export**:

- Export single preset to JSON file
- Export all presets to JSON file
- Import preset(s) from JSON file
- Merge strategy: Skip duplicates, add new, or overwrite

### 5. Storage Schema

**New Storage Objects**:

```javascript
{
  layoutPresets: {
    enabled: true,
    currentPresetId: "default", // Active preset
    defaultPresetId: "default", // Auto-apply on extension load
    presets: {
      "default": { /* Default preset */ },
      "reading-mode": { /* Reading preset */ },
      "image-browsing": { /* Image preset */ },
      "minimal": { /* Minimal preset */ },
      "power-user": { /* Power preset */ },
      // User presets with UUID keys
    },
    subredditMappings: {
      "pics": "image-browsing",
      "AskReddit": "reading-mode",
      // ... up to 100 mappings
    },
    autoApply: true, // Enable/disable auto-apply
    showQuickSwitcher: true, // Show quick-switcher overlay
  }
}
```

**Storage API Methods** (add to `storage.js`):

- `getLayoutPresets()` - Get all presets
- `getLayoutPreset(id)` - Get single preset
- `setLayoutPreset(id, preset)` - Save/update preset
- `deleteLayoutPreset(id)` - Delete user preset
- `getCurrentLayout()` - Get active preset ID
- `setCurrentLayout(id)` - Set active preset
- `getSubredditLayout(subreddit)` - Get mapped layout for subreddit
- `setSubredditLayout(subreddit, presetId)` - Map subreddit to layout
- `removeSubredditLayout(subreddit)` - Remove mapping

**Estimated Storage Size**:

- Default presets: ~2 KB (5 presets × 400 bytes)
- User presets: ~4 KB (10 presets × 400 bytes)
- Subreddit mappings: ~5 KB (100 mappings × 50 bytes)
- **Total**: ~11 KB (well within chrome.storage.sync limits)

---

## Phased Implementation Plan

### Phase 1: Storage Schema & Core Infrastructure (Day 1)

**Goal**: Set up storage schema and core preset management system

**Tasks**:

1. Extend `storage.js` with `layoutPresets` defaults
   - Define 5 default preset objects
   - Add storage schema validation
   - Add migration from v12.2.0 to v12.3.0
2. Implement 8 storage API methods:
   - `getLayoutPresets()`
   - `getLayoutPreset(id)`
   - `setLayoutPreset(id, preset)`
   - `deleteLayoutPreset(id)`
   - `getCurrentLayout()`
   - `setCurrentLayout(id)`
   - `getSubredditLayout(subreddit)`
   - `setSubredditLayout(subreddit, presetId)`
3. Implement preset validation utilities:
   - `validatePresetName(name)` - Check length, uniqueness
   - `validatePresetSettings(settings)` - Validate structure
   - `isDefaultPreset(id)` - Check if preset is built-in
4. Write UUID generation for user presets

**Deliverables**:

- Extended storage schema with `layoutPresets`
- 8 new storage API methods
- 3 validation utility functions
- UUID helper function

**Validation**:

- Unit tests for storage API (10 tests)
- Unit tests for validation (5 tests)
- Schema migration tests (3 tests)

**Estimated Time**: 6-8 hours

---

### Phase 2: Preset Application Logic (Day 2)

**Goal**: Implement logic to apply presets to feed enhancements

**Tasks**:

1. Implement `applyLayoutPreset(presetId)` in content script:
   - Load preset from storage
   - Extract settings object
   - Apply each feed enhancement setting
   - Update UI state (if applicable)
   - Store last used timestamp
2. Implement `detectCurrentPreset()`:
   - Compare current settings to all presets
   - Return matching preset ID or "custom"
   - Used for UI indicator
3. Implement `saveCurrentAsPreset(name, description, icon)`:
   - Capture current feed enhancement settings
   - Generate UUID for new preset
   - Validate and save to storage
   - Return new preset ID
4. Implement per-subreddit auto-apply:
   - Detect current subreddit in content script
   - Check `subredditMappings` for match
   - Auto-apply mapped preset if found
   - Show notification if auto-applied
5. Add message passing between background/content scripts:
   - `applyPreset` message
   - `getCurrentPreset` message
   - `saveAsPreset` message

**Deliverables**:

- Preset application logic (~150 lines)
- Current preset detection
- Save current as preset functionality
- Auto-apply per-subreddit logic
- Message handlers

**Validation**:

- Integration tests for apply logic (5 tests)
- Auto-apply tests (5 tests)
- Message passing tests (3 tests)

**Estimated Time**: 6-8 hours

---

### Phase 3: Popup UI & Quick-Switcher (Day 3)

**Goal**: Build popup interface and quick-switcher overlay

**Tasks**:

1. Update `popup.html`:
   - Add "Layout Presets" section
   - Current preset indicator
   - Preset dropdown/button grid
   - "Save Current" button
   - "Manage Presets" link to options
2. Update `popup.js`:
   - Load current preset on popup open
   - Populate preset dropdown
   - Handle preset switch
   - Handle "Save Current" click
   - Update indicator when preset changes
3. Implement quick-switcher overlay in content script:
   - Create floating overlay UI
   - Grid of preset cards (icon + name)
   - Active preset highlighting
   - Click to switch, ESC to close
   - "Create New" and "Manage" buttons
4. Add CSS styles for quick-switcher:
   - Overlay backdrop
   - Preset card grid (responsive)
   - Active state styling
   - Animations (fade-in, scale)
5. Integrate keyboard shortcut `L` for quick-switcher:
   - Add to keyboard shortcuts system (v12.2.0)
   - Add shortcuts `1-5` for default presets
   - Add shortcuts `Ctrl+Shift+1-5` for user presets

**Deliverables**:

- Updated popup UI (~100 lines HTML)
- Popup logic (~150 lines JS)
- Quick-switcher overlay (~200 lines)
- CSS styles (~150 lines)
- Keyboard shortcut integration

**Validation**:

- Manual testing of popup UI
- Manual testing of quick-switcher
- Keyboard shortcut tests (5 tests)

**Estimated Time**: 8-10 hours

---

### Phase 4: Options Page Management UI (Day 4)

**Goal**: Build comprehensive preset management interface

**Tasks**:

1. Add "Layout Presets" section to `options.html`:
   - Master toggle for layout presets feature
   - Presets management table
   - Create/Edit modal
   - Import/Export buttons
   - Subreddit mappings table
2. Implement preset table in `options.js`:
   - Load and display all presets
   - Group by default vs. user
   - Edit/Duplicate/Delete/Test buttons per row
   - Set as default button
   - Visual indicator for current preset
3. Implement create/edit modal:
   - Name, description, icon inputs
   - Feed enhancement checkboxes
   - Live preview of settings
   - Validation with error messages
   - Save/Cancel buttons
4. Implement preset actions:
   - Edit preset (open modal with values)
   - Duplicate preset (clone and rename)
   - Delete preset (confirm dialog)
   - Set as default (update defaultPresetId)
   - Test preset (temporarily apply)
5. Implement subreddit mappings table:
   - Load and display all mappings
   - Add mapping (subreddit input + preset dropdown)
   - Remove mapping (delete button)
   - Auto-apply toggle
6. Implement import/export:
   - Export single preset to JSON
   - Export all presets to JSON
   - Import preset(s) from JSON
   - Validation and merge strategy

**Deliverables**:

- Layout presets section (~200 lines HTML)
- Management UI logic (~400 lines JS)
- Create/edit modal
- Subreddit mappings interface
- Import/export functionality
- CSS styles (~150 lines)

**Validation**:

- Manual testing of all CRUD operations
- Import/export tests (5 tests)
- Validation tests (4 tests)

**Estimated Time**: 10-12 hours

---

### Phase 5: Testing & Documentation (Day 5)

**Goal**: Comprehensive testing, documentation, and release preparation

**Tasks**:

1. Write comprehensive test suite:
   - Storage API tests (10 tests)
   - Validation tests (5 tests)
   - Preset application tests (5 tests)
   - Auto-apply tests (5 tests)
   - Import/export tests (5 tests)
   - Keyboard shortcuts tests (3 tests)
   - **Target**: 33+ new tests (523 → 556+ total)
2. Update documentation:
   - CHANGELOG.md entry for v12.3.0
   - README.md section on layout presets
   - CLAUDE.md update (test count, feature count)
   - ROADMAP.md mark Phase 9.4 complete
3. Manual testing checklist:
   - Test all 5 default presets
   - Create, edit, delete user presets
   - Test quick-switcher overlay
   - Test popup preset switcher
   - Test subreddit auto-apply
   - Test import/export
   - Test keyboard shortcuts
   - Cross-browser testing (Chrome, Firefox)
4. Update version numbers:
   - package.json: 12.2.0 → 12.3.0
   - manifest.json: 12.2.0 → 12.3.0
   - Sync version script
5. Performance validation:
   - Measure storage usage (<15 KB)
   - Measure preset switch latency (<100ms)
   - Measure auto-apply latency (<50ms)
   - No impact on page load time

**Deliverables**:

- Comprehensive test suite (33+ tests)
- Updated documentation (4 files)
- Manual test results
- Performance benchmarks
- Version bump to 12.3.0

**Validation**:

- All tests passing
- Documentation review
- Performance benchmarks met
- No regressions

**Estimated Time**: 8-10 hours

---

## Technical Architecture

### Storage Schema Design

**Hierarchy**:

```
layoutPresets (object)
├── enabled (boolean)
├── currentPresetId (string)
├── defaultPresetId (string)
├── autoApply (boolean)
├── showQuickSwitcher (boolean)
├── presets (object)
│   ├── default (object)
│   ├── reading-mode (object)
│   ├── image-browsing (object)
│   ├── minimal (object)
│   ├── power-user (object)
│   └── [user-preset-uuid] (object)
└── subredditMappings (object)
    ├── "pics" (string)
    ├── "AskReddit" (string)
    └── ...
```

**Preset Object Schema**:

```javascript
{
  id: string,              // UUID or preset slug
  name: string,            // Display name (max 50 chars)
  description: string,     // Optional (max 200 chars)
  icon: string,            // Emoji or text (max 5 chars)
  isDefault: boolean,      // True for built-in presets
  settings: {
    compactMode: boolean,
    textOnlyMode: boolean,
    hideJoinButtons: boolean,
    hideActionLinks: boolean,
    uncropImages: boolean,
    customCSSEnabled: boolean
  },
  createdAt: string,       // ISO 8601 timestamp
  lastUsed: string         // ISO 8601 timestamp
}
```

### Application Flow

**Preset Switch Flow**:

1. User clicks preset in popup/quick-switcher or presses keyboard shortcut
2. `applyLayoutPreset(presetId)` called in content script
3. Load preset from storage via storage API
4. Extract settings object
5. For each setting, update corresponding state
6. Trigger re-render of affected UI elements
7. Update `currentPresetId` in storage
8. Update `lastUsed` timestamp for preset
9. Show toast notification (optional)

**Auto-Apply Flow**:

1. Content script initializes on page load
2. Detect current subreddit from URL
3. Check if `autoApply` is enabled
4. Query `subredditMappings` for current subreddit
5. If mapping exists, load and apply preset
6. Show notification: "Auto-applied: [Preset Name]"
7. Update current preset indicator

**Create Preset Flow**:

1. User clicks "Save Current as Preset"
2. Capture current feed enhancement settings
3. Open create modal with pre-filled settings
4. User enters name, description, icon
5. Validate inputs (name required, unique)
6. Generate UUID for new preset
7. Save preset to storage
8. Add to presets table in UI
9. Show success toast

### Performance Considerations

**Storage Access**:

- Presets loaded once on extension initialization
- Cached in memory for fast switching
- Only write to storage on preset create/edit/delete
- Debounce writes to prevent excessive storage calls

**DOM Manipulation**:

- Batch preset application updates
- Use requestAnimationFrame for UI updates
- Minimize reflows/repaints during switch
- Target: <100ms preset switch latency

**Memory Usage**:

- Preset cache: ~20 KB (15 presets × 1.3 KB overhead)
- Quick-switcher overlay: Render on-demand, destroy on close
- No persistent event listeners (use event delegation)

---

## Risk Assessment & Mitigation

| Risk                                         | Likelihood | Impact | Mitigation                                                       |
| -------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------- |
| Preset switching too slow                    | Medium     | Medium | Optimize with caching, batch DOM updates, profile performance    |
| Storage quota exceeded                       | Low        | High   | Enforce 10 preset limit, 100 subreddit limit, validate on import |
| Preset settings conflict with manual toggles | High       | Medium | Clear UI indicator, "Custom" preset when manually changed        |
| User confusion with multiple interfaces      | Medium     | Medium | Consistent UI language, tooltips, help text                      |
| Import/export compatibility                  | Low        | Low    | Version field, schema validation, error messages                 |
| Auto-apply breaks expected behavior          | Medium     | Medium | Clear notifications, easy disable, manual override               |
| Keyboard shortcut conflicts                  | Low        | Medium | Use v12.2.0 conflict detection, allow remapping                  |

**Critical Path Dependencies**:

- Phase 1 must complete before Phase 2 (storage before logic)
- Phase 2 must complete before Phase 3 (logic before UI)
- Keyboard shortcut integration requires v12.2.0 completion

**Rollback Strategy**:

- **Level 1**: Disable feature via `layoutPresets.enabled = false` (1 minute)
- **Level 2**: Revert to v12.2.0 (1 hour, lose layout presets only)
- **Level 3**: Clear user presets via storage API (preserve default presets)

---

## Success Criteria

**Functional Requirements**:

- ✅ Users can create, edit, delete custom layout presets
- ✅ 5 default presets available out-of-box
- ✅ Quick-switch via popup, keyboard shortcuts, or overlay
- ✅ Per-subreddit auto-apply works correctly
- ✅ Import/export preserves all preset data
- ✅ No conflicts with existing feed enhancement toggles

**Performance Requirements**:

- ✅ Preset switch latency <100ms
- ✅ Auto-apply latency <50ms
- ✅ Storage usage <15 KB
- ✅ No impact on page load time
- ✅ Quick-switcher overlay renders in <200ms

**Quality Requirements**:

- ✅ 33+ new tests (95%+ pass rate)
- ✅ ESLint passing
- ✅ Prettier formatted
- ✅ No regressions in existing tests
- ✅ Cross-browser compatibility (Chrome, Firefox)

**User Experience Requirements**:

- ✅ Clear visual feedback on preset switch
- ✅ Intuitive preset management UI
- ✅ Helpful tooltips and descriptions
- ✅ Responsive to keyboard and mouse input
- ✅ Accessible (ARIA labels, keyboard navigation)

---

## Timeline & Milestones

**Total Duration**: 4-5 days (38-48 hours)

| Day | Phase                             | Hours | Milestone                                       |
| --- | --------------------------------- | ----- | ----------------------------------------------- |
| 1   | Phase 1: Storage & Infrastructure | 6-8   | Storage schema complete, 18 tests passing       |
| 2   | Phase 2: Application Logic        | 6-8   | Preset switching functional, 13 tests passing   |
| 3   | Phase 3: Popup & Quick-Switcher   | 8-10  | UI working, keyboard shortcuts integrated       |
| 4   | Phase 4: Options Page UI          | 10-12 | Full management interface, import/export done   |
| 5   | Phase 5: Testing & Documentation  | 8-10  | 556+ tests passing, docs updated, v12.3.0 ready |

**Critical Milestones**:

- **Day 1 EOD**: Storage API functional, unit tests passing
- **Day 2 EOD**: Can apply presets programmatically, auto-apply working
- **Day 3 EOD**: Popup and quick-switcher fully functional
- **Day 4 EOD**: Options page complete, all CRUD operations working
- **Day 5 EOD**: All tests passing, documentation complete, ready for release

**Target Release Date**: 2026-02-07 (1 week from start)

---

## Rollout Strategy

### Pre-Release Checklist

- [ ] All phases complete (1-5)
- [ ] 556+ tests passing (95%+ pass rate)
- [ ] ESLint and Prettier passing
- [ ] Cross-browser testing complete
- [ ] Documentation updated
- [ ] Version numbers synchronized
- [ ] Manual testing checklist complete
- [ ] Performance benchmarks met
- [ ] No critical bugs or regressions

### Release Steps

1. **Final Testing** (Day 5 AM)
   - Run full test suite
   - Manual testing on Chrome and Firefox
   - Verify import/export with edge cases
   - Test auto-apply on multiple subreddits

2. **Documentation Freeze** (Day 5 PM)
   - CHANGELOG.md finalized
   - README.md updated
   - ROADMAP.md Phase 9 marked complete
   - GitHub release notes drafted

3. **Version Bump** (Day 5 PM)
   - Update package.json: 12.2.0 → 12.3.0
   - Update manifest.json: 12.2.0 → 12.3.0
   - Run `npm run version:sync`
   - Verify versions match

4. **Build & Package** (Day 5 PM)
   - Run `make clean && make`
   - Verify old-reddit-redirect.zip contents
   - Test zip in fresh browser profile

5. **Git Commit & Tag** (Day 5 PM)
   - Commit all changes: "Release v12.3.0 - Custom Views & Layouts"
   - Tag: `git tag v12.3.0`
   - Push: `git push && git push --tags`

6. **Store Submission** (Day 5 PM or Day 6)
   - Submit to Chrome Web Store
   - Submit to Firefox Add-ons
   - Update store descriptions with new feature

### Monitoring Plan

**First 24 Hours**:

- Monitor GitHub issues for bug reports
- Check browser store reviews
- Monitor error logs (if available)
- Be ready to hotfix critical issues

**First Week**:

- Collect user feedback on layout presets
- Track preset creation/usage via anonymous analytics (if implemented)
- Identify most popular default presets
- Plan improvements for next version

---

## Post-Release Considerations

### Potential Enhancements (v12.4.0+)

1. **Preset Sharing Community**
   - Public preset repository
   - Browse and install community presets
   - Rate and review presets

2. **Advanced Preset Features**
   - Time-based auto-apply (dark mode at night)
   - Context-aware presets (work vs. home)
   - Preset triggers (URL patterns, day of week)

3. **Visual Preset Editor**
   - Live preview of preset settings
   - Side-by-side comparison
   - Before/after screenshots

4. **Preset Analytics**
   - Track most-used presets
   - Suggest presets based on usage
   - Auto-optimize presets

### Known Limitations

1. **Custom CSS in Presets**
   - Custom CSS is enabled/disabled as a whole
   - Cannot have different custom CSS per preset
   - Workaround: Use separate preset for custom CSS

2. **Preset Limit**
   - 10 user presets (5 default + 10 custom = 15 total)
   - Storage quota constraints
   - May increase in future if demand exists

3. **No Preset Sync Across Devices**
   - Presets sync via chrome.storage.sync
   - Depends on browser sync being enabled
   - No cloud backup or cross-browser sync

---

## Unknowns & Assumptions

### Assumptions

1. **Storage Availability**
   - Assume chrome.storage.sync quota sufficient (~11 KB < 100 KB limit)
   - Assume browser sync is enabled for cross-device use
   - Assume storage write frequency is low (<10 writes per session)

2. **User Behavior**
   - Assume users will create 2-3 custom presets on average
   - Assume subreddit mappings will be used for 5-10 subreddits
   - Assume quick-switcher will be primary switching method

3. **Technical Constraints**
   - Assume v12.2.0 keyboard shortcuts system is complete
   - Assume feed enhancements remain stable (no breaking changes)
   - Assume storage schema migrations work as expected

### Unknowns

1. **User Demand**
   - How many users will actually use layout presets?
   - Will default presets be sufficient or will custom presets be popular?
   - Is per-subreddit auto-apply a commonly desired feature?

2. **Performance**
   - What is the actual preset switch latency on low-end devices?
   - Will quick-switcher overlay cause performance issues on old browsers?
   - How much memory will preset caching consume in practice?

3. **Usability**
   - Will users understand the concept of layout presets?
   - Is the quick-switcher overlay intuitive or confusing?
   - Should default presets be editable or strictly read-only?

**Mitigation for Unknowns**:

- Collect feedback via GitHub issues
- Monitor usage patterns (if analytics implemented)
- Iterate based on real-world usage
- Be prepared to adjust limits and defaults

---

## Appendix: Default Presets Specification

### Preset 1: Default

```javascript
{
  id: "default",
  name: "Default",
  description: "Reddit's default appearance (all enhancements disabled)",
  icon: "🌐",
  isDefault: true,
  settings: {
    compactMode: false,
    textOnlyMode: false,
    hideJoinButtons: false,
    hideActionLinks: false,
    uncropImages: false,
    customCSSEnabled: false
  }
}
```

### Preset 2: Reading Mode

```javascript
{
  id: "reading-mode",
  name: "Reading Mode",
  description: "Compact text-only view for focused reading",
  icon: "📖",
  isDefault: true,
  settings: {
    compactMode: true,
    textOnlyMode: true,
    hideJoinButtons: true,
    hideActionLinks: true,
    uncropImages: false,
    customCSSEnabled: false
  }
}
```

### Preset 3: Image Browsing

```javascript
{
  id: "image-browsing",
  name: "Image Browsing",
  description: "Uncropped images with clean layout for visual content",
  icon: "🖼️",
  isDefault: true,
  settings: {
    compactMode: false,
    textOnlyMode: false,
    hideJoinButtons: true,
    hideActionLinks: true,
    uncropImages: true,
    customCSSEnabled: false
  }
}
```

### Preset 4: Minimal

```javascript
{
  id: "minimal",
  name: "Minimal",
  description: "Hide all clutter while keeping images visible",
  icon: "✨",
  isDefault: true,
  settings: {
    compactMode: false,
    textOnlyMode: false,
    hideJoinButtons: true,
    hideActionLinks: true,
    uncropImages: false,
    customCSSEnabled: false
  }
}
```

### Preset 5: Power User

```javascript
{
  id: "power-user",
  name: "Power User",
  description: "Everything enabled for maximum efficiency",
  icon: "⚡",
  isDefault: true,
  settings: {
    compactMode: true,
    textOnlyMode: false,
    hideJoinButtons: true,
    hideActionLinks: true,
    uncropImages: true,
    customCSSEnabled: false
  }
}
```

---

## Conclusion

This implementation plan provides a comprehensive roadmap for v12.3.0 - Custom Views & Layouts (Phase 9.4). Upon completion, users will have a powerful system for saving, switching, and auto-applying layout combinations, completing the Advanced User Features phase of the roadmap.

**Expected Impact**:

- **+33 tests** (523 → 556 total)
- **+900 lines of code** (storage, UI, logic, tests)
- **+1 major feature** (28 → 29 total features)
- **Phase 9 complete** (4 sub-features implemented)

**Next Phase**: After Phase 9 completion, the roadmap suggests **Phase 6: Performance & Optimization** as the next major focus area.

---

_Document created: 2026-01-30_
_Target release: 2026-02-07_

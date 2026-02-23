# Implementation Plan: v12.2.0 - Customizable Keyboard Shortcuts

**Version**: 12.2.0
**Phase**: 9.3 - Customizable Keyboard Shortcuts
**Target Release**: 2026-01-31
**Estimated Duration**: 3-4 days
**Document Version**: 1.1
**Last Updated**: 2026-01-30

## Implementation Progress

**Current Status**: All Phases Complete ✅ - Ready for Release

| Phase                                         | Status      | Tests           | Notes                                     |
| --------------------------------------------- | ----------- | --------------- | ----------------------------------------- |
| Phase 1: Storage Schema & Core Infrastructure | ✅ Complete | 56/56 passing   | All utilities implemented and tested      |
| Phase 2: Content Script Keyboard Handler      | ✅ Complete | 74/74 passing   | All actions and UI implemented            |
| Phase 3: Options UI & Conflict Detection      | ✅ Complete | 92/92 passing   | Full management UI with import/export     |
| Phase 4: Testing & Documentation              | ✅ Complete | 523/523 passing | All documentation updated, version bumped |

**Phase 1 Completion Summary**:

- ✅ Extended `storage.js` with keyboard shortcuts schema (11 default shortcuts)
- ✅ Added 8 storage API methods for shortcut management
- ✅ Created `keyboard-utils.js` with 9 utility functions
- ✅ Implemented 56 unit tests (all passing)
- ✅ ESLint validation passing
- ✅ Prettier formatting applied

**Phase 2 Completion Summary**:

- ✅ Implemented Map-based shortcut registry in content script
- ✅ Added centralized keyboard event handler with chord support
- ✅ Implemented 7 new shortcut actions (dark mode, compact, text-only, palette, images, help, vim-jump)
- ✅ Created visual feedback system (toast notifications)
- ✅ Built keyboard help overlay with categorized shortcuts
- ✅ Deprecated old keyboard handlers (handleNavigationKeyboard, handleJumpToTopKeyboard)
- ✅ Added 280+ lines of CSS for feedback and help UI
- ✅ Implemented 18 integration tests (all passing)
- ✅ Total: 74 tests passing

**Phase 3 Completion Summary**:

- ✅ Added keyboard shortcuts section to options.html (~145 lines)
- ✅ Implemented shortcuts management table with grouping
- ✅ Created edit modal with real-time key capture
- ✅ Added conflict detection with visual warnings
- ✅ Implemented import/export functionality (JSON format)
- ✅ Added reset shortcuts features (individual and all)
- ✅ Implemented ~600 lines of JavaScript for management UI
- ✅ Added ~190 lines of CSS for options UI styling
- ✅ Implemented 18 new tests for conflict detection, import/export, validation
- ✅ Total: 92 tests passing (523 overall)

**Phase 4 Completion Summary**:

- ✅ Updated CHANGELOG.md with comprehensive v12.2.0 entry (~150 lines)
- ✅ Updated README.md with keyboard shortcuts section
- ✅ Updated CLAUDE.md with new test count (523 tests) and v12.2.0 feature documentation
- ✅ Updated ROADMAP.md marking Phase 9.3 as complete
- ✅ Bumped version numbers in package.json and manifest.json (12.1.0 → 12.2.0)
- ✅ Verified version synchronization with npm run version:sync
- ✅ All 523 tests passing (16 test suites)
- ✅ ESLint validation passing (no errors)
- ✅ Prettier formatting applied (all files formatted)
- ✅ Total implementation: ~1,250 lines of code added
- ✅ Ready for release

---

## Executive Summary

This document outlines the implementation plan for **v12.2.0 - Customizable Keyboard Shortcuts**, which will allow users to remap all keyboard shortcuts in the extension to their preferred key combinations. This addresses Phase 9.3 of the roadmap and completes the "Advanced User Features" phase alongside user muting (9.1) and advanced keyword filtering (9.2).

**Key Deliverables**:

- User-defined keyboard shortcuts for all interactive features
- Chord/sequence shortcuts (e.g., `g` then `t` for "go to top")
- Keyboard shortcut conflict detection and warnings
- Import/export keyboard mappings as JSON
- Visual keyboard shortcut reference/help overlay
- Comprehensive test coverage (40+ new tests)

---

## Current State Assessment

### Repository Overview

**Current Version**: 12.1.0
**Architecture**: Manifest V3 browser extension (Chrome/Firefox)
**Test Coverage**: 431 tests across 15 test suites
**Recent Changes**:

- v12.0.0: User muting (34 tests, 230 LOC)
- v12.1.0: Advanced keyword filtering (46 tests, 370 LOC)

### Existing Keyboard Shortcuts

The extension currently has **4 hardcoded keyboard shortcuts**:

1. **Alt+Shift+R** - Toggle redirect on/off (manifest command)
2. **Shift+J** - Navigate to next parent comment (content script)
3. **Shift+K** - Navigate to previous parent comment (content script)
4. **Shift+Home** - Jump to top of page (content script)

**Current Implementation**:

- Manifest command: Defined in `manifest.json`, handled in `background.js`
- Content script shortcuts: Handled directly in `content-script.js` with hardcoded key checks
- No user customization available
- No conflict detection
- No help system

### Features Lacking Keyboard Shortcuts

**High-Value Features** (would benefit from shortcuts):

1. Toggle dark mode (Auto/Light/Dark/OLED)
2. Toggle compact feed mode
3. Toggle text-only mode
4. Toggle nag blocking categories (trending, AI, etc.)
5. Toggle comment color-coding
6. Toggle inline image expansion
7. Cycle through comment color palettes
8. Quick-toggle redirect for current tab only
9. Open options page
10. Export statistics

**Lower-Priority Features**:

- Individual nag blocking toggles
- Filter toggles (flair, score, etc.)

### Technical Constraints

**Manifest V3 Limitations**:

- Command shortcuts (manifest.json) are limited and managed by browser
- Content script shortcuts have no built-in API
- Must handle focus/input conflicts (don't trigger in text fields)
- Chord shortcuts require custom state management

**Browser Compatibility**:

- Chrome: Full support for `chrome.commands` API
- Firefox: Good support but some limitations on shortcut keys
- Must test cross-browser compatibility

**Performance Considerations**:

- Keyboard listeners must be lightweight (<1ms per keypress)
- Chord timeout should be configurable (default: 1000ms)
- Must not interfere with Reddit's native shortcuts

### Key Unknowns and Assumptions

**Unknowns**:

1. ❓ How many users will actually customize shortcuts? (Assumption: 10-20% of power users)
2. ❓ What's the optimal chord timeout? (Assumption: 1000ms based on Vim/Emacs conventions)
3. ❓ Should we support modifier-only shortcuts (e.g., just "Ctrl")? (Assumption: No, too conflict-prone)

**Assumptions**:

1. ✓ Users want Vim/Emacs-style chord shortcuts (e.g., `g` `g` to go to top)
2. ✓ Conflict detection is critical for UX (prevent broken shortcuts)
3. ✓ Import/export is essential for sharing/backup
4. ✓ Visual help overlay improves discoverability

### Dependencies

**Internal Dependencies**:

- Storage API (`storage.js`) - extend for keyboard shortcuts schema
- Content script - rewrite keyboard handling to use dynamic shortcuts
- Options page - add keyboard shortcuts management UI
- Background script - handle manifest command customization (if possible)

**External Dependencies**:

- Chrome Extensions API: `chrome.commands` for manifest shortcuts
- Browser keyboard event APIs: `KeyboardEvent`, `event.key`, `event.code`

**No Blocking Dependencies**: All work can proceed independently.

---

## Implementation Architecture

### Storage Schema Design

**New storage object: `keyboardShortcuts`**

```javascript
keyboardShortcuts: {
  enabled: true,                    // Master toggle for custom shortcuts
  chordTimeout: 1000,              // Milliseconds to wait for chord sequence
  shortcuts: {
    // Manifest command (limited customization)
    "toggle-redirect": {
      keys: "Alt+Shift+R",
      description: "Toggle redirect on/off",
      type: "command",              // vs "content"
      enabled: true,
    },

    // Content script shortcuts
    "nav-next-comment": {
      keys: "Shift+J",
      description: "Next parent comment",
      type: "content",
      context: "comments",          // Only active on comment pages
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

    // NEW shortcuts
    "toggle-dark-mode": {
      keys: "d",                    // Chord shortcut: just 'd'
      description: "Toggle dark mode",
      type: "content",
      context: "any",
      enabled: true,
    },

    "go-top-chord": {
      keys: "g g",                  // Chord: press 'g' twice
      description: "Go to top (Vim-style)",
      type: "content",
      context: "any",
      enabled: false,               // Optional alternative to Shift+Home
    },

    "toggle-compact-mode": {
      keys: "c",
      description: "Toggle compact feed mode",
      type: "content",
      context: "feed",              // Only on feed pages
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

    "open-options": {
      keys: "Shift+/",              // Same as Reddit's help shortcut
      description: "Open keyboard shortcuts help",
      type: "content",
      context: "any",
      enabled: true,
    },
  },

  // Conflict warnings
  conflicts: [],                    // Array of { shortcut1, shortcut2, keys }
}
```

**Storage Size**: ~2KB for default shortcuts, ~5KB with heavy customization (well within limits).

### Keyboard Event Handling System

**Architecture**: Event delegation with priority system

```javascript
// content-script.js

// Chord state management
let chordBuffer = [];
let chordTimeout = null;

// Shortcut registry (populated from storage)
let shortcutRegistry = new Map(); // key: normalized keys, value: action

async function initKeyboardShortcuts() {
  const config = await chrome.storage.sync.get('keyboardShortcuts');
  const shortcuts = config.keyboardShortcuts?.shortcuts || {};

  // Build registry
  shortcutRegistry.clear();
  for (const [id, shortcut] of Object.entries(shortcuts)) {
    if (!shortcut.enabled) continue;
    if (shortcut.type !== 'content') continue; // Skip manifest commands

    const normalizedKeys = normalizeKeyString(shortcut.keys);
    shortcutRegistry.set(normalizedKeys, {
      id,
      action: getActionForShortcut(id),
      context: shortcut.context,
      description: shortcut.description,
    });
  }

  // Attach global listener
  document.addEventListener('keydown', handleKeyboardShortcut, true);
}

function handleKeyboardShortcut(event) {
  // Ignore if in input/textarea/contenteditable
  if (isInputContext(event.target)) return;

  // Ignore if modifier-only press
  if (isModifierKey(event.key)) return;

  // Build current key combination
  const currentKeys = buildKeyString(event);

  // Check for chord shortcuts
  if (isChordShortcut(currentKeys)) {
    handleChordShortcut(event, currentKeys);
    return;
  }

  // Check for direct match
  const shortcut = shortcutRegistry.get(currentKeys);
  if (shortcut && isContextMatch(shortcut.context)) {
    event.preventDefault();
    event.stopPropagation();
    executeShortcutAction(shortcut);
  }
}

function handleChordShortcut(event, currentKeys) {
  chordBuffer.push(currentKeys);

  // Check if buffer matches any chord shortcut
  const chordKeys = chordBuffer.join(' ');
  const shortcut = shortcutRegistry.get(chordKeys);

  if (shortcut && isContextMatch(shortcut.context)) {
    // Match found!
    event.preventDefault();
    event.stopPropagation();
    executeShortcutAction(shortcut);
    clearChordBuffer();
  } else {
    // Set timeout to clear buffer
    clearTimeout(chordTimeout);
    const config = await chrome.storage.sync.get('keyboardShortcuts');
    const timeout = config.keyboardShortcuts?.chordTimeout || 1000;

    chordTimeout = setTimeout(() => {
      clearChordBuffer();
    }, timeout);
  }
}

function executeShortcutAction(shortcut) {
  const actions = {
    'toggle-dark-mode': async () => {
      // Toggle dark mode
      const config = await chrome.storage.local.get('darkMode');
      const modes = ['auto', 'light', 'dark', 'oled'];
      const current = config.darkMode?.enabled || 'auto';
      const nextIndex = (modes.indexOf(current) + 1) % modes.length;
      config.darkMode.enabled = modes[nextIndex];
      await chrome.storage.local.set({ darkMode: config.darkMode });
      applyDarkMode();
      showShortcutFeedback(`Dark mode: ${modes[nextIndex]}`);
    },

    'toggle-compact-mode': async () => {
      const config = await chrome.storage.sync.get('feedEnhancements');
      config.feedEnhancements.compactMode = !config.feedEnhancements.compactMode;
      await chrome.storage.sync.set({ feedEnhancements: config.feedEnhancements });
      applyFeedEnhancements();
      showShortcutFeedback(`Compact mode: ${config.feedEnhancements.compactMode ? 'ON' : 'OFF'}`);
    },

    // ... more actions
  };

  const action = actions[shortcut.id];
  if (action) {
    action();
  }
}
```

**Performance**:

- Event handler: <1ms per keypress
- Registry lookup: O(1) with Map
- Chord buffer: <100 bytes memory

### Options Page UI Design

**New Section**: "Keyboard Shortcuts" (after User Muting, before Scroll Position Memory)

**Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│ Keyboard Shortcuts                                          │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ ☑ Enable custom keyboard shortcuts                          │
│                                                              │
│ Chord timeout: [1000] ms                                    │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Shortcut              Keys         Actions              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Toggle redirect       Alt+Shift+R  [Edit] [Reset] [ ]  │ │
│ │ Next comment          Shift+J      [Edit] [Reset] [✓]  │ │
│ │ Previous comment      Shift+K      [Edit] [Reset] [✓]  │ │
│ │ Jump to top           Shift+Home   [Edit] [Reset] [✓]  │ │
│ │ Toggle dark mode      d            [Edit] [Reset] [✓]  │ │
│ │ Toggle compact mode   c            [Edit] [Reset] [✓]  │ │
│ │ ... (15 total)                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ⚠️ 2 conflicts detected: [View Conflicts]                   │
│                                                              │
│ [Import Shortcuts] [Export Shortcuts] [Reset All]          │
│                                                              │
│ [Show Keyboard Reference] (opens overlay)                   │
└─────────────────────────────────────────────────────────────┘
```

**Edit Modal**:

```
┌─────────────────────────────────────────┐
│ Edit Shortcut: Toggle Dark Mode         │
│ ───────────────────────────────────────  │
│                                          │
│ Press your desired key combination:      │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  d                                   │ │ (shows as user types)
│ └──────────────────────────────────────┘ │
│                                          │
│ ☑ Enable this shortcut                  │
│                                          │
│ Tips:                                    │
│ • For chords, type keys with space      │
│ • Example: "g g" for vim-style          │
│ • Avoid conflicts with Reddit shortcuts │
│                                          │
│ [Cancel] [Clear] [Save]                 │
└─────────────────────────────────────────┘
```

**Conflict Detection UI**:

```
┌─────────────────────────────────────────┐
│ ⚠️ Keyboard Shortcut Conflicts          │
│ ───────────────────────────────────────  │
│                                          │
│ The following shortcuts use the same     │
│ key combination:                         │
│                                          │
│ 1. "d" is assigned to:                  │
│    • Toggle dark mode (enabled)         │
│    • Toggle domain filtering (disabled) │
│                                          │
│ 2. "Shift+J" is assigned to:            │
│    • Next comment (enabled)             │
│    • Jump to subreddit (disabled)       │
│                                          │
│ Only the first enabled shortcut will    │
│ work. Disable one to resolve conflict.  │
│                                          │
│ [Got it]                                │
└─────────────────────────────────────────┘
```

**Keyboard Reference Overlay** (press Shift+/ to show):

```
┌─────────────────────────────────────────────────────────────┐
│                   Keyboard Shortcuts                         │
│                                                               │
│  Navigation                                                   │
│  ───────────────────────────────────────────────────────     │
│  Shift+J        Next parent comment                          │
│  Shift+K        Previous parent comment                      │
│  Shift+Home     Jump to top of page                          │
│  g g            Jump to top (Vim-style, if enabled)          │
│                                                               │
│  Toggles                                                      │
│  ───────────────────────────────────────────────────────     │
│  Alt+Shift+R    Toggle redirect on/off                       │
│  d              Toggle dark mode                             │
│  c              Toggle compact mode                          │
│  t              Toggle text-only mode                        │
│  p              Cycle comment color palette                  │
│                                                               │
│  Other                                                        │
│  ───────────────────────────────────────────────────────     │
│  Shift+/        Show this help                               │
│  Esc            Close this help                              │
│                                                               │
│                                              [Customize...]   │
└─────────────────────────────────────────────────────────────┘
```

### Conflict Detection Algorithm

**Algorithm**: O(n²) comparison with context awareness

```javascript
function detectConflicts(shortcuts) {
  const conflicts = [];
  const entries = Object.entries(shortcuts);

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [id1, shortcut1] = entries[i];
      const [id2, shortcut2] = entries[j];

      // Only check enabled shortcuts
      if (!shortcut1.enabled || !shortcut2.enabled) continue;

      // Normalize keys for comparison
      const keys1 = normalizeKeyString(shortcut1.keys);
      const keys2 = normalizeKeyString(shortcut2.keys);

      if (keys1 === keys2) {
        // Check if contexts overlap
        if (contextsOverlap(shortcut1.context, shortcut2.context)) {
          conflicts.push({
            shortcut1: id1,
            shortcut2: id2,
            keys: keys1,
            severity: "error", // Both enabled, same context
          });
        } else {
          conflicts.push({
            shortcut1: id1,
            shortcut2: id2,
            keys: keys1,
            severity: "warning", // Same keys but different contexts
          });
        }
      }
    }
  }

  return conflicts;
}

function contextsOverlap(context1, context2) {
  if (context1 === "any" || context2 === "any") return true;
  return context1 === context2;
}
```

**Performance**: O(n²) where n = number of shortcuts (~15-20), negligible overhead.

---

## Phased Implementation Plan

### Phase 1: Storage Schema & Core Infrastructure (Day 1)

**Goal**: Set up storage schema and keyboard event handling system

**Tasks**:

1. ✅ Extend `storage.js` with `keyboardShortcuts` defaults
2. ✅ Add storage API methods:
   - `getKeyboardShortcuts()`
   - `setKeyboardShortcut(id, shortcut)`
   - `resetShortcut(id)`
   - `resetAllShortcuts()`
   - `detectConflicts()`
3. ✅ Implement key normalization utilities:
   - `normalizeKeyString(keys)` - Convert to canonical format
   - `buildKeyString(event)` - Extract from KeyboardEvent
   - `isModifierKey(key)` - Check if key is modifier
   - `isInputContext(target)` - Check if in input field
4. ✅ Add chord buffer management:
   - `chordBuffer` array
   - `chordTimeout` timer
   - `clearChordBuffer()` function

**Deliverables**:

- Extended storage schema
- 5 new storage API methods
- 4 utility functions
- Chord state management

**Validation**:

- Unit tests for key normalization (10 tests)
- Unit tests for storage API (8 tests)
- Chord buffer management tests (5 tests)

**Estimated Time**: 6-8 hours

---

### Phase 2: Content Script Keyboard Handler (Day 2)

**Goal**: Implement dynamic keyboard shortcut system in content script

**Tasks**:

1. ✅ Refactor existing hardcoded shortcuts to use registry:
   - Move `Shift+J/K` to registry
   - Move `Shift+Home` to registry
2. ✅ Implement `initKeyboardShortcuts()`:
   - Load shortcuts from storage
   - Build shortcut registry (Map)
   - Attach global keydown listener
3. ✅ Implement `handleKeyboardShortcut(event)`:
   - Input context checking
   - Modifier-only filtering
   - Chord detection
   - Direct match execution
4. ✅ Implement shortcut actions:
   - `toggle-dark-mode` action
   - `toggle-compact-mode` action
   - `toggle-text-only` action
   - `cycle-color-palette` action
   - `toggle-color-comments` action
   - `toggle-inline-images` action
   - `open-help-overlay` action
5. ✅ Implement `showShortcutFeedback(message)`:
   - Toast-style notification
   - 2-second auto-dismiss
   - Accessibility announcements
6. ✅ Implement help overlay UI:
   - Modal with keyboard reference
   - Grouped by category
   - "Customize" link to options page
   - ESC to close

**Deliverables**:

- Refactored keyboard handling (~200 lines)
- 7 shortcut actions
- Visual feedback system
- Help overlay UI

**Validation**:

- Integration tests for each action (7 tests)
- Chord shortcut tests (5 tests)
- Context filtering tests (3 tests)
- Help overlay tests (3 tests)

**Estimated Time**: 8-10 hours

---

### Phase 3: Options Page UI (Day 3)

**Goal**: Build comprehensive keyboard shortcuts management UI

**Tasks**:

1. ✅ Add "Keyboard Shortcuts" section to `options.html`:
   - Master toggle checkbox
   - Chord timeout input
   - Shortcuts table with actions
   - Conflict warning banner
   - Import/Export/Reset buttons
2. ✅ Implement `loadKeyboardShortcuts()` in `options.js`:
   - Load all shortcuts
   - Populate table
   - Run conflict detection
   - Show warnings if conflicts exist
3. ✅ Implement edit modal:
   - Key capture input
   - Real-time key display
   - Enable/disable toggle
   - Validation (no empty, no duplicates)
4. ✅ Implement conflict detection UI:
   - Scan all shortcuts on change
   - Display conflicts with severity
   - Highlight conflicting rows
5. ✅ Implement import/export:
   - Export as JSON file
   - Import with validation
   - Merge strategy (overwrite vs. preserve)
6. ✅ Implement reset functions:
   - Reset individual shortcut
   - Reset all shortcuts
   - Confirmation dialogs

**Deliverables**:

- New options page section (~150 lines HTML)
- Keyboard shortcuts management UI (~300 lines JS)
- Edit modal with key capture
- Import/export functionality

**Validation**:

- UI functionality tests (manual)
- Import/export tests (5 tests)
- Conflict detection tests (8 tests)

**Estimated Time**: 8-10 hours

---

### Phase 4: Testing & Documentation (Day 4)

**Goal**: Comprehensive testing and documentation

**Tasks**:

1. ✅ Create test suite `tests/keyboard-shortcuts.test.js`:
   - Storage schema tests (5 tests)
   - Key normalization tests (10 tests)
   - Conflict detection tests (8 tests)
   - Chord buffer tests (5 tests)
   - Action execution tests (7 tests)
   - Import/export tests (5 tests)
   - Context filtering tests (3 tests)
2. ✅ Update documentation:
   - CHANGELOG.md (v12.2.0 entry)
   - README.md (keyboard shortcuts section)
   - CLAUDE.md (update test count, add v12.2.0)
   - ROADMAP.md (mark Phase 9.3 complete)
3. ✅ Manual testing:
   - Test all shortcuts on live Reddit
   - Test chord shortcuts with timeout
   - Test conflict detection
   - Test import/export
   - Test help overlay
   - Cross-browser testing (Chrome, Firefox)
4. ✅ Performance profiling:
   - Measure keydown handler latency
   - Measure registry lookup time
   - Measure conflict detection time
5. ✅ Update version numbers (12.1.0 → 12.2.0)

**Deliverables**:

- Comprehensive test suite (43+ tests)
- Updated documentation (4 files)
- Performance benchmarks
- Manual test results
- Version bump

**Validation**:

- All tests pass (474+ total tests)
- No ESLint errors
- Code formatted with Prettier
- Manual testing checklist complete

**Estimated Time**: 6-8 hours

---

## Major Dependencies and Risks

### Dependencies

**Internal**:

1. ✅ Storage API - Must extend without breaking existing data
2. ✅ Content script - Major refactor of keyboard handling
3. ✅ Options page - New UI section
4. ⚠️ Dark mode system - Must be toggle-able via shortcut
5. ⚠️ Feed enhancements - Must be toggle-able via shortcut

**External**:

1. ✅ Browser APIs - `KeyboardEvent`, `chrome.commands`
2. ⚠️ Reddit's keyboard shortcuts - Potential conflicts

**No Blocking Dependencies**: All dependencies are internal and controllable.

### Risks and Mitigation

| Risk                                 | Severity | Probability | Mitigation                                                         |
| ------------------------------------ | -------- | ----------- | ------------------------------------------------------------------ |
| **Conflicts with Reddit shortcuts**  | Medium   | High        | Context-aware shortcuts, input field filtering, user customization |
| **Performance degradation**          | Low      | Low         | Optimized event handler, Map-based registry, early returns         |
| **Cross-browser compatibility**      | Medium   | Medium      | Test on Chrome & Firefox, fallback for unsupported keys            |
| **User confusion**                   | Medium   | Medium      | Clear UI, help overlay, conflict warnings, good defaults           |
| **Chord timeout too short/long**     | Low      | Medium      | Make it configurable, default to 1000ms                            |
| **Import breaks existing shortcuts** | Low      | Low         | Validation on import, backup before import                         |
| **Storage quota exceeded**           | Very Low | Very Low    | Shortcuts use <5KB, well within limits                             |

**Rollback Plan**:

- Feature flag: `enabled: false` disables all custom shortcuts
- Falls back to hardcoded defaults if registry fails to load
- Clear storage option in options page if corruption occurs

---

## Timeline and Milestones

### High-Level Timeline

**Total Duration**: 3-4 days (24-32 hours of work)

```
Day 1: Storage & Infrastructure (6-8h)
├── Storage schema extension
├── Utility functions
├── Chord buffer management
└── Tests (23 tests)

Day 2: Content Script (8-10h)
├── Keyboard handler refactor
├── Shortcut actions
├── Help overlay
└── Tests (18 tests)

Day 3: Options UI (8-10h)
├── Keyboard shortcuts section
├── Edit modal
├── Conflict detection UI
└── Tests (13 tests)

Day 4: Testing & Documentation (6-8h)
├── Comprehensive testing
├── Documentation updates
├── Manual testing
└── Version bump
```

### Milestones

**M1: Storage Complete** (End of Day 1)

- ✅ Storage schema implemented
- ✅ 23 tests passing
- ✅ No breaking changes to existing storage

**M2: Keyboard Handler Complete** (End of Day 2)

- ✅ All shortcuts working in content script
- ✅ Help overlay functional
- ✅ 41 total tests passing

**M3: Options UI Complete** (End of Day 3)

- ✅ Full keyboard shortcuts management UI
- ✅ Conflict detection working
- ✅ 54 total tests passing

**M4: Release Ready** (End of Day 4)

- ✅ All 474+ tests passing
- ✅ Documentation complete
- ✅ Manual testing complete
- ✅ Ready for release

---

## Rollout and Rollback Approach

### Rollout Strategy

**Phase 1: Internal Testing** (Day 4)

- Developer testing on multiple browsers
- All automated tests passing
- Manual testing checklist complete

**Phase 2: Soft Launch** (Post-Release)

- Feature enabled by default for new users
- Existing users see notification about new feature
- Monitor for bug reports

**Phase 3: Full Rollout** (1 week post-release)

- Feature fully rolled out
- Documentation published
- User feedback collected

### Feature Flags

**Master Toggle**:

```javascript
keyboardShortcuts: {
  enabled: true,  // Set to false to disable entire feature
}
```

**Per-Shortcut Toggle**:

```javascript
shortcuts: {
  "toggle-dark-mode": {
    enabled: true,  // Can disable individual shortcuts
  }
}
```

### Rollback Plan

**Level 1: Disable Feature** (1 minute)

- Set `keyboardShortcuts.enabled = false` in defaults
- Push update to store
- Users fall back to original hardcoded shortcuts

**Level 2: Revert Changes** (1 hour)

- Revert to v12.1.0
- No data loss (storage schema is backward compatible)
- Users keep their customizations for future re-enable

**Level 3: Clear User Data** (Last Resort)

- Provide "Reset Keyboard Shortcuts" button in options
- Clears `keyboardShortcuts` object
- Returns to default configuration

### Monitoring

**Metrics to Track**:

1. Customization rate (% users who modify shortcuts)
2. Most customized shortcuts (which shortcuts are changed)
3. Conflict detection triggers (how often users see warnings)
4. Help overlay usage (how often users press Shift+/)
5. Error rates (keyboard handler errors in logs)

**Success Criteria**:

- <1% error rate in keyboard handling
- > 5% customization rate among active users
- <5% conflict reports
- Positive user feedback

---

## Test Coverage Plan

### Unit Tests (43+ new tests)

**Storage API Tests** (`tests/keyboard-shortcuts.test.js`):

- Storage schema structure (5 tests)
- Get/set/reset shortcuts (8 tests)
- Key normalization (10 tests)
- Conflict detection (8 tests)
- Import/export (5 tests)

**Keyboard Handler Tests**:

- Chord buffer management (5 tests)
- Context filtering (3 tests)
- Action execution (7 tests)
- Help overlay (3 tests)

**Total New Tests**: 43+ tests
**Total Test Count**: 474+ tests (431 existing + 43 new)

### Integration Tests

**Manual Testing Checklist**:

- [ ] All default shortcuts work
- [ ] Custom shortcuts can be set
- [ ] Chord shortcuts work (e.g., `g g`)
- [ ] Conflicts are detected and shown
- [ ] Import/export works
- [ ] Help overlay displays correctly
- [ ] Shortcuts don't fire in input fields
- [ ] Cross-browser compatibility (Chrome, Firefox)

### Performance Tests

**Benchmarks**:

- Keydown handler: <1ms per event
- Registry lookup: <0.1ms
- Conflict detection: <10ms for 20 shortcuts
- Help overlay render: <100ms

---

## Documentation Requirements

### User-Facing Documentation

**README.md Updates**:

- Add "Keyboard Shortcuts" section
- List all default shortcuts
- Explain customization process
- Link to help overlay (Shift+/)

**CHANGELOG.md Entry**:

```markdown
## [12.2.0] - 2026-01-31

### Added

#### Phase 9.3: Customizable Keyboard Shortcuts

- **User-Defined Shortcuts**: Remap any keyboard shortcut
- **Chord Support**: Vim/Emacs-style sequences (e.g., `g g`)
- **Conflict Detection**: Automatic warning for duplicate keys
- **Help Overlay**: Press Shift+/ to see all shortcuts
- **Import/Export**: Share/backup shortcut configurations
- **New Actions**: 7 new shortcut-able features
```

**CLAUDE.md Updates**:

- Update test count (431 → 474+)
- Add v12.2.0 to version history
- Document keyboard shortcuts architecture

**ROADMAP.md Updates**:

- Mark Phase 9.3 as completed (✅)
- Update version table with v12.2.0
- Update current version to 12.2.0

### Developer Documentation

**Architecture Notes**:

- Document shortcut registry system
- Explain chord buffer mechanism
- Detail conflict detection algorithm
- Storage schema documentation

---

## Success Criteria

### Functional Requirements

**Must Have** (Blocking Release):

- ✅ All existing shortcuts still work
- ✅ Users can customize any shortcut
- ✅ Chord shortcuts work correctly
- ✅ Conflict detection prevents broken shortcuts
- ✅ Help overlay is accessible
- ✅ Import/export preserves data
- ✅ No performance degradation

**Should Have** (Release with caveats):

- ✅ Visual feedback on shortcut execution
- ✅ Context-aware shortcuts (feed vs comments)
- ✅ Configurable chord timeout
- ✅ Cross-browser compatibility

**Nice to Have** (Post-release):

- 🔮 Shortcut suggestions based on usage
- 🔮 Preset configurations (Vim-style, Emacs-style)
- 🔮 Cloud sync of shortcuts

### Non-Functional Requirements

**Performance**:

- Keydown handler: <1ms latency
- No UI jank or lag
- Minimal memory footprint (<100KB)

**Usability**:

- Clear UI for customization
- Helpful error messages
- Good default shortcuts
- Discoverable via help overlay

**Reliability**:

- 100% test pass rate
- No breaking changes
- Graceful fallback on errors
- No storage corruption

### Acceptance Criteria

**Code Quality**:

- ✅ All tests passing (474+ tests)
- ✅ ESLint: zero errors
- ✅ Prettier: all files formatted
- ✅ No console errors in normal operation

**User Experience**:

- ✅ Shortcuts feel responsive (<100ms feedback)
- ✅ Conflicts are clearly communicated
- ✅ Help overlay is useful
- ✅ Customization is intuitive

**Documentation**:

- ✅ README updated
- ✅ CHANGELOG complete
- ✅ CLAUDE.md accurate
- ✅ ROADMAP updated

---

## Open Questions

### Resolved

1. ✅ **Should we support manifest command customization?**
   - Decision: No, Chrome API doesn't support dynamic manifest commands
   - Workaround: Let users customize via chrome://extensions/shortcuts

2. ✅ **What's the default chord timeout?**
   - Decision: 1000ms (standard for Vim/Emacs)
   - Configurable by user

3. ✅ **Should we prevent Reddit native shortcuts?**
   - Decision: Context filtering + user education via help overlay
   - Let users customize if they want to override

### Pending

1. ⚠️ **Should we add preset configurations?**
   - Examples: "Vim-style", "Emacs-style", "RES-compatible"
   - Decision: Post-release feature if requested

2. ⚠️ **Should shortcuts sync via cloud?**
   - Current: Only sync via import/export
   - Future: Chrome sync storage (limited to 100KB)

3. ⚠️ **Should we track shortcut usage analytics?**
   - Privacy concern: No tracking without consent
   - Decision: Defer to post-release based on feedback

---

## Appendix

### Default Shortcuts Specification

**Current Shortcuts** (4):

1. `Alt+Shift+R` - Toggle redirect on/off (manifest command)
2. `Shift+J` - Next parent comment (content, comments context)
3. `Shift+K` - Previous parent comment (content, comments context)
4. `Shift+Home` - Jump to top (content, any context)

**New Shortcuts** (7):

1. `d` - Toggle dark mode (content, any context)
2. `c` - Toggle compact mode (content, feed context)
3. `t` - Toggle text-only mode (content, feed context)
4. `p` - Cycle color palette (content, comments context)
5. `i` - Toggle inline images (content, comments context)
6. `Shift+/` - Open help overlay (content, any context)
7. `g g` - Jump to top, Vim-style (content, any context, DISABLED by default)

**Total**: 11 shortcuts (4 existing + 7 new)

### Key Normalization Examples

```javascript
// Input → Normalized
"shift+j" → "Shift+J"
"CTRL+K" → "Ctrl+K"
"alt+shift+r" → "Alt+Shift+R"
"g g" → "g g" (chord)
"gg" → "g g" (auto-space chord)
"  d  " → "d" (trim)
```

### Storage Size Estimation

**Default Configuration**:

- 11 shortcuts × 150 bytes = 1,650 bytes
- Chord buffer: 100 bytes
- Total: ~2KB

**Heavy Customization**:

- 20 shortcuts × 200 bytes = 4,000 bytes
- Custom descriptions: 1KB
- Total: ~5KB

**Limits**:

- Chrome sync storage: 100KB quota
- Plenty of headroom for expansion

### Browser Compatibility Matrix

| Feature               | Chrome | Firefox | Notes                 |
| --------------------- | ------ | ------- | --------------------- |
| KeyboardEvent.key     | ✅     | ✅      | Full support          |
| KeyboardEvent.code    | ✅     | ✅      | Full support          |
| chrome.commands       | ✅     | ✅      | Limited customization |
| Event.stopPropagation | ✅     | ✅      | Full support          |
| Map data structure    | ✅     | ✅      | Full support          |

**No Blockers**: All required APIs are fully supported.

---

## Conclusion

This implementation plan provides a comprehensive roadmap for v12.2.0 - Customizable Keyboard Shortcuts. The feature will significantly enhance the power user experience by allowing full customization of all keyboard shortcuts, with chord support, conflict detection, and a visual help system.

**Key Highlights**:

- **Phased approach**: 4 sequential phases over 3-4 days
- **Low risk**: Comprehensive testing, fallback mechanisms, rollback plan
- **High value**: Addresses Phase 9.3 of roadmap, completes Advanced User Features
- **Well-scoped**: 43+ new tests, ~650 lines of new code, clear deliverables

**Next Steps**:

1. Review and approve this plan
2. Begin Phase 1 implementation (Storage & Infrastructure)
3. Iterate through phases with validation at each milestone
4. Release v12.2.0 upon completion of all phases

**Questions for Stakeholder**:

- ❓ Any additional shortcuts that should be supported?
- ❓ Any concerns about default key bindings?
- ❓ Should we prioritize any specific shortcuts?

---

**Document Status**: ✅ Ready for Review
**Approval Required**: Yes
**Implementation Start**: Upon approval

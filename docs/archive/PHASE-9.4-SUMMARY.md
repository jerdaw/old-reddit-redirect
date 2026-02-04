# Phase 9.4 Summary: Custom Views & Layouts

**Version**: 12.3.0
**Status**: 📋 Planning Complete
**Timeline**: 4-5 days
**Tests**: 33 new tests (556 total)

---

## Quick Overview

Implement a layout preset system that allows users to save and quickly switch between custom combinations of feed enhancement settings. Includes per-subreddit auto-apply, keyboard shortcuts, and import/export.

## Key Features

1. **Layout Presets** - Save named combinations of feed enhancement settings
2. **Default Presets** - 5 built-in presets (Default, Reading Mode, Image Browsing, Minimal, Power User)
3. **Quick-Switch** - Popup dropdown, keyboard shortcuts, or floating overlay
4. **Per-Subreddit** - Auto-apply specific layouts to specific subreddits
5. **Import/Export** - Share and backup preset configurations
6. **Keyboard Shortcuts** - `1-5` for default presets, `L` for quick-switcher

## Default Presets (5)

- 🌐 **Default** - Reddit's default appearance (all off)
- 📖 **Reading Mode** - Compact + text-only for focused reading
- 🖼️ **Image Browsing** - Uncropped images + clean layout
- ✨ **Minimal** - Hide clutter, keep images
- ⚡ **Power User** - Everything enabled for efficiency

## User Presets (Up to 10 Custom)

- Fully customizable names, descriptions, icons
- Create, edit, delete, duplicate
- Set as default for auto-apply on load
- LRU eviction if limit exceeded

## Implementation Phases

**Day 1**: Storage schema & infrastructure (6-8h, 18 tests)
**Day 2**: Preset application logic (6-8h, 13 tests)
**Day 3**: Popup UI & quick-switcher (8-10h, 5 tests)
**Day 4**: Options page management (10-12h, 9 tests)
**Day 5**: Testing & documentation (8-10h, validation)

## Technical Architecture

**Storage**: New `layoutPresets` object (~11 KB)
**Presets**: 5 default + up to 10 user presets
**Subreddit Mappings**: Up to 100 auto-apply rules
**Performance**: <100ms preset switch, <50ms auto-apply

## Files Modified

- `storage.js` (+150 lines) - Schema, 8 API methods
- `content-script.js` (+350 lines) - Apply logic, quick-switcher, auto-apply
- `popup.html` (+100 lines) - Preset switcher UI
- `popup.js` (+150 lines) - Popup logic
- `options.html` (+200 lines) - Management UI
- `options.js` (+400 lines) - CRUD operations, import/export
- `styles.css` (+150 lines) - Quick-switcher overlay
- `tests/layout-presets.test.js` (+500 lines) - Test suite

## Success Criteria

✅ Create, edit, delete custom presets
✅ 5 default presets work out-of-box
✅ Quick-switch via popup/keyboard/overlay
✅ Per-subreddit auto-apply functional
✅ Import/export preserves data
✅ <100ms preset switch latency
✅ 33+ tests passing

## Risks & Mitigation

| Risk                           | Mitigation                                   |
| ------------------------------ | -------------------------------------------- |
| Preset switching too slow      | Caching, batch DOM updates, profiling        |
| Storage quota exceeded         | Enforce limits (10 presets, 100 mappings)    |
| UI confusion                   | Clear indicators, tooltips, help text        |
| Auto-apply breaks expectations | Notifications, easy disable, manual override |

## Rollback Plan

**Level 1**: Disable via `layoutPresets.enabled = false` (1 minute)
**Level 2**: Revert to v12.2.0 (1 hour)
**Level 3**: Clear user presets, keep defaults

## Next Steps

1. ✅ Review implementation plan
2. ⏳ Begin Phase 1 (storage & infrastructure)
3. ⏳ Iterate through phases
4. ⏳ Complete Phase 9 (all 4 sub-features)
5. ⏳ Release v12.3.0

---

**Full Plan**: `docs/IMPLEMENTATION-PLAN-v12.3.md`
**Estimated Completion**: 2026-02-07
**Completes**: Phase 9 - Advanced User Features

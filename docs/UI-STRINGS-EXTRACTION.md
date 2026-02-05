# UI Strings Extraction - Options Page

**Date**: 2026-02-04
**File**: `src/pages/options/options.js`
**Purpose**: Centralize hardcoded UI strings for future internationalization (i18n)

---

## Summary

Successfully extracted 119 hardcoded UI strings from the options page into a centralized `UI_STRINGS` constant object. This refactoring prepares the codebase for future internationalization support.

---

## Changes

### Before
- 6,426 lines
- Hardcoded strings scattered throughout the file
- Example: `showToast("Settings saved")`

### After
- 6,550 lines (+124 lines for UI_STRINGS object)
- Centralized string definitions at top of file
- Example: `showToast(UI_STRINGS.SUCCESS_SETTINGS_SAVED)`

---

## UI_STRINGS Structure

The constant object is organized into semantic categories:

### 1. Status Messages (6 strings)
- `STATUS_NEVER`: "Never"
- `STATUS_NOT_SET`: "Not set"
- `STATUS_NOT_SYNCED`: "Not synced"
- `STATUS_VALID`: "✓ Valid"
- `STATUS_CLEANING`: "Cleaning..."
- `STATUS_RUNNING`: "Running..."

### 2. Button Text (3 strings)
- `BTN_REMOVE`: "Remove"
- `BTN_RUN_CLEANUP`: "Run Cleanup"
- `BTN_FULL_MAINTENANCE`: "Full Maintenance"

### 3. Success Messages (47 strings)
Prefixed with `SUCCESS_*`:
- Settings saved confirmations
- Feature update notifications
- Export/import success messages
- Example: `SUCCESS_PREFERENCES_SAVED`, `SUCCESS_CUSTOM_CSS_SAVED`

### 4. Error Messages (14 strings)
Prefixed with `ERROR_*`:
- Cleanup/maintenance failures
- Import/export errors
- Permission errors
- Example: `ERROR_CLEANUP_FAILED`, `ERROR_IMPORT_INVALID_FORMAT`

### 5. Validation Messages (17 strings)
Prefixed with `VALIDATE_*`:
- Input validation errors
- Format validation messages
- Example: `VALIDATE_PLEASE_ENTER_URL`, `VALIDATE_INVALID_SUBREDDIT`

### 6. Informational Messages (23 strings)
Prefixed with `MSG_*`:
- Duplicate/already exists messages
- Limit reached messages
- Empty state messages
- Example: `MSG_ALREADY_IN_LIST`, `MSG_MAX_100_SUBREDDITS`

### 7. Titles and ARIA Labels (7 strings)
Prefixed with `TITLE_*`:
- Button title attributes (tooltips)
- ARIA labels for accessibility
- Example: `TITLE_DELETE_PREFERENCE`, `TITLE_EDIT_TAG`

### 8. Section Labels (1 string)
- `LABEL_PRESET`: "Preset"

---

## Replacement Statistics

- **Total strings extracted**: 119
- **Total replacements made**: 57 unique patterns
- **Usage count**: 57 references to `UI_STRINGS.*` throughout the file

### Replacement Patterns Used

1. **showToast() calls**: `showToast("message")` → `showToast(UI_STRINGS.KEY)`
2. **textContent assignments**: `textContent = "text"` → `textContent = UI_STRINGS.KEY`
3. **title attributes**: `title="text"` → `title=UI_STRINGS.KEY`

---

## Strings NOT Extracted

The following types of strings were intentionally NOT extracted:

1. **Template strings with variables**:
   - `showToast(\`Exported ${count} history entries\`)`
   - These require dynamic interpolation and will be handled in a future i18n implementation

2. **Technical identifiers**:
   - CSS class names
   - DOM element IDs
   - Data attributes

3. **HTML content**:
   - Complex HTML strings with markup
   - Will require specialized i18n approach (e.g., template-based)

4. **Regex patterns and URL filters**:
   - Technical configuration, not user-facing

5. **Numeric values and calculations**:
   - Storage limits, timeouts, etc.

---

## Quality Assurance

### Tests
- ✅ All 830 tests pass (25 test suites)
- ✅ No regressions introduced
- ✅ Modular loading tests pass

### Code Quality
- ✅ ESLint passes with no errors
- ✅ Prettier formatting applied
- ✅ No functional changes to UI behavior

### Manual Verification
- File structure intact
- UI_STRINGS object properly formatted
- All replacements use correct constant references

---

## Future Work

### Phase 1: Remaining Files
Extract UI strings from:
- `src/pages/popup/popup.js` (~15 strings estimated)
- `src/pages/onboarding/onboarding.js` (~20 strings estimated)
- `src/core/background.js` (notification messages)

### Phase 2: Template Strings
Handle dynamic strings with interpolation:
```javascript
// Current:
showToast(`Exported ${count} history entries`);

// Future i18n approach:
showToast(t('MSG_EXPORTED_HISTORY_ENTRIES', { count }));
```

### Phase 3: HTML Content
Extract strings from HTML files:
- `src/pages/options/options.html`
- `src/pages/popup/popup.html`
- `src/pages/onboarding/onboarding.html`

### Phase 4: i18n Integration
Implement full internationalization:
1. Choose i18n library (e.g., chrome.i18n, i18next)
2. Create locale files (en, es, fr, etc.)
3. Replace UI_STRINGS with i18n function calls
4. Add language switcher UI

---

## Benefits

1. **Maintainability**: All user-facing strings in one place
2. **Consistency**: Easier to ensure consistent messaging
3. **Future i18n**: Foundation for multi-language support
4. **Searchability**: Quick find/replace for string updates
5. **Documentation**: Clear inventory of all UI messages

---

## Developer Notes

### Adding New Strings

When adding new UI strings, follow this pattern:

```javascript
// 1. Add to UI_STRINGS object (organized by category)
const UI_STRINGS = {
  // ...existing strings...
  SUCCESS_NEW_FEATURE: "New feature activated",
};

// 2. Use the constant in code
showToast(UI_STRINGS.SUCCESS_NEW_FEATURE);
```

### Naming Conventions

- **Prefix by type**: `SUCCESS_*`, `ERROR_*`, `VALIDATE_*`, `MSG_*`
- **Use CONSTANT_CASE**: All uppercase with underscores
- **Be descriptive**: Name should indicate purpose
- **Avoid abbreviations**: Use full words for clarity

### Example Pull Request Description

```markdown
feat: add new user notification feature

- Added SUCCESS_NOTIFICATION_SENT to UI_STRINGS
- Implemented notification dispatch logic
- Updated tests for notification flow
```

---

## References

- **Task**: #13 - Extract UI strings to constants object
- **Related Files**:
  - `/src/pages/options/options.js` (modified)
  - `/docs/UI-STRINGS-EXTRACTION.md` (this file)
- **Test Coverage**: All 830 existing tests pass

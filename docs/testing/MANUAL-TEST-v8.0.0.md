# Manual Testing Guide - v8.0.0 Subreddit Sort Preferences

This guide provides step-by-step instructions for manually testing the new subreddit sort preferences feature.

## Prerequisites

- Firefox or Chrome with the extension loaded
- Access to old.reddit.com

## Test Setup

1. Build the extension:

   ```bash
   make
   ```

2. Load the extension in your browser:
   - **Firefox**: Navigate to `about:debugging` → This Firefox → Load Temporary Add-on → Select the `old-reddit-redirect.zip`
   - **Chrome**: Navigate to `chrome://extensions/` → Enable Developer mode → Load unpacked → Select the extracted extension folder

## Test Cases

### Test 1: Basic Sort Preference Saving

**Goal**: Verify that sort preferences are saved when manually changed

**Steps**:

1. Navigate to https://old.reddit.com/r/AskReddit/
2. Observe the current sort (should be "hot" by default)
3. Click on "new" sort link in the subreddit tabs
4. Wait for page to load with new sort

**Expected Results**:

- ✅ URL changes to `/r/AskReddit/?sort=new`
- ✅ Posts are sorted by "new"
- ✅ Preference is silently saved (no notification)

---

### Test 2: Sort Preference Auto-Application

**Goal**: Verify saved sort preference is automatically applied

**Steps**:

1. After completing Test 1, navigate to https://old.reddit.com/ (homepage)
2. Click on "AskReddit" link or navigate to `/r/AskReddit/` manually
3. Observe the URL and sort order

**Expected Results**:

- ✅ Page automatically redirects to `/r/AskReddit/?sort=new`
- ✅ Posts are sorted by "new" without manual intervention
- ✅ Redirect is instant (no visible page flicker)

---

### Test 3: Different Sort Types

**Goal**: Verify all sort types work correctly

**Steps**:

1. Navigate to `/r/news/`
2. Change sort to "top"
3. Select time filter "this week"
4. Navigate away and return

**Expected Results**:

- ✅ URL becomes `/r/news/?sort=top&t=week`
- ✅ Preference is saved with time filter
- ✅ On return, both sort and time filter are applied

**Steps (continued)**:

5. Test other sort types:
   - Hot (default)
   - New
   - Top (with various time filters: hour/day/week/month/year/all)
   - Rising
   - Controversial (with time filters)

**Expected Results**:

- ✅ All sort types save and restore correctly

---

### Test 4: Per-Subreddit Independence

**Goal**: Verify each subreddit has independent preferences

**Steps**:

1. Set `/r/AskReddit/` to "new"
2. Set `/r/news/` to "top" with "today"
3. Set `/r/programming/` to "rising"
4. Navigate between these subreddits multiple times

**Expected Results**:

- ✅ Each subreddit maintains its own sort preference
- ✅ Switching between subreddits applies correct sort for each
- ✅ No cross-contamination between preferences

---

### Test 5: Redirect Loop Prevention

**Goal**: Verify no infinite redirect loops occur

**Steps**:

1. Save a sort preference for a subreddit
2. Navigate to that subreddit
3. Observe network activity and page behavior
4. Refresh the page multiple times

**Expected Results**:

- ✅ Only ONE redirect occurs on initial visit
- ✅ No additional redirects after page loads
- ✅ Refreshing the page doesn't cause redirects
- ✅ Browser history works normally

---

### Test 6: Options Page - View Preferences

**Goal**: Verify saved preferences appear in options page

**Steps**:

1. Save preferences for 3-5 different subreddits
2. Right-click extension icon → Options
3. Scroll to "Subreddit Sort Preferences" section
4. Observe the preferences table

**Expected Results**:

- ✅ All saved subreddits appear in the table
- ✅ Each shows correct sort order (Hot/New/Top/Rising/Controversial)
- ✅ Time filters displayed for top/controversial
- ✅ "Last Updated" shows relative time (Today/Yesterday/X days ago)
- ✅ Count shows correct number (e.g., "5/100")

---

### Test 7: Options Page - Search Filter

**Goal**: Verify search functionality works

**Steps**:

1. Ensure you have preferences for multiple subreddits
2. In options page, type "ask" in the search box
3. Observe filtered results

**Expected Results**:

- ✅ Only subreddits containing "ask" are shown
- ✅ Search is case-insensitive
- ✅ Clearing search shows all preferences again
- ✅ Search updates instantly as you type

---

### Test 8: Delete Individual Preference

**Goal**: Verify individual preferences can be deleted

**Steps**:

1. In options page, find a subreddit preference
2. Click "Delete" button for that subreddit
3. Confirm deletion in dialog

**Expected Results**:

- ✅ Confirmation dialog appears
- ✅ After confirming, preference is removed from list
- ✅ Count decreases by 1
- ✅ Visiting that subreddit no longer auto-applies sort

**Steps (continued)**:

4. Cancel a deletion

**Expected Results**:

- ✅ Canceling keeps the preference intact

---

### Test 9: Clear All Preferences

**Goal**: Verify all preferences can be cleared at once

**Steps**:

1. Ensure you have multiple saved preferences
2. In options page, click "Clear All" button
3. Confirm in dialog

**Expected Results**:

- ✅ Confirmation dialog shows count of preferences
- ✅ After confirming, all preferences are removed
- ✅ Table shows empty state message
- ✅ Count shows "0/100"
- ✅ Visiting any subreddit doesn't auto-apply sort

---

### Test 10: Export Preferences

**Goal**: Verify preferences can be exported as JSON

**Steps**:

1. Save preferences for a few subreddits
2. In options page, click "Export" button
3. Observe file download

**Expected Results**:

- ✅ JSON file downloads automatically
- ✅ Filename contains timestamp (e.g., `sort-preferences-1234567890.json`)
- ✅ File contains valid JSON
- ✅ JSON structure: `{ "subreddit": { "sort": "...", "time": "...", "timestamp": ... } }`

---

### Test 11: Import Preferences

**Goal**: Verify preferences can be imported from JSON

**Steps**:

1. Export preferences (from Test 10)
2. Clear all preferences
3. Click "Import" button
4. Select the exported JSON file

**Expected Results**:

- ✅ File picker opens
- ✅ After selecting file, preferences are restored
- ✅ Alert shows number of imported preferences
- ✅ Table updates with imported preferences
- ✅ Imported preferences work correctly

**Steps (continued)**:

5. Import invalid JSON file

**Expected Results**:

- ✅ Error alert appears
- ✅ Existing preferences remain intact

---

### Test 12: Toggle Feature On/Off

**Goal**: Verify feature can be completely disabled

**Steps**:

1. Save a sort preference for a subreddit
2. In options page, uncheck "Remember sort order per subreddit"
3. Navigate to that subreddit

**Expected Results**:

- ✅ No redirect occurs
- ✅ Default sort (hot) is used
- ✅ Manual sort changes don't save new preferences

**Steps (continued)**:

4. Re-enable the feature
5. Navigate to subreddit again

**Expected Results**:

- ✅ Saved preference is applied again
- ✅ Feature works normally

---

### Test 13: Storage Limit (100 Entries)

**Goal**: Verify LRU eviction when limit reached

**Note**: This test requires scripting or patience. You can skip if short on time.

**Steps**:

1. Save preferences for 100 different subreddits
2. Verify count shows "100/100" in options
3. Save a preference for a 101st subreddit
4. Check options page

**Expected Results**:

- ✅ Count remains at "100/100"
- ✅ Oldest preference (by timestamp) is removed
- ✅ Newest preference is present
- ✅ No errors occur

---

### Test 14: Sync Across Browser Instances

**Goal**: Verify preferences sync when sync is enabled

**Prerequisites**: Sync must be enabled in options

**Steps**:

1. Enable sync in options (if not already enabled)
2. Save sort preferences in one browser instance
3. Open same browser profile in another window/instance
4. Check options page in second instance

**Expected Results**:

- ✅ Preferences appear in second instance
- ✅ Auto-application works in second instance
- ✅ Changes in one instance sync to the other

---

### Test 15: Pagination Compatibility

**Goal**: Verify sort preferences don't interfere with pagination

**Steps**:

1. Save a sort preference for a subreddit
2. Navigate to that subreddit
3. Scroll to bottom and click "next" or use `?after=` pagination
4. Observe URL and behavior

**Expected Results**:

- ✅ Pagination works normally
- ✅ Sort preference is maintained across pages
- ✅ `?after=` parameter is preserved
- ✅ No duplicate redirects

---

### Test 16: Special Subreddits

**Goal**: Verify feature works with special subreddits

**Steps**:

1. Test with `/r/all/`
2. Test with `/r/popular/`
3. Test with multireddit (if applicable)

**Expected Results**:

- ✅ `/r/all/` and `/r/popular/` save and restore preferences
- ✅ No errors with special subreddit names

---

### Test 17: URL Edge Cases

**Goal**: Verify URL parsing handles edge cases

**Steps**:

1. Test with subreddit URLs:
   - With trailing slash: `/r/test/`
   - Without trailing slash: `/r/test`
   - With query params: `/r/test/?foo=bar`
2. Ensure only subreddit listing pages trigger the feature
3. Test with comment pages: `/r/test/comments/abc123/`

**Expected Results**:

- ✅ Trailing slash doesn't affect functionality
- ✅ Other query params are preserved
- ✅ Comment pages don't trigger sort preference logic
- ✅ No errors or false positives

---

### Test 18: Performance

**Goal**: Verify feature doesn't impact performance

**Steps**:

1. Save 50+ preferences
2. Navigate between various subreddits
3. Observe page load times and responsiveness
4. Check browser DevTools Performance tab

**Expected Results**:

- ✅ Page loads remain fast
- ✅ No visible lag or delay
- ✅ URL detection runs efficiently (1000ms interval)
- ✅ No console errors

---

### Test 19: Browser Back/Forward

**Goal**: Verify feature works with browser navigation

**Steps**:

1. Navigate to subreddit A (with saved sort)
2. Navigate to subreddit B (with different saved sort)
3. Click browser back button
4. Click browser forward button

**Expected Results**:

- ✅ Back/forward navigation works correctly
- ✅ Sort preferences don't interfere with history
- ✅ No extra redirect when using back/forward

---

### Test 20: Dark Mode Compatibility

**Goal**: Verify UI works with dark mode

**Steps**:

1. Enable dark mode in extension options
2. Open options page
3. Observe sort preferences section

**Expected Results**:

- ✅ Table has appropriate dark theme
- ✅ Text is readable (good contrast)
- ✅ Buttons have dark styling
- ✅ Search input has dark theme
- ✅ No visual glitches

---

## Automated Testing

Run the automated test suite to verify all unit tests pass:

```bash
npm test
```

**Expected Results**:

- ✅ 220 tests pass (23 sort preference tests included)
- ✅ 0 failures
- ✅ All test files pass

---

## Known Limitations

1. **100 subreddit limit** - Only stores preferences for 100 most recently used subreddits
2. **Listing pages only** - Feature only applies to subreddit listing pages, not comment threads
3. **No custom multireddit support** - Multireddits may not save/restore preferences correctly
4. **Session-based loop prevention** - Redirect prevention flag is cleared if you manually change sort

---

## Troubleshooting

### Preferences not saving:

1. Verify "Remember sort order per subreddit" is checked in options
2. Ensure you're on a subreddit listing page (not a comment thread)
3. Check that you actually changed the sort (not just refreshing)
4. Check browser console for errors

### Preferences not applying:

1. Verify feature is enabled in options
2. Check that a preference exists for that subreddit
3. Clear browser cache and try again
4. Check for console errors related to redirect loops

### Redirect loops:

1. Clear session storage in DevTools
2. Disable and re-enable the feature
3. Delete the problematic preference and recreate it

### Options page not loading preferences:

1. Hard refresh options page (Ctrl+Shift+R)
2. Check browser console for JavaScript errors
3. Verify storage quota isn't exceeded

---

_Last Updated: 2026-01-30_

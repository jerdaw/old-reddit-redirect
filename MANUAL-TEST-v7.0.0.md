# Manual Testing Guide - v7.0.0 Color-Coded Comments

This guide provides step-by-step instructions for manually testing the new color-coded comments feature.

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

### Test 1: Basic Color-Coded Comments

**Goal**: Verify colored stripes appear on comments based on depth

**Steps**:

1. Navigate to any old.reddit.com comment thread with nested comments (e.g., https://old.reddit.com/r/AskReddit/comments/1h0zjlw/)
2. Open the extension options page (right-click icon → Options)
3. Scroll to "Comment Enhancements" section
4. Verify "Color-coded comment depth" is checked (default)
5. Return to the comment thread
6. Refresh the page

**Expected Results**:

- ✅ Top-level comments have NO colored stripe (depth 0)
- ✅ Direct replies (depth 1) have a RED stripe on the left edge
- ✅ Nested replies (depth 2+) have different colored stripes (orange, yellow, green, teal, blue, purple, pink, brown, gray)
- ✅ Colors cycle after depth 10
- ✅ Stripes are 3 pixels wide by default

---

### Test 2: Toggle Feature On/Off

**Goal**: Verify the feature can be disabled

**Steps**:

1. Open extension options page
2. Uncheck "Color-coded comment depth"
3. Return to a comment thread
4. Refresh the page

**Expected Results**:

- ✅ No colored stripes appear on comments
- ✅ Comments display normally

**Steps (continued)**: 5. Return to options page 6. Check "Color-coded comment depth" again 7. Return to comment thread 8. Refresh the page

**Expected Results**:

- ✅ Colored stripes reappear on comments

---

### Test 3: Color-Blind Palette

**Goal**: Verify the color-blind friendly palette works

**Steps**:

1. Open extension options page
2. Ensure "Color-coded comment depth" is checked
3. Change "Color Palette" dropdown to "Color-Blind Friendly"
4. Return to a comment thread
5. Refresh the page (or wait for auto-update)

**Expected Results**:

- ✅ Comments have different colored stripes than the standard palette
- ✅ Depth 1 is BLACK (in light mode) or WHITE (in dark mode)
- ✅ Other depths use distinct, high-contrast colors

---

### Test 4: Stripe Width Customization

**Goal**: Verify stripe width can be changed

**Steps**:

1. Open extension options page
2. Change "Stripe Width" to "Thin (2px)"
3. Return to comment thread
4. Observe stripe width

**Expected Results**:

- ✅ Stripes are noticeably thinner (2px)

**Steps (continued)**: 5. Return to options page 6. Change "Stripe Width" to "Extra Thick (5px)" 7. Return to comment thread

**Expected Results**:

- ✅ Stripes are noticeably thicker (5px)

---

### Test 5: Dark Mode Compatibility

**Goal**: Verify color-coded comments work with dark mode

**Steps**:

1. Open extension options page
2. Set "Dark Mode" to "Dark" or "OLED Black"
3. Ensure "Color-coded comment depth" is checked
4. Set "Color Palette" to "Standard (Rainbow)"
5. Return to comment thread
6. Refresh the page

**Expected Results**:

- ✅ Dark mode is active
- ✅ Colored stripes are visible against dark background
- ✅ Colors have good contrast

**Steps (continued)**: 7. Return to options page 8. Change "Color Palette" to "Color-Blind Friendly" 9. Return to comment thread

**Expected Results**:

- ✅ Color-blind palette adjusts for dark mode (depth 1 is WHITE instead of BLACK)
- ✅ All colors remain visible

---

### Test 6: Real-Time Updates

**Goal**: Verify changes apply immediately without page reload

**Steps**:

1. Open a comment thread in one tab
2. Open extension options page in another tab
3. In the options tab, toggle "Color-coded comment depth" off
4. Switch to the comment thread tab

**Expected Results**:

- ✅ Colored stripes disappear WITHOUT needing to refresh

**Steps (continued)**: 5. Switch back to options tab 6. Toggle "Color-coded comment depth" on 7. Change "Color Palette" to "Color-Blind Friendly" 8. Switch to comment thread tab

**Expected Results**:

- ✅ Stripes reappear with new color palette WITHOUT needing to refresh

---

### Test 7: Performance on Large Threads

**Goal**: Verify the feature doesn't cause lag on large comment threads

**Steps**:

1. Find a thread with 500+ comments (e.g., popular AskReddit threads)
2. Navigate to the thread with color-coded comments enabled
3. Observe page load time and scrolling performance

**Expected Results**:

- ✅ Page loads within reasonable time (<3 seconds)
- ✅ Scrolling is smooth with no noticeable lag
- ✅ All comment stripes render correctly

---

### Test 8: Dynamically Loaded Comments

**Goal**: Verify color-coded comments apply to dynamically loaded content

**Steps**:

1. Navigate to a comment thread
2. Click "load more comments" or "continue this thread"
3. Observe newly loaded comments

**Expected Results**:

- ✅ Newly loaded comments also have colored stripes
- ✅ Depth calculation is correct for dynamically loaded comments

---

### Test 9: Collapsed Comments

**Goal**: Verify stripes work correctly with collapsed comments

**Steps**:

1. Navigate to a comment thread
2. Click the `[-]` link to collapse a comment thread
3. Observe the collapsed comment
4. Click `[+]` to expand again

**Expected Results**:

- ✅ Collapsed comments retain their colored stripe
- ✅ Expanding comments shows all child stripes correctly

---

### Test 10: Settings Persistence

**Goal**: Verify settings are saved across browser sessions

**Steps**:

1. Open extension options page
2. Set:
   - Color-coded comments: ON
   - Color Palette: Color-Blind Friendly
   - Stripe Width: Extra Thick (5px)
3. Close all browser windows
4. Reopen browser
5. Open extension options page

**Expected Results**:

- ✅ All settings are preserved exactly as configured

---

### Test 11: RES Compatibility (if installed)

**Goal**: Verify no conflicts with Reddit Enhancement Suite

**Steps**:

1. Install RES if not already installed
2. Navigate to a comment thread
3. Verify both extensions work together

**Expected Results**:

- ✅ Color-coded comments display correctly
- ✅ RES features (vote arrows, expand images, etc.) work normally
- ✅ No console errors
- ✅ No visual overlaps or conflicts

---

## Automated Testing

Run the automated test suite to verify all unit tests pass:

```bash
npm test
```

**Expected Results**:

- ✅ 143 tests pass
- ✅ 0 failures
- ✅ 23 comment enhancement tests included

---

## Known Limitations

1. **Top-level comments (depth 0) have no stripe** - This is intentional design to reduce visual clutter
2. **Depth calculation on page load only** - If Reddit's JavaScript modifies comment structure after load, depth may not update (extremely rare)
3. **Mobile Reddit not supported** - Feature only works on old.reddit.com desktop

---

## Troubleshooting

### Stripes don't appear:

1. Check "Color-coded comment depth" is enabled in options
2. Verify you're on old.reddit.com (not www.reddit.com)
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Wrong colors:

1. Check "Color Palette" setting in options
2. Verify dark mode is correctly detected/configured

### Performance issues:

1. Disable the feature temporarily
2. Report the issue with thread URL and browser details

---

_Last Updated: 2026-01-30_

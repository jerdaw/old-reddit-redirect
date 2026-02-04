# Manual Testing Guide - v7.1.0 Comment Navigation Buttons

This guide provides step-by-step instructions for manually testing the new comment navigation buttons feature.

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

### Test 1: Basic Navigation Buttons Appearance

**Goal**: Verify navigation buttons appear on comment pages

**Steps**:

1. Navigate to any old.reddit.com comment thread (e.g., https://old.reddit.com/r/AskReddit/comments/1h0zjlw/)
2. Look for floating buttons in the bottom-right corner

**Expected Results**:

- ✅ Three circular buttons appear in bottom-right corner
- ✅ Buttons are vertically stacked with 8px gap
- ✅ Buttons show up arrow (Previous), down arrow (Next), and double up arrow (Top)
- ✅ Buttons have Reddit blue background (#0079d3)
- ✅ Buttons are 44px × 44px

---

### Test 2: Navigation Buttons Functionality

**Goal**: Verify buttons navigate correctly between parent comments

**Steps**:

1. Navigate to a comment thread with multiple top-level comments
2. Scroll to the middle of the page
3. Click the "Next" button (down arrow)

**Expected Results**:

- ✅ Page scrolls smoothly to the next top-level comment
- ✅ Comment briefly highlights with orange background (0.6s)
- ✅ Scroll position accounts for Reddit header (60px offset)

**Steps (continued)**:

4. Click the "Next" button several more times
5. When reaching the last comment, click "Next" again

**Expected Results**:

- ✅ Loops back to the first comment

**Steps (continued)**:

6. Click the "Previous" button (up arrow)

**Expected Results**:

- ✅ Navigates to previous top-level comment
- ✅ Works in reverse order

**Steps (continued)**:

7. Click the "Top" button (double up arrow)

**Expected Results**:

- ✅ Scrolls to top of page

---

### Test 3: Keyboard Shortcuts

**Goal**: Verify Shift+J/K keyboard shortcuts work

**Steps**:

1. Navigate to a comment thread
2. Scroll to middle of page
3. Press `Shift+J`

**Expected Results**:

- ✅ Navigates to next parent comment (same as clicking Next button)
- ✅ Comment highlights briefly

**Steps (continued)**:

4. Press `Shift+K`

**Expected Results**:

- ✅ Navigates to previous parent comment (same as clicking Previous button)
- ✅ Comment highlights briefly

**Steps (continued)**:

5. Click in a text input or comment box
6. Press `Shift+J`

**Expected Results**:

- ✅ Keyboard shortcuts are disabled when typing in inputs
- ✅ No navigation occurs

---

### Test 4: Toggle Feature On/Off

**Goal**: Verify navigation buttons can be disabled

**Steps**:

1. Open extension options page
2. Scroll to "Comment Enhancements" section
3. Uncheck "Comment navigation buttons"
4. Return to comment thread

**Expected Results**:

- ✅ Navigation buttons disappear WITHOUT needing to refresh

**Steps (continued)**:

5. Return to options page
6. Check "Comment navigation buttons"
7. Return to comment thread

**Expected Results**:

- ✅ Navigation buttons reappear WITHOUT needing to refresh

---

### Test 5: Button Position Customization

**Goal**: Verify button position can be changed

**Steps**:

1. Open extension options page
2. Set "Button Position" to "Bottom Left"
3. Return to comment thread

**Expected Results**:

- ✅ Buttons move to bottom-left corner WITHOUT needing to refresh
- ✅ Buttons maintain 20px offset from edge

**Steps (continued)**:

4. Return to options page
5. Set "Button Position" back to "Bottom Right"
6. Return to comment thread

**Expected Results**:

- ✅ Buttons return to bottom-right corner WITHOUT needing to refresh

---

### Test 6: Button Visibility on Different Pages

**Goal**: Verify buttons only appear on comment pages

**Steps**:

1. Navigate to old.reddit.com homepage
2. Look for navigation buttons

**Expected Results**:

- ✅ No navigation buttons appear

**Steps (continued)**:

3. Navigate to a subreddit page (e.g., /r/AskReddit)
4. Look for navigation buttons

**Expected Results**:

- ✅ No navigation buttons appear

**Steps (continued)**:

5. Navigate to a comment thread
6. Look for navigation buttons

**Expected Results**:

- ✅ Navigation buttons appear

---

### Test 7: Dark Mode Compatibility

**Goal**: Verify buttons work with dark mode

**Steps**:

1. Open extension options page
2. Set "Dark Mode" to "Dark" or "OLED Black"
3. Return to comment thread
4. Observe navigation buttons

**Expected Results**:

- ✅ Buttons have dark background (#1a1a1b)
- ✅ Buttons have light border (#343536)
- ✅ Icons are light colored (#d7dadc)
- ✅ Hover state changes to lighter dark (#272729)

---

### Test 8: Button Hover States

**Goal**: Verify button hover effects work

**Steps**:

1. Navigate to comment thread
2. Hover over each navigation button

**Expected Results**:

- ✅ Button scales up to 110% on hover
- ✅ Background color darkens slightly
- ✅ Box shadow increases
- ✅ Transition is smooth (0.15s)

**Steps (continued)**:

3. Click and hold a button (active state)

**Expected Results**:

- ✅ Button scales down to 95% when pressed
- ✅ Box shadow decreases

---

### Test 9: Accessibility - Focus States

**Goal**: Verify keyboard focus is visible

**Steps**:

1. Navigate to comment thread
2. Press `Tab` key repeatedly until navigation buttons receive focus

**Expected Results**:

- ✅ Focused button shows outline (2px solid)
- ✅ Outline color is blue in light mode (#0079d3)
- ✅ Outline color is lighter blue in dark mode (#5f99cf)
- ✅ Outline has 2px offset from button

---

### Test 10: Screen Reader Support

**Goal**: Verify buttons have proper labels

**Steps**:

1. Navigate to comment thread
2. Right-click each button and inspect element
3. Check `title` attribute

**Expected Results**:

- ✅ Previous button: "Previous parent comment (Shift+K)"
- ✅ Next button: "Next parent comment (Shift+J)"
- ✅ Top button: "Back to top"

---

### Test 11: Mobile Responsiveness

**Goal**: Verify buttons work on mobile viewport

**Steps**:

1. Open browser DevTools (F12)
2. Toggle device toolbar (responsive design mode)
3. Set viewport to mobile size (e.g., iPhone 12)
4. Navigate to comment thread

**Expected Results**:

- ✅ Buttons are 48px × 48px (larger touch target)
- ✅ Buttons offset is 15px from edge (instead of 20px)
- ✅ SVG icons are 22px × 22px (instead of 20px)
- ✅ Buttons remain touch-friendly

---

### Test 12: Performance on Large Threads

**Goal**: Verify navigation is fast on large threads

**Steps**:

1. Find a thread with 100+ top-level comments
2. Click "Next" button repeatedly

**Expected Results**:

- ✅ Each navigation completes quickly (<100ms)
- ✅ No lag or stutter during scroll
- ✅ Highlight animation is smooth

---

### Test 13: Reduced Motion Support

**Goal**: Verify animations respect reduced motion preference

**Steps**:

1. Open browser settings
2. Enable "Reduce motion" or "prefers-reduced-motion"
3. Navigate to comment thread
4. Click "Next" button

**Expected Results**:

- ✅ Scroll is instant (no smooth animation)
- ✅ Hover effects are instant (no transition)
- ✅ Button scale animations are disabled

---

### Test 14: Integration with Color-Coded Comments

**Goal**: Verify navigation works with color-coded comments enabled

**Steps**:

1. Ensure "Color-coded comment depth" is enabled
2. Navigate to comment thread with nested comments
3. Use navigation buttons to move between parents

**Expected Results**:

- ✅ Navigation works correctly
- ✅ Colored stripes remain visible
- ✅ No visual conflicts between features

---

### Test 15: Settings Persistence

**Goal**: Verify settings are saved across sessions

**Steps**:

1. Open extension options page
2. Set:
   - Comment navigation buttons: ON
   - Button Position: Bottom Left
3. Close browser
4. Reopen browser
5. Open extension options page

**Expected Results**:

- ✅ All settings preserved
- ✅ Buttons appear in bottom-left on comment pages

---

## Automated Testing

Run the automated test suite to verify all unit tests pass:

```bash
npm test
```

**Expected Results**:

- ✅ 163 tests pass
- ✅ 0 failures
- ✅ 43 comment enhancement tests included (23 color-coded + 20 navigation)

---

## Known Limitations

1. **Parent comment detection only** - Buttons navigate between top-level comments, not all comments
2. **Keyboard shortcuts use Shift modifier** - To avoid conflicts with Reddit's native shortcuts (j/k for post navigation)
3. **No custom keyboard shortcuts** - Currently hardcoded to Shift+J/K

---

## Troubleshooting

### Buttons don't appear:

1. Verify you're on a comment page (URL contains `/comments/`)
2. Check "Comment navigation buttons" is enabled in options
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Keyboard shortcuts don't work:

1. Ensure you're not typing in an input field
2. Verify you're pressing Shift+J or Shift+K (not just J/K)
3. Check browser console for errors

### Buttons in wrong position:

1. Check "Button Position" setting in options
2. Refresh the options page to verify saved setting

### Buttons overlap with site elements:

1. Try changing button position to the opposite corner
2. Report the issue with page URL and browser details

---

_Last Updated: 2026-01-30_

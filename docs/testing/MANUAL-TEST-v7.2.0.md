# Manual Testing Guide - v7.2.0 Inline Image Expansion

This guide provides step-by-step instructions for manually testing the new inline image expansion feature.

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

### Test 1: Basic Expand Button Appearance

**Goal**: Verify expand buttons appear next to image links

**Steps**:

1. Navigate to any old.reddit.com comment thread with image links (e.g., https://old.reddit.com/r/aww/)
2. Look for comments containing links to i.redd.it or imgur.com images
3. Observe the links

**Expected Results**:

- ✅ Small [+] button appears immediately after image URLs
- ✅ Button is clickable and styled with Reddit blue (#0079d3)
- ✅ Button appears inline with the text
- ✅ Non-image links have no expand button

---

### Test 2: Image Expansion Functionality

**Goal**: Verify clicking expand button shows image inline

**Steps**:

1. Navigate to a comment with an i.redd.it image link
2. Click the [+] button next to the link

**Expected Results**:

- ✅ Button changes from [+] to [-]
- ✅ Image appears below the link in a container
- ✅ Image respects max width setting (default 600px)
- ✅ Image maintains aspect ratio
- ✅ Loading text appears briefly before image loads

**Steps (continued)**:

3. Click the [-] button

**Expected Results**:

- ✅ Button changes from [-] back to [+]
- ✅ Image container is removed
- ✅ Collapse is instant (no animation)

---

### Test 3: Supported Image Hosts

**Goal**: Verify all supported image hosts work correctly

**Steps**:

1. Find or create comments with links to:
   - `https://i.redd.it/abc123.jpg`
   - `https://preview.redd.it/abc123.jpg`
   - `https://i.imgur.com/abc123.jpg`
   - `https://imgur.com/abc123` (page URL, no extension)

2. Click expand button for each link

**Expected Results**:

- ✅ i.redd.it images expand correctly
- ✅ preview.redd.it images expand correctly
- ✅ i.imgur.com images expand correctly
- ✅ imgur.com page URLs are converted to i.imgur.com direct image URLs
- ✅ All images display properly

---

### Test 4: Supported Image Formats

**Goal**: Verify all image formats are supported

**Steps**:

1. Find comments with links ending in:
   - `.jpg`
   - `.jpeg`
   - `.png`
   - `.gif`
   - `.webp`
   - `.svg`

2. Click expand button for each format

**Expected Results**:

- ✅ All formats display correctly
- ✅ Animated GIFs animate when expanded
- ✅ WebP images load properly
- ✅ SVG images scale correctly

---

### Test 5: Lazy Loading

**Goal**: Verify images are not loaded until expanded

**Steps**:

1. Open browser DevTools (F12) → Network tab
2. Clear network log
3. Navigate to comment thread with image links
4. Observe network requests

**Expected Results**:

- ✅ Images are NOT requested on page load
- ✅ Only HTML/CSS/JS loaded initially

**Steps (continued)**:

5. Click expand button on an image link
6. Observe network requests

**Expected Results**:

- ✅ Image is requested only when expanded
- ✅ Loading text appears while image loads
- ✅ Image replaces loading text when complete

---

### Test 6: Error Handling

**Goal**: Verify failed image loads are handled gracefully

**Steps**:

1. Find a comment with a broken image link (404)
2. Click the expand button

**Expected Results**:

- ✅ "Failed to load image" error message appears
- ✅ Error message is styled in red
- ✅ Button remains as [-] (expanded state)
- ✅ Clicking [-] removes error message

---

### Test 7: Max Width Customization

**Goal**: Verify max width setting controls image size

**Steps**:

1. Open extension options page
2. Set "Max Image Width" to "400px"
3. Return to comment thread
4. Expand an image

**Expected Results**:

- ✅ Image max-width is 400px WITHOUT needing to refresh
- ✅ Larger images scale down to 400px
- ✅ Smaller images display at natural size

**Steps (continued)**:

5. Return to options page
6. Set "Max Image Width" to "Full Width (no limit)"
7. Return to comment thread (existing expanded image)

**Expected Results**:

- ✅ Image expands to full container width WITHOUT needing to refresh
- ✅ No max-width constraint applied

**Steps (continued)**:

8. Test other width options: 600px, 800px

**Expected Results**:

- ✅ All width settings apply instantly without refresh

---

### Test 8: Toggle Feature On/Off

**Goal**: Verify inline images can be disabled

**Steps**:

1. Open extension options page
2. Scroll to "Comment Enhancements" section
3. Uncheck "Inline image expansion"
4. Return to comment thread

**Expected Results**:

- ✅ All expand buttons disappear WITHOUT needing to refresh
- ✅ Image links remain as normal links

**Steps (continued)**:

5. Return to options page
6. Check "Inline image expansion"
7. Return to comment thread

**Expected Results**:

- ✅ Expand buttons reappear WITHOUT needing to refresh

---

### Test 9: Dark Mode Compatibility

**Goal**: Verify inline images work with dark mode

**Steps**:

1. Open extension options page
2. Set "Dark Mode" to "Dark" or "OLED Black"
3. Return to comment thread
4. Expand an image

**Expected Results**:

- ✅ Expand button has light text on dark background
- ✅ Loading text is light colored (#d7dadc)
- ✅ Error text is red but readable in dark mode
- ✅ Image container has subtle border visible in dark mode
- ✅ Images display correctly without color distortion

---

### Test 10: Multiple Images in One Comment

**Goal**: Verify multiple images in same comment work independently

**Steps**:

1. Find a comment with multiple image links
2. Click expand button on first image
3. Click expand button on second image

**Expected Results**:

- ✅ Both images expand independently
- ✅ Both images display correctly
- ✅ Each has its own collapse button

**Steps (continued)**:

4. Collapse first image
5. Verify second image remains expanded

**Expected Results**:

- ✅ First image collapses
- ✅ Second image stays expanded
- ✅ No interference between images

---

### Test 11: Dynamic Content (Load More Comments)

**Goal**: Verify expand buttons appear on dynamically loaded comments

**Steps**:

1. Navigate to comment thread
2. Scroll to "load more comments" link
3. Click to load more comments
4. Observe newly loaded comments with image links

**Expected Results**:

- ✅ Expand buttons appear on newly loaded image links
- ✅ Buttons function correctly
- ✅ Images expand properly

---

### Test 12: Imgur URL Conversion

**Goal**: Verify imgur.com page URLs are converted to direct image URLs

**Steps**:

1. Find or create a comment with link: `https://imgur.com/abc123`
2. Observe the link and button
3. Click expand button

**Expected Results**:

- ✅ Expand button appears (URL is recognized as image)
- ✅ Image is loaded from `https://i.imgur.com/abc123.jpg` (converted)
- ✅ Image displays correctly
- ✅ No redirect to imgur page

---

### Test 13: Button Hover States

**Goal**: Verify button hover effects work

**Steps**:

1. Navigate to comment with image link
2. Hover over [+] button

**Expected Results**:

- ✅ Button background darkens slightly
- ✅ Cursor changes to pointer
- ✅ Transition is smooth

**Steps (continued)**:

3. Expand image (button becomes [-])
4. Hover over [-] button

**Expected Results**:

- ✅ Same hover effect applies to collapse button
- ✅ Button remains visually consistent

---

### Test 14: Integration with Color-Coded Comments

**Goal**: Verify inline images work with color-coded comments enabled

**Steps**:

1. Ensure "Color-coded comment depth" is enabled
2. Navigate to comment thread with nested comments containing images
3. Expand images at various nesting levels

**Expected Results**:

- ✅ Expand buttons appear correctly
- ✅ Images expand properly
- ✅ No visual conflicts with colored stripes
- ✅ Images display at all nesting depths

---

### Test 15: Integration with Navigation Buttons

**Goal**: Verify inline images work with navigation buttons enabled

**Steps**:

1. Ensure "Comment navigation buttons" is enabled
2. Navigate to comment thread
3. Expand several images
4. Use navigation buttons to jump between parent comments

**Expected Results**:

- ✅ Navigation works correctly
- ✅ Expanded images remain expanded during navigation
- ✅ No conflicts between features
- ✅ Scroll position accounts for expanded images

---

### Test 16: Button Positioning in Text

**Goal**: Verify button placement doesn't break text flow

**Steps**:

1. Find comments with image links in various positions:
   - Middle of sentence
   - End of sentence
   - Start of sentence
   - Standalone link

2. Observe button placement

**Expected Results**:

- ✅ Button appears immediately after link text
- ✅ No extra spacing around button
- ✅ Text flow is natural
- ✅ Button doesn't wrap to new line unexpectedly

---

### Test 17: Mobile Responsiveness

**Goal**: Verify inline images work on mobile viewport

**Steps**:

1. Open browser DevTools (F12)
2. Toggle device toolbar (responsive design mode)
3. Set viewport to mobile size (e.g., iPhone 12)
4. Navigate to comment thread
5. Expand an image

**Expected Results**:

- ✅ Expand buttons are touch-friendly
- ✅ Images scale appropriately for mobile width
- ✅ Max width respects viewport size
- ✅ Images don't overflow container

---

### Test 18: Performance on Threads with Many Images

**Goal**: Verify performance with many image links

**Steps**:

1. Find a thread with 20+ comments containing image links
2. Observe page load time
3. Expand 5-10 images rapidly

**Expected Results**:

- ✅ Page loads quickly (buttons don't slow initial load)
- ✅ Expand buttons appear instantly
- ✅ Images load without blocking page interaction
- ✅ No lag when expanding multiple images

---

### Test 19: Edge Case: Image Links in Quoted Text

**Goal**: Verify expand buttons work in quoted text

**Steps**:

1. Find a comment with quoted text containing image link (starts with `>`)
2. Observe the link

**Expected Results**:

- ✅ Expand button appears after image link in quote
- ✅ Button functions correctly
- ✅ Image expands properly within quoted section

---

### Test 20: Settings Persistence

**Goal**: Verify settings are saved across sessions

**Steps**:

1. Open extension options page
2. Set:
   - Inline image expansion: ON
   - Max Image Width: 800px
3. Close browser
4. Reopen browser
5. Open extension options page

**Expected Results**:

- ✅ All settings preserved
- ✅ Images expand with 800px max width

---

## Automated Testing

Run the automated test suite to verify all unit tests pass:

```bash
npm test
```

**Expected Results**:

- ✅ 197 tests pass
- ✅ 0 failures
- ✅ 77 comment enhancement tests included (23 color-coded + 20 navigation + 34 inline images)

---

## Known Limitations

1. **Limited host support** - Only supports i.redd.it, preview.redd.it, i.imgur.com, and imgur.com (not all image hosts)
2. **Imgur conversion** - Only converts simple imgur.com/ID URLs, not album or gallery URLs
3. **No video support** - Only static images are supported (no video/GIF sound)
4. **Protocol assumption** - Imgur URLs are converted to HTTPS regardless of original protocol

---

## Troubleshooting

### Expand buttons don't appear:

1. Verify "Inline image expansion" is enabled in options
2. Check that links are from supported hosts (i.redd.it, imgur.com)
3. Verify links end with image extension or match imgur pattern
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Images fail to load:

1. Check browser console for CORS errors
2. Verify the image URL is valid (try opening in new tab)
3. Check network connectivity
4. Try expanding a different image to rule out extension issue

### Images are too large/small:

1. Check "Max Image Width" setting in options
2. Try different width settings (400/600/800/Full Width)
3. Note that images smaller than max width display at natural size

### Buttons appear on non-image links:

1. Report the URL pattern that incorrectly matched
2. Check if URL contains one of the supported hosts
3. Provide browser console output for debugging

---

_Last Updated: 2026-01-30_

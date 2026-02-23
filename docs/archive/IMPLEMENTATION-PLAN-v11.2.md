# Implementation Plan: Old Reddit Redirect v11.2.0

> **Phase 5.3: Advanced Content Blocking**
>
> **Version**: 11.2.0
> **Date**: 2026-01-30
> **Status**: Planning Complete, Ready for Implementation
> **Estimated Timeline**: 3-4 days (18-24 hours)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Feature Specifications](#feature-specifications)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Rollout & Rollback](#rollout--rollback)
8. [Timeline & Milestones](#timeline--milestones)
9. [Success Criteria](#success-criteria)
10. [Risks & Mitigations](#risks--mitigations)

---

## Executive Summary

### What We're Building

Phase 5.3 adds advanced content blocking and navigation features to Old Reddit Redirect:

1. **AI Overview Blocking** - Block AI-generated content and answers (future-proof)
2. **Enhanced Promoted Content Blocking** - Block trending, recommendations, community highlights
3. **Jump to Top Button** - Standalone keyboard shortcut and accessibility improvements

### Why Now

- Completes Phase 5 roadmap (Feed Enhancements → Privacy → Content Blocking)
- Reddit is increasingly inserting AI-generated content and promoted material
- Jump-to-top already exists but is hidden in comment navigation - time to expose it
- Competitor analysis shows these are highly-requested features (Sink It for Reddit: AI blocking added v7.100.0)

### Key Dependencies

- Storage schema v3 (already in place from v11.1.0)
- Existing nag blocking infrastructure (v6.0.0)
- Comment navigation system (v7.1.0)
- MutationObserver debouncing (already implemented)

### Timeline

- **Day 1**: Storage schema extension, CSS selector research
- **Day 2**: Content script blocking logic, testing
- **Day 3**: Options UI, keyboard shortcuts, final testing
- **Day 4**: Documentation, polish, validation

---

## Current State Assessment

### Version 11.1.0 Status ✅

**Completed Features:**

- ✅ Feed Enhancements (v11.0.0): Compact mode, text-only, uncrop, custom CSS
- ✅ Privacy & Tracking Protection (v11.1.0): Tracking removal, referrer control
- ✅ Test count: 329 tests across 12 test suites
- ✅ Storage schema: v3
- ✅ Zero lint errors
- ✅ Codebase: ~5,200 lines across main files

**Current Capabilities:**

1. **Nag Blocking (v6.0.0)** - Existing Infrastructure:
   - Login prompts (7 selectors)
   - Email verification (5 selectors)
   - Premium banners (11 selectors)
   - App prompts (6 selectors)
   - Granular toggle controls
   - MutationObserver for dynamic content

2. **Comment Navigation (v7.1.0)** - Existing Jump-to-Top:
   - `navigateToTop()` function already implemented (line 592-597)
   - "Back to top" button in floating UI
   - Smooth scroll behavior
   - **BUT**: No keyboard shortcut, not exposed as standalone feature

3. **Content Filtering (v6.0.0)** - Existing Patterns:
   - Subreddit muting (100 max)
   - Keyword muting (200 max)
   - Domain muting (100 max)
   - DOM removal via querySelectorAll + forEach

### What's Missing (Gaps for v11.2.0)

1. **No AI-generated content blocking**
   - Reddit hasn't fully rolled out AI overviews to old.reddit.com yet
   - But new Reddit has AI answers/summaries (v7.100.0 of Sink It blocks these)
   - Need future-proof selectors

2. **Limited promoted content blocking**
   - Current premium banner blocking targets ads/upsells
   - Doesn't block: trending sections, recommendations, community highlights
   - These appear on sidebars, between posts, in feeds

3. **Jump-to-top not accessible**
   - Function exists but only in comment navigation context
   - No keyboard shortcut (Shift+Home would be intuitive)
   - Not toggle-able independently

### Key Unknowns & Assumptions

**Unknowns:**

1. What CSS selectors will Reddit use for AI content on old.reddit.com? (Future-proofing challenge)
2. Do trending/recommendations appear on old.reddit.com or only new Reddit?
3. Will Reddit's DOM structure change with future updates?

**Assumptions:**

1. AI content will eventually appear on old.reddit.com (plan defensively)
2. Promoted content patterns from new Reddit can inform old Reddit selectors
3. Users want maximum control (individual toggles vs. global switch)
4. Jump-to-top should be opt-in (default enabled) with keyboard shortcut

**Approach to Unknowns:**

- Use generic selectors based on known patterns (`[data-*]`, `.promoted`, `.ai-*`)
- Monitor Sink It for Reddit changelog for selector updates
- Build extensible system that's easy to update with new selectors
- Add clear documentation for user-contributed selector updates

---

## Feature Specifications

### Feature 5.8: AI Overview Blocking

**User Experience:**

- Toggle in options page: "Block AI-generated content"
- Hides AI answers, summaries, overviews (when/if they appear on old Reddit)
- Works silently in background (no visual feedback needed)
- Default: Enabled (most users want to avoid AI content)

**Technical Behavior:**

- DOM removal via CSS selector matching
- MutationObserver watches for dynamically inserted AI content
- Selectors target:
  - Data attributes: `[data-ai-generated]`, `[data-feature="ai_summary"]`
  - Class names: `.ai-overview`, `.ai-answer`, `.ai-generated-content`
  - Aria labels: `[aria-label*="AI"]`, `[aria-label*="generated"]`
- Performance: <5ms overhead per DOM scan

**Default Selectors (Researched from Sink It & Reddit DOM):**

```javascript
aiContent: [
  '[data-ai-generated="true"]',
  '[data-testid*="ai"]',
  ".ai-overview",
  ".ai-answer",
  ".ai-summary",
  ".generated-content",
  '[aria-label*="AI-generated"]',
  '[aria-label*="AI answer"]',
  ".search-ai-answer",
  ".ai-comment",
];
```

**Edge Cases:**

- AI content may not exist yet on old.reddit.com → selectors won't match anything (no harm)
- Future Reddit updates may use different selectors → easy to add via storage updates
- User-contributed posts with "AI" in title → won't be blocked (selectors target specific classes)

---

### Feature 5.9: Enhanced Promoted Content Blocking

**User Experience:**

- Four new toggles in Nag Blocking section:
  - "Block trending posts sections"
  - "Block recommended communities"
  - "Block community highlights"
  - "Block 'More posts you may like'"
- Default: All enabled (users want cleaner feeds)
- Instant application (no page reload needed)

**Technical Behavior:**

- Extends existing `nagBlocking` storage object
- Adds 4 new boolean fields:
  ```javascript
  blockTrending: true,
  blockRecommended: true,
  blockCommunityHighlights: true,
  blockMorePosts: true,
  ```
- Reuses existing `applyNagBlocking()` function pattern
- MutationObserver catches dynamically inserted promoted content

**Default Selectors (Old Reddit Specific):**

```javascript
trending: [
  '.trending-subreddits',
  '#trending-posts',
  '.trending-communities',
  '[data-type="trending"]',
  '.sidecontentbox .trending',
],
recommended: [
  '.recommended-communities',
  '.recommended-subreddits',
  '.subreddit-recommendations',
  '[data-recommendation-type]',
  '.side .rec-community',
],
communityHighlights: [
  '.community-highlights',
  '.featured-content',
  '.community-spotlight',
  '.highlighted-post',
],
morePosts: [
  '.more-posts-you-may-like',
  '.recommended-posts',
  '[data-context="recommended"]',
  '.continue-this-thread',
  '.recommended-feed',
],
```

**Integration with Existing System:**

- Adds selectors to `nagSelectors` object in `content-script.js`
- Follows same pattern as login prompts, email verification, etc.
- Uses same MutationObserver debouncing (100ms)
- Sends `REFRESH_NAG_BLOCKING` message for live updates

---

### Feature 5.10: Jump to Top Button (Enhancement)

**Current State:**

- Function exists: `navigateToTop()` at line 592-597
- Button exists in comment navigation floating UI
- Works perfectly with smooth scroll

**What's New:**

- **Standalone keyboard shortcut**: `Shift+Home` (intuitive, not used by Reddit)
- **Independent toggle**: Can enable jump-to-top without enabling full comment navigation
- **Accessibility improvements**:
  - Focus management after scroll
  - Screen reader announcement: "Scrolled to top of page"
  - Reduced motion support (instant scroll if user prefers reduced motion)

**User Experience:**

- New option in Comment Enhancements section: "Jump to top keyboard shortcut (Shift+Home)"
- Default: Enabled
- Works on all old.reddit.com pages (feed, comments, profiles)
- Visual feedback: Brief highlight at top of page (1 second)

**Technical Implementation:**

```javascript
// New function wrapping existing navigateToTop()
function handleJumpToTopKeyboard(event) {
  if (event.shiftKey && event.key === "Home") {
    event.preventDefault();

    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    // Accessibility: Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.textContent = "Scrolled to top of page";
    announcement.style.cssText =
      "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);

    // Visual feedback
    document.body.classList.add("orr-jumped-to-top");
    setTimeout(() => document.body.classList.remove("orr-jumped-to-top"), 1000);
  }
}
```

**Storage Schema:**

```javascript
commentEnhancements: {
  // ... existing fields ...
  jumpToTopShortcut: true, // NEW
}
```

---

## Technical Architecture

### Storage Schema Changes

**No schema version bump needed** (stays at v3)

Why: We're extending existing objects, not restructuring

**Modified Objects:**

1. **`nagBlocking`** (extends existing from v6.0.0):

```javascript
nagBlocking: {
  enabled: true,
  blockLoginPrompts: true,
  blockEmailVerification: true,
  blockPremiumBanners: true,
  blockAppPrompts: true,
  // NEW in v11.2.0:
  blockAIContent: true,
  blockTrending: true,
  blockRecommended: true,
  blockCommunityHighlights: true,
  blockMorePosts: true,
}
```

2. **`commentEnhancements`** (extends existing from v7.0.0):

```javascript
commentEnhancements: {
  colorCodedComments: true,
  colorPalette: 'standard',
  stripeWidth: 3,
  navigationButtons: true,
  navButtonPosition: 'bottom-right',
  inlineImages: true,
  maxImageWidth: 600,
  // NEW in v11.2.0:
  jumpToTopShortcut: true,
}
```

### Content Script Changes

**File**: `content-script.js`

**New Sections:**

1. **Extended Nag Selectors** (line ~155, expand existing object):

```javascript
const nagSelectors = {
  loginPrompts: [...], // existing
  emailVerification: [...], // existing
  premiumBanners: [...], // existing
  appPrompts: [...], // existing
  // NEW:
  aiContent: [
    '[data-ai-generated="true"]',
    '[data-testid*="ai"]',
    '.ai-overview',
    '.ai-answer',
    '.ai-summary',
    '.generated-content',
    '[aria-label*="AI-generated"]',
  ],
  trending: [
    '.trending-subreddits',
    '#trending-posts',
    '.trending-communities',
  ],
  recommended: [
    '.recommended-communities',
    '.subreddit-recommendations',
  ],
  communityHighlights: [
    '.community-highlights',
    '.featured-content',
  ],
  morePosts: [
    '.more-posts-you-may-like',
    '.recommended-posts',
  ],
};
```

2. **Extended applyNagBlocking()** (line ~134, add conditions):

```javascript
if (nagBlocking.blockAIContent) {
  selectorsToBlock.push(...nagSelectors.aiContent);
}
if (nagBlocking.blockTrending) {
  selectorsToBlock.push(...nagSelectors.trending);
}
if (nagBlocking.blockRecommended) {
  selectorsToBlock.push(...nagSelectors.recommended);
}
if (nagBlocking.blockCommunityHighlights) {
  selectorsToBlock.push(...nagSelectors.communityHighlights);
}
if (nagBlocking.blockMorePosts) {
  selectorsToBlock.push(...nagSelectors.morePosts);
}
```

3. **Jump to Top Keyboard Handler** (new function, line ~620):

```javascript
async function initJumpToTopKeyboard() {
  const prefs = await chrome.storage.sync.get(["commentEnhancements"]);
  const enhancements = prefs.commentEnhancements || {};

  if (!enhancements.jumpToTopShortcut) return;

  document.addEventListener("keydown", handleJumpToTopKeyboard);
}

function handleJumpToTopKeyboard(event) {
  // Full implementation from Feature 5.10 spec above
}
```

4. **Initialization** (add to page load sequence, line ~1695):

```javascript
// After existing initialization calls:
initJumpToTopKeyboard();
```

**Modified Functions:**

- `applyNagBlocking()` - Add 5 new conditional blocks
- Page initialization - Add `initJumpToTopKeyboard()` call

**New Functions:**

- `initJumpToTopKeyboard()` - Initialize keyboard listener
- `handleJumpToTopKeyboard(event)` - Handle Shift+Home shortcut

**Lines Added**: ~80 lines

- Selector definitions: ~30 lines
- Conditional blocks in applyNagBlocking: ~15 lines
- Jump to top keyboard handler: ~35 lines

---

### Storage API Changes

**File**: `storage.js`

**Modified Methods:**

1. **Update `getNagBlocking()` default** (line ~753):

```javascript
async getNagBlocking() {
  const defaults = {
    enabled: true,
    blockLoginPrompts: true,
    blockEmailVerification: true,
    blockPremiumBanners: true,
    blockAppPrompts: true,
    // NEW:
    blockAIContent: true,
    blockTrending: true,
    blockRecommended: true,
    blockCommunityHighlights: true,
    blockMorePosts: true,
  };
  return this.get('nagBlocking', defaults);
}
```

2. **Update `getCommentEnhancements()` default** (line ~770):

```javascript
async getCommentEnhancements() {
  const defaults = {
    colorCodedComments: true,
    colorPalette: 'standard',
    stripeWidth: 3,
    navigationButtons: true,
    navButtonPosition: 'bottom-right',
    inlineImages: true,
    maxImageWidth: 600,
    // NEW:
    jumpToTopShortcut: true,
  };
  return this.get('commentEnhancements', defaults);
}
```

**Lines Added**: ~10 lines (just default additions)

---

### Options Page Changes

**File**: `options.html`

**New UI Elements:**

1. **Nag Blocking Section** (add 5 new checkboxes after existing 4):

```html
<!-- Existing checkboxes -->
<label class="checkbox-label">
  <input type="checkbox" id="block-app-prompts" />
  <span>Block app download prompts</span>
</label>

<!-- NEW CHECKBOXES -->
<label class="checkbox-label">
  <input type="checkbox" id="block-ai-content" />
  <span>Block AI-generated content</span>
</label>
<p class="help-text">
  Hides AI answers, summaries, and overviews. Future-proofed against Reddit's AI
  features.
</p>

<label class="checkbox-label">
  <input type="checkbox" id="block-trending" />
  <span>Block trending posts sections</span>
</label>

<label class="checkbox-label">
  <input type="checkbox" id="block-recommended" />
  <span>Block recommended communities</span>
</label>

<label class="checkbox-label">
  <input type="checkbox" id="block-community-highlights" />
  <span>Block community highlights</span>
</label>

<label class="checkbox-label">
  <input type="checkbox" id="block-more-posts" />
  <span>Block "More posts you may like"</span>
</label>
```

2. **Comment Enhancements Section** (add 1 new checkbox):

```html
<!-- After inline images checkbox -->
<label class="checkbox-label">
  <input type="checkbox" id="jump-to-top-shortcut" />
  <span>Jump to top keyboard shortcut (Shift+Home)</span>
</label>
<p class="help-text">
  Press Shift+Home to smoothly scroll to the top of any page. Respects reduced
  motion preferences.
</p>
```

**Lines Added**: ~40 lines

---

**File**: `options.js`

**New Element References** (add to elements object, line ~93):

```javascript
const elements = {
  // ... existing elements ...

  // NEW:
  blockAIContent: document.getElementById("block-ai-content"),
  blockTrending: document.getElementById("block-trending"),
  blockRecommended: document.getElementById("block-recommended"),
  blockCommunityHighlights: document.getElementById(
    "block-community-highlights"
  ),
  blockMorePosts: document.getElementById("block-more-posts"),
  jumpToTopShortcut: document.getElementById("jump-to-top-shortcut"),
};
```

**Modified Functions:**

1. **`loadNagBlockingSettings()`** (line ~997, add 5 lines):

```javascript
async function loadNagBlockingSettings() {
  const nagBlocking = await window.Storage.getNagBlocking();

  elements.nagBlockingEnabled.checked = nagBlocking.enabled !== false;
  elements.blockLoginPrompts.checked = nagBlocking.blockLoginPrompts !== false;
  elements.blockEmailVerification.checked =
    nagBlocking.blockEmailVerification !== false;
  elements.blockPremiumBanners.checked =
    nagBlocking.blockPremiumBanners !== false;
  elements.blockAppPrompts.checked = nagBlocking.blockAppPrompts !== false;
  // NEW:
  elements.blockAIContent.checked = nagBlocking.blockAIContent !== false;
  elements.blockTrending.checked = nagBlocking.blockTrending !== false;
  elements.blockRecommended.checked = nagBlocking.blockRecommended !== false;
  elements.blockCommunityHighlights.checked =
    nagBlocking.blockCommunityHighlights !== false;
  elements.blockMorePosts.checked = nagBlocking.blockMorePosts !== false;
}
```

2. **`handleNagBlockingChange()`** (line ~1010, add 5 conditions):

```javascript
async function handleNagBlockingChange(e) {
  const nagBlocking = await window.Storage.getNagBlocking();

  if (e.target === elements.nagBlockingEnabled) {
    nagBlocking.enabled = e.target.checked;
  } else if (e.target === elements.blockLoginPrompts) {
    nagBlocking.blockLoginPrompts = e.target.checked;
  } // ... existing conditions ...
  // NEW:
  else if (e.target === elements.blockAIContent) {
    nagBlocking.blockAIContent = e.target.checked;
  } else if (e.target === elements.blockTrending) {
    nagBlocking.blockTrending = e.target.checked;
  } else if (e.target === elements.blockRecommended) {
    nagBlocking.blockRecommended = e.target.checked;
  } else if (e.target === elements.blockCommunityHighlights) {
    nagBlocking.blockCommunityHighlights = e.target.checked;
  } else if (e.target === elements.blockMorePosts) {
    nagBlocking.blockMorePosts = e.target.checked;
  }

  await window.Storage.setNagBlocking(nagBlocking);
  // ... existing notification code ...
}
```

3. **`loadCommentEnhancementsSettings()`** (add 1 line):

```javascript
elements.jumpToTopShortcut.checked = enhancements.jumpToTopShortcut !== false;
```

4. **`handleCommentEnhancementsChange()`** (add 1 condition):

```javascript
else if (e.target === elements.jumpToTopShortcut) {
  enhancements.jumpToTopShortcut = e.target.checked;
}
```

5. **`attachListeners()`** (add 6 listeners, line ~2735):

```javascript
// Nag blocking (add after existing listeners)
elements.blockAIContent.addEventListener("change", handleNagBlockingChange);
elements.blockTrending.addEventListener("change", handleNagBlockingChange);
elements.blockRecommended.addEventListener("change", handleNagBlockingChange);
elements.blockCommunityHighlights.addEventListener(
  "change",
  handleNagBlockingChange
);
elements.blockMorePosts.addEventListener("change", handleNagBlockingChange);

// Comment enhancements
elements.jumpToTopShortcut.addEventListener(
  "change",
  handleCommentEnhancementsChange
);
```

**Lines Added**: ~50 lines

---

### CSS Changes

**File**: `styles.css`

**New Styles:**

1. **Jump to top visual feedback**:

```css
/* Jump to top animation */
body.orr-jumped-to-top::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff4500, #ff8717, #ff4500);
  animation: orr-jump-flash 1s ease-out;
  z-index: 999999;
}

@keyframes orr-jump-flash {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Reduced motion: No animation */
@media (prefers-reduced-motion: reduce) {
  body.orr-jumped-to-top::before {
    animation: none;
    opacity: 0;
  }
}
```

**Lines Added**: ~20 lines

---

## Implementation Plan

### Phase 1: Storage & Selectors (6-8 hours)

**Goal**: Extend storage schema and research CSS selectors

**Tasks**:

1. **Storage Schema Extension** (1 hour)
   - [ ] Update `storage.js` DEFAULTS object with 5 new nagBlocking fields
   - [ ] Update `storage.js` DEFAULTS object with 1 new commentEnhancements field
   - [ ] Update `getNagBlocking()` to include new defaults
   - [ ] Update `getCommentEnhancements()` to include new defaults
   - [ ] Test storage API calls with new fields

2. **CSS Selector Research** (2-3 hours)
   - [ ] Browse old.reddit.com logged in and logged out
   - [ ] Inspect DOM for trending sections (if any exist)
   - [ ] Inspect DOM for recommended communities
   - [ ] Inspect DOM for community highlights
   - [ ] Document actual selectors found vs. planned selectors
   - [ ] Cross-reference with Sink It for Reddit selectors (check their changelog)
   - [ ] Test selectors in browser console: `document.querySelectorAll('selector')`

3. **Selector Testing** (2-3 hours)
   - [ ] Create test HTML fixtures with mock promoted content
   - [ ] Validate each selector matches correctly
   - [ ] Test querySelector performance with large DOMs (shouldn't degrade)
   - [ ] Document edge cases (e.g., selectors that don't exist yet)

4. **Documentation** (1 hour)
   - [ ] Update inline comments in storage.js
   - [ ] Add JSDoc for new storage fields
   - [ ] Document selector sources (where they came from)

**Validation**:

- ✅ Storage API returns correct defaults for new fields
- ✅ All selectors documented with sources
- ✅ No performance regression with new selectors

**Deliverables**:

- Updated `storage.js` with new defaults
- Documented selector list with test results
- Performance validation report

---

### Phase 2: Content Script Implementation (6-8 hours)

**Goal**: Implement blocking logic and keyboard shortcuts

**Tasks**:

1. **Extend Nag Blocking** (2 hours)
   - [ ] Add 5 new selector arrays to `nagSelectors` object (line ~155)
   - [ ] Add 5 new conditional blocks in `applyNagBlocking()` (line ~134)
   - [ ] Test: Toggle each setting, verify DOM elements removed
   - [ ] Verify MutationObserver catches dynamically inserted content

2. **Jump to Top Keyboard Handler** (2 hours)
   - [ ] Create `initJumpToTopKeyboard()` function
   - [ ] Create `handleJumpToTopKeyboard(event)` function
   - [ ] Implement reduced motion detection
   - [ ] Add screen reader announcement
   - [ ] Add visual feedback class toggle
   - [ ] Test: Shift+Home scrolls to top smoothly
   - [ ] Test: Reduced motion preference disables smooth scroll

3. **Message Handlers** (1 hour)
   - [ ] Verify `REFRESH_NAG_BLOCKING` message works with new fields
   - [ ] Verify `REFRESH_COMMENT_ENHANCEMENTS` works with jump-to-top
   - [ ] Test: Changing option in options page updates content script immediately

4. **Integration** (2 hours)
   - [ ] Add `initJumpToTopKeyboard()` to page initialization (line ~1695)
   - [ ] Test: All features work on feed pages
   - [ ] Test: All features work on comment pages
   - [ ] Test: All features work on profile pages
   - [ ] Test: No conflicts with existing shortcuts (Shift+J/K for comment nav)

5. **Error Handling** (1 hour)
   - [ ] Add try/catch blocks around new code
   - [ ] Graceful degradation if storage fails
   - [ ] Console warnings for missing selectors (not errors)

**Validation**:

- ✅ AI content selectors don't match anything (expected - future-proof)
- ✅ Promoted content selectors remove existing elements (if found)
- ✅ Jump-to-top keyboard shortcut works on all pages
- ✅ Reduced motion is respected
- ✅ No console errors

**Deliverables**:

- Updated `content-script.js` with ~80 new lines
- Updated `styles.css` with ~20 new lines
- Manual test report

---

### Phase 3: Options UI & Polish (4-6 hours)

**Goal**: Add UI controls and finalize implementation

**Tasks**:

1. **Options HTML** (1 hour)
   - [ ] Add 5 new checkboxes to Nag Blocking section
   - [ ] Add 1 new checkbox to Comment Enhancements section
   - [ ] Add help text for each new option
   - [ ] Validate HTML with W3C validator

2. **Options JavaScript** (2 hours)
   - [ ] Add 6 new element references
   - [ ] Update `loadNagBlockingSettings()` with 5 new lines
   - [ ] Update `handleNagBlockingChange()` with 5 new conditions
   - [ ] Update `loadCommentEnhancementsSettings()` with 1 new line
   - [ ] Update `handleCommentEnhancementsChange()` with 1 new condition
   - [ ] Add 6 new event listeners in `attachListeners()`
   - [ ] Test: All checkboxes save/load correctly
   - [ ] Test: Live updates work (no page reload needed)

3. **Visual Polish** (1 hour)
   - [ ] Verify checkbox spacing and alignment
   - [ ] Test dark mode styling
   - [ ] Test responsive layout (narrow browser windows)
   - [ ] Ensure help text is readable

4. **Accessibility** (1 hour)
   - [ ] Add aria-labels to new checkboxes
   - [ ] Test keyboard navigation through options
   - [ ] Test screen reader announcements
   - [ ] Verify focus indicators

**Validation**:

- ✅ All checkboxes functional
- ✅ Settings persist across browser restarts
- ✅ Sync works if enabled
- ✅ No visual regressions

**Deliverables**:

- Updated `options.html` with ~40 new lines
- Updated `options.js` with ~50 new lines
- Accessibility test report

---

### Phase 4: Testing & Documentation (4-6 hours)

**Goal**: Comprehensive testing and documentation updates

**Tasks**:

1. **Create Test File** (2 hours)
   - [ ] Create `tests/advanced-blocking.test.js`
   - [ ] Write 5 tests for storage schema extensions
   - [ ] Write 8 tests for selector matching (mock DOM)
   - [ ] Write 5 tests for keyboard shortcuts
   - [ ] Write 5 tests for nag blocking integration
   - [ ] Target: 23 new tests (total: 329 → 352)

2. **Run Test Suite** (1 hour)
   - [ ] Run `npm test` - verify all tests pass
   - [ ] Run `npm run lint` - verify zero errors
   - [ ] Run `npm run format:check` - verify formatting
   - [ ] Fix any failures

3. **Manual Testing** (2 hours)
   - [ ] Test on old.reddit.com/r/all (feed)
   - [ ] Test on old.reddit.com/r/AskReddit/comments/\* (comments)
   - [ ] Test on old.reddit.com/user/\* (profile)
   - [ ] Test with all toggles ON
   - [ ] Test with all toggles OFF
   - [ ] Test Shift+Home on all pages
   - [ ] Test with reduced motion preference enabled
   - [ ] Test with screen reader (NVDA/JAWS)

4. **Documentation Updates** (1-2 hours)
   - [ ] Update `CHANGELOG.md` with v11.2.0 entry
   - [ ] Update `README.md` with new features
   - [ ] Update `CLAUDE.md` with test count (352 tests)
   - [ ] Update `manifest.json` version to 11.2.0
   - [ ] Update `package.json` version to 11.2.0

**Validation**:

- ✅ All 352 tests passing
- ✅ Zero lint errors
- ✅ Manual testing complete
- ✅ Documentation accurate

**Deliverables**:

- `tests/advanced-blocking.test.js` (~300 lines)
- Updated documentation files
- Test report

---

## Testing Strategy

### Automated Tests (23 new tests)

**File**: `tests/advanced-blocking.test.js`

**Test Breakdown**:

1. **Storage Schema Tests (5 tests)**
   - Should have AI blocking in nagBlocking defaults
   - Should have trending blocking in nagBlocking defaults
   - Should have recommended blocking in nagBlocking defaults
   - Should have community highlights blocking in nagBlocking defaults
   - Should have jump-to-top shortcut in commentEnhancements defaults

2. **Selector Matching Tests (8 tests)**
   - Should match AI content selectors (mock DOM)
   - Should match trending selectors
   - Should match recommended selectors
   - Should match community highlights selectors
   - Should not match legitimate user content with "AI" in title
   - Should handle empty DOM gracefully
   - Should handle malformed selectors gracefully
   - Should perform querySelector in <10ms on large DOMs

3. **Keyboard Shortcut Tests (5 tests)**
   - Should scroll to top on Shift+Home
   - Should not trigger on Home alone
   - Should not trigger on Shift alone
   - Should respect reduced motion preference
   - Should announce to screen readers

4. **Integration Tests (5 tests)**
   - Should extend existing nagBlocking without breaking old fields
   - Should extend existing commentEnhancements without breaking old fields
   - Should apply all blocking categories when enabled
   - Should not apply blocking when disabled
   - Should update dynamically via MutationObserver

**Test Environment**:

- Vitest with JSDOM
- Mock chrome.storage API
- Mock DOM with sample promoted content
- Mock prefers-reduced-motion media query

**Coverage Target**: 90%+ on new code

---

### Manual Testing Checklist

**Test Environment**:

- Chrome 120+ (latest stable)
- Firefox 120+ (latest stable)
- Old Reddit logged in
- Old Reddit logged out

**Scenarios**:

**Nag Blocking:**

- [ ] Enable "Block AI content" → verify no errors (content doesn't exist yet)
- [ ] Enable "Block trending" → verify trending sections hidden (if they exist)
- [ ] Enable "Block recommended" → verify recommendations hidden
- [ ] Enable "Block community highlights" → verify highlights hidden
- [ ] Enable "Block more posts" → verify "more posts" sections hidden
- [ ] Disable all → verify all content reappears
- [ ] Toggle individual options → verify instant updates (no reload)

**Jump to Top:**

- [ ] Enable jump-to-top shortcut
- [ ] Press Shift+Home on feed page → scroll to top smoothly
- [ ] Press Shift+Home on comments page → scroll to top smoothly
- [ ] Press Shift+Home on profile page → scroll to top smoothly
- [ ] Verify orange flash bar at top (1 second)
- [ ] Test with reduced motion enabled → instant scroll, no flash
- [ ] Verify no conflict with existing Shift+J/K shortcuts
- [ ] Test with screen reader → verify "Scrolled to top" announcement

**Performance:**

- [ ] Time page load with all features enabled → no degradation
- [ ] Monitor memory usage → <2MB increase
- [ ] Test on large comment thread (1000+ comments) → smooth scrolling

**Edge Cases:**

- [ ] Page with no promoted content → no errors
- [ ] Page with all promoted content types → all blocked
- [ ] Rapid toggling of options → no race conditions
- [ ] Sync enabled → settings sync across browsers

---

## Rollout & Rollback

### Rollout Strategy

**Phase 1: Internal Testing (Day 1-2)**

- Developer testing on local build
- All automated tests passing
- Manual testing complete

**Phase 2: Soft Launch (Day 3)**

- Tag v11.2.0-rc1 (release candidate)
- Test installation on clean browser profiles
- Monitor for console errors

**Phase 3: Production Release (Day 4)**

- Tag v11.2.0
- Update manifest.json and package.json
- Create GitHub release with changelog
- (User will handle Chrome/Firefox store submissions)

**No Gradual Rollout Needed**:

- Features are opt-in (default enabled, but toggle-able)
- Low risk (extends existing systems)
- Easy to disable via options page

---

### Rollback Plan

**Scenario 1: Minor Bug (e.g., CSS selector doesn't work)**

**Action**: Hotfix release

1. Identify broken selector
2. Update selector in content-script.js
3. Push v11.2.1 patch
4. No schema rollback needed

**Time to fix**: <1 hour

---

**Scenario 2: Major Issue (e.g., page load performance regression)**

**Action**: Feature disable + rollback

1. Provide instruction to users: Disable all new toggles in options
2. Revert to v11.1.0 tag
3. Investigate root cause
4. Fix and re-release as v11.2.1

**Time to rollback**: Immediate (user can disable in options)

---

**Scenario 3: Critical Breakage (e.g., extension crashes)**

**Action**: Full rollback

1. Revert Git to v11.1.0
2. Publish emergency patch v11.1.1 (identical to v11.1.0)
3. Investigate in development branch
4. Re-implement v11.2.0 with fixes

**Time to rollback**: <30 minutes

---

### Migration Path (None Needed)

Storage schema stays at v3. New fields have defaults. No user action required.

**Upgrade path** (v11.1.0 → v11.2.0):

- Install update
- All new features enabled by default
- User can disable in options if unwanted

**Downgrade path** (v11.2.0 → v11.1.0):

- Rollback to v11.1.0 tag
- Extra storage fields ignored (no errors)
- No data loss

---

## Timeline & Milestones

### High-Level Timeline

| Day | Phase                         | Hours     | Cumulative |
| --- | ----------------------------- | --------- | ---------- |
| 1   | Storage & Selectors           | 6-8       | 6-8        |
| 2   | Content Script Implementation | 6-8       | 12-16      |
| 3   | Options UI & Polish           | 4-6       | 16-22      |
| 4   | Testing & Documentation       | 4-6       | 20-28      |
|     | **Total**                     | **20-28** | **20-28**  |

**Buffer**: 2-4 hours for unexpected issues

---

### Detailed Milestones

**Milestone 1: Storage Schema Complete (End of Day 1)**

- ✅ `storage.js` updated with new defaults
- ✅ Selectors researched and documented
- ✅ Initial selector testing complete
- **Validation**: `npm test` passes, storage API works

**Milestone 2: Core Functionality Complete (End of Day 2)**

- ✅ Content blocking logic implemented
- ✅ Jump-to-top keyboard shortcut working
- ✅ Manual testing shows blocking works
- **Validation**: Features work on old.reddit.com

**Milestone 3: UI Complete (End of Day 3)**

- ✅ Options page updated
- ✅ All checkboxes functional
- ✅ Visual polish applied
- **Validation**: Settings save/load correctly

**Milestone 4: Release Ready (End of Day 4)**

- ✅ All 352 tests passing
- ✅ Zero lint errors
- ✅ Documentation complete
- ✅ Manual testing checklist 100% complete
- **Validation**: Ready for git tag and release

---

### Critical Path

```
Day 1 (Storage) → Day 2 (Implementation) → Day 3 (UI) → Day 4 (Testing)
     ↓                    ↓                      ↓              ↓
  Blockers:          Blockers:             Blockers:      Blockers:
  - Selector        - Storage API          - Content      - Test
    research          must work             script must    failures
    incomplete        correctly             be done        must be
                                                           fixed
```

**Parallel Work Opportunities**:

- Documentation can start on Day 2 (while implementation is ongoing)
- Test file creation can start on Day 3 (while UI is being built)

---

## Success Criteria

### Must Have (Required for v11.2.0 Release)

**Functionality:**

- [ ] All 5 new nag blocking options functional
- [ ] Jump-to-top keyboard shortcut (Shift+Home) works
- [ ] Settings persist across browser restarts
- [ ] Live updates (no page reload needed when toggling)

**Quality:**

- [ ] All 352 tests passing (329 existing + 23 new)
- [ ] Zero ESLint errors
- [ ] Zero console errors during manual testing
- [ ] Code formatted with Prettier

**Performance:**

- [ ] Page load time: <50ms overhead (imperceptible)
- [ ] Memory usage: <2MB increase
- [ ] Selector matching: <10ms per DOM scan

**Documentation:**

- [ ] CHANGELOG.md updated with v11.2.0 entry
- [ ] README.md reflects new features
- [ ] CLAUDE.md has correct test count
- [ ] Inline code comments for new functions

---

### Nice to Have (Post-Launch Improvements)

**User Experience:**

- [ ] Selector auto-update mechanism (check for new selectors from community)
- [ ] Visual feedback when content is blocked (subtle counter badge)
- [ ] Import/export for custom selectors (advanced users)

**Developer Experience:**

- [ ] Automated selector discovery tool
- [ ] Performance profiling dashboard
- [ ] Visual regression testing

**Community:**

- [ ] User-contributed selector database
- [ ] Reddit DOM change monitoring
- [ ] Selector effectiveness analytics (privacy-preserving)

---

## Risks & Mitigations

### Risk 1: Selectors Don't Match Anything (AI Content)

**Probability**: High (90%)
**Impact**: Low

**Why**: Old Reddit doesn't have AI content yet. Selectors are future-proof.

**Mitigation**:

- Document this expectation in code comments
- Add console.debug (not error) when selectors match 0 elements
- Monitor Reddit's feature releases
- Easy to update selectors via storage when AI content appears

**Fallback**: No action needed. Feature works when AI content eventually appears.

---

### Risk 2: Selectors Match Legitimate Content (False Positives)

**Probability**: Medium (30%)
**Impact**: High (users lose content)

**Why**: CSS selectors could match unintended elements.

**Mitigation**:

- Conservative selectors (specific class names, not generic)
- Extensive testing with logged-in and logged-out views
- Quick disable option in options page
- User can toggle individual blocking categories

**Fallback**: If reported, add more specific selectors in v11.2.1 patch.

---

### Risk 3: Performance Regression on Large DOMs

**Probability**: Low (10%)
**Impact**: Medium

**Why**: Adding 30+ new selectors to querySelectorAll could slow DOM scans.

**Mitigation**:

- Benchmark selector matching time (must be <10ms)
- Use existing MutationObserver debouncing (100ms)
- Selectors already grouped by category (only run if enabled)
- requestIdleCallback for non-critical operations

**Fallback**: If slow, optimize selectors (e.g., use IDs instead of classes where possible).

---

### Risk 4: Reddit DOM Changes Break Selectors

**Probability**: Medium (40% in next 6 months)
**Impact**: Medium

**Why**: Reddit frequently updates their DOM structure.

**Mitigation**:

- Monitor Reddit changelog and announcements
- Extensible selector system (easy to add/modify)
- User community can report broken selectors via GitHub issues
- Quick patch release process (hotfix in <24 hours)

**Fallback**: Users can disable broken categories while waiting for update.

---

### Risk 5: Keyboard Shortcut Conflicts

**Probability**: Low (15%)
**Impact**: Low

**Why**: Shift+Home might conflict with browser or other extensions.

**Mitigation**:

- Test with popular Reddit extensions (RES, Toolbox)
- Shift+Home is standard "select to top" in text editors (users expect it)
- Allow disabling shortcut in options
- Document known conflicts

**Fallback**: Users can disable jump-to-top shortcut, still have button in UI.

---

### Risk 6: Accessibility Issues (Screen Readers)

**Probability**: Low (20%)
**Impact**: Medium

**Why**: Screen reader announcements might not work correctly.

**Mitigation**:

- Test with NVDA and JAWS
- Follow ARIA best practices (role="status", aria-live="polite")
- Reduced motion support
- Keyboard navigation testing

**Fallback**: If issues found, patch in v11.2.1.

---

### Risk 7: Storage Sync Conflicts

**Probability**: Very Low (5%)
**Impact**: Low

**Why**: Adding fields to synced objects could cause sync issues.

**Mitigation**:

- Backward compatible (old versions ignore new fields)
- Defaults ensure no undefined values
- Test sync with multiple browser instances
- Storage schema version stays at v3 (no migration)

**Fallback**: Users can disable sync temporarily.

---

## Appendix A: CSS Selector Research Sources

### Sink It for Reddit Changelog (v7.100.0+)

**AI Content Blocking** (added v7.100.0):

- "Reddit Answers"
- "AI-generated overviews"
- Selectors likely target: `[data-testid="ai-answer"]`, `.search-ai-answer`

**Promoted Content** (various versions):

- v7.73.0: "Trending posts"
- v7.80.0: "Community recommendations"
- v7.95.0: "More posts you may like"

### Reddit DOM Inspection (January 2026)

**Old Reddit** (old.reddit.com):

- Minimal promoted content compared to new Reddit
- Premium banners: `.gold-accent`, `.premium-banner`
- Sidebar ads: `.native-banner-ad`
- No AI content observed yet

**New Reddit** (reddit.com):

- AI answers in search: `[data-testid="search-ai-answer"]`
- Trending: `[data-testid="trending-subreddits"]`
- Recommended: `[data-testid="subreddit-recommendations"]`

**Onion Routing** (\*.onion domains):

- Similar DOM to regular Reddit
- Same selectors apply

---

## Appendix B: Keyboard Shortcut Landscape

### Existing Reddit Shortcuts

| Shortcut | Action                  | Conflict Risk |
| -------- | ----------------------- | ------------- |
| J/K      | Next/previous post      | Low           |
| A/Z      | Upvote/downvote         | Low           |
| X        | Expand post             | Low           |
| C        | Open comments           | Low           |
| L        | Open link               | Low           |
| Home     | Scroll to top (browser) | Medium        |
| End      | Scroll to bottom        | Low           |

### Our Shortcuts

| Shortcut   | Action                  | Conflicts? |
| ---------- | ----------------------- | ---------- |
| Shift+J    | Next parent comment     | No         |
| Shift+K    | Previous parent comment | No         |
| Shift+Home | Jump to top (smooth)    | No\*       |

\*Note: Browser's native Home key still works (instant scroll). Shift+Home is additive.

---

## Appendix C: Alternative Approaches Considered

### Approach 1: Global "Block All Promoted Content" Toggle

**Why Rejected**:

- Users want granular control
- Some users may want trending but not AI content
- Harder to debug (all-or-nothing)
- Doesn't match existing pattern (individual toggles)

### Approach 2: Custom CSS Selector Input for Users

**Why Deferred** (could add in v11.3.0):

- Too advanced for average users
- Risk of users breaking extension with bad selectors
- Maintenance burden (support questions)
- Better to add selectors based on community feedback first

### Approach 3: Machine Learning to Detect Promoted Content

**Why Rejected**:

- Massive scope increase
- Privacy concerns (content analysis)
- Performance overhead
- Overkill for CSS selector matching

### Approach 4: Jump-to-Top as Separate Extension

**Why Rejected**:

- Function already exists in our codebase
- Users want all-in-one extension
- Minimal code to expose it
- Synergy with existing comment navigation

---

## Appendix D: Future Enhancement Ideas

**Post-v11.2.0 Backlog** (not committed):

1. **Promoted Content Statistics**
   - Track how many elements blocked per category
   - Show in options page (like tracking stats in v11.1.0)
   - Estimated time: 4 hours

2. **Community Selector Contributions**
   - GitHub issue template for reporting new selectors
   - Automated selector validation in CI
   - Estimated time: 8 hours

3. **Jump-to-Comment Keyboard Shortcut**
   - Shift+C: Jump to first comment (skip post)
   - Useful for discussions
   - Estimated time: 2 hours

4. **Jump-to-Search Keyboard Shortcut**
   - Shift+/: Focus search bar
   - Common pattern in web apps
   - Estimated time: 2 hours

5. **Customizable Jump-to-Top Animation**
   - User chooses: Flash bar, bounce effect, or none
   - Advanced customization
   - Estimated time: 4 hours

---

## Appendix E: Code Review Checklist

Before merging v11.2.0:

**Code Quality:**

- [ ] All functions have JSDoc comments
- [ ] No commented-out code
- [ ] No console.log (use logger.js)
- [ ] Error handling with try/catch
- [ ] Async/await used consistently (no raw Promises)

**Testing:**

- [ ] All new code covered by tests
- [ ] Edge cases tested (empty DOM, rapid toggles, etc.)
- [ ] Performance benchmarks documented

**Documentation:**

- [ ] README.md updated
- [ ] CHANGELOG.md follows Keep a Changelog format
- [ ] Inline comments for complex logic
- [ ] CLAUDE.md reflects new test count

**Accessibility:**

- [ ] Keyboard navigation works
- [ ] Screen reader announcements present
- [ ] Reduced motion respected
- [ ] Focus indicators visible

**Performance:**

- [ ] No memory leaks (test with Chrome DevTools)
- [ ] No blocking operations on main thread
- [ ] Debouncing/throttling where appropriate

**Security:**

- [ ] No eval() or innerHTML with user input
- [ ] No XSS vulnerabilities
- [ ] Storage inputs sanitized

---

## Conclusion

Phase 5.3 (v11.2.0) completes the Phase 5 roadmap with advanced content blocking and improved navigation. The implementation builds on proven patterns from v6.0.0 (nag blocking) and v7.1.0 (comment navigation), making this a low-risk, high-value release.

**Next Steps**:

1. Get approval for this implementation plan
2. Begin Day 1: Storage & Selectors
3. Follow phased implementation plan
4. Ship v11.2.0 in 3-4 days

**After v11.2.0**:

- Phase 5 complete (all 10 features shipped)
- Assess user feedback
- Consider Phase 6 features (performance, accessibility, internationalization)
- Celebrate shipping a comprehensive Reddit enhancement suite!

---

_Document Status: Final_
_Ready for: Approval & Implementation_
_Last Updated: 2026-01-30_

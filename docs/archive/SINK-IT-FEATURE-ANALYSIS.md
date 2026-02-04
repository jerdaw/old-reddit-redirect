# Sink It for Reddit - Feature Analysis

> **Purpose**: Comprehensive analysis of "Sink It for Reddit" features compared to "Old Reddit Redirect" to identify potential roadmap additions.
>
> **Date**: 2026-01-30
> **Sink It Version Analyzed**: 7.108.x
> **Old Reddit Redirect Version**: 5.0.0

---

## Executive Summary

**Sink It for Reddit** is a fundamentally different extension with a broader scope:

- **Old Reddit Redirect**: Focused redirect tool (new Reddit → old Reddit)
- **Sink It**: Comprehensive Reddit enhancement suite for BOTH old and new Reddit

Sink It has ~100+ features across UI enhancement, content filtering, navigation, and privacy. Many features are mobile-first (Safari/iOS). This document categorizes relevant features by applicability to Old Reddit Redirect.

---

## Table of Contents

1. [High Relevance Features](#1-high-relevance-features) - Direct fit for our extension
2. [Medium Relevance Features](#2-medium-relevance-features) - Could be adapted
3. [Low Relevance Features](#3-low-relevance-features) - Different scope
4. [Premium/Max Features](#4-premiummax-features-reference)
5. [Business Model Notes](#5-business-model-notes)
6. [Technical Implementation Notes](#6-technical-implementation-notes)
7. [Recommendations](#7-recommendations)

---

## 1. High Relevance Features

Features that directly complement our core mission of improving the old Reddit experience.

### 1.1 Dark Mode Support (High Priority)

| Feature                              | Sink It Implementation                             | Relevance  |
| ------------------------------------ | -------------------------------------------------- | ---------- |
| **Adaptive dark mode**               | Automatically matches system dark/light preference | ⭐⭐⭐⭐⭐ |
| **OLED/Pure black mode**             | True black (#000) for OLED screens                 | ⭐⭐⭐⭐   |
| **Permanent dark mode**              | Override system setting, always dark               | ⭐⭐⭐⭐   |
| **Bespoke dark mode for old Reddit** | Custom dark styling for old.reddit.com             | ⭐⭐⭐⭐⭐ |

**Why relevant**: Old Reddit has limited native dark mode support. We already inject CSS (`styles.css`) for cookie banners - extending this for dark mode is a natural fit.

**Implementation notes**:

- Uses `prefers-color-scheme` media query detection
- Stores user preference in extension storage
- Injects custom CSS into old.reddit.com pages

---

### 1.2 Cookie/Banner Removal (Already Partial)

| Feature                   | Sink It Implementation        | Our Status         |
| ------------------------- | ----------------------------- | ------------------ |
| **Cookie banners**        | Removed by default            | ✅ Already have    |
| **Login nags/popups**     | Multiple types blocked        | ❌ Not implemented |
| **"Use our app" prompts** | Silently removed              | ❌ Not implemented |
| **NSFW blocking modals**  | Bypassed for logged-out users | ❌ Not implemented |

**Why relevant**: We already remove cookie banners. Extending to other annoyances is low-hanging fruit.

**Sink It changelog references**:

- "Removed new 'use our app' button in EU region" (v2.1.6)
- "Newly reported login nag nuked" (v7.73.0)
- "New NSFW popup being reported has been nuked" (v7.78.0)

---

### 1.3 Redirect Controls (Complements Our Core)

| Feature                                      | Sink It Implementation           | Our Status                  |
| -------------------------------------------- | -------------------------------- | --------------------------- |
| **Force redirect to old Reddit**             | Global setting                   | ✅ Our core feature         |
| **Auto-redirect NSFW posts to old Reddit**   | NSFW-specific redirect           | ❌ Could add                |
| **Force redirect to old-new desktop design** | Different design option          | ❌ Different scope          |
| **Mute free zones**                          | Exempt certain areas from muting | ⚠️ Similar to our whitelist |

**NSFW redirect note**: Sink It has a premium feature to redirect NSFW posts specifically to old Reddit because old Reddit handles NSFW content better (no login walls).

---

### 1.4 Content Muting/Blocking

| Feature                     | Sink It Implementation                  | Relevance  |
| --------------------------- | --------------------------------------- | ---------- |
| **Mute subreddits**         | Block from /r/all and /r/popular        | ⭐⭐⭐⭐⭐ |
| **Mute keywords/words**     | Hide posts with specific words in title | ⭐⭐⭐⭐   |
| **Mute domains/websites**   | Block posts from clickbait sites        | ⭐⭐⭐⭐   |
| **Mute users**              | Block specific accounts                 | ⭐⭐⭐     |
| **Mute directly from feed** | Quick-add via feed UI                   | ⭐⭐⭐⭐   |
| **Bulk import via CSV**     | Import large mute lists                 | ⭐⭐⭐     |

**Why relevant**: We already have subreddit whitelisting (opposite direction). Adding muting would be complementary.

**Note**: Our whitelist is for "keep on NEW Reddit" - muting would be for "hide everywhere on old Reddit."

---

### 1.5 Comment Navigation & Readability

| Feature                              | Sink It Implementation     | Relevance  |
| ------------------------------------ | -------------------------- | ---------- |
| **Color coded comments**             | Visual nesting indicators  | ⭐⭐⭐⭐⭐ |
| **Color blind friendly mode**        | Alternate color scheme     | ⭐⭐⭐⭐   |
| **Jump to next comment**             | HN-style navigation        | ⭐⭐⭐⭐   |
| **Jump to next parent comment**      | Apollo-style single button | ⭐⭐⭐⭐   |
| **EZ collapse button**               | Finger-friendly collapse   | ⭐⭐⭐     |
| **Auto-collapse automod**            | Hide bot comments          | ⭐⭐⭐⭐   |
| **Auto-collapse 2nd level comments** | Reduce visual noise        | ⭐⭐⭐     |
| **Load more comments by default**    | Auto-expand                | ⭐⭐⭐     |

**Why highly relevant**: Old Reddit's comment UI is dated. These are the most-requested enhancement features.

**Implementation complexity**: Medium-High (requires content script injection and DOM manipulation)

---

### 1.6 Feed Enhancements

| Feature               | Sink It Implementation           | Relevance |
| --------------------- | -------------------------------- | --------- |
| **Compact feed**      | Show more posts per screen       | ⭐⭐⭐    |
| **Cleaner feeds**     | Remove extraneous action links   | ⭐⭐⭐    |
| **Text only feeds**   | Strip images for focused reading | ⭐⭐⭐    |
| **Uncropped images**  | Full thumbnails in feed          | ⭐⭐⭐    |
| **Hide join buttons** | Declutter feed                   | ⭐⭐⭐    |
| **Hide user flairs**  | Cleaner comments                 | ⭐⭐      |

---

### 1.7 Promoted Content Removal

| Feature                              | Sink It Implementation | Relevance |
| ------------------------------------ | ---------------------- | --------- |
| **Remove promoted posts/ads**        | Blocked by default     | ⭐⭐⭐⭐  |
| **Remove "trending" sections**       | Blocked with toggle    | ⭐⭐⭐⭐  |
| **Remove "More posts you may like"** | Blocked                | ⭐⭐⭐    |
| **Remove community highlights**      | Blocked                | ⭐⭐⭐    |
| **Remove AI overviews/answers**      | Blocked (v7.100.0)     | ⭐⭐⭐⭐  |
| **Keyword ads inside posts**         | Blocked (v7.96.0)      | ⭐⭐⭐    |

**Note**: Some of these are new Reddit specific. For old Reddit, ad blocking would focus on different elements.

---

## 2. Medium Relevance Features

Features that could be adapted but may be scope creep.

### 2.1 Sort Order Management

| Feature                     | Description                            | Relevance |
| --------------------------- | -------------------------------------- | --------- |
| **Remember sort order**     | Persist per-subreddit sort preferences | ⭐⭐⭐    |
| **Persist feed sort order** | Remember /r/all, /r/popular sort       | ⭐⭐⭐    |
| **Reset sort order**        | Clear persisted preferences            | ⭐⭐      |

**Implementation**: Uses localStorage/extension storage to track user's preferred sort per subreddit.

---

### 2.2 Scroll Position Management

| Feature                      | Description                  | Relevance |
| ---------------------------- | ---------------------------- | --------- |
| **Remember scroll position** | Return to where you left off | ⭐⭐⭐    |
| **Jump to top button**       | Quick scroll to top          | ⭐⭐⭐    |

---

### 2.3 Interaction Shortcuts

| Feature                       | Description             | Relevance |
| ----------------------------- | ----------------------- | --------- |
| **Double tap to upvote**      | Instagram-style gesture | ⭐⭐      |
| **Open post in new tab**      | Background tab loading  | ⭐⭐⭐    |
| **Inline images in comments** | Expand linked images    | ⭐⭐⭐    |
| **Inline YouTube/Imgur**      | Embed media directly    | ⭐⭐⭐    |

---

### 2.4 User Management

| Feature               | Description               | Relevance |
| --------------------- | ------------------------- | --------- |
| **Tag users**         | Flag/label specific users | ⭐⭐⭐    |
| **Profile switching** | Quick account switcher    | ⭐⭐      |
| **Lurker mode**       | Read-only mode            | ⭐⭐      |

**Note**: User tagging is similar to RES (Reddit Enhancement Suite) functionality.

---

### 2.5 Navigation & Accessibility

| Feature                        | Description                | Relevance            |
| ------------------------------ | -------------------------- | -------------------- |
| **Autohiding nav bar**         | More vertical space        | ⭐⭐                 |
| **Left handed mode**           | Move controls to left side | ⭐⭐                 |
| **Dynamic island offset**      | Handle notched displays    | ⭐ (mobile-specific) |
| **Draggable nav buttons**      | Custom button placement    | ⭐⭐                 |
| **Button position lock/reset** | Prevent accidental moves   | ⭐⭐                 |

---

### 2.6 Multireddit/Custom Feeds

| Feature                          | Description                 | Relevance |
| -------------------------------- | --------------------------- | --------- |
| **Multireddit via switcher**     | Create/access custom multis | ⭐⭐⭐    |
| **Favorite subreddits switcher** | Quick sub access            | ⭐⭐⭐    |
| **Custom feeds support**         | Enhanced multi support      | ⭐⭐⭐    |

---

## 3. Low Relevance Features

Features that are outside our scope or specific to new Reddit/mobile.

### 3.1 Mobile-Specific Features

| Feature                       | Reason for Low Relevance                   |
| ----------------------------- | ------------------------------------------ |
| Mobile view optimizations     | Our extension is primarily desktop browser |
| iOS Safari specific features  | Platform-specific                          |
| Dynamic island/notch handling | Mobile hardware specific                   |
| Video downloader              | Different feature category                 |
| Gesture controls              | Touch-specific                             |

---

### 3.2 New Reddit-Only Features

| Feature                      | Reason for Low Relevance         |
| ---------------------------- | -------------------------------- |
| New UI specific blockers     | We redirect away from new Reddit |
| Card view enhancements       | New Reddit layout                |
| Compact feed for new UI      | New Reddit layout                |
| Gallery/video redesign fixes | New Reddit specific              |

---

### 3.3 Productivity Features

| Feature                              | Description              | Scope Assessment   |
| ------------------------------------ | ------------------------ | ------------------ |
| **Procrastination blocker**          | Time-based site blocking | Different category |
| **Dismissible vs permanent blocker** | Blocker configuration    | Different category |
| **Per-feed blocker settings**        | Granular block controls  | Different category |

---

## 4. Premium/Max Features Reference

Sink It has a "Max" tier ($5 lifetime) with these exclusive features:

| Feature                                | Available In |
| -------------------------------------- | ------------ |
| Color blind friendly comments          | Old UI       |
| Color coded comments                   | Old UI       |
| Dark mode / adaptive dark mode         | Old UI       |
| Auto-redirect NSFW posts to old Reddit | New UI       |
| Ban Subreddits                         | Old UI       |
| Ban Websites                           | Old UI       |
| Ban Words                              | Old UI       |
| Inline content in comments             | Old UI       |
| Auto-collapse automod comments         | Old UI       |
| Double tap to upvote                   | Old UI       |
| Profile switching                      | Old UI       |
| Mute users                             | Old/New UI   |
| Tag users                              | New UI       |

**Note**: Many "premium" features are on the Old UI, which suggests demand for old Reddit enhancements.

---

## 5. Business Model Notes

### Sink It's Approach

- **Free tier**: Core blocking (ads, nags, banners)
- **Max tier**: $5 lifetime, power user features
- **No subscription**: One-time purchase
- **No data collection**: Privacy-first

### Our Current Approach

- **Completely free**: No premium tier
- **Open source**: MIT license
- **No data collection**: All local

### Consideration

If we add significant new features, a donation option (not required payment) could help sustain development. Sink It demonstrates that users will pay for quality Reddit improvements.

---

## 6. Technical Implementation Notes

### Content Script Architecture

Sink It uses extensive content scripts for:

- DOM manipulation (comment coloring, element removal)
- Event listeners (gesture detection, scroll tracking)
- Mutation observers (dynamic content handling)
- CSS injection (dark mode, styling)

**Our current content script** (`content-script.js`) is minimal - just redirect notices. Expanding would require:

- More sophisticated DOM traversal
- Mutation observers for Reddit's dynamic loading
- Performance considerations for large threads

### Storage Architecture

Sink It tracks:

- User preferences (toggles, settings)
- Mute lists (subs, words, domains, users)
- Sort order preferences (per-subreddit)
- Scroll positions

**Our current storage** handles:

- Toggle state
- Whitelist
- Statistics
- User preferences

Expansion would need schema migration planning.

### Performance Considerations

Sink It changelog mentions:

- "Optimizations to reduce Reddit tabs opened in the background freezing up" (v7.12.0)
- "Memory consumption optimizations for large mute lists" (v7.82.0)
- "Speed optimizations for very large mute lists" (v7.75.0)

Any content-heavy features need careful performance testing.

---

## 7. Recommendations

### Tier 1: Quick Wins (Low effort, High impact)

1. **Enhanced Banner/Nag Removal**
   - Login popups on old Reddit
   - App download prompts
   - Cookie consent improvements
   - _Effort: Low (CSS selectors + mutation observer)_

2. **Basic Dark Mode Support**
   - System preference detection
   - Toggle in popup
   - CSS injection for old.reddit.com
   - _Effort: Medium_

3. **Auto-collapse Automod**
   - Hide bot/automod comments by default
   - User preference toggle
   - _Effort: Low-Medium_

### Tier 2: Valuable Additions (Medium effort)

4. **Subreddit Muting**
   - Block subs from /r/all and /r/popular
   - Import/export mute lists
   - Quick-add from context menu
   - _Effort: Medium_

5. **Color Coded Comments**
   - Rainbow nesting indicators
   - Color blind friendly palette option
   - _Effort: Medium_

6. **Comment Navigation**
   - Jump to next parent comment button
   - Back to top button
   - _Effort: Medium_

### Tier 3: Power User Features (Higher effort)

7. **Keyword/Domain Muting**
   - Block posts by title keywords
   - Block posts from specific domains
   - _Effort: Medium-High_

8. **Remember Sort Order**
   - Per-subreddit sort preference
   - Per-feed sort preference
   - _Effort: Medium_

9. **User Tagging**
   - RES-style user labels
   - Color coding
   - _Effort: High_

### Not Recommended

- **Procrastination blocker**: Outside core scope
- **Video downloader**: Different feature category
- **Mobile-specific features**: Different platform
- **New Reddit enhancements**: Contradicts our mission

---

## 8. Feature Comparison Matrix

| Category                  | Sink It                        | Old Reddit Redirect          |
| ------------------------- | ------------------------------ | ---------------------------- |
| **Core Function**         | Enhance both Reddit UIs        | Redirect to old Reddit       |
| **Dark Mode**             | ✅ Adaptive + OLED + Permanent | ❌ None                      |
| **Content Muting**        | ✅ Subs, words, domains, users | ⚠️ Whitelist only (opposite) |
| **Comment Enhancement**   | ✅ Colors, nav, collapse       | ❌ None                      |
| **Ad/Nag Blocking**       | ✅ Comprehensive               | ⚠️ Cookie banner only        |
| **Statistics**            | ❌ None                        | ✅ Redirect tracking         |
| **Toggle Control**        | ❌ Limited                     | ✅ Multiple methods          |
| **Alternative Frontends** | ❌ None                        | ✅ Teddit, Redlib            |
| **Subreddit Exceptions**  | ❌ Via muting                  | ✅ Whitelist for new Reddit  |
| **Mobile Support**        | ✅ iOS Safari app              | ⚠️ Firefox Android only      |
| **Premium Model**         | ✅ $5 lifetime                 | ❌ Free/open source          |
| **Privacy Focus**         | ✅ No data collection          | ✅ No data collection        |

---

## 9. Sink It Version History Highlights

Key milestones showing feature evolution:

| Version | Date     | Notable Features                               |
| ------- | -------- | ---------------------------------------------- |
| 1.0.0   | Jun 2023 | Initial release, NSFW modal removal            |
| 2.0.0   | ~2023    | Adaptive dark mode, core rewrite               |
| 3.0.0   | ~2023    | Remember scroll position, architecture changes |
| 4.0.0   | ~2024    | Hide join button, improved comments nav        |
| 5.0.0   | ~2024    | Jump to next comment, color blind mode         |
| 6.0.0   | ~2024    | Color coded comments, inline content           |
| 7.0.0   | ~2024    | Old Reddit mobile-friendly tweaks              |
| 7.50.0  | ~2025    | Open in new tab improvements                   |
| 7.80.0+ | ~2025    | Custom feeds, lurker mode, profile switching   |
| 7.100.0 | ~2025    | AI overview removal, games removal             |
| 7.104.0 | ~2026    | Ported most features to old Reddit UI          |

**Key insight**: Version 7.104.0 notes "Ported almost every feature to the old reddit UI" - confirming demand for old Reddit enhancements.

---

## 10. User Feedback Themes (from reviews)

Common praise points from Sink It reviews:

1. **"Makes Reddit usable again"** - Core value proposition
2. **"Privacy first"** - No data collection resonates
3. **"Like RES for mobile"** - Comparison to Reddit Enhancement Suite
4. **"Apollo replacement"** - Filling void left by third-party app shutdown
5. **"Ad-free experience"** - Blocking promoted content
6. **"Dark mode that works"** - System preference matching
7. **"$5 lifetime is fair"** - Willingness to pay for quality

---

## Appendix A: Full Feature List from Sink It

### Feed Features

- [x] Compact feed
- [x] Text only feeds
- [x] Uncropped images
- [x] Cleaner feeds (remove action links)
- [x] Hide join buttons
- [x] Remember sort order
- [x] Remember scroll position
- [x] Open post in new tab
- [x] Mute subreddits
- [x] Mute keywords
- [x] Mute domains
- [x] Mute users
- [x] Mute from feed (quick action)
- [x] Mute free zones
- [x] Bulk import mute lists

### Comment Features

- [x] Color coded comments
- [x] Color blind friendly mode
- [x] Alternate color themes
- [x] Jump to next comment
- [x] Jump to next parent comment
- [x] EZ collapse button
- [x] Auto-collapse automod
- [x] Auto-collapse 2nd level comments
- [x] Load more comments
- [x] Inline images in comments
- [x] Inline YouTube/Imgur embeds
- [x] Double tap to upvote
- [x] Back to top button

### UI/Theme Features

- [x] Adaptive dark mode
- [x] OLED/Pure black mode
- [x] Permanent dark mode
- [x] Autohiding nav bar
- [x] Collapsible sidebar
- [x] Left handed mode
- [x] Draggable nav buttons
- [x] Button position lock/reset
- [x] Dynamic island offset

### Blocking Features

- [x] Login nag removal
- [x] "Use app" banner removal
- [x] NSFW modal bypass
- [x] Cookie banner removal
- [x] Promoted content removal
- [x] Trending posts removal
- [x] Community highlights removal
- [x] "More posts you may like" removal
- [x] AI overview removal
- [x] Games sidebar removal
- [x] Auto-translated links removal
- [x] Tracking tag removal

### Advanced Features

- [x] Tag users
- [x] Profile switching
- [x] Lurker mode (read-only)
- [x] Procrastination blocker
- [x] Multireddit management
- [x] Favorite subreddits switcher
- [x] Custom feeds support
- [x] Video downloader (beta)
- [x] Export ban lists
- [x] Auto-translation toggle

### Redirect Features

- [x] Force redirect to old Reddit
- [x] Force redirect to old-new desktop
- [x] Force redirect to new mobile
- [x] Auto-redirect NSFW to old Reddit

---

## Appendix B: Sink It UI Screenshots Description

Based on store listings, Sink It shows:

1. Before/after comparison of cluttered vs clean Reddit
2. Settings panel with feature toggles
3. Color coded comments demonstration
4. Dark mode comparison
5. Mute list management interface

---

_Document generated for Old Reddit Redirect roadmap planning_

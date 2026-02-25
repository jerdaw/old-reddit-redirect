# Old Reddit Enhanced - Phase Progression Overview

> **Purpose**: Visual summary of feature evolution from launch to Phase 5
> **Date**: 2026-01-30

---

## Feature Evolution Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    Old Reddit Enhanced                          │
│                  Feature Evolution Timeline                      │
└─────────────────────────────────────────────────────────────────┘

v1.0-5.0 (Legacy)
├─ Core redirect functionality
├─ Toggle control
├─ Subreddit exceptions
├─ Statistics tracking
└─ Alternative frontends

Phase 1 & 2 (v6.0.0) ✅
├─ 🌙 Dark Mode (Auto/Light/Dark/OLED)
├─ 🚫 Enhanced Nag Blocking (4 categories)
├─ 🤖 Auto-collapse Bots (13 accounts)
├─ 📛 Subreddit Muting (100 max)
├─ 🔤 Keyword Muting (200 max)
└─ 🌐 Domain Muting (100 max)

Phase 3 (v7.0.0-7.2.0) ✅
├─ 🌈 Color-Coded Comments (depth indicators)
├─ 🧭 Comment Navigation (floating buttons)
└─ 🖼️  Inline Image Expansion (in comments)

Phase 4 (v8.0.0-10.0.0) ✅
├─ 🔄 Sort Order Memory (per-subreddit)
├─ 🏷️  User Tagging (500 max)
└─ 📍 Scroll Position Memory (100 positions)

Phase 5 (v11.0.0-11.2.0) 📋 PLANNED
├─ 📐 Compact Feed Mode
├─ 📄 Text-Only Mode
├─ 🖼️  Uncropped Image Thumbnails
├─ 🧹 Hide Clutter
├─ 🎨 Custom CSS Injection
├─ 🔒 Tracking Parameter Removal (30+ params)
├─ 🛡️  Referrer Control
├─ 🤖 AI Overview Blocking
├─ 🚫 Enhanced Promoted Content Blocking
└─ ⬆️  Jump to Top Button

Future Phases (Under Consideration)
├─ ⚡ Performance optimizations
├─ 🔍 Advanced filtering
├─ ⌨️  Keyboard shortcuts
└─ ♿ Accessibility features
```

---

## Feature Count Progression

| Phase       | Version(s)         | Features Added | Cumulative | Tests Added | Cumulative Tests |
| ----------- | ------------------ | -------------- | ---------- | ----------- | ---------------- |
| Legacy      | 1.0-5.0            | 5              | 5          | ~50         | ~50              |
| Phase 1 & 2 | v6.0.0             | 6              | 11         | ~100        | ~150             |
| Phase 3     | v7.0.0-7.2.0       | 3              | 14         | ~77         | ~227             |
| Phase 4     | v8.0.0-10.0.0      | 3              | 17         | ~43         | ~270             |
| **Phase 5** | **v11.0.0-11.2.0** | **10**         | **27**     | **~70**     | **~340**         |

---

## Codebase Growth

```
Lines of Code by File (Estimated)

                    v5.0    v10.0   v11.0 (projected)
background.js       800  →  954  →  1,004  (+50)
storage.js          900  →  1,094 →  1,374  (+280)
content-script.js   1,200 → 1,521 →  1,971  (+450)
options.js          2,200 → 2,592 →  2,892  (+300)
styles.css          300  →  450  →   680   (+230)
───────────────────────────────────────────────────
TOTAL               5,400   6,611    7,921  (+1,310)

Test Files:         ~1,500  ~2,700   ~3,350  (+650)
```

---

## Feature Category Breakdown

### Current State (v10.0.0)

```
Redirect Control:        ████████████ 5 features
Statistics & Analytics:  ████████ 3 features
Content Filtering:       ████████████ 6 features
UI Customization:        ████████ 4 features
Comment Enhancements:    ████████████ 3 features
User Memory:             ████████████ 3 features
Privacy:                 ████ 1 feature
```

### After Phase 5 (v11.2.0)

```
Redirect Control:        ████████████ 5 features
Statistics & Analytics:  ████████ 3 features
Content Filtering:       ████████████████ 9 features (+3)
UI Customization:        ████████████████ 9 features (+5)
Comment Enhancements:    ████████████ 3 features
User Memory:             ████████████ 3 features
Privacy:                 ████████████ 3 features (+2)
```

---

## Technology Stack Evolution

### Architecture

| Component           | v1.0       | v6.0     | v10.0    | v11.0 (planned) |
| ------------------- | ---------- | -------- | -------- | --------------- |
| **Manifest**        | V2         | V3       | V3       | V3              |
| **Redirect**        | webRequest | DNR      | DNR      | DNR             |
| **Background**      | Page       | Worker   | Worker   | Worker          |
| **Storage Version** | 1          | 2        | 2        | 3               |
| **Content Script**  | Basic      | Extended | Full     | Advanced        |
| **CSS Injection**   | None       | Basic    | Advanced | Custom          |

### Storage Objects

```javascript
// v1.0-5.0 (5 objects)
{
  enabled,
  whitelist,
  stats,
  ui,
  frontend
}

// v6.0.0 (8 objects)
{
  enabled, whitelist, stats, ui, frontend,
  darkMode,              // NEW
  nagBlocking,           // NEW
  contentFiltering       // NEW
}

// v7.0.0 (9 objects)
{
  ...,
  commentEnhancements    // NEW (v7.0.0)
}

// v8.0.0 (10 objects)
{
  ...,
  sortPreferences        // NEW (v8.0.0)
}

// v9.0.0 (11 objects)
{
  ...,
  userTags              // NEW (v9.0.0)
}

// v10.0.0 (12 objects)
{
  ...,
  scrollPositions       // NEW (v10.0.0)
}

// v11.0.0 PLANNED (14 objects)
{
  ...,
  feedEnhancements,     // NEW (v11.0.0)
  privacy              // NEW (v11.1.0)
  // nagBlocking extended (v11.2.0)
}
```

---

## User-Facing Impact

### Settings Complexity

| Version   | Options Page Sections | Total Settings | Toggles | Text Inputs |
| --------- | --------------------- | -------------- | ------- | ----------- |
| v5.0      | 5                     | ~15            | ~10     | ~5          |
| v6.0      | 10                    | ~35            | ~20     | ~15         |
| v10.0     | 14                    | ~50            | ~30     | ~20         |
| **v11.0** | **17**                | **~65**        | **~40** | **~25**     |

**Observation:** Settings are growing but remain well-organized with clear sections and defaults.

### User Control Spectrum

```
Low Control                                    High Control
├──────────┼──────────┼──────────┼──────────┼──────────┤
│          │          │          │          │          │
v1.0      v5.0      v6.0      v10.0     v11.0 (planned)
Basic     Toggle    Filtering  Memory    Custom CSS
```

---

## Performance Profile

### Estimated Performance Impact

| Metric                  | v5.0        | v10.0       | v11.0 (projected) |
| ----------------------- | ----------- | ----------- | ----------------- |
| **Page Load Time**      | Baseline    | +2%         | +3-5%             |
| **Memory Usage**        | 15 MB       | 18 MB       | 20-22 MB          |
| **Storage Usage**       | 50 KB       | 200 KB      | 250-300 KB        |
| **Content Script Size** | 1,200 lines | 1,521 lines | 1,971 lines       |

**Note:** Phase 5 features are opt-in, so users who don't enable them see minimal impact.

### Optimization Opportunities

After Phase 5, consider:

- Code splitting for optional features
- Lazy loading of large feature modules
- Storage compression for large datasets
- Performance profiling and optimization

---

## Competitive Positioning

### Feature Comparison with "Sink It for Reddit"

| Feature Category          | Sink It     | ORR v10.0  | ORR v11.0 (planned) |
| ------------------------- | ----------- | ---------- | ------------------- |
| **Core Redirect**         | ❌          | ✅         | ✅                  |
| **Dark Mode**             | ✅          | ✅         | ✅                  |
| **Content Filtering**     | ✅ Advanced | ✅ Good    | ✅ Advanced         |
| **Comment Enhancement**   | ✅          | ✅         | ✅                  |
| **Feed Customization**    | ✅          | ❌         | ✅ PLANNED          |
| **Privacy Protection**    | ⚠️ Limited  | ⚠️ Limited | ✅ PLANNED          |
| **User Tagging**          | ✅          | ✅         | ✅                  |
| **Statistics**            | ❌          | ✅         | ✅                  |
| **Alternative Frontends** | ❌          | ✅         | ✅                  |
| **Open Source**           | ❌          | ✅         | ✅                  |
| **Free/Paid**             | $5          | Free       | Free                |

**Conclusion:** After Phase 5, ORR will match or exceed Sink It's feature set for old Reddit.

---

## Development Velocity

### Release Cadence

```
Timeline of Major Releases

2023-2024: v1.0-v5.0    Legacy development (slow pace)
           ├─────────────────────────────────────┤

2026-01-30: v6.0.0      Phase 1 & 2 (6 features)
            ▓

2026-01-30: v7.0.0      Phase 3.1 (color comments)
            ▓

2026-01-30: v7.1.0      Phase 3.2 (comment nav)
            ▓

2026-01-30: v7.2.0      Phase 3.3 (inline images)
            ▓

2026-01-30: v8.0.0      Phase 4.1 (sort memory)
            ▓

2026-01-30: v9.0.0      Phase 4.2 (user tagging)
            ▓

2026-01-30: v10.0.0     Phase 4.3 (scroll memory)
            ▓

2026-??-??: v11.0.0     Phase 5.1 (feed enhancements) PLANNED
            ◯

2026-??-??: v11.1.0     Phase 5.2 (privacy) PLANNED
            ◯

2026-??-??: v11.2.0     Phase 5.3 (advanced blocking) PLANNED
            ◯
```

**Observation:** Rapid development in 2026 (7 releases on same day suggests backfilling). Phase 5 will be first real-time phased rollout.

---

## User Journey Evolution

### New User Onboarding

**v5.0:** Simple toggle explanation
**v6.0:** 5-slide onboarding with feature highlights
**v11.0:** Will need updated onboarding to highlight:

- Feed customization options
- Privacy features
- Advanced settings

### Power User Experience

**v5.0:**

```
Settings → Toggle redirect → Done
         → Maybe add exceptions
```

**v10.0:**

```
Settings → Choose dark mode
         → Configure content filters (3 types)
         → Customize comments (3 features)
         → Set up memory features (3 types)
         → Manage statistics
```

**v11.0 (planned):**

```
Settings → Choose dark mode
         → Configure content filters (3 types)
         → Customize comments (3 features)
         → Set up memory features (3 types)
         → Manage statistics
         → Customize feed appearance (5 options)     NEW
         → Configure privacy protection (2 features) NEW
         → Advanced blocking (3 features)            NEW
         → [Expert] Inject custom CSS                NEW
```

---

## Risk Profile Evolution

### Risk Heatmap

```
                    v5.0    v6.0    v10.0   v11.0
Reddit DOM Changes  ⚠️      ⚠️⚠️    ⚠️⚠️⚠️  ⚠️⚠️⚠️⚠️
Performance Impact  ✅      ⚠️      ⚠️⚠️    ⚠️⚠️
Maintenance Burden  ✅      ⚠️      ⚠️⚠️    ⚠️⚠️⚠️
User Confusion      ✅      ⚠️      ⚠️⚠️    ⚠️⚠️⚠️
Breaking Changes    ✅      ✅      ✅      ✅
Security Issues     ✅      ✅      ✅      ⚠️ (Custom CSS)

Legend:
✅ Low risk
⚠️ Medium risk (1-2 symbols)
⚠️⚠️⚠️ High risk (3-4 symbols)
```

**Mitigation Strategies:**

- All new features opt-in (reduces user confusion)
- Comprehensive testing (reduces breaking changes)
- CSS validation (reduces security issues)
- Conservative selectors (reduces DOM change impact)

---

## Strategic Alignment

### Project Vision

**Core Mission:** Make old.reddit.com the best Reddit experience

**Strategic Pillars:**

1. ✅ **Redirect Reliability** - Core functionality never broken
2. ✅ **User Control** - All features optional, sensible defaults
3. ✅ **Privacy First** - No tracking, local-first storage
4. ✅ **Performance** - Fast, efficient, no bloat
5. ✅ **Quality** - Well-tested, well-documented

### Phase Alignment Analysis

| Phase | Pillar Alignment | Strategic Fit  | Risk/Reward                  |
| ----- | ---------------- | -------------- | ---------------------------- |
| 1 & 2 | 2, 3, 4          | ⭐⭐⭐⭐⭐     | Low risk, high reward        |
| 3     | 2, 4             | ⭐⭐⭐⭐⭐     | Medium risk, high reward     |
| 4     | 2, 4             | ⭐⭐⭐⭐       | Low risk, medium reward      |
| **5** | **2, 3, 4**      | **⭐⭐⭐⭐⭐** | **Medium risk, high reward** |

**Phase 5 Verdict:** Excellent strategic fit. Addresses all key pillars except redirect reliability (already strong). Privacy features fill a major gap.

---

## Recommendations

### For Immediate Next Steps

1. ✅ **Planning Complete** - This document and implementation plan done
2. ⏳ **Stakeholder Review** - Get feedback on Phase 5 priorities
3. ⏳ **Begin v11.0.0** - Start with feed enhancements (lowest risk)
4. ⏳ **Set Up Testing** - Prepare manual test environments
5. ⏳ **Update Docs** - Prepare README/CHANGELOG templates

### For Long-Term Success

1. **Modular Architecture** - Consider splitting features into modules for better maintainability
2. **Feature Flags** - Implement gradual rollout capability
3. **Analytics (Privacy-Preserving)** - Understand which features users actually use
4. **Community Engagement** - Beta testing program for power users
5. **Documentation** - Video tutorials for complex features (custom CSS, etc.)

### For Phase 6 and Beyond

**After Phase 5 completion, focus on:**

1. **Optimization** - Reduce code size, improve performance
2. **Refinement** - Polish existing features based on user feedback
3. **Accessibility** - WCAG 2.1 compliance
4. **Internationalization** - Multi-language support (if demand exists)
5. **API Integration** - If Reddit ever provides useful APIs

**Avoid:**

- Feature bloat (stay focused on old.reddit.com enhancement)
- Scope creep (resist adding unrelated features)
- Platform expansion (no mobile app, no new Reddit focus)

---

## Conclusion

Phase 5 represents a **mature, strategic evolution** of Old Reddit Enhanced:

**By the Numbers:**

- 10 new features across 3 releases
- +70 tests (26% increase)
- +1,800 lines of code (27% increase)
- 10-week timeline (sustainable pace)

**By Impact:**

- Matches/exceeds competing extensions
- Fills privacy gap
- Provides advanced customization
- Maintains project principles

**By Risk:**

- All features opt-in (low adoption risk)
- Backward compatible (low technical risk)
- Well-tested (low quality risk)
- Phased rollout (low deployment risk)

**Recommendation:** ✅ **Proceed with Phase 5 as planned**

---

_Document Purpose: Strategic overview for stakeholders_
_Last Updated: 2026-01-30_
_Status: Planning Complete, Ready for Review_

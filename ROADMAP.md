# Old Reddit Redirect - Feature Roadmap

> **Purpose**: Track completed work and plan future enhancements for Old Reddit Redirect
>
> **Reference**: See `docs/SINK-IT-FEATURE-ANALYSIS.md` for competitive analysis

---

## Executive Summary

**Current Version**: 19.0.0
**Status**: Production ready, feature complete
**Architecture**: Manifest V3, modular ES6 with lazy loading
**Bundle Size**: 156KB (13.8% reduction from v18)
**Test Coverage**: 830 tests across 24 suites

**Feature Count**: 50+ major features across 14 completed phases
**Latest Release**: Comment Thread Minimap (v19.0.0)
**Next Focus**: Under consideration (see Future Phases below)

---

## Completed Phases

All core features have been implemented and are production-ready:

| Phase | Version | Theme | Key Features | Tests |
|-------|---------|-------|--------------|-------|
| **1-2** | v6.0.0 | Dark Mode & Filtering | Dark mode (4 themes), nag blocking, subreddit/keyword/domain muting | +70 |
| **3** | v7.0-7.2 | Comment Enhancements | Color-coded depth, navigation shortcuts (Shift+J/K), inline images | +77 |
| **4** | v8.0-10.0 | UX Polish | Sort memory, user tagging, scroll position memory | +71 |
| **5** | v11.0-11.2 | Feed & Privacy | Compact/text-only modes, tracker removal (58 params), referrer control | +70 |
| **6** | v13.0, v19.0 | Performance | Storage optimization, DOM batching, modular architecture (-13.8% bundle) | +28 |
| **7** | v14.0 | Accessibility | WCAG 2.1 compliance, high contrast, font sizing, reduce motion | +38 |
| **9** | v12.0-12.3 | Power Users | User muting, regex filtering, keyboard shortcuts, layout presets | +214 |
| **10** | v15.0 | Privacy | Enhanced tracker blocking, privacy dashboard with scoring | +39 |
| **11** | v16.0 | Reading History | Post tracking, visited indicators, history management | +28 |
| **12** | v17.0 | Navigation | Permalink highlighting, parent navigation, collapse memory | +28 |
| **13** | v18.0 | NSFW Controls | Blur/hide modes, subreddit allowlist, warning overlays | +39 |
| **14** | v19.0 | Thread Minimap | Visual overview, viewport indicator, depth colors | +46 |

**Total Impact**:
- 50+ features from 14 phases
- 830 comprehensive tests
- 156KB optimized bundle
- Full WCAG 2.1 AA/AAA compliance
- Native ES6 modules with lazy loading

<details>
<summary>Detailed Feature Descriptions (click to expand)</summary>

### Phase 1-2: Dark Mode & Content Filtering (v6.0.0)

**Dark Mode**:
- 4 themes: Auto, Light, Dark, OLED
- Nag blocking (login prompts, app banners, etc.)
- Auto-collapse 13 bot accounts (AutoModerator, etc.)

**Content Filtering**:
- Subreddit muting (up to 100, with wildcards)
- Keyword muting (up to 200, case-insensitive)
- Domain muting (up to 100, wildcard support)
- Import/export for all filter lists

### Phase 3: Comment Enhancements (v7.0-7.2)

- Color-coded depth indicators (rainbow + colorblind palettes)
- Floating navigation buttons with keyboard shortcuts (Shift+J/K)
- Inline image expansion (click to expand images in comments)
- Customizable stripe width and button position

### Phase 4: User Experience Polish (v8.0-10.0)

- Remember sort order per subreddit (auto-apply preferences)
- User tagging (500 tags, 12 colors, import/export)
- Scroll position memory (24-hour retention, LRU eviction)

### Phase 5: Feed Enhancements & Privacy (v11.0-11.2)

**Feed Enhancements**:
- Compact mode (reduce spacing)
- Text-only mode (hide all images)
- Uncropped thumbnails (full aspect ratio)
- Hide clutter (join buttons, action links)
- Custom CSS injection

**Privacy & Tracking**:
- Strip 58 tracking parameters (utm, fbclid, gclid, etc.)
- Referrer control (4 policies: default, no-referrer, origin, same-origin)
- AI overview blocking
- Enhanced promoted content blocking

### Phase 6: Performance & Optimization (v13.0, v19.0)

**Storage Optimization (v13.0)**:
- Quota monitoring (local + sync)
- Health reports (healthy/warning/critical)
- Automatic cleanup of expired data
- Storage compaction

**DOM Optimization (v13.0)**:
- Batched updates (requestAnimationFrame)
- Idle callbacks for non-critical work
- Adaptive throttling
- Smart mutation filtering

**Modular Architecture (v19.0)**:
- 24 ES6 modules (core, comments, feed, optional)
- Page-level lazy loading (/comments/ only)
- Feature-level conditional loading
- 13.8% bundle reduction (181KB → 156KB)
- 33-53% fewer lines executed per page
- 100-150ms faster initial load

### Phase 7: Accessibility (v14.0)

- Full keyboard navigation
- ARIA labels on all interactive elements
- Visible focus indicators (3px outline, 2px offset)
- Screen reader support (aria-live regions)
- High contrast mode (21:1 ratio, WCAG AAA)
- Font size controls (4 levels: 87.5%-125%)
- Reduce motion support (respects prefers-reduced-motion)

### Phase 9: Advanced User Features (v12.0-12.3)

**User Muting (v12.0)**:
- Hide posts/comments from specific users
- Context menu integration (right-click username)
- 500 user limit with LRU eviction
- Import/export lists

**Advanced Filtering (v12.1)**:
- Regex support for keywords
- Post content filtering (not just titles)
- Flair-based filtering (100 flairs)
- Score-based filtering (-999 to 999999)

**Keyboard Shortcuts (v12.2)**:
- 11 customizable shortcuts
- Chord support (e.g., G G for jump to top)
- Conflict detection with visual warnings
- Import/export configurations

**Layout Presets (v12.3)**:
- Save custom feed layouts
- Quick-switch between presets
- Per-subreddit preferences
- Custom CSS templates

### Phase 10: Privacy & Security (v15.0)

- Expanded tracker blocking to 58 parameters
- Categories: Social media, Analytics, Affiliate, Reddit-specific
- Privacy score (0-100) with visual ring
- Breakdown by 6 tracker categories
- Privacy recommendations
- Export reports as JSON

### Phase 11: Reading History (v16.0)

- Automatic tracking of viewed posts
- Stores: ID, title, subreddit, URL, comment count, timestamp
- Local-only storage (privacy-preserving)
- 500 entry limit with LRU eviction
- Retention period: 7-90 days
- Visual checkmark (✓) on visited posts
- Dimmed title styling
- History management UI with search
- Import/export as JSON

### Phase 12: Navigation Enhancements (v17.0)

- Permalink comment highlighting (auto-scroll + 2s fade)
- Parent comment navigation ("↑ parent" button on hover)
- Comment collapse memory (session storage)
- Support for hash and path-based links
- Dark mode compatible styling

### Phase 13: NSFW Content Controls (v18.0)

- Three visibility modes: Show, Blur, Hide
- Configurable blur intensity (5-20px)
- Reveal on hover option
- Warning overlay with click-to-reveal (10s timeout)
- Per-subreddit allowlist (100 subreddits)
- "18+ NSFW" badge on blurred content
- Disabled by default (respects user choice)

### Phase 14: Comment Thread Minimap (v19.0)

- Bird's-eye view of entire thread
- Fixed-position sidebar (left or right)
- Adjustable width (60-200px, default 120px)
- Adjustable opacity (10-100%, default 90%)
- Viewport indicator (semi-transparent overlay)
- Real-time scroll updates
- Click to jump to any position
- Color-coded depth markers (10 levels)
- Collapsed comment indicators (striped pattern)
- Auto-hide mode for reduced clutter

</details>

---

## Deferred Features

Features postponed from their original phases (planned for future releases):

| Feature | Original Phase | Description | Priority |
|---------|----------------|-------------|----------|
| **Performance Profiling Dashboard** | Phase 6 | Track metrics, identify bottlenecks | Medium |
| **Multi-Language Support (i18n)** | Phase 7 | Translate UI, RTL languages | High |
| **Anti-Fingerprinting** | Phase 10 | Canvas protection, UA randomization | Medium |
| **Encrypted Storage** | Phase 10 | Encrypt sensitive local data | Low |

**Status**: Deferred due to resource constraints. Implementation depends on community demand and developer availability.

---

## Future Phases (Under Consideration)

Potential next phases organized by priority and theme:

### Phase 8: Community & Collaboration Features

**Timeline**: 4-5 weeks
**Focus**: Enable community-driven improvements and reduce maintenance burden

| Feature | Description | Impact |
|---------|-------------|--------|
| **Shared Filter Lists** | Import/export standardized blocklists, one-click subscriptions | Community curation |
| **Custom Selector Contributions** | User interface for submitting CSS selectors, community voting | Crowdsourced maintenance |
| **DOM Change Monitoring** | Automated Reddit change detection, selector update notifications | Faster responses |
| **Filter List Marketplace** | Browse/install/rate community lists, privacy-preserving analytics | Engagement |

**Estimated Impact**:
- Faster response to Reddit UI changes
- Reduced solo maintenance burden
- Stronger community engagement
- Popular filter lists shared across users

---

### Phase 15: Advanced Navigation (Proposed)

**Timeline**: 2-3 weeks
**Focus**: Enhanced thread navigation and orientation

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Breadcrumb Navigation** | Visual hierarchy for deeply nested threads | Context awareness |
| **Improved Search** | In-page comment search with highlighting | Find discussions |
| **Thread Bookmarks** | Save positions within long threads | Resume reading |

---

### Phase 16: Content Discovery (Proposed)

**Timeline**: 3-4 weeks
**Focus**: Privacy-preserving content recommendations

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Related Posts** | Local-only suggestions based on reading history | Discover content |
| **Saved Post Organization** | Tags, folders, search for saved items | Better organization |
| **Smart Collections** | Auto-group saved posts by topic | Automatic curation |

---

## Lower Priority Ideas

Features under consideration but not yet prioritized:

### Navigation
- ~~Jump to permalink~~ ✅ v17.0.0
- ~~Thread minimap~~ ✅ v19.0.0
- Breadcrumb navigation for nested threads

### Content Discovery
- ~~Reading history~~ ✅ v16.0.0
- Related post suggestions (privacy-preserving)
- Saved post organization (tags, folders)

### NSFW Controls
- ~~Advanced filtering~~ ✅ v18.0.0
- ~~Blur options~~ ✅ v18.0.0
- Age verification reminder

### Monetization (Optional)
- Donation button (Ko-fi, GitHub Sponsors)
- Patron-exclusive beta features
- Open Collective for transparency
- **Note**: Extension remains 100% free

---

## Decision Criteria

When selecting the next phase, we consider:

1. **User Demand**: GitHub issues, requests, competitive analysis
2. **Maintenance Impact**: Does it reduce or increase ongoing work?
3. **Technical Debt**: Clean up existing code or add complexity?
4. **Differentiation**: Stand out from competing extensions?
5. **Resources**: Developer time and testing capacity available?
6. **Risk vs. Reward**: High-impact, low-risk features prioritized

---

## Contributing

Feature requests and suggestions are welcome! Please open a [GitHub issue](https://github.com/tom-james-watson/old-reddit-redirect/issues) with:

- **Use Case**: Why you need this feature
- **Priority**: How important is it to you?
- **Alternatives**: What workarounds do you currently use?

We prioritize features with strong community support and clear use cases.

### Development Process

1. Feature discussion in GitHub issues
2. Phase planning and technical design
3. Implementation with test coverage
4. User testing and feedback
5. Release with documentation

See `CONTRIBUTING.md` for development guidelines.

---

## References

- **Competitive Analysis**: `docs/SINK-IT-FEATURE-ANALYSIS.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Architecture**: `CLAUDE.md`
- **Migration Docs**: `MIGRATION-COMPLETE.md`, `PHASE-1-COMPLETE.md` through `PHASE-7-COMPLETE.md`

---

_Last updated: 2026-02-04_

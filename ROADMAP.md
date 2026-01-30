# Old Reddit Redirect - Feature Roadmap

> **Purpose**: Prioritized feature roadmap for enhancing Old Reddit Redirect based on analysis of competing extensions and user needs.
>
> **Reference**: See `docs/SINK-IT-FEATURE-ANALYSIS.md` for detailed competitive analysis.

---

## Overview

This roadmap organizes new features into phases. Each phase has a theme and builds on previous work. Features are designed to be implemented independently where possible.

**Current Version**: 10.0.0
**Architecture**: Manifest V3, declarativeNetRequest, service worker
**Completed Phases**: Phase 1 (3 features), Phase 2 (3 features), Phase 3 (3 features), Phase 4 (3 features - COMPLETE)
**Status**: Production ready with 12 major features implemented

---

## 🎉 Completed Features

All four phases of the roadmap have been successfully implemented:

### Phase 1: Enhanced Blocking & Dark Mode ✅ (v6.0.0)

- **1.1 Dark Mode Support** - Auto/Light/Dark/OLED themes
- **1.2 Enhanced Nag/Banner Removal** - Granular blocking controls
- **1.3 Auto-collapse Automod Comments** - 13 bot accounts

### Phase 2: Content Filtering ✅ (v6.0.0)

- **2.1 Subreddit Muting** - Filter unwanted communities (up to 100)
- **2.2 Keyword Muting** - Filter by title keywords/phrases (up to 200)
- **2.3 Domain Muting** - Filter by linked domains with wildcards (up to 100)

### Phase 3: Comment Enhancements ✅ (v7.0.0 - v7.2.0)

- **3.1 Color-Coded Comments** - Visual depth indicators with customizable palettes (v7.0.0)
- **3.2 Comment Navigation Buttons** - Floating UI with keyboard shortcuts (v7.1.0)
- **3.3 Inline Image Expansion** - Expand images directly in comments (v7.2.0)

### Phase 4: User Experience Polish ✅ (v8.0.0 - v10.0.0)

- **4.1 Remember Sort Order** - Auto-apply preferred sort per subreddit (v8.0.0)
- **4.2 User Tagging** - Custom labels/tags for Reddit users (v9.0.0)
- **4.3 Scroll Position Memory** - Remember scroll position when navigating back (v10.0.0)

**See CHANGELOG.md for detailed feature documentation and README.md for usage instructions.**

---

## 🚧 Future Phases (Under Consideration)

All currently planned phases (1-4) have been completed. Future enhancements may include:

- Performance optimizations
- Additional filtering options
- More customization controls
- Integration with Reddit's evolving features

For feature requests or suggestions, please open an issue on GitHub.

---

## Version Planning

| Version | Phase | Target Features                  | Status          |
| ------- | ----- | -------------------------------- | --------------- |
| 6.0.0   | 1 & 2 | All Phase 1 and Phase 2 features | ✅ **Released** |
| 7.0.0   | 3     | Color-coded comments             | ✅ **Released** |
| 7.1.0   | 3     | Comment navigation               | ✅ **Released** |
| 7.2.0   | 3     | Inline image expansion           | ✅ **Released** |
| 8.0.0   | 4     | Sort memory                      | ✅ **Released** |
| 9.0.0   | 4     | User tagging                     | ✅ **Released** |
| 10.0.0  | 4     | Scroll memory                    | ✅ **Released** |

**v7.1.0 includes:**

- Phase 3.2: Comment navigation buttons (floating UI, keyboard shortcuts Shift+J/K, position customization)

**v7.0.0 includes:**

- Phase 3.1: Color-coded comments (rainbow + color-blind palettes, stripe width customization)

**v6.0.0 includes:**

- Phase 1: Dark mode (4 modes), nag blocking (4 categories), auto-collapse bots (13 accounts)
- Phase 2: Subreddit muting, keyword muting, domain muting (all with import/export)

---

## References

- **Competitive Analysis**: `docs/SINK-IT-FEATURE-ANALYSIS.md`
- **Contributing Guide**: `CONTRIBUTING.md`
- **Architecture Notes**: `CLAUDE.md`

---

_Last updated: 2026-01-30_

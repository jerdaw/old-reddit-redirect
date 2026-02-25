# ADR-001: Rebrand to Old Reddit Enhanced

**Status**: Accepted
**Date**: 2026-02-24
**Author**: Jeremy Dawson

---

## Context

This project was originally forked from [tom-james-watson/old-reddit-redirect](https://github.com/tom-james-watson/old-reddit-redirect), an 8-file extension whose sole purpose was redirecting Reddit URLs to old.reddit.com.

By February 2026 the fork had grown to:

- 158+ files, ~70,000 lines of code
- 24 ES6 feature modules with lazy loading
- 905 automated tests across 33 suites
- 19 released versions (v6.0.0 – v19.0.0)
- Dark mode, content filtering, keyboard shortcuts, reading history, accessibility, NSFW controls, comment minimap, and more

The name "Old Reddit Redirect" no longer described the product. It also created confusion with the upstream project, which remained a simple ~8-file redirect extension.

## Decision

Rename the project to **Old Reddit Enhanced** (abbreviation: **ORE**).

- GitHub repository: `jerdaw/old-reddit-redirect` → `jerdaw/old-reddit-enhanced`
- Extension display name: "Old Reddit Redirect" → "Old Reddit Enhanced"
- Log prefix: `[ORR]` → `[ORE]`
- Export filenames: `old-reddit-redirect-*` → `old-reddit-enhanced-*`
- List format type: `orr-list` → `ore-list` (old format accepted for backward compatibility)

### What was NOT changed

| Item                                                          | Reason                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| CSS `orr-` class prefix (~990 occurrences)                    | Internal namespace, not user-visible; risk of breaking styles outweighs benefit |
| `ORRI18n` global (~19 occurrences)                            | Internal, not user-visible                                                      |
| Firefox GUID `{9063c2e9-...}`                                 | Store continuity; changing breaks existing installs                             |
| Chrome extension ID `dneaehbmnbhcippjikoajpoabadpodje`        | Store continuity                                                                |
| Historical issue links to `tom-james-watson/...` in CHANGELOG | Those reference real upstream issues; changing them would break links           |

## Alternatives Considered

1. **Keep "Old Reddit Redirect"** — Rejected. Name is misleading; doesn't convey the extension's breadth.
2. **"Old Reddit Plus" / "Classic Reddit Enhanced"** — Considered but "Old Reddit Enhanced" clearly signals both the target (old Reddit) and the nature (enhancement).
3. **Gradual rename across multiple releases** — Rejected. The rename is mechanical; splitting it creates inconsistent intermediate states in Git history.

## Consequences

- Extension store listings (Chrome Web Store, Firefox Add-ons) keep the same extension IDs and slugs. Store display names will update on next publish.
- Firefox Add-ons slug (`addons.mozilla.org/firefox/addon/old-reddit-redirect`) requires a manual update on the AMO dashboard.
- GitHub auto-redirects the old repository URL for a grace period after rename.
- Users who exported filter lists with `type: "orr-list"` can still import them — the validators accept both `ore-list` and `orr-list`.
- Attribution: project maintains dual copyright (Tom Watson 2014, Jeremy Dawson 2026) per MIT License requirements.

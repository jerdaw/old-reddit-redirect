---
title: "Maintenance Log"
status: archived
owner: jer
created: 2026-02-24
archived: 2026-02-24
last_updated: 2026-02-24
tags:
  - maintenance
  - rebrand
  - cleanup
  - docs
---

# Maintenance Log (2026-02-24)

Owner: jer
Status: archived
Last updated: 2026-02-24

Scope: Rebrand from "Old Reddit Redirect" to "Old Reddit Enhanced", followed by standard
maintenance cleanup (docs, AGENTS.md, CHANGELOG, ROADMAP, ADR, commit and push).

## Rebrand

- [x] `LICENSE.txt` — dual copyright: Tom Watson (2014) + Jeremy Dawson (2026)
- [x] `package.json` — name `old-reddit-enhanced`, description updated; `package-lock.json` regenerated
- [x] `manifest.json` — `default_title` updated
- [x] `Makefile` — zip filename → `old-reddit-enhanced.zip`
- [x] `src/core/constants.js` — `LOG_PREFIX` → `[ORE]`
- [x] Both `_locales/en/messages.json` copies — `extName`, `options_title`, `popup_container_aria`, `popup_logo_alt`
- [x] `src/core/background.js` — tooltip text and notification titles
- [x] `src/core/logger.js` — local LOG_PREFIX `[OldRedditRedirect]` → `[OldRedditEnhanced]`
- [x] `modules/shared/import-export.js` — export filename, list type, filename prefix
- [x] `modules/community/issue-reporter.js` — GitHub URL
- [x] `src/pages/options/options.js` — GitHub URL, export filenames, export prefixes, list type
- [x] `src/pages/popup/popup.js` — GitHub URL
- [x] HTML pages (popup, options, onboarding, marketplace)
- [x] Backward compat: `subscriptions.js` and `marketplace.js` accept both `ore-list` and `orr-list`
- [x] Bulk `[ORR]` → `[ORE]` across 33 source files (src/ + modules/)
- [x] CI/CD workflows updated (zip filename references)
- [x] `tests/community.test.js` — `orr-list` → `ore-list`
- [x] Documentation (README, PRIVACY, CHANGELOG, ROADMAP, CONTRIBUTING, AGENTS, RELEASE_NOTES, store/, docs/)
- [x] `src/assets/marketplace/lists.json` — GitHub raw URLs

## Maintenance

- [x] AGENTS.md — clarified AI attribution policy (AI may commit code but must not be listed as author in any form)
- [x] CHANGELOG.md — added rebrand entry
- [x] Created `docs/adr/001-rebrand-to-old-reddit-enhanced.md`
- [x] Updated `docs/README.md` — added ADR section
- [x] ROADMAP.md — updated last_updated date
- [x] Verified all 905 tests pass post-rebrand
- [x] `npm run lint:fix && npm run format` — clean
- [x] Verified zero `[ORR]`, zero `Old Reddit Redirect` in src/ and modules/
- [x] All git commits have human-only authorship

## Notes

The CSS `orr-` class prefix (~990 occurrences) and `ORRI18n` global (~19 occurrences) were
intentionally left unchanged — they are internal namespaces, not user-visible branding.
See ADR-001 for full rationale.

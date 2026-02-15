---
status: archived
last_updated: 2026-02-15
owner: jer
tags: [v23, stabilization, i18n]
---

# Stabilization Plan: v23 and i18n Foundation

## Objective

Stabilize the in-progress v20-v23 work so the extension returns to project standards:

- script architecture consistency (IIFE in `src/pages/**`),
- valid HTML/JS, lint-clean code,
- working storage/module wiring for newly added features,
- updated roadmap and implementation tracking.

## Scope

- Keep and stabilize the already-started work in:
  - advanced comment navigation (breadcrumbs/search/bookmarks),
  - sustainability/compliance scaffolding,
  - community/discovery scaffolding,
  - i18n base files and popup localization.
- Do not expand scope into full multilingual rollout in this pass.

## Checklist

- [x] Step 1: Baseline audit and implementation plan creation.
- [x] Step 2: Restore and stabilize `src/pages/**` script architecture (IIFE/script mode), fix syntax/runtime blockers.
- [x] Step 3: Repair HTML structure and event wiring regressions in Options/Popup/Marketplace pages.
- [x] Step 4: Resolve module/test lint issues introduced by new files.
- [x] Step 5: Verify with lint + targeted tests + full test run (or clearly report blockers).
- [x] Step 6: Update `ROADMAP.md` and check off completed stabilization items.
- [x] Step 7: Implement community subscription merge logic for shared list imports.
- [x] Step 8: Enable runtime i18n application on Options UI (`data-i18n`, placeholders, titles).
- [x] Step 9: Apply RTL-aware document direction (`dir/lang`) in Options and Popup based on UI language.
- [x] Step 10: Implement and wire language override (`auto`/`en`) across storage, Options UI, and shared runtime i18n helper.
- [x] Step 11: Extend runtime i18n to localize accessibility attributes (`aria-label`, `alt`) and extract remaining Popup/Options shell strings.
- [x] Step 12: Extract major lower-page Options UI strings (keywords/flair/score/domains/community/history/NSFW/storage) to existing locale keys.
- [x] Step 13: Extract remaining lower-page Options strings (URL testing, keyboard shortcuts, backup/sync, sustainability, footer) to existing locale keys.
- [x] Step 14: Reconcile missing locale keys referenced by `data-i18n*` attributes and preserve structured privacy/referrer labels during localization.
- [x] Step 15: Add automated i18n key coverage tests to prevent `data-i18n*`/`msg()` key drift and locale catalog desync.
- [x] Step 16: Replace `UI_STRINGS` runtime usage in `options.js` with locale-backed `msg()` keys and remove the now-stale `options-constants.js` page dependency.
- [x] Step 17: Localize static runtime `showToast`/`confirm`/`alert` literals in `options.js` to `msg()` keys with catalog coverage.
- [x] Step 18: Localize remaining parameterized runtime strings in `options.js` (counts/names/error details) using message placeholders and substitutions.
- [x] Step 19: Localize remaining non-toast runtime UI literals in `options.js` (URL test messages, prompts, generated action labels, sort/time/date/status text) with `msg()` keys.

## Exit Criteria

- `npm run lint` passes.
- Critical/changed tests pass (new feature suites + related integration suites).
- No syntax errors in changed JS entry points.
- Roadmap and plan reflect implemented status with checked items.

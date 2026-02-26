# ADR-002: Comprehensive Security, Reliability, and Performance Audit

**Date**: 2026-02-26
**Status**: Accepted
**Decision**: Implement 20 fixes identified in a comprehensive codebase audit

## Context

The extension had grown to 24 feature modules, 156KB bundle, and 905 tests. A full audit identified 20 non-trivial issues across security, reliability, performance, accessibility, and testing gaps that needed addressing before the next release.

## Decision

Implement all 20 fixes in 7 batches ordered by risk (lowest first), dependency chains, and file proximity:

1. **Redirect Rules & Permissions** — Missing `tabs` permission, `new.reddit.com` host permission, and `new` subdomain in redirect rules
2. **Security** — XSS via `innerHTML` in marketplace, SSRF via custom domain input, import validation gaps (size/count/regex limits)
3. **Storage Infrastructure** — Read-modify-write race conditions (added mutex), shallow merge losing nested properties (added `deepMerge`)
4. **Service Worker Reliability** — MV3 state loss on termination (rebuild from session rules), silent error swallowing in `Promise.allSettled`
5. **Performance** — Flash of wrong theme (localStorage cache), layout thrashing in minimap (read/write batching), redundant 1s polling, unbatched storage reads
6. **UI/UX & Accessibility** — Event listener leaks, modal focus trapping with ARIA attributes, options page sidebar navigation with search
7. **CI & Integration Tests** — Firefox `web-ext lint` in CI, integration test suite, background.js test suite

## Consequences

- Test count increased from 905 to 938 (33 new tests across 3 new test files)
- All existing tests continue to pass
- Security surface reduced (XSS, SSRF, import validation)
- Storage operations are now serialized and deep-merge-safe
- Service worker survives MV3 termination without state loss
- Theme flash eliminated via synchronous cache
- Options page is navigable with sidebar + search
- CI now validates Firefox compatibility

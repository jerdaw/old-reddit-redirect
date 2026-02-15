# Maintenance Plan (2026-02-15)

Owner: jer
Status: in-progress
Last updated: 2026-02-15

Scope: Maintenance, cleanup, documentation accuracy, attribution policy compliance, and repo hygiene. Keep changes focused on shipping/maintaining core functionality.

## Step 1: Audit And Cleanup

- [ ] Remove temp/junk files and artifacts (without deleting needed dev deps mid-work)
- [x] Verify `.gitignore` covers local-only artifacts (and does not unintentionally ignore committed docs)
- [x] Ensure `CLAUDE.md` and `GEMINI.md` are symlinks to `AGENTS.md`

## Step 2: Docs And Roadmap Accuracy

- [x] Update docs index (`docs/README.md`) for any new/archived docs
- [x] Update `ROADMAP.md` to reflect reality (version/status/what is actually complete)
- [ ] If a plan is fully implemented, archive it per `docs/archive/` conventions

## Step 3: Attribution Policy Compliance

- [x] Repo-wide scan for AI attribution strings (docs, comments, commit trailers)
- [x] Ensure policy is explicitly stated in `AGENTS.md` (no AI attribution in commits/docs/code)

## Step 4: Tests And Verification

- [ ] Add/adjust tests as needed for any maintenance changes
- [x] Run `npm run lint` (or `npm run lint:fix` if needed)
- [x] Run `npm test` (do not run Playwright locally)

## Step 5: Git Hygiene (Commit + Push)

- [x] Review staged content for secrets/sensitive data
- [x] Commit changes with human author only (no AI attribution trailers)
- [x] Push

## Step 6: Historical Author Audit (If Required)

- [x] Verify past commits do not list non-human/bot authors
- [x] If needed, rewrite history to replace non-human identities with the appropriate human maintainer (requires force push)

## Notes

### Local Cleanup Commands

This repo ignores local artifacts like `.claude/` and `_metadata/`. If you want them removed locally:

```bash
rm -rf .claude _metadata
```

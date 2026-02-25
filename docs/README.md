# Documentation Index

This directory contains detailed documentation for the Old Reddit Enhanced project.

## Architecture Decision Records (`adr/`)

Significant architectural and project decisions:

- **[ADR-001](adr/001-rebrand-to-old-reddit-enhanced.md)** — Rebrand to Old Reddit Enhanced (2026-02-24)

## Migration Documentation (`migration/`)

Documentation of the modular architecture migration (v19.0.0):

- **MIGRATION-COMPLETE.md** - Complete migration summary and learnings
- **PHASE-1-COMPLETE.md** - Foundation and feature flag setup
- **PHASE-2-COMPLETE.md** - Core modules extraction
- **PHASE-3-COMPLETE.md** - Comment features modularization
- **PHASE-7-COMPLETE.md** - Legacy code removal and finalization

Key outcomes:

- 13.8% smaller bundle (181KB → 156KB)
- 33-53% fewer lines executed per page
- Native ES6 modules with lazy loading

## Testing Documentation (`testing/`)

Manual test checklists for major releases:

- **MANUAL-TEST-v7.0.0.md** - Dark mode and content filtering tests
- **MANUAL-TEST-v7.1.0.md** - Comment enhancements tests
- **MANUAL-TEST-v7.2.0.md** - Navigation features tests
- **MANUAL-TEST-v8.0.0.md** - User tagging and sort preferences tests

## Archive (`archive/`)

Historical planning and implementation documents:

- **IMPLEMENTATION-LOG.md** - Development history and decisions
- **IMPLEMENTATION-PLAN-v7.md** through **v12.3.md** - Version planning docs
- **2026-02-15-v23-stabilization-plan.md** - Archived stabilization plan (completed)
- **2026-02-15-maintenance-plan.md** - Archived maintenance plan (completed)
- **2026-02-24-maintenance-log.md** - Rebrand + maintenance log (completed)
- **PHASE-\*-SUMMARY.md** - Phase completion summaries
- **SINK-IT-FEATURE-ANALYSIS.md** - Feature comparison analysis

These documents are kept for historical reference but represent completed work.

## Planning (`planning/`)

Short-lived implementation/maintenance plans that are actively being worked. When a plan is complete, it should be archived into `archive/`.

## Active Documentation (root directory)

For actively maintained documentation, see the project root:

- **README.md** - Project overview and installation
- **AGENTS.md** - AI coding agent instructions
- **CHANGELOG.md** - User-facing version history
- **CONTRIBUTING.md** - Contributor guidelines
- **ROADMAP.md** - Future plans and priorities
- **PRIVACY.md** - Privacy policy
- **LICENSE.txt** - MIT License

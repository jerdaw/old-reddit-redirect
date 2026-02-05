# Contributing to Old Reddit Redirect

Thank you for your interest in contributing to this actively maintained fork of Old Reddit Redirect!

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone git@github.com:YOUR_USERNAME/old-reddit-redirect.git
   cd old-reddit-redirect
   ```

3. Ensure you have [Node.js](https://nodejs.org/en) installed

4. Start the development server:
   ```bash
   make run
   ```
   This will launch Firefox with the extension loaded for testing.

## Development Workflow

### Architecture Overview

This extension uses a **modular ES6 architecture** (v19.0.0+) with lazy loading:

- **Entry point**: `content-script.js` (25 lines) imports `modules/loader.js`
- **Lazy loading**: Comment features only load on `/comments/` pages
- **Conditional loading**: Optional features only load when enabled
- **No bundler**: Native ES6 modules for simple builds and easy debugging

See `CLAUDE.md` for complete architectural details and patterns.

### Testing Your Changes

1. Make your changes to the source files
2. Run automated tests: `npm test` (830 tests across 24 suites)
3. Run linting and formatting:
   ```bash
   npm run lint:fix
   npm run format
   ```
4. The `web-ext` development server will auto-reload the extension
5. Test manually by:
   - Navigating to various Reddit URLs
   - Clicking the extension icon to toggle on/off
   - Testing keyboard shortcut (Alt+Shift+R)
   - Right-clicking Reddit links to test context menu
   - Opening extension options page
   - Checking both enabled and disabled states
   - Verifying badge shows "OFF" when disabled
   - Verifying allowlisted paths (e.g., `/settings`, `/mod`)
   - Testing feature-specific functionality (dark mode, comment navigation, etc.)

### Code Style

- Use consistent formatting with existing code
- Prefer modern JavaScript (ES6+)
- Add comments for complex logic
- Keep functions focused and small

### Key Files

**Core Configuration:**
- `manifest.json` - Extension manifest (Manifest V3, ES module support)
- `rules.json` - Declarative net request redirect rules with priority system

**Source Code (`src/`):**
- `src/core/background.js` - Service worker (toggle, stats, context menus)
- `src/core/storage.js` - Centralized storage abstraction with sync
- `src/core/logger.js` - Logging utility with configurable levels
- `src/core/frontends.js` - Alternative frontend configurations
- `src/content/content-script.js` - Entry point (25 lines, imports modular loader)
- `src/content/styles.css` - Content script CSS (themes, nag blocking)
- `src/pages/popup/` - Extension popup UI
- `src/pages/options/` - Full options page
- `src/pages/onboarding/` - First-run experience

**Modular Features (`modules/`):**
- `modules/loader.js` - Module orchestrator for lazy/conditional loading
- `modules/shared/` - Shared utilities (page-detection, dom-helpers, storage-helpers)
- `modules/core/` - Always-loaded features (dark-mode, accessibility, nag-blocking, content-filtering)
- `modules/comments/` - Lazy-loaded for /comments/ pages (color-coding, navigation, inline-images, minimap)
- `modules/feed/` - Lazy-loaded for feed pages (feed-modes, sort-preferences)
- `modules/optional/` - Conditionally loaded when enabled (user-tags, nsfw-controls, layout-presets, reading-history)

**Testing & Documentation:**
- `tests/` - Comprehensive test suite (830 tests across 24 suites)
- `CLAUDE.md` - Complete architecture guide for AI coding assistants
- `MIGRATION-COMPLETE.md` - Modular architecture migration summary
- `ROADMAP.md` - Feature roadmap and release planning

See `CLAUDE.md` for complete architecture documentation.

## Submitting Changes

1. Create a descriptive branch name:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. Make your changes, run tests and linting, then commit with clear messages:

   ```bash
   npm test
   npm run lint
   npm run format:check
   git commit -m "Add support for chat.reddit.com redirect"
   ```

3. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub with:
   - Clear description of what changed
   - Why the change is needed
   - Any related issue numbers (e.g., "Fixes #190")
   - Testing steps you performed

## Adding New Modular Features

When adding new features to the extension, follow the modular architecture pattern:

1. **Choose the appropriate category:**
   - `modules/core/` - Always-loaded features (accessibility, dark mode, etc.)
   - `modules/comments/` - Comment page features (lazy-loaded)
   - `modules/feed/` - Feed page features (lazy-loaded)
   - `modules/optional/` - Optional features (conditionally loaded)

2. **Create your feature module:**
   ```javascript
   // modules/optional/my-feature.js
   import { getStorage } from "../shared/storage-helpers.js";
   import { isCommentsPage } from "../shared/page-detection.js";

   export async function initMyFeature() {
     const prefs = await getStorage({ myFeature: { enabled: false } });
     if (!prefs.myFeature.enabled) return;

     // Your feature logic here
   }
   ```

3. **Add to the appropriate orchestrator:**
   - Edit `modules/optional/index.js` (or the relevant category index)
   - Add conditional loading logic using `Promise.allSettled()`

4. **Add comprehensive tests:**
   - Create `tests/my-feature.test.js`
   - Cover initialization, edge cases, and error handling
   - Run `npm test` to ensure all 830+ tests still pass

5. **Update documentation:**
   - Add feature description to `CLAUDE.md`
   - Update `ROADMAP.md` with version and phase info

**Key patterns:**
- Use `Promise.allSettled()` for parallel loading (fail gracefully)
- Import shared utilities to prevent code duplication
- Export both init functions AND individual functions (for cross-module integration)
- Use `requestIdleCallback` for non-critical operations

See `MIGRATION-COMPLETE.md` for detailed migration patterns and learnings.

## Adding New Redirect Rules

If you're adding new URL patterns to redirect:

1. Edit `rules.json` and add a new rule object
2. Assign a unique `id` (increment from the last rule)
3. Set appropriate `priority`:
   - Priority 3: Allowlist rules (URLs that should NOT redirect)
   - Priority 2: Special redirects (galleries, videos, header modifications)
   - Priority 1: Domain redirects
4. Add to `host_permissions` in `manifest.json` if needed
5. Add test cases to `tests/patterns.test.js` for the new rule
6. Run `npm test` to verify tests pass
7. Test thoroughly with `make run`

Example:

```json
{
  "id": 10,
  "priority": 1,
  "condition": {
    "urlFilter": "||chat.reddit.com/*",
    "resourceTypes": ["main_frame"]
  },
  "action": {
    "type": "redirect",
    "redirect": {
      "transform": { "host": "old.reddit.com" }
    }
  }
}
```

## Reporting Issues

Found a bug or have a feature request?

1. Check existing [issues](https://github.com/jerdaw/old-reddit-redirect/issues) first
2. Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Browser and extension version
   - Example URLs that demonstrate the issue

## Questions?

Open an issue for discussion or questions about:

- Architecture decisions
- Feature proposals
- Implementation approaches

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Welcome newcomers and help them learn
- Keep discussions on-topic

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers this project.

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

### Testing Your Changes

1. Make your changes to the source files
2. Run automated tests: `npm test`
3. The `web-ext` development server will auto-reload the extension
4. Test manually by:
   - Navigating to various Reddit URLs
   - Clicking the extension icon to toggle on/off
   - Testing keyboard shortcut (Alt+Shift+R)
   - Right-clicking Reddit links to test context menu
   - Opening extension options page
   - Checking both enabled and disabled states
   - Verifying badge shows "OFF" when disabled
   - Verifying allowlisted paths (e.g., `/settings`, `/mod`)

### Code Style

- Use consistent formatting with existing code
- Prefer modern JavaScript (ES6+)
- Add comments for complex logic
- Keep functions focused and small

### Key Files

- `manifest.json` - Extension metadata and permissions
- `rules.json` - Declarative net request rules for redirects
- `background.js` - Service worker for toggle, keyboard shortcut, and context menu
- `styles.css` - Content script CSS (injected on old.reddit.com)
- `options.html/js/css` - Extension options page
- `tests/` - Vitest test suite
- `scripts/sync-version.js` - Version synchronization utility

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

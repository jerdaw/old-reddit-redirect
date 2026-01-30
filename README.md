# Old Reddit Redirect

> [!IMPORTANT]
> **This is an actively maintained fork** of [tom-james-watson/old-reddit-redirect](https://github.com/tom-james-watson/old-reddit-redirect).
>
> The original repository has not been updated since July 2025. This fork includes new features and bug fixes that have been requested but not merged upstream.

## New Features in This Fork

### Core Features
- **Popup UI** - Click icon to access quick settings, stats, and controls
- **Configurable icon click** - Choose between popup or instant toggle
- **Keyboard shortcut (Alt+Shift+R)** - Quickly toggle redirect on/off
- **Context menu** - Right-click Reddit links to open in old or new Reddit
- **First-run onboarding** - Interactive tutorial for new users
- **Statistics tracking** - View total, daily, and per-subreddit redirect counts
- **Settings sync** - Sync preferences across browsers (optional)

### URL Handling
- **Mobile Reddit support (m.reddit.com)** - Mobile web links now redirect
- **Share link handling** - `/r/*/s/*` links redirect properly
- **Gallery/video support** - Handles post IDs with hyphens
- **Support for nr/ns subdomains** ([#174](https://github.com/tom-james-watson/old-reddit-redirect/issues/174), [#175](https://github.com/tom-james-watson/old-reddit-redirect/issues/175))
- **Reddit .onion domain support** - Full Tor compatibility

### Subreddit Management
- **Subreddit exceptions** - Whitelist subreddits to keep on new Reddit
- **Smart suggestions** - Curated list of subreddits using new Reddit features
- **URL testing tool** - Check if a URL would redirect before visiting
- **Import/export settings** - Backup and restore configuration

### Bug Fixes & Quality
- **Fix /videos/ links** redirecting to 404 pages ([#176](https://github.com/tom-james-watson/old-reddit-redirect/issues/176))
- **Proper handling** for chat.reddit.com and mod.reddit.com ([#187](https://github.com/tom-james-watson/old-reddit-redirect/issues/187), [#190](https://github.com/tom-james-watson/old-reddit-redirect/issues/190))
- **Storage race condition fix** - Prevents data corruption
- **Proper clipboard API** - Copy links reliably in MV3
- **Centralized logging** - Better debugging with contextual errors
- **Comprehensive test suite** - Vitest tests for rules and patterns

[Chrome extension](https://chrome.google.com/webstore/detail/old-reddit-redirect/dneaehbmnbhcippjikoajpoabadpodje)

[Firefox extension](https://addons.mozilla.org/firefox/addon/old-reddit-redirect)

Dislike Reddit's redesign? Old Reddit Redirect will ensure that you always load the old (old.reddit.com) design instead.

Will force all reddit.com usage to old.reddit.com. Will work when navigating to the site, opening links, using old bookmarks. Works regardless of whether you are logged in or not, and in incognito mode.

Also has minor fixes and quality of life improvements like:

- Removing the undismissable cookie banner
- Rewriting links to galleries and videos to the raw old reddit comments page
- Click extension icon to turn the redirect on/off

#### Redirected Domains

- `reddit.com`
- `www.reddit.com`
- `np.reddit.com`
- `amp.reddit.com`
- `i.reddit.com`
- `m.reddit.com` (mobile)
- `nr.reddit.com`
- `ns.reddit.com`
- `*.reddit.com.onion` (Tor hidden service)
- `i.redd.it`
- `preview.redd.it`

#### Whitelisted Domains (Not Redirected)

- `sh.reddit.com` - Safe harbor
- `chat.reddit.com` - Reddit chat (not available on old Reddit)
- `mod.reddit.com` - Mod tools and mod mail

#### Whitelisted Paths (Not Redirected)

These paths don't exist on old Reddit and are allowed through:

- `/media`, `/poll`, `/settings`, `/topics`, `/community-points`
- `/appeals`, `/answers`, `/vault`, `/avatar`, `/talk`
- `/coins`, `/premium`, `/predictions`, `/rpan`
- `/notifications`, `/message/compose`

**Note**: Share links (`/r/*/s/*`) are no longer whitelisted. They redirect through Reddit's own redirect, then to old.reddit.com.

## Development

> [!NOTE]
> This is a Manifest V3 extension, primarily targeting Chrome. Firefox support may vary.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18+)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start live-reloading development server
npm run dev
# or
make run
```

This will open a browser window with the extension installed for testing.

### Scripts

```bash
npm run dev           # Start development server (web-ext)
npm test              # Run test suite with Vitest
npm run test:watch    # Run tests in watch mode
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint errors automatically
npm run format        # Format code with Prettier
npm run format:check  # Check formatting
npm run validate      # Validate JSON and JS syntax
npm run version:sync  # Sync version from package.json to manifest.json
npm run version:check # Check if versions are in sync
npm run build         # Build extension zip (or use: make)
```

### Building

```bash
make        # Creates old-reddit-redirect.zip
make clean  # Remove build artifacts
```

## Contributing

This fork welcomes contributions! If you have bug fixes, features, or improvements:

1. Fork this repository
2. Create a feature branch
3. Make your changes and test with `npm run dev`
4. Run `npm test && npm run lint && npm run format:check` before committing
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

Code copyright Tom Watson. Code released under [the MIT license](LICENSE.txt).

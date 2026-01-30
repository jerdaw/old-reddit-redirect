# Old Reddit Redirect

> [!IMPORTANT]
> **This is an actively maintained fork** of [tom-james-watson/old-reddit-redirect](https://github.com/tom-james-watson/old-reddit-redirect).
>
> The original repository has not been updated since July 2025. This fork includes new features and bug fixes that have been requested but not merged upstream.

## New Features in This Fork

- **Click extension icon** to instantly toggle redirect on/off ([#173](https://github.com/tom-james-watson/old-reddit-redirect/issues/173))
- **Support for nr/ns subdomains** ([#174](https://github.com/tom-james-watson/old-reddit-redirect/issues/174), [#175](https://github.com/tom-james-watson/old-reddit-redirect/issues/175))
- **Fix /videos/ links** redirecting to 404 pages ([#176](https://github.com/tom-james-watson/old-reddit-redirect/issues/176))
- **Proper handling** for chat.reddit.com and mod.reddit.com ([#187](https://github.com/tom-james-watson/old-reddit-redirect/issues/187), [#190](https://github.com/tom-james-watson/old-reddit-redirect/issues/190))
- **Allowlist for /answers/** and other new Reddit features ([#177](https://github.com/tom-james-watson/old-reddit-redirect/issues/177))
- Badge shows "OFF" when disabled
- Toggle state persists without requiring storage permissions
- Consolidated and optimized redirect rules

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
- `nr.reddit.com`
- `ns.reddit.com`
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
- `/r/*/s/*` - Share links

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
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint errors automatically
npm run format        # Format code with Prettier
npm run format:check  # Check formatting
npm run validate      # Validate JSON and JS syntax
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
4. Run `npm run lint && npm run format:check` before committing
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

Code copyright Tom Watson. Code released under [the MIT license](LICENSE.txt).

# Old Reddit Enhanced

> [!NOTE]
> Originally based on [old-reddit-redirect](https://github.com/tom-james-watson/old-reddit-redirect) by Tom Watson. This project has since evolved into a comprehensive enhancement suite for old.reddit.com with many new features beyond simple URL redirection.

## New Features in This Fork

### Core Features

- **Popup UI** - Click icon to access quick settings, stats, and controls
- **Configurable icon click** - Choose between popup or instant toggle
- **Keyboard shortcut (Alt+Shift+R)** - Quickly toggle redirect on/off
- **Context menu** - Right-click Reddit links to open in old or new Reddit
- **First-run onboarding** - Interactive tutorial for new users
- **Statistics tracking** - View total, daily, and per-subreddit redirect counts
- **Visual statistics** - Weekly trend charts, sparklines, and percentage bars
- **Export statistics** - Download your redirect stats as JSON for analysis
- **Alternative frontends** - Choose between old.reddit.com, Teddit, Redlib, or custom instances
- **Per-tab control** - Disable redirect for specific tabs without affecting others
- **Redirect notice** - Optional notification with "Go back" button after redirects
- **Settings sync** - Sync preferences across browsers (optional)

### Dark Mode & Theming

- **Dark mode for old.reddit.com** - Beautiful dark theme that respects your system preferences
  - **Auto mode** - Automatically switches based on system color scheme
  - **Manual modes** - Light, Dark, and OLED Black themes available
  - **Real-time switching** - Toggle between modes without page reload
  - **Comprehensive styling** - Works on all old.reddit.com pages (feed, comments, profiles, etc.)
- **Auto-collapse bot comments** - Automatically collapse AutoModerator and 12 other common bots

### Nag & Banner Blocking

- **Enhanced nag removal** - Block Reddit's annoying prompts with granular controls
  - **Login prompts** - Hide modal overlays asking you to log in
  - **Email verification** - Remove email verification nag banners
  - **Premium banners** - Block Reddit Premium/Gold promotional content
  - **App prompts** - Hide mobile app download prompts
  - **AI-generated content** - Future-proof blocking of AI answers and overviews
  - **Trending posts** - Remove trending subreddits and posts sections
  - **Recommended communities** - Hide subreddit recommendations
  - **Community highlights** - Block featured posts and spotlight content
  - **More posts suggestions** - Remove "More posts you may like" sections
  - **Smart blocking** - MutationObserver catches dynamically inserted nags
  - **Individual toggles** - Enable/disable each category independently

### Content Filtering

- **Subreddit muting** - Hide posts from specific subreddits on /r/all and /r/popular
  - Right-click any subreddit link to mute it via context menu
  - Supports up to 100 muted subreddits
  - Import/export mute lists as JSON
- **Keyword muting** - Filter posts by keywords/phrases in titles
  - Word boundary matching prevents false positives (e.g., "cat" won't match "catch")
  - Case-sensitive and case-insensitive modes
  - Supports multi-word phrases
  - Up to 200 muted keywords
  - Import/export keyword lists
  - **Advanced filtering** (v12.1.0):
    - Regular expression support for powerful pattern matching
    - Filter post content (body text), not just titles
    - Flair-based filtering (hide by post flair)
    - Score-based filtering (hide posts below threshold)
- **Domain muting** - Filter posts linking to specific websites
  - Wildcard subdomain support (\*.example.com matches all subdomains)
  - Automatic domain normalization (removes https://, www., etc.)
  - Up to 100 muted domains
  - Import/export domain lists

### Comment Enhancements

- **Color-coded comments** - Visual depth indicators for nested comment threads
  - Rainbow or color-blind friendly palettes
  - Customizable stripe width
  - Toggle on/off as needed
- **Comment navigation** - Floating buttons to navigate between top-level comments
  - "Next" and "Previous" parent comment buttons
  - "Back to top" button
  - Keyboard shortcuts (Shift+J/K for navigation, Shift+Home for jump to top)
  - Customizable position
- **Jump to top shortcut** - Quick keyboard shortcut to scroll to top
  - Press Shift+Home on any page to smoothly scroll to top
  - Respects reduced motion preferences
  - Screen reader announcements for accessibility
  - Visual feedback with orange flash bar
- **Inline image expansion** - View images directly in comments without opening new tabs
  - Supports imgur, i.redd.it, and other common hosts
  - Click to expand/collapse
  - Works with jpg, png, gif, webp formats

### User Experience Polish

- **Sort order memory** - Remember preferred sort per subreddit
  - Auto-applies sort preference on next visit
  - Supports all sort types (hot, new, top, controversial, etc.)
  - Time parameter memory for top/controversial
  - LRU eviction at 100 entries
- **User tagging** - Add custom labels/tags to Reddit users
  - 12 preset colors or custom color picker
  - Tags display next to usernames everywhere
  - Tag management in options page
  - Up to 500 tags with LRU eviction
- **User muting** - Hide posts and comments from specific users
  - Right-click any username to mute via context menu
  - Hide posts from muted users on all pages
  - Hide comments from muted users in threads
  - Optional reason for each muted user
  - Import/export muted user lists
  - Up to 500 muted users with LRU eviction
- **Scroll position memory** - Remember scroll position when navigating back
  - Auto-saves on page unload
  - Auto-restores when returning via back button
  - 24-hour retention with automatic cleanup
  - LRU eviction at 100 entries
- **Customizable keyboard shortcuts** - Fully remappable keyboard shortcuts for all features
  - 11 default shortcuts (4 existing + 7 new actions)
  - Chord support for Vim/Emacs-style sequences (e.g., `G G` to jump to top)
  - New shortcuts: Dark mode (`D`), Compact mode (`C`), Text-only (`T`), Cycle palette (`P`), Inline images (`I`), Help overlay (`Shift+/`)
  - Conflict detection with visual warnings
  - Complete management UI in options page
  - Import/export shortcut configurations
  - Configurable chord timeout (500-3000ms)
  - <1ms handler latency with Map-based registry

### Privacy & Tracking Protection

- **Tracking parameter removal** - Automatically strip tracking parameters from URLs
  - Removes 32 default tracking parameters (UTM, Facebook, Google, Reddit-specific, etc.)
  - Works on normal clicks, Ctrl+click, and middle-click
  - Optional shield badge (🛡️) when tracking is removed
  - Customizable parameter list (add/remove tracking params)
  - Reset to defaults button
- **Tracking statistics dashboard** - Transparent reporting of cleaned URLs
  - Total URLs cleaned counter
  - Last cleaned timestamp
  - Breakdown by tracker type (UTM, Facebook, Google, Other)
  - Clear statistics button
- **Referrer control** - Manage referrer information sent when leaving Reddit
  - Default: Browser's default behavior
  - Same Origin: Only send referrer within Reddit (recommended)
  - Origin Only: Only send domain (high privacy)
  - No Referrer: Don't send any referrer (maximum privacy)

### Feed Enhancements

- **Compact feed mode** - Reduce vertical spacing to show more posts per screen
  - 20-30% more posts visible per page
- **Text-only mode** - Hide images for focused reading and bandwidth savings
  - Removes all thumbnails and preview images
- **Uncropped image thumbnails** - Show full-aspect-ratio thumbnails instead of cropped squares
  - Better representation of linked content
- **Hide clutter** - Remove join buttons and action links
  - Separate toggles for buttons and action links
- **Custom CSS injection** - Advanced users can inject custom styles
  - Full CSS editor with validation
  - Save/Clear/Validate buttons

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

Dislike Reddit's redesign? Old Reddit Enhanced will ensure that you always load the old (old.reddit.com) design instead.

Will force all reddit.com usage to old.reddit.com. Will work when navigating to the site, opening links, using old bookmarks. Works regardless of whether you are logged in or not, and in incognito mode.

Also has minor fixes and quality of life improvements like:

- **Dark mode** for old.reddit.com with auto-detection
- **Enhanced nag blocking** for login prompts, email verification, premium ads, and app prompts
- **Content filtering** to mute subreddits, keywords, and domains
- **Auto-collapse bot comments** (AutoModerator, RemindMeBot, etc.)
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
make        # Creates old-reddit-enhanced.zip
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

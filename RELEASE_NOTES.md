# Release Notes - Version 6.0.0

**Release Date**: 2026-01-30

Version 6.0.0 is a major feature release that adds comprehensive enhancements to Old Reddit Enhanced. This release includes dark mode support, enhanced nag blocking, and powerful content filtering capabilities.

## 🎨 Dark Mode & Theming

### Dark Mode for old.reddit.com

Experience old Reddit with a beautiful dark theme that's easy on your eyes.

- **Auto mode** - Automatically switches between light and dark based on your system preference
- **Manual modes** - Choose Light, Dark, or OLED Black (pure black #000 for OLED screens)
- **Real-time switching** - Toggle between modes instantly without reloading the page
- **Comprehensive styling** - Works on all pages: feeds, comments, user profiles, search results, and more
- **Syncs across devices** - Your preference syncs when extension sync is enabled

### Auto-collapse Bot Comments

Bot comments (AutoModerator, RemindMeBot, etc.) are automatically collapsed to reduce clutter.

- Supports 13 common bots
- Uses old Reddit's native collapse mechanism
- Can be disabled in options if preferred

## 🚫 Enhanced Nag & Banner Blocking

Block Reddit's annoying prompts and banners with granular controls.

### Granular Category Controls

- **Login prompts** - Hide modal overlays asking you to log in
- **Email verification** - Remove email verification nag banners
- **Premium banners** - Block Reddit Premium/Gold promotional content
- **App prompts** - Hide mobile app download prompts

### Smart Blocking

- 40+ CSS selectors covering various nag types
- MutationObserver watches for dynamically inserted nags
- Individual toggles let you enable/disable each category

## 🎯 Content Filtering

Powerful filtering tools to customize your Reddit experience.

### Subreddit Muting

Hide posts from specific subreddits on /r/all and /r/popular.

- **Context menu integration** - Right-click any subreddit link to mute it
- **Tag-based UI** - Visual chips make it easy to see and manage your mute list
- **Import/Export** - Backup and share your mute lists as JSON
- **Real-time filtering** - Posts disappear immediately without page reload
- Supports up to 100 muted subreddits

### Keyword Muting

Filter posts by keywords or phrases in their titles.

- **Smart matching** - Word boundary matching prevents false positives
  - Muting "cat" won't hide posts about "catch" or "vacation"
- **Case-sensitive option** - Toggle between case-sensitive and case-insensitive matching
- **Multi-word phrases** - Filter phrases like "breaking news" or "spoiler alert"
- **Import/Export** - Backup and share keyword lists
- Supports up to 200 muted keywords

### Domain Muting

Filter posts linking to specific websites.

- **Wildcard subdomains** - `*.example.com` matches all subdomains
- **Automatic normalization** - Removes https://, http://, www. automatically
- **Import/Export** - Backup and share domain lists
- Supports up to 100 muted domains

## 🛠️ Technical Improvements

- **Performance optimized** - 100ms debounced MutationObserver for smooth performance
- **Storage schema extensions** - New typed accessor methods for all settings
- **Cross-browser sync** - All new settings sync across devices
- **Zero ESLint errors** - Clean, maintainable code
- **120 tests passing** - Comprehensive test coverage

## 📦 Installation

- **Chrome/Edge**: [Chrome Web Store](https://chrome.google.com/webstore/detail/old-reddit-redirect/dneaehbmnbhcippjikoajpoabadpodje)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/old-reddit-redirect)

## 🐛 Bug Reports

Found an issue? [Report it on GitHub](https://github.com/jerdaw/old-reddit-enhanced/issues)

## 🙏 Acknowledgments

This release implements features inspired by community feedback and competitive analysis of similar extensions. Special thanks to all users who provided suggestions and bug reports.

---

**Full Changelog**: [v5.0.0...v6.0.0](https://github.com/jerdaw/old-reddit-enhanced/compare/v5.0.0...v6.0.0)

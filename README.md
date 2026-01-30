# Old Reddit Redirect

> [!IMPORTANT]
> **This is an actively maintained fork** of [tom-james-watson/old-reddit-redirect](https://github.com/tom-james-watson/old-reddit-redirect).
>
> The original repository has not been updated since July 2025. This fork includes new features and bug fixes that have been requested but not merged upstream.

## New Features in This Fork

- **Click extension icon** to instantly toggle redirect on/off (addresses [#173](https://github.com/tom-james-watson/old-reddit-redirect/issues/173))
- No popup needed - just click the icon to toggle
- Badge shows "OFF" when disabled
- Toggle state persists without requiring storage permissions

> [!NOTE]
> If you're wondering why the extension recently requested new permissions, please see https://github.com/tom-james-watson/old-reddit-redirect/issues/117

[Chrome extension](https://chrome.google.com/webstore/detail/old-reddit-redirect/dneaehbmnbhcippjikoajpoabadpodje)

[Firefox extension](https://addons.mozilla.org/firefox/addon/old-reddit-redirect)

Dislike Reddit's redesign? Old Reddit Redirect will ensure that you always load the old (old.reddit.com) design instead.

Will force all reddit.com usage to old.reddit.com. Will work when navigating to the site, opening links, using old bookmarks. Works regardless of whether you are logged in or not, and in incognito mode.

Also has a new minor fixes and quality of life improvements like:

- Removing the undismissable cookie banner
- Rewriting links to galleries to the raw old reddit comments page
- Click extension icon to turn the redirect on/off

#### Redirected domains

- `reddit.com`
- `www.reddit.com`
- `np.reddit.com`
- `amp.reddit.com`
- `i.reddit.com`
- `i.redd.it`
- `preview.redd.it`

#### Whitelisted domains

- `sh.reddit.com`

## Development

> [!NOTE]  
> There are currently two separate versions of this extension - manifest V2 and manifest V3.
> Chrome is phasing out manifest V2, so we're forced to migrate to to avoid the extension getting removed. However, the V3 version currently doesn't seem compatible with Firefox, so V2 will be hanging around for a while.
> TL;DR: Chrome = V3, Firefox = V2

Ensure you have [`node`](https://nodejs.org/en) installed. Then run `make run` to start the live-reloading development server. This will open a browser window with the extension installed for testing.

Once you've verified things are working correctly locally you can fork this repo and submit a pull request with your changes.

## Contributing

This fork welcomes contributions! If you have bug fixes, features, or improvements:

1. Fork this repository
2. Create a feature branch
3. Make your changes and test with `make run`
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

Code copyright Tom Watson. Code released under [the MIT license](LICENSE.txt).

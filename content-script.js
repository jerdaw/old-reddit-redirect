"use strict";

/**
 * Content script for old.reddit.com
 * Shows a notification when redirected from new Reddit with option to go back
 */

(function () {
  /**
   * Show redirect notice if enabled
   */
  async function showRedirectNotice() {
    // Check if coming from redirect (referrer is reddit.com but not old.reddit.com)
    const referrer = document.referrer;
    const cameFromRedirect =
      referrer &&
      referrer.includes("reddit.com") &&
      !referrer.includes("old.reddit.com");

    if (!cameFromRedirect) return;

    // Check if notice is enabled in preferences
    const result = await chrome.storage.local.get({
      ui: { showRedirectNotice: false },
    });
    const prefs = result.ui || {};

    if (!prefs.showRedirectNotice) return;

    // Check if already shown this session
    if (sessionStorage.getItem("orr-notice-shown")) return;
    sessionStorage.setItem("orr-notice-shown", "true");

    // Create notice element
    const notice = document.createElement("div");
    notice.id = "orr-redirect-notice";
    notice.innerHTML = `
      <span class="orr-notice-text">Redirected from new Reddit</span>
      <button class="orr-notice-button" id="orr-go-back">Go back</button>
      <button class="orr-notice-close" id="orr-close-notice">×</button>
    `;

    document.body.appendChild(notice);

    // Event handlers
    document.getElementById("orr-go-back").addEventListener("click", () => {
      // Navigate to new Reddit version
      const newUrl = window.location.href.replace(
        "old.reddit.com",
        "www.reddit.com"
      );
      window.location.href = newUrl;
    });

    document
      .getElementById("orr-close-notice")
      .addEventListener("click", () => {
        notice.classList.add("orr-fade-out");
        setTimeout(() => notice.remove(), 300);
      });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notice.parentElement) {
        notice.classList.add("orr-fade-out");
        setTimeout(() => notice.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Apply dark mode based on user preferences
   */
  async function applyDarkMode() {
    const prefs = await chrome.storage.local.get({
      darkMode: { enabled: "auto", autoCollapseAutomod: true },
    });
    const darkMode = prefs.darkMode || {};

    let shouldEnableDark = false;
    let shouldEnableOLED = false;

    switch (darkMode.enabled) {
      case "auto":
        // Detect system preference
        shouldEnableDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        break;
      case "dark":
        shouldEnableDark = true;
        break;
      case "oled":
        shouldEnableDark = true;
        shouldEnableOLED = true;
        break;
      case "light":
        shouldEnableDark = false;
        break;
    }

    // Apply classes to body
    if (shouldEnableDark) {
      if (shouldEnableOLED) {
        document.body.classList.add("orr-oled-mode");
        document.body.classList.remove("orr-dark-mode");
      } else {
        document.body.classList.add("orr-dark-mode");
        document.body.classList.remove("orr-oled-mode");
      }
    } else {
      document.body.classList.remove("orr-dark-mode", "orr-oled-mode");
    }
  }

  /**
   * Listen for system color scheme changes
   */
  function watchColorScheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", async () => {
      const prefs = await chrome.storage.local.get({
        darkMode: { enabled: "auto" },
      });
      if (prefs.darkMode.enabled === "auto") {
        applyDarkMode();
      }
    });
  }

  /**
   * Apply nag blocking based on user preferences
   */
  async function applyNagBlocking() {
    const prefs = await chrome.storage.local.get({
      nagBlocking: {
        enabled: true,
        blockLoginPrompts: true,
        blockEmailVerification: true,
        blockPremiumBanners: true,
        blockAppPrompts: true,
      },
    });
    const nagBlocking = prefs.nagBlocking || {};

    if (!nagBlocking.enabled) {
      document.body.classList.remove("orr-block-nags");
      return;
    }

    // Apply main blocking class
    document.body.classList.add("orr-block-nags");

    // Define nag selectors by category
    const nagSelectors = {
      loginPrompts: [
        ".login-required-popup",
        ".login-form-side",
        ".modal-dialog.login-popup",
        "#login_login-main",
        ".cover-overlay",
        ".login-popup-overlay",
        ".tooltip.login-required",
      ],
      emailVerification: [
        ".infobar.verify-email",
        ".newsletterbar",
        ".email-collection",
        "#newsletter-signup",
        ".user-info .verify-email-cta",
      ],
      premiumBanners: [
        ".gold-accent",
        ".premium-banner",
        ".gold-banner-wrap",
        "#gold-promo",
        ".sidecontentbox .premium-cta",
        'a[href*="/premium"]',
        ".native-banner-ad",
        ".premium-tooltip",
        ".side .spacer .titlebox .premium-banner-inner",
        ".side .infobar.premium",
        ".gold-accent.gold-accent-link",
      ],
      appPrompts: [
        ".app-download-prompt",
        ".mobile-app-banner",
        ".get-app-banner",
        "#app-download-splash",
        ".download-app-button",
        ".mobile-web-redirect",
      ],
    };

    // Remove elements based on preferences
    const selectorsToBlock = [];

    if (nagBlocking.blockLoginPrompts) {
      selectorsToBlock.push(...nagSelectors.loginPrompts);
    }
    if (nagBlocking.blockEmailVerification) {
      selectorsToBlock.push(...nagSelectors.emailVerification);
    }
    if (nagBlocking.blockPremiumBanners) {
      selectorsToBlock.push(...nagSelectors.premiumBanners);
    }
    if (nagBlocking.blockAppPrompts) {
      selectorsToBlock.push(...nagSelectors.appPrompts);
    }

    // Remove all matching elements
    selectorsToBlock.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.classList.add("orr-nag");
        el.style.display = "none";
      });
    });
  }

  /**
   * Watch for dynamically inserted content (nags and posts)
   */
  function watchForDynamicContent() {
    const observer = new MutationObserver((_mutations) => {
      // Debounce rapid mutations
      clearTimeout(watchForDynamicContent.timeout);
      watchForDynamicContent.timeout = setTimeout(() => {
        applyNagBlocking();
        applySubredditMuting();
        applyKeywordFiltering();
        applyDomainFiltering();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  }

  /**
   * Apply subreddit muting on /r/all and /r/popular
   */
  async function applySubredditMuting() {
    // Only apply on /r/all and /r/popular
    const path = window.location.pathname;
    const isAllOrPopular =
      path.includes("/r/all") || path.includes("/r/popular");

    if (!isAllOrPopular) {
      return;
    }

    const overrides = await chrome.storage.local.get({
      subredditOverrides: { mutedSubreddits: [] },
    });
    const mutedSubreddits =
      overrides.subredditOverrides?.mutedSubreddits || [];

    if (mutedSubreddits.length === 0) {
      return;
    }

    // Find all post containers
    const posts = document.querySelectorAll(".thing[data-subreddit]");

    for (const post of posts) {
      const subreddit = post
        .getAttribute("data-subreddit")
        ?.toLowerCase()
        .replace(/^r\//, "");

      if (subreddit && mutedSubreddits.includes(subreddit)) {
        // Mark as muted and hide
        post.classList.add("orr-muted-subreddit");
        post.style.display = "none";
      }
    }
  }

  /**
   * Apply keyword filtering to posts
   */
  async function applyKeywordFiltering() {
    const filtering = await chrome.storage.local.get({
      contentFiltering: { mutedKeywords: [], caseSensitive: false },
    });
    const keywords = filtering.contentFiltering?.mutedKeywords || [];
    const caseSensitive = filtering.contentFiltering?.caseSensitive || false;

    if (keywords.length === 0) {
      return;
    }

    // Find all post containers
    const posts = document.querySelectorAll(".thing[data-url]");

    for (const post of posts) {
      // Get post title
      const titleElement = post.querySelector("a.title");
      if (!titleElement) continue;

      const title = titleElement.textContent;
      const searchText = caseSensitive ? title : title.toLowerCase();

      // Check if title contains any muted keyword
      const matchedKeyword = keywords.find((keyword) => {
        const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
        // Use word boundary matching for better accuracy
        const regex = new RegExp(`\\b${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        return regex.test(searchText);
      });

      if (matchedKeyword) {
        // Mark as muted and hide
        post.classList.add("orr-muted-keyword");
        post.setAttribute("data-muted-keyword", matchedKeyword);
        post.style.display = "none";
      }
    }
  }

  /**
   * Apply domain filtering to posts
   */
  async function applyDomainFiltering() {
    const filtering = await chrome.storage.local.get({
      contentFiltering: { mutedDomains: [] },
    });
    const domains = filtering.contentFiltering?.mutedDomains || [];

    if (domains.length === 0) {
      return;
    }

    // Find all post containers
    const posts = document.querySelectorAll(".thing[data-domain]");

    for (const post of posts) {
      const postDomain = post.getAttribute("data-domain")?.toLowerCase();
      if (!postDomain) continue;

      // Check if domain matches any muted domain
      const matchedDomain = domains.find((mutedDomain) => {
        // Support wildcard subdomains (*.example.com)
        if (mutedDomain.startsWith("*.")) {
          const baseDomain = mutedDomain.substring(2);
          return postDomain === baseDomain || postDomain.endsWith("." + baseDomain);
        }
        return postDomain === mutedDomain;
      });

      if (matchedDomain) {
        // Mark as muted and hide
        post.classList.add("orr-muted-domain");
        post.setAttribute("data-muted-domain", matchedDomain);
        post.style.display = "none";
      }
    }
  }

  /**
   * Auto-collapse bot comments
   */
  async function autoCollapseBotComments() {
    const prefs = await chrome.storage.local.get({
      darkMode: { autoCollapseAutomod: true },
    });
    const darkMode = prefs.darkMode || {};

    if (!darkMode.autoCollapseAutomod) {
      return;
    }

    // List of bot accounts to auto-collapse
    const botAccounts = [
      "AutoModerator",
      "RemindMeBot",
      "sneakpeekbot",
      "RepostSleuthBot",
      "SaveVideo",
      "stabbot",
      "vredditshare",
      "downloadvideo",
      "SaveThisVideo",
      "reddit-user-identifier",
      "TweetLinkerBot",
      "ConverterBot",
      "timezone_bot",
    ];

    // Find all comment containers
    const comments = document.querySelectorAll(".thing.comment");

    for (const comment of comments) {
      // Get the author element
      const authorLink = comment.querySelector("a.author");
      if (!authorLink) continue;

      const author = authorLink.textContent.trim();

      // Check if author is in bot list
      if (botAccounts.includes(author)) {
        // Find the collapse/expand link
        const collapseLink = comment.querySelector("a.expand");
        if (collapseLink && !comment.classList.contains("collapsed")) {
          // Click to collapse
          collapseLink.click();
        }
      }
    }
  }

  /**
   * Listen for messages from popup/background
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REFRESH_DARK_MODE") {
      applyDarkMode();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_NAG_BLOCKING") {
      applyNagBlocking();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_SUBREDDIT_MUTING") {
      applySubredditMuting();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_KEYWORD_FILTERING") {
      applyKeywordFiltering();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_DOMAIN_FILTERING") {
      applyDomainFiltering();
      sendResponse({ success: true });
    }
  });

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      showRedirectNotice();
      applyDarkMode();
      applyNagBlocking();
      applySubredditMuting();
      applyKeywordFiltering();
      applyDomainFiltering();
      watchColorScheme();
      watchForDynamicContent();
      autoCollapseBotComments();
    });
  } else {
    showRedirectNotice();
    applyDarkMode();
    applyNagBlocking();
    applySubredditMuting();
    applyKeywordFiltering();
    applyDomainFiltering();
    watchColorScheme();
    watchForDynamicContent();
    autoCollapseBotComments();
  }
})();

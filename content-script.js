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
        applyColorCodedComments();
        applyInlineImages();
        applyUserTags();
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
    const mutedSubreddits = overrides.subredditOverrides?.mutedSubreddits || [];

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
        const regex = new RegExp(
          `\\b${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i"
        );
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
          return (
            postDomain === baseDomain || postDomain.endsWith("." + baseDomain)
          );
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
   * Calculate comment depth from nested .child divs
   * @param {Element} comment - The comment element
   * @returns {number} - Depth level (1-based)
   */
  function calculateCommentDepth(comment) {
    let depth = 0;
    let element = comment.parentElement;

    while (element && element !== document.body) {
      if (element.classList.contains("child")) {
        depth++;
      }
      element = element.parentElement;
    }

    return depth;
  }

  /**
   * Apply color-coded comments based on depth
   */
  async function applyColorCodedComments() {
    const prefs = await chrome.storage.local.get({
      commentEnhancements: {
        colorCodedComments: true,
        colorPalette: "standard",
        stripeWidth: 3,
      },
    });
    const enhancements = prefs.commentEnhancements || {};

    // Remove existing depth classes and body class
    document.body.classList.remove(
      "orr-color-comments",
      "orr-palette-standard",
      "orr-palette-colorblind"
    );
    document
      .querySelectorAll(".thing.comment[data-depth]")
      .forEach((comment) => {
        comment.removeAttribute("data-depth");
      });

    if (!enhancements.colorCodedComments) {
      return;
    }

    // Apply body class for feature and palette
    document.body.classList.add("orr-color-comments");
    document.body.classList.add(`orr-palette-${enhancements.colorPalette}`);

    // Set stripe width CSS variable
    document.body.style.setProperty(
      "--orr-stripe-width",
      `${enhancements.stripeWidth}px`
    );

    // Find all comments and calculate depth
    const comments = document.querySelectorAll(".thing.comment");

    // Use requestIdleCallback for performance
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        comments.forEach((comment) => {
          const depth = calculateCommentDepth(comment);
          if (depth > 0) {
            comment.setAttribute("data-depth", depth);
          }
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      comments.forEach((comment) => {
        const depth = calculateCommentDepth(comment);
        if (depth > 0) {
          comment.setAttribute("data-depth", depth);
        }
      });
    }
  }

  /**
   * Get all parent (top-level) comments on the page
   * @returns {Array<Element>} Array of parent comment elements
   */
  function getParentComments() {
    // Parent comments are .thing.comment elements whose parent .sitetable
    // is the main comment area (not nested)
    const commentArea = document.querySelector(".commentarea > .sitetable");
    if (!commentArea) return [];

    return Array.from(commentArea.querySelectorAll(":scope > .thing.comment"));
  }

  /**
   * Scroll to a comment with smooth animation
   * @param {Element} comment - The comment element to scroll to
   */
  function scrollToComment(comment) {
    const headerOffset = 60; // Account for Reddit header
    const elementPosition = comment.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    // Briefly highlight the comment
    comment.style.transition = "background-color 0.3s";
    const originalBg = comment.style.backgroundColor;
    comment.style.backgroundColor = "rgba(255, 69, 0, 0.15)";

    setTimeout(() => {
      comment.style.backgroundColor = originalBg;
      setTimeout(() => {
        comment.style.transition = "";
      }, 300);
    }, 600);
  }

  /**
   * Navigate to the next parent comment
   */
  function navigateToNext() {
    const parents = getParentComments();
    if (parents.length === 0) return;

    const currentScroll = window.scrollY + 100; // Small offset for current position

    // Find the first comment below current scroll position
    for (const comment of parents) {
      if (comment.offsetTop > currentScroll) {
        scrollToComment(comment);
        return;
      }
    }

    // If we're at the end, loop to the first comment
    scrollToComment(parents[0]);
  }

  /**
   * Navigate to the previous parent comment
   */
  function navigateToPrevious() {
    const parents = getParentComments();
    if (parents.length === 0) return;

    const currentScroll = window.scrollY - 100; // Small offset for current position

    // Find the last comment above current scroll position
    for (let i = parents.length - 1; i >= 0; i--) {
      const comment = parents[i];
      if (comment.offsetTop < currentScroll) {
        scrollToComment(comment);
        return;
      }
    }

    // If we're at the top, loop to the last comment
    scrollToComment(parents[parents.length - 1]);
  }

  /**
   * Navigate to the top of the page
   */
  function navigateToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * Create navigation button container with buttons
   * @param {string} position - Button position ("bottom-right" or "bottom-left")
   * @returns {Element} The navigation container element
   */
  function createNavigationButtons(position) {
    const container = document.createElement("div");
    container.id = "orr-comment-nav";
    container.className = `orr-comment-nav orr-nav-${position}`;

    // SVG icons
    const upArrowSVG = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3.5l-6 6 1.5 1.5L8 6.5l4.5 4.5L14 9.5z"/>
      </svg>
    `;

    const downArrowSVG = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12.5l6-6-1.5-1.5L8 9.5 3.5 5 2 6.5z"/>
      </svg>
    `;

    const topArrowSVG = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2l-6 6 1.5 1.5L8 5l4.5 4.5L14 8l-6-6zm0 6l-6 6 1.5 1.5L8 11l4.5 4.5L14 14l-6-6z"/>
      </svg>
    `;

    container.innerHTML = `
      <button id="orr-nav-prev" class="orr-nav-button" title="Previous parent comment (Shift+K)">
        ${upArrowSVG}
      </button>
      <button id="orr-nav-next" class="orr-nav-button" title="Next parent comment (Shift+J)">
        ${downArrowSVG}
      </button>
      <button id="orr-nav-top" class="orr-nav-button" title="Back to top">
        ${topArrowSVG}
      </button>
    `;

    // Attach event handlers
    container.querySelector("#orr-nav-prev").addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPrevious();
    });

    container.querySelector("#orr-nav-next").addEventListener("click", (e) => {
      e.preventDefault();
      navigateToNext();
    });

    container.querySelector("#orr-nav-top").addEventListener("click", (e) => {
      e.preventDefault();
      navigateToTop();
    });

    return container;
  }

  /**
   * Apply comment navigation buttons based on preferences
   */
  async function applyCommentNavigation() {
    const prefs = await chrome.storage.local.get({
      commentEnhancements: {
        navigationButtons: true,
        navButtonPosition: "bottom-right",
      },
    });
    const enhancements = prefs.commentEnhancements || {};

    // Remove existing navigation if present
    const existing = document.getElementById("orr-comment-nav");
    if (existing) {
      existing.remove();
    }

    // Check if we're on a comments page
    const isCommentsPage = document.body.classList.contains("comments-page");
    if (!isCommentsPage || !enhancements.navigationButtons) {
      return;
    }

    // Create and inject navigation buttons
    const navContainer = createNavigationButtons(
      enhancements.navButtonPosition || "bottom-right"
    );
    document.body.appendChild(navContainer);
  }

  /**
   * Handle keyboard shortcuts for navigation
   * @param {KeyboardEvent} e - The keyboard event
   */
  function handleNavigationKeyboard(e) {
    // Only on comments pages
    if (!document.body.classList.contains("comments-page")) return;

    // Check if user is typing in an input/textarea
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable)
    ) {
      return;
    }

    // Shift+J - Next comment
    if (e.shiftKey && e.key === "J") {
      e.preventDefault();
      navigateToNext();
    }
    // Shift+K - Previous comment
    else if (e.shiftKey && e.key === "K") {
      e.preventDefault();
      navigateToPrevious();
    }
  }

  /**
   * Check if a URL is an image URL
   * @param {string} url - The URL to check
   * @returns {boolean} True if the URL points to an image
   */
  function isImageUrl(url) {
    if (!url) return false;

    const imagePattern =
      /^https?:\/\/(i\.redd\.it|preview\.redd\.it|i\.imgur\.com|imgur\.com)\/[\w\-\.]+(\.(jpg|jpeg|png|gif|webp|svg))?$/i;
    return imagePattern.test(url);
  }

  /**
   * Convert imgur.com page URL to direct image URL
   * @param {string} url - The imgur page URL
   * @returns {string} Direct image URL
   */
  function convertImgurUrl(url) {
    // Convert imgur.com/xxx to i.imgur.com/xxx.jpg
    if (url.match(/^https?:\/\/imgur\.com\/[a-zA-Z0-9]+$/)) {
      const id = url.split("/").pop();
      return `https://i.imgur.com/${id}.jpg`;
    }
    return url;
  }

  /**
   * Create expand button for an image link
   * @param {string} imageUrl - The image URL
   * @returns {Element} The expand button element
   */
  function createExpandButton(imageUrl) {
    const button = document.createElement("button");
    button.className = "orr-expand-image";
    button.textContent = "[+]";
    button.title = "Expand image inline";
    button.setAttribute("data-image", imageUrl);

    let isExpanded = false;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isExpanded) {
        // Expand image
        const container = document.createElement("div");
        container.className = "orr-inline-image orr-loading";
        container.setAttribute("data-image", imageUrl);

        const img = document.createElement("img");
        img.loading = "lazy";
        img.alt = "Expanded image";

        // Convert imgur page URLs to direct image URLs
        const directUrl = convertImgurUrl(imageUrl);
        img.src = directUrl;

        img.addEventListener("load", () => {
          container.classList.remove("orr-loading");
        });

        img.addEventListener("error", () => {
          container.classList.remove("orr-loading");
          container.innerHTML =
            '<span style="color: #888;">Failed to load image</span>';
        });

        container.appendChild(img);

        // Insert after the button
        button.parentElement.insertBefore(container, button.nextElementSibling);

        button.textContent = "[-]";
        button.title = "Collapse image";
        isExpanded = true;
      } else {
        // Collapse image
        const container = button.parentElement.querySelector(
          `.orr-inline-image[data-image="${imageUrl}"]`
        );
        if (container) {
          container.remove();
        }

        button.textContent = "[+]";
        button.title = "Expand image inline";
        isExpanded = false;
      }
    });

    return button;
  }

  /**
   * Apply inline image expansion to comment links
   */
  async function applyInlineImages() {
    const prefs = await chrome.storage.local.get({
      commentEnhancements: {
        inlineImages: true,
        maxImageWidth: 600,
      },
    });
    const enhancements = prefs.commentEnhancements || {};

    // Remove existing expand buttons
    document
      .querySelectorAll(".orr-expand-image")
      .forEach((btn) => btn.remove());
    document
      .querySelectorAll(".orr-inline-image")
      .forEach((img) => img.remove());

    if (!enhancements.inlineImages) {
      return;
    }

    // Set max image width CSS variable
    document.body.style.setProperty(
      "--orr-max-image-width",
      enhancements.maxImageWidth === 0
        ? "100%"
        : `${enhancements.maxImageWidth}px`
    );

    // Find all links in comments
    const commentLinks = document.querySelectorAll(
      ".usertext-body .md a[href]"
    );

    commentLinks.forEach((link) => {
      const href = link.getAttribute("href");

      if (isImageUrl(href)) {
        // Check if button already exists
        const nextElement = link.nextElementSibling;
        if (nextElement && nextElement.classList.contains("orr-expand-image")) {
          return;
        }

        // Create and insert expand button
        const button = createExpandButton(href);
        link.parentElement.insertBefore(button, link.nextSibling);
      }
    });
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
    } else if (message.type === "REFRESH_COLOR_CODED_COMMENTS") {
      applyColorCodedComments();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_COMMENT_NAVIGATION") {
      applyCommentNavigation();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_INLINE_IMAGES") {
      applyInlineImages();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_USER_TAGS") {
      // Re-apply all user tags
      applyUserTags();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_USER_TAG") {
      // Refresh specific username
      if (message.username) {
        refreshUsernameTags(message.username);
      }
      sendResponse({ success: true });
    }
  });

  /**
   * ============================================================================
   * SORT PREFERENCES
   * Remember and auto-apply preferred sort order per subreddit
   * ============================================================================
   */

  /**
   * Check if current page is a subreddit listing page
   * @returns {boolean}
   */
  function isSubredditPage() {
    const path = window.location.pathname;
    // Match /r/subreddit or /r/subreddit/ but not /r/subreddit/comments/...
    return /^\/r\/[^\/]+\/?$/.test(path);
  }

  /**
   * Extract subreddit name from URL
   * @returns {string|null}
   */
  function getSubredditFromUrl() {
    const match = window.location.pathname.match(/^\/r\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get current sort order from URL
   * @returns {Object} { sort, time }
   */
  function getCurrentSort() {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get("sort") || "hot";
    const time = params.get("t") || null;
    return { sort, time };
  }

  /**
   * Build subreddit URL with sort parameters
   * @param {string} subreddit - Subreddit name
   * @param {Object} sortData - { sort, time }
   * @returns {string}
   */
  function buildSortUrl(subreddit, sortData) {
    let url = `https://old.reddit.com/r/${subreddit}/`;
    const params = new URLSearchParams();

    if (sortData.sort && sortData.sort !== "hot") {
      params.set("sort", sortData.sort);
    }

    if (sortData.time) {
      params.set("t", sortData.time);
    }

    const queryString = params.toString();
    if (queryString) {
      url += "?" + queryString;
    }

    return url;
  }

  /**
   * Check if two sort objects match
   * @param {Object} current - Current sort
   * @param {Object} preference - Preferred sort
   * @returns {boolean}
   */
  function sortMatches(current, preference) {
    return current.sort === preference.sort && current.time === preference.time;
  }

  /**
   * Apply saved sort preference for current subreddit
   */
  async function applySortPreference() {
    try {
      // Check if feature is enabled
      const enabled = await storage.isSortPreferencesEnabled();
      if (!enabled) return;

      // Only run on subreddit pages
      if (!isSubredditPage()) return;

      // Prevent redirect loops
      if (sessionStorage.getItem("orr-sort-redirected")) {
        return;
      }

      const subreddit = getSubredditFromUrl();
      if (!subreddit) return;

      const currentSort = getCurrentSort();
      const preference = await storage.getSortPreference(subreddit);

      if (!preference) return; // No preference saved
      if (sortMatches(currentSort, preference)) return; // Already correct

      // Build new URL with preferred sort
      const newUrl = buildSortUrl(subreddit, preference);

      // Mark redirect to prevent loop
      sessionStorage.setItem("orr-sort-redirected", "true");

      logger.info(
        `Applying sort preference for /r/${subreddit}: ${preference.sort}${preference.time ? ` (${preference.time})` : ""}`
      );

      // Redirect
      window.location.href = newUrl;
    } catch (error) {
      logger.error("Error applying sort preference:", error);
    }
  }

  // Track URL and sort changes
  let lastUrl = window.location.href;
  let lastSort = null;

  /**
   * Detect when user manually changes sort order
   */
  async function detectSortChange() {
    try {
      const currentUrl = window.location.href;

      // URL hasn't changed
      if (currentUrl === lastUrl) return;

      // Check if we're on a subreddit page
      if (!isSubredditPage()) {
        lastUrl = currentUrl;
        return;
      }

      const subreddit = getSubredditFromUrl();
      if (!subreddit) return;

      const currentSort = getCurrentSort();

      // If this is first detection or sort changed
      if (lastSort && !sortMatches(currentSort, lastSort)) {
        // User manually changed sort, save preference
        await storage.setSortPreference(subreddit, currentSort);

        // Clear redirect flag (user is manually navigating)
        sessionStorage.removeItem("orr-sort-redirected");

        logger.info(
          `Saved sort preference for /r/${subreddit}: ${currentSort.sort}${currentSort.time ? ` (${currentSort.time})` : ""}`
        );
      }

      lastUrl = currentUrl;
      lastSort = currentSort;
    } catch (error) {
      logger.error("Error detecting sort change:", error);
    }
  }

  // Start detecting sort changes (check every second)
  setInterval(detectSortChange, 1000);

  /**
   * ============================================================================
   * SCROLL POSITION MEMORY
   * Remember and restore scroll positions when navigating
   * ============================================================================
   */

  /**
   * Normalize URL for storage key
   */
  function normalizeScrollUrl(url) {
    try {
      const urlObj = new URL(url);

      // Keep path and important query params (like sort)
      let key = urlObj.origin + urlObj.pathname;

      // Include sort parameter if present
      if (urlObj.searchParams.has("sort")) {
        key += "?sort=" + urlObj.searchParams.get("sort");
        // Include time parameter if present (for top/controversial)
        if (urlObj.searchParams.has("t")) {
          key += "&t=" + urlObj.searchParams.get("t");
        }
      }

      return key;
    } catch (_e) {
      return url;
    }
  }

  /**
   * Save scroll position before leaving
   */
  async function saveScrollPosition() {
    try {
      const enabled = await storage.isScrollPositionsEnabled();
      if (!enabled) return;

      const url = normalizeScrollUrl(window.location.href);
      const scrollY = window.scrollY;

      // Only save if scrolled beyond header (60px)
      if (scrollY < 60) return;

      await storage.setScrollPosition(url, {
        scrollY,
        timestamp: Date.now(),
      });

      logger.debug(`Saved scroll position for ${url}: ${scrollY}`);
    } catch (error) {
      logger.error("Error saving scroll position:", error);
    }
  }

  /**
   * Restore scroll position on page load
   */
  async function restoreScrollPosition() {
    try {
      const enabled = await storage.isScrollPositionsEnabled();
      if (!enabled) return;

      const url = normalizeScrollUrl(window.location.href);
      const position = await storage.getScrollPosition(url);

      if (!position) return;

      // Small delay to allow content to load
      requestIdleCallback(
        () => {
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          const clampedY = Math.max(0, Math.min(position.scrollY, maxScroll));

          window.scrollTo({
            top: clampedY,
            behavior: "instant",
          });

          logger.debug(`Restored scroll position for ${url}: ${clampedY}`);
        },
        { timeout: 100 }
      );
    } catch (error) {
      logger.error("Error restoring scroll position:", error);
    }
  }

  /**
   * Cleanup old scroll positions (24-hour retention)
   */
  async function cleanupScrollPositions() {
    try {
      const enabled = await storage.isScrollPositionsEnabled();
      if (!enabled) return;

      const cleaned = await storage.cleanupOldScrollPositions();
      if (cleaned > 0) {
        logger.debug(`Cleaned up ${cleaned} old scroll positions`);
      }
    } catch (error) {
      logger.error("Error cleaning up scroll positions:", error);
    }
  }

  // Attach event listeners
  window.addEventListener("beforeunload", saveScrollPosition);

  // Restore on both load and DOMContentLoaded for reliability
  window.addEventListener("load", () => {
    restoreScrollPosition();
    cleanupScrollPositions();
  });

  document.addEventListener("DOMContentLoaded", restoreScrollPosition);

  /**
   * ============================================================================
   * USER TAGGING
   * Add custom labels/tags to Reddit users
   * ============================================================================
   */

  // Preset colors for tags
  const TAG_COLORS = [
    "#e74c3c", // Red
    "#e67e22", // Orange
    "#f39c12", // Yellow
    "#2ecc71", // Green
    "#1abc9c", // Teal
    "#3498db", // Blue
    "#9b59b6", // Purple
    "#e91e63", // Pink
    "#607d8b", // Gray
    "#795548", // Brown
    "#ff5722", // Deep Orange
    "#00bcd4", // Cyan
  ];

  let currentTagDialog = null;

  /**
   * Find and process all usernames on the page
   */
  async function applyUserTags() {
    try {
      const enabled = await storage.isUserTagsEnabled();
      if (!enabled) return;

      // Find all .author elements that haven't been processed
      const authors = document.querySelectorAll(".author:not(.orr-tagged)");

      for (const author of authors) {
        const username = author.textContent.trim();
        if (!username) continue;

        // Mark as processed
        author.classList.add("orr-tagged");

        // Check if user has a tag
        const tag = await storage.getUserTag(username);

        if (tag) {
          showTagBadge(author, username, tag);
        } else {
          showTagButton(author, username);
        }
      }
    } catch (error) {
      logger.error("Error applying user tags:", error);
    }
  }

  /**
   * Show tag button next to username
   */
  function showTagButton(authorElement, username) {
    // Check if button already exists
    const next = authorElement.nextElementSibling;
    if (next && next.classList.contains("orr-tag-btn")) return;

    const button = document.createElement("button");
    button.className = "orr-tag-btn";
    button.textContent = "🏷️";
    button.title = "Tag user";
    button.dataset.username = username;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTagDialog(username);
    });

    authorElement.parentNode.insertBefore(button, authorElement.nextSibling);
  }

  /**
   * Show tag badge next to username
   */
  function showTagBadge(authorElement, username, tag) {
    // Check if badge already exists
    const next = authorElement.nextElementSibling;
    if (next && next.classList.contains("orr-user-tag")) return;

    const badge = document.createElement("span");
    badge.className = "orr-user-tag";
    badge.textContent = escapeHtml(tag.text);
    badge.style.backgroundColor = tag.color;
    badge.dataset.username = username;
    badge.title = "Click to edit tag";

    badge.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTagDialog(username, tag);
    });

    authorElement.parentNode.insertBefore(badge, authorElement.nextSibling);
  }

  /**
   * Show tag dialog
   */
  function showTagDialog(username, existingTag = null) {
    // Close any existing dialog
    if (currentTagDialog) {
      currentTagDialog.remove();
      currentTagDialog = null;
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "orr-tag-dialog-overlay";

    // Create dialog
    const dialog = document.createElement("div");
    dialog.className = "orr-tag-dialog";

    dialog.innerHTML = `
      <div class="orr-tag-dialog-header">
        <h3>Tag User: u/${escapeHtml(username)}</h3>
        <button class="orr-tag-dialog-close">×</button>
      </div>
      <div class="orr-tag-dialog-body">
        <label>
          Tag Text (max 50 characters)
          <input type="text" id="orr-tag-text" maxlength="50" placeholder="e.g., Friend, Expert, etc." value="${existingTag ? escapeHtml(existingTag.text) : ""}">
        </label>
        <label>
          Color
          <div class="orr-color-picker">
            ${TAG_COLORS.map(
              (color) => `
              <button class="orr-color-option ${existingTag && existingTag.color === color ? "selected" : ""}"
                      data-color="${color}"
                      style="background: ${color};"
                      title="${color}"></button>
            `
            ).join("")}
          </div>
        </label>
      </div>
      <div class="orr-tag-dialog-footer">
        <button class="orr-tag-save">Save Tag</button>
        ${existingTag ? '<button class="orr-tag-delete">Remove Tag</button>' : ""}
        <button class="orr-tag-cancel">Cancel</button>
      </div>
    `;

    // Append to body
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    currentTagDialog = dialog;

    // Focus input
    const input = dialog.querySelector("#orr-tag-text");
    input.focus();

    // Selected color (default to first color if no existing tag)
    let selectedColor = existingTag ? existingTag.color : TAG_COLORS[0];

    // Color picker event handlers
    dialog.querySelectorAll(".orr-color-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove selected class from all
        dialog
          .querySelectorAll(".orr-color-option")
          .forEach((b) => b.classList.remove("selected"));

        // Add selected class to clicked button
        btn.classList.add("selected");
        selectedColor = btn.dataset.color;
      });
    });

    // Save button
    dialog
      .querySelector(".orr-tag-save")
      .addEventListener("click", async () => {
        const text = input.value.trim();
        if (!text) {
          alert("Please enter tag text");
          return;
        }

        await storage.setUserTag(username, { text, color: selectedColor });
        closeTagDialog();
        refreshUsernameTags(username);
      });

    // Delete button
    const deleteBtn = dialog.querySelector(".orr-tag-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Remove tag for u/${username}?`)) return;

        await storage.deleteUserTag(username);
        closeTagDialog();
        refreshUsernameTags(username);
      });
    }

    // Cancel button
    dialog.querySelector(".orr-tag-cancel").addEventListener("click", () => {
      closeTagDialog();
    });

    // Close button
    dialog
      .querySelector(".orr-tag-dialog-close")
      .addEventListener("click", () => {
        closeTagDialog();
      });

    // Click overlay to close
    overlay.addEventListener("click", () => {
      closeTagDialog();
    });

    // Escape key to close
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        closeTagDialog();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  }

  /**
   * Close tag dialog
   */
  function closeTagDialog() {
    if (currentTagDialog) {
      // Remove overlay and dialog
      const overlay = document.querySelector(".orr-tag-dialog-overlay");
      if (overlay) overlay.remove();
      currentTagDialog.remove();
      currentTagDialog = null;
    }
  }

  /**
   * Refresh all instances of a username with current tag
   */
  async function refreshUsernameTags(username) {
    try {
      const tag = await storage.getUserTag(username);

      // Find all instances of this username
      const authors = document.querySelectorAll(".author.orr-tagged");

      for (const author of authors) {
        if (author.textContent.trim() === username) {
          // Remove existing tag button or badge
          let next = author.nextElementSibling;
          while (
            next &&
            (next.classList.contains("orr-tag-btn") ||
              next.classList.contains("orr-user-tag"))
          ) {
            const toRemove = next;
            next = next.nextElementSibling;
            toRemove.remove();
          }

          // Re-apply tag or button
          if (tag) {
            showTagBadge(author, username, tag);
          } else {
            showTagButton(author, username);
          }
        }
      }
    } catch (error) {
      logger.error("Error refreshing username tags:", error);
    }
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      await applySortPreference(); // Check/apply sort preference first
      lastSort = getCurrentSort(); // Initialize lastSort
      showRedirectNotice();
      applyDarkMode();
      applyNagBlocking();
      applySubredditMuting();
      applyKeywordFiltering();
      applyDomainFiltering();
      applyColorCodedComments();
      applyCommentNavigation();
      applyInlineImages();
      applyUserTags();
      watchColorScheme();
      watchForDynamicContent();
      autoCollapseBotComments();

      // Add keyboard navigation listener
      document.addEventListener("keydown", handleNavigationKeyboard);
    });
  } else {
    (async () => {
      await applySortPreference(); // Check/apply sort preference first
      lastSort = getCurrentSort(); // Initialize lastSort
      showRedirectNotice();
      applyDarkMode();
      applyNagBlocking();
      applySubredditMuting();
      applyKeywordFiltering();
      applyDomainFiltering();
      applyColorCodedComments();
      applyCommentNavigation();
      applyInlineImages();
      applyUserTags();
      watchColorScheme();
      watchForDynamicContent();
      autoCollapseBotComments();

      // Add keyboard navigation listener
      document.addEventListener("keydown", handleNavigationKeyboard);
    })();
  }
})();

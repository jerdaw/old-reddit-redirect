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
    let shouldEnableHighContrast = false;

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
      case "high-contrast":
        shouldEnableDark = true;
        shouldEnableHighContrast = true;
        break;
      case "light":
        shouldEnableDark = false;
        break;
    }

    // Apply classes to body
    document.body.classList.remove(
      "orr-dark-mode",
      "orr-oled-mode",
      "orr-high-contrast-mode"
    );

    if (shouldEnableDark) {
      if (shouldEnableHighContrast) {
        document.body.classList.add("orr-high-contrast-mode");
      } else if (shouldEnableOLED) {
        document.body.classList.add("orr-oled-mode");
      } else {
        document.body.classList.add("orr-dark-mode");
      }
    }
  }

  /**
   * Apply accessibility settings (font size, reduce motion)
   */
  async function applyAccessibility() {
    const prefs = await chrome.storage.local.get({
      accessibility: {
        fontSize: "medium",
        reduceMotion: "auto",
        highContrast: false,
      },
    });
    const accessibility = prefs.accessibility || {};

    // Remove existing font size classes
    document.body.classList.remove(
      "orr-font-small",
      "orr-font-medium",
      "orr-font-large",
      "orr-font-x-large"
    );

    // Apply font size class
    const fontSizeClass = `orr-font-${accessibility.fontSize || "medium"}`;
    document.body.classList.add(fontSizeClass);

    // Handle reduce motion preference
    let shouldReduceMotion = false;
    switch (accessibility.reduceMotion) {
      case "auto":
        shouldReduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        break;
      case "always":
        shouldReduceMotion = true;
        break;
      case "never":
        shouldReduceMotion = false;
        break;
    }

    if (shouldReduceMotion) {
      document.body.classList.add("orr-reduce-motion");
    } else {
      document.body.classList.remove("orr-reduce-motion");
    }

    // Handle high contrast UI elements toggle
    if (accessibility.highContrast) {
      document.body.classList.add("orr-high-contrast-ui");
    } else {
      document.body.classList.remove("orr-high-contrast-ui");
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
      // v11.2.0: Advanced content blocking
      aiContent: [
        '[data-ai-generated="true"]',
        "[data-testid*='ai']",
        ".ai-overview",
        ".ai-answer",
        ".ai-summary",
        ".generated-content",
        '[aria-label*="AI-generated"]',
        '[aria-label*="AI answer"]',
        ".search-ai-answer",
        ".ai-comment",
      ],
      trending: [
        ".trending-subreddits",
        "#trending-posts",
        ".trending-communities",
        '[data-type="trending"]',
        ".sidecontentbox .trending",
      ],
      recommended: [
        ".recommended-communities",
        ".recommended-subreddits",
        ".subreddit-recommendations",
        "[data-recommendation-type]",
        ".side .rec-community",
      ],
      communityHighlights: [
        ".community-highlights",
        ".featured-content",
        ".community-spotlight",
        ".highlighted-post",
      ],
      morePosts: [
        ".more-posts-you-may-like",
        ".recommended-posts",
        '[data-context="recommended"]',
        ".continue-this-thread",
        ".recommended-feed",
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
    // v11.2.0: Advanced content blocking
    if (nagBlocking.blockAIContent) {
      selectorsToBlock.push(...nagSelectors.aiContent);
    }
    if (nagBlocking.blockTrending) {
      selectorsToBlock.push(...nagSelectors.trending);
    }
    if (nagBlocking.blockRecommended) {
      selectorsToBlock.push(...nagSelectors.recommended);
    }
    if (nagBlocking.blockCommunityHighlights) {
      selectorsToBlock.push(...nagSelectors.communityHighlights);
    }
    if (nagBlocking.blockMorePosts) {
      selectorsToBlock.push(...nagSelectors.morePosts);
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
   * ============================================================================
   * PERFORMANCE OPTIMIZATION (Phase 6)
   * Optimized mutation observer with batched updates
   * ============================================================================
   */

  // Performance: Cache for storage values to reduce async calls
  const storageCache = {
    lastUpdate: 0,
    ttl: 5000, // 5 second cache TTL
    data: {},
  };

  // Performance: Batch update tracking
  const pendingUpdates = {
    visual: false,
    content: false,
    rafId: null,
    idleId: null,
  };

  /**
   * Schedule visual updates using requestAnimationFrame
   */
  function scheduleVisualUpdate() {
    if (pendingUpdates.visual) return;
    pendingUpdates.visual = true;

    if (pendingUpdates.rafId) {
      cancelAnimationFrame(pendingUpdates.rafId);
    }

    pendingUpdates.rafId = requestAnimationFrame(() => {
      pendingUpdates.visual = false;
      pendingUpdates.rafId = null;

      // Visual updates that affect layout
      applyColorCodedComments();
      applyInlineImages();
      applyUserTags();
      addParentNavButtons();
    });
  }

  /**
   * Schedule content updates using requestIdleCallback
   */
  function scheduleContentUpdate() {
    if (pendingUpdates.content) return;
    pendingUpdates.content = true;

    if (pendingUpdates.idleId) {
      if (typeof cancelIdleCallback === "function") {
        cancelIdleCallback(pendingUpdates.idleId);
      }
    }

    const runContentUpdates = () => {
      pendingUpdates.content = false;
      pendingUpdates.idleId = null;

      // Content filtering updates (less visual priority)
      applyNagBlocking();
      applySubredditMuting();
      applyKeywordFiltering();
      applyDomainFiltering();
      applyUserMuting();
      applyNsfwControls();
    };

    if (typeof requestIdleCallback === "function") {
      pendingUpdates.idleId = requestIdleCallback(runContentUpdates, {
        timeout: 200,
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(runContentUpdates, 50);
    }
  }

  /**
   * Watch for dynamically inserted content (nags and posts)
   * Optimized with batched updates and priority scheduling
   */
  function watchForDynamicContent() {
    let mutationCount = 0;
    let lastMutationTime = 0;

    const observer = new MutationObserver((mutations) => {
      const now = performance.now();

      // Track mutation rate for adaptive throttling
      mutationCount++;
      const timeSinceLastMutation = now - lastMutationTime;
      lastMutationTime = now;

      // Adaptive debounce: longer delay if mutations are rapid
      const isRapidMutations = timeSinceLastMutation < 50 && mutationCount > 5;

      // Check if mutations contain relevant nodes
      const hasRelevantMutations = mutations.some((mutation) => {
        if (mutation.type !== "childList") return false;
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for post, comment, or user-related content
            if (
              node.classList?.contains("thing") ||
              node.classList?.contains("comment") ||
              node.querySelector?.(".thing, .comment, .author")
            ) {
              return true;
            }
          }
        }
        return false;
      });

      if (!hasRelevantMutations) return;

      // Reset count periodically
      if (timeSinceLastMutation > 500) {
        mutationCount = 0;
      }

      // Schedule updates based on priority
      if (isRapidMutations) {
        // During rapid mutations, use longer debounce
        clearTimeout(watchForDynamicContent.timeout);
        watchForDynamicContent.timeout = setTimeout(() => {
          scheduleVisualUpdate();
          scheduleContentUpdate();
        }, 150);
      } else {
        // Normal case: schedule immediately
        scheduleVisualUpdate();
        scheduleContentUpdate();
      }
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
   * Apply keyword filtering to posts (with advanced options)
   */
  async function applyKeywordFiltering() {
    const filtering = await chrome.storage.local.get({
      contentFiltering: {
        mutedKeywords: [],
        caseSensitive: false,
        useRegex: false,
        filterContent: false,
        filterByFlair: false,
        mutedFlairs: [],
        filterByScore: false,
        minScore: 0,
      },
    });
    const config = filtering.contentFiltering || {};
    const keywords = config.mutedKeywords || [];
    const flairs = config.mutedFlairs || [];

    // Skip if no filters enabled
    if (
      keywords.length === 0 &&
      !config.filterByFlair &&
      !config.filterByScore
    ) {
      return;
    }

    // Find all post containers
    const posts = document.querySelectorAll(".thing[data-url]");

    for (const post of posts) {
      let shouldHide = false;
      let reason = "";

      // 1. Keyword filtering (title + optional content)
      if (keywords.length > 0) {
        const titleElement = post.querySelector("a.title");
        if (titleElement) {
          let searchText = titleElement.textContent;

          // Optionally include post content (selftext)
          if (config.filterContent) {
            const contentElement = post.querySelector(
              ".expando .md, .usertext-body .md"
            );
            if (contentElement) {
              searchText += " " + contentElement.textContent;
            }
          }

          // Apply case sensitivity
          if (!config.caseSensitive) {
            searchText = searchText.toLowerCase();
          }

          // Check keywords
          const matchedKeyword = keywords.find((keyword) => {
            try {
              if (config.useRegex) {
                // Regex mode
                const flags = config.caseSensitive ? "g" : "gi";
                const regex = new RegExp(keyword, flags);
                return regex.test(searchText);
              } else {
                // Normal mode with word boundaries
                const searchKeyword = config.caseSensitive
                  ? keyword
                  : keyword.toLowerCase();
                const regex = new RegExp(
                  `\\b${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
                );
                return regex.test(searchText);
              }
            } catch (_e) {
              // Invalid regex, skip
              return false;
            }
          });

          if (matchedKeyword) {
            shouldHide = true;
            reason = "keyword";
            post.setAttribute("data-muted-keyword", matchedKeyword);
          }
        }
      }

      // 2. Flair filtering
      if (!shouldHide && config.filterByFlair && flairs.length > 0) {
        const flairElement = post.querySelector(".linkflairlabel");
        if (flairElement) {
          const flairText = flairElement.textContent.trim().toLowerCase();
          const matchedFlair = flairs.find(
            (flair) => flair.toLowerCase() === flairText
          );
          if (matchedFlair) {
            shouldHide = true;
            reason = "flair";
            post.setAttribute("data-muted-flair", matchedFlair);
          }
        }
      }

      // 3. Score filtering
      if (!shouldHide && config.filterByScore) {
        const scoreElement = post.querySelector(".score.unvoted");
        if (scoreElement) {
          const scoreText = scoreElement.textContent.trim();
          const score = parseInt(scoreText, 10);
          if (!isNaN(score) && score < config.minScore) {
            shouldHide = true;
            reason = "score";
            post.setAttribute("data-muted-score", score.toString());
          }
        }
      }

      // Apply hiding
      if (shouldHide) {
        post.classList.add("orr-muted-" + reason);
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
   * Apply user muting to posts and comments
   */
  async function applyUserMuting() {
    const prefs = await chrome.storage.sync.get({
      mutedUsers: { enabled: true, users: {} },
    });
    const mutedUsers = prefs.mutedUsers || {};

    if (!mutedUsers.enabled || Object.keys(mutedUsers.users).length === 0) {
      return;
    }

    const mutedUsernames = Object.keys(mutedUsers.users).map((u) =>
      u.toLowerCase()
    );

    // Hide posts from muted users
    const posts = document.querySelectorAll(".thing[data-author]");
    for (const post of posts) {
      const author = post.getAttribute("data-author")?.toLowerCase();
      if (author && mutedUsernames.includes(author)) {
        post.classList.add("orr-muted-user");
        post.setAttribute("data-muted-user", author);
        post.style.display = "none";
      }
    }

    // Hide comments from muted users
    const comments = document.querySelectorAll(".thing.comment");
    for (const comment of comments) {
      const authorLink = comment.querySelector("a.author");
      if (!authorLink) continue;

      const author = authorLink.textContent.trim().toLowerCase();
      if (mutedUsernames.includes(author)) {
        comment.classList.add("orr-muted-user");
        comment.setAttribute("data-muted-user", author);
        comment.style.display = "none";
      }
    }
  }

  /**
   * Apply NSFW content controls (blur/hide/show)
   */
  async function applyNsfwControls() {
    const prefs = await chrome.storage.local.get({
      nsfwControls: {
        enabled: false,
        visibility: "show",
        blurIntensity: 10,
        revealOnHover: true,
        showWarning: true,
        allowedSubreddits: [],
      },
    });
    const config = prefs.nsfwControls || {};

    // Skip if NSFW controls are disabled or set to show everything
    if (!config.enabled || config.visibility === "show") {
      // Remove any existing NSFW blur classes
      document.body.classList.remove(
        "orr-nsfw-blur",
        "orr-nsfw-hide",
        "orr-nsfw-reveal-hover"
      );
      document
        .querySelectorAll(".orr-nsfw-blurred, .orr-nsfw-hidden")
        .forEach((el) => {
          el.classList.remove(
            "orr-nsfw-blurred",
            "orr-nsfw-hidden",
            "orr-nsfw-allowed"
          );
        });
      return;
    }

    // Get current subreddit from page
    const currentSubreddit = getCurrentSubreddit();
    const allowedSubreddits = (config.allowedSubreddits || []).map((s) =>
      s.toLowerCase()
    );
    const isAllowedSubreddit =
      currentSubreddit &&
      allowedSubreddits.includes(currentSubreddit.toLowerCase());

    // If current subreddit is in allowlist, don't apply NSFW controls
    if (isAllowedSubreddit) {
      document.body.classList.remove(
        "orr-nsfw-blur",
        "orr-nsfw-hide",
        "orr-nsfw-reveal-hover"
      );
      return;
    }

    // Apply body classes for global styling
    document.body.classList.remove(
      "orr-nsfw-blur",
      "orr-nsfw-hide",
      "orr-nsfw-reveal-hover"
    );
    if (config.visibility === "blur") {
      document.body.classList.add("orr-nsfw-blur");
      if (config.revealOnHover) {
        document.body.classList.add("orr-nsfw-reveal-hover");
      }
    } else if (config.visibility === "hide") {
      document.body.classList.add("orr-nsfw-hide");
    }

    // Set blur intensity as CSS variable
    document.documentElement.style.setProperty(
      "--orr-nsfw-blur",
      `${config.blurIntensity}px`
    );

    // Find all NSFW posts
    const nsfwPosts = document.querySelectorAll(
      ".thing.over18, .thing[data-nsfw='true']"
    );

    for (const post of nsfwPosts) {
      // Check if post's subreddit is in allowlist
      const postSubreddit = post.getAttribute("data-subreddit")?.toLowerCase();
      if (postSubreddit && allowedSubreddits.includes(postSubreddit)) {
        post.classList.add("orr-nsfw-allowed");
        post.classList.remove("orr-nsfw-blurred", "orr-nsfw-hidden");
        continue;
      }

      if (config.visibility === "hide") {
        post.classList.add("orr-nsfw-hidden");
        post.classList.remove("orr-nsfw-blurred");
        post.style.display = "none";
      } else if (config.visibility === "blur") {
        post.classList.add("orr-nsfw-blurred");
        post.classList.remove("orr-nsfw-hidden");
        post.style.display = "";

        // Add warning overlay if enabled and not already present
        if (config.showWarning && !post.querySelector(".orr-nsfw-warning")) {
          const thumbnail = post.querySelector(".thumbnail");
          if (thumbnail && !thumbnail.classList.contains("self")) {
            const warning = document.createElement("div");
            warning.className = "orr-nsfw-warning";
            warning.innerHTML =
              '<span class="orr-nsfw-warning-icon">18+</span><span class="orr-nsfw-warning-text">NSFW</span>';
            warning.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              // Temporarily reveal this specific post
              post.classList.add("orr-nsfw-revealed");
              setTimeout(() => {
                post.classList.remove("orr-nsfw-revealed");
              }, 10000); // Auto-hide after 10 seconds
            });
            thumbnail.style.position = "relative";
            thumbnail.appendChild(warning);
          }
        }
      }
    }
  }

  /**
   * Get current subreddit from URL
   * @returns {string|null} Subreddit name or null
   */
  function getCurrentSubreddit() {
    const match = window.location.pathname.match(/^\/r\/([^\/]+)/i);
    return match ? match[1] : null;
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
   * DEPRECATED: Replaced by customizable keyboard shortcuts system
   * Handle keyboard shortcuts for navigation (OLD)
   * @param {KeyboardEvent} e - The keyboard event
   */
  /*
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
  */

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
   * ============================================================================
   * FEED ENHANCEMENTS
   * Customize feed appearance and layout
   * ============================================================================
   */

  /**
   * Apply feed enhancements based on user preferences
   */
  async function applyFeedEnhancements() {
    try {
      const config = await chrome.storage.local.get({ feedEnhancements: {} });
      const feed = config.feedEnhancements || {};

      // Apply class-based toggles
      document.body.classList.toggle("orr-compact-feed", feed.compactMode);
      document.body.classList.toggle("orr-text-only", feed.textOnlyMode);
      document.body.classList.toggle("orr-uncrop-images", feed.uncropImages);
      document.body.classList.toggle("orr-hide-join", feed.hideJoinButtons);
      document.body.classList.toggle("orr-hide-actions", feed.hideActionLinks);

      // Apply custom CSS
      if (feed.customCSSEnabled && feed.customCSS) {
        injectCustomCSS(feed.customCSS);
      } else {
        removeCustomCSS();
      }
    } catch (error) {
      console.error("[ORR] Error applying feed enhancements:", error);
    }
  }

  /**
   * Inject custom CSS into the page
   * @param {string} css - Custom CSS string
   */
  function injectCustomCSS(css) {
    // Remove old custom CSS
    removeCustomCSS();

    // Inject new custom CSS
    const style = document.createElement("style");
    style.id = "orr-custom-css";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Remove custom CSS from the page
   */
  function removeCustomCSS() {
    const existing = document.getElementById("orr-custom-css");
    if (existing) {
      existing.remove();
    }
  }

  /**
   * ============================================================================
   * LAYOUT PRESETS
   * Apply saved layout presets based on context (global or per-subreddit)
   * ============================================================================
   */

  /**
   * Get the current subreddit from URL
   * @returns {string|null} Subreddit name or null if not on a subreddit
   */
  function getCurrentSubreddit() {
    const match = window.location.pathname.match(/^\/r\/([^\/]+)/);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Apply layout preset based on current context
   */
  async function applyLayoutPreset() {
    try {
      const config = await chrome.storage.local.get({ layoutPresets: {} });
      const presets = config.layoutPresets || {};

      // Check if feature is enabled
      if (presets.enabled === false) {
        return;
      }

      // Determine which preset to apply
      let presetName = null;
      const subreddit = getCurrentSubreddit();

      // Check for subreddit-specific layout first
      if (subreddit && presets.subredditLayouts) {
        presetName = presets.subredditLayouts[subreddit];
      }

      // Fall back to active global preset
      if (!presetName && presets.activePreset) {
        presetName = presets.activePreset;
      }

      // If no preset to apply, return
      if (!presetName || !presets.presets || !presets.presets[presetName]) {
        return;
      }

      const preset = presets.presets[presetName];

      // Apply dark mode
      if (preset.darkMode !== undefined) {
        if (preset.darkMode) {
          const mode = preset.darkModeType === "oled" ? "oled" : "dark";
          if (mode === "oled") {
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

      // Apply feed enhancements
      document.body.classList.toggle(
        "orr-compact-feed",
        preset.compactMode || false
      );
      document.body.classList.toggle(
        "orr-text-only",
        preset.textOnlyMode || false
      );
      document.body.classList.toggle(
        "orr-uncrop-images",
        preset.uncropImages || false
      );
      document.body.classList.toggle(
        "orr-hide-join",
        preset.hideJoinButtons || false
      );
      document.body.classList.toggle(
        "orr-hide-actions",
        preset.hideActionLinks || false
      );

      // Apply comment enhancements
      if (preset.colorCodedComments !== undefined) {
        if (preset.colorCodedComments) {
          document.body.classList.add("orr-color-comments");
          document.body.classList.remove(
            "orr-palette-standard",
            "orr-palette-colorblind"
          );
          document.body.classList.add(
            `orr-palette-${preset.colorPalette || "standard"}`
          );
        } else {
          document.body.classList.remove(
            "orr-color-comments",
            "orr-palette-standard",
            "orr-palette-colorblind"
          );
        }
      }

      // Apply custom CSS from preset
      if (preset.customCSS) {
        injectPresetCSS(preset.customCSS);
      } else {
        removePresetCSS();
      }

      console.log(`[ORR] Applied layout preset: ${presetName}`);
    } catch (error) {
      console.error("[ORR] Error applying layout preset:", error);
    }
  }

  /**
   * Inject preset-specific custom CSS
   * @param {string} css - Custom CSS string
   */
  function injectPresetCSS(css) {
    removePresetCSS();
    const style = document.createElement("style");
    style.id = "orr-preset-css";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Remove preset-specific custom CSS
   */
  function removePresetCSS() {
    const existing = document.getElementById("orr-preset-css");
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Cycle through available layout presets
   */
  async function cycleLayoutPreset() {
    try {
      const config = await chrome.storage.local.get({ layoutPresets: {} });
      const presets = config.layoutPresets || {};

      if (presets.enabled === false) {
        showShortcutFeedback("Layout presets disabled");
        return;
      }

      const presetNames = Object.keys(presets.presets || {});
      if (presetNames.length === 0) {
        showShortcutFeedback("No presets available");
        return;
      }

      // Find current preset
      const currentPreset = presets.activePreset;
      const currentIndex = currentPreset
        ? presetNames.indexOf(currentPreset)
        : -1;

      // Cycle to next preset (or first if at end or none active)
      const nextIndex = (currentIndex + 1) % (presetNames.length + 1);

      if (nextIndex === presetNames.length) {
        // Clear preset (use individual settings)
        presets.activePreset = null;
        await chrome.storage.local.set({ layoutPresets: presets });
        showShortcutFeedback("Preset: None");
      } else {
        const nextPreset = presetNames[nextIndex];
        presets.activePreset = nextPreset;
        await chrome.storage.local.set({ layoutPresets: presets });
        showShortcutFeedback(`Preset: ${nextPreset}`);
      }

      // Re-apply the layout
      await applyLayoutPreset();
    } catch (error) {
      console.error("[ORR] Error cycling layout preset:", error);
    }
  }

  /**
   * ============================================================================
   * DEPRECATED: JUMP TO TOP KEYBOARD SHORTCUT (OLD)
   * Replaced by customizable keyboard shortcuts system
   * ============================================================================
   */

  /**
   * DEPRECATED: Initialize jump-to-top keyboard shortcut (OLD)
   */
  /*
  async function initJumpToTopKeyboard() {
    try {
      const { commentEnhancements } = await chrome.storage.sync.get([
        "commentEnhancements",
      ]);
      const enhancements = commentEnhancements || {};

      if (!enhancements.jumpToTopShortcut) return;

      document.addEventListener("keydown", handleJumpToTopKeyboard);
    } catch (error) {
      console.warn("[ORR] Failed to initialize jump-to-top keyboard:", error);
    }
  }
  */

  /**
   * DEPRECATED: Handle Shift+Home keyboard shortcut to jump to top (OLD)
   * @param {KeyboardEvent} event - Keyboard event
   */
  /*
  function handleJumpToTopKeyboard(event) {
    // Check for Shift+Home
    if (event.shiftKey && event.key === "Home") {
      event.preventDefault();

      // Check user's motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Scroll to top with appropriate behavior
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      // Accessibility: Announce to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.textContent = "Scrolled to top of page";
      announcement.style.cssText =
        "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);

      // Visual feedback
      document.body.classList.add("orr-jumped-to-top");
      setTimeout(
        () => document.body.classList.remove("orr-jumped-to-top"),
        1000
      );
    }
  }
  */

  /**
   * ============================================================================
   * CUSTOMIZABLE KEYBOARD SHORTCUTS
   * Dynamic keyboard shortcut system with user-defined mappings
   * ============================================================================
   */

  // Keyboard shortcut state
  const shortcutRegistry = new Map();
  let chordBuffer = [];
  let chordTimeout = null;
  let chordTimeoutDuration = 1000;
  let shortcutsEnabled = true;

  /**
   * Check if a key is a modifier key
   * @param {string} key - Key name
   * @returns {boolean} True if modifier key
   */
  function isModifierKey(key) {
    const modifiers = [
      "Control",
      "Alt",
      "Shift",
      "Meta",
      "AltGraph",
      "CapsLock",
      "NumLock",
      "ScrollLock",
      "Ctrl",
      "Command",
      "Option",
    ];
    return modifiers.includes(key);
  }

  /**
   * Build a key string from a KeyboardEvent
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {string} Key string (e.g., "Ctrl+K", "Shift+J", "D")
   */
  function buildKeyString(event) {
    // Don't process modifier-only key presses
    if (isModifierKey(event.key)) {
      return "";
    }

    const parts = [];

    // Add modifiers in consistent order
    if (event.ctrlKey) parts.push("Ctrl");
    if (event.altKey) parts.push("Alt");
    if (event.shiftKey) parts.push("Shift");
    if (event.metaKey) parts.push("Meta");

    // Add the main key
    let key = event.key;

    // Normalize special keys
    if (key === " ") {
      key = "Space";
    } else if (key.length === 1) {
      // Single character - capitalize
      key = key.toUpperCase();
    }

    parts.push(key);

    return parts.join("+");
  }

  /**
   * Check if the event target is in an input context
   * @param {Element} target - Event target element
   * @returns {boolean} True if in input context
   */
  function isInputContext(target) {
    if (!target) return false;

    const tagName = target.tagName.toLowerCase();

    // Check if it's an input element
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return true;
    }

    // Check if it's contenteditable
    if (
      target.isContentEditable ||
      target.getAttribute("contenteditable") === "true"
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get the current page context
   * @returns {string} Context ("feed", "comments", "any")
   */
  function getCurrentContext() {
    // Check if we're on a comments page
    if (
      window.location.pathname.includes("/comments/") ||
      document.querySelector(".commentarea")
    ) {
      return "comments";
    }

    // Check if we're on a feed page
    if (
      window.location.pathname === "/" ||
      window.location.pathname.match(/^\/r\/[^/]+\/?$/) ||
      window.location.pathname.match(/^\/r\/(all|popular)/)
    ) {
      return "feed";
    }

    // Default to "any" for other pages
    return "any";
  }

  /**
   * Check if a shortcut should be active in the current context
   * @param {string} shortcutContext - Shortcut's context requirement
   * @param {string} currentContext - Current page context
   * @returns {boolean} True if shortcut should be active
   */
  function isContextMatch(shortcutContext, currentContext) {
    if (shortcutContext === "any") return true;
    if (currentContext === "any") return true;
    return shortcutContext === currentContext;
  }

  /**
   * Clear the chord buffer
   */
  function clearChordBuffer() {
    chordBuffer = [];
    if (chordTimeout) {
      clearTimeout(chordTimeout);
      chordTimeout = null;
    }
  }

  /**
   * Show visual feedback for shortcut execution
   * @param {string} message - Message to display
   */
  function showShortcutFeedback(message) {
    // Remove existing feedback
    const existing = document.getElementById("orr-shortcut-feedback");
    if (existing) existing.remove();

    // Create feedback element
    const feedback = document.createElement("div");
    feedback.id = "orr-shortcut-feedback";
    feedback.className = "orr-shortcut-feedback";
    feedback.textContent = message;
    document.body.appendChild(feedback);

    // Accessibility announcement
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.textContent = message;
    announcement.style.cssText =
      "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
    document.body.appendChild(announcement);

    // Auto-dismiss after 2 seconds
    setTimeout(() => {
      feedback.classList.add("orr-fade-out");
      setTimeout(() => {
        feedback.remove();
        announcement.remove();
      }, 300);
    }, 2000);
  }

  /**
   * Execute a shortcut action
   * @param {string} actionId - The action ID to execute
   */
  async function executeShortcutAction(actionId) {
    switch (actionId) {
      case "nav-next-comment":
        navigateToNext();
        break;

      case "nav-prev-comment":
        navigateToPrevious();
        break;

      case "nav-jump-top":
      case "vim-jump-top":
      case "go-top-vim":
      case "jump-to-top":
        // Use existing jump to top logic
        {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
          showShortcutFeedback("Jumped to top");
        }
        break;

      case "toggle-dark-mode":
        await toggleDarkMode();
        break;

      case "toggle-compact":
        await toggleCompactMode();
        break;

      case "toggle-text-only":
        await toggleTextOnlyMode();
        break;

      case "cycle-palette":
        await cycleColorPalette();
        break;

      case "toggle-images":
        await toggleInlineImages();
        break;

      case "show-help":
        showKeyboardHelp();
        break;

      case "cycle-layout-preset":
        await cycleLayoutPreset();
        break;

      default:
        console.warn(`[ORR] Unknown shortcut action: ${actionId}`);
    }
  }

  /**
   * Toggle dark mode
   */
  async function toggleDarkMode() {
    try {
      const result = await chrome.storage.local.get({ darkMode: {} });
      const darkMode = result.darkMode || {};

      // Cycle through modes: light -> dark -> oled -> light
      const modes = ["light", "dark", "oled"];
      const currentIndex = modes.indexOf(darkMode.enabled || "auto");
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex];

      darkMode.enabled = nextMode;
      await chrome.storage.local.set({ darkMode });

      // Apply immediately
      await applyDarkMode();

      const modeNames = { light: "Light", dark: "Dark", oled: "OLED" };
      showShortcutFeedback(`Dark mode: ${modeNames[nextMode]}`);
    } catch (error) {
      console.error("[ORR] Failed to toggle dark mode:", error);
    }
  }

  /**
   * Toggle compact mode
   */
  async function toggleCompactMode() {
    try {
      const result = await chrome.storage.sync.get({ ui: {} });
      const ui = result.ui || {};

      ui.compactMode = !ui.compactMode;
      await chrome.storage.sync.set({ ui });

      // Apply compact mode class
      if (ui.compactMode) {
        document.body.classList.add("orr-compact-mode");
      } else {
        document.body.classList.remove("orr-compact-mode");
      }

      showShortcutFeedback(`Compact mode: ${ui.compactMode ? "ON" : "OFF"}`);
    } catch (error) {
      console.error("[ORR] Failed to toggle compact mode:", error);
    }
  }

  /**
   * Toggle text-only mode
   */
  async function toggleTextOnlyMode() {
    try {
      const result = await chrome.storage.sync.get({ ui: {} });
      const ui = result.ui || {};

      ui.textOnly = !ui.textOnly;
      await chrome.storage.sync.set({ ui });

      // Apply text-only mode class
      if (ui.textOnly) {
        document.body.classList.add("orr-text-only");
      } else {
        document.body.classList.remove("orr-text-only");
      }

      showShortcutFeedback(`Text-only mode: ${ui.textOnly ? "ON" : "OFF"}`);
    } catch (error) {
      console.error("[ORR] Failed to toggle text-only mode:", error);
    }
  }

  /**
   * Cycle color palette for color-coded comments
   */
  async function cycleColorPalette() {
    try {
      const result = await chrome.storage.sync.get({ commentEnhancements: {} });
      const enhancements = result.commentEnhancements || {};

      // Cycle through palettes
      const palettes = ["rainbow", "colorblind"];
      const currentIndex = palettes.indexOf(
        enhancements.colorPalette || "rainbow"
      );
      const nextIndex = (currentIndex + 1) % palettes.length;
      const nextPalette = palettes[nextIndex];

      enhancements.colorPalette = nextPalette;
      await chrome.storage.sync.set({ commentEnhancements: enhancements });

      // Reapply color coding
      await applyColorCodedComments();

      const paletteNames = {
        rainbow: "Rainbow",
        colorblind: "Colorblind-friendly",
      };
      showShortcutFeedback(`Palette: ${paletteNames[nextPalette]}`);
    } catch (error) {
      console.error("[ORR] Failed to cycle color palette:", error);
    }
  }

  /**
   * Toggle inline images
   */
  async function toggleInlineImages() {
    try {
      const result = await chrome.storage.sync.get({ commentEnhancements: {} });
      const enhancements = result.commentEnhancements || {};

      enhancements.inlineImages = !enhancements.inlineImages;
      await chrome.storage.sync.set({ commentEnhancements: enhancements });

      // Reapply inline images
      await applyInlineImages();

      showShortcutFeedback(
        `Inline images: ${enhancements.inlineImages ? "ON" : "OFF"}`
      );
    } catch (error) {
      console.error("[ORR] Failed to toggle inline images:", error);
    }
  }

  /**
   * Show keyboard shortcuts help overlay
   */
  function showKeyboardHelp() {
    // Remove existing overlay
    const existing = document.getElementById("orr-keyboard-help");
    if (existing) {
      existing.remove();
      return;
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "orr-keyboard-help";
    overlay.className = "orr-keyboard-help-overlay";

    const shortcuts = Array.from(shortcutRegistry.values());
    const groupedShortcuts = {
      Navigation: [],
      Appearance: [],
      Content: [],
      Help: [],
    };

    // Group shortcuts by type
    shortcuts.forEach((sc) => {
      if (!sc.enabled) return;

      const item = {
        keys: sc.keys,
        description: sc.description,
      };

      if (
        sc.id.includes("nav-") ||
        sc.id.includes("jump") ||
        sc.id.includes("vim-")
      ) {
        groupedShortcuts.Navigation.push(item);
      } else if (
        sc.id.includes("dark") ||
        sc.id.includes("compact") ||
        sc.id.includes("text") ||
        sc.id.includes("palette")
      ) {
        groupedShortcuts.Appearance.push(item);
      } else if (sc.id.includes("images")) {
        groupedShortcuts.Content.push(item);
      } else if (sc.id.includes("help")) {
        groupedShortcuts.Help.push(item);
      }
    });

    let html = `
      <div class="orr-keyboard-help-modal">
        <div class="orr-keyboard-help-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="orr-keyboard-help-close" title="Close (ESC)">×</button>
        </div>
        <div class="orr-keyboard-help-content">
    `;

    // Render each group
    for (const [group, items] of Object.entries(groupedShortcuts)) {
      if (items.length === 0) continue;

      html += `<div class="orr-keyboard-help-group">`;
      html += `<h3>${group}</h3>`;
      html += `<dl>`;

      items.forEach((item) => {
        html += `<dt><kbd>${item.keys.replace(/\+/g, "</kbd>+<kbd>")}</kbd></dt>`;
        html += `<dd>${item.description}</dd>`;
      });

      html += `</dl></div>`;
    }

    html += `
        </div>
        <div class="orr-keyboard-help-footer">
          <p>Press <kbd>Shift</kbd>+<kbd>/</kbd> to toggle this help</p>
          <p><a href="#" class="orr-customize-shortcuts">Customize shortcuts in settings</a></p>
        </div>
      </div>
    `;

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // Event listeners
    overlay
      .querySelector(".orr-keyboard-help-close")
      .addEventListener("click", () => overlay.remove());

    overlay
      .querySelector(".orr-customize-shortcuts")
      .addEventListener("click", (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({ action: "openOptions" });
        overlay.remove();
      });

    // Close on ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  /**
   * Handle keyboard shortcut events
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyboardShortcut(event) {
    // Skip if shortcuts are disabled
    if (!shortcutsEnabled) return;

    // Skip in input contexts (except for specific shortcuts)
    if (isInputContext(event.target)) return;

    // Build key string from event
    const keyString = buildKeyString(event);
    if (!keyString) return;

    const currentContext = getCurrentContext();

    // Add to chord buffer
    chordBuffer.push(keyString);

    // Reset chord timeout
    if (chordTimeout) clearTimeout(chordTimeout);
    chordTimeout = setTimeout(clearChordBuffer, chordTimeoutDuration);

    // Try to match current chord buffer
    const chordString = chordBuffer.join(" ");

    // Check for exact match
    for (const [id, shortcut] of shortcutRegistry) {
      if (!shortcut.enabled) continue;
      if (shortcut.keys !== chordString) continue;
      if (!isContextMatch(shortcut.context, currentContext)) continue;

      // Match found!
      event.preventDefault();
      clearChordBuffer();
      executeShortcutAction(id);
      return;
    }

    // Check if this could be the start of a chord
    const isPotentialChord = Array.from(shortcutRegistry.values()).some(
      (sc) => sc.enabled && sc.keys.startsWith(chordString + " ")
    );

    if (!isPotentialChord) {
      // No potential match, clear buffer
      clearChordBuffer();
    }
  }

  /**
   * Initialize keyboard shortcuts system
   */
  async function initKeyboardShortcuts() {
    try {
      // Load keyboard shortcuts configuration
      const result = await chrome.storage.sync.get({
        keyboardShortcuts: null,
      });

      if (!result.keyboardShortcuts) {
        console.log("[ORR] Keyboard shortcuts not configured, using defaults");
        return;
      }

      const config = result.keyboardShortcuts;
      shortcutsEnabled = config.enabled !== false;
      chordTimeoutDuration = config.chordTimeout || 1000;

      if (!shortcutsEnabled) {
        console.log("[ORR] Keyboard shortcuts disabled");
        return;
      }

      // Build shortcut registry
      shortcutRegistry.clear();
      for (const [id, shortcut] of Object.entries(config.shortcuts || {})) {
        shortcutRegistry.set(id, { id, ...shortcut });
      }

      // Add global keyboard listener
      document.addEventListener("keydown", handleKeyboardShortcut);

      console.log(
        `[ORR] Initialized ${shortcutRegistry.size} keyboard shortcuts`
      );
    } catch (error) {
      console.error("[ORR] Failed to initialize keyboard shortcuts:", error);
    }
  }

  /**
   * ============================================================================
   * TRACKING PROTECTION
   * Remove tracking parameters from URLs and control referrer information
   * ============================================================================
   */

  /**
   * Remove tracking parameters from a URL
   * @param {string} url - URL to clean
   * @param {string[]} trackingParams - List of parameter names to remove
   * @returns {string} - Cleaned URL
   */
  function removeTrackingParams(url, trackingParams) {
    try {
      const urlObj = new URL(url);
      let removed = 0;
      const removedTypes = { utm: 0, facebook: 0, google: 0, other: 0 };

      // Track which params were removed for statistics
      trackingParams.forEach((param) => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.delete(param);
          removed++;

          // Categorize the parameter
          if (param.startsWith("utm_")) {
            removedTypes.utm++;
          } else if (
            param === "fbclid" ||
            param === "igshid" ||
            param === "li_fat_id"
          ) {
            removedTypes.facebook++;
          } else if (param === "gclid" || param === "_ga") {
            removedTypes.google++;
          } else {
            removedTypes.other++;
          }
        }
      });

      if (removed > 0) {
        // Send stats to background script
        chrome.runtime.sendMessage({
          type: "TRACKING_CLEANED",
          data: removedTypes,
        });

        return urlObj.toString();
      }

      return url;
    } catch (e) {
      console.warn("Failed to remove tracking params:", e);
      return url;
    }
  }

  /**
   * Handle link clicks to remove tracking parameters
   * @param {Event} event - Click event
   */
  function handleLinkClick(event) {
    const link = event.target.closest("a");
    if (!link || !link.href) return;

    // Get current privacy settings
    chrome.storage.sync.get(["privacy"], (result) => {
      const privacy = result.privacy || {};
      if (!privacy.removeTracking) return;

      const trackingParams = privacy.trackingParams || [];
      if (trackingParams.length === 0) return;

      const cleanUrl = removeTrackingParams(link.href, trackingParams);
      if (cleanUrl !== link.href) {
        // Update the link href
        link.href = cleanUrl;

        // If it's a middle-click or ctrl-click, the browser will use the updated href
        // If it's a normal click, prevent default and navigate
        if (!event.ctrlKey && !event.metaKey && event.button === 0) {
          event.preventDefault();
          window.location.href = cleanUrl;
        }
      }
    });
  }

  /**
   * Initialize tracking protection
   */
  async function initTrackingProtection() {
    try {
      const { privacy } = await chrome.storage.sync.get(["privacy"]);
      if (!privacy || !privacy.removeTracking) return;

      // Add click listener with capture phase to intercept before navigation
      document.addEventListener("click", handleLinkClick, true);

      // Apply referrer policy
      applyReferrerPolicy(privacy.referrerPolicy);
    } catch (e) {
      console.warn("Failed to initialize tracking protection:", e);
    }
  }

  /**
   * Apply referrer policy to the page
   * @param {string} policy - Referrer policy value
   */
  function applyReferrerPolicy(policy) {
    if (!policy || policy === "default") {
      // Remove any existing policy meta tag we added
      const existing = document.querySelector(
        'meta[name="referrer"][data-orr]'
      );
      if (existing) {
        existing.remove();
      }
      return;
    }

    // Check if our meta tag already exists
    let meta = document.querySelector('meta[name="referrer"][data-orr]');
    if (!meta) {
      // Create new meta tag
      meta = document.createElement("meta");
      meta.name = "referrer";
      meta.setAttribute("data-orr", "true");
      document.head.appendChild(meta);
    }

    // Update content
    meta.content = policy;
  }

  /**
   * Listen for messages from popup/background
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REFRESH_DARK_MODE") {
      applyDarkMode();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_ACCESSIBILITY") {
      applyAccessibility();
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
    } else if (message.type === "REFRESH_USER_MUTING") {
      applyUserMuting();
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
    } else if (message.type === "REFRESH_FEED_ENHANCEMENTS") {
      applyFeedEnhancements();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_LAYOUT_PRESETS") {
      applyLayoutPreset();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_PRIVACY") {
      // Re-initialize tracking protection with new settings
      const privacy = message.privacy || {};
      applyReferrerPolicy(privacy.referrerPolicy);
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_READING_HISTORY") {
      // Re-apply visited post indicators
      markVisitedPosts();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_NSFW_CONTROLS") {
      // Re-apply NSFW content controls
      applyNsfwControls();
      sendResponse({ success: true });
    } else if (message.type === "REFRESH_COMMENT_MINIMAP") {
      // Re-initialize comment minimap
      initCommentMinimap();
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

  // =========================================================================
  // Reading History
  // =========================================================================

  /**
   * Track current post in reading history
   */
  async function trackReadingHistory() {
    try {
      const prefs = await chrome.storage.local.get({
        readingHistory: { enabled: true },
      });

      if (!prefs.readingHistory?.enabled) return;

      // Check if we're on a comments page (post page)
      const isCommentsPage = /\/comments\/[a-z0-9]+/i.test(
        window.location.pathname
      );
      if (!isCommentsPage) return;

      // Extract post ID from URL
      const match = window.location.pathname.match(/\/comments\/([a-z0-9]+)/i);
      if (!match) return;

      const postId = match[1];

      // Get post details from the page
      const titleElement = document.querySelector(".top-matter .title a.title");
      const title = titleElement?.textContent?.trim() || "Untitled";

      const subredditElement = document.querySelector(".top-matter .subreddit");
      const subreddit =
        subredditElement?.textContent?.replace(/^r\//, "").trim() || "";

      const commentsElement = document.querySelector(
        ".commentarea .panestack-title .title"
      );
      const commentMatch =
        commentsElement?.textContent?.match(/(\d+)\s*comments?/i);
      const commentCount = commentMatch ? parseInt(commentMatch[1], 10) : 0;

      // Add to reading history via storage
      await window.Storage.addReadingHistoryEntry({
        id: postId,
        title: title,
        subreddit: subreddit,
        url: window.location.href,
        commentCount: commentCount,
      });

      logger.debug(`Tracked post in reading history: ${postId}`);
    } catch (error) {
      logger.error("Error tracking reading history:", error);
    }
  }

  /**
   * Mark visited posts in the feed
   */
  async function markVisitedPosts() {
    try {
      const prefs = await chrome.storage.local.get({
        readingHistory: { enabled: true, showVisitedIndicator: true },
      });

      if (
        !prefs.readingHistory?.enabled ||
        !prefs.readingHistory?.showVisitedIndicator
      ) {
        // Remove any existing indicators if disabled
        document
          .querySelectorAll(".orr-visited-indicator")
          .forEach((el) => el.remove());
        document.querySelectorAll(".thing.orr-visited").forEach((el) => {
          el.classList.remove("orr-visited");
        });
        return;
      }

      // Get read post IDs
      const readIds = await window.Storage.getReadPostIds();
      if (readIds.size === 0) return;

      // Find all posts on the page
      const posts = document.querySelectorAll(".thing.link:not(.promoted)");

      for (const post of posts) {
        // Extract post ID from data-fullname (e.g., "t3_abc123" -> "abc123")
        const fullname = post.getAttribute("data-fullname");
        if (!fullname) continue;

        const postId = fullname.replace(/^t3_/, "");

        if (readIds.has(postId)) {
          // Mark as visited if not already marked
          if (!post.classList.contains("orr-visited")) {
            post.classList.add("orr-visited");

            // Add visited indicator icon if not already present
            const titleLink = post.querySelector(".entry .title a.title");
            if (
              titleLink &&
              !titleLink.querySelector(".orr-visited-indicator")
            ) {
              const indicator = document.createElement("span");
              indicator.className = "orr-visited-indicator";
              indicator.textContent = "✓";
              indicator.title = "You've read this post";
              titleLink.insertBefore(indicator, titleLink.firstChild);
            }
          }
        } else {
          // Remove visited class if post is no longer in history
          post.classList.remove("orr-visited");
          const indicator = post.querySelector(".orr-visited-indicator");
          if (indicator) indicator.remove();
        }
      }
    } catch (error) {
      logger.error("Error marking visited posts:", error);
    }
  }

  // =========================================================================
  // Navigation Enhancements
  // =========================================================================

  // Session storage key for collapsed comments
  const COLLAPSED_COMMENTS_KEY = "orr-collapsed-comments";

  /**
   * Highlight comment linked via permalink
   */
  function highlightPermalinkComment() {
    try {
      // Check for comment ID in URL hash or path
      const hash = window.location.hash;
      const path = window.location.pathname;

      let targetId = null;

      // Check hash (e.g., #thing_t1_abc123)
      if (hash && hash.startsWith("#")) {
        const hashId = hash.substring(1);
        // Handle thing_t1_xxx format
        if (hashId.startsWith("thing_t1_")) {
          targetId = hashId;
        } else if (hashId.startsWith("t1_")) {
          targetId = "thing_" + hashId;
        }
      }

      // Check path for direct comment link (e.g., /comments/xxx/title/abc123)
      if (!targetId) {
        const commentMatch = path.match(
          /\/comments\/[^\/]+\/[^\/]*\/([a-z0-9]+)\/?$/i
        );
        if (commentMatch) {
          targetId = "thing_t1_" + commentMatch[1];
        }
      }

      if (!targetId) return;

      // Find the comment element
      const comment = document.getElementById(targetId);
      if (!comment || !comment.classList.contains("comment")) return;

      // Add highlight class
      comment.classList.add("orr-permalink-highlight");

      // Scroll into view with offset for fixed headers
      setTimeout(() => {
        const rect = comment.getBoundingClientRect();
        const offset = 80; // Account for potential fixed header
        if (rect.top < offset || rect.bottom > window.innerHeight) {
          window.scrollTo({
            top: window.scrollY + rect.top - offset,
            behavior: "smooth",
          });
        }
      }, 100);

      // Remove highlight class after animation
      setTimeout(() => {
        comment.classList.remove("orr-permalink-highlight");
      }, 2500);

      logger.debug(`Highlighted permalink comment: ${targetId}`);
    } catch (error) {
      logger.error("Error highlighting permalink comment:", error);
    }
  }

  /**
   * Add parent navigation buttons to nested comments
   */
  function addParentNavButtons() {
    try {
      // Only run on comment pages
      if (!window.location.pathname.includes("/comments/")) return;

      const comments = document.querySelectorAll(
        ".comment:not(.orr-parent-nav-added)"
      );

      for (const comment of comments) {
        // Check if comment has a parent (is nested)
        const parentComment = comment.parentElement?.closest(".comment");
        if (!parentComment) continue; // Top-level comment, skip

        // Find the tagline to add the button
        const tagline = comment.querySelector(".entry > .tagline");
        if (!tagline) continue;

        // Check if button already exists
        if (tagline.querySelector(".orr-parent-nav-btn")) continue;

        // Create parent nav button
        const btn = document.createElement("button");
        btn.className = "orr-parent-nav-btn";
        btn.textContent = "↑ parent";
        btn.title = "Jump to parent comment";
        btn.setAttribute("aria-label", "Jump to parent comment");

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Scroll to parent comment
          const rect = parentComment.getBoundingClientRect();
          const offset = 80;
          window.scrollTo({
            top: window.scrollY + rect.top - offset,
            behavior: "smooth",
          });

          // Add brief highlight to parent
          parentComment.classList.add("orr-parent-highlight");
          setTimeout(() => {
            parentComment.classList.remove("orr-parent-highlight");
          }, 1000);
        });

        tagline.appendChild(btn);
        comment.classList.add("orr-parent-nav-added");
      }
    } catch (error) {
      logger.error("Error adding parent nav buttons:", error);
    }
  }

  /**
   * Get collapsed comment IDs from session storage
   */
  function getCollapsedComments() {
    try {
      const stored = sessionStorage.getItem(COLLAPSED_COMMENTS_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (_e) {
      // Ignore parse errors
    }
    return new Set();
  }

  /**
   * Save collapsed comment IDs to session storage
   */
  function saveCollapsedComments(ids) {
    try {
      sessionStorage.setItem(COLLAPSED_COMMENTS_KEY, JSON.stringify([...ids]));
    } catch (_e) {
      // Ignore storage errors
    }
  }

  /**
   * Initialize comment collapse memory
   */
  function initCollapseMemory() {
    try {
      // Only run on comment pages
      if (!window.location.pathname.includes("/comments/")) return;

      const collapsedIds = getCollapsedComments();

      // Restore collapsed state
      for (const id of collapsedIds) {
        const comment = document.getElementById(id);
        if (comment && comment.classList.contains("comment")) {
          // Find and click the collapse button if not already collapsed
          if (!comment.classList.contains("collapsed")) {
            const expandBtn = comment.querySelector(".expand");
            if (expandBtn) {
              expandBtn.click();
            }
          }
        }
      }

      // Watch for collapse/expand clicks
      document.addEventListener("click", (e) => {
        const expandBtn = e.target.closest(".expand");
        if (!expandBtn) return;

        const comment = expandBtn.closest(".comment");
        if (!comment) return;

        const commentId = comment.id;
        if (!commentId) return;

        const collapsed = getCollapsedComments();

        // Toggle collapsed state after a brief delay (wait for Reddit's JS)
        setTimeout(() => {
          if (comment.classList.contains("collapsed")) {
            collapsed.add(commentId);
          } else {
            collapsed.delete(commentId);
          }
          saveCollapsedComments(collapsed);
        }, 50);
      });

      logger.debug(
        `Collapse memory initialized, ${collapsedIds.size} comments restored`
      );
    } catch (error) {
      logger.error("Error initializing collapse memory:", error);
    }
  }

  // =========================================================================
  // COMMENT MINIMAP (Phase 14)
  // Visual navigation aid for comment threads
  // =========================================================================

  let minimapInstance = null;

  /**
   * Initialize and render comment minimap
   */
  async function initCommentMinimap() {
    // Only run on comment pages
    if (!window.location.pathname.includes("/comments/")) {
      return;
    }

    const prefs = await chrome.storage.local.get({
      commentMinimap: {
        enabled: true,
        position: "right",
        width: 120,
        opacity: 0.9,
        showViewportIndicator: true,
        useDepthColors: true,
        collapsedIndicator: true,
        autoHide: false,
      },
    });
    const config = prefs.commentMinimap || {};

    if (!config.enabled) {
      // Remove existing minimap if disabled
      if (minimapInstance) {
        minimapInstance.remove();
        minimapInstance = null;
      }
      return;
    }

    // Remove existing minimap before creating new one
    const existing = document.getElementById("orr-comment-minimap");
    if (existing) {
      existing.remove();
    }

    // Get all comments
    const comments = document.querySelectorAll(".thing.comment");
    if (comments.length === 0) {
      return;
    }

    // Create minimap container
    const minimap = document.createElement("div");
    minimap.id = "orr-comment-minimap";
    minimap.className = `orr-minimap-${config.position}`;
    minimap.style.width = `${config.width}px`;
    minimap.style.opacity = config.opacity;

    if (config.autoHide) {
      minimap.classList.add("orr-minimap-autohide");
    }

    // Create minimap header
    const header = document.createElement("div");
    header.className = "orr-minimap-header";
    header.innerHTML = `<span class="orr-minimap-title">Comments</span><span class="orr-minimap-count">${comments.length}</span>`;
    minimap.appendChild(header);

    // Create viewport indicator
    let viewportIndicator = null;
    if (config.showViewportIndicator) {
      viewportIndicator = document.createElement("div");
      viewportIndicator.className = "orr-minimap-viewport";
      minimap.appendChild(viewportIndicator);
    }

    // Create minimap content area
    const content = document.createElement("div");
    content.className = "orr-minimap-content";
    minimap.appendChild(content);

    // Color palette for depth (matches color-coded comments)
    const depthColors = [
      "#ff4500", // Level 1 - Reddit orange
      "#0079d3", // Level 2 - Blue
      "#46d160", // Level 3 - Green
      "#ff8b60", // Level 4 - Light orange
      "#7193ff", // Level 5 - Light blue
      "#ffd635", // Level 6 - Yellow
      "#ff66ac", // Level 7 - Pink
      "#9147ff", // Level 8 - Purple
      "#00d5fa", // Level 9 - Cyan
      "#cccccc", // Level 10+ - Gray
    ];

    // Calculate total document height for scaling
    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const minimapContentHeight = 400; // Fixed height for minimap content

    // Build minimap entries
    comments.forEach((comment) => {
      const entry = document.createElement("div");
      entry.className = "orr-minimap-entry";

      // Get comment depth
      const depth = calculateCommentDepth(comment);
      const depthIndex = Math.min(depth, depthColors.length - 1);

      // Calculate position based on comment's position in document
      const rect = comment.getBoundingClientRect();
      const commentTop = window.scrollY + rect.top;
      const relativePosition = commentTop / docHeight;
      const entryTop = relativePosition * minimapContentHeight;

      // Calculate entry height based on comment size
      const commentHeight = rect.height;
      const relativeHeight = Math.max(
        2,
        (commentHeight / docHeight) * minimapContentHeight
      );

      entry.style.top = `${entryTop}px`;
      entry.style.height = `${Math.min(relativeHeight, 20)}px`;
      entry.style.left = `${depth * 4}px`;
      entry.style.width = `${config.width - 20 - depth * 4}px`;

      if (config.useDepthColors) {
        entry.style.backgroundColor = depthColors[depthIndex];
      }

      // Check if comment is collapsed
      const isCollapsed = comment.classList.contains("collapsed");
      if (isCollapsed && config.collapsedIndicator) {
        entry.classList.add("orr-minimap-collapsed");
      }

      // Add click handler to navigate to comment
      entry.addEventListener("click", () => {
        const targetTop = commentTop - 80; // Offset for header
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        // Briefly highlight the comment
        comment.classList.add("orr-minimap-highlight");
        setTimeout(() => {
          comment.classList.remove("orr-minimap-highlight");
        }, 1500);
      });

      // Add hover tooltip
      const authorEl = comment.querySelector("a.author");
      const author = authorEl ? authorEl.textContent : "unknown";
      entry.title = `${author} (depth ${depth + 1})`;

      content.appendChild(entry);
    });

    // Set content height
    content.style.height = `${minimapContentHeight}px`;

    // Update viewport indicator on scroll
    if (viewportIndicator) {
      const updateViewportIndicator = () => {
        const scrollTop = window.scrollY;
        const viewportTop = (scrollTop / docHeight) * minimapContentHeight;
        const viewportSize =
          (viewportHeight / docHeight) * minimapContentHeight;

        viewportIndicator.style.top = `${viewportTop + 30}px`; // +30 for header
        viewportIndicator.style.height = `${Math.max(10, viewportSize)}px`;
      };

      updateViewportIndicator();
      window.addEventListener("scroll", updateViewportIndicator, {
        passive: true,
      });
    }

    // Add to page
    document.body.appendChild(minimap);
    minimapInstance = minimap;
  }

  /**
   * Apply all navigation enhancements
   */
  function applyNavigationEnhancements() {
    highlightPermalinkComment();
    addParentNavButtons();
    initCollapseMemory();
    initCommentMinimap();
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      await applySortPreference(); // Check/apply sort preference first
      lastSort = getCurrentSort(); // Initialize lastSort
      showRedirectNotice();
      applyDarkMode();
      applyAccessibility();
      applyNagBlocking();
      applySubredditMuting();
      applyKeywordFiltering();
      applyDomainFiltering();
      applyUserMuting();
      applyNsfwControls();
      applyColorCodedComments();
      applyCommentNavigation();
      applyInlineImages();
      applyUserTags();
      applyFeedEnhancements();
      applyLayoutPreset();
      initTrackingProtection();
      initKeyboardShortcuts();
      trackReadingHistory();
      markVisitedPosts();
      applyNavigationEnhancements();
      watchColorScheme();
      watchForDynamicContent();
      autoCollapseBotComments();
    });
  } else {
    (async () => {
      await applySortPreference(); // Check/apply sort preference first
      lastSort = getCurrentSort(); // Initialize lastSort
      showRedirectNotice();
      applyDarkMode();
      applyAccessibility();
      applyNagBlocking();
      applySubredditMuting();
      applyKeywordFiltering();
      applyDomainFiltering();
      applyUserMuting();
      applyNsfwControls();
      applyColorCodedComments();
      applyCommentNavigation();
      applyInlineImages();
      applyUserTags();
      applyFeedEnhancements();
      applyLayoutPreset();
      initTrackingProtection();
      initKeyboardShortcuts();
      trackReadingHistory();
      markVisitedPosts();
      applyNavigationEnhancements();
      watchColorScheme();
      watchForDynamicContent();
      autoCollapseBotComments();
    })();
  }
})();

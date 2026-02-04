/**
 * Content Filtering Module
 * Handles subreddit muting, keyword filtering, domain filtering, and user muting
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $$ } from "../shared/dom-helpers.js";

/**
 * Apply subreddit muting on /r/all and /r/popular
 */
async function applySubredditMuting() {
  // Only apply on /r/all and /r/popular
  const path = window.location.pathname;
  const isAllOrPopular = path.includes("/r/all") || path.includes("/r/popular");

  if (!isAllOrPopular) {
    return;
  }

  const overrides = await getStorage({
    subredditOverrides: { mutedSubreddits: [] },
  });
  const mutedSubreddits = overrides.subredditOverrides?.mutedSubreddits || [];

  if (mutedSubreddits.length === 0) {
    return;
  }

  // Find all post containers
  const posts = $$(".thing[data-subreddit]");

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
  const filtering = await getStorage({
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
  if (keywords.length === 0 && !config.filterByFlair && !config.filterByScore) {
    return;
  }

  // Find all post containers
  const posts = $$(".thing[data-url]");

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
  const filtering = await getStorage({
    contentFiltering: { mutedDomains: [] },
  });
  const domains = filtering.contentFiltering?.mutedDomains || [];

  if (domains.length === 0) {
    return;
  }

  // Find all post containers
  const posts = $$(".thing[data-domain]");

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
  try {
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
    const posts = $$(".thing[data-author]");
    for (const post of posts) {
      const author = post.getAttribute("data-author")?.toLowerCase();
      if (author && mutedUsernames.includes(author)) {
        post.classList.add("orr-muted-user");
        post.setAttribute("data-muted-user", author);
        post.style.display = "none";
      }
    }

    // Hide comments from muted users
    const comments = $$(".thing.comment");
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
  } catch (error) {
    console.error("[ORR] User muting failed:", error);
  }
}

/**
 * Initialize content filtering features
 */
export async function initFiltering() {
  try {
    await Promise.all([
      applySubredditMuting(),
      applyKeywordFiltering(),
      applyDomainFiltering(),
      applyUserMuting(),
    ]);
  } catch (error) {
    console.error("[ORR] Content filtering initialization failed:", error);
  }
}

/**
 * Export filtering functions for use by mutation observer
 */
export {
  applySubredditMuting,
  applyKeywordFiltering,
  applyDomainFiltering,
  applyUserMuting,
};

/**
 * Reading History Module
 * Tracks visited posts and marks them in feeds
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $, $$ } from "../shared/dom-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Track current post in reading history
 */
async function trackReadingHistory() {
  try {
    const prefs = await getStorage({
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
    const titleElement = $(".top-matter .title a.title");
    const title = titleElement?.textContent?.trim() || "Untitled";

    const subredditElement = $(".top-matter .subreddit");
    const subreddit =
      subredditElement?.textContent?.replace(/^r\//, "").trim() || "";

    const commentsElement = $(".commentarea .panestack-title .title");
    const commentMatch =
      commentsElement?.textContent?.match(/(\d+)\s*comments?/i);
    const commentCount = commentMatch ? parseInt(commentMatch[1], 10) : 0;

    // Add to reading history via storage
    if (window.Storage && window.Storage.addReadingHistoryEntry) {
      await window.Storage.addReadingHistoryEntry({
        id: postId,
        title: title,
        subreddit: subreddit,
        url: window.location.href,
        commentCount: commentCount,
      });

      debugLog(`[ORR] Tracked post in reading history: ${postId}`);
    }
  } catch (error) {
    console.error("[ORR] Error tracking reading history:", error);
  }
}

/**
 * Mark visited posts in the feed
 */
async function markVisitedPosts() {
  try {
    const prefs = await getStorage({
      readingHistory: { enabled: true, showVisitedIndicator: true },
    });

    if (
      !prefs.readingHistory?.enabled ||
      !prefs.readingHistory?.showVisitedIndicator
    ) {
      // Remove any existing indicators if disabled
      $$(".orr-visited-indicator").forEach((el) => el.remove());
      $$(".thing.orr-visited").forEach((el) => {
        el.classList.remove("orr-visited");
      });
      return;
    }

    // Get read post IDs
    if (!window.Storage || !window.Storage.getReadPostIds) {
      return;
    }

    const readIds = await window.Storage.getReadPostIds();
    if (readIds.size === 0) return;

    // Find all posts on the page
    const posts = $$(".thing.link:not(.promoted)");

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
          if (titleLink && !titleLink.querySelector(".orr-visited-indicator")) {
            const indicator = document.createElement("span");
            indicator.className = "orr-visited-indicator";
            indicator.textContent = "✓";
            indicator.title = "Already visited";
            titleLink.appendChild(indicator);
          }
        }
      }
    }
  } catch (error) {
    console.error("[ORR] Error marking visited posts:", error);
  }
}

/**
 * Initialize reading history features
 */
export async function initReadingHistory() {
  try {
    const prefs = await getStorage({
      readingHistory: { enabled: true },
    });

    if (!prefs.readingHistory?.enabled) {
      return;
    }

    // Track current post if on comments page
    await trackReadingHistory();

    // Mark visited posts if on a listing page
    await markVisitedPosts();
  } catch (error) {
    console.error("[ORR] Reading history initialization failed:", error);
  }
}

/**
 * Export functions for mutation observer
 */
export { trackReadingHistory, markVisitedPosts };

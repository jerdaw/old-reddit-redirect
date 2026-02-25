/**
 * Smart Collections Module
 * Automatically tags bookmarked items based on rules
 */
import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Initialize smart collections
 */
export async function initSmartCollections() {
  const settings = await getStorage("discovery");
  if (!settings.discovery?.smartCollections) return;

  // Expose global API for bookmarks module to use
  window.ORR_SmartCollections = {
    getTags: (entry) => calculateTags(entry),
  };

  debugLog("[ORE] Smart Collections initialized");
}

/**
 * Calculate tags for an entry based on rules
 * @param {Object} entry - Bookmark entry { title, subreddit, url, ... }
 * @returns {Array<string>} Array of tags
 */
export function calculateTags(entry) {
  const tags = new Set();
  const title = entry.title.toLowerCase();
  const sub = entry.subreddit ? entry.subreddit.toLowerCase() : "";

  // category: Coding
  const codingSubs = [
    "javascript",
    "reactjs",
    "programming",
    "webdev",
    "learnprogramming",
    "css",
    "html",
  ];
  if (codingSubs.includes(sub)) {
    tags.add("Coding");
  }

  // category: News
  const newsSubs = ["news", "worldnews", "technology", "politics"];
  if (newsSubs.includes(sub)) {
    tags.add("News");
  }

  // type: Tutorial
  if (/\b(tutorial|guide|how[- ]to|walkthrough)\b/i.test(title)) {
    tags.add("Tutorial");
  }

  // type: Video
  if (
    /\b(video|youtube|watch)\b/i.test(title) ||
    entry.url.includes("youtube.com") ||
    entry.url.includes("youtu.be")
  ) {
    tags.add("Video");
  }

  // type: Discussion
  if (
    /\b(discuss|discussion|thought|opinion)\b/i.test(title) ||
    title.includes("?")
  ) {
    tags.add("Discussion");
  }

  return Array.from(tags);
}

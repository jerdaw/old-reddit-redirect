"use strict";

/**
 * Curated list of subreddits that use new Reddit features
 * This list is static but can be updated with extension updates
 */
const SUGGESTED_SUBREDDITS = [
  {
    name: "wallstreetbets",
    reason: "Predictions, polls, and live discussions",
    category: "finance",
  },
  {
    name: "nba",
    reason: "Game threads with live comments and polls",
    category: "sports",
  },
  {
    name: "nfl",
    reason: "Game threads with predictions",
    category: "sports",
  },
  {
    name: "soccer",
    reason: "Match threads with live features",
    category: "sports",
  },
  {
    name: "cryptocurrency",
    reason: "Polls and moon distribution",
    category: "finance",
  },
  {
    name: "polls",
    reason: "Entire subreddit is poll-based",
    category: "polls",
  },
  {
    name: "predictions",
    reason: "Prediction tournaments",
    category: "polls",
  },
  {
    name: "rpan",
    reason: "Reddit Public Access Network (live streaming)",
    category: "streaming",
  },
  {
    name: "pan",
    reason: "Reddit Public Access Network content",
    category: "streaming",
  },
  {
    name: "theredditsynth",
    reason: "Live audio features",
    category: "streaming",
  },
];

const Suggestions = {
  /**
   * Get suggestions not already in whitelist
   */
  async getAvailableSuggestions() {
    const { whitelist } = await window.Storage.getSubredditOverrides();
    const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

    return SUGGESTED_SUBREDDITS.filter(
      (s) => !whitelistSet.has(s.name.toLowerCase())
    );
  },

  /**
   * Get all suggestions
   */
  getAll() {
    return SUGGESTED_SUBREDDITS;
  },

  /**
   * Get suggestions by category
   */
  getByCategory(category) {
    return SUGGESTED_SUBREDDITS.filter((s) => s.category === category);
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SUGGESTED_SUBREDDITS, Suggestions };
} else {
  window.Suggestions = Suggestions;
}

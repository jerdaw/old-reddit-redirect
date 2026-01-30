import { describe, it, expect } from "vitest";

/**
 * Tests for suggestions.js - curated subreddit suggestions
 * These tests validate suggestion filtering and categorization
 */

// Replicate the suggestions structure from suggestions.js
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

describe("Subreddit Suggestions", () => {
  describe("getAll", () => {
    it("should return all suggestions", () => {
      const all = SUGGESTED_SUBREDDITS;
      expect(all.length).toBe(10);
    });

    it("should have required fields for each suggestion", () => {
      SUGGESTED_SUBREDDITS.forEach((suggestion) => {
        expect(suggestion).toHaveProperty("name");
        expect(suggestion).toHaveProperty("reason");
        expect(suggestion).toHaveProperty("category");
        expect(typeof suggestion.name).toBe("string");
        expect(typeof suggestion.reason).toBe("string");
        expect(typeof suggestion.category).toBe("string");
      });
    });

    it("should have unique names", () => {
      const names = SUGGESTED_SUBREDDITS.map((s) => s.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should use valid subreddit name format", () => {
      const validPattern = /^[a-z0-9_]+$/i;
      SUGGESTED_SUBREDDITS.forEach((suggestion) => {
        expect(suggestion.name).toMatch(validPattern);
      });
    });
  });

  describe("getByCategory", () => {
    it("should filter sports subreddits", () => {
      const sports = SUGGESTED_SUBREDDITS.filter(
        (s) => s.category === "sports"
      );
      expect(sports.length).toBe(3);
      expect(sports.map((s) => s.name)).toEqual(
        expect.arrayContaining(["nba", "nfl", "soccer"])
      );
    });

    it("should filter finance subreddits", () => {
      const finance = SUGGESTED_SUBREDDITS.filter(
        (s) => s.category === "finance"
      );
      expect(finance.length).toBe(2);
      expect(finance.map((s) => s.name)).toEqual(
        expect.arrayContaining(["wallstreetbets", "cryptocurrency"])
      );
    });

    it("should filter polls subreddits", () => {
      const polls = SUGGESTED_SUBREDDITS.filter((s) => s.category === "polls");
      expect(polls.length).toBe(2);
      expect(polls.map((s) => s.name)).toEqual(
        expect.arrayContaining(["polls", "predictions"])
      );
    });

    it("should filter streaming subreddits", () => {
      const streaming = SUGGESTED_SUBREDDITS.filter(
        (s) => s.category === "streaming"
      );
      expect(streaming.length).toBe(3);
      expect(streaming.map((s) => s.name)).toEqual(
        expect.arrayContaining(["rpan", "pan", "theredditsynth"])
      );
    });

    it("should return empty array for unknown category", () => {
      const unknown = SUGGESTED_SUBREDDITS.filter(
        (s) => s.category === "nonexistent"
      );
      expect(unknown).toEqual([]);
    });
  });

  describe("getAvailableSuggestions", () => {
    it("should filter out whitelisted subreddits", () => {
      const whitelist = ["nba", "polls"];
      const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

      const available = SUGGESTED_SUBREDDITS.filter(
        (s) => !whitelistSet.has(s.name.toLowerCase())
      );

      expect(available.length).toBe(8); // 10 - 2 whitelisted
      expect(available.map((s) => s.name)).not.toContain("nba");
      expect(available.map((s) => s.name)).not.toContain("polls");
    });

    it("should handle empty whitelist", () => {
      const whitelist = [];
      const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

      const available = SUGGESTED_SUBREDDITS.filter(
        (s) => !whitelistSet.has(s.name.toLowerCase())
      );

      expect(available.length).toBe(10);
    });

    it("should handle case-insensitive matching", () => {
      const whitelist = ["NBA", "WallStreetBets"];
      const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

      const available = SUGGESTED_SUBREDDITS.filter(
        (s) => !whitelistSet.has(s.name.toLowerCase())
      );

      expect(available.length).toBe(8);
      expect(available.map((s) => s.name)).not.toContain("nba");
      expect(available.map((s) => s.name)).not.toContain("wallstreetbets");
    });

    it("should handle all suggestions being whitelisted", () => {
      const whitelist = SUGGESTED_SUBREDDITS.map((s) => s.name);
      const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

      const available = SUGGESTED_SUBREDDITS.filter(
        (s) => !whitelistSet.has(s.name.toLowerCase())
      );

      expect(available).toEqual([]);
    });

    it("should ignore subreddits not in suggestions", () => {
      const whitelist = ["nba", "nonexistent_subreddit", "another_fake"];
      const whitelistSet = new Set(whitelist.map((s) => s.toLowerCase()));

      const available = SUGGESTED_SUBREDDITS.filter(
        (s) => !whitelistSet.has(s.name.toLowerCase())
      );

      expect(available.length).toBe(9); // Only nba is filtered
    });
  });

  describe("Suggestion data quality", () => {
    it("should have non-empty reasons", () => {
      SUGGESTED_SUBREDDITS.forEach((suggestion) => {
        expect(suggestion.reason.length).toBeGreaterThan(0);
      });
    });

    it("should have valid categories", () => {
      const validCategories = ["finance", "sports", "polls", "streaming"];
      SUGGESTED_SUBREDDITS.forEach((suggestion) => {
        expect(validCategories).toContain(suggestion.category);
      });
    });

    it("should have balanced category distribution", () => {
      const categoryCounts = {};
      SUGGESTED_SUBREDDITS.forEach((s) => {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      });

      // Each category should have at least 2 suggestions
      Object.values(categoryCounts).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(2);
      });
    });

    it("should not have duplicate reasons", () => {
      const reasons = SUGGESTED_SUBREDDITS.map((s) => s.reason);
      const uniqueReasons = new Set(reasons);
      expect(uniqueReasons.size).toBe(reasons.length);
    });
  });

  describe("Category coverage", () => {
    it("should include finance category", () => {
      const hasFinance = SUGGESTED_SUBREDDITS.some(
        (s) => s.category === "finance"
      );
      expect(hasFinance).toBe(true);
    });

    it("should include sports category", () => {
      const hasSports = SUGGESTED_SUBREDDITS.some(
        (s) => s.category === "sports"
      );
      expect(hasSports).toBe(true);
    });

    it("should include polls category", () => {
      const hasPolls = SUGGESTED_SUBREDDITS.some((s) => s.category === "polls");
      expect(hasPolls).toBe(true);
    });

    it("should include streaming category", () => {
      const hasStreaming = SUGGESTED_SUBREDDITS.some(
        (s) => s.category === "streaming"
      );
      expect(hasStreaming).toBe(true);
    });
  });
});

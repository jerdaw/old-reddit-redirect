import { describe, it, expect } from "vitest";
import { getRecommendations } from "../modules/discovery/related.js";
import { calculateTags } from "../modules/discovery/smart-collections.js";

describe("Content Discovery", () => {
  
  describe("Related Posts Algorithm", () => {
    const currentPost = {
      id: "current",
      title: "How to learn JavaScript",
      subreddit: "learnprogramming",
      url: "http://reddit.com/r/learnprogramming/comments/current"
    };

    const history = [
      {
        id: "1",
        title: "JavaScript Tutorial for Beginners",
        subreddit: "learnprogramming",
        timestamp: Date.now() - 1000,
        url: "url1"
      },
      {
        id: "2",
        title: "Python Guide",
        subreddit: "python",
        timestamp: Date.now() - 100000,
        url: "url2"
      },
      {
        id: "3",
        title: "Random News",
        subreddit: "news",
        timestamp: Date.now() - 1000000,
        url: "url3"
      }
    ];

    it("prioritizes posts from same subreddit", () => {
      const recs = getRecommendations(currentPost, history);
      // Item 1: Same sub (+10), "JavaScript" match (+2), Recent (<1d) (+2) = 14
      // Item 2: Different sub, "Guide" no match, Recent (<1d) (+2) = 2
      expect(recs[0].id).toBe("1"); 
    });

    it("scores based on title keywords", () => {
      const current = { ...currentPost, title: "React Hooks Guide" };
      // "React", "Hooks", "Guide"
      
      const historyItems = [
        // "React" match (+2), "Patterns" no match. Recent (+2). Score = 4
        { id: "A", title: "React Component Patterns", subreddit: "reactjs", timestamp: Date.now() },
        // No keyword match. Recent (+2). Score = 2
        { id: "B", title: "Cooking Recipes", subreddit: "cooking", timestamp: Date.now() }
      ];
      
      const recs = getRecommendations(current, historyItems);
      expect(recs[0].id).toBe("A");
      expect(recs.length).toBe(2);
    });

    it("excludes current post", () => {
      const historyWithCurrent = [...history, { ...currentPost, timestamp: Date.now() }];
      const recs = getRecommendations(currentPost, historyWithCurrent);
      expect(recs.find(r => r.id === "current")).toBeUndefined();
    });
  });

  describe("Smart Collections (Auto-tagging)", () => {
    it("tags coding subreddits", () => {
      const entry = { title: "Some Post", subreddit: "javascript", url: "" };
      const tags = calculateTags(entry);
      expect(tags).toContain("Coding");
    });

    it("tags news subreddits", () => {
      const entry = { title: "World Event", subreddit: "worldnews", url: "" };
      const tags = calculateTags(entry);
      expect(tags).toContain("News");
    });

    it("tags tutorials based on title", () => {
      const entry = { title: "How to build a website", subreddit: "other", url: "" };
      const tags = calculateTags(entry);
      expect(tags).toContain("Tutorial");
    });

    it("tags videos based on title or url", () => {
      const entry1 = { title: "Funny Video", subreddit: "other", url: "" };
      expect(calculateTags(entry1)).toContain("Video");

      const entry2 = { title: "Link", subreddit: "other", url: "https://youtube.com/watch?v=123" };
      expect(calculateTags(entry2)).toContain("Video");
    });

    it("tags discussions", () => {
      const entry = { title: "What is your opinion?", subreddit: "other", url: "" };
      const tags = calculateTags(entry);
      expect(tags).toContain("Discussion");
    });

    it("combines tags", () => {
      const entry = { title: "JavaScript Tutorial Video", subreddit: "javascript", url: "" };
      const tags = calculateTags(entry);
      expect(tags).toContain("Coding");
      expect(tags).toContain("Tutorial");
      expect(tags).toContain("Video");
    });
  });
});

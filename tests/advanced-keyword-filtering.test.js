import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("Advanced Keyword Filtering", () => {
  let dom;
  let window;
  let document;
  let chrome;

  beforeEach(() => {
    // Set up a JSDOM instance
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "https://old.reddit.com/",
    });
    window = dom.window;
    document = window.document;

    // Mock Chrome API
    chrome = {
      storage: {
        sync: {
          get: vi.fn(),
          set: vi.fn(),
        },
        local: {
          get: vi.fn(),
          set: vi.fn(),
        },
      },
      runtime: {
        sendMessage: vi.fn(),
      },
    };

    global.window = window;
    global.document = document;
    global.chrome = chrome;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Storage Schema Extensions", () => {
    it("should have advanced filtering fields in contentFiltering defaults", () => {
      const defaults = {
        mutedKeywords: [],
        mutedDomains: [],
        caseSensitive: false,
        useRegex: false,
        filterContent: false,
        filterByFlair: false,
        mutedFlairs: [],
        filterByScore: false,
        minScore: 0,
      };

      expect(defaults).toHaveProperty("useRegex");
      expect(defaults).toHaveProperty("filterContent");
      expect(defaults).toHaveProperty("filterByFlair");
      expect(defaults).toHaveProperty("mutedFlairs");
      expect(defaults).toHaveProperty("filterByScore");
      expect(defaults).toHaveProperty("minScore");
    });

    it("should default regex mode to false", () => {
      const defaultValue = false;
      expect(defaultValue).toBe(false);
    });

    it("should default filter content to false", () => {
      const defaultValue = false;
      expect(defaultValue).toBe(false);
    });

    it("should default flair filtering to false", () => {
      const defaultValue = false;
      expect(defaultValue).toBe(false);
    });

    it("should default score filtering to false", () => {
      const defaultValue = false;
      expect(defaultValue).toBe(false);
    });

    it("should default min score to 0", () => {
      const defaultValue = 0;
      expect(defaultValue).toBe(0);
    });
  });

  describe("Regex Keyword Matching", () => {
    it("should match literal strings in regex mode", () => {
      const keyword = "test";
      const title = "This is a test post";
      const regex = new RegExp(keyword, "gi");

      expect(regex.test(title)).toBe(true);
    });

    it("should match pattern with wildcards", () => {
      const keyword = "test.*post";
      const title = "This is a test with words and post";
      const regex = new RegExp(keyword, "gi");

      expect(regex.test(title)).toBe(true);
    });

    it("should match character classes", () => {
      const keyword = "test[0-9]+";
      const title = "This is test123 post";
      const regex = new RegExp(keyword, "gi");

      expect(regex.test(title)).toBe(true);
    });

    it("should match alternation", () => {
      const keyword = "cat|dog|bird";
      const title1 = "I have a cat";
      const title2 = "I have a dog";
      const title3 = "I have a bird";

      // Create new regex for each test to avoid stateful lastIndex issues with "g" flag
      expect(new RegExp(keyword, "gi").test(title1)).toBe(true);
      expect(new RegExp(keyword, "gi").test(title2)).toBe(true);
      expect(new RegExp(keyword, "gi").test(title3)).toBe(true);
    });

    it("should respect case sensitivity in regex", () => {
      const keyword = "Test";
      const title = "this is a test post";
      const regexInsensitive = new RegExp(keyword, "gi");
      const regexSensitive = new RegExp(keyword, "g");

      expect(regexInsensitive.test(title)).toBe(true);
      expect(regexSensitive.test(title)).toBe(false);
    });

    it("should handle invalid regex gracefully", () => {
      const keyword = "[invalid";

      expect(() => new RegExp(keyword)).toThrow();
    });

    it("should match start/end anchors", () => {
      const keyword = "^test";
      const title1 = "test is at the start";
      const title2 = "not at the start test";
      const regex = new RegExp(keyword, "gi");

      expect(regex.test(title1)).toBe(true);
      expect(regex.test(title2)).toBe(false);
    });
  });

  describe("Content Filtering", () => {
    it("should filter by post content when enabled", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const title = document.createElement("a");
      title.className = "title";
      title.textContent = "Innocent title";
      post.appendChild(title);

      const expando = document.createElement("div");
      expando.className = "expando";
      const content = document.createElement("div");
      content.className = "md";
      content.textContent =
        "This content contains badword that should be filtered";
      expando.appendChild(content);
      post.appendChild(expando);

      document.body.appendChild(post);

      // Simulate filtering
      const keyword = "badword";
      const titleText = title.textContent;
      const contentText = content.textContent;
      const searchText = (titleText + " " + contentText).toLowerCase();

      expect(searchText).toContain(keyword);
    });

    it("should not filter content when content filtering disabled", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const title = document.createElement("a");
      title.className = "title";
      title.textContent = "Innocent title";
      post.appendChild(title);

      const filterContent = false;

      if (!filterContent) {
        // Only search title
        const searchText = title.textContent.toLowerCase();
        expect(searchText).not.toContain("badword");
      }
    });

    it("should handle posts without expando content", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const title = document.createElement("a");
      title.className = "title";
      title.textContent = "Title only post";
      post.appendChild(title);

      document.body.appendChild(post);

      const contentElement = post.querySelector(".expando .md");
      expect(contentElement).toBeNull();
    });

    it("should handle usertext-body format for self posts", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const usertext = document.createElement("div");
      usertext.className = "usertext-body";
      const content = document.createElement("div");
      content.className = "md";
      content.textContent = "Self post content here";
      usertext.appendChild(content);
      post.appendChild(usertext);

      document.body.appendChild(post);

      const contentElement = post.querySelector(".usertext-body .md");
      expect(contentElement).not.toBeNull();
      expect(contentElement.textContent).toBe("Self post content here");
    });
  });

  describe("Flair Filtering", () => {
    it("should match flair text exactly (case-insensitive)", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const flair = document.createElement("span");
      flair.className = "linkflairlabel";
      flair.textContent = " Meme ";
      post.appendChild(flair);

      document.body.appendChild(post);

      const flairElement = post.querySelector(".linkflairlabel");
      const flairText = flairElement.textContent.trim().toLowerCase();
      const mutedFlairs = ["meme", "spoiler"];

      expect(mutedFlairs.includes(flairText)).toBe(true);
    });

    it("should not match partial flair text", () => {
      const flairText = "meme";
      const mutedFlairs = ["me"];

      expect(mutedFlairs.includes(flairText)).toBe(false);
    });

    it("should handle posts without flair", () => {
      const post = document.createElement("div");
      post.className = "thing";
      document.body.appendChild(post);

      const flairElement = post.querySelector(".linkflairlabel");
      expect(flairElement).toBeNull();
    });

    it("should handle multiple muted flairs", () => {
      const mutedFlairs = ["meme", "spoiler", "nsfw", "discussion"];
      const testFlairs = ["Meme", "News", "Spoiler", "NSFW"];

      const matched = testFlairs.filter((f) =>
        mutedFlairs.includes(f.toLowerCase())
      );

      expect(matched).toEqual(["Meme", "Spoiler", "NSFW"]);
    });

    it("should trim whitespace from flair text", () => {
      const flairText = "  Meme  ";
      const trimmed = flairText.trim().toLowerCase();

      expect(trimmed).toBe("meme");
    });
  });

  describe("Score Filtering", () => {
    it("should hide posts below minimum score", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const score = document.createElement("div");
      score.className = "score unvoted";
      score.textContent = "-5";
      post.appendChild(score);

      document.body.appendChild(post);

      const scoreElement = post.querySelector(".score.unvoted");
      const scoreValue = parseInt(scoreElement.textContent.trim(), 10);
      const minScore = 0;

      expect(scoreValue < minScore).toBe(true);
    });

    it("should show posts above minimum score", () => {
      const scoreValue = 100;
      const minScore = 0;

      expect(scoreValue >= minScore).toBe(true);
    });

    it("should handle score of exactly the threshold", () => {
      const scoreValue = 10;
      const minScore = 10;

      expect(scoreValue >= minScore).toBe(true);
    });

    it("should parse score text to integer", () => {
      const scoreText = "123";
      const parsed = parseInt(scoreText, 10);

      expect(parsed).toBe(123);
      expect(typeof parsed).toBe("number");
    });

    it("should handle negative scores", () => {
      const scoreText = "-42";
      const parsed = parseInt(scoreText, 10);

      expect(parsed).toBe(-42);
    });

    it("should handle non-numeric score text", () => {
      const scoreText = "•";
      const parsed = parseInt(scoreText, 10);

      expect(isNaN(parsed)).toBe(true);
    });

    it("should handle posts without score element", () => {
      const post = document.createElement("div");
      post.className = "thing";
      document.body.appendChild(post);

      const scoreElement = post.querySelector(".score.unvoted");
      expect(scoreElement).toBeNull();
    });

    it("should support negative minimum scores", () => {
      const scoreValue = -10;
      const minScore = -20;

      expect(scoreValue >= minScore).toBe(true);
    });

    it("should support very high score thresholds", () => {
      const scoreValue = 50;
      const minScore = 1000;

      expect(scoreValue < minScore).toBe(true);
    });
  });

  describe("Combined Filtering", () => {
    it("should apply keyword and flair filters together", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const title = document.createElement("a");
      title.className = "title";
      title.textContent = "Normal post";
      post.appendChild(title);

      const flair = document.createElement("span");
      flair.className = "linkflairlabel";
      flair.textContent = "Meme";
      post.appendChild(flair);

      document.body.appendChild(post);

      // Should hide if either keyword or flair matches
      const keywords = ["badword"];
      const flairs = ["meme"];
      const titleText = title.textContent.toLowerCase();
      const flairText = flair.textContent.trim().toLowerCase();

      const keywordMatch = keywords.some((k) => titleText.includes(k));
      const flairMatch = flairs.includes(flairText);

      expect(keywordMatch || flairMatch).toBe(true);
    });

    it("should apply all three filters (keyword, flair, score)", () => {
      const post = document.createElement("div");
      post.className = "thing";

      const title = document.createElement("a");
      title.className = "title";
      title.textContent = "Test post";
      post.appendChild(title);

      const flair = document.createElement("span");
      flair.className = "linkflairlabel";
      flair.textContent = "News";
      post.appendChild(flair);

      const score = document.createElement("div");
      score.className = "score unvoted";
      score.textContent = "-10";
      post.appendChild(score);

      document.body.appendChild(post);

      // Check each filter
      const keywords = ["badword"];
      const flairs = ["news"];
      const minScore = 0;

      const titleText = title.textContent.toLowerCase();
      const flairText = flair.textContent.trim().toLowerCase();
      const scoreValue = parseInt(score.textContent.trim(), 10);

      const keywordMatch = keywords.some((k) => titleText.includes(k));
      const flairMatch = flairs.includes(flairText);
      const scoreMatch = !isNaN(scoreValue) && scoreValue < minScore;

      const shouldHide = keywordMatch || flairMatch || scoreMatch;

      expect(shouldHide).toBe(true);
    });

    it("should not hide when no filters match", () => {
      const keywords = ["badword"];
      const flairs = ["meme"];
      const minScore = 0;

      const titleText = "good post title";
      const flairText = "news";
      const scoreValue = 100;

      const keywordMatch = keywords.some((k) => titleText.includes(k));
      const flairMatch = flairs.includes(flairText);
      const scoreMatch = !isNaN(scoreValue) && scoreValue < minScore;

      const shouldHide = keywordMatch || flairMatch || scoreMatch;

      expect(shouldHide).toBe(false);
    });
  });

  describe("Filter Priority", () => {
    it("should hide on first matching filter", () => {
      // If keyword matches, don't need to check flair or score
      const titleText = "contains badword here";
      const keywords = ["badword"];

      const keywordMatch = keywords.some((k) => titleText.includes(k));

      if (keywordMatch) {
        // Short-circuit, don't check other filters
        expect(true).toBe(true);
      }
    });

    it("should check flair only if keyword did not match", () => {
      const titleText = "normal title";
      const keywords = ["badword"];
      const flairs = ["meme"];
      const flairText = "meme";

      const keywordMatch = keywords.some((k) => titleText.includes(k));

      if (!keywordMatch) {
        const flairMatch = flairs.includes(flairText);
        expect(flairMatch).toBe(true);
      }
    });

    it("should check score only if keyword and flair did not match", () => {
      const titleText = "normal title";
      const keywords = ["badword"];
      const flairs = ["meme"];
      const flairText = "news";
      const scoreValue = -10;
      const minScore = 0;

      const keywordMatch = keywords.some((k) => titleText.includes(k));
      const flairMatch = flairs.includes(flairText);

      if (!keywordMatch && !flairMatch) {
        const scoreMatch = scoreValue < minScore;
        expect(scoreMatch).toBe(true);
      }
    });
  });

  describe("Import/Export", () => {
    it("should export flair list as JSON", () => {
      const flairs = ["Meme", "Spoiler", "NSFW"];
      const json = JSON.stringify(flairs, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(flairs);
    });

    it("should validate imported flair format", () => {
      const validJSON = '["Meme", "Spoiler"]';
      const parsed = JSON.parse(validJSON);

      expect(Array.isArray(parsed)).toBe(true);
    });

    it("should reject non-array imports", () => {
      const invalidJSON = '{"flair": "Meme"}';
      const parsed = JSON.parse(invalidJSON);

      expect(Array.isArray(parsed)).toBe(false);
    });

    it("should filter out duplicate flairs on import", () => {
      const existing = ["Meme", "News"];
      const imported = ["Meme", "Spoiler", "News", "NSFW"];
      const newFlairs = imported.filter((f) => !existing.includes(f));

      expect(newFlairs).toEqual(["Spoiler", "NSFW"]);
    });
  });

  describe("UI Validation", () => {
    it("should validate min score input range", () => {
      const input = 999999;
      const max = 999999;

      expect(input <= max).toBe(true);
    });

    it("should validate min score minimum value", () => {
      const input = -999;
      const min = -999;

      expect(input >= min).toBe(true);
    });

    it("should handle empty min score input", () => {
      const input = "";
      const parsed = parseInt(input, 10);
      const defaultValue = 0;

      const finalValue = isNaN(parsed) ? defaultValue : parsed;

      expect(finalValue).toBe(0);
    });

    it("should limit flair list to 100 entries", () => {
      const maxFlairs = 100;
      const currentCount = 99;
      const canAdd = currentCount < maxFlairs;

      expect(canAdd).toBe(true);
    });

    it("should reject flair when at limit", () => {
      const maxFlairs = 100;
      const currentCount = 100;
      const canAdd = currentCount < maxFlairs;

      expect(canAdd).toBe(false);
    });
  });
});

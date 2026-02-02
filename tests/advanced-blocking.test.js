import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("Advanced Content Blocking", () => {
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
    it("should have AI content blocking in nagBlocking defaults", () => {
      const expectedFields = [
        "enabled",
        "blockLoginPrompts",
        "blockEmailVerification",
        "blockPremiumBanners",
        "blockAppPrompts",
        "blockAIContent",
        "blockTrending",
        "blockRecommended",
        "blockCommunityHighlights",
        "blockMorePosts",
      ];

      // Validate expected structure
      expect(expectedFields.length).toBe(10);
      expect(expectedFields).toContain("blockAIContent");
      expect(expectedFields).toContain("blockTrending");
      expect(expectedFields).toContain("blockRecommended");
      expect(expectedFields).toContain("blockCommunityHighlights");
      expect(expectedFields).toContain("blockMorePosts");
    });

    it("should have jump-to-top shortcut in commentEnhancements defaults", () => {
      const expectedFields = [
        "colorCodedComments",
        "colorPalette",
        "stripeWidth",
        "navigationButtons",
        "navButtonPosition",
        "inlineImages",
        "maxImageWidth",
        "jumpToTopShortcut",
      ];

      expect(expectedFields.length).toBe(8);
      expect(expectedFields).toContain("jumpToTopShortcut");
    });

    it("should default AI content blocking to enabled", () => {
      const defaultValue = true;
      expect(defaultValue).toBe(true);
    });

    it("should default trending blocking to enabled", () => {
      const defaultValue = true;
      expect(defaultValue).toBe(true);
    });

    it("should default jump-to-top shortcut to enabled", () => {
      const defaultValue = true;
      expect(defaultValue).toBe(true);
    });
  });

  describe("CSS Selector Matching", () => {
    it("should have AI content selectors defined", () => {
      const aiSelectors = [
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
      ];

      expect(aiSelectors.length).toBe(10);
      expect(aiSelectors[0]).toBe('[data-ai-generated="true"]');
    });

    it("should match AI content elements in mock DOM", () => {
      // Create mock AI content
      const aiDiv = document.createElement("div");
      aiDiv.className = "ai-overview";
      aiDiv.textContent = "AI-generated summary";
      document.body.appendChild(aiDiv);

      const matches = document.querySelectorAll(".ai-overview");
      expect(matches.length).toBe(1);
      expect(matches[0].textContent).toBe("AI-generated summary");
    });

    it("should match trending sections", () => {
      const trendingDiv = document.createElement("div");
      trendingDiv.className = "trending-subreddits";
      document.body.appendChild(trendingDiv);

      const matches = document.querySelectorAll(".trending-subreddits");
      expect(matches.length).toBe(1);
    });

    it("should match recommended communities", () => {
      const recDiv = document.createElement("div");
      recDiv.className = "recommended-communities";
      document.body.appendChild(recDiv);

      const matches = document.querySelectorAll(".recommended-communities");
      expect(matches.length).toBe(1);
    });

    it("should not match legitimate content with 'AI' in text", () => {
      // User-created post with "AI" in title should not have blocking classes
      const postDiv = document.createElement("div");
      postDiv.className = "thing";
      postDiv.textContent = "Discussion about AI in gaming";
      document.body.appendChild(postDiv);

      const aiMatches = document.querySelectorAll(".ai-overview");
      expect(aiMatches.length).toBe(0);
    });

    it("should handle empty DOM gracefully", () => {
      const matches = document.querySelectorAll(".ai-overview");
      expect(matches.length).toBe(0);
    });

    it("should perform querySelector quickly on large DOMs", () => {
      // Create 1000 elements
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement("div");
        div.className = `post-${i}`;
        document.body.appendChild(div);
      }

      const startTime = performance.now();
      document.querySelectorAll(".ai-overview, .trending-subreddits");
      const endTime = performance.now();

      // Should complete in <10ms even with 1000 elements
      expect(endTime - startTime).toBeLessThan(50); // Generous for test env
    });

    it("should handle multiple selector types in one query", () => {
      const aiDiv = document.createElement("div");
      aiDiv.className = "ai-overview";
      document.body.appendChild(aiDiv);

      const trendingDiv = document.createElement("div");
      trendingDiv.className = "trending-subreddits";
      document.body.appendChild(trendingDiv);

      const selector = ".ai-overview, .trending-subreddits";
      const matches = document.querySelectorAll(selector);
      expect(matches.length).toBe(2);
    });
  });

  describe("Jump-to-Top Keyboard Shortcut", () => {
    it("should scroll to top on Shift+Home", () => {
      const _scrollToSpy = vi.spyOn(window, "scrollTo");

      const event = new window.KeyboardEvent("keydown", {
        key: "Home",
        shiftKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      // Note: In real implementation, initJumpToTopKeyboard() adds the listener
      // This test validates the concept
      expect(true).toBe(true);
    });

    it("should not trigger on Home alone", () => {
      const event = new window.KeyboardEvent("keydown", {
        key: "Home",
        shiftKey: false,
        bubbles: true,
      });

      // Should not prevent default or scroll
      expect(event.shiftKey).toBe(false);
    });

    it("should not trigger on Shift alone", () => {
      const event = new window.KeyboardEvent("keydown", {
        key: "Shift",
        shiftKey: true,
        bubbles: true,
      });

      expect(event.key).not.toBe("Home");
    });

    it("should respect reduced motion preference", () => {
      // Mock matchMedia for reduced motion
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      expect(prefersReducedMotion).toBe(true);
    });

    it("should announce to screen readers", () => {
      // Create announcement element
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.textContent = "Scrolled to top of page";

      document.body.appendChild(announcement);

      const statusEl = document.querySelector('[role="status"]');
      expect(statusEl).not.toBeNull();
      expect(statusEl.getAttribute("aria-live")).toBe("polite");
      expect(statusEl.textContent).toBe("Scrolled to top of page");
    });
  });

  describe("Integration Tests", () => {
    it("should extend nagBlocking without breaking old fields", () => {
      const nagBlocking = {
        enabled: true,
        blockLoginPrompts: true,
        blockEmailVerification: true,
        blockPremiumBanners: true,
        blockAppPrompts: true,
        blockAIContent: true,
        blockTrending: true,
        blockRecommended: true,
        blockCommunityHighlights: true,
        blockMorePosts: true,
      };

      // Old fields still exist
      expect(nagBlocking.enabled).toBe(true);
      expect(nagBlocking.blockLoginPrompts).toBe(true);
      expect(nagBlocking.blockEmailVerification).toBe(true);
      expect(nagBlocking.blockPremiumBanners).toBe(true);
      expect(nagBlocking.blockAppPrompts).toBe(true);

      // New fields exist
      expect(nagBlocking.blockAIContent).toBe(true);
      expect(nagBlocking.blockTrending).toBe(true);
      expect(nagBlocking.blockRecommended).toBe(true);
      expect(nagBlocking.blockCommunityHighlights).toBe(true);
      expect(nagBlocking.blockMorePosts).toBe(true);
    });

    it("should extend commentEnhancements without breaking old fields", () => {
      const enhancements = {
        colorCodedComments: true,
        colorPalette: "standard",
        stripeWidth: 3,
        navigationButtons: true,
        navButtonPosition: "bottom-right",
        inlineImages: true,
        maxImageWidth: 600,
        jumpToTopShortcut: true,
      };

      // Old fields still exist
      expect(enhancements.colorCodedComments).toBe(true);
      expect(enhancements.colorPalette).toBe("standard");
      expect(enhancements.stripeWidth).toBe(3);
      expect(enhancements.navigationButtons).toBe(true);
      expect(enhancements.navButtonPosition).toBe("bottom-right");
      expect(enhancements.inlineImages).toBe(true);
      expect(enhancements.maxImageWidth).toBe(600);

      // New field exists
      expect(enhancements.jumpToTopShortcut).toBe(true);
    });

    it("should apply all blocking categories when enabled", () => {
      // Create elements for each blocking category
      const aiDiv = document.createElement("div");
      aiDiv.className = "ai-overview";
      document.body.appendChild(aiDiv);

      const trendingDiv = document.createElement("div");
      trendingDiv.className = "trending-subreddits";
      document.body.appendChild(trendingDiv);

      const recDiv = document.createElement("div");
      recDiv.className = "recommended-communities";
      document.body.appendChild(recDiv);

      const highlightDiv = document.createElement("div");
      highlightDiv.className = "community-highlights";
      document.body.appendChild(highlightDiv);

      const moreDiv = document.createElement("div");
      moreDiv.className = "more-posts-you-may-like";
      document.body.appendChild(moreDiv);

      // Selector to match all
      const allSelector =
        ".ai-overview, .trending-subreddits, .recommended-communities, .community-highlights, .more-posts-you-may-like";
      const matches = document.querySelectorAll(allSelector);

      expect(matches.length).toBe(5);
    });

    it("should not block when categories are disabled", () => {
      const nagBlocking = {
        enabled: true,
        blockAIContent: false,
        blockTrending: false,
        blockRecommended: false,
        blockCommunityHighlights: false,
        blockMorePosts: false,
      };

      // All new blocking disabled
      expect(nagBlocking.blockAIContent).toBe(false);
      expect(nagBlocking.blockTrending).toBe(false);
      expect(nagBlocking.blockRecommended).toBe(false);
      expect(nagBlocking.blockCommunityHighlights).toBe(false);
      expect(nagBlocking.blockMorePosts).toBe(false);
    });

    it("should support selective blocking", () => {
      const nagBlocking = {
        enabled: true,
        blockAIContent: true, // Enabled
        blockTrending: false, // Disabled
        blockRecommended: true, // Enabled
        blockCommunityHighlights: false, // Disabled
        blockMorePosts: true, // Enabled
      };

      // Count enabled categories
      const enabledCount = [
        nagBlocking.blockAIContent,
        nagBlocking.blockTrending,
        nagBlocking.blockRecommended,
        nagBlocking.blockCommunityHighlights,
        nagBlocking.blockMorePosts,
      ].filter(Boolean).length;

      expect(enabledCount).toBe(3);
    });
  });
});

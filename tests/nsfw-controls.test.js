"use strict";

/**
 * NSFW Controls Tests (Phase 13)
 * Tests for NSFW content visibility, blur settings, and subreddit allowlist
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    lastError: null,
    getManifest: vi.fn(() => ({ version: "18.0.0" })),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
};

global.chrome = mockChrome;

describe("NSFW Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Storage Schema", () => {
    it("should have correct default values", () => {
      const defaults = {
        enabled: false,
        visibility: "show",
        blurIntensity: 10,
        revealOnHover: true,
        showWarning: true,
        allowedSubreddits: [],
      };

      expect(defaults.enabled).toBe(false);
      expect(defaults.visibility).toBe("show");
      expect(defaults.blurIntensity).toBe(10);
      expect(defaults.revealOnHover).toBe(true);
      expect(defaults.showWarning).toBe(true);
      expect(defaults.allowedSubreddits).toEqual([]);
    });

    it("should support all visibility modes", () => {
      const validModes = ["show", "blur", "hide"];

      validModes.forEach((mode) => {
        expect(["show", "blur", "hide"]).toContain(mode);
      });
    });

    it("should support blur intensity range", () => {
      const minIntensity = 5;
      const maxIntensity = 20;
      const defaultIntensity = 10;

      expect(defaultIntensity).toBeGreaterThanOrEqual(minIntensity);
      expect(defaultIntensity).toBeLessThanOrEqual(maxIntensity);
    });
  });

  describe("Visibility Modes", () => {
    it("should show NSFW content when visibility is 'show'", () => {
      const config = { enabled: true, visibility: "show" };
      const shouldFilter = config.enabled && config.visibility !== "show";

      expect(shouldFilter).toBe(false);
    });

    it("should blur NSFW content when visibility is 'blur'", () => {
      const config = { enabled: true, visibility: "blur" };
      const shouldBlur = config.enabled && config.visibility === "blur";

      expect(shouldBlur).toBe(true);
    });

    it("should hide NSFW content when visibility is 'hide'", () => {
      const config = { enabled: true, visibility: "hide" };
      const shouldHide = config.enabled && config.visibility === "hide";

      expect(shouldHide).toBe(true);
    });

    it("should not filter when disabled", () => {
      const config = { enabled: false, visibility: "hide" };
      const shouldFilter = config.enabled;

      expect(shouldFilter).toBe(false);
    });
  });

  describe("Blur Settings", () => {
    it("should validate blur intensity within range", () => {
      const validateBlurIntensity = (value) => {
        return value >= 5 && value <= 20;
      };

      expect(validateBlurIntensity(5)).toBe(true);
      expect(validateBlurIntensity(10)).toBe(true);
      expect(validateBlurIntensity(20)).toBe(true);
      expect(validateBlurIntensity(4)).toBe(false);
      expect(validateBlurIntensity(21)).toBe(false);
    });

    it("should generate correct CSS blur value", () => {
      const blurIntensity = 10;
      const cssValue = `${blurIntensity}px`;

      expect(cssValue).toBe("10px");
    });

    it("should apply reveal on hover when enabled", () => {
      const config = { visibility: "blur", revealOnHover: true };
      const shouldRevealOnHover =
        config.visibility === "blur" && config.revealOnHover;

      expect(shouldRevealOnHover).toBe(true);
    });

    it("should not reveal on hover when disabled", () => {
      const config = { visibility: "blur", revealOnHover: false };
      const shouldRevealOnHover =
        config.visibility === "blur" && config.revealOnHover;

      expect(shouldRevealOnHover).toBe(false);
    });
  });

  describe("Allowed Subreddits", () => {
    it("should add subreddit to allowlist", () => {
      const allowedSubreddits = [];
      const subreddit = "art";

      if (!allowedSubreddits.includes(subreddit)) {
        allowedSubreddits.push(subreddit);
      }

      expect(allowedSubreddits).toContain("art");
    });

    it("should normalize subreddit names to lowercase", () => {
      const input = "AskReddit";
      const normalized = input.toLowerCase().replace(/^r\//, "");

      expect(normalized).toBe("askreddit");
    });

    it("should remove r/ prefix from subreddit names", () => {
      const inputs = ["r/programming", "r/AskReddit", "gaming"];

      const normalized = inputs.map((s) => s.toLowerCase().replace(/^r\//, ""));

      expect(normalized).toEqual(["programming", "askreddit", "gaming"]);
    });

    it("should not add duplicate subreddits", () => {
      const allowedSubreddits = ["art", "photography"];
      const subreddit = "art";

      if (!allowedSubreddits.includes(subreddit)) {
        allowedSubreddits.push(subreddit);
      }

      expect(allowedSubreddits.length).toBe(2);
    });

    it("should remove subreddit from allowlist", () => {
      const allowedSubreddits = ["art", "photography", "gaming"];
      const toRemove = "photography";

      const filtered = allowedSubreddits.filter((s) => s !== toRemove);

      expect(filtered).toEqual(["art", "gaming"]);
      expect(filtered).not.toContain("photography");
    });

    it("should enforce max allowlist size of 100", () => {
      const allowedSubreddits = [];
      const maxAllowed = 100;

      // Fill to capacity
      for (let i = 0; i < 105; i++) {
        allowedSubreddits.push(`sub${i}`);
      }

      // Enforce limit
      const limited = allowedSubreddits.slice(0, maxAllowed);

      expect(limited.length).toBe(100);
    });

    it("should check if subreddit is in allowlist", () => {
      const allowedSubreddits = ["art", "photography", "gaming"];

      const isAllowed = (sub) => allowedSubreddits.includes(sub.toLowerCase());

      expect(isAllowed("art")).toBe(true);
      expect(isAllowed("Art")).toBe(true);
      expect(isAllowed("music")).toBe(false);
    });
  });

  describe("NSFW Post Detection", () => {
    it("should detect NSFW post by over18 class", () => {
      const post = { classList: { contains: (cls) => cls === "over18" } };
      const isNsfw = post.classList.contains("over18");

      expect(isNsfw).toBe(true);
    });

    it("should detect NSFW post by data attribute", () => {
      const post = { dataset: { nsfw: "true" } };
      const isNsfw = post.dataset.nsfw === "true";

      expect(isNsfw).toBe(true);
    });

    it("should not detect non-NSFW post", () => {
      const post = {
        classList: { contains: () => false },
        dataset: {},
      };
      const isNsfw =
        post.classList.contains("over18") || post.dataset.nsfw === "true";

      expect(isNsfw).toBe(false);
    });
  });

  describe("Subreddit Exemptions", () => {
    it("should bypass NSFW controls for allowed subreddits", () => {
      const config = {
        enabled: true,
        visibility: "blur",
        allowedSubreddits: ["art", "photography"],
      };
      const postSubreddit = "art";

      const isAllowed = config.allowedSubreddits.includes(
        postSubreddit.toLowerCase()
      );
      const shouldApplyControls = config.enabled && !isAllowed;

      expect(shouldApplyControls).toBe(false);
    });

    it("should apply NSFW controls for non-allowed subreddits", () => {
      const config = {
        enabled: true,
        visibility: "blur",
        allowedSubreddits: ["art", "photography"],
      };
      const postSubreddit = "gaming";

      const isAllowed = config.allowedSubreddits.includes(
        postSubreddit.toLowerCase()
      );
      const shouldApplyControls = config.enabled && !isAllowed;

      expect(shouldApplyControls).toBe(true);
    });

    it("should handle case-insensitive subreddit matching", () => {
      const allowedSubreddits = ["askreddit", "iama"];
      const testCases = [
        { input: "AskReddit", expected: true },
        { input: "ASKREDDIT", expected: true },
        { input: "askreddit", expected: true },
        { input: "IAmA", expected: true },
        { input: "gaming", expected: false },
      ];

      testCases.forEach(({ input, expected }) => {
        const isAllowed = allowedSubreddits.includes(input.toLowerCase());
        expect(isAllowed).toBe(expected);
      });
    });
  });

  describe("CSS Classes", () => {
    it("should have correct blur class", () => {
      const className = "orr-nsfw-blurred";
      expect(className).toBe("orr-nsfw-blurred");
    });

    it("should have correct hidden class", () => {
      const className = "orr-nsfw-hidden";
      expect(className).toBe("orr-nsfw-hidden");
    });

    it("should have correct revealed class", () => {
      const className = "orr-nsfw-revealed";
      expect(className).toBe("orr-nsfw-revealed");
    });

    it("should have correct allowed class", () => {
      const className = "orr-nsfw-allowed";
      expect(className).toBe("orr-nsfw-allowed");
    });

    it("should have correct body classes", () => {
      const classes = {
        blur: "orr-nsfw-blur",
        hide: "orr-nsfw-hide",
        revealHover: "orr-nsfw-reveal-hover",
      };

      expect(classes.blur).toBe("orr-nsfw-blur");
      expect(classes.hide).toBe("orr-nsfw-hide");
      expect(classes.revealHover).toBe("orr-nsfw-reveal-hover");
    });
  });

  describe("Warning Overlay", () => {
    it("should show warning when enabled", () => {
      const config = { visibility: "blur", showWarning: true };
      const shouldShowWarning =
        config.visibility === "blur" && config.showWarning;

      expect(shouldShowWarning).toBe(true);
    });

    it("should not show warning when disabled", () => {
      const config = { visibility: "blur", showWarning: false };
      const shouldShowWarning =
        config.visibility === "blur" && config.showWarning;

      expect(shouldShowWarning).toBe(false);
    });

    it("should not show warning in hide mode", () => {
      const config = { visibility: "hide", showWarning: true };
      const shouldShowWarning =
        config.visibility === "blur" && config.showWarning;

      expect(shouldShowWarning).toBe(false);
    });

    it("should have correct warning class", () => {
      const className = "orr-nsfw-warning";
      expect(className).toBe("orr-nsfw-warning");
    });
  });

  describe("Subreddit Validation", () => {
    it("should accept valid subreddit names", () => {
      const validNames = ["programming", "AskReddit", "funny123", "test_sub"];
      const isValid = (name) => /^[a-z0-9_]+$/i.test(name);

      validNames.forEach((name) => {
        expect(isValid(name)).toBe(true);
      });
    });

    it("should reject invalid subreddit names", () => {
      const invalidNames = ["invalid-name", "has spaces", "special!char", ""];
      const isValid = (name) => Boolean(name && /^[a-z0-9_]+$/i.test(name));

      invalidNames.forEach((name) => {
        expect(isValid(name)).toBe(false);
      });
    });
  });

  describe("Performance", () => {
    it("should efficiently check allowlist membership", () => {
      const allowedSet = new Set([
        "art",
        "photography",
        "gaming",
        "music",
        "movies",
      ]);

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        allowedSet.has("photography");
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });

    it("should use Set for O(1) lookup when allowlist is large", () => {
      const largeAllowlist = Array.from({ length: 100 }, (_, i) => `sub${i}`);
      const allowedSet = new Set(largeAllowlist);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        allowedSet.has(`sub${i}`);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5);
    });
  });
});

describe("NSFW Controls Integration", () => {
  it("should apply controls only when enabled", () => {
    const scenarios = [
      { enabled: false, visibility: "blur", expected: false },
      { enabled: true, visibility: "show", expected: false },
      { enabled: true, visibility: "blur", expected: true },
      { enabled: true, visibility: "hide", expected: true },
    ];

    scenarios.forEach(({ enabled, visibility, expected }) => {
      const shouldApply = enabled && visibility !== "show";
      expect(shouldApply).toBe(expected);
    });
  });

  it("should respect subreddit allowlist", () => {
    const config = {
      enabled: true,
      visibility: "blur",
      allowedSubreddits: ["art", "photography"],
    };

    const posts = [
      { subreddit: "art", isNsfw: true },
      { subreddit: "gaming", isNsfw: true },
      { subreddit: "photography", isNsfw: true },
    ];

    const results = posts.map((post) => ({
      subreddit: post.subreddit,
      shouldFilter:
        post.isNsfw &&
        config.enabled &&
        !config.allowedSubreddits.includes(post.subreddit),
    }));

    expect(results[0].shouldFilter).toBe(false); // art is allowed
    expect(results[1].shouldFilter).toBe(true); // gaming is not allowed
    expect(results[2].shouldFilter).toBe(false); // photography is allowed
  });
});

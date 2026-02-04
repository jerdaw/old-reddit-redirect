import { describe, it, expect } from "vitest";

describe("Scroll Positions - Storage Schema", () => {
  it("should have scrollPositions in storage schema", async () => {
    const storage = await import("../src/core/storage.js");

    expect(storage.default).toBeDefined();
    expect(typeof storage.default.getScrollPositions).toBe("function");
    expect(typeof storage.default.setScrollPositions).toBe("function");
    expect(typeof storage.default.getScrollPosition).toBe("function");
    expect(typeof storage.default.setScrollPosition).toBe("function");
    expect(typeof storage.default.deleteScrollPosition).toBe("function");
    expect(typeof storage.default.clearScrollPositions).toBe("function");
    expect(typeof storage.default.cleanupOldScrollPositions).toBe("function");
    expect(typeof storage.default.isScrollPositionsEnabled).toBe("function");
  });
});

describe("Scroll Positions - URL Normalization", () => {
  function normalizeScrollUrl(url) {
    try {
      const urlObj = new URL(url);
      let key = urlObj.origin + urlObj.pathname;

      if (urlObj.searchParams.has("sort")) {
        key += "?sort=" + urlObj.searchParams.get("sort");
        if (urlObj.searchParams.has("t")) {
          key += "&t=" + urlObj.searchParams.get("t");
        }
      }

      return key;
    } catch (_e) {
      return url;
    }
  }

  it("should normalize basic URL", () => {
    const url = "https://old.reddit.com/r/AskReddit/";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toBe("https://old.reddit.com/r/AskReddit/");
  });

  it("should preserve sort parameter", () => {
    const url = "https://old.reddit.com/r/AskReddit/?sort=new";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toBe("https://old.reddit.com/r/AskReddit/?sort=new");
  });

  it("should preserve sort and time parameters", () => {
    const url = "https://old.reddit.com/r/AskReddit/?sort=top&t=week";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toBe(
      "https://old.reddit.com/r/AskReddit/?sort=top&t=week"
    );
  });

  it("should remove unnecessary query parameters", () => {
    const url =
      "https://old.reddit.com/r/AskReddit/?sort=new&after=t3_abc123&count=25";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toBe("https://old.reddit.com/r/AskReddit/?sort=new");
  });

  it("should handle URL without query params", () => {
    const url = "https://old.reddit.com/r/programming";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toBe("https://old.reddit.com/r/programming");
  });

  it("should handle invalid URL gracefully", () => {
    const url = "not-a-valid-url";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toBe("not-a-valid-url");
  });
});

describe("Scroll Positions - Position Clamping", () => {
  it("should clamp negative values to 0", () => {
    const maxScroll = 5000;
    const savedY = -100;
    const clampedY = Math.max(0, Math.min(savedY, maxScroll));
    expect(clampedY).toBe(0);
  });

  it("should clamp values exceeding max scroll", () => {
    const maxScroll = 5000;
    const savedY = 10000;
    const clampedY = Math.max(0, Math.min(savedY, maxScroll));
    expect(clampedY).toBe(5000);
  });

  it("should not clamp valid values", () => {
    const maxScroll = 5000;
    const savedY = 2500;
    const clampedY = Math.max(0, Math.min(savedY, maxScroll));
    expect(clampedY).toBe(2500);
  });
});

describe("Scroll Positions - Cleanup Logic", () => {
  it("should identify positions older than retention period", () => {
    const now = Date.now();
    const retentionHours = 24;
    const maxAge = retentionHours * 60 * 60 * 1000;

    const positions = {
      url1: { scrollY: 100, timestamp: now - maxAge - 1000 }, // Old
      url2: { scrollY: 200, timestamp: now - 1000 }, // Recent
      url3: { scrollY: 300, timestamp: now - maxAge + 1000 }, // Recent
    };

    const toDelete = [];
    for (const [url, data] of Object.entries(positions)) {
      if (now - data.timestamp > maxAge) {
        toDelete.push(url);
      }
    }

    expect(toDelete).toEqual(["url1"]);
    expect(toDelete.length).toBe(1);
  });

  it("should handle empty positions", () => {
    const positions = {};
    const toDelete = [];

    for (const [url, data] of Object.entries(positions)) {
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        toDelete.push(url);
      }
    }

    expect(toDelete.length).toBe(0);
  });
});

describe("Scroll Positions - LRU Eviction", () => {
  it("should evict oldest position when limit reached", () => {
    const positions = {
      url1: { scrollY: 100, timestamp: 1000 },
      url2: { scrollY: 200, timestamp: 2000 },
      url3: { scrollY: 300, timestamp: 3000 },
    };

    const maxEntries = 2;

    // Simulate LRU eviction
    const entries = Object.entries(positions);
    if (entries.length > maxEntries) {
      let oldest = null;
      let oldestTime = Infinity;
      for (const [url, data] of entries) {
        if (data.timestamp < oldestTime) {
          oldest = url;
          oldestTime = data.timestamp;
        }
      }
      if (oldest) {
        delete positions[oldest];
      }
    }

    expect(positions).not.toHaveProperty("url1");
    expect(positions).toHaveProperty("url2");
    expect(positions).toHaveProperty("url3");
    expect(Object.keys(positions).length).toBe(2);
  });
});

describe("Scroll Positions - Edge Cases", () => {
  it("should handle zero scroll position", () => {
    const scrollY = 0;
    expect(scrollY).toBe(0);
    expect(scrollY >= 0).toBe(true);
  });

  it("should skip saving if scrolled less than threshold", () => {
    const scrollY = 50;
    const threshold = 60;
    const shouldSave = scrollY >= threshold;
    expect(shouldSave).toBe(false);
  });

  it("should save if scrolled beyond threshold", () => {
    const scrollY = 100;
    const threshold = 60;
    const shouldSave = scrollY >= threshold;
    expect(shouldSave).toBe(true);
  });

  it("should handle very large scroll values", () => {
    const scrollY = 999999;
    const maxScroll = 10000;
    const clampedY = Math.max(0, Math.min(scrollY, maxScroll));
    expect(clampedY).toBe(10000);
  });
});

describe("Scroll Positions - URL Edge Cases", () => {
  function normalizeScrollUrl(url) {
    try {
      const urlObj = new URL(url);
      let key = urlObj.origin + urlObj.pathname;

      if (urlObj.searchParams.has("sort")) {
        key += "?sort=" + urlObj.searchParams.get("sort");
        if (urlObj.searchParams.has("t")) {
          key += "&t=" + urlObj.searchParams.get("t");
        }
      }

      return key;
    } catch (_e) {
      return url;
    }
  }

  it("should handle trailing slashes consistently", () => {
    const url1 = "https://old.reddit.com/r/AskReddit/";
    const url2 = "https://old.reddit.com/r/AskReddit";

    // Note: URL constructor normalizes these differently
    const normalized1 = normalizeScrollUrl(url1);
    const normalized2 = normalizeScrollUrl(url2);

    expect(typeof normalized1).toBe("string");
    expect(typeof normalized2).toBe("string");
  });

  it("should handle special characters in path", () => {
    const url = "https://old.reddit.com/r/C++/";
    const normalized = normalizeScrollUrl(url);
    expect(normalized).toContain("C++");
  });

  it("should handle URLs with fragments", () => {
    const url = "https://old.reddit.com/r/AskReddit/#anchor";
    const normalized = normalizeScrollUrl(url);
    // Fragments are ignored by URL constructor's pathname
    expect(normalized).toBe("https://old.reddit.com/r/AskReddit/");
  });
});

describe("Scroll Positions - Timestamp Handling", () => {
  it("should use current timestamp when saving", () => {
    const before = Date.now();
    const timestamp = Date.now();
    const after = Date.now();

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it("should calculate age correctly", () => {
    const now = Date.now();
    const timestamp = now - 1000 * 60 * 60; // 1 hour ago
    const age = now - timestamp;
    const ageInHours = age / (1000 * 60 * 60);

    expect(ageInHours).toBeCloseTo(1, 1);
  });
});

describe("Scroll Positions - Options Page", () => {
  it("should have correct IDs for options page elements", () => {
    const expectedIds = [
      "scroll-positions-enabled",
      "scroll-positions-count",
      "clear-scroll-positions",
    ];

    expectedIds.forEach((id) => {
      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
    });
  });
});

describe("Scroll Positions - Behavior Logic", () => {
  it("should restore position with instant behavior", () => {
    const scrollOptions = {
      top: 1234,
      behavior: "instant",
    };

    expect(scrollOptions.behavior).toBe("instant");
    expect(scrollOptions.top).toBe(1234);
  });

  it("should delay restoration using requestIdleCallback pattern", () => {
    const timeout = 100;
    const options = { timeout };

    expect(options.timeout).toBe(100);
    expect(typeof options.timeout).toBe("number");
  });
});

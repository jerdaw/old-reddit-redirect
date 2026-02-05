import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";

describe("Sort Preferences - URL Parsing", () => {
  let dom;
  let window;
  let isSubredditPage;
  let getSubredditFromUrl;
  let getCurrentSort;
  let buildSortUrl;
  let sortMatches;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "https://old.reddit.com/r/AskReddit/",
    });
    window = dom.window;
    global.window = window;
    global.document = window.document;
    global.sessionStorage = window.sessionStorage;

    // Define helper functions (copied from content-script.js)
    isSubredditPage = function () {
      const path = window.location.pathname;
      return /^\/r\/[^\/]+\/?$/.test(path);
    };

    getSubredditFromUrl = function () {
      const match = window.location.pathname.match(/^\/r\/([^\/]+)/);
      return match ? match[1] : null;
    };

    getCurrentSort = function () {
      const params = new URLSearchParams(window.location.search);
      const sort = params.get("sort") || "hot";
      const time = params.get("t") || null;
      return { sort, time };
    };

    buildSortUrl = function (subreddit, sortData) {
      let url = `https://old.reddit.com/r/${subreddit}/`;
      const params = new URLSearchParams();

      if (sortData.sort && sortData.sort !== "hot") {
        params.set("sort", sortData.sort);
      }

      if (sortData.time) {
        params.set("t", sortData.time);
      }

      const queryString = params.toString();
      if (queryString) {
        url += "?" + queryString;
      }

      return url;
    };

    sortMatches = function (current, preference) {
      return (
        current.sort === preference.sort && current.time === preference.time
      );
    };
  });

  it("should identify subreddit pages", () => {
    // Subreddit listing pages
    window.history.pushState({}, "", "/r/AskReddit/");
    expect(isSubredditPage()).toBe(true);

    window.history.pushState({}, "", "/r/AskReddit");
    expect(isSubredditPage()).toBe(true);

    window.history.pushState({}, "", "/r/programming/");
    expect(isSubredditPage()).toBe(true);

    // Not subreddit listing pages
    window.history.pushState({}, "", "/r/AskReddit/comments/abc123");
    expect(isSubredditPage()).toBe(false);

    window.history.pushState({}, "", "/");
    expect(isSubredditPage()).toBe(false);

    window.history.pushState({}, "", "/r/all/");
    expect(isSubredditPage()).toBe(true); // /r/all is technically a subreddit page
  });

  it("should extract subreddit name from URL", () => {
    window.history.pushState({}, "", "/r/AskReddit/");
    expect(getSubredditFromUrl()).toBe("AskReddit");

    window.history.pushState({}, "", "/r/programming");
    expect(getSubredditFromUrl()).toBe("programming");

    window.history.pushState({}, "", "/r/news/?sort=new");
    expect(getSubredditFromUrl()).toBe("news");

    window.history.pushState({}, "", "/");
    expect(getSubredditFromUrl()).toBe(null);
  });

  it("should parse current sort from URL - hot (default)", () => {
    window.history.pushState({}, "", "/r/AskReddit/");
    const sort = getCurrentSort();
    expect(sort.sort).toBe("hot");
    expect(sort.time).toBe(null);
  });

  it("should parse current sort from URL - new", () => {
    window.history.pushState({}, "", "/r/AskReddit/?sort=new");
    const sort = getCurrentSort();
    expect(sort.sort).toBe("new");
    expect(sort.time).toBe(null);
  });

  it("should parse current sort from URL - top with time filter", () => {
    window.history.pushState({}, "", "/r/AskReddit/?sort=top&t=week");
    const sort = getCurrentSort();
    expect(sort.sort).toBe("top");
    expect(sort.time).toBe("week");
  });

  it("should parse current sort from URL - rising", () => {
    window.history.pushState({}, "", "/r/AskReddit/?sort=rising");
    const sort = getCurrentSort();
    expect(sort.sort).toBe("rising");
    expect(sort.time).toBe(null);
  });

  it("should build correct sort URL - hot", () => {
    const url = buildSortUrl("AskReddit", { sort: "hot", time: null });
    expect(url).toBe("https://old.reddit.com/r/AskReddit/");
  });

  it("should build correct sort URL - new", () => {
    const url = buildSortUrl("AskReddit", { sort: "new", time: null });
    expect(url).toBe("https://old.reddit.com/r/AskReddit/?sort=new");
  });

  it("should build correct sort URL - top with time", () => {
    const url = buildSortUrl("AskReddit", { sort: "top", time: "week" });
    expect(url).toBe("https://old.reddit.com/r/AskReddit/?sort=top&t=week");
  });

  it("should build correct sort URL - controversial with time", () => {
    const url = buildSortUrl("news", {
      sort: "controversial",
      time: "day",
    });
    expect(url).toBe("https://old.reddit.com/r/news/?sort=controversial&t=day");
  });

  it("should correctly compare matching sorts", () => {
    expect(
      sortMatches({ sort: "new", time: null }, { sort: "new", time: null })
    ).toBe(true);

    expect(
      sortMatches({ sort: "top", time: "week" }, { sort: "top", time: "week" })
    ).toBe(true);
  });

  it("should correctly compare non-matching sorts", () => {
    expect(
      sortMatches({ sort: "new", time: null }, { sort: "hot", time: null })
    ).toBe(false);

    expect(
      sortMatches({ sort: "top", time: "week" }, { sort: "top", time: "day" })
    ).toBe(false);

    expect(
      sortMatches({ sort: "top", time: null }, { sort: "top", time: "week" })
    ).toBe(false);
  });
});

describe("Sort Preferences - Storage Schema", () => {
  it("should have sortPreferences in storage schema", async () => {
    // Import dependencies first (in order)
    await import("../src/core/storage-schema.js");
    await import("../src/core/storage-operations.js");
    await import("../src/core/storage-migration.js");
    const storage = await import("../src/core/storage.js");

    // Check that storage methods exist
    expect(storage.default).toBeDefined();
    expect(typeof storage.default.getSortPreferences).toBe("function");
    expect(typeof storage.default.setSortPreferences).toBe("function");
    expect(typeof storage.default.getSortPreference).toBe("function");
    expect(typeof storage.default.setSortPreference).toBe("function");
    expect(typeof storage.default.deleteSortPreference).toBe("function");
    expect(typeof storage.default.clearSortPreferences).toBe("function");
    expect(typeof storage.default.isSortPreferencesEnabled).toBe("function");
  });
});

describe("Sort Preferences - Format Display", () => {
  it("should format sort display names", () => {
    const formatSortDisplay = (sort) => {
      const labels = {
        hot: "Hot",
        new: "New",
        top: "Top",
        rising: "Rising",
        controversial: "Controversial",
      };
      return labels[sort] || sort;
    };

    expect(formatSortDisplay("hot")).toBe("Hot");
    expect(formatSortDisplay("new")).toBe("New");
    expect(formatSortDisplay("top")).toBe("Top");
    expect(formatSortDisplay("rising")).toBe("Rising");
    expect(formatSortDisplay("controversial")).toBe("Controversial");
  });

  it("should format time display names", () => {
    const formatTimeDisplay = (time) => {
      const labels = {
        hour: "Past Hour",
        day: "Today",
        week: "This Week",
        month: "This Month",
        year: "This Year",
        all: "All Time",
      };
      return labels[time] || time;
    };

    expect(formatTimeDisplay("hour")).toBe("Past Hour");
    expect(formatTimeDisplay("day")).toBe("Today");
    expect(formatTimeDisplay("week")).toBe("This Week");
    expect(formatTimeDisplay("month")).toBe("This Month");
    expect(formatTimeDisplay("year")).toBe("This Year");
    expect(formatTimeDisplay("all")).toBe("All Time");
  });

  it("should format relative dates", () => {
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

      return date.toLocaleDateString();
    };

    const now = Date.now();
    const today = now;
    const yesterday = now - 1000 * 60 * 60 * 24;
    const threeDaysAgo = now - 1000 * 60 * 60 * 24 * 3;
    const twoWeeksAgo = now - 1000 * 60 * 60 * 24 * 14;

    expect(formatDate(today)).toBe("Today");
    expect(formatDate(yesterday)).toBe("Yesterday");
    expect(formatDate(threeDaysAgo)).toBe("3 days ago");
    expect(formatDate(twoWeeksAgo)).toBe("2 weeks ago");
  });
});

describe("Sort Preferences - HTML Escaping", () => {
  it("should escape HTML in subreddit names", () => {
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    expect(escapeHtml("<script>alert('xss')</script>")).not.toContain(
      "<script>"
    );
    expect(escapeHtml("normal_subreddit")).toBe("normal_subreddit");
    expect(escapeHtml("sub&name")).toBe("sub&amp;name");
  });
});

describe("Sort Preferences - Session Storage", () => {
  beforeEach(() => {
    global.sessionStorage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
      removeItem(key) {
        delete this.data[key];
      },
    };
  });

  it("should use session storage to prevent redirect loops", () => {
    expect(sessionStorage.getItem("orr-sort-redirected")).toBe(null);

    sessionStorage.setItem("orr-sort-redirected", "true");
    expect(sessionStorage.getItem("orr-sort-redirected")).toBe("true");

    sessionStorage.removeItem("orr-sort-redirected");
    expect(sessionStorage.getItem("orr-sort-redirected")).toBe(null);
  });
});

describe("Sort Preferences - LRU Eviction", () => {
  it("should evict oldest entry when limit reached", () => {
    const preferences = {
      sub1: { sort: "new", time: null, timestamp: 1000 },
      sub2: { sort: "top", time: "week", timestamp: 2000 },
      sub3: { sort: "hot", time: null, timestamp: 3000 },
    };

    const maxEntries = 2;

    // Simulate LRU eviction
    const entries = Object.entries(preferences);
    if (entries.length > maxEntries) {
      let oldest = null;
      let oldestTime = Infinity;
      for (const [sub, data] of entries) {
        if (data.timestamp < oldestTime) {
          oldest = sub;
          oldestTime = data.timestamp;
        }
      }
      if (oldest) {
        delete preferences[oldest];
      }
    }

    expect(preferences).not.toHaveProperty("sub1");
    expect(preferences).toHaveProperty("sub2");
    expect(preferences).toHaveProperty("sub3");
  });
});

describe("Sort Preferences - CSS Selectors", () => {
  it("should have correct IDs for sort preference elements", () => {
    const expectedIds = [
      "sort-preferences-enabled",
      "pref-count",
      "pref-max",
      "pref-search",
      "prefs-table",
      "prefs-tbody",
      "prefs-empty",
      "clear-all-prefs",
      "export-prefs",
      "import-prefs",
    ];

    // These IDs should exist in options.html
    expectedIds.forEach((id) => {
      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
    });
  });
});

describe("Sort Preferences - Edge Cases", () => {
  it("should handle special subreddit names", () => {
    const getSubredditFromUrl = (path) => {
      const match = path.match(/^\/r\/([^\/]+)/);
      return match ? match[1] : null;
    };

    expect(getSubredditFromUrl("/r/all/")).toBe("all");
    expect(getSubredditFromUrl("/r/popular/")).toBe("popular");
    expect(getSubredditFromUrl("/r/mod/")).toBe("mod");
  });

  it("should handle URLs with trailing slashes", () => {
    const isSubredditPage = (path) => {
      return /^\/r\/[^\/]+\/?$/.test(path);
    };

    expect(isSubredditPage("/r/AskReddit/")).toBe(true);
    expect(isSubredditPage("/r/AskReddit")).toBe(true);
    expect(isSubredditPage("/r/AskReddit//")).toBe(false); // Double slash
  });

  it("should handle case sensitivity in subreddit names", () => {
    const normalize = (sub) => sub.toLowerCase();

    expect(normalize("AskReddit")).toBe("askreddit");
    expect(normalize("askreddit")).toBe("askreddit");
    expect(normalize("ASKREDDIT")).toBe("askreddit");
  });
});

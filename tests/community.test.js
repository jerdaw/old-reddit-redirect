import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addSubscription,
  getSubscriptions,
  removeSubscription,
} from "../modules/community/subscriptions.js";
import { openIssueReporter } from "../modules/community/issue-reporter.js";
import { startDomMonitor } from "../modules/devtools/dom-monitor.js";

// Mock chrome storage
const storageMock = new Map();
global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        if (keys === null)
          return Promise.resolve(Object.fromEntries(storageMock));
        if (typeof keys === "string")
          return Promise.resolve({ [keys]: storageMock.get(keys) });
        const result = {};
        Object.keys(keys).forEach(
          (k) => (result[k] = storageMock.get(k) || keys[k])
        );
        return Promise.resolve(result);
      }),
      set: vi.fn((items) => {
        Object.entries(items).forEach(([k, v]) => storageMock.set(k, v));
        return Promise.resolve();
      }),
    },
  },
};

// Mock fetch
global.fetch = vi.fn();
// Mock crypto
Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => "test-uuid" },
  writable: true,
});
// Mock window.open
global.window.open = vi.fn();

describe("Community Features", () => {
  beforeEach(() => {
    storageMock.clear();
    vi.clearAllMocks();
  });

  describe("Subscriptions Module", () => {
    it("should add a valid subscription", async () => {
      const mockList = {
        type: "orr-list",
        contentType: "keywords",
        metadata: { name: "Test List", author: "Tester" },
        items: ["spoiler"],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockList,
      });

      const sub = await addSubscription("https://example.com/list.json");

      expect(sub.name).toBe("Test List");
      expect(chrome.storage.local.set).toHaveBeenCalled();

      const stored = await getSubscriptions();
      expect(stored).toHaveLength(1);
      expect(stored[0].url).toBe("https://example.com/list.json");
      expect(stored[0].appliedItems).toEqual(["spoiler"]);
      expect(storageMock.get("contentFiltering")?.mutedKeywords).toEqual([
        "spoiler",
      ]);
    });

    it("should reject invalid lists", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ type: "invalid" }),
      });

      await expect(addSubscription("https://bad.com")).rejects.toThrow(
        "Invalid list format"
      );
    });

    it("should reject invalid content types", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: "orr-list",
          contentType: "invalid-type",
          metadata: { name: "Bad Type" },
          items: ["a"],
        }),
      });

      await expect(addSubscription("https://bad-type.com")).rejects.toThrow(
        "Invalid list content type"
      );
    });

    it("should normalize and merge subreddit subscriptions", async () => {
      storageMock.set("subredditOverrides", { mutedSubreddits: ["existing"] });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: "orr-list",
          contentType: "subreddits",
          metadata: { name: "Sub List", author: "Tester" },
          items: ["r/News", "NEWS", "askreddit", "bad-name!"],
        }),
      });

      const sub = await addSubscription("https://example.com/subs.json");
      expect(sub.appliedItems).toEqual(["news", "askreddit"]);
      expect(storageMock.get("subredditOverrides").mutedSubreddits).toEqual([
        "askreddit",
        "existing",
        "news",
      ]);
    });

    it("should normalize and merge domain subscriptions", async () => {
      storageMock.set("contentFiltering", { mutedDomains: ["example.com"] });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: "orr-list",
          contentType: "domains",
          metadata: { name: "Domain List", author: "Tester" },
          items: ["https://www.foo.com/", "foo.com", "Bar.net"],
        }),
      });

      const sub = await addSubscription("https://example.com/domains.json");
      expect(sub.appliedItems).toEqual(["foo.com", "bar.net"]);
      expect(storageMock.get("contentFiltering").mutedDomains).toEqual([
        "bar.net",
        "example.com",
        "foo.com",
      ]);
    });

    it("should preserve community metadata when saving subscriptions", async () => {
      storageMock.set("community", {
        subscriptions: [],
        contributions: [{ id: "c1" }],
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: "orr-list",
          contentType: "keywords",
          metadata: { name: "Meta List", author: "Tester" },
          items: ["meta"],
        }),
      });

      await addSubscription("https://example.com/meta.json");
      expect(storageMock.get("community").contributions).toEqual([
        { id: "c1" },
      ]);
      expect(storageMock.get("community").subscriptions).toHaveLength(1);
    });

    it("should remove subscription", async () => {
      // Setup initial state
      storageMock.set("community", {
        subscriptions: [{ id: "test-uuid", name: "Test" }],
        contributions: [{ id: "c1" }],
      });

      await removeSubscription("test-uuid");

      const stored = await getSubscriptions();
      expect(stored).toHaveLength(0);
      expect(storageMock.get("community").contributions).toEqual([
        { id: "c1" },
      ]);
    });
  });

  describe("Issue Reporter", () => {
    it("should open correct URL for bugs", () => {
      openIssueReporter("bug");
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("labels=bug"),
        "_blank"
      );
    });

    it("should open correct URL for selectors", () => {
      openIssueReporter("selector", {
        url: "http://test.com",
        pageType: "Reddit",
      });
      const call = window.open.mock.calls[0][0];
      expect(call).toContain("labels=broken-selector");
      expect(call).toContain(encodeURIComponent("http://test.com"));
      expect(call).toContain("Reddit");
    });
  });

  describe("DOM Monitor", () => {
    it("should not start on non-reddit pages", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "google.com" },
        writable: true,
      });

      startDomMonitor();
      // No easy way to check internal state without exporting more,
      // but we can check console behavior or verify no errors.
      // For now just ensuring it doesn't crash.
    });
  });
});

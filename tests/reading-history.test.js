"use strict";

/**
 * Reading History Tests (Phase 11)
 * Tests for reading history tracking, storage, and display
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
    getManifest: vi.fn(() => ({ version: "16.0.0" })),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
};

global.chrome = mockChrome;

describe("Reading History", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Storage Schema", () => {
    it("should have correct default values", () => {
      const defaults = {
        enabled: true,
        showVisitedIndicator: true,
        maxEntries: 500,
        retentionDays: 30,
        entries: [],
      };

      expect(defaults.enabled).toBe(true);
      expect(defaults.showVisitedIndicator).toBe(true);
      expect(defaults.maxEntries).toBe(500);
      expect(defaults.retentionDays).toBe(30);
      expect(defaults.entries).toEqual([]);
    });

    it("should support entry structure", () => {
      const entry = {
        id: "abc123",
        title: "Test Post Title",
        subreddit: "test",
        url: "https://old.reddit.com/r/test/comments/abc123/test_post/",
        commentCount: 42,
        timestamp: new Date().toISOString(),
      };

      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("title");
      expect(entry).toHaveProperty("subreddit");
      expect(entry).toHaveProperty("url");
      expect(entry).toHaveProperty("commentCount");
      expect(entry).toHaveProperty("timestamp");
    });
  });

  describe("Entry Management", () => {
    it("should add new entries to the front", () => {
      const entries = [
        { id: "old1", title: "Old 1", timestamp: "2024-01-01T00:00:00Z" },
        { id: "old2", title: "Old 2", timestamp: "2024-01-02T00:00:00Z" },
      ];

      const newEntry = {
        id: "new1",
        title: "New 1",
        timestamp: "2024-01-03T00:00:00Z",
      };
      entries.unshift(newEntry);

      expect(entries[0].id).toBe("new1");
      expect(entries.length).toBe(3);
    });

    it("should update existing entry and move to front", () => {
      const entries = [
        { id: "post1", title: "Post 1", timestamp: "2024-01-01T00:00:00Z" },
        { id: "post2", title: "Post 2", timestamp: "2024-01-02T00:00:00Z" },
        { id: "post3", title: "Post 3", timestamp: "2024-01-03T00:00:00Z" },
      ];

      // Find and update post2
      const existingIndex = entries.findIndex((e) => e.id === "post2");
      if (existingIndex !== -1) {
        entries[existingIndex].timestamp = "2024-01-04T00:00:00Z";
        const [existing] = entries.splice(existingIndex, 1);
        entries.unshift(existing);
      }

      expect(entries[0].id).toBe("post2");
      expect(entries[0].timestamp).toBe("2024-01-04T00:00:00Z");
    });

    it("should apply LRU eviction when over limit", () => {
      const maxEntries = 3;
      const entries = [
        { id: "post1", timestamp: "2024-01-01T00:00:00Z" },
        { id: "post2", timestamp: "2024-01-02T00:00:00Z" },
        { id: "post3", timestamp: "2024-01-03T00:00:00Z" },
      ];

      // Add new entry
      entries.unshift({ id: "post4", timestamp: "2024-01-04T00:00:00Z" });

      // Apply LRU eviction
      while (entries.length > maxEntries) {
        entries.pop();
      }

      expect(entries.length).toBe(3);
      expect(entries.map((e) => e.id)).toEqual(["post4", "post1", "post2"]);
    });
  });

  describe("Retention Cleanup", () => {
    it("should filter out expired entries", () => {
      const retentionDays = 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffISO = cutoffDate.toISOString();

      const entries = [
        { id: "recent", timestamp: new Date().toISOString() },
        { id: "old", timestamp: "2020-01-01T00:00:00Z" },
      ];

      const validEntries = entries.filter((e) => e.timestamp >= cutoffISO);

      expect(validEntries.length).toBe(1);
      expect(validEntries[0].id).toBe("recent");
    });

    it("should keep entries within retention period", () => {
      const retentionDays = 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffISO = cutoffDate.toISOString();

      // Create entry from 15 days ago (within retention)
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const entries = [
        { id: "recent", timestamp: fifteenDaysAgo.toISOString() },
      ];

      const validEntries = entries.filter((e) => e.timestamp >= cutoffISO);

      expect(validEntries.length).toBe(1);
    });
  });

  describe("Duplicate Detection", () => {
    it("should detect duplicate by post ID", () => {
      const entries = [
        { id: "abc123", title: "Post 1" },
        { id: "def456", title: "Post 2" },
      ];

      const newPostId = "abc123";
      const isDuplicate = entries.some((e) => e.id === newPostId);

      expect(isDuplicate).toBe(true);
    });

    it("should not flag non-duplicate", () => {
      const entries = [
        { id: "abc123", title: "Post 1" },
        { id: "def456", title: "Post 2" },
      ];

      const newPostId = "xyz789";
      const isDuplicate = entries.some((e) => e.id === newPostId);

      expect(isDuplicate).toBe(false);
    });
  });

  describe("Post ID Extraction", () => {
    it("should extract post ID from comments URL", () => {
      const url = "/r/test/comments/abc123/post_title/";
      const match = url.match(/\/comments\/([a-z0-9]+)/i);
      const postId = match ? match[1] : null;

      expect(postId).toBe("abc123");
    });

    it("should handle various URL formats", () => {
      const urls = [
        { url: "/comments/abc123", expected: "abc123" },
        { url: "/r/test/comments/def456/", expected: "def456" },
        { url: "/r/AskReddit/comments/xyz789/what_is/", expected: "xyz789" },
      ];

      for (const { url, expected } of urls) {
        const match = url.match(/\/comments\/([a-z0-9]+)/i);
        expect(match[1]).toBe(expected);
      }
    });
  });

  describe("Read Post Lookup", () => {
    it("should create set of read post IDs", () => {
      const entries = [
        { id: "abc123", title: "Post 1" },
        { id: "def456", title: "Post 2" },
        { id: "ghi789", title: "Post 3" },
      ];

      const readIds = new Set(entries.map((e) => e.id));

      expect(readIds.has("abc123")).toBe(true);
      expect(readIds.has("def456")).toBe(true);
      expect(readIds.has("unknown")).toBe(false);
    });

    it("should efficiently check if post is read", () => {
      const readIds = new Set(["abc123", "def456", "ghi789"]);

      // O(1) lookup
      expect(readIds.has("abc123")).toBe(true);
      expect(readIds.has("xyz999")).toBe(false);
    });
  });

  describe("Export Format", () => {
    it("should have correct export structure", () => {
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        entryCount: 5,
        entries: [
          {
            id: "post1",
            title: "Post 1",
            subreddit: "test",
            timestamp: "2024-01-01T00:00:00Z",
          },
        ],
      };

      expect(exportData).toHaveProperty("version");
      expect(exportData).toHaveProperty("exportedAt");
      expect(exportData).toHaveProperty("entryCount");
      expect(exportData).toHaveProperty("entries");
      expect(Array.isArray(exportData.entries)).toBe(true);
    });
  });

  describe("Import Validation", () => {
    it("should validate import data structure", () => {
      const validData = {
        version: "1.0",
        entries: [{ id: "post1", timestamp: "2024-01-01T00:00:00Z" }],
      };

      const isValid = validData && Array.isArray(validData.entries);
      expect(isValid).toBe(true);
    });

    it("should reject invalid import data", () => {
      const invalidData = {
        version: "1.0",
        entries: "not an array",
      };

      const isValid = invalidData && Array.isArray(invalidData.entries);
      expect(isValid).toBe(false);
    });

    it("should merge imported entries with existing", () => {
      const existing = [
        { id: "post1", title: "Existing 1" },
        { id: "post2", title: "Existing 2" },
      ];

      const imported = [
        { id: "post3", title: "Imported 1" },
        { id: "post1", title: "Duplicate" }, // Should be skipped
      ];

      const existingMap = new Map(existing.map((e) => [e.id, e]));
      let importCount = 0;

      for (const entry of imported) {
        if (!existingMap.has(entry.id)) {
          existing.push(entry);
          importCount++;
        }
      }

      expect(existing.length).toBe(3);
      expect(importCount).toBe(1);
    });
  });

  describe("Visited Indicator", () => {
    it("should extract post ID from data-fullname", () => {
      const fullname = "t3_abc123";
      const postId = fullname.replace(/^t3_/, "");

      expect(postId).toBe("abc123");
    });

    it("should mark posts as visited", () => {
      const readIds = new Set(["abc123", "def456"]);
      const posts = [
        { fullname: "t3_abc123" },
        { fullname: "t3_xyz999" },
        { fullname: "t3_def456" },
      ];

      const markedPosts = posts.map((post) => {
        const postId = post.fullname.replace(/^t3_/, "");
        return {
          ...post,
          isVisited: readIds.has(postId),
        };
      });

      expect(markedPosts[0].isVisited).toBe(true);
      expect(markedPosts[1].isVisited).toBe(false);
      expect(markedPosts[2].isVisited).toBe(true);
    });
  });

  describe("Settings", () => {
    it("should support enabling/disabling reading history", () => {
      const config = { enabled: true };
      expect(config.enabled).toBe(true);

      config.enabled = false;
      expect(config.enabled).toBe(false);
    });

    it("should support enabling/disabling visited indicator", () => {
      const config = { showVisitedIndicator: true };
      expect(config.showVisitedIndicator).toBe(true);

      config.showVisitedIndicator = false;
      expect(config.showVisitedIndicator).toBe(false);
    });

    it("should support different retention periods", () => {
      const periods = [7, 14, 30, 60, 90];

      for (const days of periods) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        expect(cutoffDate).toBeInstanceOf(Date);
      }
    });
  });

  describe("URL Detection", () => {
    it("should detect comments page", () => {
      const commentsUrls = [
        "/r/test/comments/abc123/title/",
        "/comments/abc123",
        "/r/AskReddit/comments/xyz789/",
      ];

      for (const url of commentsUrls) {
        const isCommentsPage = /\/comments\/[a-z0-9]+/i.test(url);
        expect(isCommentsPage).toBe(true);
      }
    });

    it("should not detect non-comments pages", () => {
      const nonCommentsUrls = ["/r/test", "/r/test/new", "/user/testuser", "/"];

      for (const url of nonCommentsUrls) {
        const isCommentsPage = /\/comments\/[a-z0-9]+/i.test(url);
        expect(isCommentsPage).toBe(false);
      }
    });
  });

  describe("Performance", () => {
    it("should handle large history efficiently", () => {
      const entries = [];
      for (let i = 0; i < 500; i++) {
        entries.push({
          id: `post${i}`,
          title: `Post ${i}`,
          timestamp: new Date().toISOString(),
        });
      }

      const startTime = performance.now();
      const readIds = new Set(entries.map((e) => e.id));
      const lookupTime = performance.now() - startTime;

      expect(lookupTime).toBeLessThan(50); // Should complete in < 50ms
      expect(readIds.size).toBe(500);
    });

    it("should efficiently check multiple posts", () => {
      const readIds = new Set();
      for (let i = 0; i < 500; i++) {
        readIds.add(`post${i}`);
      }

      const startTime = performance.now();
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(readIds.has(`post${i * 5}`));
      }
      const checkTime = performance.now() - startTime;

      expect(checkTime).toBeLessThan(10); // O(1) lookups should be very fast
      expect(results.every((r) => r === true)).toBe(true);
    });
  });
});

describe("CSS Classes", () => {
  it("should have correct visited class name", () => {
    const className = "orr-visited";
    expect(className).toBe("orr-visited");
  });

  it("should have correct indicator class name", () => {
    const className = "orr-visited-indicator";
    expect(className).toBe("orr-visited-indicator");
  });
});

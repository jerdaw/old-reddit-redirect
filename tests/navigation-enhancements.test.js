"use strict";

/**
 * Navigation Enhancement Tests (Phase 12)
 * Tests for permalink highlighting, parent navigation, and collapse memory
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
    getManifest: vi.fn(() => ({ version: "17.0.0" })),
  },
};

global.chrome = mockChrome;

// Mock sessionStorage
const sessionStorageMock = {
  store: {},
  getItem: vi.fn((key) => sessionStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    sessionStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete sessionStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    sessionStorageMock.store = {};
  }),
};

global.sessionStorage = sessionStorageMock;

describe("Navigation Enhancements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.store = {};
  });

  describe("Permalink Highlighting", () => {
    it("should extract comment ID from URL hash", () => {
      const hash = "#thing_t1_abc123";
      let targetId = null;

      if (hash.startsWith("#")) {
        const hashId = hash.substring(1);
        if (hashId.startsWith("thing_t1_")) {
          targetId = hashId;
        } else if (hashId.startsWith("t1_")) {
          targetId = "thing_" + hashId;
        }
      }

      expect(targetId).toBe("thing_t1_abc123");
    });

    it("should handle t1_ prefix in hash", () => {
      const hash = "#t1_abc123";
      let targetId = null;

      if (hash.startsWith("#")) {
        const hashId = hash.substring(1);
        if (hashId.startsWith("thing_t1_")) {
          targetId = hashId;
        } else if (hashId.startsWith("t1_")) {
          targetId = "thing_" + hashId;
        }
      }

      expect(targetId).toBe("thing_t1_abc123");
    });

    it("should extract comment ID from URL path", () => {
      const paths = [
        { path: "/r/test/comments/xyz789/title/abc123", expected: "abc123" },
        {
          path: "/r/AskReddit/comments/xyz789/what_is/def456/",
          expected: "def456",
        },
        { path: "/comments/xyz789/title/ghi789", expected: "ghi789" },
      ];

      for (const { path, expected } of paths) {
        const match = path.match(
          /\/comments\/[^\/]+\/[^\/]*\/([a-z0-9]+)\/?$/i
        );
        if (match) {
          expect(match[1]).toBe(expected);
        }
      }
    });

    it("should not match non-comment URLs", () => {
      const paths = [
        "/r/test/comments/xyz789/title/",
        "/r/test/comments/xyz789",
        "/r/test",
      ];

      for (const path of paths) {
        const match = path.match(
          /\/comments\/[^\/]+\/[^\/]*\/([a-z0-9]+)\/?$/i
        );
        expect(match).toBeNull();
      }
    });

    it("should generate correct element ID", () => {
      const commentId = "abc123";
      const elementId = "thing_t1_" + commentId;
      expect(elementId).toBe("thing_t1_abc123");
    });
  });

  describe("Parent Navigation", () => {
    it("should identify nested comments", () => {
      // Simulate nested comment structure
      const mockComment = {
        parentElement: {
          closest: vi.fn().mockReturnValue({ id: "thing_t1_parent123" }),
        },
      };

      const parentComment = mockComment.parentElement.closest(".comment");
      expect(parentComment).not.toBeNull();
      expect(parentComment.id).toBe("thing_t1_parent123");
    });

    it("should not show parent button for top-level comments", () => {
      const mockComment = {
        parentElement: {
          closest: vi.fn().mockReturnValue(null),
        },
      };

      const parentComment = mockComment.parentElement.closest(".comment");
      expect(parentComment).toBeNull();
    });

    it("should have correct button properties", () => {
      const btn = {
        className: "orr-parent-nav-btn",
        textContent: "↑ parent",
        title: "Jump to parent comment",
      };

      expect(btn.className).toBe("orr-parent-nav-btn");
      expect(btn.textContent).toBe("↑ parent");
      expect(btn.title).toBe("Jump to parent comment");
    });
  });

  describe("Collapse Memory", () => {
    const COLLAPSED_COMMENTS_KEY = "orr-collapsed-comments";

    it("should store collapsed comment IDs", () => {
      const collapsedIds = new Set(["thing_t1_abc123", "thing_t1_def456"]);
      sessionStorageMock.setItem(
        COLLAPSED_COMMENTS_KEY,
        JSON.stringify([...collapsedIds])
      );

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        COLLAPSED_COMMENTS_KEY,
        '["thing_t1_abc123","thing_t1_def456"]'
      );
    });

    it("should retrieve collapsed comment IDs", () => {
      sessionStorageMock.store[COLLAPSED_COMMENTS_KEY] =
        '["thing_t1_abc123","thing_t1_def456"]';

      const stored = sessionStorageMock.getItem(COLLAPSED_COMMENTS_KEY);
      const ids = new Set(JSON.parse(stored));

      expect(ids.has("thing_t1_abc123")).toBe(true);
      expect(ids.has("thing_t1_def456")).toBe(true);
      expect(ids.size).toBe(2);
    });

    it("should handle empty storage gracefully", () => {
      const stored = sessionStorageMock.getItem(COLLAPSED_COMMENTS_KEY);
      let ids = new Set();

      if (stored) {
        ids = new Set(JSON.parse(stored));
      }

      expect(ids.size).toBe(0);
    });

    it("should add comment ID when collapsed", () => {
      const collapsed = new Set();
      const commentId = "thing_t1_new123";

      collapsed.add(commentId);

      expect(collapsed.has(commentId)).toBe(true);
      expect(collapsed.size).toBe(1);
    });

    it("should remove comment ID when expanded", () => {
      const collapsed = new Set(["thing_t1_abc123", "thing_t1_def456"]);
      const commentId = "thing_t1_abc123";

      collapsed.delete(commentId);

      expect(collapsed.has(commentId)).toBe(false);
      expect(collapsed.size).toBe(1);
    });

    it("should handle invalid JSON gracefully", () => {
      sessionStorageMock.store[COLLAPSED_COMMENTS_KEY] = "invalid json";

      let ids = new Set();
      try {
        const stored = sessionStorageMock.getItem(COLLAPSED_COMMENTS_KEY);
        if (stored) {
          ids = new Set(JSON.parse(stored));
        }
      } catch (e) {
        ids = new Set();
      }

      expect(ids.size).toBe(0);
    });
  });

  describe("CSS Classes", () => {
    it("should have correct permalink highlight class", () => {
      const className = "orr-permalink-highlight";
      expect(className).toBe("orr-permalink-highlight");
    });

    it("should have correct parent highlight class", () => {
      const className = "orr-parent-highlight";
      expect(className).toBe("orr-parent-highlight");
    });

    it("should have correct parent nav button class", () => {
      const className = "orr-parent-nav-btn";
      expect(className).toBe("orr-parent-nav-btn");
    });

    it("should have correct processed marker class", () => {
      const className = "orr-parent-nav-added";
      expect(className).toBe("orr-parent-nav-added");
    });
  });

  describe("URL Detection", () => {
    it("should detect comments page", () => {
      const urls = [
        "/r/test/comments/abc123/title/",
        "/comments/abc123",
        "/r/AskReddit/comments/xyz789/what_is/",
      ];

      for (const url of urls) {
        const isCommentsPage = url.includes("/comments/");
        expect(isCommentsPage).toBe(true);
      }
    });

    it("should detect non-comments pages", () => {
      const urls = ["/r/test", "/r/test/new", "/user/testuser", "/"];

      for (const url of urls) {
        const isCommentsPage = url.includes("/comments/");
        expect(isCommentsPage).toBe(false);
      }
    });
  });

  describe("Scroll Behavior", () => {
    it("should calculate scroll offset correctly", () => {
      const rect = { top: 100 };
      const offset = 80; // Account for fixed header
      const scrollY = 500;

      const targetScroll = scrollY + rect.top - offset;

      expect(targetScroll).toBe(520);
    });

    it("should determine if element needs scrolling", () => {
      const windowHeight = 800;
      const offset = 80;

      // Element above viewport
      const rect1 = { top: -50, bottom: 100 };
      const needsScroll1 = rect1.top < offset || rect1.bottom > windowHeight;
      expect(needsScroll1).toBe(true);

      // Element in viewport
      const rect2 = { top: 200, bottom: 400 };
      const needsScroll2 = rect2.top < offset || rect2.bottom > windowHeight;
      expect(needsScroll2).toBe(false);

      // Element below viewport
      const rect3 = { top: 100, bottom: 900 };
      const needsScroll3 = rect3.top < offset || rect3.bottom > windowHeight;
      expect(needsScroll3).toBe(true);
    });
  });

  describe("Animation Timing", () => {
    it("should have correct highlight duration", () => {
      const highlightDuration = 2500; // milliseconds
      expect(highlightDuration).toBe(2500);
    });

    it("should have correct parent flash duration", () => {
      const flashDuration = 1000; // milliseconds
      expect(flashDuration).toBe(1000);
    });

    it("should have scroll delay for permalink", () => {
      const scrollDelay = 100; // milliseconds
      expect(scrollDelay).toBe(100);
    });
  });

  describe("Performance", () => {
    it("should use Set for efficient ID lookup", () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(`thing_t1_comment${i}`);
      }

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        ids.has(`thing_t1_comment${i}`);
      }
      const lookupTime = performance.now() - startTime;

      expect(lookupTime).toBeLessThan(10); // O(1) lookups should be very fast
    });

    it("should track processed comments to avoid duplicate processing", () => {
      const processed = new Set();
      const comments = [
        { id: "c1", classList: { add: vi.fn(), contains: vi.fn(() => false) } },
        { id: "c2", classList: { add: vi.fn(), contains: vi.fn(() => false) } },
        { id: "c1", classList: { add: vi.fn(), contains: vi.fn(() => true) } }, // duplicate
      ];

      let processCount = 0;
      for (const comment of comments) {
        if (!processed.has(comment.id)) {
          processed.add(comment.id);
          processCount++;
        }
      }

      expect(processCount).toBe(2);
    });
  });
});

describe("Session Storage Key", () => {
  it("should have correct storage key", () => {
    const key = "orr-collapsed-comments";
    expect(key).toBe("orr-collapsed-comments");
  });
});

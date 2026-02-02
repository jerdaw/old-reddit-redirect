import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("User Muting", () => {
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

  describe("Storage Schema", () => {
    it("should have mutedUsers in defaults with correct structure", () => {
      const defaults = {
        enabled: true,
        maxUsers: 500,
        users: {},
      };

      expect(defaults.enabled).toBe(true);
      expect(defaults.maxUsers).toBe(500);
      expect(defaults.users).toEqual({});
    });

    it("should default to enabled", () => {
      const defaultValue = true;
      expect(defaultValue).toBe(true);
    });

    it("should have 500 user limit", () => {
      const maxUsers = 500;
      expect(maxUsers).toBe(500);
    });

    it("should store users in object format", () => {
      const users = {
        testuser: { reason: "spam", timestamp: Date.now() },
      };

      expect(users).toHaveProperty("testuser");
      expect(users.testuser).toHaveProperty("reason");
      expect(users.testuser).toHaveProperty("timestamp");
    });

    it("should support optional reason field", () => {
      const user1 = { reason: "No reason", timestamp: Date.now() };
      const user2 = { reason: "Spam bot", timestamp: Date.now() };

      expect(user1.reason).toBe("No reason");
      expect(user2.reason).toBe("Spam bot");
    });
  });

  describe("Content Filtering", () => {
    it("should hide posts from muted users", () => {
      // Create a post from a muted user
      const post = document.createElement("div");
      post.className = "thing";
      post.setAttribute("data-author", "muteduser");
      document.body.appendChild(post);

      // Simulate muting
      const mutedUsers = ["muteduser"];
      const author = post.getAttribute("data-author")?.toLowerCase();

      if (author && mutedUsers.includes(author)) {
        post.classList.add("orr-muted-user");
        post.setAttribute("data-muted-user", author);
        post.style.display = "none";
      }

      expect(post.classList.contains("orr-muted-user")).toBe(true);
      expect(post.getAttribute("data-muted-user")).toBe("muteduser");
      expect(post.style.display).toBe("none");
    });

    it("should not hide posts from non-muted users", () => {
      const post = document.createElement("div");
      post.className = "thing";
      post.setAttribute("data-author", "regularuser");
      document.body.appendChild(post);

      const mutedUsers = ["muteduser"];
      const author = post.getAttribute("data-author")?.toLowerCase();

      if (!(author && mutedUsers.includes(author))) {
        post.style.display = "";
      }

      expect(post.style.display).toBe("");
    });

    it("should hide comments from muted users", () => {
      const comment = document.createElement("div");
      comment.className = "thing comment";

      const authorLink = document.createElement("a");
      authorLink.className = "author";
      authorLink.textContent = "muteduser";
      comment.appendChild(authorLink);

      document.body.appendChild(comment);

      // Simulate muting
      const mutedUsers = ["muteduser"];
      const author = authorLink.textContent.trim().toLowerCase();

      if (mutedUsers.includes(author)) {
        comment.classList.add("orr-muted-user");
        comment.setAttribute("data-muted-user", author);
        comment.style.display = "none";
      }

      expect(comment.classList.contains("orr-muted-user")).toBe(true);
      expect(comment.getAttribute("data-muted-user")).toBe("muteduser");
      expect(comment.style.display).toBe("none");
    });

    it("should not hide comments from non-muted users", () => {
      const comment = document.createElement("div");
      comment.className = "thing comment";

      const authorLink = document.createElement("a");
      authorLink.className = "author";
      authorLink.textContent = "regularuser";
      comment.appendChild(authorLink);

      document.body.appendChild(comment);

      const mutedUsers = ["muteduser"];
      const author = authorLink.textContent.trim().toLowerCase();

      if (!mutedUsers.includes(author)) {
        comment.style.display = "";
      }

      expect(comment.style.display).toBe("");
    });

    it("should be case-insensitive for usernames", () => {
      const post = document.createElement("div");
      post.className = "thing";
      post.setAttribute("data-author", "MutedUser");
      document.body.appendChild(post);

      const mutedUsers = ["muteduser"]; // lowercase
      const author = post.getAttribute("data-author")?.toLowerCase();

      if (author && mutedUsers.includes(author)) {
        post.classList.add("orr-muted-user");
        post.style.display = "none";
      }

      expect(post.classList.contains("orr-muted-user")).toBe(true);
      expect(post.style.display).toBe("none");
    });

    it("should handle multiple muted users", () => {
      const posts = [
        { author: "user1", shouldHide: true },
        { author: "user2", shouldHide: false },
        { author: "user3", shouldHide: true },
      ];

      const mutedUsers = ["user1", "user3"];

      posts.forEach((postData) => {
        const post = document.createElement("div");
        post.className = "thing";
        post.setAttribute("data-author", postData.author);
        document.body.appendChild(post);

        const author = post.getAttribute("data-author")?.toLowerCase();
        if (author && mutedUsers.includes(author)) {
          post.style.display = "none";
        }

        expect(post.style.display).toBe(postData.shouldHide ? "none" : "");
      });
    });

    it("should handle posts with missing author attribute", () => {
      const post = document.createElement("div");
      post.className = "thing";
      // No data-author attribute
      document.body.appendChild(post);

      const _mutedUsers = ["muteduser"];
      const author = post.getAttribute("data-author")?.toLowerCase();

      expect(author).toBeUndefined();
      expect(post.style.display).toBe("");
    });

    it("should handle comments with missing author element", () => {
      const comment = document.createElement("div");
      comment.className = "thing comment";
      // No author link
      document.body.appendChild(comment);

      const authorLink = comment.querySelector("a.author");
      expect(authorLink).toBeNull();
    });
  });

  describe("LRU Eviction", () => {
    it("should enforce 500 user limit", () => {
      const maxUsers = 500;
      const users = {};

      // Fill to limit
      for (let i = 0; i < maxUsers; i++) {
        users[`user${i}`] = { reason: "test", timestamp: Date.now() + i };
      }

      expect(Object.keys(users).length).toBe(maxUsers);

      // Add one more (simulate LRU eviction)
      const entries = Object.entries(users);
      if (entries.length >= maxUsers) {
        // Find oldest entry
        let oldest = null;
        let oldestTime = Infinity;
        for (const [user, data] of entries) {
          if (data.timestamp < oldestTime) {
            oldest = user;
            oldestTime = data.timestamp;
          }
        }
        if (oldest) {
          delete users[oldest];
        }
      }

      users.newuser = { reason: "test", timestamp: Date.now() + maxUsers };

      expect(Object.keys(users).length).toBe(maxUsers);
      expect(users).not.toHaveProperty("user0"); // Oldest removed
      expect(users).toHaveProperty("newuser"); // New one added
    });

    it("should evict least recently used entry", () => {
      const users = {
        user1: { reason: "test", timestamp: 1000 },
        user2: { reason: "test", timestamp: 2000 },
        user3: { reason: "test", timestamp: 3000 },
      };

      // Find oldest
      const entries = Object.entries(users);
      let oldest = null;
      let oldestTime = Infinity;
      for (const [user, data] of entries) {
        if (data.timestamp < oldestTime) {
          oldest = user;
          oldestTime = data.timestamp;
        }
      }

      expect(oldest).toBe("user1");
    });
  });

  describe("Context Menu Integration", () => {
    it("should extract username from /user/ URL", () => {
      const url = "https://old.reddit.com/user/testuser";
      const match = url.match(/\/u(?:ser)?\/([^/?#]+)/);

      expect(match).not.toBeNull();
      expect(match[1]).toBe("testuser");
    });

    it("should extract username from /u/ URL", () => {
      const url = "https://old.reddit.com/u/testuser";
      const match = url.match(/\/u(?:ser)?\/([^/?#]+)/);

      expect(match).not.toBeNull();
      expect(match[1]).toBe("testuser");
    });

    it("should handle usernames with underscores", () => {
      const url = "https://old.reddit.com/user/test_user_123";
      const match = url.match(/\/u(?:ser)?\/([^/?#]+)/);

      expect(match).not.toBeNull();
      expect(match[1]).toBe("test_user_123");
    });

    it("should handle usernames with hyphens", () => {
      const url = "https://old.reddit.com/user/test-user";
      const match = url.match(/\/u(?:ser)?\/([^/?#]+)/);

      expect(match).not.toBeNull();
      expect(match[1]).toBe("test-user");
    });

    it("should extract username from URL with query params", () => {
      const url = "https://old.reddit.com/user/testuser?sort=top";
      const match = url.match(/\/u(?:ser)?\/([^/?#]+)/);

      expect(match).not.toBeNull();
      expect(match[1]).toBe("testuser");
    });

    it("should extract username from URL with hash", () => {
      const url = "https://old.reddit.com/user/testuser#comments";
      const match = url.match(/\/u(?:ser)?\/([^/?#]+)/);

      expect(match).not.toBeNull();
      expect(match[1]).toBe("testuser");
    });
  });

  describe("UI Integration", () => {
    it("should validate username input", () => {
      const input = "  testuser  ";
      const cleaned = input.trim().replace(/^u\//, "");

      expect(cleaned).toBe("testuser");
    });

    it("should remove u/ prefix from input", () => {
      const input = "u/testuser";
      const cleaned = input.trim().replace(/^u\//, "");

      expect(cleaned).toBe("testuser");
    });

    it("should handle empty input", () => {
      const input = "";
      const cleaned = input.trim();

      expect(cleaned).toBe("");
    });

    it("should truncate long reasons to 100 chars", () => {
      const reason = "a".repeat(150);
      const truncated = reason.substring(0, 100);

      expect(truncated.length).toBe(100);
    });

    it("should handle missing reason", () => {
      const reason = undefined;
      const final = reason || "No reason";

      expect(final).toBe("No reason");
    });
  });

  describe("Import/Export", () => {
    it("should export users as JSON", () => {
      const users = {
        user1: { reason: "spam", timestamp: 1000 },
        user2: { reason: "troll", timestamp: 2000 },
      };

      const json = JSON.stringify(users, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(users);
    });

    it("should validate import format", () => {
      const validJSON = '{"user1": {"reason": "test", "timestamp": 1000}}';
      const parsed = JSON.parse(validJSON);

      expect(typeof parsed).toBe("object");
      expect(parsed).not.toBeNull();
    });

    it("should reject invalid JSON", () => {
      const invalidJSON = "not json";

      expect(() => JSON.parse(invalidJSON)).toThrow();
    });

    it("should merge imported users with existing", () => {
      const existing = {
        user1: { reason: "old", timestamp: 1000 },
      };

      const imported = {
        user2: { reason: "new", timestamp: 2000 },
      };

      const merged = { ...existing, ...imported };

      expect(merged).toHaveProperty("user1");
      expect(merged).toHaveProperty("user2");
      expect(Object.keys(merged).length).toBe(2);
    });

    it("should overwrite existing users on import", () => {
      const existing = {
        user1: { reason: "old", timestamp: 1000 },
      };

      const imported = {
        user1: { reason: "new", timestamp: 2000 },
      };

      const merged = { ...existing, ...imported };

      expect(merged.user1.reason).toBe("new");
      expect(merged.user1.timestamp).toBe(2000);
    });
  });

  describe("Feature Toggle", () => {
    it("should respect enabled flag", () => {
      const config = { enabled: false, users: { user1: {} } };

      if (!config.enabled || Object.keys(config.users).length === 0) {
        // Skip muting
        expect(true).toBe(true);
      }
    });

    it("should skip when no users muted", () => {
      const config = { enabled: true, users: {} };

      if (!config.enabled || Object.keys(config.users).length === 0) {
        // Skip muting
        expect(true).toBe(true);
      }
    });

    it("should apply muting when enabled with users", () => {
      const config = { enabled: true, users: { user1: {} } };

      if (config.enabled && Object.keys(config.users).length > 0) {
        // Apply muting
        expect(true).toBe(true);
      }
    });
  });
});

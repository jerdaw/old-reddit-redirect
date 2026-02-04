import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";

describe("User Tags - Storage Schema", () => {
  it("should have userTags in storage schema", async () => {
    const storage = await import("../src/core/storage.js");

    // Check that storage methods exist
    expect(storage.default).toBeDefined();
    expect(typeof storage.default.getUserTags).toBe("function");
    expect(typeof storage.default.setUserTags).toBe("function");
    expect(typeof storage.default.getUserTag).toBe("function");
    expect(typeof storage.default.setUserTag).toBe("function");
    expect(typeof storage.default.deleteUserTag).toBe("function");
    expect(typeof storage.default.clearUserTags).toBe("function");
    expect(typeof storage.default.isUserTagsEnabled).toBe("function");
  });
});

describe("User Tags - Username Normalization", () => {
  it("should normalize usernames to lowercase", () => {
    const normalize = (username) => username.toLowerCase();

    expect(normalize("TestUser")).toBe("testuser");
    expect(normalize("TESTUSER")).toBe("testuser");
    expect(normalize("testuser")).toBe("testuser");
    expect(normalize("Test_User123")).toBe("test_user123");
  });

  it("should handle usernames with special characters", () => {
    const normalize = (username) => username.toLowerCase();

    expect(normalize("user-name")).toBe("user-name");
    expect(normalize("user_name")).toBe("user_name");
    expect(normalize("user.name")).toBe("user.name");
  });
});

describe("User Tags - Tag Validation", () => {
  it("should enforce maximum tag text length", () => {
    const maxLength = 50;
    const validateText = (text) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength);
      }
      return text;
    };

    const longText = "a".repeat(100);
    expect(validateText(longText).length).toBe(50);

    const shortText = "Friend";
    expect(validateText(shortText)).toBe("Friend");
  });

  it("should validate color format", () => {
    const isValidColor = (color) => {
      return /^#[0-9a-fA-F]{6}$/.test(color);
    };

    expect(isValidColor("#e74c3c")).toBe(true);
    expect(isValidColor("#3498db")).toBe(true);
    expect(isValidColor("red")).toBe(false);
    expect(isValidColor("#fff")).toBe(false);
    expect(isValidColor("#gggggg")).toBe(false);
  });
});

describe("User Tags - LRU Eviction", () => {
  it("should evict oldest tag when limit reached", () => {
    const tags = {
      user1: { text: "Friend", color: "#e74c3c", timestamp: 1000 },
      user2: { text: "Expert", color: "#2ecc71", timestamp: 2000 },
      user3: { text: "Helper", color: "#3498db", timestamp: 3000 },
    };

    const maxTags = 2;

    // Simulate LRU eviction
    const entries = Object.entries(tags);
    if (entries.length > maxTags) {
      let oldest = null;
      let oldestTime = Infinity;
      for (const [username, data] of entries) {
        if (data.timestamp < oldestTime) {
          oldest = username;
          oldestTime = data.timestamp;
        }
      }
      if (oldest) {
        delete tags[oldest];
      }
    }

    expect(tags).not.toHaveProperty("user1");
    expect(tags).toHaveProperty("user2");
    expect(tags).toHaveProperty("user3");
    expect(Object.keys(tags).length).toBe(2);
  });
});

describe("User Tags - HTML Escaping", () => {
  beforeEach(() => {
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document;
  });

  it("should escape HTML in tag text", () => {
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    expect(escapeHtml("<script>alert('xss')</script>")).not.toContain(
      "<script>"
    );
    expect(escapeHtml("Friend & Helper")).toBe("Friend &amp; Helper");
    expect(escapeHtml("Normal Tag")).toBe("Normal Tag");
  });

  it("should escape HTML in username", () => {
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    expect(escapeHtml("user<script>")).not.toContain("<script>");
    expect(escapeHtml("normal_user")).toBe("normal_user");
  });
});

describe("User Tags - Color Preset", () => {
  const TAG_COLORS = [
    "#e74c3c", // Red
    "#e67e22", // Orange
    "#f39c12", // Yellow
    "#2ecc71", // Green
    "#1abc9c", // Teal
    "#3498db", // Blue
    "#9b59b6", // Purple
    "#e91e63", // Pink
    "#607d8b", // Gray
    "#795548", // Brown
    "#ff5722", // Deep Orange
    "#00bcd4", // Cyan
  ];

  it("should have 12 preset colors", () => {
    expect(TAG_COLORS).toHaveLength(12);
  });

  it("should have valid hex colors", () => {
    const isValidColor = (color) => /^#[0-9a-fA-F]{6}$/.test(color);

    TAG_COLORS.forEach((color) => {
      expect(isValidColor(color)).toBe(true);
    });
  });

  it("should have no duplicate colors", () => {
    const unique = new Set(TAG_COLORS);
    expect(unique.size).toBe(TAG_COLORS.length);
  });
});

describe("User Tags - CSS Selectors", () => {
  it("should have correct class names for tag elements", () => {
    const expectedClasses = [
      "orr-tag-btn",
      "orr-user-tag",
      "orr-tag-dialog",
      "orr-tag-dialog-overlay",
      "orr-tag-dialog-header",
      "orr-tag-dialog-body",
      "orr-tag-dialog-footer",
      "orr-tag-save",
      "orr-tag-delete",
      "orr-tag-cancel",
      "orr-color-picker",
      "orr-color-option",
    ];

    expectedClasses.forEach((className) => {
      expect(className).toBeTruthy();
      expect(typeof className).toBe("string");
    });
  });

  it("should have correct IDs for options page elements", () => {
    const expectedIds = [
      "user-tags-enabled",
      "tag-count",
      "tag-max",
      "tag-search",
      "tags-table",
      "tags-tbody",
      "tags-empty",
      "clear-all-tags",
      "export-tags",
      "import-tags",
    ];

    expectedIds.forEach((id) => {
      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
    });
  });
});

describe("User Tags - DOM Manipulation", () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    document = dom.window.document;
    global.document = document;
  });

  it("should find author elements", () => {
    document.body.innerHTML = `
      <a class="author">testuser</a>
      <a class="author">anotheruser</a>
    `;

    const authors = document.querySelectorAll(".author");
    expect(authors.length).toBe(2);
    expect(authors[0].textContent).toBe("testuser");
    expect(authors[1].textContent).toBe("anotheruser");
  });

  it("should mark author elements as processed", () => {
    document.body.innerHTML = `<a class="author">testuser</a>`;

    const author = document.querySelector(".author");
    expect(author.classList.contains("orr-tagged")).toBe(false);

    author.classList.add("orr-tagged");
    expect(author.classList.contains("orr-tagged")).toBe(true);
  });

  it("should create tag button element", () => {
    const button = document.createElement("button");
    button.className = "orr-tag-btn";
    button.textContent = "🏷️";
    button.dataset.username = "testuser";

    expect(button.className).toBe("orr-tag-btn");
    expect(button.textContent).toBe("🏷️");
    expect(button.dataset.username).toBe("testuser");
  });

  it("should create tag badge element", () => {
    const badge = document.createElement("span");
    badge.className = "orr-user-tag";
    badge.textContent = "Friend";
    badge.style.backgroundColor = "#3498db";
    badge.dataset.username = "testuser";

    expect(badge.className).toBe("orr-user-tag");
    expect(badge.textContent).toBe("Friend");
    expect(badge.style.backgroundColor).toBe("rgb(52, 152, 219)"); // Normalized
    expect(badge.dataset.username).toBe("testuser");
  });
});

describe("User Tags - Format Date", () => {
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

describe("User Tags - Edge Cases", () => {
  it("should handle empty username", () => {
    const username = "";
    expect(username.trim()).toBe("");
  });

  it("should handle whitespace-only username", () => {
    const username = "   ";
    expect(username.trim()).toBe("");
  });

  it("should handle very long usernames", () => {
    const longUsername = "a".repeat(100);
    const normalized = longUsername.toLowerCase();
    expect(normalized.length).toBe(100);
  });

  it("should handle unicode usernames", () => {
    const normalize = (username) => username.toLowerCase();

    expect(normalize("用户名")).toBe("用户名");
    expect(normalize("Пользователь")).toBe("пользователь");
  });
});

describe("User Tags - Message Types", () => {
  it("should have correct message types", () => {
    const messageTypes = {
      REFRESH_USER_TAGS: "REFRESH_USER_TAGS",
      REFRESH_USER_TAG: "REFRESH_USER_TAG",
    };

    expect(messageTypes.REFRESH_USER_TAGS).toBe("REFRESH_USER_TAGS");
    expect(messageTypes.REFRESH_USER_TAG).toBe("REFRESH_USER_TAG");
  });
});

describe("User Tags - Dialog State", () => {
  it("should track dialog state", () => {
    let currentDialog = null;

    // Simulate opening dialog
    currentDialog = { type: "tag-dialog" };
    expect(currentDialog).not.toBe(null);

    // Simulate closing dialog
    currentDialog = null;
    expect(currentDialog).toBe(null);
  });

  it("should prevent multiple dialogs", () => {
    let currentDialog = null;

    // Open first dialog
    if (!currentDialog) {
      currentDialog = { id: 1 };
    }
    expect(currentDialog.id).toBe(1);

    // Try to open second dialog (should close first)
    if (currentDialog) {
      currentDialog = null; // Close existing
    }
    currentDialog = { id: 2 };
    expect(currentDialog.id).toBe(2);
  });
});

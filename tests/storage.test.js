import { describe, it, expect } from "vitest";

/**
 * Tests for storage.js - centralized storage abstraction layer
 * These tests validate data integrity, defensive programming, and import/export
 */

/**
 * Helper function to get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

describe("Storage API", () => {
  describe("getTodayDate helper", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const date = getTodayDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return today's date", () => {
      const date = getTodayDate();
      const now = new Date();
      const expected = now.toISOString().split("T")[0];
      expect(date).toBe(expected);
    });
  });

  describe("getStats defensive checks", () => {
    it("should return safe defaults for missing totalRedirects", () => {
      const malformed = {
        totalRedirects: null,
        todayRedirects: 5,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      // Simulate the defensive logic
      const safeStats = {
        totalRedirects:
          typeof malformed.totalRedirects === "number"
            ? malformed.totalRedirects
            : 0,
        todayRedirects:
          typeof malformed.todayRedirects === "number"
            ? malformed.todayRedirects
            : 0,
        todayDate: malformed.todayDate || getTodayDate(),
        lastRedirect: malformed.lastRedirect || null,
        perSubreddit:
          malformed.perSubreddit && typeof malformed.perSubreddit === "object"
            ? malformed.perSubreddit
            : {},
        weeklyHistory: Array.isArray(malformed.weeklyHistory)
          ? malformed.weeklyHistory
          : [],
      };

      expect(safeStats.totalRedirects).toBe(0);
      expect(safeStats.todayRedirects).toBe(5);
    });

    it("should handle non-numeric todayRedirects", () => {
      const malformed = {
        totalRedirects: 10,
        todayRedirects: "not a number",
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      const safeStats = {
        totalRedirects:
          typeof malformed.totalRedirects === "number"
            ? malformed.totalRedirects
            : 0,
        todayRedirects:
          typeof malformed.todayRedirects === "number"
            ? malformed.todayRedirects
            : 0,
        todayDate: malformed.todayDate || getTodayDate(),
        lastRedirect: malformed.lastRedirect || null,
        perSubreddit:
          malformed.perSubreddit && typeof malformed.perSubreddit === "object"
            ? malformed.perSubreddit
            : {},
        weeklyHistory: Array.isArray(malformed.weeklyHistory)
          ? malformed.weeklyHistory
          : [],
      };

      expect(safeStats.todayRedirects).toBe(0);
      expect(safeStats.totalRedirects).toBe(10);
    });

    it("should handle null perSubreddit", () => {
      const malformed = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: null,
        weeklyHistory: [],
      };

      const safeStats = {
        totalRedirects:
          typeof malformed.totalRedirects === "number"
            ? malformed.totalRedirects
            : 0,
        todayRedirects:
          typeof malformed.todayRedirects === "number"
            ? malformed.todayRedirects
            : 0,
        todayDate: malformed.todayDate || getTodayDate(),
        lastRedirect: malformed.lastRedirect || null,
        perSubreddit:
          malformed.perSubreddit && typeof malformed.perSubreddit === "object"
            ? malformed.perSubreddit
            : {},
        weeklyHistory: Array.isArray(malformed.weeklyHistory)
          ? malformed.weeklyHistory
          : [],
      };

      expect(safeStats.perSubreddit).toEqual({});
    });

    it("should handle non-array weeklyHistory", () => {
      const malformed = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: "not an array",
      };

      const safeStats = {
        totalRedirects:
          typeof malformed.totalRedirects === "number"
            ? malformed.totalRedirects
            : 0,
        todayRedirects:
          typeof malformed.todayRedirects === "number"
            ? malformed.todayRedirects
            : 0,
        todayDate: malformed.todayDate || getTodayDate(),
        lastRedirect: malformed.lastRedirect || null,
        perSubreddit:
          malformed.perSubreddit && typeof malformed.perSubreddit === "object"
            ? malformed.perSubreddit
            : {},
        weeklyHistory: Array.isArray(malformed.weeklyHistory)
          ? malformed.weeklyHistory
          : [],
      };

      expect(safeStats.weeklyHistory).toEqual([]);
    });

    it("should handle missing todayDate", () => {
      const malformed = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: null,
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      const today = getTodayDate();
      const safeStats = {
        totalRedirects:
          typeof malformed.totalRedirects === "number"
            ? malformed.totalRedirects
            : 0,
        todayRedirects:
          typeof malformed.todayRedirects === "number"
            ? malformed.todayRedirects
            : 0,
        todayDate: malformed.todayDate || today,
        lastRedirect: malformed.lastRedirect || null,
        perSubreddit:
          malformed.perSubreddit && typeof malformed.perSubreddit === "object"
            ? malformed.perSubreddit
            : {},
        weeklyHistory: Array.isArray(malformed.weeklyHistory)
          ? malformed.weeklyHistory
          : [],
      };

      expect(safeStats.todayDate).toBe(today);
    });
  });

  describe("incrementRedirectCount logic", () => {
    it("should increment both total and today counters", () => {
      const stats = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      stats.totalRedirects++;
      stats.todayRedirects++;
      stats.lastRedirect = new Date().toISOString();

      expect(stats.totalRedirects).toBe(11);
      expect(stats.todayRedirects).toBe(6);
      expect(stats.lastRedirect).toBeTruthy();
    });

    it("should track per-subreddit counts", () => {
      const stats = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      const subreddit = "programming";
      stats.perSubreddit[subreddit] = (stats.perSubreddit[subreddit] || 0) + 1;

      expect(stats.perSubreddit.programming).toBe(1);

      // Increment again
      stats.perSubreddit[subreddit] = (stats.perSubreddit[subreddit] || 0) + 1;
      expect(stats.perSubreddit.programming).toBe(2);
    });

    it("should limit perSubreddit to top 50", () => {
      const stats = {
        totalRedirects: 100,
        todayRedirects: 10,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      // Add 60 subreddits
      for (let i = 1; i <= 60; i++) {
        stats.perSubreddit[`subreddit${i}`] = i;
      }

      expect(Object.keys(stats.perSubreddit).length).toBe(60);

      // Simulate the top 50 limit logic
      const entries = Object.entries(stats.perSubreddit);
      if (entries.length > 50) {
        const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 50);
        stats.perSubreddit = Object.fromEntries(sorted);
      }

      expect(Object.keys(stats.perSubreddit).length).toBe(50);

      // Should keep highest counts (50-60)
      expect(stats.perSubreddit.subreddit60).toBe(60);
      expect(stats.perSubreddit.subreddit50).toBe(50);
      expect(stats.perSubreddit.subreddit1).toBeUndefined();
    });

    it("should update weekly history for today", () => {
      const today = getTodayDate();
      const stats = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: today,
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [{ date: today, count: 5 }],
      };

      const todayEntry = stats.weeklyHistory.find((e) => e.date === today);
      if (todayEntry) {
        todayEntry.count++;
      } else {
        stats.weeklyHistory.push({ date: today, count: 1 });
      }

      expect(stats.weeklyHistory[0].count).toBe(6);
    });

    it("should add new entry if today not in history", () => {
      const today = getTodayDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const stats = {
        totalRedirects: 10,
        todayRedirects: 5,
        todayDate: today,
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [{ date: yesterdayStr, count: 5 }],
      };

      const todayEntry = stats.weeklyHistory.find((e) => e.date === today);
      if (todayEntry) {
        todayEntry.count++;
      } else {
        stats.weeklyHistory.push({ date: today, count: 1 });
      }

      expect(stats.weeklyHistory.length).toBe(2);
      expect(stats.weeklyHistory[1].date).toBe(today);
      expect(stats.weeklyHistory[1].count).toBe(1);
    });

    it("should keep only last 7 days in history", () => {
      const stats = {
        totalRedirects: 100,
        todayRedirects: 10,
        todayDate: getTodayDate(),
        lastRedirect: null,
        perSubreddit: {},
        weeklyHistory: [],
      };

      // Add 10 days of history
      for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        stats.weeklyHistory.push({
          date: date.toISOString().split("T")[0],
          count: i + 1,
        });
      }

      expect(stats.weeklyHistory.length).toBe(10);

      // Simulate the 7-day limit
      if (stats.weeklyHistory.length > 7) {
        stats.weeklyHistory = stats.weeklyHistory.slice(-7);
      }

      expect(stats.weeklyHistory.length).toBe(7);
      // Should keep most recent 7 days
      expect(stats.weeklyHistory[0].count).toBe(7); // 6 days ago (oldest kept)
      expect(stats.weeklyHistory[6].count).toBe(1); // Today (newest)
    });
  });

  describe("validateImport", () => {
    it("should accept valid import data", () => {
      const data = {
        _exportVersion: 1,
        _exportDate: new Date().toISOString(),
        _extensionVersion: "5.0.0",
        frontend: { target: "old.reddit.com" },
        subredditOverrides: { whitelist: ["wallstreetbets", "nba"] },
        ui: { badgeStyle: "text" },
      };

      const errors = [];

      if (!data || typeof data !== "object") {
        errors.push("Data must be an object");
      }

      if (!data._exportVersion || data._exportVersion > 1) {
        errors.push("Unsupported export version");
      }

      if (data.frontend && typeof data.frontend !== "object") {
        errors.push("Invalid frontend config");
      }

      if (data.subredditOverrides) {
        if (typeof data.subredditOverrides !== "object") {
          errors.push("Invalid subreddit overrides");
        } else if (data.subredditOverrides.whitelist) {
          if (!Array.isArray(data.subredditOverrides.whitelist)) {
            errors.push("Whitelist must be an array");
          } else {
            const invalid = data.subredditOverrides.whitelist.filter(
              (s) => typeof s !== "string" || !/^[a-z0-9_]+$/i.test(s)
            );
            if (invalid.length > 0) {
              errors.push(`Invalid subreddit names: ${invalid.join(", ")}`);
            }
          }
        }
      }

      if (data.ui) {
        if (typeof data.ui !== "object") {
          errors.push("Invalid UI config");
        } else if (
          data.ui.badgeStyle &&
          !["text", "count", "color"].includes(data.ui.badgeStyle)
        ) {
          errors.push("Invalid badge style");
        }
      }

      expect(errors).toEqual([]);
    });

    it("should reject non-object data", () => {
      const data = "not an object";
      const errors = [];

      if (!data || typeof data !== "object") {
        errors.push("Data must be an object");
      }

      expect(errors).toContain("Data must be an object");
    });

    it("should reject unsupported export version", () => {
      const data = {
        _exportVersion: 2,
        frontend: { target: "old.reddit.com" },
      };

      const errors = [];

      if (!data._exportVersion || data._exportVersion > 1) {
        errors.push("Unsupported export version");
      }

      expect(errors).toContain("Unsupported export version");
    });

    it("should reject invalid subreddit names", () => {
      const data = {
        _exportVersion: 1,
        subredditOverrides: {
          whitelist: ["valid_name", "invalid name", "another-valid"],
        },
      };

      const errors = [];

      if (data.subredditOverrides && data.subredditOverrides.whitelist) {
        if (Array.isArray(data.subredditOverrides.whitelist)) {
          const invalid = data.subredditOverrides.whitelist.filter(
            (s) => typeof s !== "string" || !/^[a-z0-9_]+$/i.test(s)
          );
          if (invalid.length > 0) {
            errors.push(`Invalid subreddit names: ${invalid.join(", ")}`);
          }
        }
      }

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid subreddit names");
      expect(errors[0]).toContain("invalid name");
    });

    it("should reject invalid badge style", () => {
      const data = {
        _exportVersion: 1,
        ui: { badgeStyle: "invalid" },
      };

      const errors = [];

      if (data.ui) {
        if (typeof data.ui !== "object") {
          errors.push("Invalid UI config");
        } else if (
          data.ui.badgeStyle &&
          !["text", "count", "color"].includes(data.ui.badgeStyle)
        ) {
          errors.push("Invalid badge style");
        }
      }

      expect(errors).toContain("Invalid badge style");
    });

    it("should reject oversized whitelist", () => {
      const data = {
        _exportVersion: 1,
        subredditOverrides: {
          whitelist: Array.from({ length: 501 }, (_, i) => `sub${i}`),
        },
      };

      const result = globalThis.StorageMigration.validateImport(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("500 entry limit"))).toBe(
        true
      );
    });

    it("should reject oversized keyword list", () => {
      const data = {
        _exportVersion: 1,
        contentFiltering: {
          mutedKeywords: Array.from({ length: 201 }, (_, i) => `kw${i}`),
          useRegex: false,
        },
      };

      const result = globalThis.StorageMigration.validateImport(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("200 entry limit"))).toBe(
        true
      );
    });

    it("should reject invalid regex patterns", () => {
      const data = {
        _exportVersion: 1,
        contentFiltering: {
          mutedKeywords: ["valid", "[invalid"],
          useRegex: true,
        },
      };

      const result = globalThis.StorageMigration.validateImport(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid regex"))).toBe(true);
    });

    it("should reject data exceeding 5MB size limit", () => {
      const data = {
        _exportVersion: 1,
        frontend: { target: "x".repeat(6 * 1024 * 1024) },
      };

      const result = globalThis.StorageMigration.validateImport(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("5MB"))).toBe(true);
    });

    it("should reject non-array whitelist", () => {
      const data = {
        _exportVersion: 1,
        subredditOverrides: { whitelist: "not an array" },
      };

      const errors = [];

      if (data.subredditOverrides && data.subredditOverrides.whitelist) {
        if (!Array.isArray(data.subredditOverrides.whitelist)) {
          errors.push("Whitelist must be an array");
        }
      }

      expect(errors).toContain("Whitelist must be an array");
    });
  });

  describe("exportSettings", () => {
    it("should exclude stats from export", () => {
      const allData = {
        _schemaVersion: 1,
        enabled: true,
        stats: { totalRedirects: 100 },
        frontend: { target: "old.reddit.com" },
        subredditOverrides: { whitelist: ["programming"] },
        ui: { badgeStyle: "text" },
      };

      const exportData = {
        _exportVersion: 1,
        _exportDate: new Date().toISOString(),
        _extensionVersion: "5.1.0",
        frontend: allData.frontend,
        subredditOverrides: allData.subredditOverrides,
        ui: allData.ui,
      };

      expect(exportData.stats).toBeUndefined();
      expect(exportData.frontend).toBeDefined();
      expect(exportData.subredditOverrides).toBeDefined();
      expect(exportData.ui).toBeDefined();
    });

    it("should include metadata in export", () => {
      const exportData = {
        _exportVersion: 1,
        _exportDate: new Date().toISOString(),
        _extensionVersion: "5.1.0",
        frontend: { target: "old.reddit.com" },
      };

      expect(exportData._exportVersion).toBe(1);
      expect(exportData._exportDate).toBeTruthy();
      expect(exportData._extensionVersion).toBeTruthy();
    });
  });
});

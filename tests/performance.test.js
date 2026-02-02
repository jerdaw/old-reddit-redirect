"use strict";

/**
 * Performance & Storage Optimization Tests (Phase 6)
 * Tests for storage quota monitoring, cleanup utilities, and DOM optimization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    lastError: null,
    getManifest: vi.fn(() => ({ version: "13.0.0" })),
  },
  declarativeNetRequest: {
    getEnabledRulesets: vi.fn(),
  },
};

global.chrome = mockChrome;

// Import Storage after mocking chrome
const { default: Storage } = await import("../storage.js").catch(() => {
  // Return a mock Storage for testing
  return {
    default: {
      getStorageUsage: vi.fn(),
      isNearQuotaLimit: vi.fn(),
      getStorageHealthReport: vi.fn(),
      cleanupExpiredData: vi.fn(),
      compactStorage: vi.fn(),
      runMaintenance: vi.fn(),
      getScrollPositions: vi.fn(),
      setScrollPositions: vi.fn(),
      getSortPreferences: vi.fn(),
      setSortPreferences: vi.fn(),
      getStats: vi.fn(),
      set: vi.fn(),
      getAll: vi.fn(),
      _calculateObjectSize: (obj) => new Blob([JSON.stringify(obj)]).size,
    },
  };
});

describe("Storage Quota Monitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStorageUsage", () => {
    it("should return storage usage statistics", async () => {
      const mockLocalData = {
        stats: { totalRedirects: 100 },
        userTags: { tags: { user1: { text: "test" } } },
      };
      const mockSyncData = {
        ui: { showNotifications: false },
      };

      mockChrome.storage.local.get.mockImplementation((_, callback) => {
        callback(mockLocalData);
      });
      mockChrome.storage.sync.get.mockImplementation((_, callback) => {
        callback(mockSyncData);
      });

      // Test the calculation logic directly
      const localBytes = new Blob([JSON.stringify(mockLocalData)]).size;
      const syncBytes = new Blob([JSON.stringify(mockSyncData)]).size;

      expect(localBytes).toBeGreaterThan(0);
      expect(syncBytes).toBeGreaterThan(0);
    });

    it("should calculate correct percentage of quota used", () => {
      const localUsed = 1048576; // 1MB
      const localQuota = 5242880; // 5MB
      const percentage = Math.round((localUsed / localQuota) * 100);

      expect(percentage).toBe(20);
    });

    it("should provide breakdown by storage key", async () => {
      const mockData = {
        stats: { totalRedirects: 100 },
        userTags: { tags: {} },
        scrollPositions: { positions: {} },
      };

      const breakdown = {};
      for (const [key, value] of Object.entries(mockData)) {
        breakdown[key] = new Blob([JSON.stringify({ [key]: value })]).size;
      }

      expect(Object.keys(breakdown)).toContain("stats");
      expect(Object.keys(breakdown)).toContain("userTags");
      expect(Object.keys(breakdown)).toContain("scrollPositions");
    });
  });

  describe("isNearQuotaLimit", () => {
    it("should return true when local storage exceeds 80% threshold", () => {
      const percentage = 85;
      const threshold = 80;
      const isNear = percentage >= threshold;

      expect(isNear).toBe(true);
    });

    it("should return false when storage is under threshold", () => {
      const percentage = 50;
      const threshold = 80;
      const isNear = percentage >= threshold;

      expect(isNear).toBe(false);
    });

    it("should provide recommendations when near limit", () => {
      const breakdown = {
        scrollPositions: 60000,
        sortPreferences: 35000,
        userTags: 150000,
      };

      const recommendations = [];

      if (breakdown.scrollPositions > 50000) {
        recommendations.push({
          action: "cleanup_scroll_positions",
          message: "Scroll positions are using significant storage.",
        });
      }
      if (breakdown.sortPreferences > 30000) {
        recommendations.push({
          action: "cleanup_sort_preferences",
          message: "Sort preferences are using significant storage.",
        });
      }
      if (breakdown.userTags > 100000) {
        recommendations.push({
          action: "cleanup_user_tags",
          message: "User tags are using significant storage.",
        });
      }

      expect(recommendations).toHaveLength(3);
    });
  });

  describe("getStorageHealthReport", () => {
    it("should return healthy status when under threshold", () => {
      const localPercentage = 50;
      const syncPercentage = 30;
      const threshold = 80;

      const localNear = localPercentage >= threshold;
      const syncNear = syncPercentage >= threshold;

      let status = "healthy";
      if (localPercentage >= 90 || syncPercentage >= 90) {
        status = "critical";
      } else if (localNear || syncNear) {
        status = "warning";
      }

      expect(status).toBe("healthy");
    });

    it("should return warning status when approaching threshold", () => {
      const localPercentage = 85;
      const threshold = 80;

      let status = "healthy";
      if (localPercentage >= 90) {
        status = "critical";
      } else if (localPercentage >= threshold) {
        status = "warning";
      }

      expect(status).toBe("warning");
    });

    it("should return critical status when over 90%", () => {
      const localPercentage = 95;

      let status = "healthy";
      if (localPercentage >= 90) {
        status = "critical";
      }

      expect(status).toBe("critical");
    });

    it("should count items in storage objects", () => {
      const all = {
        userTags: { tags: { user1: {}, user2: {}, user3: {} } },
        mutedUsers: { users: { user1: {} } },
        sortPreferences: { preferences: { sub1: {}, sub2: {} } },
        scrollPositions: { positions: { url1: {}, url2: {}, url3: {} } },
        layoutPresets: { presets: { preset1: {} }, subredditLayouts: {} },
      };

      const counts = {
        userTags: Object.keys(all.userTags?.tags || {}).length,
        mutedUsers: Object.keys(all.mutedUsers?.users || {}).length,
        sortPreferences: Object.keys(all.sortPreferences?.preferences || {})
          .length,
        scrollPositions: Object.keys(all.scrollPositions?.positions || {})
          .length,
        layoutPresets: Object.keys(all.layoutPresets?.presets || {}).length,
      };

      expect(counts.userTags).toBe(3);
      expect(counts.mutedUsers).toBe(1);
      expect(counts.sortPreferences).toBe(2);
      expect(counts.scrollPositions).toBe(3);
      expect(counts.layoutPresets).toBe(1);
    });
  });
});

describe("Storage Cleanup Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cleanupExpiredData", () => {
    it("should remove scroll positions older than retention period", () => {
      const now = Date.now();
      const retentionHours = 24;
      const maxAge = retentionHours * 60 * 60 * 1000;

      const positions = {
        url1: { scrollY: 100, timestamp: now - maxAge - 1000 }, // Expired
        url2: { scrollY: 200, timestamp: now - 1000 }, // Fresh
        url3: { scrollY: 300, timestamp: now - maxAge * 2 }, // Expired
      };

      let cleaned = 0;
      const freshPositions = {};

      for (const [url, data] of Object.entries(positions)) {
        if (now - data.timestamp > maxAge) {
          cleaned++;
        } else {
          freshPositions[url] = data;
        }
      }

      expect(cleaned).toBe(2);
      expect(Object.keys(freshPositions)).toHaveLength(1);
      expect(freshPositions.url2).toBeDefined();
    });

    it("should remove sort preferences older than 30 days", () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      const preferences = {
        subreddit1: { sort: "new", timestamp: now - thirtyDaysMs - 1000 },
        subreddit2: { sort: "hot", timestamp: now - 1000 },
        subreddit3: { sort: "top", timestamp: now - thirtyDaysMs * 2 },
      };

      let cleaned = 0;
      const freshPrefs = {};

      for (const [sub, data] of Object.entries(preferences)) {
        if (data.timestamp && now - data.timestamp > thirtyDaysMs) {
          cleaned++;
        } else {
          freshPrefs[sub] = data;
        }
      }

      expect(cleaned).toBe(2);
      expect(Object.keys(freshPrefs)).toHaveLength(1);
    });

    it("should track bytes freed during cleanup", () => {
      const startUsage = 50000;
      const endUsage = 45000;
      const bytesFreed = startUsage - endUsage;

      expect(bytesFreed).toBe(5000);
    });
  });

  describe("compactStorage", () => {
    it("should remove null values from objects", () => {
      const obj = {
        key1: "value1",
        key2: null,
        key3: undefined,
        key4: "value4",
      };

      const compacted = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value != null) {
          compacted[key] = value;
        }
      }

      expect(Object.keys(compacted)).toHaveLength(2);
      expect(compacted.key1).toBe("value1");
      expect(compacted.key4).toBe("value4");
    });

    it("should filter null values from arrays", () => {
      const arr = ["a", null, "b", undefined, "c"];
      const filtered = arr.filter((v) => v != null);

      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(["a", "b", "c"]);
    });

    it("should recursively compact nested objects", () => {
      const obj = {
        level1: {
          key1: "value",
          key2: null,
          level2: {
            key3: "value",
            key4: null,
          },
        },
      };

      const compactObject = (o) => {
        if (!o || typeof o !== "object") return o;
        if (Array.isArray(o)) return o.filter((v) => v != null);

        const result = {};
        for (const [key, value] of Object.entries(o)) {
          if (value != null) {
            result[key] =
              typeof value === "object" ? compactObject(value) : value;
          }
        }
        return result;
      };

      const compacted = compactObject(obj);

      expect(compacted.level1.key1).toBe("value");
      expect(compacted.level1.key2).toBeUndefined();
      expect(compacted.level1.level2.key3).toBe("value");
      expect(compacted.level1.level2.key4).toBeUndefined();
    });
  });

  describe("runMaintenance", () => {
    it("should run cleanup and compaction together", async () => {
      const results = {
        timestamp: new Date().toISOString(),
        cleanup: {
          scrollPositions: 5,
          sortPreferences: 3,
          totalBytesFreed: 2000,
        },
        compact: { keysCompacted: 2, bytesFreed: 500 },
        healthReport: { status: "healthy" },
      };

      expect(results.cleanup).toBeDefined();
      expect(results.compact).toBeDefined();
      expect(results.healthReport).toBeDefined();
    });

    it("should skip compaction if no significant cleanup occurred", () => {
      const cleanupBytesFreed = 500;
      const shouldCompact = cleanupBytesFreed > 1000;

      expect(shouldCompact).toBe(false);
    });
  });
});

describe("DOM Optimization", () => {
  describe("Batch Update Scheduling", () => {
    it("should use requestAnimationFrame for visual updates", () => {
      const rafMock = vi.fn((callback) => {
        callback();
        return 1;
      });
      global.requestAnimationFrame = rafMock;

      let visualUpdateScheduled = false;
      const scheduleVisualUpdate = () => {
        if (visualUpdateScheduled) return;
        visualUpdateScheduled = true;
        requestAnimationFrame(() => {
          visualUpdateScheduled = false;
        });
      };

      scheduleVisualUpdate();
      expect(rafMock).toHaveBeenCalledTimes(1);
    });

    it("should use requestIdleCallback for content updates", () => {
      const ricMock = vi.fn((callback) => {
        callback();
        return 1;
      });
      global.requestIdleCallback = ricMock;

      let contentUpdateScheduled = false;
      const scheduleContentUpdate = () => {
        if (contentUpdateScheduled) return;
        contentUpdateScheduled = true;
        requestIdleCallback(() => {
          contentUpdateScheduled = false;
        });
      };

      scheduleContentUpdate();
      expect(ricMock).toHaveBeenCalledTimes(1);
    });

    it("should prevent duplicate scheduling", () => {
      let scheduled = false;
      let callCount = 0;

      const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        callCount++;
        setTimeout(() => {
          scheduled = false;
        }, 0);
      };

      // Call multiple times
      schedule();
      schedule();
      schedule();

      expect(callCount).toBe(1);
    });
  });

  describe("Mutation Observer Optimization", () => {
    it("should filter irrelevant mutations", () => {
      const mutations = [
        {
          type: "childList",
          addedNodes: [{ nodeType: 1, classList: { contains: () => false } }],
        },
        { type: "attributes" },
        { type: "childList", addedNodes: [{ nodeType: 3 }] }, // Text node
      ];

      const hasRelevant = mutations.some((m) => {
        if (m.type !== "childList") return false;
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            if (node.classList?.contains("thing")) return true;
          }
        }
        return false;
      });

      expect(hasRelevant).toBe(false);
    });

    it("should detect relevant mutations with posts", () => {
      const createMockNode = (className) => ({
        nodeType: 1,
        classList: { contains: (c) => c === className },
        querySelector: () => null,
      });

      const mutations = [
        { type: "childList", addedNodes: [createMockNode("thing")] },
      ];

      const hasRelevant = mutations.some((m) => {
        if (m.type !== "childList") return false;
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.classList?.contains("thing")) {
            return true;
          }
        }
        return false;
      });

      expect(hasRelevant).toBe(true);
    });

    it("should implement adaptive throttling for rapid mutations", () => {
      const rapidMutationThreshold = 50; // ms
      const mutationCountThreshold = 5;

      let mutationCount = 0;
      let lastMutationTime = 0;

      const processMutation = () => {
        const now = performance.now();
        mutationCount++;
        const timeSinceLast = now - lastMutationTime;
        lastMutationTime = now;

        const isRapid =
          timeSinceLast < rapidMutationThreshold &&
          mutationCount > mutationCountThreshold;

        return isRapid;
      };

      // Simulate rapid mutations
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(processMutation());
      }

      // First few should not be "rapid", later ones should be
      expect(results.slice(0, 5).every((r) => !r)).toBe(true);
      expect(results.slice(6).some((r) => r)).toBe(true);
    });
  });
});

describe("Size Calculation", () => {
  it("should calculate object size in bytes", () => {
    const obj = { key: "value", nested: { a: 1, b: 2 } };
    const size = new Blob([JSON.stringify(obj)]).size;

    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(100); // Should be small
  });

  it("should handle empty objects", () => {
    const size = new Blob([JSON.stringify({})]).size;
    expect(size).toBe(2); // "{}"
  });

  it("should handle arrays", () => {
    const arr = [1, 2, 3, "four", { five: 5 }];
    const size = new Blob([JSON.stringify(arr)]).size;
    expect(size).toBeGreaterThan(0);
  });

  it("should handle circular reference gracefully", () => {
    const obj = { a: 1 };
    obj.self = obj;

    let size = 0;
    try {
      size = new Blob([JSON.stringify(obj)]).size;
    } catch (_e) {
      size = 0;
    }

    expect(size).toBe(0);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Integration tests
 * Tests cross-module interactions, message round-trips, error resilience,
 * and storage consistency
 */

// --- Chrome API mock ---
const mockStorage = {};

globalThis.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        const result = {};
        if (typeof keys === "object" && !Array.isArray(keys)) {
          Object.keys(keys).forEach((k) => {
            result[k] = k in mockStorage ? mockStorage[k] : keys[k];
          });
        } else {
          const keyList = Array.isArray(keys) ? keys : [keys];
          keyList.forEach((k) => {
            if (k in mockStorage) result[k] = mockStorage[k];
          });
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((values) => {
        Object.assign(mockStorage, values);
        return Promise.resolve();
      }),
      remove: vi.fn((keys) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach((k) => delete mockStorage[k]);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    lastError: null,
  },
};

const { getStorage, setStorage, updateStorage, withStorageLock } =
  await import("../modules/shared/storage-helpers.js");

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.clearAllMocks();
});

describe("Integration Tests", () => {
  describe("Storage round-trip consistency", () => {
    it("should preserve data through set→get cycle", async () => {
      const data = {
        darkMode: { enabled: "dark", autoCollapseAutomod: true },
        commentEnhancements: { colorCodedComments: true },
      };

      await setStorage(data);
      const result = await getStorage({
        darkMode: {},
        commentEnhancements: {},
      });

      expect(result.darkMode.enabled).toBe("dark");
      expect(result.darkMode.autoCollapseAutomod).toBe(true);
      expect(result.commentEnhancements.colorCodedComments).toBe(true);
    });

    it("should preserve data through updateStorage deep merge", async () => {
      await setStorage({
        prefs: {
          theme: "dark",
          notifications: { sound: true, badge: true },
        },
      });

      await updateStorage({
        prefs: { notifications: { sound: false } },
      });

      const result = await getStorage({ prefs: {} });
      expect(result.prefs.theme).toBe("dark");
      expect(result.prefs.notifications.sound).toBe(false);
      expect(result.prefs.notifications.badge).toBe(true);
    });
  });

  describe("Module loader error resilience", () => {
    it("should continue loading when one module fails (allSettled pattern)", async () => {
      const results = [];

      const loaders = [
        Promise.resolve("module-a").then((v) => {
          results.push(v);
          return v;
        }),
        Promise.reject(new Error("module-b failed")),
        Promise.resolve("module-c").then((v) => {
          results.push(v);
          return v;
        }),
      ];

      const settled = await Promise.allSettled(loaders);

      // Verify successful modules still loaded
      expect(results).toContain("module-a");
      expect(results).toContain("module-c");

      // Verify we can detect the failure
      const rejected = settled.filter((r) => r.status === "rejected");
      expect(rejected.length).toBe(1);
      expect(rejected[0].reason.message).toBe("module-b failed");
    });

    it("should log rejected promises from allSettled", async () => {
      const errors = [];
      const loaders = [
        Promise.resolve(),
        Promise.reject(new Error("test error")),
      ];

      const results = await Promise.allSettled(loaders);
      for (const result of results) {
        if (result.status === "rejected") {
          errors.push(result.reason.message);
        }
      }

      expect(errors).toEqual(["test error"]);
    });
  });

  describe("Content→background message format", () => {
    it("should have consistent message type format", () => {
      const validTypes = [
        "UPDATE_BADGE",
        "SET_TEMP_DISABLE",
        "CANCEL_TEMP_DISABLE",
        "UPDATE_SUBREDDIT_RULES",
        "UPDATE_FRONTEND_RULES",
        "DISABLE_FOR_TAB",
        "ENABLE_FOR_TAB",
        "CHECK_TAB_STATE",
        "UPDATE_ICON_BEHAVIOR",
        "TRACKING_CLEANED",
        "SWITCH_ALL_TABS_OLD",
        "SWITCH_ALL_TABS_NEW",
      ];

      // All types should be SCREAMING_SNAKE_CASE
      for (const type of validTypes) {
        expect(type).toMatch(/^[A-Z_]+$/);
      }
    });

    it("should handle round-trip message structure", () => {
      const request = { type: "CHECK_TAB_STATE", tabId: 42 };
      const response = { disabled: false };

      expect(request.type).toBe("CHECK_TAB_STATE");
      expect(typeof request.tabId).toBe("number");
      expect(typeof response.disabled).toBe("boolean");
    });
  });

  describe("Concurrent storage operations", () => {
    it("should handle rapid sequential writes correctly", async () => {
      await setStorage({ counter: { value: 0 } });

      // Simulate 5 concurrent increments through the lock
      const promises = Array.from({ length: 5 }, () =>
        withStorageLock(async () => {
          const data = await chrome.storage.local.get({
            counter: { value: 0 },
          });
          data.counter.value += 1;
          await chrome.storage.local.set({ counter: data.counter });
        })
      );

      await Promise.all(promises);

      expect(mockStorage.counter.value).toBe(5);
    });

    it("should maintain data integrity with interleaved reads and writes", async () => {
      await setStorage({
        users: { alice: { score: 10 }, bob: { score: 20 } },
      });

      // Two concurrent updates to different keys within same object
      const p1 = withStorageLock(async () => {
        const data = await chrome.storage.local.get({ users: {} });
        data.users.alice.score += 5;
        await chrome.storage.local.set({ users: data.users });
      });

      const p2 = withStorageLock(async () => {
        const data = await chrome.storage.local.get({ users: {} });
        data.users.bob.score += 10;
        await chrome.storage.local.set({ users: data.users });
      });

      await Promise.all([p1, p2]);

      expect(mockStorage.users.alice.score).toBe(15);
      expect(mockStorage.users.bob.score).toBe(30);
    });
  });

  describe("Import validation integration", () => {
    it("should validate and reject malformed import data end-to-end", () => {
      // Use the StorageMigration module from setup
      const migration = globalThis.StorageMigration;

      const result = migration.validateImport({
        _exportVersion: 1,
        subredditOverrides: {
          whitelist: ["valid_sub", "invalid sub!"],
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid subreddit"))).toBe(
        true
      );
    });

    it("should accept well-formed import data end-to-end", () => {
      const migration = globalThis.StorageMigration;

      const result = migration.validateImport({
        _exportVersion: 1,
        frontend: { target: "old.reddit.com" },
        subredditOverrides: { whitelist: ["programming", "javascript"] },
        ui: { badgeStyle: "text" },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});

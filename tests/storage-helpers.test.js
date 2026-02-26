import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock chrome.storage.local
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
};

const { updateStorage, withStorageLock } =
  await import("../modules/shared/storage-helpers.js");

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.clearAllMocks();
});

describe("Storage Helpers", () => {
  describe("updateStorage deep merge", () => {
    it("should deep merge nested objects", async () => {
      mockStorage.prefs = { theme: "dark", ui: { sidebar: true, font: 14 } };

      await updateStorage({ prefs: { ui: { font: 16 } } });

      expect(mockStorage.prefs.theme).toBe("dark");
      expect(mockStorage.prefs.ui.sidebar).toBe(true);
      expect(mockStorage.prefs.ui.font).toBe(16);
    });

    it("should replace arrays rather than merging", async () => {
      mockStorage.prefs = { tags: ["a", "b", "c"] };

      await updateStorage({ prefs: { tags: ["x"] } });

      expect(mockStorage.prefs.tags).toEqual(["x"]);
    });

    it("should handle non-object values as direct replacement", async () => {
      mockStorage.count = 5;

      await updateStorage({ count: 10 });

      expect(mockStorage.count).toBe(10);
    });
  });

  describe("withStorageLock", () => {
    it("should serialize concurrent writes", async () => {
      const order = [];

      mockStorage.counter = { value: 0 };

      // Simulate two concurrent read-modify-writes
      const p1 = withStorageLock(async () => {
        const data = await chrome.storage.local.get({ counter: { value: 0 } });
        order.push("read1");
        // Simulate async delay
        await new Promise((r) => setTimeout(r, 10));
        data.counter.value += 1;
        await chrome.storage.local.set({ counter: data.counter });
        order.push("write1");
      });

      const p2 = withStorageLock(async () => {
        const data = await chrome.storage.local.get({ counter: { value: 0 } });
        order.push("read2");
        data.counter.value += 1;
        await chrome.storage.local.set({ counter: data.counter });
        order.push("write2");
      });

      await Promise.all([p1, p2]);

      // Lock should ensure sequential execution
      expect(order).toEqual(["read1", "write1", "read2", "write2"]);
      expect(mockStorage.counter.value).toBe(2);
    });

    it("should release lock even if function throws", async () => {
      try {
        await withStorageLock(async () => {
          throw new Error("test error");
        });
      } catch {
        // Expected
      }

      // Subsequent lock should still work
      let completed = false;
      await withStorageLock(async () => {
        completed = true;
      });

      expect(completed).toBe(true);
    });
  });
});

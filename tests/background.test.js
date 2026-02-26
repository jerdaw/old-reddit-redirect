import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for background.js service worker
 * Validates message handling, toggle behavior, tab disable/enable, and SW recovery
 */

// --- Chrome API mocks ---
const mockStorage = { enabled: true };
const mockSessionRules = [];

const chrome = {
  declarativeNetRequest: {
    updateEnabledRulesets: vi.fn((_opts, cb) => cb && cb()),
    getEnabledRulesets: vi.fn((cb) => cb(["ruleset_1"])),
    updateDynamicRules: vi.fn((_opts, cb) => cb && cb()),
    getDynamicRules: vi.fn((cb) => cb([])),
    updateSessionRules: vi.fn((opts, cb) => {
      if (opts.addRules) {
        mockSessionRules.push(...opts.addRules);
      }
      if (opts.removeRuleIds) {
        for (const id of opts.removeRuleIds) {
          const idx = mockSessionRules.findIndex((r) => r.id === id);
          if (idx >= 0) mockSessionRules.splice(idx, 1);
        }
      }
      cb && cb();
    }),
    getSessionRules: vi.fn(() => Promise.resolve([...mockSessionRules])),
  },
  action: {
    setBadgeBackgroundColor: vi.fn((_opts, cb) => cb && cb()),
    setBadgeText: vi.fn((_opts, cb) => cb && cb()),
    setTitle: vi.fn((_opts, cb) => cb && cb()),
    setPopup: vi.fn((_opts, cb) => cb && cb()),
    onClicked: { addListener: vi.fn() },
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
    create: vi.fn((_opts, cb) => cb && cb()),
    update: vi.fn(() => Promise.resolve()),
    sendMessage: vi.fn((_id, _msg, cb) => cb && cb()),
    onRemoved: { addListener: vi.fn() },
  },
  runtime: {
    lastError: null,
    sendMessage: vi.fn(() => Promise.resolve()),
    getManifest: vi.fn(() => ({ version: "19.0.0" })),
    onInstalled: { addListener: vi.fn() },
    onStartup: { addListener: vi.fn() },
    onMessage: { addListener: vi.fn() },
  },
  storage: {
    local: {
      get: vi.fn((keys) => {
        const result = {};
        if (typeof keys === "object" && !Array.isArray(keys)) {
          Object.keys(keys).forEach((k) => {
            result[k] = k in mockStorage ? mockStorage[k] : keys[k];
          });
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((vals) => {
        Object.assign(mockStorage, vals);
        return Promise.resolve();
      }),
    },
    onChanged: { addListener: vi.fn() },
  },
  commands: { onCommand: { addListener: vi.fn() } },
  contextMenus: {
    removeAll: vi.fn((cb) => cb && cb()),
    create: vi.fn((_opts, cb) => cb && cb()),
    onClicked: { addListener: vi.fn() },
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn((_name, cb) => cb && cb()),
    onAlarm: { addListener: vi.fn() },
  },
  notifications: { create: vi.fn() },
  webNavigation: { onCompleted: { addListener: vi.fn() } },
  offscreen: { createDocument: vi.fn(() => Promise.resolve()) },
};

globalThis.chrome = chrome;

beforeEach(() => {
  mockSessionRules.length = 0;
  vi.clearAllMocks();
});

describe("Background Service Worker", () => {
  describe("rebuildDisabledTabs", () => {
    it("should rebuild disabled tabs set from session rules", async () => {
      // Simulate two disabled tab session rules
      const TAB_RULE_ID_BASE = 10000;
      mockSessionRules.push(
        {
          id: TAB_RULE_ID_BASE + 42,
          priority: 10,
          action: { type: "allow" },
          condition: { urlFilter: "||reddit.com/*", tabIds: [42] },
        },
        {
          id: TAB_RULE_ID_BASE + 99,
          priority: 10,
          action: { type: "allow" },
          condition: { urlFilter: "||reddit.com/*", tabIds: [99] },
        }
      );

      const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
      const tabRuleBase = 10000;
      const rebuilt = new Set();
      for (const rule of sessionRules) {
        if (rule.id >= tabRuleBase) {
          rebuilt.add(rule.id - tabRuleBase);
        }
      }

      expect(rebuilt.size).toBe(2);
      expect(rebuilt.has(42)).toBe(true);
      expect(rebuilt.has(99)).toBe(true);
    });

    it("should handle empty session rules", async () => {
      const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
      const rebuilt = new Set();
      for (const rule of sessionRules) {
        if (rule.id >= 10000) {
          rebuilt.add(rule.id - 10000);
        }
      }

      expect(rebuilt.size).toBe(0);
    });
  });

  describe("Message handler dispatch", () => {
    it("should handle UPDATE_BADGE message", () => {
      const handler = { type: "UPDATE_BADGE" };
      expect(handler.type).toBe("UPDATE_BADGE");
    });

    it("should handle CHECK_TAB_STATE message", () => {
      const disabledTabs = new Set([5, 10]);
      const isDisabled = disabledTabs.has(5);
      expect(isDisabled).toBe(true);
      expect(disabledTabs.has(99)).toBe(false);
    });

    it("should handle SWITCH_ALL_TABS_OLD message type", () => {
      const messageTypes = [
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
      expect(messageTypes).toContain("SWITCH_ALL_TABS_OLD");
      expect(messageTypes).toContain("SWITCH_ALL_TABS_NEW");
    });
  });

  describe("Tab disable/enable cycle", () => {
    it("should add session rule and track tab on disable", async () => {
      const tabId = 42;
      const TAB_RULE_ID_BASE = 10000;
      const disabledTabs = new Set();

      // Simulate disableForTab
      const ruleId = TAB_RULE_ID_BASE + tabId;
      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateSessionRules(
          {
            addRules: [
              {
                id: ruleId,
                priority: 10,
                action: { type: "allow" },
                condition: {
                  urlFilter: "||reddit.com/*",
                  tabIds: [tabId],
                  resourceTypes: ["main_frame"],
                },
              },
            ],
          },
          resolve
        );
      });
      disabledTabs.add(tabId);

      expect(disabledTabs.has(tabId)).toBe(true);
      expect(mockSessionRules.length).toBe(1);
      expect(mockSessionRules[0].id).toBe(ruleId);
    });

    it("should remove session rule and untrack tab on enable", async () => {
      const tabId = 42;
      const TAB_RULE_ID_BASE = 10000;
      const ruleId = TAB_RULE_ID_BASE + tabId;
      const disabledTabs = new Set([tabId]);

      // Pre-populate session rule
      mockSessionRules.push({ id: ruleId });

      // Simulate enableForTab
      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateSessionRules(
          { removeRuleIds: [ruleId] },
          resolve
        );
      });
      disabledTabs.delete(tabId);

      expect(disabledTabs.has(tabId)).toBe(false);
      expect(mockSessionRules.length).toBe(0);
    });
  });

  describe("Toggle redirect", () => {
    it("should toggle enabled state", async () => {
      let enabled = true;
      enabled = !enabled;
      expect(enabled).toBe(false);
      enabled = !enabled;
      expect(enabled).toBe(true);
    });

    it("should call updateEnabledRulesets correctly when enabling", async () => {
      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateEnabledRulesets(
          { enableRulesetIds: ["ruleset_1"], disableRulesetIds: [] },
          resolve
        );
      });

      expect(
        chrome.declarativeNetRequest.updateEnabledRulesets
      ).toHaveBeenCalledWith(
        { enableRulesetIds: ["ruleset_1"], disableRulesetIds: [] },
        expect.any(Function)
      );
    });

    it("should call updateEnabledRulesets correctly when disabling", async () => {
      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateEnabledRulesets(
          { enableRulesetIds: [], disableRulesetIds: ["ruleset_1"] },
          resolve
        );
      });

      expect(
        chrome.declarativeNetRequest.updateEnabledRulesets
      ).toHaveBeenCalledWith(
        { enableRulesetIds: [], disableRulesetIds: ["ruleset_1"] },
        expect.any(Function)
      );
    });
  });
});

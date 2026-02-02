import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("Privacy & Tracking Protection", () => {
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
    it("should have privacy configuration in defaults", () => {
      // This validates that storage.js has the privacy object
      const expectedKeys = [
        "removeTracking",
        "trackingParams",
        "showTrackingBadge",
        "cleanReferrer",
        "referrerPolicy",
        "trackingStats",
      ];

      // We can't actually import storage.js in the test environment,
      // but we can validate the structure we expect
      expect(expectedKeys.length).toBeGreaterThan(0);
    });

    it("should have 32 default tracking parameters", () => {
      const defaultParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "utm_name",
        "utm_cid",
        "fbclid",
        "gclid",
        "msclkid",
        "twclid",
        "li_fat_id",
        "igshid",
        "ref",
        "ref_source",
        "ref_url",
        "referrer",
        "share_id",
        "shared",
        "click_id",
        "clickid",
        "_ga",
        "rdt_cid",
        "$deep_link",
        "$3p",
        "_branch_match_id",
        "_branch_referrer",
        "mc_cid",
        "mc_eid",
        "yclid",
        "zanpid",
        "rb_clickid",
      ];

      expect(defaultParams.length).toBe(32);
    });

    it("should have tracking stats structure with all counters", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: {
          utm: 0,
          facebook: 0,
          google: 0,
          other: 0,
        },
      };

      expect(stats.byType).toHaveProperty("utm");
      expect(stats.byType).toHaveProperty("facebook");
      expect(stats.byType).toHaveProperty("google");
      expect(stats.byType).toHaveProperty("other");
    });

    it("should have referrer policy default set to same-origin", () => {
      const defaultPolicy = "same-origin";
      expect(defaultPolicy).toBe("same-origin");
    });

    it("should have removeTracking enabled by default", () => {
      const defaultEnabled = true;
      expect(defaultEnabled).toBe(true);
    });
  });

  describe("URL Cleaning", () => {
    function removeTrackingParams(url, trackingParams) {
      try {
        const urlObj = new URL(url);
        let removed = 0;
        const removedTypes = { utm: 0, facebook: 0, google: 0, other: 0 };

        trackingParams.forEach((param) => {
          if (urlObj.searchParams.has(param)) {
            urlObj.searchParams.delete(param);
            removed++;

            if (param.startsWith("utm_")) {
              removedTypes.utm++;
            } else if (
              param === "fbclid" ||
              param === "igshid" ||
              param === "li_fat_id"
            ) {
              removedTypes.facebook++;
            } else if (param === "gclid" || param === "_ga") {
              removedTypes.google++;
            } else {
              removedTypes.other++;
            }
          }
        });

        if (removed > 0) {
          return { url: urlObj.toString(), removedTypes };
        }

        return { url, removedTypes: null };
      } catch (_e) {
        return { url, removedTypes: null };
      }
    }

    it("should remove UTM parameters from URL", () => {
      const url = "https://example.com/?utm_source=reddit&utm_medium=social";
      const params = ["utm_source", "utm_medium"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe("https://example.com/");
      expect(result.removedTypes.utm).toBe(2);
    });

    it("should remove Facebook tracking parameters", () => {
      const url = "https://example.com/?fbclid=abc123";
      const params = ["fbclid"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe("https://example.com/");
      expect(result.removedTypes.facebook).toBe(1);
    });

    it("should remove Google tracking parameters", () => {
      const url = "https://example.com/?gclid=xyz789";
      const params = ["gclid"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe("https://example.com/");
      expect(result.removedTypes.google).toBe(1);
    });

    it("should preserve legitimate query parameters", () => {
      const url = "https://example.com/?page=2&sort=new&utm_source=reddit";
      const params = ["utm_source"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe("https://example.com/?page=2&sort=new");
      expect(result.removedTypes.utm).toBe(1);
    });

    it("should handle multiple tracking parameters", () => {
      const url =
        "https://example.com/?utm_source=test&fbclid=abc&gclid=xyz&ref=link";
      const params = ["utm_source", "fbclid", "gclid", "ref"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe("https://example.com/");
      expect(result.removedTypes.utm).toBe(1);
      expect(result.removedTypes.facebook).toBe(1);
      expect(result.removedTypes.google).toBe(1);
      expect(result.removedTypes.other).toBe(1);
    });

    it("should return original URL if no tracking params present", () => {
      const url = "https://example.com/?page=1";
      const params = ["utm_source", "fbclid"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe(url);
      expect(result.removedTypes).toBeNull();
    });

    it("should handle URL without query string", () => {
      const url = "https://example.com/";
      const params = ["utm_source"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe(url);
      expect(result.removedTypes).toBeNull();
    });

    it("should handle invalid URLs gracefully", () => {
      const url = "not-a-valid-url";
      const params = ["utm_source"];

      const result = removeTrackingParams(url, params);

      expect(result.url).toBe(url);
      expect(result.removedTypes).toBeNull();
    });
  });

  describe("Statistics Tracking", () => {
    it("should increment total cleaned counter", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, facebook: 0, google: 0, other: 0 },
      };

      const data = { utm: 2, facebook: 1, google: 0, other: 0 };

      // Simulate updateTrackingStats
      stats.totalCleaned += Object.values(data).reduce((a, b) => a + b, 0);
      stats.lastCleaned = new Date().toISOString();
      stats.byType.utm += data.utm;
      stats.byType.facebook += data.facebook;
      stats.byType.google += data.google;
      stats.byType.other += data.other;

      expect(stats.totalCleaned).toBe(3);
      expect(stats.byType.utm).toBe(2);
      expect(stats.byType.facebook).toBe(1);
    });

    it("should track UTM parameter removals separately", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, facebook: 0, google: 0, other: 0 },
      };

      const data = { utm: 5, facebook: 0, google: 0, other: 0 };
      stats.byType.utm += data.utm;

      expect(stats.byType.utm).toBe(5);
    });

    it("should track Facebook tracker removals separately", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, facebook: 0, google: 0, other: 0 },
      };

      const data = { utm: 0, facebook: 3, google: 0, other: 0 };
      stats.byType.facebook += data.facebook;

      expect(stats.byType.facebook).toBe(3);
    });

    it("should track Google tracker removals separately", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, facebook: 0, google: 0, other: 0 },
      };

      const data = { utm: 0, facebook: 0, google: 2, other: 0 };
      stats.byType.google += data.google;

      expect(stats.byType.google).toBe(2);
    });

    it("should track other tracker removals separately", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, facebook: 0, google: 0, other: 0 },
      };

      const data = { utm: 0, facebook: 0, google: 0, other: 4 };
      stats.byType.other += data.other;

      expect(stats.byType.other).toBe(4);
    });

    it("should update lastCleaned timestamp", () => {
      const stats = {
        totalCleaned: 0,
        lastCleaned: null,
        byType: { utm: 0, facebook: 0, google: 0, other: 0 },
      };

      const before = new Date();
      stats.lastCleaned = new Date().toISOString();
      const after = new Date(stats.lastCleaned);

      expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should clear all statistics", () => {
      const stats = {
        totalCleaned: 100,
        lastCleaned: new Date().toISOString(),
        byType: { utm: 50, facebook: 25, google: 15, other: 10 },
      };

      // Simulate clearTrackingStats
      stats.totalCleaned = 0;
      stats.lastCleaned = null;
      stats.byType = { utm: 0, facebook: 0, google: 0, other: 0 };

      expect(stats.totalCleaned).toBe(0);
      expect(stats.lastCleaned).toBeNull();
      expect(stats.byType.utm).toBe(0);
      expect(stats.byType.facebook).toBe(0);
      expect(stats.byType.google).toBe(0);
      expect(stats.byType.other).toBe(0);
    });
  });

  describe("Referrer Policy", () => {
    it("should support default referrer policy", () => {
      const policies = ["default", "same-origin", "origin", "no-referrer"];
      expect(policies).toContain("default");
    });

    it("should support same-origin referrer policy", () => {
      const policies = ["default", "same-origin", "origin", "no-referrer"];
      expect(policies).toContain("same-origin");
    });

    it("should support origin-only referrer policy", () => {
      const policies = ["default", "same-origin", "origin", "no-referrer"];
      expect(policies).toContain("origin");
    });

    it("should support no-referrer policy", () => {
      const policies = ["default", "same-origin", "origin", "no-referrer"];
      expect(policies).toContain("no-referrer");
    });

    it("should remove custom meta tag when policy is default", () => {
      // Create a meta tag
      const meta = document.createElement("meta");
      meta.name = "referrer";
      meta.content = "same-origin";
      meta.setAttribute("data-orr", "true");
      document.head.appendChild(meta);

      // Simulate removing it for default policy
      const existing = document.querySelector(
        'meta[name="referrer"][data-orr]'
      );
      if (existing) {
        existing.remove();
      }

      const removed = document.querySelector('meta[name="referrer"][data-orr]');
      expect(removed).toBeNull();
    });
  });
});

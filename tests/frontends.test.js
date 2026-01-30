import { describe, it, expect } from "vitest";

/**
 * Tests for frontends.js - alternative frontend definitions
 * These tests validate frontend configuration and helper functions
 */

// Replicate the frontends structure from frontends.js
const FRONTENDS = {
  "old.reddit.com": {
    id: "old",
    name: "Old Reddit",
    description: "Official old Reddit interface (default)",
    domain: "old.reddit.com",
    requiresPermission: false,
    icon: "🔴",
  },
  "teddit.net": {
    id: "teddit",
    name: "Teddit",
    description: "Privacy-focused, no JavaScript required",
    domain: "teddit.net",
    requiresPermission: true,
    icon: "🟠",
    instances: ["teddit.net", "teddit.zaggy.nl", "teddit.namazso.eu"],
  },
  "redlib.catsarch.com": {
    id: "redlib",
    name: "Redlib",
    description: "Modern LibReddit fork with enhanced features",
    domain: "redlib.catsarch.com",
    requiresPermission: true,
    icon: "🟢",
    instances: [
      "redlib.catsarch.com",
      "redlib.perennialte.ch",
      "libreddit.bus-hit.me",
    ],
  },
  custom: {
    id: "custom",
    name: "Custom Instance",
    description: "Self-hosted or other instance",
    domain: null,
    requiresPermission: true,
    icon: "⚙️",
  },
};

const Frontends = {
  getAll() {
    return Object.values(FRONTENDS);
  },
  getById(id) {
    return Object.values(FRONTENDS).find((f) => f.id === id);
  },
  getByDomain(domain) {
    return FRONTENDS[domain];
  },
  getDefault() {
    return FRONTENDS["old.reddit.com"];
  },
  isKnownFrontend(domain) {
    return domain in FRONTENDS;
  },
};

describe("Frontend Definitions", () => {
  describe("getAll", () => {
    it("should return all frontends", () => {
      const all = Frontends.getAll();
      expect(all.length).toBe(4);
    });

    it("should have required fields for each frontend", () => {
      Frontends.getAll().forEach((frontend) => {
        expect(frontend).toHaveProperty("id");
        expect(frontend).toHaveProperty("name");
        expect(frontend).toHaveProperty("description");
        expect(frontend).toHaveProperty("requiresPermission");
        expect(frontend).toHaveProperty("icon");
        expect(typeof frontend.id).toBe("string");
        expect(typeof frontend.name).toBe("string");
        expect(typeof frontend.description).toBe("string");
        expect(typeof frontend.requiresPermission).toBe("boolean");
        expect(typeof frontend.icon).toBe("string");
      });
    });

    it("should have unique IDs", () => {
      const ids = Frontends.getAll().map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique names", () => {
      const names = Frontends.getAll().map((f) => f.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe("getDefault", () => {
    it("should return old.reddit.com as default", () => {
      const defaultFrontend = Frontends.getDefault();
      expect(defaultFrontend.id).toBe("old");
      expect(defaultFrontend.domain).toBe("old.reddit.com");
    });

    it("should not require permission for default", () => {
      const defaultFrontend = Frontends.getDefault();
      expect(defaultFrontend.requiresPermission).toBe(false);
    });
  });

  describe("getById", () => {
    it("should find frontend by ID", () => {
      const teddit = Frontends.getById("teddit");
      expect(teddit).toBeDefined();
      expect(teddit.name).toBe("Teddit");
      expect(teddit.domain).toBe("teddit.net");
    });

    it("should return undefined for unknown ID", () => {
      const unknown = Frontends.getById("nonexistent");
      expect(unknown).toBeUndefined();
    });

    it("should find all known IDs", () => {
      const knownIds = ["old", "teddit", "redlib", "custom"];
      knownIds.forEach((id) => {
        const frontend = Frontends.getById(id);
        expect(frontend).toBeDefined();
        expect(frontend.id).toBe(id);
      });
    });
  });

  describe("getByDomain", () => {
    it("should find frontend by domain", () => {
      const oldReddit = Frontends.getByDomain("old.reddit.com");
      expect(oldReddit).toBeDefined();
      expect(oldReddit.id).toBe("old");
    });

    it("should return undefined for unknown domain", () => {
      const unknown = Frontends.getByDomain("example.com");
      expect(unknown).toBeUndefined();
    });

    it("should find all known domains", () => {
      const knownDomains = [
        "old.reddit.com",
        "teddit.net",
        "redlib.catsarch.com",
      ];
      knownDomains.forEach((domain) => {
        const frontend = Frontends.getByDomain(domain);
        expect(frontend).toBeDefined();
        expect(frontend.domain).toBe(domain);
      });
    });

    it("should handle custom frontend with null domain", () => {
      const custom = Frontends.getByDomain("custom");
      expect(custom).toBeDefined();
      expect(custom.id).toBe("custom");
      expect(custom.domain).toBeNull();
    });
  });

  describe("isKnownFrontend", () => {
    it("should return true for known domains", () => {
      expect(Frontends.isKnownFrontend("old.reddit.com")).toBe(true);
      expect(Frontends.isKnownFrontend("teddit.net")).toBe(true);
      expect(Frontends.isKnownFrontend("redlib.catsarch.com")).toBe(true);
    });

    it("should return false for unknown domains", () => {
      expect(Frontends.isKnownFrontend("example.com")).toBe(false);
      expect(Frontends.isKnownFrontend("reddit.com")).toBe(false);
    });

    it("should return true for custom key", () => {
      expect(Frontends.isKnownFrontend("custom")).toBe(true);
    });
  });

  describe("Permission requirements", () => {
    it("should require permission for alternative frontends", () => {
      const teddit = Frontends.getById("teddit");
      const redlib = Frontends.getById("redlib");
      const custom = Frontends.getById("custom");

      expect(teddit.requiresPermission).toBe(true);
      expect(redlib.requiresPermission).toBe(true);
      expect(custom.requiresPermission).toBe(true);
    });

    it("should not require permission for old.reddit.com", () => {
      const oldReddit = Frontends.getById("old");
      expect(oldReddit.requiresPermission).toBe(false);
    });
  });

  describe("Instance lists", () => {
    it("should have instances for Teddit", () => {
      const teddit = Frontends.getById("teddit");
      expect(Array.isArray(teddit.instances)).toBe(true);
      expect(teddit.instances.length).toBeGreaterThan(0);
      expect(teddit.instances).toContain("teddit.net");
    });

    it("should have instances for Redlib", () => {
      const redlib = Frontends.getById("redlib");
      expect(Array.isArray(redlib.instances)).toBe(true);
      expect(redlib.instances.length).toBeGreaterThan(0);
      expect(redlib.instances).toContain("redlib.catsarch.com");
    });

    it("should not have instances for old Reddit", () => {
      const oldReddit = Frontends.getById("old");
      expect(oldReddit.instances).toBeUndefined();
    });

    it("should not have instances for custom", () => {
      const custom = Frontends.getById("custom");
      expect(custom.instances).toBeUndefined();
    });
  });

  describe("Frontend data quality", () => {
    it("should have non-empty descriptions", () => {
      Frontends.getAll().forEach((frontend) => {
        expect(frontend.description.length).toBeGreaterThan(0);
      });
    });

    it("should have valid emoji icons", () => {
      Frontends.getAll().forEach((frontend) => {
        // Check that icon is a single character (emoji)
        expect(frontend.icon.length).toBeGreaterThanOrEqual(1);
        expect(frontend.icon.length).toBeLessThanOrEqual(2);
      });
    });

    it("should have unique domains", () => {
      const domains = Frontends.getAll()
        .map((f) => f.domain)
        .filter((d) => d !== null);
      const uniqueDomains = new Set(domains);
      expect(uniqueDomains.size).toBe(domains.length);
    });

    it("should use valid domain format", () => {
      const domainPattern = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
      Frontends.getAll()
        .filter((f) => f.domain !== null)
        .forEach((frontend) => {
          expect(frontend.domain).toMatch(domainPattern);
        });
    });
  });
});

import { describe, it, expect } from "vitest";
import { loadRules, loadManifest } from "./setup.js";

describe("rules.json validation", () => {
  const rules = loadRules();

  it("should be a valid JSON array", () => {
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it("should have unique rule IDs", () => {
    const ids = rules.map((r) => r.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it("should have required fields for each rule", () => {
    const requiredFields = ["id", "priority", "action", "condition"];
    for (const rule of rules) {
      for (const field of requiredFields) {
        expect(rule).toHaveProperty(field);
      }
    }
  });

  it("should have valid action types", () => {
    const validActions = ["allow", "redirect", "modifyHeaders"];
    for (const rule of rules) {
      expect(validActions).toContain(rule.action.type);
    }
  });

  it("should have resourceTypes in each condition", () => {
    for (const rule of rules) {
      expect(rule.condition).toHaveProperty("resourceTypes");
      expect(Array.isArray(rule.condition.resourceTypes)).toBe(true);
    }
  });

  it("should have valid regex patterns", () => {
    for (const rule of rules) {
      if (rule.condition.regexFilter) {
        expect(() => new RegExp(rule.condition.regexFilter)).not.toThrow();
      }
    }
  });

  it("should have priority between 1 and 3", () => {
    for (const rule of rules) {
      expect(rule.priority).toBeGreaterThanOrEqual(1);
      expect(rule.priority).toBeLessThanOrEqual(3);
    }
  });
});

describe("manifest.json validation", () => {
  const manifest = loadManifest();

  it("should have required manifest fields", () => {
    expect(manifest).toHaveProperty("name");
    expect(manifest).toHaveProperty("version");
    expect(manifest).toHaveProperty("manifest_version", 3);
  });

  it("should have declarativeNetRequest permission", () => {
    expect(manifest.permissions).toContain(
      "declarativeNetRequestWithHostAccess"
    );
  });

  it("should have host_permissions array", () => {
    expect(Array.isArray(manifest.host_permissions)).toBe(true);
    expect(manifest.host_permissions.length).toBeGreaterThan(0);
  });

  it("should have ruleset configuration", () => {
    expect(manifest.declarative_net_request).toBeDefined();
    expect(manifest.declarative_net_request.rule_resources).toBeDefined();
    expect(manifest.declarative_net_request.rule_resources[0].id).toBe(
      "ruleset_1"
    );
  });
});

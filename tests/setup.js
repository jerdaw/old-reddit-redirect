/**
 * Test setup file
 * Ensures storage modules are loaded in the correct order before tests run
 * Also provides utility functions for loading test data
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import modules in dependency order so they attach to window object
await import("../src/core/storage-schema.js");
await import("../src/core/storage-operations.js");
await import("../src/core/storage-migration.js");

/**
 * Load rules.json for tests
 */
export function loadRules() {
  const rulesPath = path.join(__dirname, "..", "rules.json");
  const rulesData = fs.readFileSync(rulesPath, "utf8");
  return JSON.parse(rulesData);
}

/**
 * Load manifest.json for tests
 */
export function loadManifest() {
  const manifestPath = path.join(__dirname, "..", "manifest.json");
  const manifestData = fs.readFileSync(manifestPath, "utf8");
  return JSON.parse(manifestData);
}

/**
 * Optional Features Orchestrator
 * Conditionally loads features only when explicitly enabled
 */

import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Initialize optional features orchestrator
 * Conditionally loads features only when explicitly enabled by user
 * @returns {Promise<void>}
 */
export async function initOptionalFeatures() {
  try {
    debugLog("[ORE] Checking optional features");

    // Get preferences to determine which features to load
    const prefs = await getStorage({
      userTags: { enabled: true },
      nsfwControls: { enabled: false },
      layoutPresets: { enabled: false },
      readingHistory: { enabled: true },
    });

    const loaders = [];

    // Load user tags if enabled
    if (prefs.userTags?.enabled) {
      debugLog("[ORE] Loading user tags");
      loaders.push(import("./user-tags.js").then((m) => m.initUserTags()));
    }

    // Load NSFW controls if enabled
    if (prefs.nsfwControls?.enabled) {
      debugLog("[ORE] Loading NSFW controls");
      loaders.push(
        import("./nsfw-controls.js").then((m) => m.initNsfwControls())
      );
    }

    // Load layout presets if enabled
    if (prefs.layoutPresets?.enabled) {
      debugLog("[ORE] Loading layout presets");
      loaders.push(
        import("./layout-presets.js").then((m) => m.initLayoutPresets())
      );
    }

    // Load reading history if enabled
    if (prefs.readingHistory?.enabled) {
      debugLog("[ORE] Loading reading history");
      loaders.push(
        import("./reading-history.js").then((m) => m.initReadingHistory())
      );
    }

    // Load all enabled features in parallel
    // Use allSettled to continue even if individual features fail
    const results = await Promise.allSettled(loaders);
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("[ORE] Optional feature failed to load:", result.reason);
      }
    }

    if (loaders.length > 0) {
      debugLog(`[ORE] Loaded ${loaders.length} optional features`);
    } else {
      debugLog("[ORE] No optional features enabled");
    }
  } catch (error) {
    console.error("[ORE] Optional features initialization failed:", error);
  }
}

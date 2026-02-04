/**
 * Optional Features Orchestrator
 * Conditionally loads features only when explicitly enabled
 */

import { getStorage } from "../shared/storage-helpers.js";

/**
 * Initialize optional features
 */
export async function initOptionalFeatures() {
  try {
    console.log("[ORR] Checking optional features");

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
      console.log("[ORR] Loading user tags");
      loaders.push(import("./user-tags.js").then((m) => m.initUserTags()));
    }

    // Load NSFW controls if enabled
    if (prefs.nsfwControls?.enabled) {
      console.log("[ORR] Loading NSFW controls");
      loaders.push(
        import("./nsfw-controls.js").then((m) => m.initNsfwControls())
      );
    }

    // Load layout presets if enabled
    if (prefs.layoutPresets?.enabled) {
      console.log("[ORR] Loading layout presets");
      loaders.push(
        import("./layout-presets.js").then((m) => m.initLayoutPresets())
      );
    }

    // Load reading history if enabled
    if (prefs.readingHistory?.enabled) {
      console.log("[ORR] Loading reading history");
      loaders.push(
        import("./reading-history.js").then((m) => m.initReadingHistory())
      );
    }

    // Load all enabled features in parallel
    // Use allSettled to continue even if individual features fail
    await Promise.allSettled(loaders);

    if (loaders.length > 0) {
      console.log(`[ORR] Loaded ${loaders.length} optional features`);
    } else {
      console.log("[ORR] No optional features enabled");
    }
  } catch (error) {
    console.error("[ORR] Optional features initialization failed:", error);
  }
}

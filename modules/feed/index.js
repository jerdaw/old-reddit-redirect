/**
 * Feed Features Orchestrator
 * Conditionally loads feed-specific features
 */

import { getStorage } from "../shared/storage-helpers.js";

/**
 * Initialize feed features
 */
export async function initFeedFeatures() {
  try {
    console.log("[ORR] Loading feed features");

    // Get preferences to determine which features to load
    const prefs = await getStorage({
      feedEnhancements: {},
      sortPreferences: { enabled: true },
    });

    const loaders = [];

    // Feed modes (compact, text-only, etc.) - always check
    const hasFeedEnhancements =
      prefs.feedEnhancements?.compactMode ||
      prefs.feedEnhancements?.textOnlyMode ||
      prefs.feedEnhancements?.uncropImages ||
      prefs.feedEnhancements?.hideJoinButtons ||
      prefs.feedEnhancements?.hideActionLinks ||
      (prefs.feedEnhancements?.customCSSEnabled &&
        prefs.feedEnhancements?.customCSS);

    if (hasFeedEnhancements) {
      console.log("[ORR] Loading feed modes");
      loaders.push(import("./feed-modes.js").then((m) => m.initFeedModes()));
    }

    // Sort preferences - check if enabled
    if (prefs.sortPreferences?.enabled !== false) {
      console.log("[ORR] Loading sort preferences");
      loaders.push(
        import("./sort-preferences.js").then((m) => m.initSortPreferences())
      );
    }

    // Load all enabled features in parallel
    await Promise.allSettled(loaders);

    if (loaders.length > 0) {
      console.log(`[ORR] Loaded ${loaders.length} feed features`);
    } else {
      console.log("[ORR] No feed features enabled");
    }
  } catch (error) {
    console.error("[ORR] Feed features initialization failed:", error);
  }
}

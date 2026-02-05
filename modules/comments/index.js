/**
 * Comments Module Orchestrator
 * Conditionally loads comment-specific features based on preferences
 */

import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Initialize all comment features orchestrator
 * Conditionally loads comment-specific features based on user preferences
 * @returns {Promise<void>}
 * @throws {Error} If initialization fails
 */
export async function initCommentFeatures() {
  try {
    debugLog("[ORR] Loading comment features");

    // Get preferences to determine which features to load
    const prefs = await getStorage({
      commentEnhancements: {
        colorCodedComments: true,
        navigationButtons: true,
        inlineImages: true,
      },
      commentMinimap: {
        enabled: true,
      },
    });

    const loaders = [];

    // Load color-coded comments if enabled
    if (prefs.commentEnhancements?.colorCodedComments) {
      loaders.push(
        import("./color-coding.js").then((m) => m.initColorCoding())
      );
    }

    // Load navigation buttons if enabled
    if (prefs.commentEnhancements?.navigationButtons) {
      loaders.push(
        import("./navigation.js").then((m) => m.initCommentNavigation())
      );
    }

    // Load inline images if enabled
    if (prefs.commentEnhancements?.inlineImages) {
      loaders.push(
        import("./inline-images.js").then((m) => m.initInlineImages())
      );
    }

    // Load comment minimap if enabled
    if (prefs.commentMinimap?.enabled) {
      loaders.push(import("./minimap.js").then((m) => m.initMinimap()));
    }

    // Load all enabled features in parallel
    await Promise.allSettled(loaders);

    debugLog("[ORR] Comment features loaded");
  } catch (error) {
    console.error("[ORR] Comment features initialization failed:", error);
    throw error;
  }
}

/**
 * Export navigation functions for keyboard shortcuts
 */
export { navigateToNext, navigateToPrevious } from "./navigation.js";

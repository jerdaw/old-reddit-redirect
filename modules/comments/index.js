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
    debugLog("[ORE] Loading comment features");

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
      breadcrumbs: {
        enabled: true,
      },
      commentSearch: {
        enabled: true,
      },
      bookmarks: {
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

    // Load breadcrumbs if enabled
    if (prefs.breadcrumbs?.enabled) {
      loaders.push(import("./breadcrumbs.js").then((m) => m.initBreadcrumbs()));
    }

    // Load search if enabled
    if (prefs.commentSearch?.enabled) {
      loaders.push(import("./search.js").then((m) => m.initCommentSearch()));
    }

    // Load bookmarks if enabled
    if (prefs.bookmarks?.enabled) {
      loaders.push(import("./bookmarks.js").then((m) => m.initBookmarks()));
    }

    // Load all enabled features in parallel
    const results = await Promise.allSettled(loaders);
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("[ORE] Comment feature failed to load:", result.reason);
      }
    }

    debugLog("[ORE] Comment features loaded");
  } catch (error) {
    console.error("[ORE] Comment features initialization failed:", error);
    throw error;
  }
}

/**
 * Export navigation functions for keyboard shortcuts
 */
export { navigateToNext, navigateToPrevious } from "./navigation.js";

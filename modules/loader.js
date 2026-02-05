/**
 * Module Loader
 * Entry point for modular code splitting architecture
 * Loads features dynamically based on page type and user preferences
 */

import { getStorage } from "./shared/storage-helpers.js";
import {
  isCommentsPage,
  isSubredditPage,
  isFrontPage,
} from "./shared/page-detection.js";

/**
 * Initialize all features with modular loading
 */
export async function initializeFeatures() {
  try {
    console.log("[ORR] Module loader: Starting feature initialization");

    // Get user preferences (will be used in later phases)
    const _prefs = await getStorage({});

    // Phase 2: Core modules (always load)
    console.log("[ORR] Module loader: Loading core features");
    const { initDarkMode } = await import("./core/dark-mode.js");
    const { initAccessibility } = await import("./core/accessibility.js");
    const { initNagBlocking } = await import("./core/nag-blocking.js");
    const { initFiltering } = await import("./core/content-filtering.js");

    await Promise.all([
      initDarkMode(),
      initAccessibility(),
      initNagBlocking(),
      initFiltering(),
    ]);

    // Phase 3: Comment modules (lazy load for comment pages)
    if (isCommentsPage()) {
      console.log(
        "[ORR] Module loader: Comments page detected, loading features"
      );
      const { initCommentFeatures } = await import("./comments/index.js");
      await initCommentFeatures();
    }

    // Phase 5: Feed modules (lazy load for feed pages)
    if (isSubredditPage() || isFrontPage()) {
      console.log("[ORR] Module loader: Feed page detected, loading features");
      const { initFeedFeatures } = await import("./feed/index.js");
      await initFeedFeatures();
    }

    // Phase 4: Optional features (lazy load when enabled)
    const { initOptionalFeatures } = await import("./optional/index.js");
    await initOptionalFeatures();

    // Auto-collapse bot comments (part of dark mode)
    const { autoCollapseBotComments } = await import("./core/dark-mode.js");
    await autoCollapseBotComments();

    console.log("[ORR] Module loader: Initialization complete");
  } catch (error) {
    console.error("[ORR] Module loader: Initialization failed:", error);
    // Report error to background for telemetry
    try {
      chrome.runtime.sendMessage({
        type: "MODULE_LOAD_ERROR",
        module: "loader",
        error: error.message,
        stack: error.stack,
      });
    } catch (msgError) {
      console.error("[ORR] Module loader: Failed to report error:", msgError);
    }
    throw error;
  }
}

// Auto-initialize when module is imported
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFeatures);
} else {
  initializeFeatures();
}

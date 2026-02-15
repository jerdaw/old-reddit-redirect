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
import { debugLog } from "./shared/debug-helpers.js";

/**
 * Initialize all features with modular loading
 * Entry point for the module loader that orchestrates feature initialization
 * @returns {Promise<void>}
 * @throws {Error} If initialization fails
 */
export async function initializeFeatures() {
  try {
    debugLog("[ORR] Module loader: Starting feature initialization");

    // Get user preferences (will be used in later phases)
    const _prefs = await getStorage({});

    // Phase 2: Core modules (always load)
    debugLog("[ORR] Module loader: Loading core features");
    const { initDarkMode } = await import("./core/dark-mode.js");
    const { initAccessibility } = await import("./core/accessibility.js");
    const { initNagBlocking } = await import("./core/nag-blocking.js");
    const { initFiltering } = await import("./core/content-filtering.js");
    const { initCompliance } = await import("./core/compliance.js");

    await Promise.all([
      initDarkMode(),
      initAccessibility(),
      initNagBlocking(),
      initFiltering(),
      initCompliance(),
    ]);

    // Phase 2b: DevTools & Monitoring
    try {
      const { startDomMonitor, checkCriticalSelectors } =
        await import("./devtools/dom-monitor.js");
      startDomMonitor();
      checkCriticalSelectors();
    } catch (e) {
      if (typeof console.warn === "function") {
        console.warn("[ORR] DOM Monitor failed to start", e);
      } else if (typeof console.log === "function") {
        console.log("[ORR] DOM Monitor failed to start", e);
      }
    }

    // Phase 3: Comment modules (lazy load for comment pages)
    if (isCommentsPage()) {
      debugLog("[ORR] Module loader: Comments page detected, loading features");
      const { initCommentFeatures } = await import("./comments/index.js");
      await initCommentFeatures();
    }

    // Phase 5: Feed modules (lazy load for feed pages)
    if (isSubredditPage() || isFrontPage()) {
      debugLog("[ORR] Module loader: Feed page detected, loading features");
      const { initFeedFeatures } = await import("./feed/index.js");
      await initFeedFeatures();
    }

    // Phase 4: Optional features (lazy load when enabled)
    const { initOptionalFeatures } = await import("./optional/index.js");
    await initOptionalFeatures();

    // Phase 5: Discovery modules (load if enabled)
    debugLog("[ORR] Module loader: Loading discovery features");
    const { initDiscovery } = await import("./discovery/index.js");
    await initDiscovery();

    // Auto-collapse bot comments (part of dark mode)
    const { autoCollapseBotComments } = await import("./core/dark-mode.js");
    await autoCollapseBotComments();

    debugLog("[ORR] Module loader: Initialization complete");
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

/**
 * Cleanup all registered event listeners and observers
 * Called on page unload to prevent memory leaks
 */
function cleanupAllModules() {
  debugLog("[ORR] Module loader: Cleaning up event listeners and observers");
  if (window.orrCleanup && Array.isArray(window.orrCleanup)) {
    for (const cleanup of window.orrCleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error("[ORR] Module loader: Cleanup error:", error);
      }
    }
    window.orrCleanup = [];
  }
}

// Register cleanup on page unload
window.addEventListener("beforeunload", cleanupAllModules);
window.addEventListener("pagehide", cleanupAllModules);

// Auto-initialize when module is imported
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFeatures);
} else {
  initializeFeatures();
}

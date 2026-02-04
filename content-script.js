"use strict";

/**
 * Content script for old.reddit.com
 * Entry point for modular code splitting architecture
 *
 * Phase 7: Legacy code removed, modular loading is now default
 */

// Import and initialize module loader
import("./modules/loader.js").catch((error) => {
  console.error("[ORR] Failed to load modules:", error);

  // Report error to background for telemetry
  try {
    chrome.runtime.sendMessage({
      type: "MODULE_LOAD_ERROR",
      module: "loader",
      error: error.message,
      stack: error.stack,
    });
  } catch (msgError) {
    console.error("[ORR] Failed to report module load error:", msgError);
  }
});

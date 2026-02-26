"use strict";

/**
 * Content script for old.reddit.com
 * Entry point for modular code splitting architecture
 *
 * Phase 7: Legacy code removed, modular loading is now default
 */

// Synchronous theme cache to prevent flash of wrong theme (FOIT)
try {
  const cached = localStorage.getItem("ore-theme-cache");
  if (cached && cached !== "light") {
    document.documentElement.classList.add(
      cached === "oled"
        ? "orr-oled-mode"
        : cached === "high-contrast"
          ? "orr-high-contrast-mode"
          : "orr-dark-mode"
    );
  }
} catch {
  // localStorage may be unavailable in some contexts
}

// Import and initialize module loader
import("../../modules/loader.js").catch((error) => {
  console.error("[ORE] Failed to load modules:", error);

  // Report error to background for telemetry
  try {
    chrome.runtime.sendMessage({
      type: "MODULE_LOAD_ERROR",
      module: "loader",
      error: error.message,
      stack: error.stack,
    });
  } catch (msgError) {
    console.error("[ORE] Failed to report module load error:", msgError);
  }
});

/**
 * Dark Mode Module
 * Handles theme switching and bot comment auto-collapse
 */

import { getStorage } from "../shared/storage-helpers.js";

// Store references for cleanup
let colorSchemeMediaQuery = null;
let colorSchemeHandler = null;

/**
 * Apply dark mode based on user preferences
 * @returns {Promise<void>}
 */
async function applyDarkMode() {
  const prefs = await getStorage({
    darkMode: { enabled: "auto", autoCollapseAutomod: true },
  });
  const darkMode = prefs.darkMode || {};

  let shouldEnableDark = false;
  let shouldEnableOLED = false;
  let shouldEnableHighContrast = false;

  switch (darkMode.enabled) {
    case "auto":
      // Detect system preference
      shouldEnableDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      break;
    case "dark":
      shouldEnableDark = true;
      break;
    case "oled":
      shouldEnableDark = true;
      shouldEnableOLED = true;
      break;
    case "high-contrast":
      shouldEnableDark = true;
      shouldEnableHighContrast = true;
      break;
    case "light":
      shouldEnableDark = false;
      break;
  }

  // Apply classes to body
  document.body.classList.remove(
    "orr-dark-mode",
    "orr-oled-mode",
    "orr-high-contrast-mode"
  );
  // Also clean up early cache classes from documentElement
  document.documentElement.classList.remove(
    "orr-dark-mode",
    "orr-oled-mode",
    "orr-high-contrast-mode"
  );

  let cacheValue = "light";
  if (shouldEnableDark) {
    if (shouldEnableHighContrast) {
      document.body.classList.add("orr-high-contrast-mode");
      cacheValue = "high-contrast";
    } else if (shouldEnableOLED) {
      document.body.classList.add("orr-oled-mode");
      cacheValue = "oled";
    } else {
      document.body.classList.add("orr-dark-mode");
      cacheValue = "dark";
    }
  }

  // Update localStorage cache for next page load (prevents FOIT)
  try {
    localStorage.setItem("ore-theme-cache", cacheValue);
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Listen for system color scheme changes and reapply dark mode
 */
function watchColorScheme() {
  colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  colorSchemeHandler = async () => {
    const prefs = await getStorage({
      darkMode: { enabled: "auto" },
    });
    if (prefs.darkMode.enabled === "auto") {
      applyDarkMode();
    }
  };
  colorSchemeMediaQuery.addEventListener("change", colorSchemeHandler);
}

/**
 * Auto-collapse bot comments based on user preferences
 * @returns {Promise<void>}
 */
async function autoCollapseBotComments() {
  const prefs = await getStorage({
    darkMode: { autoCollapseAutomod: true },
  });
  const darkMode = prefs.darkMode || {};

  if (!darkMode.autoCollapseAutomod) {
    return;
  }

  // List of bot accounts to auto-collapse
  const botAccounts = [
    "AutoModerator",
    "RemindMeBot",
    "sneakpeekbot",
    "RepostSleuthBot",
    "SaveVideo",
    "stabbot",
    "vredditshare",
    "downloadvideo",
    "SaveThisVideo",
    "reddit-user-identifier",
    "TweetLinkerBot",
    "ConverterBot",
    "timezone_bot",
  ];

  // Find all comment containers
  const comments = document.querySelectorAll(".thing.comment");

  for (const comment of comments) {
    // Get the author element
    const authorLink = comment.querySelector("a.author");
    if (!authorLink) continue;

    const author = authorLink.textContent.trim();

    // Check if author is in bot list
    if (botAccounts.includes(author)) {
      // Find the collapse/expand link
      const collapseLink = comment.querySelector("a.expand");
      if (collapseLink && !comment.classList.contains("collapsed")) {
        // Click to collapse
        collapseLink.click();
      }
    }
  }
}

/**
 * Clean up event listeners
 */
function cleanup() {
  if (colorSchemeMediaQuery && colorSchemeHandler) {
    colorSchemeMediaQuery.removeEventListener("change", colorSchemeHandler);
    colorSchemeMediaQuery = null;
    colorSchemeHandler = null;
  }
}

/**
 * Initialize dark mode module
 * @returns {Promise<void>}
 */
export async function initDarkMode() {
  try {
    await applyDarkMode();
    watchColorScheme();

    // Register cleanup handler
    if (!window.orrCleanup) window.orrCleanup = [];
    window.orrCleanup.push(cleanup);

    // Auto-collapse bots is called separately in main init
    // to avoid duplication with mutation observer
  } catch (error) {
    console.error("[ORE] Dark mode initialization failed:", error);
  }
}

/**
 * Export autoCollapseBotComments for use by mutation observer
 */
export { autoCollapseBotComments };

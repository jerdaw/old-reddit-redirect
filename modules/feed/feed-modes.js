/**
 * Feed Modes Module
 * Handles compact mode, text-only mode, and other feed appearance settings
 */

import { getStorage } from "../shared/storage-helpers.js";

/**
 * Inject custom CSS into the page
 * @param {string} css - Custom CSS string
 */
function injectCustomCSS(css) {
  // Remove old custom CSS
  removeCustomCSS();

  // Inject new custom CSS
  const style = document.createElement("style");
  style.id = "orr-custom-css";
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Remove custom CSS from the page
 */
function removeCustomCSS() {
  const existing = document.getElementById("orr-custom-css");
  if (existing) {
    existing.remove();
  }
}

/**
 * Apply feed enhancements based on user preferences
 * @returns {Promise<void>}
 */
async function applyFeedEnhancements() {
  try {
    const config = await getStorage({ feedEnhancements: {} });
    const feed = config.feedEnhancements || {};

    // Apply class-based toggles
    document.body.classList.toggle("orr-compact-feed", feed.compactMode);
    document.body.classList.toggle("orr-text-only", feed.textOnlyMode);
    document.body.classList.toggle("orr-uncrop-images", feed.uncropImages);
    document.body.classList.toggle("orr-hide-join", feed.hideJoinButtons);
    document.body.classList.toggle("orr-hide-actions", feed.hideActionLinks);

    // Apply custom CSS
    if (feed.customCSSEnabled && feed.customCSS) {
      injectCustomCSS(feed.customCSS);
    } else {
      removeCustomCSS();
    }
  } catch (error) {
    console.error("[ORR] Error applying feed enhancements:", error);
  }
}

/**
 * Initialize feed modes module
 * @returns {Promise<void>}
 */
export async function initFeedModes() {
  try {
    await applyFeedEnhancements();
  } catch (error) {
    console.error("[ORR] Feed modes initialization failed:", error);
  }
}

/**
 * Export applyFeedEnhancements for updates
 */
export { applyFeedEnhancements };

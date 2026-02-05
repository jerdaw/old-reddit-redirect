/**
 * Layout Presets Module
 * Save and restore UI configuration presets
 */

import { getStorage } from "../shared/storage-helpers.js";
import { getCurrentSubreddit } from "../shared/page-detection.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Inject preset-specific custom CSS
 * @param {string} css - Custom CSS string
 */
function injectPresetCSS(css) {
  removePresetCSS();
  const style = document.createElement("style");
  style.id = "orr-preset-css";
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Remove preset-specific custom CSS
 */
function removePresetCSS() {
  const existing = document.getElementById("orr-preset-css");
  if (existing) {
    existing.remove();
  }
}

/**
 * Apply a layout preset based on current page and user preferences
 * @returns {Promise<void>}
 */
async function applyLayoutPreset() {
  try {
    const config = await getStorage({ layoutPresets: {} });
    const presets = config.layoutPresets || {};

    // Check if feature is enabled
    if (presets.enabled === false) {
      return;
    }

    // Determine which preset to apply
    let presetName = null;
    const subreddit = getCurrentSubreddit();

    // Check for subreddit-specific layout first
    if (subreddit && presets.subredditLayouts) {
      presetName = presets.subredditLayouts[subreddit];
    }

    // Fall back to active global preset
    if (!presetName && presets.activePreset) {
      presetName = presets.activePreset;
    }

    // If no preset to apply, return
    if (!presetName || !presets.presets || !presets.presets[presetName]) {
      return;
    }

    const preset = presets.presets[presetName];

    // Apply dark mode
    if (preset.darkMode !== undefined) {
      if (preset.darkMode) {
        const mode = preset.darkModeType === "oled" ? "oled" : "dark";
        if (mode === "oled") {
          document.body.classList.add("orr-oled-mode");
          document.body.classList.remove("orr-dark-mode");
        } else {
          document.body.classList.add("orr-dark-mode");
          document.body.classList.remove("orr-oled-mode");
        }
      } else {
        document.body.classList.remove("orr-dark-mode", "orr-oled-mode");
      }
    }

    // Apply feed enhancements
    document.body.classList.toggle(
      "orr-compact-feed",
      preset.compactMode || false
    );
    document.body.classList.toggle(
      "orr-text-only",
      preset.textOnlyMode || false
    );
    document.body.classList.toggle(
      "orr-uncrop-images",
      preset.uncropImages || false
    );
    document.body.classList.toggle(
      "orr-hide-join",
      preset.hideJoinButtons || false
    );
    document.body.classList.toggle(
      "orr-hide-actions",
      preset.hideActionLinks || false
    );

    // Apply comment enhancements
    if (preset.colorCodedComments !== undefined) {
      if (preset.colorCodedComments) {
        document.body.classList.add("orr-color-comments");
        document.body.classList.remove(
          "orr-palette-standard",
          "orr-palette-colorblind"
        );
        document.body.classList.add(
          `orr-palette-${preset.colorPalette || "standard"}`
        );
      } else {
        document.body.classList.remove(
          "orr-color-comments",
          "orr-palette-standard",
          "orr-palette-colorblind"
        );
      }
    }

    // Apply custom CSS from preset
    if (preset.customCSS) {
      injectPresetCSS(preset.customCSS);
    } else {
      removePresetCSS();
    }

    debugLog(`[ORR] Applied layout preset: ${presetName}`);
  } catch (error) {
    console.error("[ORR] Error applying layout preset:", error);
  }
}

/**
 * Initialize layout presets module
 * @returns {Promise<void>}
 */
export async function initLayoutPresets() {
  try {
    await applyLayoutPreset();
  } catch (error) {
    console.error("[ORR] Layout presets initialization failed:", error);
  }
}

/**
 * Export applyLayoutPreset for updates
 */
export { applyLayoutPreset };

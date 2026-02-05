/**
 * Accessibility Module
 * Handles font size, motion reduction, and high contrast UI
 */

import { getStorage } from "../shared/storage-helpers.js";

// Store references for cleanup
let reducedMotionMediaQuery = null;
let reducedMotionHandler = null;

/**
 * Apply accessibility settings based on user preferences
 * @returns {Promise<void>}
 */
async function applyAccessibility() {
  const prefs = await getStorage({
    accessibility: {
      fontSize: "medium",
      reduceMotion: "auto",
      highContrast: false,
    },
  });
  const accessibility = prefs.accessibility || {};

  // Remove existing font size classes
  document.body.classList.remove(
    "orr-font-small",
    "orr-font-medium",
    "orr-font-large",
    "orr-font-x-large"
  );

  // Apply font size class
  const fontSizeClass = `orr-font-${accessibility.fontSize || "medium"}`;
  document.body.classList.add(fontSizeClass);

  // Handle reduce motion preference
  let shouldReduceMotion = false;
  switch (accessibility.reduceMotion) {
    case "auto":
      shouldReduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      break;
    case "always":
      shouldReduceMotion = true;
      break;
    case "never":
      shouldReduceMotion = false;
      break;
  }

  if (shouldReduceMotion) {
    document.body.classList.add("orr-reduce-motion");
  } else {
    document.body.classList.remove("orr-reduce-motion");
  }

  // Handle high contrast UI elements toggle
  if (accessibility.highContrast) {
    document.body.classList.add("orr-high-contrast-ui");
  } else {
    document.body.classList.remove("orr-high-contrast-ui");
  }
}

/**
 * Clean up event listeners
 */
function cleanup() {
  if (reducedMotionMediaQuery && reducedMotionHandler) {
    reducedMotionMediaQuery.removeEventListener("change", reducedMotionHandler);
    reducedMotionMediaQuery = null;
    reducedMotionHandler = null;
  }
}

/**
 * Initialize accessibility module
 * @returns {Promise<void>}
 */
export async function initAccessibility() {
  try {
    await applyAccessibility();

    // Listen for reduced motion preference changes
    reducedMotionMediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    reducedMotionHandler = async () => {
      const prefs = await getStorage({
        accessibility: { reduceMotion: "auto" },
      });
      if (prefs.accessibility.reduceMotion === "auto") {
        await applyAccessibility();
      }
    };
    reducedMotionMediaQuery.addEventListener("change", reducedMotionHandler);

    // Register cleanup handler
    if (!window.orrCleanup) window.orrCleanup = [];
    window.orrCleanup.push(cleanup);
  } catch (error) {
    console.error("[ORR] Accessibility initialization failed:", error);
  }
}

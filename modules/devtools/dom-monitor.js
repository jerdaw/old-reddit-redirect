/**
 * DOM Monitor
 * Detects significant DOM changes that might indicate broken selectors
 */

import { debugLog } from "../shared/debug-helpers.js";

const OBSERVED_SELECTOR = "#siteTable"; // The main content container on old reddit
const THRESHOLD_CHANGES = 50; // Arbitrary threshold for "too many changes"

let changeCount = 0;
let observer = null;

/**
 * Start monitoring the DOM for unexpected structural changes
 */
export function startDomMonitor() {
  // Only monitor on old reddit
  if (window.location.hostname !== "old.reddit.com") return;

  const target = document.querySelector(OBSERVED_SELECTOR);
  if (!target) {
    debugLog(
      "[DOM Monitor] Target container not found. Possible layout change."
    );
    // This itself is a signal of breakage
    return;
  }

  observer = new MutationObserver((mutations) => {
    changeCount += mutations.length;

    if (changeCount > THRESHOLD_CHANGES) {
      debugLog(
        "[DOM Monitor] High DOM churn detected. Possible conflict or loop."
      );
      // In a real implementation, we might want to flag this to the user
      // or throttle our own script execution if we suspect we are causing it.
      observer.disconnect();
    }
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: false, // We mostly care about structure
  });

  debugLog("[DOM Monitor] Started.");
}

/**
 * Check if critical elements are missing
 * @returns {Array<string>} List of missing critical selectors
 */
export function checkCriticalSelectors() {
  const critical = ["#siteTable", "#header", ".side"];

  const missing = critical.filter((sel) => !document.querySelector(sel));

  if (missing.length > 0) {
    console.warn(`[ORR] Critical elements missing: ${missing.join(", ")}`);
  }

  return missing;
}

/**
 * Color-Coded Comments Module
 * Adds visual depth indicators to comment threads
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $$ } from "../shared/dom-helpers.js";

/**
 * Calculate comment depth from nested .child divs
 * @param {Element} comment - The comment element
 * @returns {number} - Depth level (1-based)
 */
export function calculateCommentDepth(comment) {
  let depth = 0;
  let element = comment.parentElement;

  while (element && element !== document.body) {
    if (element.classList.contains("child")) {
      depth++;
    }
    element = element.parentElement;
  }

  return depth;
}

/**
 * Apply color-coded comments based on depth and user preferences
 * @returns {Promise<void>}
 */
async function applyColorCodedComments() {
  const prefs = await getStorage({
    commentEnhancements: {
      colorCodedComments: true,
      colorPalette: "standard",
      stripeWidth: 3,
    },
  });
  const enhancements = prefs.commentEnhancements || {};

  // Remove existing depth classes and body class
  document.body.classList.remove(
    "orr-color-comments",
    "orr-palette-standard",
    "orr-palette-colorblind"
  );
  $$(".thing.comment[data-depth]").forEach((comment) => {
    comment.removeAttribute("data-depth");
  });

  if (!enhancements.colorCodedComments) {
    return;
  }

  // Apply body class for feature and palette
  document.body.classList.add("orr-color-comments");
  document.body.classList.add(`orr-palette-${enhancements.colorPalette}`);

  // Set stripe width CSS variable
  document.body.style.setProperty(
    "--orr-stripe-width",
    `${enhancements.stripeWidth}px`
  );

  // Find all comments and calculate depth
  const comments = $$(".thing.comment");

  // Use requestIdleCallback for performance
  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      comments.forEach((comment) => {
        const depth = calculateCommentDepth(comment);
        if (depth > 0) {
          comment.setAttribute("data-depth", depth);
        }
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    comments.forEach((comment) => {
      const depth = calculateCommentDepth(comment);
      if (depth > 0) {
        comment.setAttribute("data-depth", depth);
      }
    });
  }
}

/**
 * Initialize color-coded comments module
 * @returns {Promise<void>}
 */
export async function initColorCoding() {
  try {
    await applyColorCodedComments();
  } catch (error) {
    console.error("[ORR] Color-coded comments initialization failed:", error);
  }
}

/**
 * Export applyColorCodedComments for mutation observer
 */
export { applyColorCodedComments };

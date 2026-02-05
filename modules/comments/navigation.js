/**
 * Comment Navigation Module
 * Provides keyboard and button-based navigation between comments
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $ } from "../shared/dom-helpers.js";
import {
  REDDIT_HEADER_HEIGHT,
  SCROLL_OFFSET,
  COMMENT_HIGHLIGHT_DURATION,
  HIGHLIGHT_COLOR,
  TRANSITION_DURATION,
} from "../shared/constants.js";

/**
 * Get all parent (top-level) comments on the page
 * @returns {Array<Element>} Array of parent comment elements
 */
function getParentComments() {
  // Parent comments are .thing.comment elements whose parent .sitetable
  // is the main comment area (not nested)
  const commentArea = $(".commentarea > .sitetable");
  if (!commentArea) return [];

  return Array.from(commentArea.querySelectorAll(":scope > .thing.comment"));
}

/**
 * Scroll to a comment with smooth animation
 * @param {Element} comment - The comment element to scroll to
 */
function scrollToComment(comment) {
  const elementPosition = comment.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - REDDIT_HEADER_HEIGHT;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  // Briefly highlight the comment
  comment.style.transition = `background-color ${TRANSITION_DURATION}s`;
  const originalBg = comment.style.backgroundColor;
  comment.style.backgroundColor = HIGHLIGHT_COLOR;

  setTimeout(() => {
    comment.style.backgroundColor = originalBg;
    setTimeout(() => {
      comment.style.transition = "";
    }, TRANSITION_DURATION * 1000);
  }, COMMENT_HIGHLIGHT_DURATION);
}

/**
 * Navigate to the next parent comment with smooth scrolling
 */
export function navigateToNext() {
  const parents = getParentComments();
  if (parents.length === 0) return;

  const currentScroll = window.scrollY + SCROLL_OFFSET;

  // Find the first comment below current scroll position
  for (const comment of parents) {
    if (comment.offsetTop > currentScroll) {
      scrollToComment(comment);
      return;
    }
  }

  // If we're at the end, loop to the first comment
  scrollToComment(parents[0]);
}

/**
 * Navigate to the previous parent comment with smooth scrolling
 */
export function navigateToPrevious() {
  const parents = getParentComments();
  if (parents.length === 0) return;

  const currentScroll = window.scrollY - SCROLL_OFFSET;

  // Find the last comment above current scroll position
  for (let i = parents.length - 1; i >= 0; i--) {
    const comment = parents[i];
    if (comment.offsetTop < currentScroll) {
      scrollToComment(comment);
      return;
    }
  }

  // If we're at the top, loop to the last comment
  scrollToComment(parents[parents.length - 1]);
}

/**
 * Navigate to the top of the page with smooth scrolling
 */
function navigateToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * Create navigation button container with buttons
 * @param {string} position - Button position ("bottom-right" or "bottom-left")
 * @returns {Element} The navigation container element
 */
function createNavigationButtons(position) {
  const container = document.createElement("div");
  container.id = "orr-comment-nav";
  container.className = `orr-comment-nav orr-nav-${position}`;

  // SVG icons
  const upArrowSVG = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 3.5l-6 6 1.5 1.5L8 6.5l4.5 4.5L14 9.5z"/>
    </svg>
  `;

  const downArrowSVG = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12.5l6-6-1.5-1.5L8 9.5 3.5 5 2 6.5z"/>
    </svg>
  `;

  const topArrowSVG = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2l-6 6 1.5 1.5L8 5l4.5 4.5L14 8l-6-6zm0 6l-6 6 1.5 1.5L8 11l4.5 4.5L14 14l-6-6z"/>
    </svg>
  `;

  container.innerHTML = `
    <button id="orr-nav-prev" class="orr-nav-button" title="Previous parent comment (Shift+K)">
      ${upArrowSVG}
    </button>
    <button id="orr-nav-next" class="orr-nav-button" title="Next parent comment (Shift+J)">
      ${downArrowSVG}
    </button>
    <button id="orr-nav-top" class="orr-nav-button" title="Back to top">
      ${topArrowSVG}
    </button>
  `;

  // Attach event handlers
  container.querySelector("#orr-nav-prev").addEventListener("click", (e) => {
    e.preventDefault();
    navigateToPrevious();
  });

  container.querySelector("#orr-nav-next").addEventListener("click", (e) => {
    e.preventDefault();
    navigateToNext();
  });

  container.querySelector("#orr-nav-top").addEventListener("click", (e) => {
    e.preventDefault();
    navigateToTop();
  });

  return container;
}

/**
 * Apply comment navigation buttons based on user preferences
 * @returns {Promise<void>}
 */
async function applyCommentNavigation() {
  const prefs = await getStorage({
    commentEnhancements: {
      navigationButtons: true,
      navButtonPosition: "bottom-right",
    },
  });
  const enhancements = prefs.commentEnhancements || {};

  // Remove existing navigation if present
  const existing = document.getElementById("orr-comment-nav");
  if (existing) {
    existing.remove();
  }

  // Check if we're on a comments page
  const isCommentsPage = document.body.classList.contains("comments-page");
  if (!isCommentsPage || !enhancements.navigationButtons) {
    return;
  }

  // Create and inject navigation buttons
  const navContainer = createNavigationButtons(
    enhancements.navButtonPosition || "bottom-right"
  );
  document.body.appendChild(navContainer);
}

/**
 * Initialize comment navigation module
 * @returns {Promise<void>}
 */
export async function initCommentNavigation() {
  try {
    await applyCommentNavigation();
  } catch (error) {
    console.error("[ORR] Comment navigation initialization failed:", error);
  }
}

/**
 * Export applyCommentNavigation for mutation observer
 */
export { applyCommentNavigation };

/**
 * Comment Minimap Module
 * Provides visual thread navigation sidebar
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $$, throttle } from "../shared/dom-helpers.js";
import { calculateCommentDepth } from "./color-coding.js";
import {
  MINIMAP_CONTENT_HEIGHT,
  MINIMAP_SCROLL_OFFSET,
  MINIMAP_DEPTH_INDENT,
  MINIMAP_ENTRY_PADDING,
  MINIMAP_MAX_ENTRY_HEIGHT,
  MINIMAP_MIN_ENTRY_HEIGHT,
  DEPTH_COLORS,
} from "../shared/constants.js";

// Track minimap instance for cleanup
let minimapInstance = null;

/**
 * Initialize comment minimap module
 * Creates a visual sidebar for navigating comment threads
 * @returns {Promise<void>}
 */
export async function initMinimap() {
  // Only run on comment pages
  if (!window.location.pathname.includes("/comments/")) {
    return;
  }

  const prefs = await getStorage({
    commentMinimap: {
      enabled: true,
      position: "right",
      width: 120,
      opacity: 0.9,
      showViewportIndicator: true,
      useDepthColors: true,
      collapsedIndicator: true,
      autoHide: false,
    },
  });
  const config = prefs.commentMinimap || {};

  if (!config.enabled) {
    // Remove existing minimap if disabled
    if (minimapInstance) {
      minimapInstance.remove();
      minimapInstance = null;
    }
    return;
  }

  // Remove existing minimap before creating new one
  const existing = document.getElementById("orr-comment-minimap");
  if (existing) {
    existing.remove();
  }

  // Get all comments
  const comments = $$(".thing.comment");
  if (comments.length === 0) {
    return;
  }

  // Create minimap container
  const minimap = document.createElement("div");
  minimap.id = "orr-comment-minimap";
  minimap.className = `orr-minimap-${config.position}`;
  minimap.style.width = `${config.width}px`;
  minimap.style.opacity = config.opacity;

  if (config.autoHide) {
    minimap.classList.add("orr-minimap-autohide");
  }

  // Create minimap header
  const header = document.createElement("div");
  header.className = "orr-minimap-header";
  header.innerHTML = `<span class="orr-minimap-title">Comments</span><span class="orr-minimap-count">${comments.length}</span>`;
  minimap.appendChild(header);

  // Create viewport indicator
  let viewportIndicator = null;
  if (config.showViewportIndicator) {
    viewportIndicator = document.createElement("div");
    viewportIndicator.className = "orr-minimap-viewport";
    minimap.appendChild(viewportIndicator);
  }

  // Create minimap content area
  const content = document.createElement("div");
  content.className = "orr-minimap-content";
  minimap.appendChild(content);

  // Calculate total document height for scaling
  const docHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;

  // Read pass: batch all DOM reads to avoid layout thrashing
  const commentData = comments.map((comment) => {
    const depth = calculateCommentDepth(comment);
    const rect = comment.getBoundingClientRect();
    const commentTop = window.scrollY + rect.top;
    const isCollapsed = comment.classList.contains("collapsed");
    const authorEl = comment.querySelector("a.author");
    const author = authorEl ? authorEl.textContent : "unknown";
    return { comment, depth, rect, commentTop, isCollapsed, author };
  });

  // Write pass: build all minimap entries without triggering layout
  commentData.forEach(
    ({ comment, depth, rect, commentTop, isCollapsed, author }) => {
      const entry = document.createElement("div");
      entry.className = "orr-minimap-entry";

      const depthIndex = Math.min(depth, DEPTH_COLORS.length - 1);
      const relativePosition = commentTop / docHeight;
      const entryTop = relativePosition * MINIMAP_CONTENT_HEIGHT;
      const relativeHeight = Math.max(
        MINIMAP_MIN_ENTRY_HEIGHT,
        (rect.height / docHeight) * MINIMAP_CONTENT_HEIGHT
      );

      entry.style.top = `${entryTop}px`;
      entry.style.height = `${Math.min(relativeHeight, MINIMAP_MAX_ENTRY_HEIGHT)}px`;
      entry.style.left = `${depth * MINIMAP_DEPTH_INDENT}px`;
      entry.style.width = `${config.width - MINIMAP_ENTRY_PADDING - depth * MINIMAP_DEPTH_INDENT}px`;

      if (config.useDepthColors) {
        entry.style.backgroundColor = DEPTH_COLORS[depthIndex];
      }

      if (isCollapsed && config.collapsedIndicator) {
        entry.classList.add("orr-minimap-collapsed");
      }

      // Add click handler to navigate to comment
      entry.addEventListener("click", () => {
        const targetTop = commentTop - MINIMAP_SCROLL_OFFSET;
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        comment.classList.add("orr-minimap-highlight");
        setTimeout(() => {
          comment.classList.remove("orr-minimap-highlight");
        }, 1500);
      });

      entry.title = `${author} (depth ${depth + 1})`;
      content.appendChild(entry);
    }
  );

  // Set content height
  content.style.height = `${MINIMAP_CONTENT_HEIGHT}px`;

  // Update viewport indicator on scroll (throttled to ~60fps)
  if (viewportIndicator) {
    const updateViewportIndicator = () => {
      const scrollTop = window.scrollY;
      const viewportTop = (scrollTop / docHeight) * MINIMAP_CONTENT_HEIGHT;
      const viewportSize =
        (viewportHeight / docHeight) * MINIMAP_CONTENT_HEIGHT;

      viewportIndicator.style.top = `${viewportTop + 30}px`; // +30 for header
      viewportIndicator.style.height = `${Math.max(10, viewportSize)}px`;
    };

    const throttledUpdate = throttle(updateViewportIndicator, 16);

    updateViewportIndicator();
    window.addEventListener("scroll", throttledUpdate, {
      passive: true,
    });

    // Register scroll handler cleanup
    if (!window.orrCleanup) window.orrCleanup = [];
    window.orrCleanup.push(() => {
      window.removeEventListener("scroll", throttledUpdate);
    });
  }

  // Add to page
  document.body.appendChild(minimap);
  minimapInstance = minimap;
}

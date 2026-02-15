/**
 * Breadcrumbs Module
 * specific features:
 * - Traverses DOM to find parent comments
 * - Renders sticky/floating breadcrumb bar
 * - Click to jump to ancestor
 */

import {
  createElement,
  addClass,
  removeClass,
  throttle,
} from "../shared/dom-helpers.js";
import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

export class BreadcrumbsManager {
  constructor() {
    this.container = null;
    this.settings = null;
    this.activeComment = null;
    this.checkScrollThrottled = throttle(this.checkScroll.bind(this), 150);
  }

  /**
   * Initialize module
   */
  async init() {
    this.settings = await getStorage({
      breadcrumbs: { enabled: true, showOnScroll: true },
    });

    if (!this.settings.breadcrumbs.enabled) {
      debugLog("[ORR] Breadcrumbs disabled");
      return;
    }

    this.injectStyles();
    this.createContainer();

    // Add scroll listener
    window.addEventListener("scroll", this.checkScrollThrottled, {
      passive: true,
    });

    // Initial check
    this.checkScroll();

    debugLog("[ORR] Breadcrumbs initialized");
  }

  /**
   * Inject necessary CSS
   */
  injectStyles() {
    if (document.getElementById("orr-breadcrumbs-style")) return;

    const css = `
      .orr-breadcrumbs {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #1a1a1b;
        border-bottom: 1px solid #343536;
        padding: 8px 16px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transform: translateY(-100%);
        transition: transform 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        color: #d7dadc;
      }
      
      .orr-breadcrumbs.visible {
        transform: translateY(0);
      }
      
      .orr-breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #818384;
        white-space: nowrap;
        max-width: 200px;
      }
      
      .orr-breadcrumb-link {
        color: #d7dadc;
        text-decoration: none;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .orr-breadcrumb-link:hover {
        color: #ff4500;
        text-decoration: underline;
      }
      
      .orr-breadcrumb-separator {
        color: #818384;
      }
      
      .orr-breadcrumb-current {
        font-weight: 600;
        color: #ff4500;
      }
    `;

    const style = createElement("style", { id: "orr-breadcrumbs-style" }, css);
    document.head.appendChild(style);
  }

  /**
   * Create the breadcrumbs container
   */
  createContainer() {
    this.container = createElement("div", {
      className: "orr-breadcrumbs",
      id: "orr-breadcrumbs",
    });
    document.body.appendChild(this.container);
  }

  /**
   * Check scroll position and find active thread
   */
  checkScroll() {
    if (!this.container) return;

    // Provide some offset (e.g., top header height + some buffer)
    const offset = 100;

    // Strategy: find the first comment element near the top of the viewport
    // ElementsFromPoint might be expensive, so let's try a different approach
    // We can iterate through root comments or use a more efficient query if needed.
    // For now, let's use elementFromPoint at a fixed position relative to viewport

    const x = window.innerWidth / 2; // Middle of screen
    const y = offset; // Near top

    const el = document.elementFromPoint(x, y);
    if (!el) return;

    // Find the closest parent comment container
    const comment = el.closest(".thing.comment");

    if (!comment) {
      this.hide();
      return;
    }

    // Determine depth
    // In old reddit, depth is determined by nesting or classes?
    // Usually nested in .child divs.
    // Let's count parents.

    const parents = this.getAncestors(comment);

    // Only show if we are deep enough (e.g. at least level 3 or 4)
    // Or just show all parents? Spec said "Visual hierarchy for deeply nested threads".
    // Let's show if depth >= 2 (i.e. has at least 2 parents)
    if (parents.length >= 2) {
      this.render(parents);
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Get ancestor comments
   * @param {Element} comment - The current comment element
   * @returns {Array} Array of ancestor comment info
   */
  getAncestors(comment) {
    const ancestors = [];
    let current = comment;

    // We traverse up. In Old Reddit structure:
    // .comment
    //   .entry
    //   .child
    //     .sitetable
    //       .comment (nested)

    // So we look for closest .thing.comment of parent

    while (current) {
      // Move up to parent
      const parentContainer = current.parentElement?.closest(".thing.comment");
      if (parentContainer) {
        ancestors.unshift(this.extractCommentInfo(parentContainer));
        current = parentContainer;
      } else {
        break;
      }
    }

    // Add current one? The spec says "showing parent chain".
    // Usually breadcrumbs show parents + current.
    // But if we are looking at the *current* comment in view, maybe we just show parents leading to it.
    // Let's include current as the "active" leaf.
    ancestors.push(this.extractCommentInfo(comment));

    return ancestors;
  }

  /**
   * Extract info from a comment element
   * @param {Element} comment
   */
  extractCommentInfo(comment) {
    const entry = comment.querySelector(".entry");
    const author = entry?.querySelector(".author")?.textContent || "[deleted]";
    const text =
      entry
        ?.querySelector(".usertext-body")
        ?.textContent?.trim()
        .substring(0, 20) + "..." || "";
    const id = comment.getAttribute("data-fullname");

    return {
      id,
      author,
      text,
      element: comment,
    };
  }

  /**
   * Render breadcrumbs
   * @param {Array} chain
   */
  render(chain) {
    this.container.innerHTML = "";

    // Show only last few items if chain is too long?
    // For now, simple list.

    chain.forEach((item, index) => {
      if (index > 0) {
        const sep = createElement(
          "span",
          { className: "orr-breadcrumb-separator" },
          "›"
        );
        this.container.appendChild(sep);
      }

      const isLast = index === chain.length - 1;

      const itemEl = createElement("div", { className: "orr-breadcrumb-item" });

      if (isLast) {
        const span = createElement(
          "span",
          { className: "orr-breadcrumb-current" },
          item.author
        );
        itemEl.appendChild(span);
      } else {
        const link = createElement(
          "a",
          { className: "orr-breadcrumb-link" },
          item.author
        );
        link.onclick = (e) => {
          e.preventDefault();
          this.scrollToComment(item.element);
        };
        itemEl.appendChild(link);
      }

      this.container.appendChild(itemEl);
    });
  }

  scrollToComment(element) {
    // Scroll with offset
    const top = element.getBoundingClientRect().top + window.scrollY - 60; // offset for sticky header if any
    window.scrollTo({ top, behavior: "smooth" });
  }

  show() {
    addClass(this.container, "visible");
  }

  hide() {
    removeClass(this.container, "visible");
  }
}

// Singleton instance
export const breadcrumbsManager = new BreadcrumbsManager();

// Export init function
export const initBreadcrumbs = () => breadcrumbsManager.init();

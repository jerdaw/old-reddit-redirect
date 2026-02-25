/**
 * Comment Bookmarks Module
 * specific features:
 * - Save comment positions
 * - Persistence with LRU cache
 * - Visual indicators
 * - Navigation between bookmarks
 */

import {
  $,
  $$,
  createElement,
  addClass,
  removeClass,
} from "../shared/dom-helpers.js";
import { getStorage, setStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

export class BookmarksManager {
  constructor() {
    this.settings = null;
    this.bookmarks = [];
    this.maxBookmarks = 50;
  }

  async init() {
    // Load settings
    const storage = await getStorage({
      bookmarks: { enabled: true, maxBookmarks: 50, entries: [] },
    });
    this.settings = storage.bookmarks;
    this.bookmarks = this.settings.entries || [];
    this.maxBookmarks = this.settings.maxBookmarks || 50;

    if (!this.settings.enabled) return;

    this.injectStyles();
    this.injectBookmarkButtons();
    this.highlightBookmarkedComments();
    this.addNavigationControl();

    // Observer for dynamic comments
    this.initObserver();

    debugLog("[ORE] Bookmarks initialized");
  }

  injectStyles() {
    if (document.getElementById("orr-bookmarks-style")) return;

    const css = `
      .orr-bookmark-btn {
        cursor: pointer;
        color: #818384;
        font-weight: bold;
      }
      .orr-bookmark-btn:hover {
        text-decoration: underline;
      }
      .orr-bookmark-btn.active {
        color: #ffd700; /* Gold */
      }
      
      .thing.comment.orr-bookmarked {
        border-left: 3px solid #ffd700 !important;
        padding-left: 5px;
      }
      
      .orr-bookmarks-nav {
        position: fixed;
        bottom: 70px; /* Above standard nav */
        right: 20px;
        background: #1a1a1b;
        border: 1px solid #343536;
        border-radius: 4px;
        z-index: 100;
        display: flex;
        flex-direction: column;
      }
      
      .orr-bookmarks-nav button {
        background: transparent;
        border: none;
        color: #d7dadc;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .orr-bookmarks-nav button:hover {
        background: #343536;
      }
    `;

    const style = createElement("style", { id: "orr-bookmarks-style" }, css);
    document.head.appendChild(style);
  }

  injectBookmarkButtons() {
    // Reddit comments have styling .buttons inside .entry
    const buttonsLists = $$(".thing.comment .entry .buttons");

    buttonsLists.forEach((list) => {
      this.addBookmarkButtonToList(list);
    });
  }

  addBookmarkButtonToList(list) {
    if (list.querySelector(".orr-bookmark-li")) return;

    const commentId = list.closest(".thing").getAttribute("data-fullname");
    const isBookmarked = this.isBookmarked(commentId);

    const li = createElement("li", { className: "orr-bookmark-li" });
    const btn = createElement(
      "a",
      {
        className: `orr-bookmark-btn ${isBookmarked ? "active" : ""}`,
        href: "javascript:void(0)",
        title: "Bookmark this comment",
      },
      isBookmarked ? "★ saved" : "☆ save"
    );

    btn.onclick = (e) => {
      e.preventDefault();
      this.toggleBookmark(commentId, btn);
    };

    li.appendChild(btn);
    list.appendChild(li);
  }

  initObserver() {
    // Watch for new comments (e.g. "load more comments")
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.matches(".thing.comment")) {
            const list = node.querySelector(".entry .buttons");
            if (list) this.addBookmarkButtonToList(list);

            // Also check if this new comment is bookmarked
            const id = node.getAttribute("data-fullname");
            if (this.isBookmarked(id)) {
              addClass(node, "orr-bookmarked");
            }
          }
        }
      }
    });

    const commentArea = $(".commentarea");
    if (commentArea) {
      observer.observe(commentArea, { childList: true, subtree: true });
    }
  }

  isBookmarked(id) {
    return this.bookmarks.some((b) => b.id === id);
  }

  async toggleBookmark(id, btn) {
    const index = this.bookmarks.findIndex((b) => b.id === id);
    const comment = $(`.thing.id-${id}`);

    // Find or create edit button
    let editBtn = btn.nextSibling;
    if (editBtn && !editBtn.classList.contains("orr-bookmark-edit")) {
      editBtn = null;
    }

    if (index >= 0) {
      // Remove
      this.bookmarks.splice(index, 1);
      btn.textContent = "☆ save";
      removeClass(btn, "active");
      if (comment) removeClass(comment, "orr-bookmarked");
      if (editBtn) editBtn.remove();
    } else {
      // Add
      const title =
        comment?.querySelector(".title")?.textContent || document.title;
      const author =
        comment?.querySelector(".author")?.textContent || "[unknown]";
      const snippet =
        comment
          ?.querySelector(".usertext-body")
          ?.textContent?.substring(0, 50) || "";
      const url = window.location.href.split("#")[0] + "#" + id;

      const entry = {
        id,
        url,
        title,
        author,
        snippet,
        timestamp: Date.now(),
        tags: [],
      };

      // Auto-tagging hook (simple version for now)
      if (window.ORR_SmartCollections) {
        const autoTags = window.ORR_SmartCollections.getTags(entry);
        if (autoTags && autoTags.length) entry.tags.push(...autoTags);
      }

      // LRU: Remove oldest if full
      if (this.bookmarks.length >= this.maxBookmarks) {
        this.bookmarks.shift(); // Remove oldest (assuming added to end)
      }

      this.bookmarks.push(entry);
      btn.textContent = "★ saved";
      addClass(btn, "active");
      if (comment) addClass(comment, "orr-bookmarked");

      // Add edit button
      this.addEditButton(btn, id);
    }

    // Persist
    this.settings.entries = this.bookmarks;
    await setStorage({ bookmarks: this.settings });

    // Update nav visibility
    this.updateNavVisibility();
  }

  addEditButton(btn, id) {
    if (btn.parentNode.querySelector(".orr-bookmark-edit")) return;

    const editBtn = createElement(
      "a",
      {
        className: "orr-bookmark-edit",
        href: "javascript:void(0)",
        title: "Edit tags",
        style: "margin-left: 5px; color: #888; font-size: 0.9em;",
      },
      "✎"
    );

    editBtn.onclick = (e) => {
      e.preventDefault();
      this.showTagEditor(editBtn, id);
    };

    btn.parentNode.appendChild(editBtn);
  }

  showTagEditor(btn, id) {
    // Remove existing editors
    $$(".orr-tag-editor").forEach((el) => el.remove());

    const bookmark = this.bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    const container = createElement("div", { className: "orr-tag-editor" });
    Object.assign(container.style, {
      position: "absolute",
      zIndex: "1000",
      background: "#fff",
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "4px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      minWidth: "200px",
    });

    // Handle dark mode
    if (document.body.classList.contains("res-nightmode")) {
      container.style.background = "#222";
      container.style.borderColor = "#444";
      container.style.color = "#ddd";
    }

    const input = createElement("input", {
      type: "text",
      value: (bookmark.tags || []).join(", "),
      placeholder: "Tags (comma separated)",
      style:
        "width: 100%; padding: 4px; box-sizing: border-box; margin-bottom: 5px;",
    });

    const saveBtn = createElement("button", {}, "Save");
    saveBtn.onclick = async () => {
      const tags = input.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      bookmark.tags = tags;

      this.settings.entries = this.bookmarks;
      await setStorage({ bookmarks: this.settings });

      container.remove();
      debugLog("[ORE] Saved tags for " + id);
    };

    const cancelBtn = createElement(
      "button",
      { style: "margin-left: 5px;" },
      "Cancel"
    );
    cancelBtn.onclick = () => container.remove();

    container.appendChild(input);
    container.appendChild(saveBtn);
    container.appendChild(cancelBtn);

    document.body.appendChild(container);

    // Position popover
    const rect = btn.getBoundingClientRect();
    const scrollY = window.scrollY;
    container.style.top = rect.bottom + scrollY + 5 + "px";
    container.style.left = rect.left + window.scrollX + "px";

    input.focus();
  }

  highlightBookmarkedComments() {
    this.bookmarks.forEach((b) => {
      const comment = $(`.thing.id-${b.id}`);
      if (comment) {
        addClass(comment, "orr-bookmarked");
        // Re-inject edit button if needed
        const btn = comment.querySelector(".orr-bookmark-btn");
        if (btn) this.addEditButton(btn, b.id);
      }
    });
  }

  addNavigationControl() {
    // Only show if there are bookmarks on this page
    const container = createElement("div", {
      className: "orr-bookmarks-nav hidden",
      id: "orr-bookmarks-nav",
    });

    const nextBtn = createElement("button", {}, "Next Bookmark ▼");
    nextBtn.onclick = () => this.scrollToNextBookmark();

    container.appendChild(nextBtn);
    document.body.appendChild(container);

    this.updateNavVisibility();
  }

  updateNavVisibility() {
    const nav = document.getElementById("orr-bookmarks-nav");
    if (!nav) return;

    // Check if any bookmarks are present on current page
    // We can filter bookmarks by checking if their ID exists in DOM
    const present = this.bookmarks.some((b) =>
      document.querySelector(`.thing.id-${b.id}`)
    );

    if (present) {
      removeClass(nav, "hidden");
      nav.style.display = "flex";
    } else {
      addClass(nav, "hidden");
      nav.style.display = "none";
    }
  }

  scrollToNextBookmark() {
    const currentScroll = window.scrollY + 100;

    // Find all bookmarked comments in DOM
    const elements = $$(".thing.comment.orr-bookmarked");

    // Sort by offsetTop
    elements.sort((a, b) => a.offsetTop - b.offsetTop);

    // Find first one below current scroll
    const next = elements.find((el) => el.offsetTop > currentScroll);

    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (elements.length > 0) {
      // Loop to top
      elements[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

export const bookmarksManager = new BookmarksManager();
export const initBookmarks = () => bookmarksManager.init();

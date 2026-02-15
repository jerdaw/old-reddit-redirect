/**
 * Comment Search Module
 * specific features:
 * - In-page comment search
 * - Floating search widget
 * - Highlight matches
 * - Navigation between matches
 */

import {
  $$,
  createElement,
  addClass,
  removeClass,
} from "../shared/dom-helpers.js";
import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

export class SearchManager {
  constructor() {
    this.settings = null;
    this.isActive = false;
    this.matches = [];
    this.currentMatchIndex = -1;
    this.container = null;
    this.input = null;
    this.countLabel = null;
  }

  async init() {
    this.settings = await getStorage({
      commentSearch: { enabled: true, highlightColor: "#ffeb3b" },
    });

    if (!this.settings.commentSearch.enabled) return;

    this.injectStyles();
    this.createWidget();
    this.attachGlobalListeners();

    debugLog("[ORR] Comment search initialized");
  }

  injectStyles() {
    if (document.getElementById("orr-search-style")) return;

    const css = `
      .orr-search-widget {
        position: fixed;
        top: 60px;
        right: 20px;
        background: #1a1a1b;
        border: 1px solid #343536;
        border-radius: 4px;
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(120%);
        transition: transform 0.2s ease;
      }
      
      .orr-search-widget.visible {
        transform: translateX(0);
      }
      
      .orr-search-input {
        background: #272729;
        border: 1px solid #343536;
        color: #d7dadc;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 13px;
        width: 200px;
      }
      
      .orr-search-input:focus {
        outline: none;
        border-color: #0079d3;
      }
      
      .orr-search-btn {
        background: transparent;
        border: none;
        color: #818384;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      
      .orr-search-btn:hover {
        background: #343536;
        color: #d7dadc;
      }
      
      .orr-search-count {
        font-size: 12px;
        color: #818384;
        min-width: 40px;
        text-align: center;
      }
      
      .orr-search-match {
        background-color: ${this.settings.commentSearch.highlightColor};
        color: #000;
        border-radius: 2px;
      }
      
      .orr-search-match.active {
        box-shadow: 0 0 0 2px #ff4500;
      }
    `;

    const style = createElement("style", { id: "orr-search-style" }, css);
    document.head.appendChild(style);
  }

  createWidget() {
    this.container = createElement("div", { className: "orr-search-widget" });

    this.input = createElement("input", {
      type: "text",
      className: "orr-search-input",
      placeholder: "Find in comments...",
    });

    this.input.addEventListener("input", (e) =>
      this.performSearch(e.target.value)
    );
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) this.prevMatch();
        else this.nextMatch();
      } else if (e.key === "Escape") {
        this.close();
      }
    });

    const prevBtn = createElement(
      "button",
      { className: "orr-search-btn", title: "Previous" },
      "↑"
    );
    prevBtn.onclick = () => this.prevMatch();

    const nextBtn = createElement(
      "button",
      { className: "orr-search-btn", title: "Next" },
      "↓"
    );
    nextBtn.onclick = () => this.nextMatch();

    this.countLabel = createElement(
      "span",
      { className: "orr-search-count" },
      "0/0"
    );

    const closeBtn = createElement(
      "button",
      { className: "orr-search-btn", title: "Close" },
      "✕"
    );
    closeBtn.onclick = () => this.close();

    this.container.appendChild(this.input);
    this.container.appendChild(this.countLabel);
    this.container.appendChild(prevBtn);
    this.container.appendChild(nextBtn);
    this.container.appendChild(closeBtn);

    document.body.appendChild(this.container);
  }

  attachGlobalListeners() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+F
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "f"
      ) {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) this.open();
    else this.close();
  }

  open() {
    this.isActive = true;
    addClass(this.container, "visible");
    this.input.focus();
    if (this.input.value) {
      this.performSearch(this.input.value);
    }
  }

  close() {
    this.isActive = false;
    removeClass(this.container, "visible");
    this.clearHighlights();
  }

  performSearch(query) {
    this.clearHighlights();
    this.matches = [];
    this.currentMatchIndex = -1;

    if (!query || query.length < 2) {
      this.updateCount();
      return;
    }

    const regex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );

    // Find all comment bodies
    const comments = $$(".entry .usertext-body");

    for (const comment of comments) {
      if (!comment.textContent.match(regex)) continue;

      // We need to highlight text logic here.
      // For simplicity, let's just mark the comment element itself as a match
      // Making robust text highlighting in DOM is complex (avoiding breaking HTML).
      // Let's use a simpler approach: finding the text nodes.

      const walker = document.createTreeWalker(
        comment,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      let node;
      const textNodes = [];
      while ((node = walker.nextNode())) textNodes.push(node);

      for (const node of textNodes) {
        // Reset lastIndex because reusing global regex
        regex.lastIndex = 0;

        const text = node.nodeValue;
        if (!text) continue;

        // Check if node matches
        if (regex.test(text)) {
          // Complex replacement needed here to wrap matches.
          // Be careful not to break existing event listeners (though text nodes usually don't have them).
          // For MVP, let's just highlight the entire comment container border or background
          // AND/OR wrap the whole text if possible.

          // Let's try to highlight the specific text matches using span
          // This requires replacing the text node with a fragment

          const fragment = document.createDocumentFragment();
          let lastIdx = 0;
          regex.lastIndex = 0; // Reset again

          let match;
          while ((match = regex.exec(text)) !== null) {
            const before = text.substring(lastIdx, match.index);
            if (before) fragment.appendChild(document.createTextNode(before));

            const span = createElement(
              "span",
              { className: "orr-search-match" },
              match[0]
            );
            fragment.appendChild(span);
            this.matches.push(span);

            lastIdx = regex.lastIndex;
          }

          if (lastIdx < text.length) {
            fragment.appendChild(
              document.createTextNode(text.substring(lastIdx))
            );
          }

          if (fragment.childNodes.length > 0) {
            node.parentNode.replaceChild(fragment, node);
          }
        }
      }
    }

    this.updateCount();
    if (this.matches.length > 0) {
      this.nextMatch();
    }
  }

  clearHighlights() {
    const highlights = $$(".orr-search-match");
    for (const el of highlights) {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize(); // Merge adjacent text nodes
    }
    this.matches = [];
    this.currentMatchIndex = -1;
    this.updateCount();
  }

  nextMatch() {
    if (this.matches.length === 0) return;

    if (this.currentMatchIndex >= 0) {
      removeClass(this.matches[this.currentMatchIndex], "active");
    }

    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;

    const match = this.matches[this.currentMatchIndex];
    addClass(match, "active");
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    this.updateCount();
  }

  prevMatch() {
    if (this.matches.length === 0) return;

    if (this.currentMatchIndex >= 0) {
      removeClass(this.matches[this.currentMatchIndex], "active");
    }

    this.currentMatchIndex =
      (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length;

    const match = this.matches[this.currentMatchIndex];
    addClass(match, "active");
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    this.updateCount();
  }

  updateCount() {
    if (this.matches.length === 0) {
      this.countLabel.textContent = "0/0";
      this.input.style.borderColor = "#ea0027"; // red border if no matches
    } else {
      this.countLabel.textContent = `${this.currentMatchIndex + 1}/${this.matches.length}`;
      this.input.style.borderColor = "#343536";
    }

    // Reset border if empty
    if (!this.input.value) this.input.style.borderColor = "#343536";
  }
}

export const searchManager = new SearchManager();
export const initCommentSearch = () => searchManager.init();

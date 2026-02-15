/**
 * Related Posts Module
 * Suggests content based on local reading history
 */
import { getStorage } from "../shared/storage-helpers.js";
import { $ } from "../shared/dom-helpers.js";

/**
 * Initialize related posts
 */
export async function initRelatedPosts() {
  const settings = await getStorage("discovery");
  if (!settings.discovery?.relatedPosts) return;

  // Only run on comments pages
  if (!document.body.classList.contains("comments-page")) return;

  const currentPost = getCurrentPostDetails();
  if (!currentPost) return;

  // Get history
  let history = [];
  try {
    const historyData = await window.Storage.getReadingHistory();
    history = historyData.entries || [];
  } catch (e) {
    console.error("[ORR] Failed to load reading history for related posts", e);
    return;
  }

  const recommendations = getRecommendations(currentPost, history);

  if (recommendations.length > 0) {
    renderWidget(recommendations);
  }
}

/**
 * Get details of the current post
 */
function getCurrentPostDetails() {
  const titleEl = $(".top-matter .title a.title");
  const subEl = $(".top-matter .subreddit");

  if (!titleEl) return null;

  // Extract ID from URL
  const match = window.location.pathname.match(/\/comments\/([a-z0-9]+)/i);
  const id = match ? match[1] : null;

  return {
    id,
    title: titleEl.textContent,
    subreddit: subEl ? subEl.textContent.replace(/^r\//, "").trim() : "",
    url: window.location.href,
  };
}

/**
 * Calculate content recommendations
 * @param {Object} current - Current post details
 * @param {Array} history - Reading history entries
 * @returns {Array} Top recommendations
 */
export function getRecommendations(current, history) {
  if (!history || history.length === 0) return [];

  const currentWords = getKeywords(current.title);
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  const scored = history
    .filter((entry) => entry.id !== current.id) // Exclude current
    .map((entry) => {
      let score = 0;

      // Subreddit match
      if (entry.subreddit.toLowerCase() === current.subreddit.toLowerCase()) {
        score += 10;
      }

      // Title keyword match
      const entryWords = Array.from(getKeywords(entry.title));
      const commonWords = entryWords.filter((w) => currentWords.has(w));
      score += commonWords.length * 2;

      // Recency boost
      const age = now - (entry.timestamp || 0);
      if (age < ONE_DAY) score += 2;
      else if (age < SEVEN_DAYS) score += 1;

      return { ...entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5

  return scored;
}

/**
 * Extract keywords from title
 */
function getKeywords(text) {
  if (!text) return new Set();

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "is",
    "are",
    "was",
    "were",
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Render the recommendations widget
 */
function renderWidget(items) {
  // Styles
  const style = document.createElement("style");
  style.textContent = `
    .orr-related-widget {
      margin: 20px 0;
      padding: 15px;
      background: var(--entry-bg, #fff);
      border: 1px solid var(--entry-border, #ccc);
      border-radius: 4px;
    }
    .orr-related-title {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 1.1em;
      color: var(--text-color, #333);
    }
    .orr-related-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .orr-related-item {
      margin-bottom: 8px;
    }
    .orr-related-link {
      color: var(--link-color, #0079d3);
      text-decoration: none;
      font-weight: 500;
    }
    .orr-related-link:hover {
      text-decoration: underline;
    }
    .orr-related-meta {
      font-size: 0.85em;
      color: var(--text-meta, #888);
    }
    .res-nightmode .orr-related-widget {
      background: #222;
      border-color: #444;
    }
    .res-nightmode .orr-related-title {
      color: #ddd;
    }
  `;
  document.head.appendChild(style);

  // Widget
  const container = document.createElement("div");
  container.className = "orr-related-widget";

  const title = document.createElement("div");
  title.className = "orr-related-title";
  title.textContent = "You might also like";
  container.appendChild(title);

  const list = document.createElement("ul");
  list.className = "orr-related-list";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "orr-related-item";

    const a = document.createElement("a");
    a.href = item.url;
    a.className = "orr-related-link";
    a.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "orr-related-meta";
    meta.textContent = `r/${item.subreddit} • ${item.commentCount || 0} comments`;

    li.appendChild(a);
    li.appendChild(meta);
    list.appendChild(li);
  });

  container.appendChild(list);

  // Inject sidebar or bottom of comments
  // Try sidebar first
  const sidebar = $(".side");
  if (sidebar) {
    sidebar.insertBefore(container, sidebar.firstChild);
  } else {
    // Fallback to bottom of content
    const content = $(".content");
    if (content) {
      content.appendChild(container);
    }
  }
}

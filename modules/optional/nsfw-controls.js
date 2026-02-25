/**
 * NSFW Controls Module
 * Handles blurring/hiding of NSFW content with per-subreddit allowlist
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $$ } from "../shared/dom-helpers.js";
import { getCurrentSubreddit } from "../shared/page-detection.js";

/**
 * Apply NSFW content controls based on user preferences
 * @returns {Promise<void>}
 */
async function applyNsfwControls() {
  const prefs = await getStorage({
    nsfwControls: {
      enabled: false,
      visibility: "show",
      blurIntensity: 10,
      revealOnHover: true,
      showWarning: true,
      allowedSubreddits: [],
    },
  });
  const config = prefs.nsfwControls || {};

  // Skip if NSFW controls are disabled or set to show everything
  if (!config.enabled || config.visibility === "show") {
    // Remove any existing NSFW blur classes
    document.body.classList.remove(
      "orr-nsfw-blur",
      "orr-nsfw-hide",
      "orr-nsfw-reveal-hover"
    );
    $$(".orr-nsfw-blurred, .orr-nsfw-hidden").forEach((el) => {
      el.classList.remove(
        "orr-nsfw-blurred",
        "orr-nsfw-hidden",
        "orr-nsfw-allowed"
      );
    });
    return;
  }

  // Get current subreddit from page
  const currentSubreddit = getCurrentSubreddit();
  const allowedSubreddits = (config.allowedSubreddits || []).map((s) =>
    s.toLowerCase()
  );
  const isAllowedSubreddit =
    currentSubreddit &&
    allowedSubreddits.includes(currentSubreddit.toLowerCase());

  // If current subreddit is in allowlist, don't apply NSFW controls
  if (isAllowedSubreddit) {
    document.body.classList.remove(
      "orr-nsfw-blur",
      "orr-nsfw-hide",
      "orr-nsfw-reveal-hover"
    );
    return;
  }

  // Apply body classes for global styling
  document.body.classList.remove(
    "orr-nsfw-blur",
    "orr-nsfw-hide",
    "orr-nsfw-reveal-hover"
  );
  if (config.visibility === "blur") {
    document.body.classList.add("orr-nsfw-blur");
    if (config.revealOnHover) {
      document.body.classList.add("orr-nsfw-reveal-hover");
    }
  } else if (config.visibility === "hide") {
    document.body.classList.add("orr-nsfw-hide");
  }

  // Set blur intensity as CSS variable
  document.documentElement.style.setProperty(
    "--orr-nsfw-blur",
    `${config.blurIntensity}px`
  );

  // Find all NSFW posts
  const nsfwPosts = $$(".thing.over18, .thing[data-nsfw='true']");

  for (const post of nsfwPosts) {
    // Check if post's subreddit is in allowlist
    const postSubreddit = post.getAttribute("data-subreddit")?.toLowerCase();
    if (postSubreddit && allowedSubreddits.includes(postSubreddit)) {
      post.classList.add("orr-nsfw-allowed");
      post.classList.remove("orr-nsfw-blurred", "orr-nsfw-hidden");
      continue;
    }

    if (config.visibility === "hide") {
      post.classList.add("orr-nsfw-hidden");
      post.classList.remove("orr-nsfw-blurred");
      post.style.display = "none";
    } else if (config.visibility === "blur") {
      post.classList.add("orr-nsfw-blurred");
      post.classList.remove("orr-nsfw-hidden");
      post.style.display = "";

      // Add warning overlay if enabled and not already present
      if (config.showWarning && !post.querySelector(".orr-nsfw-warning")) {
        const thumbnail = post.querySelector(".thumbnail");
        if (thumbnail && !thumbnail.classList.contains("self")) {
          const warning = document.createElement("div");
          warning.className = "orr-nsfw-warning";
          warning.innerHTML =
            '<span class="orr-nsfw-warning-icon">18+</span><span class="orr-nsfw-warning-text">NSFW</span>';
          warning.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Temporarily reveal this specific post
            post.classList.add("orr-nsfw-revealed");
            setTimeout(() => {
              post.classList.remove("orr-nsfw-revealed");
            }, 10000); // Auto-hide after 10 seconds
          });
          thumbnail.style.position = "relative";
          thumbnail.appendChild(warning);
        }
      }
    }
  }
}

/**
 * Initialize NSFW controls module
 * @returns {Promise<void>}
 */
export async function initNsfwControls() {
  try {
    await applyNsfwControls();
  } catch (error) {
    console.error("[ORE] NSFW controls initialization failed:", error);
  }
}

/**
 * Export applyNsfwControls for mutation observer
 */
export { applyNsfwControls };

/**
 * Inline Images Module
 * Provides inline expansion for image links in comments
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $$ } from "../shared/dom-helpers.js";

/**
 * Check if a URL is an image URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL points to an image
 */
function isImageUrl(url) {
  if (!url) return false;

  const imagePattern =
    /^https?:\/\/(i\.redd\.it|preview\.redd\.it|i\.imgur\.com|imgur\.com)\/[\w\-\.]+(\.(jpg|jpeg|png|gif|webp|svg))?$/i;
  return imagePattern.test(url);
}

/**
 * Convert imgur.com page URL to direct image URL
 * @param {string} url - The imgur page URL
 * @returns {string} Direct image URL
 */
function convertImgurUrl(url) {
  // Convert imgur.com/xxx to i.imgur.com/xxx.jpg
  if (url.match(/^https?:\/\/imgur\.com\/[a-zA-Z0-9]+$/)) {
    const id = url.split("/").pop();
    return `https://i.imgur.com/${id}.jpg`;
  }
  return url;
}

/**
 * Create expand button for an image link
 * @param {string} imageUrl - The image URL
 * @returns {Element} The expand button element
 */
function createExpandButton(imageUrl) {
  const button = document.createElement("button");
  button.className = "orr-expand-image";
  button.textContent = "[+]";
  button.title = "Expand image inline";
  button.setAttribute("data-image", imageUrl);

  let isExpanded = false;

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isExpanded) {
      // Expand image
      const container = document.createElement("div");
      container.className = "orr-inline-image orr-loading";
      container.setAttribute("data-image", imageUrl);

      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = "Expanded image";

      // Convert imgur page URLs to direct image URLs
      const directUrl = convertImgurUrl(imageUrl);
      img.src = directUrl;

      img.addEventListener("load", () => {
        container.classList.remove("orr-loading");
      });

      img.addEventListener("error", () => {
        container.classList.remove("orr-loading");
        container.innerHTML =
          '<span style="color: #888;">Failed to load image</span>';
      });

      container.appendChild(img);

      // Insert after the button
      button.parentElement.insertBefore(container, button.nextElementSibling);

      button.textContent = "[-]";
      button.title = "Collapse image";
      isExpanded = true;
    } else {
      // Collapse image
      const container = button.parentElement.querySelector(
        `.orr-inline-image[data-image="${imageUrl}"]`
      );
      if (container) {
        container.remove();
      }

      button.textContent = "[+]";
      button.title = "Expand image inline";
      isExpanded = false;
    }
  });

  return button;
}

/**
 * Apply inline image expansion to comment links based on user preferences
 * @returns {Promise<void>}
 */
async function applyInlineImages() {
  const prefs = await getStorage({
    commentEnhancements: {
      inlineImages: true,
      maxImageWidth: 600,
    },
  });
  const enhancements = prefs.commentEnhancements || {};

  // Remove existing expand buttons
  $$(".orr-expand-image").forEach((btn) => btn.remove());
  $$(".orr-inline-image").forEach((img) => img.remove());

  if (!enhancements.inlineImages) {
    return;
  }

  // Set max image width CSS variable
  document.body.style.setProperty(
    "--orr-max-image-width",
    enhancements.maxImageWidth === 0
      ? "100%"
      : `${enhancements.maxImageWidth}px`
  );

  // Find all links in comments
  const commentLinks = $$(".usertext-body .md a[href]");

  commentLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (isImageUrl(href)) {
      // Check if button already exists
      const nextElement = link.nextElementSibling;
      if (nextElement && nextElement.classList.contains("orr-expand-image")) {
        return;
      }

      // Create and insert expand button
      const button = createExpandButton(href);
      link.parentElement.insertBefore(button, link.nextSibling);
    }
  });
}

/**
 * Initialize inline images module
 * @returns {Promise<void>}
 */
export async function initInlineImages() {
  try {
    await applyInlineImages();
  } catch (error) {
    console.error("[ORR] Inline images initialization failed:", error);
  }
}

/**
 * Export applyInlineImages for mutation observer
 */
export { applyInlineImages };

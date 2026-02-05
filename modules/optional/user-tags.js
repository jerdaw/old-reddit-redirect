/**
 * User Tags Module
 * Allows tagging users with custom labels and colors
 */

import { getStorage, setStorage } from "../shared/storage-helpers.js";
import { $$ } from "../shared/dom-helpers.js";

// Available tag colors
const TAG_COLORS = [
  "#ff4500", // Reddit orange
  "#0079d3", // Blue
  "#46d160", // Green
  "#ff8b60", // Light orange
  "#7193ff", // Light blue
  "#ffd635", // Yellow
  "#ff66ac", // Pink
  "#9147ff", // Purple
  "#00d5fa", // Cyan
  "#cccccc", // Gray
  "#ff0000", // Red
  "#00ff00", // Bright green
];

// Current open dialog reference
let currentTagDialog = null;

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if user tags feature is enabled
 * @returns {Promise<boolean>} True if user tags are enabled
 */
async function isUserTagsEnabled() {
  const prefs = await getStorage({ userTags: { enabled: true } });
  return prefs.userTags?.enabled !== false;
}

/**
 * Get tag for a username
 * @param {string} username - Username to retrieve tag for
 * @returns {Promise<Object|null>} Tag object or null if not found
 */
async function getUserTag(username) {
  const prefs = await getStorage({ userTags: { tags: {} } });
  return prefs.userTags?.tags?.[username] || null;
}

/**
 * Set tag for a username
 * @param {string} username - Username to tag
 * @param {Object} tag - Tag object with text and color properties
 * @returns {Promise<void>}
 */
async function setUserTag(username, tag) {
  const prefs = await getStorage({ userTags: { tags: {} } });
  const tags = prefs.userTags?.tags || {};
  tags[username] = tag;
  await setStorage({ userTags: { ...prefs.userTags, tags } });
}

/**
 * Delete tag for a username
 * @param {string} username - Username to remove tag from
 * @returns {Promise<void>}
 */
async function deleteUserTag(username) {
  const prefs = await getStorage({ userTags: { tags: {} } });
  const tags = prefs.userTags?.tags || {};
  delete tags[username];
  await setStorage({ userTags: { ...prefs.userTags, tags } });
}

/**
 * Show tag button next to username
 * @param {Element} authorElement - Author element to add button next to
 * @param {string} username - Username being tagged
 */
function showTagButton(authorElement, username) {
  // Check if button already exists
  const next = authorElement.nextElementSibling;
  if (next && next.classList.contains("orr-tag-btn")) return;

  const button = document.createElement("button");
  button.className = "orr-tag-btn";
  button.textContent = "🏷️";
  button.title = "Tag user";
  button.dataset.username = username;

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTagDialog(username);
  });

  authorElement.parentNode.insertBefore(button, authorElement.nextSibling);
}

/**
 * Show tag badge next to username
 * @param {Element} authorElement - Author element to add badge next to
 * @param {string} username - Username being tagged
 * @param {Object} tag - Tag object with text and color properties
 */
function showTagBadge(authorElement, username, tag) {
  // Check if badge already exists
  const next = authorElement.nextElementSibling;
  if (next && next.classList.contains("orr-user-tag")) return;

  const badge = document.createElement("span");
  badge.className = "orr-user-tag";
  badge.textContent = escapeHtml(tag.text);
  badge.style.backgroundColor = tag.color;
  badge.dataset.username = username;
  badge.title = "Click to edit tag";

  badge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTagDialog(username, tag);
  });

  authorElement.parentNode.insertBefore(badge, authorElement.nextSibling);
}

/**
 * Close the tag dialog and cleanup
 */
function closeTagDialog() {
  if (currentTagDialog) {
    const overlay = document.querySelector(".orr-tag-dialog-overlay");
    if (overlay) overlay.remove();
    currentTagDialog.remove();
    currentTagDialog = null;
  }
}

/**
 * Refresh tags for a username by removing old tags and re-applying
 * @param {string} username - Username to refresh tags for
 * @returns {Promise<void>}
 */
async function refreshUsernameTags(username) {
  // Remove old tags/buttons
  $$(`[data-username="${username}"]`).forEach((el) => {
    if (
      el.classList.contains("orr-tag-btn") ||
      el.classList.contains("orr-user-tag")
    ) {
      el.remove();
    }
  });

  // Re-apply tags
  await applyUserTags();
}

/**
 * Show tag dialog for editing or creating a user tag
 * @param {string} username - Username to tag
 * @param {Object|null} existingTag - Existing tag object or null for new tag
 */
function showTagDialog(username, existingTag = null) {
  // Close any existing dialog
  closeTagDialog();

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "orr-tag-dialog-overlay";

  // Create dialog
  const dialog = document.createElement("div");
  dialog.className = "orr-tag-dialog";

  dialog.innerHTML = `
    <div class="orr-tag-dialog-header">
      <h3>Tag User: u/${escapeHtml(username)}</h3>
      <button class="orr-tag-dialog-close">×</button>
    </div>
    <div class="orr-tag-dialog-body">
      <label>
        Tag Text (max 50 characters)
        <input type="text" id="orr-tag-text" maxlength="50" placeholder="e.g., Friend, Expert, etc." value="${existingTag ? escapeHtml(existingTag.text) : ""}">
      </label>
      <label>
        Color
        <div class="orr-color-picker">
          ${TAG_COLORS.map(
            (color) => `
            <button class="orr-color-option ${existingTag && existingTag.color === color ? "selected" : ""}"
                    data-color="${color}"
                    style="background: ${color};"
                    title="${color}"></button>
          `
          ).join("")}
        </div>
      </label>
    </div>
    <div class="orr-tag-dialog-footer">
      <button class="orr-tag-save">Save Tag</button>
      ${existingTag ? '<button class="orr-tag-delete">Remove Tag</button>' : ""}
      <button class="orr-tag-cancel">Cancel</button>
    </div>
  `;

  // Append to body
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
  currentTagDialog = dialog;

  // Focus input
  const input = dialog.querySelector("#orr-tag-text");
  input.focus();

  // Selected color (default to first color if no existing tag)
  let selectedColor = existingTag ? existingTag.color : TAG_COLORS[0];

  // Color picker event handlers
  dialog.querySelectorAll(".orr-color-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove selected class from all
      dialog
        .querySelectorAll(".orr-color-option")
        .forEach((b) => b.classList.remove("selected"));

      // Add selected class to clicked button
      btn.classList.add("selected");
      selectedColor = btn.dataset.color;
    });
  });

  // Save button
  dialog.querySelector(".orr-tag-save").addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) {
      alert("Please enter tag text");
      return;
    }

    await setUserTag(username, { text, color: selectedColor });
    closeTagDialog();
    refreshUsernameTags(username);
  });

  // Delete button
  const deleteBtn = dialog.querySelector(".orr-tag-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Remove tag for u/${username}?`)) return;

      await deleteUserTag(username);
      closeTagDialog();
      refreshUsernameTags(username);
    });
  }

  // Cancel button
  dialog.querySelector(".orr-tag-cancel").addEventListener("click", () => {
    closeTagDialog();
  });

  // Close button
  dialog
    .querySelector(".orr-tag-dialog-close")
    .addEventListener("click", () => {
      closeTagDialog();
    });

  // Click overlay to close
  overlay.addEventListener("click", () => {
    closeTagDialog();
  });

  // Escape key to close
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeTagDialog();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

/**
 * Apply user tags to all author elements on the page
 * @returns {Promise<void>}
 */
async function applyUserTags() {
  try {
    const enabled = await isUserTagsEnabled();
    if (!enabled) return;

    // Find all .author elements that haven't been processed
    const authors = $$(".author:not(.orr-tagged)");

    for (const author of authors) {
      const username = author.textContent.trim();
      if (!username) continue;

      // Mark as processed
      author.classList.add("orr-tagged");

      // Check if user has a tag
      const tag = await getUserTag(username);

      if (tag) {
        showTagBadge(author, username, tag);
      } else {
        showTagButton(author, username);
      }
    }
  } catch (error) {
    console.error("[ORR] Error applying user tags:", error);
  }
}

/**
 * Initialize user tags module
 * @returns {Promise<void>}
 */
export async function initUserTags() {
  try {
    await applyUserTags();
  } catch (error) {
    console.error("[ORR] User tags initialization failed:", error);
  }
}

/**
 * Export applyUserTags for mutation observer
 */
export { applyUserTags };

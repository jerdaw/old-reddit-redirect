/**
 * i18n Helper Module
 * Wrapper around chrome.i18n to support potential future overrides
 */

/**
 * Get a localized string
 * @param {string} key - The key in messages.json
 * @param {string|string[]} [substitutions] - Optional substitutions
 * @returns {string} The localized string or the key if not found
 */
export function msg(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/**
 * Localize the current page by finding all elements with data-i18n attribute
 */
export function localizePage() {
  const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
  placeholders.forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const text = msg(key);
    if (text !== key) {
      el.placeholder = text;
    }
  });

  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = msg(key);

    if (text !== key) {
      el.textContent = text;
    }
  });
}

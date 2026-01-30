"use strict";

/**
 * Offscreen document for clipboard operations
 * Required for Manifest V3 clipboard access from service workers
 */

(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "COPY_TO_CLIPBOARD") {
      copyToClipboard(message.text)
        .then(() => sendResponse({ success: true }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        );
      return true; // Keep channel open for async response
    }
  });

  /**
   * Copy text to clipboard using textarea method
   * @param {string} text - Text to copy
   * @returns {Promise<void>}
   */
  async function copyToClipboard(text) {
    const textarea = document.getElementById("clipboard-area");
    textarea.value = text;
    textarea.select();

    try {
      const success = document.execCommand("copy");
      if (!success) {
        throw new Error("execCommand failed");
      }
    } finally {
      textarea.value = "";
      textarea.blur();
    }
  }
})();

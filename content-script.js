"use strict";

/**
 * Content script for old.reddit.com
 * Shows a notification when redirected from new Reddit with option to go back
 */

(function () {
  /**
   * Show redirect notice if enabled
   */
  async function showRedirectNotice() {
    // Check if coming from redirect (referrer is reddit.com but not old.reddit.com)
    const referrer = document.referrer;
    const cameFromRedirect =
      referrer &&
      referrer.includes("reddit.com") &&
      !referrer.includes("old.reddit.com");

    if (!cameFromRedirect) return;

    // Check if notice is enabled in preferences
    const result = await chrome.storage.local.get({
      ui: { showRedirectNotice: false },
    });
    const prefs = result.ui || {};

    if (!prefs.showRedirectNotice) return;

    // Check if already shown this session
    if (sessionStorage.getItem("orr-notice-shown")) return;
    sessionStorage.setItem("orr-notice-shown", "true");

    // Create notice element
    const notice = document.createElement("div");
    notice.id = "orr-redirect-notice";
    notice.innerHTML = `
      <span class="orr-notice-text">Redirected from new Reddit</span>
      <button class="orr-notice-button" id="orr-go-back">Go back</button>
      <button class="orr-notice-close" id="orr-close-notice">×</button>
    `;

    document.body.appendChild(notice);

    // Event handlers
    document.getElementById("orr-go-back").addEventListener("click", () => {
      // Navigate to new Reddit version
      const newUrl = window.location.href.replace(
        "old.reddit.com",
        "www.reddit.com"
      );
      window.location.href = newUrl;
    });

    document
      .getElementById("orr-close-notice")
      .addEventListener("click", () => {
        notice.classList.add("orr-fade-out");
        setTimeout(() => notice.remove(), 300);
      });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notice.parentElement) {
        notice.classList.add("orr-fade-out");
        setTimeout(() => notice.remove(), 300);
      }
    }, 5000);
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showRedirectNotice);
  } else {
    showRedirectNotice();
  }
})();

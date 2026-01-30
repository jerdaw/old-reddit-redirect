"use strict";

/**
 * Content script for old.reddit.com
 * Shows a notification when redirected from new Reddit
 */

(function () {
  /**
   * Check if this was a redirect from new Reddit
   */
  function checkRedirect() {
    const referrer = document.referrer;
    if (!referrer) return;

    try {
      const referrerUrl = new URL(referrer);
      const isFromNewReddit = /^(www|np|nr|ns|amp)?\.?reddit\.com$/.test(
        referrerUrl.hostname
      );

      if (!isFromNewReddit) return;

      // Check user preference
      chrome.storage.local.get({ showRedirectNotice: false }, (result) => {
        if (result.showRedirectNotice) {
          showNotification(referrerUrl.href);
        }
      });
    } catch (e) {
      // Invalid referrer URL, ignore
    }
  }

  /**
   * Show redirect notification
   */
  function showNotification(originalUrl) {
    // Check if notification already exists
    if (document.getElementById("orr-redirect-notice")) {
      return;
    }

    const notice = document.createElement("div");
    notice.id = "orr-redirect-notice";

    const hostname = new URL(originalUrl).hostname;
    notice.innerHTML = `
      <span class="orr-notice-text">Redirected from ${hostname}</span>
      <button class="orr-notice-btn" id="orr-go-back">Go Back</button>
      <button class="orr-notice-close" id="orr-dismiss">×</button>
    `;

    // Styling
    notice.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a1a1b;
      color: #d7dadc;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: orr-slide-in 0.3s ease;
      border: 1px solid #343536;
    `;

    // Add animation keyframes
    if (!document.getElementById("orr-styles")) {
      const style = document.createElement("style");
      style.id = "orr-styles";
      style.textContent = `
        @keyframes orr-slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .orr-notice-text {
          flex: 1;
          margin-right: 8px;
        }
        .orr-notice-btn {
          background-color: #343536;
          color: #d7dadc;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .orr-notice-btn:hover {
          background-color: #4a4a4c;
        }
        .orr-notice-close {
          background: none;
          border: none;
          color: #818384;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .orr-notice-close:hover {
          color: #d7dadc;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notice);

    // Event listeners
    document.getElementById("orr-go-back").addEventListener("click", () => {
      window.location.href = originalUrl;
    });

    document.getElementById("orr-dismiss").addEventListener("click", () => {
      notice.remove();
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (notice.parentElement) {
        notice.remove();
      }
    }, 5000);
  }

  // Check for redirect when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkRedirect);
  } else {
    checkRedirect();
  }
})();

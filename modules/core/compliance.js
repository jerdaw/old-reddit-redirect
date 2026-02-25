/**
 * Compliance & Sustainability Module
 * Handles age verification and sustainability messaging
 */

import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Check if current page is NSFW
 * Uses Reddit's native flags or URL patterns
 * @returns {boolean} True if NSFW
 */
function isNsfwPage() {
  // Check for Reddit's over18 flag in body class
  if (document.body.classList.contains("over18")) return true;

  // Check implementation-specific markers
  if (document.querySelector(".nsfw-warning-content")) return true;

  return false;
}

/**
 * Compliance Manager
 * Orchestrates age verification and support messaging
 */
export class ComplianceManager {
  constructor() {
    this.verified = false;
    this.settings = null;
  }

  /**
   * Initialize compliance features
   */
  async init() {
    this.settings = await getStorage({
      compliance: {
        ageVerificationEnabled: false,
        lastVerified: 0,
      },
    });

    if (this.settings.compliance.ageVerificationEnabled) {
      await this.checkAgeVerification();
    }
  }

  /**
   * Check if age verification is needed
   */
  async checkAgeVerification() {
    if (!isNsfwPage()) return;

    // Check session storage first (per-session verification)
    const sessionVerified = sessionStorage.getItem("orr-age-verified");
    if (sessionVerified) return;

    debugLog("[ORE] Compliance: NSFW content detected, checking verification");
    this.showAgeVerificationModal();
  }

  /**
   * Show the age verification modal
   */
  showAgeVerificationModal() {
    if (document.getElementById("orr-age-verify-modal")) return;

    // Create modal
    const modal = document.createElement("div");
    modal.id = "orr-age-verify-modal";
    modal.className = "orr-modal-overlay";
    modal.innerHTML = `
      <div class="orr-modal-content">
        <h2>Age Verification</h2>
        <p>This content is marked as NSFW (Not Safe For Work).</p>
        <p>Please confirm you are 18 years of age or older to view this content.</p>
        <div class="orr-modal-actions">
          <button id="orr-verify-yes" class="orr-btn orr-btn-primary">I am 18+</button>
          <button id="orr-verify-no" class="orr-btn orr-btn-secondary">Go Back</button>
        </div>
      </div>
    `;

    // Inject styles if not present
    if (!document.getElementById("orr-compliance-styles")) {
      const style = document.createElement("style");
      style.id = "orr-compliance-styles";
      style.textContent = `
        .orr-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }
        .orr-modal-content {
          background: var(--newCommunityTheme-body);
          border: 1px solid var(--newCommunityTheme-line);
          padding: 24px;
          border-radius: 8px;
          max-width: 400px;
          text-align: center;
          color: var(--newCommunityTheme-bodyText);
        }
        .orr-modal-content h2 {
          margin-top: 0;
          color: var(--newCommunityTheme-bodyText);
        }
        .orr-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }
        .orr-btn {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          border: none;
        }
        .orr-btn-primary {
          background: #ff4500;
          color: white;
        }
        .orr-btn-secondary {
          background: transparent;
          border: 1px solid currentColor;
          color: var(--newCommunityTheme-bodyText);
        }
        /* Fallback colors for non-Reddit pages or failed var injection */
        :root:not([style*="--newCommunityTheme"]) .orr-modal-content {
          background: #1a1a1b;
          color: #d7dadc;
          border-color: #343536;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden"; // Prevent scrolling

    // Add event listeners
    document.getElementById("orr-verify-yes").addEventListener("click", () => {
      this.verifyAge();
      modal.remove();
      document.body.style.overflow = "";
    });

    document.getElementById("orr-verify-no").addEventListener("click", () => {
      history.back();
    });
  }

  /**
   * Mark user as verified
   */
  async verifyAge() {
    sessionStorage.setItem("orr-age-verified", "true");

    // Update last verified timestamp if we want to persist longer (optional future enhancement)
    // For now, we stick to session-only for stricter compliance
    debugLog("[ORE] Compliance: User verified age");
  }
}

// Singleton instance
const complianceManager = new ComplianceManager();

/**
 * Initialize compliance features
 */
export async function initCompliance() {
  await complianceManager.init();
}

/**
 * Nag Blocking Module
 * Removes login prompts, premium banners, app prompts, and other annoyances
 */

import { getStorage } from "../shared/storage-helpers.js";
import { $$ } from "../shared/dom-helpers.js";

/**
 * Define nag selectors by category
 */
const nagSelectors = {
  loginPrompts: [
    ".login-required-popup",
    ".login-form-side",
    ".modal-dialog.login-popup",
    "#login_login-main",
    ".cover-overlay",
    ".login-popup-overlay",
    ".tooltip.login-required",
  ],
  emailVerification: [
    ".infobar.verify-email",
    ".newsletterbar",
    ".email-collection",
    "#newsletter-signup",
    ".user-info .verify-email-cta",
  ],
  premiumBanners: [
    ".gold-accent",
    ".premium-banner",
    ".gold-banner-wrap",
    "#gold-promo",
    ".sidecontentbox .premium-cta",
    'a[href*="/premium"]',
    ".native-banner-ad",
    ".premium-tooltip",
    ".side .spacer .titlebox .premium-banner-inner",
    ".side .infobar.premium",
    ".gold-accent.gold-accent-link",
  ],
  appPrompts: [
    ".app-download-prompt",
    ".mobile-app-banner",
    ".get-app-banner",
    "#app-download-splash",
    ".download-app-button",
    ".mobile-web-redirect",
  ],
  aiContent: [
    '[data-ai-generated="true"]',
    "[data-testid*='ai']",
    ".ai-overview",
    ".ai-answer",
    ".ai-summary",
    ".generated-content",
    '[aria-label*="AI-generated"]',
    '[aria-label*="AI answer"]',
    ".search-ai-answer",
    ".ai-comment",
  ],
  trending: [
    ".trending-subreddits",
    "#trending-posts",
    ".trending-communities",
    '[data-type="trending"]',
    ".sidecontentbox .trending",
  ],
  recommended: [
    ".recommended-communities",
    ".recommended-subreddits",
    ".subreddit-recommendations",
    "[data-recommendation-type]",
    ".side .rec-community",
  ],
  communityHighlights: [
    ".community-highlights",
    ".featured-content",
    ".community-spotlight",
    ".highlighted-post",
  ],
  morePosts: [
    ".more-posts-you-may-like",
    ".recommended-posts",
    '[data-context="recommended"]',
    ".continue-this-thread",
    ".recommended-feed",
  ],
};

/**
 * Apply nag blocking based on user preferences
 * @returns {Promise<void>}
 */
async function applyNagBlocking() {
  const prefs = await getStorage({
    nagBlocking: {
      enabled: true,
      blockLoginPrompts: true,
      blockEmailVerification: true,
      blockPremiumBanners: true,
      blockAppPrompts: true,
    },
  });
  const nagBlocking = prefs.nagBlocking || {};

  if (!nagBlocking.enabled) {
    document.body.classList.remove("orr-block-nags");
    return;
  }

  // Apply main blocking class
  document.body.classList.add("orr-block-nags");

  // Remove elements based on preferences
  const selectorsToBlock = [];

  if (nagBlocking.blockLoginPrompts) {
    selectorsToBlock.push(...nagSelectors.loginPrompts);
  }
  if (nagBlocking.blockEmailVerification) {
    selectorsToBlock.push(...nagSelectors.emailVerification);
  }
  if (nagBlocking.blockPremiumBanners) {
    selectorsToBlock.push(...nagSelectors.premiumBanners);
  }
  if (nagBlocking.blockAppPrompts) {
    selectorsToBlock.push(...nagSelectors.appPrompts);
  }
  if (nagBlocking.blockAIContent) {
    selectorsToBlock.push(...nagSelectors.aiContent);
  }
  if (nagBlocking.blockTrending) {
    selectorsToBlock.push(...nagSelectors.trending);
  }
  if (nagBlocking.blockRecommended) {
    selectorsToBlock.push(...nagSelectors.recommended);
  }
  if (nagBlocking.blockCommunityHighlights) {
    selectorsToBlock.push(...nagSelectors.communityHighlights);
  }
  if (nagBlocking.blockMorePosts) {
    selectorsToBlock.push(...nagSelectors.morePosts);
  }

  // Remove all matching elements
  selectorsToBlock.forEach((selector) => {
    const elements = $$(selector);
    elements.forEach((el) => {
      el.classList.add("orr-nag");
      el.style.display = "none";
    });
  });
}

/**
 * Initialize nag blocking module
 * @returns {Promise<void>}
 */
export async function initNagBlocking() {
  try {
    await applyNagBlocking();
  } catch (error) {
    console.error("[ORR] Nag blocking initialization failed:", error);
  }
}

/**
 * Export applyNagBlocking for use by mutation observer
 */
export { applyNagBlocking };

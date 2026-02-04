/**
 * Page Detection Utilities
 * Identifies Reddit page types for conditional feature loading
 */

/**
 * Check if current page is a comments/thread page
 * @returns {boolean} True if on a comments page
 */
export function isCommentsPage() {
  return /\/comments\/[a-z0-9]+/i.test(window.location.pathname);
}

/**
 * Check if current page is a subreddit listing page
 * @returns {boolean} True if on a subreddit page
 */
export function isSubredditPage() {
  return /^\/r\/[^\/]+\/?(\?.*)?$/.test(window.location.pathname);
}

/**
 * Check if current page is the front page
 * @returns {boolean} True if on the front page
 */
export function isFrontPage() {
  return window.location.pathname === "/" || window.location.pathname === "";
}

/**
 * Check if current page is a user profile page
 * @returns {boolean} True if on a user profile page
 */
export function isUserPage() {
  return /^\/user\/[^\/]+/i.test(window.location.pathname);
}

/**
 * Get current subreddit name if on a subreddit page
 * @returns {string|null} Subreddit name or null
 */
export function getCurrentSubreddit() {
  const match = window.location.pathname.match(/^\/r\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Get current post ID if on a comments page
 * @returns {string|null} Post ID or null
 */
export function getCurrentPostId() {
  const match = window.location.pathname.match(/\/comments\/([a-z0-9]+)/i);
  return match ? match[1] : null;
}

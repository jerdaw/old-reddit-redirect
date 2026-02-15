/**
 * Community Subscriptions Module
 * Handles fetching, updating, and managing shared filter lists
 */

import { getStorage, setStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

/**
 * Get all subscriptions
 * @returns {Promise<Array>} List of subscriptions
 */
export async function getSubscriptions() {
  const data = await getStorage({ community: { subscriptions: [] } });
  return data.community.subscriptions;
}

/**
 * Add a new subscription
 * @param {string} url - URL of the list
 * @returns {Promise<Object>} Added subscription
 */
export async function addSubscription(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch list");

    const listData = await response.json();
    validateList(listData);

    const type = canonicalizeContentType(listData.contentType);
    const subscription = {
      id: crypto.randomUUID(),
      url,
      name: listData.metadata.name,
      description: listData.metadata.description,
      author: listData.metadata.author,
      type,
      lastUpdated: new Date().toISOString(),
      items: listData.items,
      appliedItems: [],
    };

    const subs = await getSubscriptions();

    // Check for duplicates
    if (subs.some((s) => s.url === url)) {
      throw new Error("Already subscribed to this list");
    }

    // Apply filters immediately and record only newly merged entries.
    subscription.appliedItems = await applySubscriptionFilters(subscription);

    subs.push(subscription);
    await saveSubscriptions(subs);

    return subscription;
  } catch (error) {
    console.error("[ORR] Failed to add subscription:", error);
    throw error;
  }
}

/**
 * Remove a subscription
 * @param {string} id - Subscription ID
 */
export async function removeSubscription(id) {
  const subs = await getSubscriptions();
  const index = subs.findIndex((s) => s.id === id);

  if (index !== -1) {
    subs.splice(index, 1);
    await saveSubscriptions(subs);
  }
}

/**
 * Validate list format
 * @param {Object} data
 */
function validateList(data) {
  if (
    data.type !== "orr-list" ||
    !data.items ||
    !Array.isArray(data.items) ||
    !data.metadata ||
    typeof data.metadata.name !== "string"
  ) {
    throw new Error("Invalid list format");
  }

  if (data.contentType && !canonicalizeContentType(data.contentType)) {
    throw new Error("Invalid list content type");
  }
}

/**
 * Apply filters from a subscription to the main settings
 * @param {Object} subscription
 * @returns {Promise<Array<string>>} Newly applied items
 */
async function applySubscriptionFilters(subscription) {
  const type = canonicalizeContentType(subscription.type);
  if (!type) {
    debugLog(
      `[ORR] Unknown subscription type for ${subscription.name}; skipping merge`
    );
    return [];
  }

  const normalizedItems = normalizeItems(type, subscription.items);
  if (normalizedItems.length === 0) {
    return [];
  }

  let appliedItems = [];

  if (type === "subreddits") {
    const data = await getStorage({
      subredditOverrides: { mutedSubreddits: [] },
    });
    const overrides = data.subredditOverrides || { mutedSubreddits: [] };
    const existing = new Set(
      (overrides.mutedSubreddits || []).map((item) => normalizeSubreddit(item))
    );

    appliedItems = normalizedItems.filter((item) => !existing.has(item));
    if (appliedItems.length > 0) {
      overrides.mutedSubreddits = Array.from(
        new Set([...(overrides.mutedSubreddits || []), ...appliedItems])
      ).sort();
      await setStorage({ subredditOverrides: overrides });
    }
  } else if (type === "keywords") {
    const data = await getStorage({ contentFiltering: { mutedKeywords: [] } });
    const filtering = data.contentFiltering || { mutedKeywords: [] };
    const existing = new Set(filtering.mutedKeywords || []);

    appliedItems = normalizedItems.filter((item) => !existing.has(item));
    if (appliedItems.length > 0) {
      filtering.mutedKeywords = Array.from(
        new Set([...(filtering.mutedKeywords || []), ...appliedItems])
      ).sort();
      await setStorage({ contentFiltering: filtering });
    }
  } else if (type === "domains") {
    const data = await getStorage({ contentFiltering: { mutedDomains: [] } });
    const filtering = data.contentFiltering || { mutedDomains: [] };
    const existing = new Set(
      (filtering.mutedDomains || []).map((item) => normalizeDomain(item))
    );

    appliedItems = normalizedItems.filter((item) => !existing.has(item));
    if (appliedItems.length > 0) {
      filtering.mutedDomains = Array.from(
        new Set([...(filtering.mutedDomains || []), ...appliedItems])
      ).sort();
      await setStorage({ contentFiltering: filtering });
    }
  }

  debugLog(`[ORR] Applying filters from ${subscription.name}`);
  return appliedItems;
}

async function saveSubscriptions(subscriptions) {
  const data = await getStorage({ community: { subscriptions: [] } });
  const community = data.community || { subscriptions: [] };
  await setStorage({
    community: {
      ...community,
      subscriptions,
    },
  });
}

function canonicalizeContentType(type) {
  if (!type || typeof type !== "string") return null;
  const normalized = type.toLowerCase().trim();
  if (normalized === "subreddit" || normalized === "subreddits") {
    return "subreddits";
  }
  if (normalized === "keyword" || normalized === "keywords") {
    return "keywords";
  }
  if (normalized === "domain" || normalized === "domains") {
    return "domains";
  }
  return null;
}

function normalizeItems(type, items) {
  if (!Array.isArray(items)) return [];
  if (type === "subreddits") {
    return Array.from(
      new Set(
        items
          .map((item) => normalizeSubreddit(item))
          .filter((item) => /^[a-z0-9_]+$/i.test(item))
      )
    );
  }
  if (type === "keywords") {
    return Array.from(
      new Set(
        items
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0)
      )
    );
  }
  if (type === "domains") {
    return Array.from(
      new Set(
        items
          .map((item) => normalizeDomain(item))
          .filter((item) => item.length > 0)
      )
    );
  }
  return [];
}

function normalizeSubreddit(value) {
  return String(value).toLowerCase().replace(/^r\//, "").trim();
}

function normalizeDomain(value) {
  return String(value)
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/+$/, "")
    .trim();
}

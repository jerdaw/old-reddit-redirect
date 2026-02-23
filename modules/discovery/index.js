/**
 * Content Discovery Module
 * Handles related posts, saved post organization, and smart collections
 */
import { getStorage } from "../shared/storage-helpers.js";
import { debugLog } from "../shared/debug-helpers.js";

export async function initDiscovery() {
  const prefs = await getStorage("discovery");
  const settings = prefs.discovery || {};

  if (!settings.enabled) {
    return;
  }

  // Related posts
  if (settings.relatedPosts) {
    import("./related.js").then((m) => m.initRelatedPosts());
  }

  // Smart collections (auto-tagging)
  if (settings.smartCollections) {
    import("./smart-collections.js").then((m) => m.initSmartCollections());
  }

  debugLog("[ORR] Discovery module initialized");
}

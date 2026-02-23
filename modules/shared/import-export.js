/**
 * Import/Export Utilities
 * Handles exporting settings to JSON and importing them back
 */

import { getStorage, setStorage } from "./storage-helpers.js";
import { debugLog } from "./debug-helpers.js";

/**
 * Export current settings to a JSON file
 * @param {string} filename - Filename for the download
 */
export async function exportSettings(
  filename = "old-reddit-redirect-settings.json"
) {
  try {
    const data = await getStorage(null); // Get all storage
    // Remove internal/cache fields if necessary
    const exportData = {
      version: chrome.runtime.getManifest().version,
      timestamp: new Date().toISOString(),
      settings: data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    debugLog("[ORR] Settings exported");
  } catch (error) {
    console.error("[ORR] Export failed:", error);
    throw error;
  }
}

/**
 * Import settings from a JSON object
 * @param {Object} data - The parsed JSON data
 * @returns {Promise<Object>} Result status { success, message }
 */
export async function importSettings(data) {
  try {
    if (!data.settings) {
      throw new Error("Invalid settings format");
    }

    // specific validation logic here if needed

    await setStorage(data.settings);
    debugLog("[ORR] Settings imported");
    return { success: true, message: "Settings imported successfully" };
  } catch (error) {
    console.error("[ORR] Import failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Export specific list (for community sharing)
 * @param {string} type - 'subreddits', 'keywords', 'domains', 'users'
 * @param {Array} list - The list data
 * @param {Object} metadata - Name, description, author
 */
export function exportList(type, list, metadata) {
  const exportData = {
    type: "orr-list",
    contentType: type,
    metadata: {
      ...metadata,
      version: "1.0",
      timestamp: new Date().toISOString(),
    },
    items: list,
  };

  const filename = `orr-${type}-${metadata.name.toLowerCase().replace(/\s+/g, "-")}.json`;

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

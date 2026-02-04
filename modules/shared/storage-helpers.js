/**
 * Storage Helper Utilities
 * Wrappers for chrome.storage.local operations
 */

/**
 * Get storage values with defaults
 * @param {Object} defaults - Default values
 * @returns {Promise<Object>} Storage values
 */
export async function getStorage(defaults = {}) {
  try {
    return await chrome.storage.local.get(defaults);
  } catch (error) {
    console.error("[ORR] Storage read error:", error);
    return defaults;
  }
}

/**
 * Set storage values
 * @param {Object} values - Values to set
 * @returns {Promise<void>}
 */
export async function setStorage(values) {
  try {
    await chrome.storage.local.set(values);
  } catch (error) {
    console.error("[ORR] Storage write error:", error);
    throw error;
  }
}

/**
 * Update storage values (merge with existing)
 * @param {Object} updates - Values to update
 * @returns {Promise<void>}
 */
export async function updateStorage(updates) {
  try {
    const current = await chrome.storage.local.get(Object.keys(updates));
    const merged = {};

    Object.keys(updates).forEach((key) => {
      if (
        typeof updates[key] === "object" &&
        !Array.isArray(updates[key]) &&
        updates[key] !== null
      ) {
        merged[key] = { ...current[key], ...updates[key] };
      } else {
        merged[key] = updates[key];
      }
    });

    await chrome.storage.local.set(merged);
  } catch (error) {
    console.error("[ORR] Storage update error:", error);
    throw error;
  }
}

/**
 * Remove storage keys
 * @param {string|string[]} keys - Keys to remove
 * @returns {Promise<void>}
 */
export async function removeStorage(keys) {
  try {
    await chrome.storage.local.remove(keys);
  } catch (error) {
    console.error("[ORR] Storage remove error:", error);
    throw error;
  }
}

/**
 * Clear all storage
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  try {
    await chrome.storage.local.clear();
  } catch (error) {
    console.error("[ORR] Storage clear error:", error);
    throw error;
  }
}

/**
 * Listen for storage changes
 * @param {Function} callback - Callback function (changes, areaName)
 * @returns {Function} Unsubscribe function
 */
export function onStorageChange(callback) {
  chrome.storage.onChanged.addListener(callback);
  return () => chrome.storage.onChanged.removeListener(callback);
}

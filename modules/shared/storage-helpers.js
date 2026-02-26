/**
 * Storage Helper Utilities
 * Wrappers for chrome.storage.local operations
 */

/**
 * Promise-based mutex for serializing storage writes
 */
let storageMutex = Promise.resolve();

/**
 * Execute a function while holding the storage lock
 * Prevents read-modify-write race conditions
 * @param {Function} fn - Async function to execute under lock
 * @returns {Promise<*>} Result of fn
 */
export function withStorageLock(fn) {
  let resolve;
  const prev = storageMutex;
  storageMutex = new Promise((r) => {
    resolve = r;
  });
  return prev.then(fn).finally(resolve);
}

/**
 * Deep merge two objects (arrays are replaced, not merged)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * Get storage values with defaults
 * @param {Object} defaults - Default values
 * @returns {Promise<Object>} Storage values
 */
export async function getStorage(defaults = {}) {
  try {
    return await chrome.storage.local.get(defaults);
  } catch (error) {
    console.error("[ORE] Storage read error:", error);
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
    console.error("[ORE] Storage write error:", error);
    throw error;
  }
}

/**
 * Update storage values (merge with existing)
 * @param {Object} updates - Values to update
 * @returns {Promise<void>}
 */
export async function updateStorage(updates) {
  return withStorageLock(async () => {
    try {
      const current = await chrome.storage.local.get(Object.keys(updates));
      const merged = {};

      Object.keys(updates).forEach((key) => {
        if (
          typeof updates[key] === "object" &&
          !Array.isArray(updates[key]) &&
          updates[key] !== null
        ) {
          merged[key] = deepMerge(current[key] || {}, updates[key]);
        } else {
          merged[key] = updates[key];
        }
      });

      await chrome.storage.local.set(merged);
    } catch (error) {
      console.error("[ORE] Storage update error:", error);
      throw error;
    }
  });
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
    console.error("[ORE] Storage remove error:", error);
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
    console.error("[ORE] Storage clear error:", error);
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

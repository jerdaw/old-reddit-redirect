"use strict";

// Import storage and logger (for service worker, use importScripts)
if (typeof importScripts === "function") {
  importScripts("logger.js", "storage.js");
}

(function () {
  const RULESET_ID = "ruleset_1";
  const TEMP_DISABLE_ALARM = "tempDisableExpiry";
  const DYNAMIC_RULE_ID_BASE = 1000;
  const FRONTEND_RULE_ID_BASE = 2000;
  const TAB_RULE_ID_BASE = 10000;

  // In-memory set for tracking disabled tabs (session-based)
  const disabledTabs = new Set();

  function handleLastError(context) {
    Logger.handleChromeError(context);
  }

  /**
   * Update action UI (badge and title)
   */
  async function updateActionUi(tabId = null) {
    const enabled = await Storage.getEnabled();
    const prefs = await Storage.getUIPreferences();
    const stats = await Storage.getStats();

    // Badge color
    const color = enabled ? "#4CAF50" : "#d14343"; // Green or red
    chrome.action.setBadgeBackgroundColor({ color }, () => {
      handleLastError();
    });

    // Badge text based on preference
    let badgeText = "";
    switch (prefs.badgeStyle) {
      case "text":
        badgeText = enabled ? "" : "OFF";
        break;
      case "count":
        badgeText = enabled ? String(stats.todayRedirects || "") : "OFF";
        break;
      case "color":
        badgeText = ""; // Color-only indicator
        break;
    }

    const setBadge = tabId ? { text: badgeText, tabId } : { text: badgeText };

    chrome.action.setBadgeText(setBadge, () => {
      handleLastError();
    });

    // Tooltip
    const title = enabled
      ? `Old Reddit Redirect is ON\n${stats.todayRedirects} redirects today`
      : "Old Reddit Redirect is OFF (click to enable)";

    const setTitle = tabId ? { title, tabId } : { title };

    chrome.action.setTitle(setTitle, () => {
      handleLastError();
    });
  }

  /**
   * Animate toggle (flash badge)
   */
  async function animateToggle(toEnabled) {
    const prefs = await Storage.getUIPreferences();
    if (!prefs.animateToggle) return;

    const flashColors = toEnabled
      ? ["#ff4500", "#4CAF50"]
      : ["#ff4500", "#d14343"];

    for (const color of flashColors) {
      chrome.action.setBadgeBackgroundColor({ color }, () => {
        handleLastError();
      });
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  /**
   * Toggle redirect on/off
   */
  async function toggleRedirect() {
    const enabled = await Storage.getEnabled();
    const newState = !enabled;

    await Storage.setEnabled(newState);
    await updateRuleset(newState);
    await animateToggle(newState);
    await updateActionUi();
  }

  /**
   * Configure icon click behavior
   * @param {string} behavior - "popup" or "toggle"
   */
  async function configureIconBehavior(behavior) {
    if (behavior === "toggle") {
      // Disable popup - onClicked listener will fire instead
      chrome.action.setPopup({ popup: "" }, () => {
        handleLastError("configureIconBehavior: setPopup");
      });
      Logger.debug("Icon click behavior set to: toggle");
    } else {
      // Enable popup (default behavior)
      chrome.action.setPopup({ popup: "popup.html" }, () => {
        handleLastError("configureIconBehavior: setPopup");
      });
      Logger.debug("Icon click behavior set to: popup");
    }
  }

  /**
   * Update DNR ruleset
   */
  async function updateRuleset(enabled) {
    return new Promise((resolve) => {
      chrome.declarativeNetRequest.updateEnabledRulesets(
        enabled
          ? { enableRulesetIds: [RULESET_ID], disableRulesetIds: [] }
          : { enableRulesetIds: [], disableRulesetIds: [RULESET_ID] },
        () => {
          handleLastError();
          resolve();
        }
      );
    });
  }

  /**
   * Initialize action UI on startup
   */
  async function initializeActionUi() {
    await updateActionUi();
  }

  /**
   * Track redirects for statistics
   */
  async function trackRedirect(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== "old.reddit.com") return;

      // Extract subreddit from path
      const match = urlObj.pathname.match(/^\/r\/([^/?#]+)/);
      const subreddit = match ? match[1] : null;

      await Storage.incrementRedirectCount(subreddit);

      // Update badge if showing count
      const prefs = await Storage.getUIPreferences();
      if (prefs.badgeStyle === "count") {
        await updateActionUi();
      }
    } catch {
      // Invalid URL, ignore
    }
  }

  /**
   * Set temporary disable
   */
  async function setTemporaryDisable(duration, expiresAt) {
    await Storage.setTemporaryDisable({
      active: true,
      expiresAt,
      duration,
    });

    // Disable the ruleset
    await Storage.setEnabled(false);
    await updateRuleset(false);
    await updateActionUi();

    // Set alarm for re-enabling
    chrome.alarms.create(TEMP_DISABLE_ALARM, {
      when: Date.now() + duration,
    });
  }

  /**
   * Cancel temporary disable
   */
  async function cancelTemporaryDisable() {
    await Storage.setTemporaryDisable({
      active: false,
      expiresAt: null,
      duration: null,
    });

    await Storage.setEnabled(true);
    await updateRuleset(true);
    await updateActionUi();

    chrome.alarms.clear(TEMP_DISABLE_ALARM, () => {
      handleLastError();
    });
  }

  /**
   * Update subreddit override rules
   */
  async function updateSubredditRules() {
    const { whitelist } = await Storage.getSubredditOverrides();

    // Remove existing dynamic rules
    const existingRules = await new Promise((resolve) => {
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        handleLastError();
        resolve(rules || []);
      });
    });

    const existingIds = existingRules
      .filter(
        (r) => r.id >= DYNAMIC_RULE_ID_BASE && r.id < FRONTEND_RULE_ID_BASE
      )
      .map((r) => r.id);

    if (existingIds.length > 0) {
      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateDynamicRules(
          { removeRuleIds: existingIds },
          () => {
            handleLastError();
            resolve();
          }
        );
      });
    }

    if (whitelist.length === 0) return;

    // Create allowlist rules for whitelisted subreddits
    const newRules = whitelist.map((subreddit, index) => ({
      id: DYNAMIC_RULE_ID_BASE + index,
      priority: 2,
      action: { type: "allow" },
      condition: {
        regexFilter: `^https?://(?:www\\.)?reddit\\.com/r/${escapeRegex(subreddit)}(?:/|$)`,
        resourceTypes: ["main_frame"],
      },
    }));

    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateDynamicRules(
        { addRules: newRules },
        () => {
          handleLastError();
          resolve();
        }
      );
    });
  }

  /**
   * Escape regex special characters
   */
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Disable redirect for specific tab
   */
  async function disableForTab(tabId) {
    const ruleId = TAB_RULE_ID_BASE + tabId;

    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateSessionRules(
        {
          addRules: [
            {
              id: ruleId,
              priority: 10,
              action: { type: "allow" },
              condition: {
                urlFilter: "||reddit.com/*",
                tabIds: [tabId],
                resourceTypes: ["main_frame"],
              },
            },
          ],
        },
        () => {
          handleLastError();
          resolve();
        }
      );
    });

    disabledTabs.add(tabId);
    await updateTabBadge(tabId, false);
  }

  /**
   * Enable redirect for specific tab
   */
  async function enableForTab(tabId) {
    const ruleId = TAB_RULE_ID_BASE + tabId;

    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateSessionRules(
        { removeRuleIds: [ruleId] },
        () => {
          handleLastError();
          resolve();
        }
      );
    });

    disabledTabs.delete(tabId);
    await updateTabBadge(tabId, true);
  }

  /**
   * Update badge for specific tab
   */
  async function updateTabBadge(tabId, enabled) {
    chrome.action.setBadgeText(
      {
        text: enabled ? "" : "TAB",
        tabId,
      },
      () => {
        handleLastError();
      }
    );
  }

  /**
   * Create context menus
   */
  function createContextMenus() {
    chrome.contextMenus.removeAll(() => {
      handleLastError();

      // Open in Old Reddit
      chrome.contextMenus.create(
        {
          id: "open-old-reddit",
          title: "Open in Old Reddit",
          contexts: ["link"],
          targetUrlPatterns: [
            "*://www.reddit.com/*",
            "*://reddit.com/*",
            "*://np.reddit.com/*",
            "*://new.reddit.com/*",
          ],
        },
        () => {
          handleLastError();
        }
      );

      // Open in New Reddit
      chrome.contextMenus.create(
        {
          id: "open-new-reddit",
          title: "Open in New Reddit",
          contexts: ["link"],
          targetUrlPatterns: ["*://old.reddit.com/*"],
        },
        () => {
          handleLastError();
        }
      );

      // Copy as Old Reddit link
      chrome.contextMenus.create(
        {
          id: "copy-old-reddit-link",
          title: "Copy as Old Reddit Link",
          contexts: ["link"],
          targetUrlPatterns: [
            "*://www.reddit.com/*",
            "*://reddit.com/*",
            "*://np.reddit.com/*",
          ],
        },
        () => {
          handleLastError();
        }
      );

      // Keep subreddit on new Reddit
      chrome.contextMenus.create(
        {
          id: "whitelist-subreddit",
          title: "Keep on New Reddit",
          contexts: ["link"],
          targetUrlPatterns: ["*://www.reddit.com/r/*", "*://reddit.com/r/*"],
        },
        () => {
          handleLastError();
        }
      );
    });
  }

  /**
   * Handle context menu clicks
   */
  chrome.contextMenus.onClicked.addListener(async (info) => {
    if (!info.linkUrl) return;

    let url;
    try {
      url = new URL(info.linkUrl);
    } catch {
      return;
    }

    if (info.menuItemId === "open-old-reddit") {
      url.hostname = "old.reddit.com";
      chrome.tabs.create({ url: url.toString() }, () => {
        handleLastError();
      });
    } else if (info.menuItemId === "open-new-reddit") {
      url.hostname = "www.reddit.com";
      chrome.tabs.create({ url: url.toString() }, () => {
        handleLastError();
      });
    } else if (info.menuItemId === "copy-old-reddit-link") {
      url.hostname = "old.reddit.com";
      // Copy to clipboard using offscreen document or background script
      await copyToClipboard(url.toString());
    } else if (info.menuItemId === "whitelist-subreddit") {
      const match = url.pathname.match(/\/r\/([^/?#]+)/);
      if (match) {
        const subreddit = match[1].toLowerCase();
        const overrides = await Storage.getSubredditOverrides();
        if (!overrides.whitelist.includes(subreddit)) {
          overrides.whitelist.push(subreddit);
          await Storage.setSubredditOverrides(overrides);
          await updateSubredditRules();

          // Show notification
          const prefs = await Storage.getUIPreferences();
          if (prefs.showNotifications) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "img/icon128.png",
              title: "Old Reddit Redirect",
              message: `r/${subreddit} will stay on new Reddit`,
              silent: true,
            });
          }
        }
      }
    }
  });

  // Track if offscreen document has been created
  let offscreenDocumentCreated = false;

  /**
   * Ensure offscreen document exists for clipboard operations
   */
  async function ensureOffscreenDocument() {
    if (offscreenDocumentCreated) return;

    try {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["CLIPBOARD"],
        justification: "Copy Reddit link to clipboard",
      });
      offscreenDocumentCreated = true;
      Logger.debug("Offscreen document created");
    } catch (error) {
      // Document may already exist
      if (error.message && error.message.includes("already exists")) {
        offscreenDocumentCreated = true;
      } else {
        Logger.error("Failed to create offscreen document:", error);
        throw error;
      }
    }
  }

  /**
   * Copy text to clipboard using offscreen document (Chrome) or navigator.clipboard (Firefox)
   */
  async function copyToClipboard(text) {
    const isFirefox = typeof browser !== "undefined";

    if (isFirefox) {
      // Firefox: Use navigator.clipboard directly (works in background)
      try {
        await navigator.clipboard.writeText(text);
        await showCopySuccessNotification();
        Logger.debug("Clipboard copy successful (Firefox)");
      } catch (error) {
        Logger.error("Clipboard copy failed (Firefox):", error);
        await showCopyFallbackNotification(text);
      }
    } else {
      // Chrome: Use offscreen document
      try {
        await ensureOffscreenDocument();

        const response = await chrome.runtime.sendMessage({
          type: "COPY_TO_CLIPBOARD",
          text,
        });

        if (response && response.success) {
          await showCopySuccessNotification();
          Logger.debug("Clipboard copy successful (Chrome)");
        } else {
          throw new Error(response?.error || "Unknown error");
        }
      } catch (error) {
        Logger.error("Clipboard copy failed (Chrome):", error);
        await showCopyFallbackNotification(text);
      }
    }
  }

  /**
   * Show success notification for clipboard copy
   */
  async function showCopySuccessNotification() {
    const prefs = await Storage.getUIPreferences();
    if (prefs.showNotifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "img/icon128.png",
        title: "Link Copied",
        message: "Old Reddit link copied to clipboard",
        silent: true,
      });
    }
  }

  /**
   * Show fallback notification with URL when clipboard copy fails
   */
  async function showCopyFallbackNotification(text) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "img/icon128.png",
      title: "Copy this link",
      message: text,
      silent: true,
    });
  }

  /**
   * Handle messages from popup and content scripts
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
      try {
        switch (message.type) {
          case "UPDATE_BADGE":
            await updateActionUi();
            sendResponse({ success: true });
            break;

          case "SET_TEMP_DISABLE":
            await setTemporaryDisable(message.duration, message.expiresAt);
            sendResponse({ success: true });
            break;

          case "CANCEL_TEMP_DISABLE":
            await cancelTemporaryDisable();
            sendResponse({ success: true });
            break;

          case "UPDATE_SUBREDDIT_RULES":
            await updateSubredditRules();
            sendResponse({ success: true });
            break;

          case "DISABLE_FOR_TAB":
            await disableForTab(message.tabId);
            sendResponse({ success: true });
            break;

          case "ENABLE_FOR_TAB":
            await enableForTab(message.tabId);
            sendResponse({ success: true });
            break;

          case "CHECK_TAB_STATE":
            sendResponse({ disabled: disabledTabs.has(message.tabId) });
            break;

          case "UPDATE_ICON_BEHAVIOR":
            await configureIconBehavior(message.behavior);
            sendResponse({ success: true });
            break;

          default:
            sendResponse({ error: "Unknown message type" });
        }
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();

    return true; // Keep channel open for async response
  });

  /**
   * Handle keyboard shortcuts
   */
  chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-redirect") {
      toggleRedirect();
    }
  });

  /**
   * Handle icon clicks (only fires when popup is disabled)
   */
  chrome.action.onClicked.addListener(() => {
    toggleRedirect();
  });

  /**
   * Handle alarms
   */
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === TEMP_DISABLE_ALARM) {
      await cancelTemporaryDisable();

      // Show notification
      const prefs = await Storage.getUIPreferences();
      if (prefs.showNotifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "img/icon128.png",
          title: "Old Reddit Redirect",
          message: "Redirect has been re-enabled",
          silent: true,
        });
      }
    }
  });

  /**
   * Track navigations for statistics
   */
  chrome.webNavigation.onCompleted.addListener(
    async (details) => {
      if (details.frameId === 0) {
        await trackRedirect(details.url);
      }
    },
    { url: [{ hostEquals: "old.reddit.com" }] }
  );

  /**
   * Clean up disabled tabs when they close
   */
  chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (disabledTabs.has(tabId)) {
      await enableForTab(tabId);
    }
  });

  /**
   * Initialize on install
   */
  chrome.runtime.onInstalled.addListener(async (details) => {
    // Migrate from legacy storage if needed
    await Storage.migrateFromLegacy();

    // Initialize storage with defaults
    await Storage.initialize();

    // Update subreddit rules
    await updateSubredditRules();

    // Initialize UI
    await initializeActionUi();

    // Configure icon behavior
    const prefs = await Storage.getUIPreferences();
    await configureIconBehavior(prefs.iconClickBehavior || "popup");

    // Create context menus
    createContextMenus();

    // Show onboarding on fresh install
    if (details.reason === "install") {
      const complete = await Storage.get("onboardingComplete", false);
      if (!complete) {
        chrome.tabs.create({ url: "onboarding.html" });
      }
    }

    // Check for temp disable on restart
    const tempDisable = await Storage.getTemporaryDisable();
    if (tempDisable.active && tempDisable.expiresAt) {
      const remaining = new Date(tempDisable.expiresAt) - Date.now();
      if (remaining > 0) {
        // Re-create alarm
        chrome.alarms.create(TEMP_DISABLE_ALARM, {
          when: Date.now() + remaining,
        });
      } else {
        // Expired, clear it
        await cancelTemporaryDisable();
      }
    }
  });

  /**
   * Initialize on startup
   */
  chrome.runtime.onStartup.addListener(async () => {
    await initializeActionUi();
    await updateSubredditRules();

    // Configure icon behavior
    const prefs = await Storage.getUIPreferences();
    await configureIconBehavior(prefs.iconClickBehavior || "popup");

    // Check for temp disable on restart
    const tempDisable = await Storage.getTemporaryDisable();
    if (tempDisable.active && tempDisable.expiresAt) {
      const remaining = new Date(tempDisable.expiresAt) - Date.now();
      if (remaining > 0) {
        // Re-create alarm
        chrome.alarms.create(TEMP_DISABLE_ALARM, {
          when: Date.now() + remaining,
        });
      } else {
        // Expired, clear it
        await cancelTemporaryDisable();
      }
    }
  });

  /**
   * Listen for storage changes to update badge
   */
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "local") {
      if (changes.stats || changes.enabled || changes.ui) {
        await updateActionUi();
      }
    }
  });
})();

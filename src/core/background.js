"use strict";

// Import storage and logger (for service worker, use importScripts)
if (typeof importScripts === "function") {
  importScripts(
    "logger.js",
    "storage-schema.js",
    "storage-operations.js",
    "storage-migration.js",
    "storage.js"
  );
}

(function () {
  const RULESET_ID = "ruleset_1";
  const TEMP_DISABLE_ALARM = "tempDisableExpiry";
  const DYNAMIC_RULE_ID_BASE = 1000;
  const FRONTEND_RULE_ID_BASE = 2000;
  const TAB_RULE_ID_BASE = 10000;

  // In-memory set for tracking disabled tabs (session-based)
  const disabledTabs = new Set();

  /**
   * Rebuild disabledTabs set from session rules after service worker restart
   * Session rules persist across SW termination but the in-memory Set doesn't
   */
  async function rebuildDisabledTabs() {
    try {
      const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
      disabledTabs.clear();
      for (const rule of sessionRules) {
        if (rule.id >= TAB_RULE_ID_BASE) {
          disabledTabs.add(rule.id - TAB_RULE_ID_BASE);
        }
      }
      if (disabledTabs.size > 0) {
        Logger.debug(
          `Rebuilt disabledTabs from session rules: ${disabledTabs.size} tabs`
        );
      }
    } catch (error) {
      Logger.error("Failed to rebuild disabled tabs:", error);
    }
  }

  // Rebuild on SW wake (top-level execution)
  rebuildDisabledTabs();

  // Badge timeout for tracking protection indicator
  const TRACKING_BADGE_TIMEOUT = 3000; // 3 seconds
  let trackingBadgeTimeout = null;

  /**
   * Handle Chrome API errors gracefully using Logger
   * @param {string} [context] - Optional context string for error logging
   * @returns {void}
   */
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
      ? `Old Reddit Enhanced is ON\n${stats.todayRedirects} redirects today`
      : "Old Reddit Enhanced is OFF (click to enable)";

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
   * Show tracking protection badge temporarily
   * @param {number} tabId - Tab ID where tracking was cleaned
   */
  async function showTrackingBadge(tabId) {
    try {
      const privacy = await Storage.getPrivacy();
      if (!privacy.showTrackingBadge) return;

      // Clear any existing timeout
      if (trackingBadgeTimeout) {
        clearTimeout(trackingBadgeTimeout);
      }

      // Show shield badge
      chrome.action.setBadgeText({ text: "🛡️", tabId }, () => {
        handleLastError();
      });

      chrome.action.setBadgeBackgroundColor({ color: "#2196F3", tabId }, () => {
        handleLastError();
      });

      // Reset badge after timeout
      trackingBadgeTimeout = setTimeout(async () => {
        await updateActionUi(tabId);
        trackingBadgeTimeout = null;
      }, TRACKING_BADGE_TIMEOUT);
    } catch (error) {
      Logger.error("Failed to show tracking badge:", error);
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
   * Update redirect rules based on frontend selection
   */
  async function updateFrontendRules() {
    const frontendConfig = await Storage.getFrontend();
    let targetDomain = frontendConfig.target;

    // Handle custom domain
    if (targetDomain === "custom") {
      targetDomain = frontendConfig.customDomain;
      if (!targetDomain) {
        Logger.warn("Custom frontend selected but no domain configured");
        return;
      }
    }

    // If using old.reddit.com, use static ruleset
    if (targetDomain === "old.reddit.com") {
      await enableStaticRuleset();
      await clearDynamicFrontendRules();
      Logger.info("Using static ruleset for old.reddit.com");
      return;
    }

    // For alternative frontends, use dynamic rules
    Logger.info("Switching to alternative frontend:", targetDomain);
    await disableStaticRuleset();
    await createDynamicFrontendRules(targetDomain);
  }

  /**
   * Create dynamic rules for alternative frontends
   */
  async function createDynamicFrontendRules(targetDomain) {
    await clearDynamicFrontendRules();

    const rules = [
      // Main redirect rule for subdomains
      {
        id: FRONTEND_RULE_ID_BASE,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { transform: { host: targetDomain } },
        },
        condition: {
          regexFilter: "^https?://(www|np|nr|ns|amp|i|m)\\.reddit\\.com/.*",
          resourceTypes: ["main_frame"],
        },
      },
      // Bare domain redirect
      {
        id: FRONTEND_RULE_ID_BASE + 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { transform: { host: targetDomain } },
        },
        condition: {
          urlFilter: "||reddit.com/*",
          excludedInitiatorDomains: ["reddit.com", "old.reddit.com"],
          resourceTypes: ["main_frame"],
        },
      },
    ];

    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateDynamicRules(
        { addRules: rules },
        () => {
          handleLastError();
          resolve();
        }
      );
    });

    Logger.info("Frontend rules updated for:", targetDomain);
  }

  /**
   * Clear dynamic frontend rules
   */
  async function clearDynamicFrontendRules() {
    const existingRules = await new Promise((resolve) => {
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        handleLastError();
        resolve(rules || []);
      });
    });

    const frontendRuleIds = existingRules
      .filter(
        (r) =>
          r.id >= FRONTEND_RULE_ID_BASE && r.id < FRONTEND_RULE_ID_BASE + 100
      )
      .map((r) => r.id);

    if (frontendRuleIds.length > 0) {
      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateDynamicRules(
          { removeRuleIds: frontendRuleIds },
          () => {
            handleLastError();
            resolve();
          }
        );
      });
    }
  }

  /**
   * Enable static ruleset
   */
  async function enableStaticRuleset() {
    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateEnabledRulesets(
        { enableRulesetIds: [RULESET_ID] },
        () => {
          handleLastError();
          resolve();
        }
      );
    });
  }

  /**
   * Disable static ruleset
   */
  async function disableStaticRuleset() {
    await new Promise((resolve) => {
      chrome.declarativeNetRequest.updateEnabledRulesets(
        { disableRulesetIds: [RULESET_ID] },
        () => {
          handleLastError();
          resolve();
        }
      );
    });
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

      // Mute subreddit from /r/all and /r/popular
      chrome.contextMenus.create(
        {
          id: "mute-subreddit",
          title: "Mute this Subreddit",
          contexts: ["link"],
          targetUrlPatterns: [
            "*://old.reddit.com/r/*",
            "*://www.reddit.com/r/*",
            "*://reddit.com/r/*",
          ],
        },
        () => {
          handleLastError();
        }
      );

      // Mute user
      chrome.contextMenus.create(
        {
          id: "mute-user",
          title: "Mute this User",
          contexts: ["link"],
          targetUrlPatterns: [
            "*://old.reddit.com/user/*",
            "*://www.reddit.com/user/*",
            "*://reddit.com/user/*",
            "*://old.reddit.com/u/*",
            "*://www.reddit.com/u/*",
            "*://reddit.com/u/*",
          ],
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
              title: "Old Reddit Enhanced",
              message: `r/${subreddit} will stay on new Reddit`,
              silent: true,
            });
          }
        }
      }
    } else if (info.menuItemId === "mute-subreddit") {
      const match = url.pathname.match(/\/r\/([^/?#]+)/);
      if (match) {
        const subreddit = match[1].toLowerCase();
        await Storage.addMutedSubreddit(subreddit);

        // Notify all old.reddit.com tabs to refresh muting
        chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(
              tab.id,
              { type: "REFRESH_SUBREDDIT_MUTING" },
              () => {
                void chrome.runtime.lastError;
              }
            );
          });
        });

        // Show notification
        const prefs = await Storage.getUIPreferences();
        if (prefs.showNotifications) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "img/icon128.png",
            title: "Old Reddit Enhanced",
            message: `r/${subreddit} muted from /r/all and /r/popular`,
            silent: true,
          });
        }
      }
    } else if (info.menuItemId === "mute-user") {
      const match = url.pathname.match(/\/u(?:ser)?\/([^/?#]+)/);
      if (match) {
        const username = match[1];
        await Storage.setMutedUser(username, {
          reason: "Muted via context menu",
        });

        // Notify all old.reddit.com tabs to refresh muting
        chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(
              tab.id,
              { type: "REFRESH_USER_MUTING" },
              () => {
                void chrome.runtime.lastError;
              }
            );
          });
        });

        // Show notification
        const prefs = await Storage.getUIPreferences();
        if (prefs.showNotifications) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "img/icon128.png",
            title: "Old Reddit Enhanced",
            message: `u/${username} has been muted`,
            silent: true,
          });
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
        url: "src/content/offscreen.html",
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

  // Paths that only exist on new Reddit and should not be redirected
  const ALLOWLISTED_PREFIXES = [
    "/media",
    "/mod",
    "/poll",
    "/settings",
    "/topics",
    "/vault",
    "/avatar",
    "/talk",
    "/coins",
    "/premium",
    "/predictions",
    "/rpan",
  ];

  /**
   * Switch all Reddit tabs to old.reddit.com
   * @returns {Promise<number>} Number of tabs switched
   */
  async function switchAllTabsToOld() {
    const tabs = await chrome.tabs.query({
      url: [
        "*://www.reddit.com/*",
        "*://reddit.com/*",
        "*://new.reddit.com/*",
        "*://np.reddit.com/*",
      ],
    });

    let count = 0;
    for (const tab of tabs) {
      try {
        const url = new URL(tab.url);

        // Skip allowlisted paths
        if (ALLOWLISTED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
          continue;
        }

        // Transform gallery URLs: /gallery/ID → /comments/ID
        if (url.pathname.startsWith("/gallery/")) {
          url.pathname = url.pathname.replace(/^\/gallery\//, "/comments/");
        }

        url.hostname = "old.reddit.com";
        await chrome.tabs.update(tab.id, { url: url.toString() });
        count++;
      } catch {
        // Skip tabs with invalid URLs
      }
    }
    return count;
  }

  /**
   * Switch all old.reddit.com tabs to www.reddit.com
   * @returns {Promise<number>} Number of tabs switched
   */
  async function switchAllTabsToNew() {
    const tabs = await chrome.tabs.query({
      url: ["*://old.reddit.com/*"],
    });

    let count = 0;
    for (const tab of tabs) {
      try {
        const url = new URL(tab.url);
        url.hostname = "www.reddit.com";
        await chrome.tabs.update(tab.id, { url: url.toString() });
        count++;
      } catch {
        // Skip tabs with invalid URLs
      }
    }
    return count;
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

          case "UPDATE_FRONTEND_RULES":
            await updateFrontendRules();
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

          case "TRACKING_CLEANED":
            // Update tracking stats and show badge
            await Storage.updateTrackingStats(message.data);
            if (sender.tab && sender.tab.id) {
              await showTrackingBadge(sender.tab.id);
            }
            sendResponse({ success: true });
            break;

          case "SWITCH_ALL_TABS_OLD": {
            const count = await switchAllTabsToOld();
            sendResponse({ count });
            break;
          }

          case "SWITCH_ALL_TABS_NEW": {
            const count = await switchAllTabsToNew();
            sendResponse({ count });
            break;
          }

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
          title: "Old Reddit Enhanced",
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
    // Rebuild disabled tabs from persisted session rules
    await rebuildDisabledTabs();

    // Migrate from legacy storage if needed
    await Storage.migrateFromLegacy();

    // Initialize storage with defaults
    await Storage.initialize();

    // Update subreddit rules
    await updateSubredditRules();

    // Update frontend rules
    await updateFrontendRules();

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
        chrome.tabs.create({ url: "src/pages/onboarding/onboarding.html" });
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
    await rebuildDisabledTabs();
    await initializeActionUi();
    await updateSubredditRules();
    await updateFrontendRules();

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

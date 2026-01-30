"use strict";

(function () {
  const RULESET_ID = "ruleset_1";

  // DOM elements
  const elements = {
    toggleRedirect: document.getElementById("toggle-redirect"),
    totalRedirects: document.getElementById("total-redirects"),
    todayRedirects: document.getElementById("today-redirects"),
    topSubreddits: document.getElementById("top-subreddits"),
    subredditEmpty: document.getElementById("subreddit-empty"),
    clearStats: document.getElementById("clear-stats"),
    iconClickBehavior: document.getElementById("icon-click-behavior"),
    badgeStyle: document.getElementById("badge-style"),
    animateToggle: document.getElementById("animate-toggle"),
    showNotifications: document.getElementById("show-notifications"),
    showRedirectNotice: document.getElementById("show-redirect-notice"),
    subredditInput: document.getElementById("subreddit-input"),
    addSubreddit: document.getElementById("add-subreddit"),
    whitelist: document.getElementById("whitelist"),
    whitelistEmpty: document.getElementById("whitelist-empty"),
    suggestionsList: document.getElementById("suggestions-list"),
    suggestionsEmpty: document.getElementById("suggestions-empty"),
    shortcutDisplay: document.getElementById("shortcut-display"),
    customizeShortcut: document.getElementById("customize-shortcut"),
    exportSettings: document.getElementById("export-settings"),
    importSettings: document.getElementById("import-settings"),
    importFile: document.getElementById("import-file"),
    syncToggle: document.getElementById("sync-toggle"),
    syncStatus: document.getElementById("sync-status"),
    testUrlInput: document.getElementById("test-url-input"),
    testUrlBtn: document.getElementById("test-url-btn"),
    testResult: document.getElementById("test-result"),
    resultIcon: document.getElementById("result-icon"),
    resultMessage: document.getElementById("result-message"),
    resultDetail: document.getElementById("result-detail"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toast-message"),
  };

  function handleLastError() {
    void chrome.runtime.lastError;
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = "success") {
    elements.toast.className = `toast ${type}`;
    elements.toastMessage.textContent = message;
    elements.toast.hidden = false;

    setTimeout(() => {
      elements.toast.hidden = true;
    }, 3000);
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Initialize options page
   */
  async function init() {
    await loadAllSettings();
    attachListeners();
  }

  /**
   * Load all settings
   */
  async function loadAllSettings() {
    await loadMainToggle();
    await loadStats();
    await loadUIPreferences();
    await loadWhitelist();
    await loadSuggestions();
    await loadShortcut();
    await loadSyncStatus();
  }

  /**
   * Load main toggle state
   */
  async function loadMainToggle() {
    const enabled = await window.Storage.getEnabled();
    elements.toggleRedirect.checked = enabled;
  }

  /**
   * Load statistics
   */
  async function loadStats() {
    const stats = await window.Storage.getStats();

    elements.totalRedirects.textContent = formatNumber(
      stats.totalRedirects || 0
    );
    elements.todayRedirects.textContent = formatNumber(
      stats.todayRedirects || 0
    );

    // Load top subreddits
    const entries = Object.entries(stats.perSubreddit || {});
    entries.sort((a, b) => b[1] - a[1]);

    if (entries.length > 0) {
      elements.topSubreddits.innerHTML = "";
      elements.subredditEmpty.hidden = true;

      entries.slice(0, 10).forEach(([subreddit, count]) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="subreddit-name">r/${escapeHtml(subreddit)}</span>
          <span class="subreddit-count">${formatNumber(count)} redirects</span>
        `;
        elements.topSubreddits.appendChild(li);
      });
    } else {
      elements.subredditEmpty.hidden = false;
    }
  }

  /**
   * Load UI preferences
   */
  async function loadUIPreferences() {
    const prefs = await window.Storage.getUIPreferences();

    elements.iconClickBehavior.value = prefs.iconClickBehavior || "popup";
    elements.badgeStyle.value = prefs.badgeStyle || "text";
    elements.animateToggle.checked = prefs.animateToggle !== false;
    elements.showNotifications.checked = prefs.showNotifications || false;
    elements.showRedirectNotice.checked = prefs.showRedirectNotice || false;
  }

  /**
   * Load subreddit whitelist
   */
  async function loadWhitelist() {
    const { whitelist } = await window.Storage.getSubredditOverrides();

    elements.whitelist.innerHTML = "";
    elements.whitelistEmpty.hidden = whitelist.length > 0;

    for (const subreddit of whitelist) {
      const li = document.createElement("li");
      li.className = "tag";
      li.innerHTML = `
        r/${escapeHtml(subreddit)}
        <button class="remove" data-subreddit="${escapeHtml(subreddit)}">×</button>
      `;
      elements.whitelist.appendChild(li);
    }

    // Attach remove handlers
    elements.whitelist.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const subreddit = btn.dataset.subreddit;
        removeSubreddit(subreddit);
      });
    });
  }

  /**
   * Load subreddit suggestions
   */
  async function loadSuggestions() {
    const available = await window.Suggestions.getAvailableSuggestions();

    elements.suggestionsList.innerHTML = "";

    if (available.length === 0) {
      elements.suggestionsList.hidden = true;
      elements.suggestionsEmpty.hidden = false;
      return;
    }

    elements.suggestionsList.hidden = false;
    elements.suggestionsEmpty.hidden = true;

    for (const suggestion of available) {
      const card = document.createElement("div");
      card.className = "suggestion-card";
      card.innerHTML = `
        <div class="suggestion-info">
          <div class="suggestion-name">r/${escapeHtml(suggestion.name)}</div>
          <div class="suggestion-reason">${escapeHtml(suggestion.reason)}</div>
        </div>
        <button class="suggestion-add" data-subreddit="${escapeHtml(suggestion.name)}">Add</button>
      `;
      elements.suggestionsList.appendChild(card);
    }

    // Attach handlers
    elements.suggestionsList
      .querySelectorAll(".suggestion-add")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          const subreddit = btn.dataset.subreddit;
          await addSuggestionToWhitelist(subreddit);
        });
      });
  }

  /**
   * Add a suggested subreddit to whitelist
   */
  async function addSuggestionToWhitelist(subreddit) {
    const overrides = await window.Storage.getSubredditOverrides();

    if (overrides.whitelist.includes(subreddit.toLowerCase())) {
      showToast("Already in list", "error");
      return;
    }

    overrides.whitelist.push(subreddit.toLowerCase());
    await window.Storage.setSubredditOverrides(overrides);

    // Update dynamic rules
    await chrome.runtime.sendMessage({ type: "UPDATE_SUBREDDIT_RULES" });

    await loadWhitelist();
    await loadSuggestions();

    showToast(`r/${subreddit} added to exceptions`);
  }

  /**
   * Load keyboard shortcut
   */
  async function loadShortcut() {
    chrome.commands.getAll((commands) => {
      handleLastError();
      const toggleCommand = commands.find(
        (cmd) => cmd.name === "toggle-redirect"
      );
      if (toggleCommand && toggleCommand.shortcut) {
        elements.shortcutDisplay.textContent = toggleCommand.shortcut;
      } else {
        elements.shortcutDisplay.textContent = "Not set";
      }
    });
  }

  /**
   * Load sync status
   */
  async function loadSyncStatus() {
    const syncConfig = await window.Storage.getSyncConfig();

    elements.syncToggle.checked = syncConfig.enabled || false;

    if (syncConfig.enabled && syncConfig.lastSync) {
      const lastSync = new Date(syncConfig.lastSync);
      const now = new Date();
      const diffMs = now - lastSync;
      const diffMins = Math.floor(diffMs / 60000);

      let timeAgo;
      if (diffMins < 1) {
        timeAgo = "just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      }

      elements.syncStatus.textContent = `Last synced: ${timeAgo}`;
    } else {
      elements.syncStatus.textContent = "Not synced";
    }
  }

  /**
   * Handle main toggle change
   */
  async function handleToggleRedirect() {
    const enabled = elements.toggleRedirect.checked;

    await window.Storage.setEnabled(enabled);

    // Update DNR ruleset
    chrome.declarativeNetRequest.updateEnabledRulesets(
      enabled
        ? { enableRulesetIds: [RULESET_ID], disableRulesetIds: [] }
        : { enableRulesetIds: [], disableRulesetIds: [RULESET_ID] },
      () => {
        handleLastError();
      }
    );

    // Notify background to update badge
    chrome.runtime.sendMessage({ type: "UPDATE_BADGE" });

    showToast(`Redirect ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Clear statistics
   */
  async function handleClearStats() {
    if (!confirm("Clear all statistics? This cannot be undone.")) {
      return;
    }

    await window.Storage.clearStats();
    await loadStats();
    showToast("Statistics cleared");
  }

  /**
   * Handle icon click behavior change
   */
  async function handleIconClickBehaviorChange() {
    const behavior = elements.iconClickBehavior.value;

    // Show warning when switching to toggle mode
    if (behavior === "toggle") {
      const confirmed = confirm(
        "Switching to toggle mode will disable the popup.\n\n" +
          "You can still access all features from this Options page.\n" +
          "Keyboard shortcut (Alt+Shift+R) will continue to work.\n\n" +
          "Continue?"
      );
      if (!confirmed) {
        elements.iconClickBehavior.value = "popup";
        return;
      }
    }

    const prefs = await window.Storage.getUIPreferences();
    prefs.iconClickBehavior = behavior;
    await window.Storage.setUIPreferences(prefs);

    // Notify background to update popup behavior
    chrome.runtime.sendMessage({
      type: "UPDATE_ICON_BEHAVIOR",
      behavior,
    });

    showToast(
      `Icon click will now ${behavior === "popup" ? "open popup" : "toggle redirect"}`
    );
  }

  /**
   * Handle UI preference changes
   */
  async function handleUIPreferenceChange() {
    const prefs = {
      iconClickBehavior: elements.iconClickBehavior.value,
      badgeStyle: elements.badgeStyle.value,
      animateToggle: elements.animateToggle.checked,
      showNotifications: elements.showNotifications.checked,
      showRedirectNotice: elements.showRedirectNotice.checked,
    };

    await window.Storage.setUIPreferences(prefs);

    // Notify background to update badge
    chrome.runtime.sendMessage({ type: "UPDATE_BADGE" });

    showToast("Preferences saved");
  }

  /**
   * Add subreddit to whitelist
   */
  async function handleAddSubreddit() {
    const subreddit = elements.subredditInput.value.trim().toLowerCase();

    if (!subreddit) {
      showToast("Please enter a subreddit name", "error");
      return;
    }

    if (!/^[a-z0-9_]+$/i.test(subreddit)) {
      showToast("Invalid subreddit name", "error");
      return;
    }

    const overrides = await window.Storage.getSubredditOverrides();

    if (overrides.whitelist.includes(subreddit)) {
      showToast("Subreddit already in list", "error");
      return;
    }

    if (overrides.whitelist.length >= 100) {
      showToast("Maximum 100 subreddits allowed", "error");
      return;
    }

    overrides.whitelist.push(subreddit);
    await window.Storage.setSubredditOverrides(overrides);

    // Update dynamic rules
    await chrome.runtime.sendMessage({ type: "UPDATE_SUBREDDIT_RULES" });

    elements.subredditInput.value = "";
    await loadWhitelist();

    showToast(`r/${subreddit} added to exceptions`);
  }

  /**
   * Remove subreddit from whitelist
   */
  async function removeSubreddit(subreddit) {
    const overrides = await window.Storage.getSubredditOverrides();
    const index = overrides.whitelist.indexOf(subreddit);

    if (index > -1) {
      overrides.whitelist.splice(index, 1);
      await window.Storage.setSubredditOverrides(overrides);

      // Update dynamic rules
      await chrome.runtime.sendMessage({ type: "UPDATE_SUBREDDIT_RULES" });

      await loadWhitelist();
      showToast(`r/${subreddit} removed from exceptions`);
    }
  }

  /**
   * Open shortcut settings
   */
  function handleCustomizeShortcut(e) {
    e.preventDefault();

    const isFirefox = typeof browser !== "undefined";
    if (isFirefox) {
      chrome.tabs.create({ url: "about:addons" }, () => {
        handleLastError();
      });
    } else {
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" }, () => {
        handleLastError();
      });
    }
  }

  /**
   * Export settings
   */
  async function handleExportSettings() {
    const settings = await window.Storage.exportSettings();

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `old-reddit-redirect-settings-${formatDate(new Date())}.json`;
    a.click();

    URL.revokeObjectURL(url);

    showToast("Settings exported");
  }

  /**
   * Format date for filename
   */
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  /**
   * Import settings
   */
  function handleImportSettings() {
    elements.importFile.click();
  }

  /**
   * Handle file import
   */
  async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate
      const validation = window.Storage.validateImport(data);
      if (!validation.valid) {
        showToast(`Invalid settings file: ${validation.errors[0]}`, "error");
        return;
      }

      // Confirm overwrite
      if (!confirm("This will replace your current settings. Continue?")) {
        return;
      }

      // Import
      await window.Storage.importSettings(data);

      // Refresh rules
      await chrome.runtime.sendMessage({ type: "UPDATE_SUBREDDIT_RULES" });

      showToast("Settings imported successfully");

      // Reload page to refresh UI
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      showToast(`Failed to import: ${error.message}`, "error");
    }

    // Reset input
    elements.importFile.value = "";
  }

  /**
   * Handle sync toggle
   */
  async function handleSyncToggle() {
    const enabled = elements.syncToggle.checked;

    try {
      if (enabled) {
        await window.Storage.enableSync();
        showToast("Sync enabled");
      } else {
        await window.Storage.disableSync();
        showToast("Sync disabled");
      }

      await loadSyncStatus();
    } catch (error) {
      showToast(`Sync error: ${error.message}`, "error");
      elements.syncToggle.checked = !enabled; // Revert
    }
  }

  /**
   * Test if a URL would be redirected
   */
  async function handleTestUrl() {
    const url = elements.testUrlInput.value.trim();

    if (!url) {
      showToast("Please enter a URL", "error");
      return;
    }

    // Validate URL
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon error";
      elements.resultMessage.textContent = "Invalid URL";
      elements.resultDetail.textContent =
        "Please enter a valid URL starting with https://";
      return;
    }

    // Check if URL is Reddit-related
    if (!urlObj.hostname.includes("reddit")) {
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon error";
      elements.resultMessage.textContent = "Not a Reddit URL";
      elements.resultDetail.textContent = "This tool only tests Reddit URLs";
      return;
    }

    // Test against allowlist rules (priority 3)
    const allowlistPatterns = [
      /^https:\/\/(www|np|nr|ns|amp|i|m)?\.?reddit\.com\/(media|mod|poll|settings|topics|community-points|appeals?|answers|vault|avatar|talk|coins|premium|predictions|rpan)(\/$|\?|$)/,
      /^https:\/\/(www|np|nr|ns|amp|i|m)?\.?reddit\.com\/(notifications|message\/compose)(\/$|\?|$)/,
    ];

    const allowlistDomains = [
      "chat.reddit.com",
      "mod.reddit.com",
      "sh.reddit.com",
    ];

    // Check allowlist domains
    if (allowlistDomains.includes(urlObj.hostname)) {
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon allow";
      elements.resultMessage.textContent = "Not redirected (allowlisted)";
      elements.resultDetail.textContent = `${urlObj.hostname} stays on new Reddit by design`;
      return;
    }

    // Check allowlist patterns
    for (const pattern of allowlistPatterns) {
      if (pattern.test(url)) {
        elements.testResult.hidden = false;
        elements.resultIcon.className = "result-icon allow";
        elements.resultMessage.textContent = "Not redirected (allowlisted)";
        elements.resultDetail.textContent =
          "This path stays on new Reddit by design";
        return;
      }
    }

    // Check if already on old.reddit.com
    if (urlObj.hostname === "old.reddit.com") {
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon allow";
      elements.resultMessage.textContent = "Already on Old Reddit";
      elements.resultDetail.textContent = "No redirect needed";
      return;
    }

    // Check gallery redirect (priority 2)
    const galleryMatch = url.match(
      /^https:\/\/(www|np|nr|ns|amp|i|m)?\.?reddit\.com\/gallery\/([a-zA-Z0-9_-]+)\/?$/
    );
    if (galleryMatch) {
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon redirect";
      elements.resultMessage.textContent = "Would redirect to Old Reddit";
      elements.resultDetail.textContent = `old.reddit.com/comments/${galleryMatch[2]}`;
      return;
    }

    // Check video redirect (priority 2)
    const videoMatch = url.match(
      /^https:\/\/(www|np|nr|ns|amp|i|m)?\.?reddit\.com\/videos?\/([a-zA-Z0-9_-]+)\/?$/
    );
    if (videoMatch) {
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon redirect";
      elements.resultMessage.textContent = "Would redirect to Old Reddit";
      elements.resultDetail.textContent = `old.reddit.com/comments/${videoMatch[2]}`;
      return;
    }

    // Check domain redirects (priority 1)
    const redirectDomains = [
      "www.reddit.com",
      "np.reddit.com",
      "nr.reddit.com",
      "ns.reddit.com",
      "amp.reddit.com",
      "i.reddit.com",
      "m.reddit.com",
      "reddit.com",
    ];

    if (
      redirectDomains.includes(urlObj.hostname) ||
      urlObj.hostname.endsWith("reddit.com.onion")
    ) {
      // Check subreddit overrides
      const subredditMatch = urlObj.pathname.match(/^\/r\/([a-zA-Z0-9_]+)/);
      if (subredditMatch) {
        const subreddit = subredditMatch[1].toLowerCase();
        const overrides = await window.Storage.getSubredditOverrides();

        if (overrides.whitelist.includes(subreddit)) {
          elements.testResult.hidden = false;
          elements.resultIcon.className = "result-icon allow";
          elements.resultMessage.textContent = "Not redirected (whitelisted)";
          elements.resultDetail.textContent = `r/${subreddit} is in your exceptions list`;
          return;
        }
      }

      // Would redirect
      const newUrl = new URL(url);
      newUrl.hostname = "old.reddit.com";
      elements.testResult.hidden = false;
      elements.resultIcon.className = "result-icon redirect";
      elements.resultMessage.textContent = "Would redirect to Old Reddit";
      elements.resultDetail.textContent = newUrl.toString();
      return;
    }

    // Unknown/not handled
    elements.testResult.hidden = false;
    elements.resultIcon.className = "result-icon error";
    elements.resultMessage.textContent = "Not handled";
    elements.resultDetail.textContent =
      "This URL doesn't match any redirect rules";
  }

  /**
   * Attach event listeners
   */
  function attachListeners() {
    // Main toggle
    elements.toggleRedirect.addEventListener("change", handleToggleRedirect);

    // Statistics
    elements.clearStats.addEventListener("click", handleClearStats);

    // UI preferences
    elements.iconClickBehavior.addEventListener(
      "change",
      handleIconClickBehaviorChange
    );
    elements.badgeStyle.addEventListener("change", handleUIPreferenceChange);
    elements.animateToggle.addEventListener("change", handleUIPreferenceChange);
    elements.showNotifications.addEventListener(
      "change",
      handleUIPreferenceChange
    );
    elements.showRedirectNotice.addEventListener(
      "change",
      handleUIPreferenceChange
    );

    // Subreddit whitelist
    elements.addSubreddit.addEventListener("click", handleAddSubreddit);
    elements.subredditInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleAddSubreddit();
      }
    });

    // URL Testing Tool
    elements.testUrlBtn.addEventListener("click", handleTestUrl);
    elements.testUrlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleTestUrl();
      }
    });

    // Keyboard shortcut
    elements.customizeShortcut.addEventListener(
      "click",
      handleCustomizeShortcut
    );

    // Import/Export
    elements.exportSettings.addEventListener("click", handleExportSettings);
    elements.importSettings.addEventListener("click", handleImportSettings);
    elements.importFile.addEventListener("change", handleFileImport);

    // Sync
    elements.syncToggle.addEventListener("change", handleSyncToggle);

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        if (changes.stats) {
          loadStats();
        }
        if (changes.enabled) {
          loadMainToggle();
        }
      }
    });
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

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
    exportStats: document.getElementById("export-stats"),
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
    frontendOptions: document.getElementById("frontend-options"),
    customDomainSection: document.getElementById("custom-domain-section"),
    customDomain: document.getElementById("custom-domain"),
    saveCustomDomain: document.getElementById("save-custom-domain"),
    permissionNotice: document.getElementById("permission-notice"),
    requestPermission: document.getElementById("request-permission"),
    testUrlInput: document.getElementById("test-url-input"),
    testUrlBtn: document.getElementById("test-url-btn"),
    testResult: document.getElementById("test-result"),
    resultIcon: document.getElementById("result-icon"),
    resultMessage: document.getElementById("result-message"),
    resultDetail: document.getElementById("result-detail"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toast-message"),
    darkMode: document.getElementById("dark-mode"),
    autoCollapseAutomod: document.getElementById("auto-collapse-automod"),
    nagBlockingEnabled: document.getElementById("nag-blocking-enabled"),
    blockLoginPrompts: document.getElementById("block-login-prompts"),
    blockEmailVerification: document.getElementById("block-email-verification"),
    blockPremiumBanners: document.getElementById("block-premium-banners"),
    blockAppPrompts: document.getElementById("block-app-prompts"),
    mutedSubredditInput: document.getElementById("muted-subreddit-input"),
    addMutedSubreddit: document.getElementById("add-muted-subreddit"),
    mutedList: document.getElementById("muted-list"),
    mutedEmpty: document.getElementById("muted-empty"),
    exportMuted: document.getElementById("export-muted"),
    importMuted: document.getElementById("import-muted"),
    importMutedFile: document.getElementById("import-muted-file"),
    keywordInput: document.getElementById("keyword-input"),
    addKeyword: document.getElementById("add-keyword"),
    caseSensitive: document.getElementById("case-sensitive"),
    keywordList: document.getElementById("keyword-list"),
    keywordEmpty: document.getElementById("keyword-empty"),
    exportKeywords: document.getElementById("export-keywords"),
    importKeywords: document.getElementById("import-keywords"),
    importKeywordsFile: document.getElementById("import-keywords-file"),
    domainInput: document.getElementById("domain-input"),
    addDomain: document.getElementById("add-domain"),
    domainList: document.getElementById("domain-list"),
    domainEmpty: document.getElementById("domain-empty"),
    exportDomains: document.getElementById("export-domains"),
    importDomains: document.getElementById("import-domains"),
    importDomainsFile: document.getElementById("import-domains-file"),
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
    await loadDarkModeSettings();
    await loadNagBlockingSettings();
    await loadFrontendOptions();
    await loadWhitelist();
    await loadMutedSubreddits();
    await loadKeywordFiltering();
    await loadDomainFiltering();
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

    // Render weekly chart
    renderWeeklyChart(stats.weeklyHistory || []);

    // Render top subreddits with percentage bars
    renderTopSubreddits(stats.perSubreddit || {}, stats.totalRedirects || 0);
  }

  /**
   * Render weekly chart
   * @param {Array} history - Array of {date, count} objects
   */
  function renderWeeklyChart(history) {
    const container = document.getElementById("weekly-chart");
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Build data for last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const entry = history.find((h) => h.date === dateStr);
      days.push({
        date: dateStr,
        day: dayNames[date.getDay()],
        count: entry?.count || 0,
        isToday: i === 0,
      });
    }

    // Check for any data
    const hasData = days.some((d) => d.count > 0);
    if (!hasData) {
      container.innerHTML = `
        <div class="chart-empty">
          No redirect data yet. Browse some Reddit to see your stats!
        </div>
      `;
      return;
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1);

    container.innerHTML = days
      .map((d) => {
        const height = (d.count / maxCount) * 100; // Percentage height
        const formattedDate = new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return `
          <div class="bar-wrapper">
            <span class="bar-value">${d.count > 0 ? formatNumber(d.count) : ""}</span>
            <div class="bar${d.isToday ? " today" : ""}" style="height: ${Math.max(height, 4)}%">
              <span class="bar-tooltip">${formattedDate}: ${formatNumber(d.count)} redirects</span>
            </div>
            <span class="bar-label">${d.day}</span>
          </div>
        `;
      })
      .join("");
  }

  /**
   * Render top subreddits with percentage bars
   * @param {Object} perSubreddit - Object with subreddit names as keys and counts as values
   * @param {number} totalRedirects - Total redirect count
   */
  function renderTopSubreddits(perSubreddit, totalRedirects) {
    const entries = Object.entries(perSubreddit || {});
    entries.sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      elements.topSubreddits.innerHTML = "";
      elements.subredditEmpty.hidden = false;
      return;
    }

    elements.subredditEmpty.hidden = true;
    const maxCount = entries[0][1];

    elements.topSubreddits.innerHTML = entries
      .slice(0, 10)
      .map(([subreddit, count], index) => {
        const percentage = (count / maxCount) * 100;
        const totalPercent =
          totalRedirects > 0
            ? ((count / totalRedirects) * 100).toFixed(1)
            : "0.0";
        return `
          <li>
            <div class="subreddit-bar" style="width: ${percentage}%"></div>
            <span class="subreddit-rank">${index + 1}.</span>
            <span class="subreddit-name">r/${escapeHtml(subreddit)}</span>
            <span class="subreddit-count">${formatNumber(count)}</span>
            <span class="subreddit-percent">${totalPercent}%</span>
          </li>
        `;
      })
      .join("");
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
   * Load dark mode settings
   */
  async function loadDarkModeSettings() {
    const darkModePrefs = await window.Storage.getDarkMode();

    elements.darkMode.value = darkModePrefs.enabled || "auto";
    elements.autoCollapseAutomod.checked =
      darkModePrefs.autoCollapseAutomod !== false;
  }

  /**
   * Load nag blocking settings
   */
  async function loadNagBlockingSettings() {
    const nagBlocking = await window.Storage.getNagBlocking();

    elements.nagBlockingEnabled.checked = nagBlocking.enabled !== false;
    elements.blockLoginPrompts.checked = nagBlocking.blockLoginPrompts !== false;
    elements.blockEmailVerification.checked =
      nagBlocking.blockEmailVerification !== false;
    elements.blockPremiumBanners.checked =
      nagBlocking.blockPremiumBanners !== false;
    elements.blockAppPrompts.checked = nagBlocking.blockAppPrompts !== false;
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
   * Load muted subreddits list
   */
  async function loadMutedSubreddits() {
    const { mutedSubreddits } = await window.Storage.getSubredditOverrides();

    elements.mutedList.innerHTML = "";
    elements.mutedEmpty.hidden = mutedSubreddits.length > 0;

    for (const subreddit of mutedSubreddits) {
      const li = document.createElement("li");
      li.className = "tag";
      li.innerHTML = `
        r/${escapeHtml(subreddit)}
        <button class="remove" data-subreddit="${escapeHtml(subreddit)}">×</button>
      `;
      elements.mutedList.appendChild(li);
    }

    // Attach remove handlers
    elements.mutedList.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const subreddit = btn.dataset.subreddit;
        removeMutedSubreddit(subreddit);
      });
    });
  }

  /**
   * Load keyword filtering settings
   */
  async function loadKeywordFiltering() {
    const filtering = await window.Storage.getContentFiltering();

    elements.caseSensitive.checked = filtering.caseSensitive || false;
    elements.keywordList.innerHTML = "";
    elements.keywordEmpty.hidden = filtering.mutedKeywords.length > 0;

    for (const keyword of filtering.mutedKeywords) {
      const li = document.createElement("li");
      li.className = "tag";
      li.innerHTML = `
        ${escapeHtml(keyword)}
        <button class="remove" data-keyword="${escapeHtml(keyword)}">×</button>
      `;
      elements.keywordList.appendChild(li);
    }

    // Attach remove handlers
    elements.keywordList.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const keyword = btn.dataset.keyword;
        removeMutedKeyword(keyword);
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
   * Export statistics to JSON
   */
  async function handleExportStats() {
    const stats = await window.Storage.getStats();

    const exportData = {
      _exportType: "statistics",
      _exportDate: new Date().toISOString(),
      _extensionVersion: chrome.runtime.getManifest().version,
      totalRedirects: stats.totalRedirects,
      todayRedirects: stats.todayRedirects,
      todayDate: stats.todayDate,
      lastRedirect: stats.lastRedirect,
      weeklyHistory: stats.weeklyHistory,
      topSubreddits: Object.entries(stats.perSubreddit || {})
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `old-reddit-redirect-stats-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Statistics exported");
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
   * Handle dark mode preference changes
   */
  async function handleDarkModeChange() {
    const darkModePrefs = {
      enabled: elements.darkMode.value,
      autoCollapseAutomod: elements.autoCollapseAutomod.checked,
    };

    await window.Storage.setDarkMode(darkModePrefs);

    // Notify all old.reddit.com tabs to refresh dark mode
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_DARK_MODE" }, () => {
          void chrome.runtime.lastError;
        });
      });
    });

    showToast("Dark mode settings saved");
  }

  /**
   * Handle nag blocking preference changes
   */
  async function handleNagBlockingChange() {
    const nagBlocking = {
      enabled: elements.nagBlockingEnabled.checked,
      blockLoginPrompts: elements.blockLoginPrompts.checked,
      blockEmailVerification: elements.blockEmailVerification.checked,
      blockPremiumBanners: elements.blockPremiumBanners.checked,
      blockAppPrompts: elements.blockAppPrompts.checked,
    };

    await window.Storage.setNagBlocking(nagBlocking);

    // Notify all old.reddit.com tabs to refresh nag blocking
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_NAG_BLOCKING" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    showToast("Nag blocking settings saved");
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
   * Add subreddit to mute list
   */
  async function handleAddMutedSubreddit() {
    const subreddit = elements.mutedSubredditInput.value.trim().toLowerCase();

    if (!subreddit) {
      showToast("Please enter a subreddit name", "error");
      return;
    }

    if (!/^[a-z0-9_]+$/i.test(subreddit)) {
      showToast("Invalid subreddit name", "error");
      return;
    }

    const overrides = await window.Storage.getSubredditOverrides();

    if (overrides.mutedSubreddits.includes(subreddit)) {
      showToast("Subreddit already muted", "error");
      return;
    }

    if (overrides.mutedSubreddits.length >= 100) {
      showToast("Maximum 100 muted subreddits allowed", "error");
      return;
    }

    await window.Storage.addMutedSubreddit(subreddit);

    // Notify all old.reddit.com tabs to refresh muting
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
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

    elements.mutedSubredditInput.value = "";
    await loadMutedSubreddits();

    showToast(`r/${subreddit} muted`);
  }

  /**
   * Remove subreddit from mute list
   */
  async function removeMutedSubreddit(subreddit) {
    await window.Storage.removeMutedSubreddit(subreddit);

    // Notify all old.reddit.com tabs to refresh muting
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
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

    await loadMutedSubreddits();
    showToast(`r/${subreddit} unmuted`);
  }

  /**
   * Export muted subreddits list
   */
  async function handleExportMuted() {
    const { mutedSubreddits } = await window.Storage.getSubredditOverrides();

    const blob = new Blob([JSON.stringify(mutedSubreddits, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orr-muted-subreddits-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Mute list exported");
  }

  /**
   * Import muted subreddits list
   */
  async function handleImportMuted() {
    elements.importMutedFile.click();
  }

  /**
   * Handle muted list file selection
   */
  async function handleImportMutedFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        showToast("Invalid format: must be JSON array", "error");
        return;
      }

      // Validate subreddit names
      const invalid = imported.filter(
        (s) => typeof s !== "string" || !/^[a-z0-9_]+$/i.test(s)
      );
      if (invalid.length > 0) {
        showToast(`Invalid subreddit names: ${invalid.join(", ")}`, "error");
        return;
      }

      const overrides = await window.Storage.getSubredditOverrides();
      const newMutes = imported.filter(
        (s) => !overrides.mutedSubreddits.includes(s.toLowerCase())
      );

      if (newMutes.length === 0) {
        showToast("All subreddits already muted", "error");
        return;
      }

      // Add new mutes
      for (const sub of newMutes) {
        await window.Storage.addMutedSubreddit(sub);
      }

      // Refresh UI
      await loadMutedSubreddits();

      // Notify tabs
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

      showToast(`${newMutes.length} subreddits imported`);
    } catch (error) {
      showToast(`Import failed: ${error.message}`, "error");
    } finally {
      // Reset file input
      event.target.value = "";
    }
  }

  /**
   * Add keyword to mute list
   */
  async function handleAddKeyword() {
    const keyword = elements.keywordInput.value.trim();

    if (!keyword) {
      showToast("Please enter a keyword or phrase", "error");
      return;
    }

    const filtering = await window.Storage.getContentFiltering();

    if (filtering.mutedKeywords.includes(keyword)) {
      showToast("Keyword already muted", "error");
      return;
    }

    if (filtering.mutedKeywords.length >= 200) {
      showToast("Maximum 200 keywords allowed", "error");
      return;
    }

    await window.Storage.addMutedKeyword(keyword);

    // Notify tabs
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_KEYWORD_FILTERING" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    elements.keywordInput.value = "";
    await loadKeywordFiltering();

    showToast(`"${keyword}" muted`);
  }

  /**
   * Remove keyword from mute list
   */
  async function removeMutedKeyword(keyword) {
    await window.Storage.removeMutedKeyword(keyword);

    // Notify tabs
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_KEYWORD_FILTERING" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    await loadKeywordFiltering();
    showToast(`"${keyword}" unmuted`);
  }

  /**
   * Handle case sensitive toggle
   */
  async function handleCaseSensitiveChange() {
    const filtering = await window.Storage.getContentFiltering();
    filtering.caseSensitive = elements.caseSensitive.checked;
    await window.Storage.setContentFiltering(filtering);

    // Notify tabs
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_KEYWORD_FILTERING" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    showToast("Case sensitivity updated");
  }

  /**
   * Export keywords list
   */
  async function handleExportKeywords() {
    const filtering = await window.Storage.getContentFiltering();

    const blob = new Blob([JSON.stringify(filtering.mutedKeywords, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orr-muted-keywords-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Keyword list exported");
  }

  /**
   * Import keywords list
   */
  async function handleImportKeywords() {
    elements.importKeywordsFile.click();
  }

  /**
   * Handle keywords file selection
   */
  async function handleImportKeywordsFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        showToast("Invalid format: must be JSON array", "error");
        return;
      }

      // Validate keywords (strings only)
      const invalid = imported.filter((k) => typeof k !== "string" || !k.trim());
      if (invalid.length > 0) {
        showToast("Invalid keywords detected", "error");
        return;
      }

      const filtering = await window.Storage.getContentFiltering();
      const newKeywords = imported.filter(
        (k) => !filtering.mutedKeywords.includes(k.trim())
      );

      if (newKeywords.length === 0) {
        showToast("All keywords already muted", "error");
        return;
      }

      // Add new keywords
      for (const keyword of newKeywords) {
        await window.Storage.addMutedKeyword(keyword.trim());
      }

      // Refresh UI
      await loadKeywordFiltering();

      // Notify tabs
      chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "REFRESH_KEYWORD_FILTERING" },
            () => {
              void chrome.runtime.lastError;
            }
          );
        });
      });

      showToast(`${newKeywords.length} keywords imported`);
    } catch (error) {
      showToast(`Import failed: ${error.message}`, "error");
    } finally {
      // Reset file input
      event.target.value = "";
    }
  }

  /**
   * Load domain filtering settings
   */
  async function loadDomainFiltering() {
    const filtering = await window.Storage.getContentFiltering();

    elements.domainList.innerHTML = "";
    elements.domainEmpty.hidden = filtering.mutedDomains.length > 0;

    for (const domain of filtering.mutedDomains) {
      const li = document.createElement("li");
      li.className = "tag";
      li.innerHTML = `
        ${escapeHtml(domain)}
        <button class="remove" data-domain="${escapeHtml(domain)}">×</button>
      `;
      elements.domainList.appendChild(li);
    }

    // Attach remove handlers
    elements.domainList.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const domain = btn.dataset.domain;
        removeMutedDomain(domain);
      });
    });
  }

  /**
   * Add domain to mute list
   */
  async function handleAddDomain() {
    const domain = elements.domainInput.value.trim();

    if (!domain) {
      showToast("Please enter a domain", "error");
      return;
    }

    const filtering = await window.Storage.getContentFiltering();

    // Normalize domain (will be done by storage helper, but check for duplicates first)
    const normalized = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .toLowerCase();

    if (filtering.mutedDomains.includes(normalized)) {
      showToast("Domain already muted", "error");
      return;
    }

    if (filtering.mutedDomains.length >= 100) {
      showToast("Maximum 100 domains allowed", "error");
      return;
    }

    await window.Storage.addMutedDomain(domain);

    // Notify tabs
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_DOMAIN_FILTERING" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    elements.domainInput.value = "";
    await loadDomainFiltering();

    showToast(`"${normalized}" muted`);
  }

  /**
   * Remove domain from mute list
   */
  async function removeMutedDomain(domain) {
    await window.Storage.removeMutedDomain(domain);

    // Notify tabs
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_DOMAIN_FILTERING" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    await loadDomainFiltering();
    showToast(`"${domain}" unmuted`);
  }

  /**
   * Export domains list
   */
  async function handleExportDomains() {
    const filtering = await window.Storage.getContentFiltering();

    const blob = new Blob([JSON.stringify(filtering.mutedDomains, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orr-muted-domains-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Domain list exported");
  }

  /**
   * Import domains list
   */
  async function handleImportDomains() {
    elements.importDomainsFile.click();
  }

  /**
   * Handle domains file selection
   */
  async function handleImportDomainsFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        showToast("Invalid format: must be JSON array", "error");
        return;
      }

      // Validate domains (strings only)
      const invalid = imported.filter((d) => typeof d !== "string" || !d.trim());
      if (invalid.length > 0) {
        showToast("Invalid domains detected", "error");
        return;
      }

      const filtering = await window.Storage.getContentFiltering();

      // Normalize and filter for new domains
      const newDomains = imported
        .map((d) =>
          d
            .trim()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .toLowerCase()
        )
        .filter((d) => !filtering.mutedDomains.includes(d));

      if (newDomains.length === 0) {
        showToast("All domains already muted", "error");
        return;
      }

      // Add new domains
      for (const domain of newDomains) {
        await window.Storage.addMutedDomain(domain);
      }

      // Refresh UI
      await loadDomainFiltering();

      // Notify tabs
      chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "REFRESH_DOMAIN_FILTERING" },
            () => {
              void chrome.runtime.lastError;
            }
          );
        });
      });

      showToast(`${newDomains.length} domains imported`);
    } catch (error) {
      showToast(`Import failed: ${error.message}`, "error");
    } finally {
      // Reset file input
      event.target.value = "";
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
   * Load and render frontend options
   */
  async function loadFrontendOptions() {
    const frontends = window.Frontends.getAll();
    const frontendConfig = await window.Storage.getFrontend();
    const currentTarget = frontendConfig.target || "old.reddit.com";

    elements.frontendOptions.innerHTML = frontends
      .map(
        (frontend) => `
      <label class="frontend-card ${currentTarget === frontend.domain || (currentTarget === "custom" && frontend.id === "custom") ? "selected" : ""}">
        <input
          type="radio"
          name="frontend"
          value="${frontend.id}"
          ${currentTarget === frontend.domain || (currentTarget === "custom" && frontend.id === "custom") ? "checked" : ""}
        />
        <div class="frontend-header">
          <span class="frontend-icon">${frontend.icon}</span>
          <span class="frontend-name">${escapeHtml(frontend.name)}</span>
        </div>
        <p class="frontend-description">${escapeHtml(frontend.description)}</p>
      </label>
    `
      )
      .join("");

    // Show custom domain section if custom is selected
    if (currentTarget === "custom") {
      elements.customDomainSection.hidden = false;
      elements.customDomain.value = frontendConfig.customDomain || "";
    } else {
      elements.customDomainSection.hidden = true;
    }

    // Add event listeners to cards
    document.querySelectorAll('input[name="frontend"]').forEach((radio) => {
      radio.addEventListener("change", handleFrontendChange);
    });
  }

  /**
   * Handle frontend selection change
   */
  async function handleFrontendChange(event) {
    const selectedId = event.target.value;
    const frontend = window.Frontends.getById(selectedId);

    // Update selection UI
    document.querySelectorAll(".frontend-card").forEach((card) => {
      card.classList.remove("selected");
    });
    event.target.closest(".frontend-card").classList.add("selected");

    // Show/hide custom domain section
    if (selectedId === "custom") {
      elements.customDomainSection.hidden = false;
      return; // Don't save until custom domain is entered
    } else {
      elements.customDomainSection.hidden = true;
      elements.permissionNotice.hidden = true;
    }

    // Check if permission is required
    if (frontend.requiresPermission) {
      const hasPermission = await checkPermission(frontend.domain);
      if (!hasPermission) {
        elements.permissionNotice.hidden = false;
        elements.requestPermission.onclick = () =>
          requestPermission(frontend.domain);
        return;
      }
    }

    // Save selection
    await saveFrontendSelection(frontend.domain);
  }

  /**
   * Handle custom domain save
   */
  async function handleSaveCustomDomain() {
    const domain = elements.customDomain.value.trim();

    if (!domain) {
      showToast("Please enter a domain", "error");
      return;
    }

    // Validate domain format
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      showToast("Invalid domain format", "error");
      return;
    }

    // Check permission
    const hasPermission = await checkPermission(domain);
    if (!hasPermission) {
      elements.permissionNotice.hidden = false;
      elements.requestPermission.onclick = () => requestPermission(domain);
      return;
    }

    // Save custom domain
    await window.Storage.setFrontend({
      target: "custom",
      customDomain: domain,
    });

    showToast("Custom frontend saved!", "success");
    elements.permissionNotice.hidden = true;

    // Notify background script to update rules
    await chrome.runtime.sendMessage({ type: "UPDATE_FRONTEND_RULES" });
  }

  /**
   * Save frontend selection
   */
  async function saveFrontendSelection(domain) {
    await window.Storage.setFrontend({
      target: domain,
      customDomain: null,
    });

    showToast("Frontend updated!", "success");

    // Notify background script to update rules
    await chrome.runtime.sendMessage({ type: "UPDATE_FRONTEND_RULES" });
  }

  /**
   * Check if permission is granted for domain
   */
  async function checkPermission(domain) {
    try {
      return await chrome.permissions.contains({
        origins: [`*://${domain}/*`, `*://*.${domain}/*`],
      });
    } catch (error) {
      window.Logger?.warn("Permission check failed:", error);
      return false;
    }
  }

  /**
   * Request permission for domain
   */
  async function requestPermission(domain) {
    try {
      const granted = await chrome.permissions.request({
        origins: [`*://${domain}/*`, `*://*.${domain}/*`],
      });

      if (granted) {
        elements.permissionNotice.hidden = true;
        showToast("Permission granted!", "success");

        // Save the selection now
        if (elements.customDomainSection.hidden) {
          const selectedRadio = document.querySelector(
            'input[name="frontend"]:checked'
          );
          const frontend = window.Frontends.getById(selectedRadio.value);
          await saveFrontendSelection(frontend.domain);
        } else {
          await handleSaveCustomDomain();
        }
      } else {
        showToast("Permission denied", "error");
      }
    } catch (error) {
      window.Logger?.error("Permission request failed:", error);
      showToast("Permission request failed", "error");
    }
  }

  /**
   * Attach event listeners
   */
  function attachListeners() {
    // Main toggle
    elements.toggleRedirect.addEventListener("change", handleToggleRedirect);

    // Statistics
    elements.clearStats.addEventListener("click", handleClearStats);
    elements.exportStats.addEventListener("click", handleExportStats);

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

    // Dark mode
    elements.darkMode.addEventListener("change", handleDarkModeChange);
    elements.autoCollapseAutomod.addEventListener(
      "change",
      handleDarkModeChange
    );

    // Nag blocking
    elements.nagBlockingEnabled.addEventListener(
      "change",
      handleNagBlockingChange
    );
    elements.blockLoginPrompts.addEventListener(
      "change",
      handleNagBlockingChange
    );
    elements.blockEmailVerification.addEventListener(
      "change",
      handleNagBlockingChange
    );
    elements.blockPremiumBanners.addEventListener(
      "change",
      handleNagBlockingChange
    );
    elements.blockAppPrompts.addEventListener("change", handleNagBlockingChange);

    // Subreddit whitelist
    elements.addSubreddit.addEventListener("click", handleAddSubreddit);
    elements.subredditInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleAddSubreddit();
      }
    });

    // Muted subreddits
    elements.addMutedSubreddit.addEventListener(
      "click",
      handleAddMutedSubreddit
    );
    elements.mutedSubredditInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleAddMutedSubreddit();
      }
    });
    elements.exportMuted.addEventListener("click", handleExportMuted);
    elements.importMuted.addEventListener("click", handleImportMuted);
    elements.importMutedFile.addEventListener("change", handleImportMutedFile);

    // Keyword filtering
    elements.addKeyword.addEventListener("click", handleAddKeyword);
    elements.keywordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleAddKeyword();
      }
    });
    elements.caseSensitive.addEventListener("change", handleCaseSensitiveChange);
    elements.exportKeywords.addEventListener("click", handleExportKeywords);
    elements.importKeywords.addEventListener("click", handleImportKeywords);
    elements.importKeywordsFile.addEventListener(
      "change",
      handleImportKeywordsFile
    );

    // Domain filtering
    elements.addDomain.addEventListener("click", handleAddDomain);
    elements.domainInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleAddDomain();
      }
    });
    elements.exportDomains.addEventListener("click", handleExportDomains);
    elements.importDomains.addEventListener("click", handleImportDomains);
    elements.importDomainsFile.addEventListener(
      "change",
      handleImportDomainsFile
    );

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

    // Frontend selection
    elements.saveCustomDomain.addEventListener("click", handleSaveCustomDomain);
    elements.customDomain.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSaveCustomDomain();
      }
    });

    // Listen for storage changes (debounced for performance)
    let statsUpdateTimeout = null;
    let enabledUpdateTimeout = null;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        if (changes.stats) {
          // Debounce stats updates to avoid rapid re-renders
          clearTimeout(statsUpdateTimeout);
          statsUpdateTimeout = setTimeout(() => {
            loadStats();
          }, 100);
        }
        if (changes.enabled) {
          // Debounce enabled state updates
          clearTimeout(enabledUpdateTimeout);
          enabledUpdateTimeout = setTimeout(() => {
            loadMainToggle();
          }, 50);
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

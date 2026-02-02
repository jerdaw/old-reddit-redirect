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
    colorCodedComments: document.getElementById("color-coded-comments"),
    colorPalette: document.getElementById("color-palette"),
    stripeWidth: document.getElementById("stripe-width"),
    navigationButtons: document.getElementById("navigation-buttons"),
    navButtonPosition: document.getElementById("nav-button-position"),
    inlineImages: document.getElementById("inline-images"),
    maxImageWidth: document.getElementById("max-image-width"),
    jumpToTopShortcut: document.getElementById("jump-to-top-shortcut"),
    // Comment Minimap
    minimapEnabled: document.getElementById("minimap-enabled"),
    minimapPosition: document.getElementById("minimap-position"),
    minimapPositionRow: document.getElementById("minimap-position-row"),
    minimapWidth: document.getElementById("minimap-width"),
    minimapWidthValue: document.getElementById("minimap-width-value"),
    minimapWidthRow: document.getElementById("minimap-width-row"),
    minimapOpacity: document.getElementById("minimap-opacity"),
    minimapOpacityValue: document.getElementById("minimap-opacity-value"),
    minimapOpacityRow: document.getElementById("minimap-opacity-row"),
    minimapViewport: document.getElementById("minimap-viewport"),
    minimapDepthColors: document.getElementById("minimap-depth-colors"),
    minimapCollapsed: document.getElementById("minimap-collapsed"),
    minimapAutohide: document.getElementById("minimap-autohide"),
    nagBlockingEnabled: document.getElementById("nag-blocking-enabled"),
    blockLoginPrompts: document.getElementById("block-login-prompts"),
    blockEmailVerification: document.getElementById("block-email-verification"),
    blockPremiumBanners: document.getElementById("block-premium-banners"),
    blockAppPrompts: document.getElementById("block-app-prompts"),
    blockAIContent: document.getElementById("block-ai-content"),
    blockTrending: document.getElementById("block-trending"),
    blockRecommended: document.getElementById("block-recommended"),
    blockCommunityHighlights: document.getElementById(
      "block-community-highlights"
    ),
    blockMorePosts: document.getElementById("block-more-posts"),
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
    feedCompactMode: document.getElementById("feed-compact-mode"),
    feedTextOnly: document.getElementById("feed-text-only"),
    feedUncropImages: document.getElementById("feed-uncrop-images"),
    feedHideJoin: document.getElementById("feed-hide-join"),
    feedHideActions: document.getElementById("feed-hide-actions"),
    customCSSEnabled: document.getElementById("custom-css-enabled"),
    customCSS: document.getElementById("custom-css"),
    saveCustomCSS: document.getElementById("save-custom-css"),
    clearCustomCSS: document.getElementById("clear-custom-css"),
    validateCustomCSS: document.getElementById("validate-custom-css"),
    trackingRemovalEnabled: document.getElementById("tracking-removal-enabled"),
    trackingBadgeEnabled: document.getElementById("tracking-badge-enabled"),
    trackingTotalCleaned: document.getElementById("tracking-total-cleaned"),
    trackingLastCleaned: document.getElementById("tracking-last-cleaned"),
    trackingUtmCount: document.getElementById("tracking-utm-count"),
    trackingSocialCount: document.getElementById("tracking-social-count"),
    trackingAnalyticsCount: document.getElementById("tracking-analytics-count"),
    trackingAffiliateCount: document.getElementById("tracking-affiliate-count"),
    trackingRedditCount: document.getElementById("tracking-reddit-count"),
    trackingOtherCount: document.getElementById("tracking-other-count"),
    clearTrackingStats: document.getElementById("clear-tracking-stats"),
    exportPrivacyReport: document.getElementById("export-privacy-report"),
    privacyScoreValue: document.getElementById("privacy-score-value"),
    privacyScoreFill: document.getElementById("privacy-score-fill"),
    privacyScoreStatus: document.getElementById("privacy-score-status"),
    privacyRecommendations: document.getElementById("privacy-recommendations"),
    referrerDefault: document.getElementById("referrer-default"),
    referrerSameOrigin: document.getElementById("referrer-same-origin"),
    referrerOrigin: document.getElementById("referrer-origin"),
    referrerNoReferrer: document.getElementById("referrer-no-referrer"),
    trackingParams: document.getElementById("tracking-params"),
    saveTrackingParams: document.getElementById("save-tracking-params"),
    resetTrackingParams: document.getElementById("reset-tracking-params"),
    // Layout Presets
    layoutPresetsEnabled: document.getElementById("layout-presets-enabled"),
    newPresetName: document.getElementById("new-preset-name"),
    createPresetBtn: document.getElementById("create-preset-btn"),
    presetCount: document.getElementById("preset-count"),
    presetMax: document.getElementById("preset-max"),
    presetsTable: document.getElementById("presets-table"),
    presetsTbody: document.getElementById("presets-tbody"),
    presetsEmpty: document.getElementById("presets-empty"),
    exportPresets: document.getElementById("export-presets"),
    importPresets: document.getElementById("import-presets"),
    clearAllPresets: document.getElementById("clear-all-presets"),
    activePresetSelect: document.getElementById("active-preset-select"),
    mappingSubreddit: document.getElementById("mapping-subreddit"),
    mappingPreset: document.getElementById("mapping-preset"),
    addMappingBtn: document.getElementById("add-mapping-btn"),
    mappingCount: document.getElementById("mapping-count"),
    mappingMax: document.getElementById("mapping-max"),
    mappingsTable: document.getElementById("mappings-table"),
    mappingsTbody: document.getElementById("mappings-tbody"),
    mappingsEmpty: document.getElementById("mappings-empty"),
    clearAllMappings: document.getElementById("clear-all-mappings"),
    // Accessibility
    fontSize: document.getElementById("font-size"),
    reduceMotion: document.getElementById("reduce-motion"),
    highContrastElements: document.getElementById("high-contrast-elements"),
    // Reading History
    readingHistoryEnabled: document.getElementById("reading-history-enabled"),
    showVisitedIndicator: document.getElementById("show-visited-indicator"),
    historyRetentionDays: document.getElementById("history-retention-days"),
    historyEntryCount: document.getElementById("history-entry-count"),
    historyLastViewed: document.getElementById("history-last-viewed"),
    historySearch: document.getElementById("history-search"),
    historyTable: document.getElementById("history-table"),
    historyTbody: document.getElementById("history-tbody"),
    historyEmpty: document.getElementById("history-empty"),
    clearReadingHistory: document.getElementById("clear-reading-history"),
    exportReadingHistory: document.getElementById("export-reading-history"),
    importReadingHistoryBtn: document.getElementById(
      "import-reading-history-btn"
    ),
    importReadingHistoryFile: document.getElementById(
      "import-reading-history-file"
    ),
    // NSFW Controls
    nsfwControlsEnabled: document.getElementById("nsfw-controls-enabled"),
    nsfwVisibility: document.getElementById("nsfw-visibility"),
    nsfwVisibilityRow: document.getElementById("nsfw-visibility-row"),
    nsfwBlurIntensity: document.getElementById("nsfw-blur-intensity"),
    nsfwBlurIntensityValue: document.getElementById(
      "nsfw-blur-intensity-value"
    ),
    nsfwBlurOptions: document.getElementById("nsfw-blur-options"),
    nsfwRevealHover: document.getElementById("nsfw-reveal-hover"),
    nsfwHoverRow: document.getElementById("nsfw-hover-row"),
    nsfwShowWarning: document.getElementById("nsfw-show-warning"),
    nsfwWarningRow: document.getElementById("nsfw-warning-row"),
    nsfwAllowedSubreddit: document.getElementById("nsfw-allowed-subreddit"),
    addNsfwAllowed: document.getElementById("add-nsfw-allowed"),
    nsfwAllowedList: document.getElementById("nsfw-allowed-list"),
    nsfwAllowedEmpty: document.getElementById("nsfw-allowed-empty"),
    clearNsfwAllowed: document.getElementById("clear-nsfw-allowed"),
    // Storage Management
    storageHealthBanner: document.getElementById("storage-health-banner"),
    storageHealthIcon: document.getElementById("storage-health-icon"),
    storageHealthMessage: document.getElementById("storage-health-message"),
    localStorageValue: document.getElementById("local-storage-value"),
    localStorageBar: document.getElementById("local-storage-bar"),
    syncStorageValue: document.getElementById("sync-storage-value"),
    syncStorageBar: document.getElementById("sync-storage-bar"),
    storageBreakdownGrid: document.getElementById("storage-breakdown-grid"),
    countUserTags: document.getElementById("count-user-tags"),
    countMutedUsers: document.getElementById("count-muted-users"),
    countSortPrefs: document.getElementById("count-sort-prefs"),
    countScrollPos: document.getElementById("count-scroll-pos"),
    countPresets: document.getElementById("count-presets"),
    countMutedSubs: document.getElementById("count-muted-subs"),
    runStorageCleanup: document.getElementById("run-storage-cleanup"),
    runStorageMaintenance: document.getElementById("run-storage-maintenance"),
    refreshStorageStats: document.getElementById("refresh-storage-stats"),
    cleanupResult: document.getElementById("cleanup-result"),
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
    initKeyboardShortcutsUI();
  }

  /**
   * Load all settings
   */
  async function loadAllSettings() {
    await loadMainToggle();
    await loadStats();
    await loadUIPreferences();
    await loadDarkModeSettings();
    await loadAccessibilitySettings();
    await loadReadingHistorySettings();
    await loadNsfwControlsSettings();
    await loadCommentEnhancementsSettings();
    await loadCommentMinimapSettings();
    await loadSortPreferences();
    await loadUserTags();
    await loadMutedUsers();
    await loadScrollPositions();
    await loadFeedEnhancements();
    await loadLayoutPresets();
    await loadPrivacySettings();
    await loadNagBlockingSettings();
    await loadFrontendOptions();
    await loadStorageManagement();
    await loadWhitelist();
    await loadMutedSubreddits();
    await loadKeywordFiltering();
    await loadFlairFiltering();
    await loadScoreFiltering();
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
   * Load accessibility settings
   */
  async function loadAccessibilitySettings() {
    const accessibility = await window.Storage.getAccessibility();

    if (elements.fontSize) {
      elements.fontSize.value = accessibility.fontSize || "medium";
    }
    if (elements.reduceMotion) {
      elements.reduceMotion.value = accessibility.reduceMotion || "auto";
    }
    if (elements.highContrastElements) {
      elements.highContrastElements.checked =
        accessibility.highContrast === true;
    }
  }

  // =========================================================================
  // Reading History
  // =========================================================================

  /**
   * Load reading history settings
   */
  async function loadReadingHistorySettings() {
    const config = await window.Storage.getReadingHistory();

    if (elements.readingHistoryEnabled) {
      elements.readingHistoryEnabled.checked = config.enabled !== false;
    }
    if (elements.showVisitedIndicator) {
      elements.showVisitedIndicator.checked =
        config.showVisitedIndicator !== false;
    }
    if (elements.historyRetentionDays) {
      elements.historyRetentionDays.value = String(config.retentionDays || 30);
    }

    // Load stats and entries
    await refreshReadingHistoryDisplay();
  }

  /**
   * Refresh reading history display (stats and table)
   */
  async function refreshReadingHistoryDisplay() {
    const entries = await window.Storage.getReadingHistoryEntries();

    // Update stats
    if (elements.historyEntryCount) {
      elements.historyEntryCount.textContent = formatNumber(entries.length);
    }
    if (elements.historyLastViewed && entries.length > 0) {
      const mostRecent = entries[0];
      elements.historyLastViewed.textContent = new Date(
        mostRecent.timestamp
      ).toLocaleString();
    } else if (elements.historyLastViewed) {
      elements.historyLastViewed.textContent = "Never";
    }

    // Refresh table
    await refreshReadingHistoryTable();
  }

  /**
   * Refresh reading history table
   */
  async function refreshReadingHistoryTable(filter = "") {
    if (!elements.historyTbody) return;

    const entries = await window.Storage.getReadingHistoryEntries(100); // Show max 100
    const tbody = elements.historyTbody;
    tbody.innerHTML = "";

    // Filter entries if search term provided
    const filterLower = filter.toLowerCase();
    const filteredEntries = filter
      ? entries.filter(
          (e) =>
            e.title.toLowerCase().includes(filterLower) ||
            e.subreddit.toLowerCase().includes(filterLower)
        )
      : entries;

    if (filteredEntries.length === 0) {
      if (elements.historyTable) elements.historyTable.style.display = "none";
      if (elements.historyEmpty) elements.historyEmpty.style.display = "block";
      return;
    }

    if (elements.historyTable) elements.historyTable.style.display = "table";
    if (elements.historyEmpty) elements.historyEmpty.style.display = "none";

    for (const entry of filteredEntries) {
      const row = document.createElement("tr");

      // Post title (linked)
      const titleCell = document.createElement("td");
      const titleLink = document.createElement("a");
      titleLink.href =
        entry.url || `https://old.reddit.com/comments/${entry.id}`;
      titleLink.textContent =
        entry.title.length > 60
          ? entry.title.substring(0, 60) + "..."
          : entry.title;
      titleLink.target = "_blank";
      titleLink.rel = "noopener";
      titleCell.appendChild(titleLink);
      row.appendChild(titleCell);

      // Subreddit
      const subCell = document.createElement("td");
      subCell.textContent = entry.subreddit ? `r/${entry.subreddit}` : "-";
      row.appendChild(subCell);

      // Timestamp
      const timeCell = document.createElement("td");
      timeCell.textContent = new Date(entry.timestamp).toLocaleDateString();
      row.appendChild(timeCell);

      // Actions
      const actionsCell = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "small-button danger-button";
      removeBtn.addEventListener("click", async () => {
        await window.Storage.removeReadingHistoryEntry(entry.id);
        await refreshReadingHistoryDisplay();
        showToast("Entry removed from history");
      });
      actionsCell.appendChild(removeBtn);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    }
  }

  /**
   * Handle reading history toggle
   */
  async function handleReadingHistoryToggle(e) {
    const config = await window.Storage.getReadingHistory();

    if (e.target === elements.readingHistoryEnabled) {
      config.enabled = e.target.checked;
    } else if (e.target === elements.showVisitedIndicator) {
      config.showVisitedIndicator = e.target.checked;
    }

    await window.Storage.setReadingHistory(config);

    // Notify content scripts
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_READING_HISTORY" });
      });
    });

    showToast("Reading history settings updated");
  }

  /**
   * Handle retention days change
   */
  async function handleRetentionDaysChange() {
    const config = await window.Storage.getReadingHistory();
    config.retentionDays =
      parseInt(elements.historyRetentionDays.value, 10) || 30;
    await window.Storage.setReadingHistory(config);

    // Cleanup expired entries
    const removed = await window.Storage.cleanupReadingHistory();
    if (removed > 0) {
      await refreshReadingHistoryDisplay();
      showToast(`Retention updated, ${removed} old entries removed`);
    } else {
      showToast("Retention period updated");
    }
  }

  /**
   * Handle clear reading history
   */
  async function handleClearReadingHistory() {
    if (!confirm("Clear all reading history? This cannot be undone.")) return;

    await window.Storage.clearReadingHistory();
    await refreshReadingHistoryDisplay();

    // Notify content scripts
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_READING_HISTORY" });
      });
    });

    showToast("Reading history cleared");
  }

  /**
   * Handle export reading history
   */
  async function handleExportReadingHistory() {
    const data = await window.Storage.exportReadingHistory();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reading-history-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${data.entryCount} history entries`);
  }

  /**
   * Handle import reading history
   */
  async function handleImportReadingHistory(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const imported = await window.Storage.importReadingHistory(data, true);
      await refreshReadingHistoryDisplay();

      // Notify content scripts
      chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { type: "REFRESH_READING_HISTORY" });
        });
      });

      showToast(`Imported ${imported} new history entries`);
    } catch (error) {
      showToast("Failed to import: Invalid file format");
    }

    // Reset file input
    e.target.value = "";
  }

  // =========================================================================
  // NSFW Controls
  // =========================================================================

  /**
   * Load NSFW controls settings
   */
  async function loadNsfwControlsSettings() {
    const config = await window.Storage.getNsfwControls();

    if (elements.nsfwControlsEnabled) {
      elements.nsfwControlsEnabled.checked = config.enabled === true;
    }
    if (elements.nsfwVisibility) {
      elements.nsfwVisibility.value = config.visibility || "show";
    }
    if (elements.nsfwBlurIntensity) {
      elements.nsfwBlurIntensity.value = config.blurIntensity || 10;
      updateNsfwBlurIntensityDisplay();
    }
    if (elements.nsfwRevealHover) {
      elements.nsfwRevealHover.checked = config.revealOnHover !== false;
    }
    if (elements.nsfwShowWarning) {
      elements.nsfwShowWarning.checked = config.showWarning !== false;
    }

    // Update visibility of dependent options
    updateNsfwOptionsVisibility();

    // Load allowed subreddits
    await refreshNsfwAllowedList();
  }

  /**
   * Update NSFW blur intensity display
   */
  function updateNsfwBlurIntensityDisplay() {
    if (elements.nsfwBlurIntensityValue && elements.nsfwBlurIntensity) {
      elements.nsfwBlurIntensityValue.textContent = `${elements.nsfwBlurIntensity.value}px`;
    }
  }

  /**
   * Update visibility of NSFW-dependent options
   */
  function updateNsfwOptionsVisibility() {
    const enabled = elements.nsfwControlsEnabled?.checked;
    const visibility = elements.nsfwVisibility?.value;
    const isBlurMode = visibility === "blur";

    // Hide all options when disabled
    if (elements.nsfwVisibilityRow) {
      elements.nsfwVisibilityRow.style.display = enabled ? "" : "none";
    }
    if (elements.nsfwBlurOptions) {
      elements.nsfwBlurOptions.style.display =
        enabled && isBlurMode ? "" : "none";
    }
    if (elements.nsfwHoverRow) {
      elements.nsfwHoverRow.style.display = enabled && isBlurMode ? "" : "none";
    }
    if (elements.nsfwWarningRow) {
      elements.nsfwWarningRow.style.display =
        enabled && isBlurMode ? "" : "none";
    }
  }

  /**
   * Refresh NSFW allowed subreddits list
   */
  async function refreshNsfwAllowedList() {
    const allowed = await window.Storage.getNsfwAllowedSubreddits();

    if (!elements.nsfwAllowedList) return;

    elements.nsfwAllowedList.innerHTML = "";

    if (allowed.length === 0) {
      if (elements.nsfwAllowedEmpty) {
        elements.nsfwAllowedEmpty.style.display = "block";
      }
      return;
    }

    if (elements.nsfwAllowedEmpty) {
      elements.nsfwAllowedEmpty.style.display = "none";
    }

    for (const subreddit of allowed) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.innerHTML = `
        <span class="tag-text">r/${escapeHtml(subreddit)}</span>
        <button class="tag-remove" data-subreddit="${escapeHtml(subreddit)}" aria-label="Remove r/${escapeHtml(subreddit)}">×</button>
      `;
      elements.nsfwAllowedList.appendChild(tag);
    }

    // Add event listeners for remove buttons
    elements.nsfwAllowedList.querySelectorAll(".tag-remove").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const subreddit = btn.getAttribute("data-subreddit");
        await window.Storage.removeNsfwAllowedSubreddit(subreddit);
        await refreshNsfwAllowedList();
        notifyContentScripts();
        showToast(`Removed r/${subreddit} from allowed list`);
      });
    });
  }

  /**
   * Handle NSFW controls toggle
   */
  async function handleNsfwControlsToggle(e) {
    const config = await window.Storage.getNsfwControls();

    if (e.target === elements.nsfwControlsEnabled) {
      config.enabled = e.target.checked;
      updateNsfwOptionsVisibility();
    } else if (e.target === elements.nsfwRevealHover) {
      config.revealOnHover = e.target.checked;
    } else if (e.target === elements.nsfwShowWarning) {
      config.showWarning = e.target.checked;
    }

    await window.Storage.setNsfwControls(config);
    notifyContentScripts();
  }

  /**
   * Handle NSFW visibility change
   */
  async function handleNsfwVisibilityChange(e) {
    const config = await window.Storage.getNsfwControls();
    config.visibility = e.target.value;
    await window.Storage.setNsfwControls(config);
    updateNsfwOptionsVisibility();
    notifyContentScripts();
  }

  /**
   * Handle NSFW blur intensity change
   */
  async function handleNsfwBlurIntensityChange() {
    const config = await window.Storage.getNsfwControls();
    config.blurIntensity = parseInt(elements.nsfwBlurIntensity.value, 10);
    await window.Storage.setNsfwControls(config);
    updateNsfwBlurIntensityDisplay();
    notifyContentScripts();
  }

  /**
   * Handle adding NSFW allowed subreddit
   */
  async function handleAddNsfwAllowed() {
    const input = elements.nsfwAllowedSubreddit;
    if (!input) return;

    const subreddit = input.value.trim().toLowerCase().replace(/^r\//, "");
    if (!subreddit) {
      showToast("Please enter a subreddit name", "error");
      return;
    }

    // Validate subreddit name
    if (!/^[a-z0-9_]+$/i.test(subreddit)) {
      showToast("Invalid subreddit name", "error");
      return;
    }

    await window.Storage.addNsfwAllowedSubreddit(subreddit);
    input.value = "";
    await refreshNsfwAllowedList();
    notifyContentScripts();
    showToast(`Added r/${subreddit} to allowed list`);
  }

  /**
   * Handle clearing all NSFW allowed subreddits
   */
  async function handleClearNsfwAllowed() {
    if (
      !confirm(
        "Clear all allowed subreddits? NSFW controls will apply everywhere."
      )
    ) {
      return;
    }

    await window.Storage.clearNsfwAllowedSubreddits();
    await refreshNsfwAllowedList();
    notifyContentScripts();
    showToast("Cleared all allowed subreddits");
  }

  /**
   * Notify content scripts of settings change
   */
  function notifyContentScripts() {
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_NSFW_CONTROLS" });
      });
    });
  }

  /**
   * Load comment enhancements settings
   */
  async function loadCommentEnhancementsSettings() {
    const enhancements = await window.Storage.getCommentEnhancements();

    elements.colorCodedComments.checked =
      enhancements.colorCodedComments !== false;
    elements.colorPalette.value = enhancements.colorPalette || "standard";
    elements.stripeWidth.value = String(enhancements.stripeWidth || 3);
    elements.navigationButtons.checked =
      enhancements.navigationButtons !== false;
    elements.navButtonPosition.value =
      enhancements.navButtonPosition || "bottom-right";
    elements.inlineImages.checked = enhancements.inlineImages !== false;
    elements.maxImageWidth.value = String(enhancements.maxImageWidth || 600);
    // v11.2.0: Jump to top keyboard shortcut
    elements.jumpToTopShortcut.checked =
      enhancements.jumpToTopShortcut !== false;
  }

  /**
   * Load comment minimap settings
   */
  async function loadCommentMinimapSettings() {
    const config = await window.Storage.getCommentMinimap();

    elements.minimapEnabled.checked = config.enabled !== false;
    elements.minimapPosition.value = config.position || "right";
    elements.minimapWidth.value = String(config.width || 120);
    elements.minimapWidthValue.textContent = `${config.width || 120}px`;
    elements.minimapOpacity.value = String(
      Math.round((config.opacity || 0.9) * 100)
    );
    elements.minimapOpacityValue.textContent = `${Math.round((config.opacity || 0.9) * 100)}%`;
    elements.minimapViewport.checked = config.showViewportIndicator !== false;
    elements.minimapDepthColors.checked = config.useDepthColors !== false;
    elements.minimapCollapsed.checked = config.collapsedIndicator !== false;
    elements.minimapAutohide.checked = config.autoHide === true;

    // Toggle visibility of dependent settings
    updateMinimapDependentSettings(config.enabled !== false);
  }

  /**
   * Update visibility of minimap dependent settings
   * @param {boolean} enabled - Whether minimap is enabled
   */
  function updateMinimapDependentSettings(enabled) {
    const dependentElements = [
      elements.minimapPositionRow,
      elements.minimapWidthRow,
      elements.minimapOpacityRow,
    ];

    dependentElements.forEach((el) => {
      if (el) {
        el.style.opacity = enabled ? "1" : "0.5";
        el.style.pointerEvents = enabled ? "auto" : "none";
      }
    });
  }

  /**
   * Load sort preferences settings
   */
  async function loadSortPreferences() {
    const config = await window.Storage.getSortPreferences();

    // Set toggle state
    document.getElementById("sort-preferences-enabled").checked =
      config.enabled !== false;

    // Refresh the list
    await refreshSortPreferencesList();
  }

  /**
   * Refresh the sort preferences list
   */
  async function refreshSortPreferencesList() {
    const config = await window.Storage.getSortPreferences();
    const prefs = config.preferences || {};
    const tbody = document.getElementById("prefs-tbody");
    const emptyState = document.getElementById("prefs-empty");
    const countSpan = document.getElementById("pref-count");
    const maxSpan = document.getElementById("pref-max");
    const searchInput = document.getElementById("pref-search");

    const entries = Object.entries(prefs);
    const searchTerm = (searchInput.value || "").toLowerCase();

    // Filter by search term
    const filtered = entries.filter(([sub]) => sub.includes(searchTerm));

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b[1].timestamp - a[1].timestamp);

    countSpan.textContent = entries.length;
    maxSpan.textContent = config.maxEntries || 100;

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      document.getElementById("prefs-table").style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    document.getElementById("prefs-table").style.display = "table";

    tbody.innerHTML = filtered
      .map(([subreddit, data]) => {
        const sortDisplay = formatSortDisplay(data.sort);
        const timeDisplay = data.time ? formatTimeDisplay(data.time) : "—";
        const dateDisplay = formatDate(data.timestamp);

        return `
      <tr data-subreddit="${escapeHtml(subreddit)}">
        <td class="subreddit-cell">
          <a href="https://old.reddit.com/r/${escapeHtml(subreddit)}/"
             target="_blank"
             rel="noopener">
            r/${escapeHtml(subreddit)}
          </a>
        </td>
        <td>${sortDisplay}</td>
        <td>${timeDisplay}</td>
        <td>${dateDisplay}</td>
        <td>
          <button class="delete-pref secondary-button"
                  data-subreddit="${escapeHtml(subreddit)}"
                  title="Delete preference">
            Delete
          </button>
        </td>
      </tr>
    `;
      })
      .join("");

    // Attach delete handlers
    tbody.querySelectorAll(".delete-pref").forEach((btn) => {
      btn.addEventListener("click", handleDeletePreference);
    });
  }

  /**
   * Format sort display name
   */
  function formatSortDisplay(sort) {
    const labels = {
      hot: "Hot",
      new: "New",
      top: "Top",
      rising: "Rising",
      controversial: "Controversial",
    };
    return labels[sort] || sort;
  }

  /**
   * Format time filter display name
   */
  function formatTimeDisplay(time) {
    const labels = {
      hour: "Past Hour",
      day: "Today",
      week: "This Week",
      month: "This Month",
      year: "This Year",
      all: "All Time",
    };
    return labels[time] || time;
  }

  /**
   * Format date display
   */
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  }

  /**
   * Handle sort preferences toggle
   */
  async function handleSortPreferencesToggle(e) {
    const enabled = e.target.checked;
    const config = await window.Storage.getSortPreferences();
    config.enabled = enabled;
    await window.Storage.setSortPreferences(config);
  }

  /**
   * Handle delete individual preference
   */
  async function handleDeletePreference(e) {
    const subreddit = e.target.dataset.subreddit;

    if (!confirm(`Delete sort preference for r/${subreddit}?`)) {
      return;
    }

    await window.Storage.deleteSortPreference(subreddit);
    await refreshSortPreferencesList();
  }

  /**
   * Handle clear all preferences
   */
  async function handleClearAllPreferences() {
    const config = await window.Storage.getSortPreferences();
    const count = Object.keys(config.preferences || {}).length;

    if (count === 0) {
      alert("No preferences to clear.");
      return;
    }

    if (
      !confirm(
        `Clear all ${count} saved sort preferences? This cannot be undone.`
      )
    ) {
      return;
    }

    await window.Storage.clearSortPreferences();
    await refreshSortPreferencesList();
  }

  /**
   * Handle export preferences
   */
  async function handleExportPreferences() {
    const config = await window.Storage.getSortPreferences();
    const prefs = config.preferences || {};
    const json = JSON.stringify(prefs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `sort-preferences-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Handle import preferences
   */
  async function handleImportPreferences() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        // Validate structure
        if (typeof imported !== "object" || imported === null) {
          throw new Error("Invalid format");
        }

        const config = await window.Storage.getSortPreferences();
        config.preferences = { ...config.preferences, ...imported };

        await window.Storage.setSortPreferences(config);
        await refreshSortPreferencesList();

        alert(`Imported ${Object.keys(imported).length} preferences`);
      } catch (err) {
        alert("Failed to import preferences: " + err.message);
      }
    };

    input.click();
  }

  /**
   * Load user tags settings
   */
  async function loadUserTags() {
    const config = await window.Storage.getUserTags();

    // Set toggle state
    document.getElementById("user-tags-enabled").checked =
      config.enabled !== false;

    // Refresh the list
    await refreshUserTagsList();
  }

  /**
   * Refresh the user tags list
   */
  async function refreshUserTagsList() {
    const config = await window.Storage.getUserTags();
    const tags = config.tags || {};
    const tbody = document.getElementById("tags-tbody");
    const emptyState = document.getElementById("tags-empty");
    const countSpan = document.getElementById("tag-count");
    const maxSpan = document.getElementById("tag-max");
    const searchInput = document.getElementById("tag-search");

    const entries = Object.entries(tags);
    const searchTerm = (searchInput.value || "").toLowerCase();

    // Filter by search term
    const filtered = entries.filter(([username]) =>
      username.includes(searchTerm)
    );

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b[1].timestamp - a[1].timestamp);

    countSpan.textContent = entries.length;
    maxSpan.textContent = config.maxTags || 500;

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      document.getElementById("tags-table").style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    document.getElementById("tags-table").style.display = "table";

    tbody.innerHTML = filtered
      .map(([username, data]) => {
        const dateDisplay = formatDate(data.timestamp);

        return `
      <tr data-username="${escapeHtml(username)}">
        <td class="username-cell">
          <a href="https://old.reddit.com/user/${escapeHtml(username)}"
             target="_blank"
             rel="noopener">
            u/${escapeHtml(username)}
          </a>
        </td>
        <td>
          <span class="tag-badge-preview" style="background: ${data.color}">
            ${escapeHtml(data.text)}
          </span>
        </td>
        <td>
          <span class="tag-color-preview" style="background: ${data.color}"></span>
        </td>
        <td>${dateDisplay}</td>
        <td>
          <button class="edit-tag secondary-button"
                  data-username="${escapeHtml(username)}"
                  title="Edit tag">
            Edit
          </button>
          <button class="delete-tag secondary-button"
                  data-username="${escapeHtml(username)}"
                  title="Delete tag">
            Delete
          </button>
        </td>
      </tr>
    `;
      })
      .join("");

    // Attach edit handlers
    tbody.querySelectorAll(".edit-tag").forEach((btn) => {
      btn.addEventListener("click", handleEditTag);
    });

    // Attach delete handlers
    tbody.querySelectorAll(".delete-tag").forEach((btn) => {
      btn.addEventListener("click", handleDeleteTag);
    });
  }

  /**
   * Handle user tags toggle
   */
  async function handleUserTagsToggle(e) {
    const enabled = e.target.checked;
    const config = await window.Storage.getUserTags();
    config.enabled = enabled;
    await window.Storage.setUserTags(config);

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_TAGS" });
      }
    });
  }

  /**
   * Handle edit tag
   */
  async function handleEditTag(e) {
    const username = e.target.dataset.username;
    const tag = await window.Storage.getUserTag(username);

    if (!tag) {
      alert("Tag not found");
      return;
    }

    const newText = prompt(`Edit tag for u/${username}:`, tag.text);
    if (newText === null) return; // Cancelled

    if (!newText.trim()) {
      alert("Tag text cannot be empty");
      return;
    }

    await window.Storage.setUserTag(username, {
      text: newText.trim(),
      color: tag.color,
    });

    await refreshUserTagsList();

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_USER_TAG",
          username: username,
        });
      }
    });
  }

  /**
   * Handle delete individual tag
   */
  async function handleDeleteTag(e) {
    const username = e.target.dataset.username;

    if (!confirm(`Delete tag for u/${username}?`)) {
      return;
    }

    await window.Storage.deleteUserTag(username);
    await refreshUserTagsList();

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_USER_TAG",
          username: username,
        });
      }
    });
  }

  /**
   * Handle clear all tags
   */
  async function handleClearAllTags() {
    const config = await window.Storage.getUserTags();
    const count = Object.keys(config.tags || {}).length;

    if (count === 0) {
      alert("No tags to clear.");
      return;
    }

    if (
      !confirm(`Clear all ${count} saved user tags? This cannot be undone.`)
    ) {
      return;
    }

    await window.Storage.clearUserTags();
    await refreshUserTagsList();

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_TAGS" });
      }
    });
  }

  /**
   * Handle export tags
   */
  async function handleExportTags() {
    const config = await window.Storage.getUserTags();
    const tags = config.tags || {};
    const json = JSON.stringify(tags, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `user-tags-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Handle import tags
   */
  async function handleImportTags() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        // Validate structure
        if (typeof imported !== "object" || imported === null) {
          throw new Error("Invalid format");
        }

        const config = await window.Storage.getUserTags();
        config.tags = { ...config.tags, ...imported };

        await window.Storage.setUserTags(config);
        await refreshUserTagsList();

        alert(`Imported ${Object.keys(imported).length} tags`);

        // Notify content script to refresh
        chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_TAGS" });
          }
        });
      } catch (err) {
        alert("Failed to import tags: " + err.message);
      }
    };

    input.click();
  }

  /**
   * Load muted users settings
   */
  async function loadMutedUsers() {
    const config = await window.Storage.getMutedUsers();

    // Set toggle state
    document.getElementById("user-muting-enabled").checked =
      config.enabled !== false;

    // Refresh the list
    await refreshMutedUsersList();
  }

  /**
   * Refresh the muted users list
   */
  async function refreshMutedUsersList() {
    const config = await window.Storage.getMutedUsers();
    const users = config.users || {};
    const listContainer = document.getElementById("muted-users-list");
    const emptyState = document.getElementById("muted-users-empty");
    const countSpan = document.getElementById("muted-users-count");

    const entries = Object.entries(users);

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);

    countSpan.textContent = entries.length;

    if (entries.length === 0) {
      listContainer.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    listContainer.innerHTML = entries
      .map(([username, data]) => {
        const dateDisplay = formatDate(data.timestamp);
        const reason = data.reason ? escapeHtml(data.reason) : "No reason";

        return `
        <div class="item-row" data-username="${escapeHtml(username)}">
          <div class="item-info">
            <a href="https://old.reddit.com/user/${escapeHtml(username)}"
               target="_blank"
               rel="noopener"
               class="item-link">
              u/${escapeHtml(username)}
            </a>
            <span class="item-meta">${reason} &middot; ${dateDisplay}</span>
          </div>
          <button class="button secondary remove-muted-user"
                  data-username="${escapeHtml(username)}">
            Unmute
          </button>
        </div>
      `;
      })
      .join("");

    // Attach delete handlers
    listContainer.querySelectorAll(".remove-muted-user").forEach((btn) => {
      btn.addEventListener("click", handleRemoveMutedUser);
    });
  }

  /**
   * Handle user muting toggle
   */
  async function handleUserMutingToggle(e) {
    const enabled = e.target.checked;
    const config = await window.Storage.getMutedUsers();
    config.enabled = enabled;
    await window.Storage.setMutedUsers(config);

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_MUTING" });
      }
    });
  }

  /**
   * Handle add muted user
   */
  async function handleAddMutedUser() {
    const usernameInput = document.getElementById("new-muted-user");
    const reasonInput = document.getElementById("mute-reason");
    const username = usernameInput.value.trim().replace(/^u\//, "");
    const reason = reasonInput.value.trim();

    if (!username) {
      alert("Please enter a username");
      return;
    }

    await window.Storage.setMutedUser(username, {
      reason: reason || "No reason",
    });

    usernameInput.value = "";
    reasonInput.value = "";
    await refreshMutedUsersList();

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_MUTING" });
      }
    });
  }

  /**
   * Handle remove individual muted user
   */
  async function handleRemoveMutedUser(e) {
    const username = e.target.dataset.username;

    if (!confirm(`Unmute u/${username}?`)) {
      return;
    }

    await window.Storage.deleteMutedUser(username);
    await refreshMutedUsersList();

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_MUTING" });
      }
    });
  }

  /**
   * Handle clear all muted users
   */
  async function handleClearAllMutedUsers() {
    const config = await window.Storage.getMutedUsers();
    const count = Object.keys(config.users || {}).length;

    if (count === 0) {
      alert("No muted users to clear.");
      return;
    }

    if (!confirm(`Unmute all ${count} users? This cannot be undone.`)) {
      return;
    }

    await window.Storage.clearMutedUsers();
    await refreshMutedUsersList();

    // Notify content script to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_MUTING" });
      }
    });
  }

  /**
   * Handle export muted users
   */
  async function handleExportMutedUsers() {
    const config = await window.Storage.getMutedUsers();
    const users = config.users || {};
    const json = JSON.stringify(users, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `muted-users-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Handle import muted users
   */
  async function handleImportMutedUsers() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        // Validate structure
        if (typeof imported !== "object" || imported === null) {
          throw new Error("Invalid format");
        }

        const config = await window.Storage.getMutedUsers();
        config.users = { ...config.users, ...imported };

        await window.Storage.setMutedUsers(config);
        await refreshMutedUsersList();

        // Notify content script to refresh
        chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { type: "REFRESH_USER_MUTING" });
          }
        });
      } catch (err) {
        alert("Failed to import muted users: " + err.message);
      }
    };

    input.click();
  }

  /**
   * Load scroll positions settings
   */
  async function loadScrollPositions() {
    const config = await window.Storage.getScrollPositions();

    document.getElementById("scroll-positions-enabled").checked =
      config.enabled !== false;

    const count = Object.keys(config.positions || {}).length;
    document.getElementById("scroll-positions-count").textContent = count;
  }

  /**
   * Handle scroll positions toggle
   */
  async function handleScrollPositionsToggle(e) {
    const enabled = e.target.checked;
    const config = await window.Storage.getScrollPositions();
    config.enabled = enabled;
    await window.Storage.setScrollPositions(config);
  }

  /**
   * Handle clear scroll positions
   */
  async function handleClearScrollPositions() {
    if (!confirm("Clear all saved scroll positions?")) return;

    await window.Storage.clearScrollPositions();
    await loadScrollPositions();
  }

  /**
   * Load feed enhancements settings
   */
  async function loadFeedEnhancements() {
    const config = await window.Storage.getFeedEnhancements();

    elements.feedCompactMode.checked = config.compactMode || false;
    elements.feedTextOnly.checked = config.textOnlyMode || false;
    elements.feedUncropImages.checked = config.uncropImages || false;
    elements.feedHideJoin.checked = config.hideJoinButtons || false;
    elements.feedHideActions.checked = config.hideActionLinks || false;
    elements.customCSSEnabled.checked = config.customCSSEnabled || false;
    elements.customCSS.value = config.customCSS || "";
  }

  /**
   * Handle feed enhancement toggle
   */
  async function handleFeedEnhancementToggle(e) {
    const config = await window.Storage.getFeedEnhancements();

    if (e.target === elements.feedCompactMode) {
      config.compactMode = e.target.checked;
    } else if (e.target === elements.feedTextOnly) {
      config.textOnlyMode = e.target.checked;
    } else if (e.target === elements.feedUncropImages) {
      config.uncropImages = e.target.checked;
    } else if (e.target === elements.feedHideJoin) {
      config.hideJoinButtons = e.target.checked;
    } else if (e.target === elements.feedHideActions) {
      config.hideActionLinks = e.target.checked;
    } else if (e.target === elements.customCSSEnabled) {
      config.customCSSEnabled = e.target.checked;
    }

    await window.Storage.setFeedEnhancements(config);

    // Notify content scripts to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_FEED_ENHANCEMENTS",
        });
      });
    });

    showToast("Feed enhancements updated");
  }

  /**
   * Handle save custom CSS
   */
  async function handleSaveCustomCSS() {
    const css = elements.customCSS.value.trim();
    const config = await window.Storage.getFeedEnhancements();

    config.customCSS = css;
    await window.Storage.setFeedEnhancements(config);

    // Notify content scripts to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_FEED_ENHANCEMENTS",
        });
      });
    });

    showToast("Custom CSS saved");
  }

  /**
   * Handle clear custom CSS
   */
  async function handleClearCustomCSS() {
    if (!confirm("Clear custom CSS?")) return;

    elements.customCSS.value = "";
    const config = await window.Storage.getFeedEnhancements();
    config.customCSS = "";
    await window.Storage.setFeedEnhancements(config);

    // Notify content scripts to refresh
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_FEED_ENHANCEMENTS",
        });
      });
    });

    showToast("Custom CSS cleared");
  }

  /**
   * Handle validate custom CSS
   */
  async function handleValidateCustomCSS() {
    const css = elements.customCSS.value.trim();

    if (!css) {
      showToast("No CSS to validate", "error");
      return;
    }

    try {
      // Basic CSS validation by trying to create a style element
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      document.head.removeChild(style);

      showToast("CSS is valid!", "success");
    } catch (error) {
      showToast("CSS validation failed: " + error.message, "error");
    }
  }

  /**
   * ============================================================================
   * STORAGE MANAGEMENT (Phase 6)
   * Monitor storage usage and perform cleanup operations
   * ============================================================================
   */

  /**
   * Load storage management section
   */
  async function loadStorageManagement() {
    await refreshStorageStats();
  }

  /**
   * Refresh storage statistics display
   */
  async function refreshStorageStats() {
    try {
      // Get storage usage and health report
      const usage = await window.Storage.getStorageUsage();
      const healthReport = await window.Storage.getStorageHealthReport();

      // Update local storage meter
      if (elements.localStorageValue) {
        const localKB = (usage.local.used / 1024).toFixed(1);
        const localMB = (usage.local.quota / 1024 / 1024).toFixed(0);
        elements.localStorageValue.textContent = `${localKB} KB / ${localMB} MB`;
      }
      if (elements.localStorageBar) {
        elements.localStorageBar.style.width = `${usage.local.percentage}%`;
        elements.localStorageBar.className = `progress-fill ${getProgressClass(usage.local.percentage)}`;
      }

      // Update sync storage meter
      if (elements.syncStorageValue) {
        const syncKB = (usage.sync.used / 1024).toFixed(1);
        const quotaKB = (usage.sync.quota / 1024).toFixed(0);
        elements.syncStorageValue.textContent = `${syncKB} KB / ${quotaKB} KB`;
      }
      if (elements.syncStorageBar) {
        elements.syncStorageBar.style.width = `${usage.sync.percentage}%`;
        elements.syncStorageBar.className = `progress-fill ${getProgressClass(usage.sync.percentage)}`;
      }

      // Update storage breakdown
      if (elements.storageBreakdownGrid) {
        const breakdown = usage.breakdown;
        const items = Object.entries(breakdown)
          .filter(([key]) => !key.startsWith("_"))
          .slice(0, 8) // Top 8 items
          .map(([key, bytes]) => {
            const kb = (bytes / 1024).toFixed(1);
            return `
              <div class="breakdown-item">
                <span class="breakdown-key">${formatStorageKey(key)}</span>
                <span class="breakdown-value">${kb} KB</span>
              </div>
            `;
          })
          .join("");

        elements.storageBreakdownGrid.innerHTML = items || "<p>No data</p>";
      }

      // Update feature counts
      if (healthReport.counts) {
        const counts = healthReport.counts;
        if (elements.countUserTags) {
          elements.countUserTags.textContent = `${counts.userTags}/500`;
        }
        if (elements.countMutedUsers) {
          elements.countMutedUsers.textContent = `${counts.mutedUsers}/500`;
        }
        if (elements.countSortPrefs) {
          elements.countSortPrefs.textContent = `${counts.sortPreferences}/100`;
        }
        if (elements.countScrollPos) {
          elements.countScrollPos.textContent = `${counts.scrollPositions}/100`;
        }
        if (elements.countPresets) {
          elements.countPresets.textContent = `${counts.layoutPresets}/20`;
        }
        if (elements.countMutedSubs) {
          elements.countMutedSubs.textContent = `${counts.mutedSubreddits}/100`;
        }
      }

      // Update health banner
      updateStorageHealthBanner(healthReport);
    } catch (error) {
      console.error("[ORR] Failed to load storage stats:", error);
    }
  }

  /**
   * Get progress bar class based on percentage
   */
  function getProgressClass(percentage) {
    if (percentage >= 90) return "critical";
    if (percentage >= 70) return "warning";
    return "";
  }

  /**
   * Format storage key for display
   */
  function formatStorageKey(key) {
    const keyNames = {
      stats: "Statistics",
      userTags: "User Tags",
      mutedUsers: "Muted Users",
      sortPreferences: "Sort Prefs",
      scrollPositions: "Scroll Pos",
      keyboardShortcuts: "Shortcuts",
      layoutPresets: "Presets",
      contentFiltering: "Filtering",
      subredditOverrides: "Overrides",
      darkMode: "Dark Mode",
      nagBlocking: "Nag Block",
      commentEnhancements: "Comments",
      feedEnhancements: "Feed",
      privacy: "Privacy",
      ui: "UI",
      frontend: "Frontend",
    };
    return keyNames[key] || key;
  }

  /**
   * Update storage health banner
   */
  function updateStorageHealthBanner(healthReport) {
    if (!elements.storageHealthBanner) return;

    if (healthReport.status === "healthy") {
      elements.storageHealthBanner.style.display = "none";
      return;
    }

    elements.storageHealthBanner.style.display = "flex";
    elements.storageHealthBanner.className = `health-banner ${healthReport.status}`;

    if (elements.storageHealthIcon) {
      elements.storageHealthIcon.textContent =
        healthReport.status === "critical" ? "⚠️" : "⚡";
    }

    if (elements.storageHealthMessage) {
      elements.storageHealthMessage.textContent =
        healthReport.issues.join(". ");
    }
  }

  /**
   * Run storage cleanup
   */
  async function handleStorageCleanup() {
    try {
      if (elements.runStorageCleanup) {
        elements.runStorageCleanup.disabled = true;
        elements.runStorageCleanup.textContent = "Cleaning...";
      }

      const results = await window.Storage.cleanupExpiredData();

      // Show results
      if (elements.cleanupResult) {
        const bytesFree = (results.totalBytesFreed / 1024).toFixed(1);
        const items = results.scrollPositions + results.sortPreferences;

        if (results.totalBytesFreed > 0) {
          elements.cleanupResult.textContent = `Cleaned ${items} items, freed ${bytesFree} KB`;
          elements.cleanupResult.className = "cleanup-result success";
        } else {
          elements.cleanupResult.textContent = "No expired data to clean up";
          elements.cleanupResult.className = "cleanup-result";
        }
        elements.cleanupResult.style.display = "block";
      }

      // Refresh stats
      await refreshStorageStats();
      showToast("Cleanup completed", "success");
    } catch (error) {
      console.error("[ORR] Cleanup failed:", error);
      showToast("Cleanup failed: " + error.message, "error");
    } finally {
      if (elements.runStorageCleanup) {
        elements.runStorageCleanup.disabled = false;
        elements.runStorageCleanup.textContent = "Run Cleanup";
      }
    }
  }

  /**
   * Run full storage maintenance
   */
  async function handleStorageMaintenance() {
    try {
      if (elements.runStorageMaintenance) {
        elements.runStorageMaintenance.disabled = true;
        elements.runStorageMaintenance.textContent = "Running...";
      }

      const results = await window.Storage.runMaintenance();

      // Show results
      if (elements.cleanupResult) {
        const bytesFree = results.cleanup
          ? (results.cleanup.totalBytesFreed / 1024).toFixed(1)
          : "0";
        const compactBytes = results.compact
          ? (results.compact.bytesFreed / 1024).toFixed(1)
          : "0";

        elements.cleanupResult.textContent = `Maintenance complete. Freed: ${bytesFree} KB (cleanup) + ${compactBytes} KB (compact)`;
        elements.cleanupResult.className = "cleanup-result success";
        elements.cleanupResult.style.display = "block";
      }

      // Refresh stats
      await refreshStorageStats();
      showToast("Maintenance completed", "success");
    } catch (error) {
      console.error("[ORR] Maintenance failed:", error);
      showToast("Maintenance failed: " + error.message, "error");
    } finally {
      if (elements.runStorageMaintenance) {
        elements.runStorageMaintenance.disabled = false;
        elements.runStorageMaintenance.textContent = "Full Maintenance";
      }
    }
  }

  /**
   * Attach storage management event listeners
   */
  function attachStorageManagementListeners() {
    if (elements.runStorageCleanup) {
      elements.runStorageCleanup.addEventListener(
        "click",
        handleStorageCleanup
      );
    }
    if (elements.runStorageMaintenance) {
      elements.runStorageMaintenance.addEventListener(
        "click",
        handleStorageMaintenance
      );
    }
    if (elements.refreshStorageStats) {
      elements.refreshStorageStats.addEventListener("click", async () => {
        await refreshStorageStats();
        showToast("Storage stats refreshed", "success");
      });
    }
  }

  /**
   * ============================================================================
   * LAYOUT PRESETS
   * Save and manage layout presets for quick switching
   * ============================================================================
   */

  /**
   * Load layout presets settings
   */
  async function loadLayoutPresets() {
    const config = await window.Storage.getLayoutPresets();

    // Set toggle state
    if (elements.layoutPresetsEnabled) {
      elements.layoutPresetsEnabled.checked = config.enabled !== false;
    }

    // Update counts
    if (elements.presetCount) {
      elements.presetCount.textContent = Object.keys(
        config.presets || {}
      ).length;
    }
    if (elements.presetMax) {
      elements.presetMax.textContent = config.maxPresets || 20;
    }
    if (elements.mappingCount) {
      elements.mappingCount.textContent = Object.keys(
        config.subredditLayouts || {}
      ).length;
    }
    if (elements.mappingMax) {
      elements.mappingMax.textContent = config.maxSubredditMappings || 100;
    }

    // Refresh lists
    await refreshPresetsList();
    await refreshActivePresetSelect();
    await refreshMappingsList();
  }

  /**
   * Refresh the presets list table
   */
  async function refreshPresetsList() {
    const config = await window.Storage.getLayoutPresets();
    const presets = config.presets || {};
    const entries = Object.entries(presets);

    // Sort by timestamp (newest first)
    entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));

    // Update count
    if (elements.presetCount) {
      elements.presetCount.textContent = entries.length;
    }

    if (entries.length === 0) {
      if (elements.presetsTbody) elements.presetsTbody.innerHTML = "";
      if (elements.presetsEmpty) elements.presetsEmpty.style.display = "block";
      if (elements.presetsTable) elements.presetsTable.style.display = "none";
      return;
    }

    if (elements.presetsEmpty) elements.presetsEmpty.style.display = "none";
    if (elements.presetsTable) elements.presetsTable.style.display = "table";

    if (elements.presetsTbody) {
      elements.presetsTbody.innerHTML = entries
        .map(([name, data]) => {
          const settings = formatPresetSettings(data);
          const dateDisplay = formatDate(data.timestamp);
          const isActive = config.activePreset === name;

          return `
          <tr data-preset="${escapeHtml(name)}" class="${isActive ? "active-preset" : ""}">
            <td class="preset-name-cell">
              <span class="preset-name">${escapeHtml(name)}</span>
              ${isActive ? '<span class="active-badge">Active</span>' : ""}
            </td>
            <td class="preset-settings">${settings}</td>
            <td>${dateDisplay}</td>
            <td class="preset-actions">
              <button class="secondary-button apply-preset"
                      data-preset="${escapeHtml(name)}"
                      title="Apply this preset now">
                Apply
              </button>
              <button class="secondary-button edit-preset"
                      data-preset="${escapeHtml(name)}"
                      title="Edit preset settings">
                Edit
              </button>
              <button class="secondary-button delete-preset"
                      data-preset="${escapeHtml(name)}"
                      title="Delete preset">
                Delete
              </button>
            </td>
          </tr>
        `;
        })
        .join("");

      // Attach event handlers
      elements.presetsTbody.querySelectorAll(".apply-preset").forEach((btn) => {
        btn.addEventListener("click", handleApplyPreset);
      });
      elements.presetsTbody.querySelectorAll(".edit-preset").forEach((btn) => {
        btn.addEventListener("click", handleEditPreset);
      });
      elements.presetsTbody
        .querySelectorAll(".delete-preset")
        .forEach((btn) => {
          btn.addEventListener("click", handleDeletePreset);
        });
    }
  }

  /**
   * Format preset settings for display
   */
  function formatPresetSettings(data) {
    const features = [];
    if (data.darkMode) features.push("Dark");
    if (data.darkModeType === "oled") features.push("OLED");
    if (data.compactMode) features.push("Compact");
    if (data.textOnlyMode) features.push("Text-only");
    if (data.uncropImages) features.push("Uncrop");
    if (data.hideJoinButtons) features.push("No join");
    if (data.hideActionLinks) features.push("No actions");
    if (data.colorCodedComments) features.push("Color comments");
    if (data.customCSS) features.push("Custom CSS");

    return features.length > 0 ? features.join(", ") : "Default";
  }

  /**
   * Refresh the active preset dropdown
   */
  async function refreshActivePresetSelect() {
    const config = await window.Storage.getLayoutPresets();
    const presets = config.presets || {};
    const names = Object.keys(presets).sort();

    if (elements.activePresetSelect) {
      // Keep the first option (None)
      const firstOption = elements.activePresetSelect.options[0];
      elements.activePresetSelect.innerHTML = "";
      elements.activePresetSelect.appendChild(firstOption);

      // Add preset options
      names.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        elements.activePresetSelect.appendChild(option);
      });

      // Set current value
      elements.activePresetSelect.value = config.activePreset || "";
    }

    // Also update the mapping preset dropdown
    if (elements.mappingPreset) {
      const firstOption = elements.mappingPreset.options[0];
      elements.mappingPreset.innerHTML = "";
      elements.mappingPreset.appendChild(firstOption);

      names.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        elements.mappingPreset.appendChild(option);
      });
    }
  }

  /**
   * Refresh the subreddit mappings list
   */
  async function refreshMappingsList() {
    const config = await window.Storage.getLayoutPresets();
    const mappings = config.subredditLayouts || {};
    const entries = Object.entries(mappings);

    // Sort alphabetically
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    // Update count
    if (elements.mappingCount) {
      elements.mappingCount.textContent = entries.length;
    }

    if (entries.length === 0) {
      if (elements.mappingsTbody) elements.mappingsTbody.innerHTML = "";
      if (elements.mappingsEmpty)
        elements.mappingsEmpty.style.display = "block";
      if (elements.mappingsTable) elements.mappingsTable.style.display = "none";
      return;
    }

    if (elements.mappingsEmpty) elements.mappingsEmpty.style.display = "none";
    if (elements.mappingsTable) elements.mappingsTable.style.display = "table";

    if (elements.mappingsTbody) {
      elements.mappingsTbody.innerHTML = entries
        .map(([subreddit, presetName]) => {
          return `
          <tr data-subreddit="${escapeHtml(subreddit)}">
            <td>
              <a href="https://old.reddit.com/r/${escapeHtml(subreddit)}/"
                 target="_blank" rel="noopener">
                r/${escapeHtml(subreddit)}
              </a>
            </td>
            <td>${escapeHtml(presetName)}</td>
            <td>
              <button class="secondary-button delete-mapping"
                      data-subreddit="${escapeHtml(subreddit)}"
                      title="Remove mapping">
                Remove
              </button>
            </td>
          </tr>
        `;
        })
        .join("");

      // Attach event handlers
      elements.mappingsTbody
        .querySelectorAll(".delete-mapping")
        .forEach((btn) => {
          btn.addEventListener("click", handleDeleteMapping);
        });
    }
  }

  /**
   * Handle layout presets toggle
   */
  async function handleLayoutPresetsToggle(e) {
    const config = await window.Storage.getLayoutPresets();
    config.enabled = e.target.checked;
    await window.Storage.setLayoutPresets(config);

    // Notify content scripts
    notifyContentScripts("REFRESH_LAYOUT_PRESETS");
    showToast(`Layout presets ${config.enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Handle create preset from current settings
   */
  async function handleCreatePreset() {
    const name = elements.newPresetName?.value.trim();

    if (!name) {
      showToast("Please enter a preset name", "error");
      return;
    }

    if (name.length > 50) {
      showToast("Preset name is too long (max 50 characters)", "error");
      return;
    }

    // Check if preset already exists
    const existing = await window.Storage.getLayoutPreset(name);
    if (existing) {
      if (!confirm(`Preset "${name}" already exists. Overwrite it?`)) {
        return;
      }
    }

    // Get current settings
    const feedConfig = await window.Storage.getFeedEnhancements();
    const darkModeConfig = await window.Storage.getDarkMode();
    const commentConfig = await window.Storage.getCommentEnhancements();

    const presetData = {
      darkMode:
        darkModeConfig.enabled === "dark" || darkModeConfig.enabled === "oled",
      darkModeType: darkModeConfig.enabled === "oled" ? "oled" : "dark",
      compactMode: feedConfig.compactMode || false,
      textOnlyMode: feedConfig.textOnlyMode || false,
      uncropImages: feedConfig.uncropImages || false,
      hideJoinButtons: feedConfig.hideJoinButtons || false,
      hideActionLinks: feedConfig.hideActionLinks || false,
      colorCodedComments: commentConfig.colorCodedComments !== false,
      colorPalette: commentConfig.colorPalette || "standard",
      customCSS: feedConfig.customCSS || "",
    };

    await window.Storage.setLayoutPreset(name, presetData);

    // Clear input
    if (elements.newPresetName) {
      elements.newPresetName.value = "";
    }

    // Refresh UI
    await loadLayoutPresets();
    showToast(`Preset "${name}" created`);
  }

  /**
   * Handle apply preset
   */
  async function handleApplyPreset(e) {
    const presetName = e.target.dataset.preset;
    await applyPresetToCurrentSettings(presetName);
    showToast(`Preset "${presetName}" applied`);
  }

  /**
   * Apply a preset to current settings
   */
  async function applyPresetToCurrentSettings(presetName) {
    const preset = await window.Storage.getLayoutPreset(presetName);
    if (!preset) {
      showToast(`Preset "${presetName}" not found`, "error");
      return;
    }

    // Apply dark mode settings
    const darkModeConfig = await window.Storage.getDarkMode();
    if (preset.darkMode) {
      darkModeConfig.enabled = preset.darkModeType || "dark";
    } else {
      darkModeConfig.enabled = "light";
    }
    await window.Storage.setDarkMode(darkModeConfig);

    // Apply feed enhancements
    const feedConfig = await window.Storage.getFeedEnhancements();
    feedConfig.compactMode = preset.compactMode || false;
    feedConfig.textOnlyMode = preset.textOnlyMode || false;
    feedConfig.uncropImages = preset.uncropImages || false;
    feedConfig.hideJoinButtons = preset.hideJoinButtons || false;
    feedConfig.hideActionLinks = preset.hideActionLinks || false;
    if (preset.customCSS) {
      feedConfig.customCSS = preset.customCSS;
      feedConfig.customCSSEnabled = true;
    }
    await window.Storage.setFeedEnhancements(feedConfig);

    // Apply comment enhancements
    const commentConfig = await window.Storage.getCommentEnhancements();
    commentConfig.colorCodedComments = preset.colorCodedComments !== false;
    commentConfig.colorPalette = preset.colorPalette || "standard";
    await window.Storage.setCommentEnhancements(commentConfig);

    // Set as active preset
    await window.Storage.setActivePreset(presetName);

    // Reload settings in UI
    await loadDarkModeSettings();
    await loadFeedEnhancements();
    await loadCommentEnhancementsSettings();
    await refreshPresetsList();
    await refreshActivePresetSelect();

    // Notify content scripts
    notifyContentScripts("REFRESH_DARK_MODE");
    notifyContentScripts("REFRESH_FEED_ENHANCEMENTS");
    notifyContentScripts("REFRESH_COLOR_CODED_COMMENTS");
  }

  /**
   * Handle edit preset
   */
  async function handleEditPreset(e) {
    const presetName = e.target.dataset.preset;
    const preset = await window.Storage.getLayoutPreset(presetName);

    if (!preset) {
      showToast(`Preset "${presetName}" not found`, "error");
      return;
    }

    // Show modal
    const modal = document.getElementById("preset-edit-modal");
    if (!modal) return;

    // Populate fields
    document.getElementById("preset-edit-name").value = presetName;
    document.getElementById("preset-dark-mode").checked =
      preset.darkMode || false;
    document.getElementById("preset-dark-mode-type").value =
      preset.darkModeType || "dark";
    document.getElementById("preset-compact-mode").checked =
      preset.compactMode || false;
    document.getElementById("preset-text-only").checked =
      preset.textOnlyMode || false;
    document.getElementById("preset-uncrop-images").checked =
      preset.uncropImages || false;
    document.getElementById("preset-hide-join").checked =
      preset.hideJoinButtons || false;
    document.getElementById("preset-hide-actions").checked =
      preset.hideActionLinks || false;
    document.getElementById("preset-color-comments").checked =
      preset.colorCodedComments !== false;
    document.getElementById("preset-color-palette").value =
      preset.colorPalette || "standard";
    document.getElementById("preset-custom-css").value = preset.customCSS || "";

    // Store original name for rename detection
    modal.dataset.originalName = presetName;

    // Show modal
    modal.style.display = "flex";
  }

  /**
   * Handle save preset from edit modal
   */
  async function handleSavePresetEdit() {
    const modal = document.getElementById("preset-edit-modal");
    if (!modal) return;

    const originalName = modal.dataset.originalName;
    const newName = document.getElementById("preset-edit-name").value.trim();

    if (!newName) {
      showToast("Preset name is required", "error");
      return;
    }

    // Check for rename collision
    if (newName !== originalName) {
      const existing = await window.Storage.getLayoutPreset(newName);
      if (existing) {
        showToast(`Preset "${newName}" already exists`, "error");
        return;
      }
    }

    const presetData = {
      darkMode: document.getElementById("preset-dark-mode").checked,
      darkModeType: document.getElementById("preset-dark-mode-type").value,
      compactMode: document.getElementById("preset-compact-mode").checked,
      textOnlyMode: document.getElementById("preset-text-only").checked,
      uncropImages: document.getElementById("preset-uncrop-images").checked,
      hideJoinButtons: document.getElementById("preset-hide-join").checked,
      hideActionLinks: document.getElementById("preset-hide-actions").checked,
      colorCodedComments: document.getElementById("preset-color-comments")
        .checked,
      colorPalette: document.getElementById("preset-color-palette").value,
      customCSS: document.getElementById("preset-custom-css").value,
    };

    // If renamed, delete old and create new
    if (newName !== originalName) {
      await window.Storage.deleteLayoutPreset(originalName);
    }

    await window.Storage.setLayoutPreset(newName, presetData);

    // Close modal
    modal.style.display = "none";

    // Refresh UI
    await loadLayoutPresets();
    showToast(`Preset "${newName}" saved`);
  }

  /**
   * Handle delete preset
   */
  async function handleDeletePreset(e) {
    const presetName = e.target.dataset.preset;

    if (!confirm(`Delete preset "${presetName}"? This cannot be undone.`)) {
      return;
    }

    await window.Storage.deleteLayoutPreset(presetName);
    await loadLayoutPresets();
    showToast(`Preset "${presetName}" deleted`);
  }

  /**
   * Handle active preset change
   */
  async function handleActivePresetChange(e) {
    const presetName = e.target.value || null;

    if (presetName) {
      await applyPresetToCurrentSettings(presetName);
    } else {
      await window.Storage.setActivePreset(null);
      await refreshPresetsList();
    }
  }

  /**
   * Handle add subreddit mapping
   */
  async function handleAddMapping() {
    const subreddit = elements.mappingSubreddit?.value
      .trim()
      .toLowerCase()
      .replace(/^r\//, "");
    const presetName = elements.mappingPreset?.value;

    if (!subreddit) {
      showToast("Please enter a subreddit name", "error");
      return;
    }

    if (!presetName) {
      showToast("Please select a preset", "error");
      return;
    }

    try {
      await window.Storage.setSubredditLayout(subreddit, presetName);

      // Clear inputs
      if (elements.mappingSubreddit) elements.mappingSubreddit.value = "";
      if (elements.mappingPreset) elements.mappingPreset.value = "";

      await refreshMappingsList();
      notifyContentScripts("REFRESH_LAYOUT_PRESETS");
      showToast(`Layout set for r/${subreddit}`);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  /**
   * Handle delete subreddit mapping
   */
  async function handleDeleteMapping(e) {
    const subreddit = e.target.dataset.subreddit;

    if (!confirm(`Remove layout for r/${subreddit}?`)) {
      return;
    }

    await window.Storage.deleteSubredditLayout(subreddit);
    await refreshMappingsList();
    notifyContentScripts("REFRESH_LAYOUT_PRESETS");
    showToast(`Layout removed for r/${subreddit}`);
  }

  /**
   * Handle clear all mappings
   */
  async function handleClearAllMappings() {
    const config = await window.Storage.getLayoutPresets();
    const count = Object.keys(config.subredditLayouts || {}).length;

    if (count === 0) {
      showToast("No mappings to clear");
      return;
    }

    if (!confirm(`Clear all ${count} subreddit layout mappings?`)) {
      return;
    }

    await window.Storage.clearSubredditLayouts();
    await refreshMappingsList();
    notifyContentScripts("REFRESH_LAYOUT_PRESETS");
    showToast("All subreddit mappings cleared");
  }

  /**
   * Handle clear all presets
   */
  async function handleClearAllPresets() {
    const config = await window.Storage.getLayoutPresets();
    const count = Object.keys(config.presets || {}).length;

    if (count === 0) {
      showToast("No presets to clear");
      return;
    }

    if (
      !confirm(
        `Clear all ${count} presets and their subreddit mappings? This cannot be undone.`
      )
    ) {
      return;
    }

    await window.Storage.clearLayoutPresets();
    await loadLayoutPresets();
    showToast("All presets cleared");
  }

  /**
   * Handle export presets
   */
  async function handleExportPresets() {
    const config = await window.Storage.getLayoutPresets();
    const exportData = {
      _exportVersion: 1,
      _exportDate: new Date().toISOString(),
      presets: config.presets || {},
      subredditLayouts: config.subredditLayouts || {},
      activePreset: config.activePreset,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `layout-presets-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast("Presets exported");
  }

  /**
   * Handle import presets
   */
  async function handleImportPresets() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        // Validate structure
        if (!imported.presets || typeof imported.presets !== "object") {
          throw new Error("Invalid format: missing presets");
        }

        const config = await window.Storage.getLayoutPresets();

        // Merge presets
        config.presets = { ...config.presets, ...imported.presets };

        // Merge subreddit layouts if present
        if (imported.subredditLayouts) {
          config.subredditLayouts = {
            ...config.subredditLayouts,
            ...imported.subredditLayouts,
          };
        }

        await window.Storage.setLayoutPresets(config);
        await loadLayoutPresets();

        const presetCount = Object.keys(imported.presets).length;
        showToast(
          `Imported ${presetCount} preset${presetCount !== 1 ? "s" : ""}`
        );
      } catch (err) {
        showToast("Failed to import: " + err.message, "error");
      }
    };

    input.click();
  }

  /**
   * Notify content scripts of changes
   */
  function notifyContentScripts(messageType, data = {}) {
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: messageType, ...data });
      });
    });
  }

  /**
   * Initialize layout presets event listeners
   */
  function initLayoutPresetsListeners() {
    // Toggle
    if (elements.layoutPresetsEnabled) {
      elements.layoutPresetsEnabled.addEventListener(
        "change",
        handleLayoutPresetsToggle
      );
    }

    // Create preset
    if (elements.createPresetBtn) {
      elements.createPresetBtn.addEventListener("click", handleCreatePreset);
    }

    // Active preset
    if (elements.activePresetSelect) {
      elements.activePresetSelect.addEventListener(
        "change",
        handleActivePresetChange
      );
    }

    // Add mapping
    if (elements.addMappingBtn) {
      elements.addMappingBtn.addEventListener("click", handleAddMapping);
    }

    // Clear all mappings
    if (elements.clearAllMappings) {
      elements.clearAllMappings.addEventListener(
        "click",
        handleClearAllMappings
      );
    }

    // Clear all presets
    if (elements.clearAllPresets) {
      elements.clearAllPresets.addEventListener("click", handleClearAllPresets);
    }

    // Export/Import
    if (elements.exportPresets) {
      elements.exportPresets.addEventListener("click", handleExportPresets);
    }
    if (elements.importPresets) {
      elements.importPresets.addEventListener("click", handleImportPresets);
    }

    // Preset edit modal
    const modal = document.getElementById("preset-edit-modal");
    if (modal) {
      const closeBtn = document.getElementById("preset-edit-close");
      const saveBtn = document.getElementById("preset-edit-save");
      const cancelBtn = document.getElementById("preset-edit-cancel");

      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          modal.style.display = "none";
        });
      }
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          modal.style.display = "none";
        });
      }
      if (saveBtn) {
        saveBtn.addEventListener("click", handleSavePresetEdit);
      }

      // Close on overlay click
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    }
  }

  /**
   * Load privacy settings
   */
  async function loadPrivacySettings() {
    const privacy = await window.Storage.getPrivacy();
    const stats = await window.Storage.getTrackingStats();

    // Toggles
    elements.trackingRemovalEnabled.checked = privacy.removeTracking !== false;
    elements.trackingBadgeEnabled.checked = privacy.showTrackingBadge !== false;

    // Referrer policy
    const policy = privacy.referrerPolicy || "same-origin";
    if (policy === "default") {
      elements.referrerDefault.checked = true;
    } else if (policy === "same-origin") {
      elements.referrerSameOrigin.checked = true;
    } else if (policy === "origin") {
      elements.referrerOrigin.checked = true;
    } else if (policy === "no-referrer") {
      elements.referrerNoReferrer.checked = true;
    }

    // Tracking parameters
    const params = privacy.trackingParams || [];
    elements.trackingParams.value = params.join("\n");

    // Statistics by category
    elements.trackingTotalCleaned.textContent = formatNumber(
      stats.totalCleaned || 0
    );
    elements.trackingLastCleaned.textContent = stats.lastCleaned
      ? new Date(stats.lastCleaned).toLocaleString()
      : "Never";
    elements.trackingUtmCount.textContent = formatNumber(
      stats.byType?.utm || 0
    );
    if (elements.trackingSocialCount) {
      elements.trackingSocialCount.textContent = formatNumber(
        stats.byType?.social || 0
      );
    }
    if (elements.trackingAnalyticsCount) {
      elements.trackingAnalyticsCount.textContent = formatNumber(
        stats.byType?.analytics || 0
      );
    }
    if (elements.trackingAffiliateCount) {
      elements.trackingAffiliateCount.textContent = formatNumber(
        stats.byType?.affiliate || 0
      );
    }
    if (elements.trackingRedditCount) {
      elements.trackingRedditCount.textContent = formatNumber(
        stats.byType?.reddit || 0
      );
    }
    elements.trackingOtherCount.textContent = formatNumber(
      stats.byType?.other || 0
    );

    // Load privacy score
    await updatePrivacyScore();
  }

  /**
   * Update privacy score display
   */
  async function updatePrivacyScore() {
    if (!elements.privacyScoreValue) return;

    const score = await window.Storage.getPrivacyScore();
    const recommendations = await window.Storage.getPrivacyRecommendations();

    // Update score value
    elements.privacyScoreValue.textContent = score;

    // Update circle fill (100 = full circle)
    if (elements.privacyScoreFill) {
      elements.privacyScoreFill.style.strokeDasharray = `${score}, 100`;

      // Update color class based on score
      elements.privacyScoreFill.classList.remove(
        "score-low",
        "score-medium",
        "score-high"
      );
      if (score < 40) {
        elements.privacyScoreFill.classList.add("score-low");
      } else if (score < 70) {
        elements.privacyScoreFill.classList.add("score-medium");
      } else {
        elements.privacyScoreFill.classList.add("score-high");
      }
    }

    // Update status text
    if (elements.privacyScoreStatus) {
      let statusText = "";
      let statusClass = "";
      if (score < 40) {
        statusText = "Needs improvement";
        statusClass = "score-low";
      } else if (score < 70) {
        statusText = "Good protection";
        statusClass = "score-medium";
      } else {
        statusText = "Excellent protection";
        statusClass = "score-high";
      }
      elements.privacyScoreStatus.textContent = statusText;
      elements.privacyScoreStatus.className =
        "privacy-score-status " + statusClass;
    }

    // Update recommendations
    if (elements.privacyRecommendations && recommendations.length > 0) {
      const html =
        "<strong>Tips:</strong><ul>" +
        recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join("") +
        "</ul>";
      elements.privacyRecommendations.innerHTML = html;
    } else if (elements.privacyRecommendations) {
      elements.privacyRecommendations.innerHTML = "";
    }
  }

  /**
   * Export privacy report as JSON
   */
  async function exportPrivacyReport() {
    const report = await window.Storage.getPrivacyReport();

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privacy-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Privacy report exported");
  }

  /**
   * Handle privacy toggle
   */
  async function handlePrivacyToggle(e) {
    const privacy = await window.Storage.getPrivacy();

    if (e.target === elements.trackingRemovalEnabled) {
      privacy.removeTracking = e.target.checked;
    } else if (e.target === elements.trackingBadgeEnabled) {
      privacy.showTrackingBadge = e.target.checked;
    }

    await window.Storage.setPrivacy(privacy);

    // Update privacy score
    await updatePrivacyScore();

    // Notify content scripts
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_PRIVACY",
          privacy: privacy,
        });
      });
    });

    showToast("Privacy settings updated");
  }

  /**
   * Handle referrer policy change
   */
  async function handleReferrerPolicyChange(e) {
    const privacy = await window.Storage.getPrivacy();
    privacy.referrerPolicy = e.target.value;

    await window.Storage.setPrivacy(privacy);

    // Update privacy score
    await updatePrivacyScore();

    // Notify content scripts
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "REFRESH_PRIVACY",
          privacy: privacy,
        });
      });
    });

    showToast("Referrer policy updated");
  }

  /**
   * Handle save tracking parameters
   */
  async function handleSaveTrackingParams() {
    const text = elements.trackingParams.value.trim();
    const params = text
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (params.length === 0) {
      showToast("Please enter at least one tracking parameter", "error");
      return;
    }

    const privacy = await window.Storage.getPrivacy();
    privacy.trackingParams = params;

    await window.Storage.setPrivacy(privacy);

    showToast(`Saved ${params.length} tracking parameters`);
  }

  /**
   * Handle reset tracking parameters to defaults
   */
  async function handleResetTrackingParams() {
    if (!confirm("Reset tracking parameters to defaults?")) return;

    const privacy = await window.Storage.getPrivacy();

    // Get default tracking params from storage.js defaults
    const defaults = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_name",
      "utm_cid",
      "fbclid",
      "gclid",
      "msclkid",
      "twclid",
      "li_fat_id",
      "igshid",
      "ref",
      "ref_source",
      "ref_url",
      "referrer",
      "share_id",
      "shared",
      "click_id",
      "clickid",
      "_ga",
      "rdt_cid",
      "$deep_link",
      "$3p",
      "_branch_match_id",
      "_branch_referrer",
      "mc_cid",
      "mc_eid",
      "yclid",
      "zanpid",
      "rb_clickid",
    ];

    privacy.trackingParams = defaults;
    await window.Storage.setPrivacy(privacy);

    elements.trackingParams.value = defaults.join("\n");

    showToast("Tracking parameters reset to defaults");
  }

  /**
   * Handle clear tracking statistics
   */
  async function handleClearTrackingStats() {
    if (!confirm("Clear all tracking statistics?")) return;

    await window.Storage.clearTrackingStats();
    await loadPrivacySettings();

    showToast("Tracking statistics cleared");
  }

  /**
   * Load nag blocking settings
   */
  async function loadNagBlockingSettings() {
    const nagBlocking = await window.Storage.getNagBlocking();

    elements.nagBlockingEnabled.checked = nagBlocking.enabled !== false;
    elements.blockLoginPrompts.checked =
      nagBlocking.blockLoginPrompts !== false;
    elements.blockEmailVerification.checked =
      nagBlocking.blockEmailVerification !== false;
    elements.blockPremiumBanners.checked =
      nagBlocking.blockPremiumBanners !== false;
    elements.blockAppPrompts.checked = nagBlocking.blockAppPrompts !== false;
    // v11.2.0: Advanced content blocking
    elements.blockAIContent.checked = nagBlocking.blockAIContent !== false;
    elements.blockTrending.checked = nagBlocking.blockTrending !== false;
    elements.blockRecommended.checked = nagBlocking.blockRecommended !== false;
    elements.blockCommunityHighlights.checked =
      nagBlocking.blockCommunityHighlights !== false;
    elements.blockMorePosts.checked = nagBlocking.blockMorePosts !== false;
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

    // v12.1.0: Advanced filtering options
    if (document.getElementById("use-regex")) {
      document.getElementById("use-regex").checked =
        filtering.useRegex || false;
    }
    if (document.getElementById("filter-content")) {
      document.getElementById("filter-content").checked =
        filtering.filterContent || false;
    }

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
   * Load flair filtering settings
   */
  async function loadFlairFiltering() {
    const filtering = await window.Storage.getContentFiltering();

    const filterByFlair = document.getElementById("filter-by-flair");
    const flairList = document.getElementById("flair-list");
    const flairEmpty = document.getElementById("flair-empty");

    if (filterByFlair) {
      filterByFlair.checked = filtering.filterByFlair || false;
    }

    if (flairList) {
      flairList.innerHTML = "";
      const flairs = filtering.mutedFlairs || [];
      flairEmpty.hidden = flairs.length > 0;

      for (const flair of flairs) {
        const li = document.createElement("li");
        li.className = "tag";
        li.innerHTML = `
          ${escapeHtml(flair)}
          <button class="remove" data-flair="${escapeHtml(flair)}">×</button>
        `;
        flairList.appendChild(li);
      }

      // Attach remove handlers
      flairList.querySelectorAll(".remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          const flair = btn.dataset.flair;
          removeMutedFlair(flair);
        });
      });
    }
  }

  /**
   * Load score filtering settings
   */
  async function loadScoreFiltering() {
    const filtering = await window.Storage.getContentFiltering();

    const filterByScore = document.getElementById("filter-by-score");
    const minScore = document.getElementById("min-score");

    if (filterByScore) {
      filterByScore.checked = filtering.filterByScore || false;
    }

    if (minScore) {
      minScore.value = filtering.minScore || 0;
    }
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
   * Handle accessibility preference changes
   */
  async function handleAccessibilityChange() {
    const accessibility = {
      fontSize: elements.fontSize?.value || "medium",
      reduceMotion: elements.reduceMotion?.value || "auto",
      highContrast: elements.highContrastElements?.checked || false,
    };

    await window.Storage.setAccessibility(accessibility);

    // Notify all old.reddit.com tabs to refresh accessibility settings
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_ACCESSIBILITY" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    showToast("Accessibility settings saved");
  }

  /**
   * Handle comment enhancements preference changes
   */
  async function handleCommentEnhancementsChange() {
    const enhancements = {
      colorCodedComments: elements.colorCodedComments.checked,
      colorPalette: elements.colorPalette.value,
      stripeWidth: parseInt(elements.stripeWidth.value, 10),
      navigationButtons: elements.navigationButtons.checked,
      navButtonPosition: elements.navButtonPosition.value,
      inlineImages: elements.inlineImages.checked,
      maxImageWidth: parseInt(elements.maxImageWidth.value, 10),
      // v11.2.0: Jump to top keyboard shortcut
      jumpToTopShortcut: elements.jumpToTopShortcut.checked,
    };

    await window.Storage.setCommentEnhancements(enhancements);

    // Notify all old.reddit.com tabs to refresh comment enhancements
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_COLOR_CODED_COMMENTS" },
          () => {
            void chrome.runtime.lastError;
          }
        );
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_COMMENT_NAVIGATION" },
          () => {
            void chrome.runtime.lastError;
          }
        );
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_INLINE_IMAGES" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    showToast("Comment enhancements settings saved");
  }

  /**
   * Handle comment minimap preference changes
   */
  async function handleCommentMinimapChange() {
    const config = {
      enabled: elements.minimapEnabled.checked,
      position: elements.minimapPosition.value,
      width: parseInt(elements.minimapWidth.value, 10),
      opacity: parseInt(elements.minimapOpacity.value, 10) / 100,
      showViewportIndicator: elements.minimapViewport.checked,
      useDepthColors: elements.minimapDepthColors.checked,
      collapsedIndicator: elements.minimapCollapsed.checked,
      autoHide: elements.minimapAutohide.checked,
    };

    await window.Storage.setCommentMinimap(config);

    // Update dependent settings visibility
    updateMinimapDependentSettings(config.enabled);

    // Update display values
    elements.minimapWidthValue.textContent = `${config.width}px`;
    elements.minimapOpacityValue.textContent = `${Math.round(config.opacity * 100)}%`;

    // Notify all old.reddit.com tabs to refresh minimap
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "REFRESH_COMMENT_MINIMAP" },
          () => {
            void chrome.runtime.lastError;
          }
        );
      });
    });

    showToast("Comment minimap settings saved");
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
      // v11.2.0: Advanced content blocking
      blockAIContent: elements.blockAIContent.checked,
      blockTrending: elements.blockTrending.checked,
      blockRecommended: elements.blockRecommended.checked,
      blockCommunityHighlights: elements.blockCommunityHighlights.checked,
      blockMorePosts: elements.blockMorePosts.checked,
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
   * Handle use regex toggle
   */
  async function handleUseRegexChange() {
    const filtering = await window.Storage.getContentFiltering();
    filtering.useRegex = document.getElementById("use-regex").checked;
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

    showToast("Regex mode updated");
  }

  /**
   * Handle filter content toggle
   */
  async function handleFilterContentChange() {
    const filtering = await window.Storage.getContentFiltering();
    filtering.filterContent = document.getElementById("filter-content").checked;
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

    showToast("Content filtering updated");
  }

  /**
   * Handle filter by flair toggle
   */
  async function handleFilterByFlairChange() {
    const filtering = await window.Storage.getContentFiltering();
    filtering.filterByFlair =
      document.getElementById("filter-by-flair").checked;
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

    showToast("Flair filtering updated");
  }

  /**
   * Handle filter by score toggle
   */
  async function handleFilterByScoreChange() {
    const filtering = await window.Storage.getContentFiltering();
    filtering.filterByScore =
      document.getElementById("filter-by-score").checked;
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

    showToast("Score filtering updated");
  }

  /**
   * Handle min score change
   */
  async function handleMinScoreChange() {
    const filtering = await window.Storage.getContentFiltering();
    const minScore = parseInt(document.getElementById("min-score").value, 10);
    filtering.minScore = isNaN(minScore) ? 0 : minScore;
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

    showToast(`Minimum score set to ${filtering.minScore}`);
  }

  /**
   * Add flair to mute list
   */
  async function handleAddFlair() {
    const flairInput = document.getElementById("flair-input");
    const flair = flairInput.value.trim();

    if (!flair) {
      showToast("Please enter a flair text", "error");
      return;
    }

    const filtering = await window.Storage.getContentFiltering();
    const flairs = filtering.mutedFlairs || [];

    if (flairs.includes(flair)) {
      showToast("Flair already muted", "error");
      return;
    }

    if (flairs.length >= 100) {
      showToast("Maximum 100 flairs allowed", "error");
      return;
    }

    flairs.push(flair);
    filtering.mutedFlairs = flairs;
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

    flairInput.value = "";
    await loadFlairFiltering();

    showToast(`"${flair}" flair muted`);
  }

  /**
   * Remove flair from mute list
   */
  async function removeMutedFlair(flair) {
    const filtering = await window.Storage.getContentFiltering();
    filtering.mutedFlairs = (filtering.mutedFlairs || []).filter(
      (f) => f !== flair
    );
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

    await loadFlairFiltering();
    showToast(`"${flair}" flair unmuted`);
  }

  /**
   * Export flairs list
   */
  async function handleExportFlairs() {
    const filtering = await window.Storage.getContentFiltering();
    const flairs = filtering.mutedFlairs || [];

    const blob = new Blob([JSON.stringify(flairs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orr-muted-flairs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Flair list exported");
  }

  /**
   * Import flairs list
   */
  async function handleImportFlairs() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          showToast("Invalid format: must be JSON array", "error");
          return;
        }

        const filtering = await window.Storage.getContentFiltering();
        const existing = filtering.mutedFlairs || [];
        const newFlairs = imported.filter(
          (f) => typeof f === "string" && !existing.includes(f)
        );

        if (newFlairs.length === 0) {
          showToast("All flairs already muted", "error");
          return;
        }

        filtering.mutedFlairs = [...existing, ...newFlairs];
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

        await loadFlairFiltering();
        showToast(`${newFlairs.length} flairs imported`);
      } catch (error) {
        showToast(`Import failed: ${error.message}`, "error");
      }
    };

    input.click();
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
      const invalid = imported.filter(
        (k) => typeof k !== "string" || !k.trim()
      );
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
      const invalid = imported.filter(
        (d) => typeof d !== "string" || !d.trim()
      );
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

    // Accessibility
    if (elements.fontSize) {
      elements.fontSize.addEventListener("change", handleAccessibilityChange);
    }
    if (elements.reduceMotion) {
      elements.reduceMotion.addEventListener(
        "change",
        handleAccessibilityChange
      );
    }
    if (elements.highContrastElements) {
      elements.highContrastElements.addEventListener(
        "change",
        handleAccessibilityChange
      );
    }

    // Reading History
    if (elements.readingHistoryEnabled) {
      elements.readingHistoryEnabled.addEventListener(
        "change",
        handleReadingHistoryToggle
      );
    }
    if (elements.showVisitedIndicator) {
      elements.showVisitedIndicator.addEventListener(
        "change",
        handleReadingHistoryToggle
      );
    }
    if (elements.historyRetentionDays) {
      elements.historyRetentionDays.addEventListener(
        "change",
        handleRetentionDaysChange
      );
    }
    if (elements.historySearch) {
      elements.historySearch.addEventListener("input", (e) => {
        refreshReadingHistoryTable(e.target.value);
      });
    }
    if (elements.clearReadingHistory) {
      elements.clearReadingHistory.addEventListener(
        "click",
        handleClearReadingHistory
      );
    }
    if (elements.exportReadingHistory) {
      elements.exportReadingHistory.addEventListener(
        "click",
        handleExportReadingHistory
      );
    }
    if (elements.importReadingHistoryBtn) {
      elements.importReadingHistoryBtn.addEventListener("click", () => {
        elements.importReadingHistoryFile.click();
      });
    }
    if (elements.importReadingHistoryFile) {
      elements.importReadingHistoryFile.addEventListener(
        "change",
        handleImportReadingHistory
      );
    }

    // NSFW Controls
    if (elements.nsfwControlsEnabled) {
      elements.nsfwControlsEnabled.addEventListener(
        "change",
        handleNsfwControlsToggle
      );
    }
    if (elements.nsfwVisibility) {
      elements.nsfwVisibility.addEventListener(
        "change",
        handleNsfwVisibilityChange
      );
    }
    if (elements.nsfwBlurIntensity) {
      elements.nsfwBlurIntensity.addEventListener(
        "input",
        handleNsfwBlurIntensityChange
      );
    }
    if (elements.nsfwRevealHover) {
      elements.nsfwRevealHover.addEventListener(
        "change",
        handleNsfwControlsToggle
      );
    }
    if (elements.nsfwShowWarning) {
      elements.nsfwShowWarning.addEventListener(
        "change",
        handleNsfwControlsToggle
      );
    }
    if (elements.addNsfwAllowed) {
      elements.addNsfwAllowed.addEventListener("click", handleAddNsfwAllowed);
    }
    if (elements.nsfwAllowedSubreddit) {
      elements.nsfwAllowedSubreddit.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          handleAddNsfwAllowed();
        }
      });
    }
    if (elements.clearNsfwAllowed) {
      elements.clearNsfwAllowed.addEventListener(
        "click",
        handleClearNsfwAllowed
      );
    }

    // Comment enhancements
    elements.colorCodedComments.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    elements.colorPalette.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    elements.stripeWidth.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    elements.navigationButtons.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    elements.navButtonPosition.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    elements.inlineImages.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    elements.maxImageWidth.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );
    // v11.2.0: Jump to top keyboard shortcut
    elements.jumpToTopShortcut.addEventListener(
      "change",
      handleCommentEnhancementsChange
    );

    // Comment minimap (v19.0.0)
    elements.minimapEnabled.addEventListener(
      "change",
      handleCommentMinimapChange
    );
    elements.minimapPosition.addEventListener(
      "change",
      handleCommentMinimapChange
    );
    elements.minimapWidth.addEventListener("input", handleCommentMinimapChange);
    elements.minimapOpacity.addEventListener(
      "input",
      handleCommentMinimapChange
    );
    elements.minimapViewport.addEventListener(
      "change",
      handleCommentMinimapChange
    );
    elements.minimapDepthColors.addEventListener(
      "change",
      handleCommentMinimapChange
    );
    elements.minimapCollapsed.addEventListener(
      "change",
      handleCommentMinimapChange
    );
    elements.minimapAutohide.addEventListener(
      "change",
      handleCommentMinimapChange
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
    elements.blockAppPrompts.addEventListener(
      "change",
      handleNagBlockingChange
    );
    // v11.2.0: Advanced content blocking
    elements.blockAIContent.addEventListener("change", handleNagBlockingChange);
    elements.blockTrending.addEventListener("change", handleNagBlockingChange);
    elements.blockRecommended.addEventListener(
      "change",
      handleNagBlockingChange
    );
    elements.blockCommunityHighlights.addEventListener(
      "change",
      handleNagBlockingChange
    );
    elements.blockMorePosts.addEventListener("change", handleNagBlockingChange);

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
    elements.caseSensitive.addEventListener(
      "change",
      handleCaseSensitiveChange
    );
    elements.exportKeywords.addEventListener("click", handleExportKeywords);
    elements.importKeywords.addEventListener("click", handleImportKeywords);
    elements.importKeywordsFile.addEventListener(
      "change",
      handleImportKeywordsFile
    );

    // Advanced keyword filtering (v12.1.0)
    const useRegexEl = document.getElementById("use-regex");
    if (useRegexEl) {
      useRegexEl.addEventListener("change", handleUseRegexChange);
    }

    const filterContentEl = document.getElementById("filter-content");
    if (filterContentEl) {
      filterContentEl.addEventListener("change", handleFilterContentChange);
    }

    // Flair filtering
    const filterByFlairEl = document.getElementById("filter-by-flair");
    if (filterByFlairEl) {
      filterByFlairEl.addEventListener("change", handleFilterByFlairChange);
    }

    const addFlairEl = document.getElementById("add-flair");
    if (addFlairEl) {
      addFlairEl.addEventListener("click", handleAddFlair);
    }

    const flairInputEl = document.getElementById("flair-input");
    if (flairInputEl) {
      flairInputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          handleAddFlair();
        }
      });
    }

    const exportFlairsEl = document.getElementById("export-flairs");
    if (exportFlairsEl) {
      exportFlairsEl.addEventListener("click", handleExportFlairs);
    }

    const importFlairsEl = document.getElementById("import-flairs");
    if (importFlairsEl) {
      importFlairsEl.addEventListener("click", handleImportFlairs);
    }

    // Score filtering
    const filterByScoreEl = document.getElementById("filter-by-score");
    if (filterByScoreEl) {
      filterByScoreEl.addEventListener("change", handleFilterByScoreChange);
    }

    const minScoreEl = document.getElementById("min-score");
    if (minScoreEl) {
      minScoreEl.addEventListener("change", handleMinScoreChange);
    }

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

    // Sort Preferences
    document
      .getElementById("sort-preferences-enabled")
      .addEventListener("change", handleSortPreferencesToggle);

    document
      .getElementById("pref-search")
      .addEventListener("input", refreshSortPreferencesList);

    document
      .getElementById("clear-all-prefs")
      .addEventListener("click", handleClearAllPreferences);

    document
      .getElementById("export-prefs")
      .addEventListener("click", handleExportPreferences);

    document
      .getElementById("import-prefs")
      .addEventListener("click", handleImportPreferences);

    // User Tags
    document
      .getElementById("user-tags-enabled")
      .addEventListener("change", handleUserTagsToggle);

    document
      .getElementById("tag-search")
      .addEventListener("input", refreshUserTagsList);

    document
      .getElementById("clear-all-tags")
      .addEventListener("click", handleClearAllTags);

    document
      .getElementById("export-tags")
      .addEventListener("click", handleExportTags);

    document
      .getElementById("import-tags")
      .addEventListener("click", handleImportTags);

    // Muted Users
    document
      .getElementById("user-muting-enabled")
      .addEventListener("change", handleUserMutingToggle);

    document
      .getElementById("add-muted-user")
      .addEventListener("click", handleAddMutedUser);

    document
      .getElementById("clear-muted-users")
      .addEventListener("click", handleClearAllMutedUsers);

    document
      .getElementById("export-muted-users")
      .addEventListener("click", handleExportMutedUsers);

    document
      .getElementById("import-muted-users")
      .addEventListener("click", handleImportMutedUsers);

    // Scroll Positions
    document
      .getElementById("scroll-positions-enabled")
      .addEventListener("change", handleScrollPositionsToggle);

    document
      .getElementById("clear-scroll-positions")
      .addEventListener("click", handleClearScrollPositions);

    // Feed Enhancements
    elements.feedCompactMode.addEventListener(
      "change",
      handleFeedEnhancementToggle
    );
    elements.feedTextOnly.addEventListener(
      "change",
      handleFeedEnhancementToggle
    );
    elements.feedUncropImages.addEventListener(
      "change",
      handleFeedEnhancementToggle
    );
    elements.feedHideJoin.addEventListener(
      "change",
      handleFeedEnhancementToggle
    );
    elements.feedHideActions.addEventListener(
      "change",
      handleFeedEnhancementToggle
    );
    elements.customCSSEnabled.addEventListener(
      "change",
      handleFeedEnhancementToggle
    );
    elements.saveCustomCSS.addEventListener("click", handleSaveCustomCSS);
    elements.clearCustomCSS.addEventListener("click", handleClearCustomCSS);
    elements.validateCustomCSS.addEventListener(
      "click",
      handleValidateCustomCSS
    );

    // Layout Presets
    initLayoutPresetsListeners();

    // Storage Management
    attachStorageManagementListeners();

    // Privacy & Tracking Protection
    elements.trackingRemovalEnabled.addEventListener(
      "change",
      handlePrivacyToggle
    );
    elements.trackingBadgeEnabled.addEventListener(
      "change",
      handlePrivacyToggle
    );
    elements.clearTrackingStats.addEventListener(
      "click",
      handleClearTrackingStats
    );
    if (elements.exportPrivacyReport) {
      elements.exportPrivacyReport.addEventListener(
        "click",
        exportPrivacyReport
      );
    }
    elements.referrerDefault.addEventListener(
      "change",
      handleReferrerPolicyChange
    );
    elements.referrerSameOrigin.addEventListener(
      "change",
      handleReferrerPolicyChange
    );
    elements.referrerOrigin.addEventListener(
      "change",
      handleReferrerPolicyChange
    );
    elements.referrerNoReferrer.addEventListener(
      "change",
      handleReferrerPolicyChange
    );
    elements.saveTrackingParams.addEventListener(
      "click",
      handleSaveTrackingParams
    );
    elements.resetTrackingParams.addEventListener(
      "click",
      handleResetTrackingParams
    );

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

  /**
   * ============================================================================
   * KEYBOARD SHORTCUTS MANAGEMENT
   * ============================================================================
   */

  let currentEditingShortcutId = null;
  let keyboardShortcutsCache = null;

  /**
   * Load keyboard shortcuts settings
   */
  async function loadKeyboardShortcuts() {
    try {
      const result = await chrome.storage.sync.get({ keyboardShortcuts: null });

      if (!result.keyboardShortcuts) {
        // Initialize with defaults from storage.js
        const defaults = await storage.getDefaults();
        keyboardShortcutsCache = defaults.keyboardShortcuts;
      } else {
        keyboardShortcutsCache = result.keyboardShortcuts;
      }

      // Update UI
      updateKeyboardShortcutsUI();
    } catch (error) {
      console.error("[ORR] Failed to load keyboard shortcuts:", error);
      showToast("Failed to load keyboard shortcuts", "error");
    }
  }

  /**
   * Update keyboard shortcuts UI
   */
  function updateKeyboardShortcutsUI() {
    if (!keyboardShortcutsCache) return;

    // Update toggle
    const enabled = keyboardShortcutsCache.enabled !== false;
    document.getElementById("keyboard-shortcuts-enabled").checked = enabled;

    // Show/hide settings
    document.getElementById("keyboard-shortcuts-settings").style.display =
      enabled ? "block" : "none";

    // Update chord timeout
    document.getElementById("chord-timeout").value =
      keyboardShortcutsCache.chordTimeout || 1000;

    // Populate shortcuts table
    populateShortcutsTable();

    // Check for conflicts
    detectAndDisplayConflicts();
  }

  /**
   * Populate shortcuts table
   */
  function populateShortcutsTable() {
    const tbody = document.getElementById("shortcuts-table-body");
    tbody.innerHTML = "";

    const shortcuts = keyboardShortcutsCache.shortcuts || {};

    // Group shortcuts by type
    const groups = {
      Navigation: [],
      Appearance: [],
      Content: [],
      Help: [],
    };

    for (const [id, shortcut] of Object.entries(shortcuts)) {
      const item = { id, ...shortcut };

      if (id.includes("nav-") || id.includes("jump") || id.includes("vim-")) {
        groups.Navigation.push(item);
      } else if (
        id.includes("dark") ||
        id.includes("compact") ||
        id.includes("text") ||
        id.includes("palette")
      ) {
        groups.Appearance.push(item);
      } else if (id.includes("images")) {
        groups.Content.push(item);
      } else if (id.includes("help")) {
        groups.Help.push(item);
      }
    }

    // Render each group
    for (const [groupName, items] of Object.entries(groups)) {
      if (items.length === 0) continue;

      // Group header
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `
        <td colspan="5" style="background: #272729; font-weight: 600; color: #818384; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">
          ${groupName}
        </td>
      `;
      tbody.appendChild(headerRow);

      // Shortcuts in group
      items.forEach((shortcut) => {
        const row = document.createElement("tr");
        row.dataset.shortcutId = shortcut.id;

        const contextBadge = getContextBadge(shortcut.context);

        row.innerHTML = `
          <td class="shortcut-description">${shortcut.description}</td>
          <td class="shortcut-keys">${escapeHtml(shortcut.keys)}</td>
          <td class="shortcut-context">${contextBadge}</td>
          <td>
            <label class="switch" style="margin: 0;">
              <input type="checkbox" ${shortcut.enabled ? "checked" : ""}
                     onchange="toggleShortcut('${shortcut.id}', this.checked)" />
              <span class="slider"></span>
            </label>
          </td>
          <td class="shortcut-actions">
            <button class="shortcut-edit-btn" onclick="editShortcut('${shortcut.id}')">
              Edit
            </button>
          </td>
        `;

        tbody.appendChild(row);
      });
    }
  }

  /**
   * Get context badge HTML
   */
  function getContextBadge(context) {
    const labels = {
      any: "All pages",
      feed: "Feed only",
      comments: "Comments only",
    };
    return `<span class="shortcut-context-badge">${labels[context] || context}</span>`;
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
   * Toggle shortcut enabled state
   */
  window.toggleShortcut = async function (id, enabled) {
    try {
      keyboardShortcutsCache.shortcuts[id].enabled = enabled;
      await chrome.storage.sync.set({
        keyboardShortcuts: keyboardShortcutsCache,
      });
      detectAndDisplayConflicts();
      showToast(`Shortcut ${enabled ? "enabled" : "disabled"}`, "success");
    } catch (error) {
      console.error("[ORR] Failed to toggle shortcut:", error);
      showToast("Failed to update shortcut", "error");
    }
  };

  /**
   * Edit shortcut
   */
  window.editShortcut = function (id) {
    currentEditingShortcutId = id;
    const shortcut = keyboardShortcutsCache.shortcuts[id];

    if (!shortcut) return;

    // Populate modal
    document.getElementById("keyboard-edit-action-name").textContent =
      shortcut.description;
    document.getElementById("keyboard-edit-keys").value = shortcut.keys;
    document.getElementById("keyboard-edit-context").textContent =
      getContextBadge(shortcut.context).replace(/<[^>]*>/g, "");
    document.getElementById("keyboard-edit-enabled").checked = shortcut.enabled;
    document.getElementById("keyboard-edit-validation").textContent = "";

    // Show modal
    document.getElementById("keyboard-edit-modal").style.display = "flex";
  };

  /**
   * Initialize key capture for edit modal
   */
  function initKeyCapture() {
    const input = document.getElementById("keyboard-edit-keys");
    let isCapturing = false;

    input.addEventListener("keydown", (e) => {
      if (isCapturing) {
        e.preventDefault();

        // Build key string
        const parts = [];
        if (e.ctrlKey) parts.push("Ctrl");
        if (e.altKey) parts.push("Alt");
        if (e.shiftKey) parts.push("Shift");
        if (e.metaKey) parts.push("Meta");

        let key = e.key;

        // Normalize special keys
        if (key === " ") key = "Space";
        else if (key.length === 1) key = key.toUpperCase();

        // Don't include modifier-only presses
        const modifiers = ["Control", "Alt", "Shift", "Meta"];
        if (!modifiers.includes(key)) {
          parts.push(key);
          input.value = parts.join("+");
          validateShortcutKeys(input.value);
        }
      }
    });

    input.addEventListener("focus", () => {
      isCapturing = true;
    });

    input.addEventListener("blur", () => {
      isCapturing = false;
    });
  }

  /**
   * Validate shortcut keys
   */
  function validateShortcutKeys(keys) {
    const validation = document.getElementById("keyboard-edit-validation");

    if (!keys || keys.trim().length === 0) {
      validation.textContent = "Keys cannot be empty";
      validation.className = "validation-message";
      return false;
    }

    // Check for conflicts (except with current shortcut)
    const shortcuts = keyboardShortcutsCache.shortcuts;
    for (const [id, shortcut] of Object.entries(shortcuts)) {
      if (id === currentEditingShortcutId) continue;
      if (!shortcut.enabled) continue;

      if (shortcut.keys.toLowerCase() === keys.toLowerCase()) {
        const currentContext =
          shortcuts[currentEditingShortcutId]?.context || "any";
        if (
          shortcut.context === currentContext ||
          shortcut.context === "any" ||
          currentContext === "any"
        ) {
          validation.textContent = `Conflicts with: ${shortcut.description}`;
          validation.className = "validation-message";
          return false;
        }
      }
    }

    validation.textContent = "✓ Valid";
    validation.className = "validation-message success";
    return true;
  }

  /**
   * Save edited shortcut
   */
  async function saveEditedShortcut() {
    const keys = document.getElementById("keyboard-edit-keys").value.trim();
    const enabled = document.getElementById("keyboard-edit-enabled").checked;

    if (!validateShortcutKeys(keys)) {
      return;
    }

    try {
      keyboardShortcutsCache.shortcuts[currentEditingShortcutId].keys = keys;
      keyboardShortcutsCache.shortcuts[currentEditingShortcutId].enabled =
        enabled;

      await chrome.storage.sync.set({
        keyboardShortcuts: keyboardShortcutsCache,
      });

      closeEditModal();
      updateKeyboardShortcutsUI();
      showToast("Shortcut updated successfully", "success");
    } catch (error) {
      console.error("[ORR] Failed to save shortcut:", error);
      showToast("Failed to save shortcut", "error");
    }
  }

  /**
   * Reset shortcut to default
   */
  async function resetShortcut() {
    if (!confirm("Reset this shortcut to its default?")) return;

    try {
      const defaults = await storage.getDefaults();
      const defaultShortcut =
        defaults.keyboardShortcuts.shortcuts[currentEditingShortcutId];

      if (defaultShortcut) {
        keyboardShortcutsCache.shortcuts[currentEditingShortcutId] = {
          ...defaultShortcut,
        };
        await chrome.storage.sync.set({
          keyboardShortcuts: keyboardShortcutsCache,
        });

        closeEditModal();
        updateKeyboardShortcutsUI();
        showToast("Shortcut reset to default", "success");
      }
    } catch (error) {
      console.error("[ORR] Failed to reset shortcut:", error);
      showToast("Failed to reset shortcut", "error");
    }
  }

  /**
   * Close edit modal
   */
  function closeEditModal() {
    document.getElementById("keyboard-edit-modal").style.display = "none";
    currentEditingShortcutId = null;
  }

  /**
   * Detect and display conflicts
   */
  function detectAndDisplayConflicts() {
    const conflicts = [];
    const shortcuts = keyboardShortcutsCache.shortcuts;
    const entries = Object.entries(shortcuts);

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [id1, sc1] = entries[i];
        const [id2, sc2] = entries[j];

        if (!sc1.enabled || !sc2.enabled) continue;

        if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
          // Check context overlap
          if (
            sc1.context === sc2.context ||
            sc1.context === "any" ||
            sc2.context === "any"
          ) {
            conflicts.push({
              keys: sc1.keys,
              shortcuts: [sc1.description, sc2.description],
              ids: [id1, id2],
            });
          }
        }
      }
    }

    // Update UI
    const banner = document.getElementById("keyboard-conflicts-warning");
    const message = document.getElementById("keyboard-conflicts-message");

    if (conflicts.length > 0) {
      banner.style.display = "block";
      const conflictList = conflicts
        .map((c) => `<strong>${c.keys}</strong>: ${c.shortcuts.join(" and ")}`)
        .join("<br>");
      message.innerHTML = `The following shortcuts have conflicts:<br>${conflictList}`;

      // Highlight conflicting rows
      conflicts.forEach((c) => {
        c.ids.forEach((id) => {
          const row = document.querySelector(`tr[data-shortcut-id="${id}"]`);
          if (row) row.classList.add("conflict-row");
        });
      });
    } else {
      banner.style.display = "none";
      // Remove conflict highlights
      document.querySelectorAll(".conflict-row").forEach((row) => {
        row.classList.remove("conflict-row");
      });
    }
  }

  /**
   * Export keyboard shortcuts
   */
  async function exportKeyboardShortcuts() {
    try {
      const data = {
        version: "1.0",
        exported: new Date().toISOString(),
        shortcuts: keyboardShortcutsCache.shortcuts,
        chordTimeout: keyboardShortcutsCache.chordTimeout,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `keyboard-shortcuts-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("Shortcuts exported successfully", "success");
    } catch (error) {
      console.error("[ORR] Failed to export shortcuts:", error);
      showToast("Failed to export shortcuts", "error");
    }
  }

  /**
   * Import keyboard shortcuts
   */
  async function importKeyboardShortcuts(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      if (!data.shortcuts) {
        throw new Error("Invalid shortcuts file");
      }

      // Confirm overwrite
      if (!confirm("This will overwrite your current shortcuts. Continue?")) {
        return;
      }

      // Merge shortcuts
      keyboardShortcutsCache.shortcuts = { ...data.shortcuts };
      if (data.chordTimeout) {
        keyboardShortcutsCache.chordTimeout = data.chordTimeout;
      }

      await chrome.storage.sync.set({
        keyboardShortcuts: keyboardShortcutsCache,
      });

      updateKeyboardShortcutsUI();
      showToast("Shortcuts imported successfully", "success");
    } catch (error) {
      console.error("[ORR] Failed to import shortcuts:", error);
      showToast("Failed to import shortcuts: " + error.message, "error");
    }
  }

  /**
   * Reset all shortcuts to defaults
   */
  async function resetAllShortcuts() {
    if (
      !confirm(
        "Reset all keyboard shortcuts to defaults? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const defaults = await storage.getDefaults();
      keyboardShortcutsCache = { ...defaults.keyboardShortcuts };

      await chrome.storage.sync.set({
        keyboardShortcuts: keyboardShortcutsCache,
      });

      updateKeyboardShortcutsUI();
      showToast("All shortcuts reset to defaults", "success");
    } catch (error) {
      console.error("[ORR] Failed to reset shortcuts:", error);
      showToast("Failed to reset shortcuts", "error");
    }
  }

  /**
   * Initialize keyboard shortcuts UI
   */
  function initKeyboardShortcutsUI() {
    // Master toggle
    document
      .getElementById("keyboard-shortcuts-enabled")
      .addEventListener("change", async (e) => {
        keyboardShortcutsCache.enabled = e.target.checked;
        await chrome.storage.sync.set({
          keyboardShortcuts: keyboardShortcutsCache,
        });
        updateKeyboardShortcutsUI();
      });

    // Chord timeout
    document
      .getElementById("chord-timeout")
      .addEventListener("change", async (e) => {
        keyboardShortcutsCache.chordTimeout = parseInt(e.target.value);
        await chrome.storage.sync.set({
          keyboardShortcuts: keyboardShortcutsCache,
        });
        showToast("Chord timeout updated", "success");
      });

    // Export button
    document
      .getElementById("keyboard-export-btn")
      .addEventListener("click", exportKeyboardShortcuts);

    // Import button
    document
      .getElementById("keyboard-import-btn")
      .addEventListener("click", () => {
        document.getElementById("keyboard-import-file").click();
      });

    document
      .getElementById("keyboard-import-file")
      .addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          importKeyboardShortcuts(file);
          e.target.value = ""; // Reset file input
        }
      });

    // Reset all button
    document
      .getElementById("keyboard-reset-all-btn")
      .addEventListener("click", resetAllShortcuts);

    // Edit modal buttons
    document
      .getElementById("keyboard-edit-save")
      .addEventListener("click", saveEditedShortcut);

    document
      .getElementById("keyboard-edit-reset")
      .addEventListener("click", resetShortcut);

    document
      .getElementById("keyboard-edit-cancel")
      .addEventListener("click", closeEditModal);

    document
      .getElementById("keyboard-edit-close")
      .addEventListener("click", closeEditModal);

    // Initialize key capture
    initKeyCapture();

    // Load initial data
    loadKeyboardShortcuts();
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

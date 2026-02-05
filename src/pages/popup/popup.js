"use strict";

(function () {
  const RULESET_ID = "ruleset_1";

  // DOM elements
  const elements = {
    mainToggle: document.getElementById("main-toggle"),
    statusText: document.getElementById("status-text"),
    redirectCount: document.getElementById("redirect-count"),
    totalCount: document.getElementById("total-count"),
    openOptions: document.getElementById("open-options"),
    disableDuration: document.getElementById("disable-duration"),
    tempDisableSection: document.getElementById("temp-disable-section"),
    durationSection: document.getElementById("duration-section"),
    countdown: document.getElementById("countdown"),
    cancelTempDisable: document.getElementById("cancel-temp-disable"),
    tabToggleSection: document.getElementById("tab-toggle-section"),
    tabToggle: document.getElementById("tab-toggle"),
    shortcutHint: document.getElementById("shortcut-hint"),
    darkModeSelect: document.getElementById("dark-mode-select"),
  };

  let countdownInterval = null;

  /**
   * Handle Chrome API errors gracefully
   * Prevents "Unchecked runtime.lastError" warnings in console
   * @returns {void}
   */
  function handleLastError() {
    void chrome.runtime.lastError;
  }

  /**
   * Initialize popup
   */
  async function init() {
    await loadState();
    await loadStats();
    await loadShortcut();
    await loadDarkMode();
    await checkTabContext();
    attachListeners();
  }

  /**
   * Load current enabled state and temporary disable status
   */
  async function loadState() {
    const enabled = await window.Storage.getEnabled();
    const tempDisable = await window.Storage.getTemporaryDisable();

    elements.mainToggle.checked = enabled;
    updateStatusText(enabled);

    // Check if temporary disable is active
    if (tempDisable.active && tempDisable.expiresAt) {
      const remaining = new Date(tempDisable.expiresAt) - Date.now();
      if (remaining > 0) {
        showTempDisable();
        startCountdown();
      } else {
        // Expired, clear it
        await window.Storage.setTemporaryDisable({
          active: false,
          expiresAt: null,
          duration: null,
        });
      }
    }

    // Hide/show duration section based on main toggle
    elements.durationSection.hidden = !enabled;
  }

  /**
   * Load statistics
   */
  async function loadStats() {
    const stats = await window.Storage.getStats();
    elements.redirectCount.textContent = stats.todayRedirects || 0;
    elements.totalCount.textContent = formatNumber(stats.totalRedirects || 0);

    // Render sparkline
    renderMiniSparkline(stats.weeklyHistory || []);
  }

  /**
   * Render mini sparkline in popup
   * @param {Array} history - Array of {date, count} objects
   */
  function renderMiniSparkline(history) {
    const container = document.getElementById("mini-sparkline");

    // Build data for last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const entry = history.find((h) => h.date === dateStr);
      days.push({
        count: entry?.count || 0,
        isToday: i === 0,
      });
    }

    const hasData = days.some((d) => d.count > 0);
    const maxCount = Math.max(...days.map((d) => d.count), 1);

    container.innerHTML = days
      .map((d) => {
        const height = hasData ? (d.count / maxCount) * 20 : 3; // Max 20px
        const barClass = d.count === 0 ? "empty" : d.isToday ? "today" : "";
        return `<div class="sparkline-bar ${barClass}" style="height: ${Math.max(height, 3)}px"></div>`;
      })
      .join("");
  }

  /**
   * Format large numbers with commas
   */
  function formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Load keyboard shortcut
   */
  async function loadShortcut() {
    chrome.commands.getAll((commands) => {
      handleLastError("getCommands");
      const toggleCommand = commands.find(
        (cmd) => cmd.name === "toggle-redirect"
      );

      if (toggleCommand && toggleCommand.shortcut) {
        const keys = toggleCommand.shortcut.split("+");
        elements.shortcutHint.innerHTML =
          keys.map((k) => `<kbd>${escapeHtml(k)}</kbd>`).join("+") +
          " to toggle";
      } else {
        elements.shortcutHint.innerHTML =
          '<a href="#" id="set-shortcut">Set keyboard shortcut</a>';

        // Add click handler for setting shortcut
        setTimeout(() => {
          const link = document.getElementById("set-shortcut");
          if (link) {
            link.addEventListener("click", (e) => {
              e.preventDefault();
              openShortcutSettings();
            });
          }
        }, 0);
      }
    });
  }

  /**
   * Open browser shortcut settings page
   */
  function openShortcutSettings() {
    const isFirefox = typeof browser !== "undefined";
    const url = isFirefox ? "about:addons" : "chrome://extensions/shortcuts";
    chrome.tabs.create({ url }, () => {
      handleLastError("openShortcutSettings");
    });
  }

  /**
   * Check if current tab is a Reddit page and show tab toggle
   */
  async function checkTabContext() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      handleLastError();
      if (tabs.length === 0) return;

      const tab = tabs[0];
      const isRedditTab = tab.url && /reddit\.com/.test(tab.url);
      const enabled = await window.Storage.getEnabled();

      // Only show tab toggle if global is enabled and we're on Reddit
      elements.tabToggleSection.hidden = !isRedditTab || !enabled;

      if (isRedditTab && enabled) {
        // Check if this tab is disabled
        const response = await chrome.runtime.sendMessage({
          type: "CHECK_TAB_STATE",
          tabId: tab.id,
        });
        elements.tabToggle.checked = !response.disabled;
      }
    });
  }

  /**
   * Update status text
   */
  function updateStatusText(enabled) {
    elements.statusText.textContent = enabled
      ? "Redirecting to old.reddit.com"
      : "Redirect disabled";
  }

  /**
   * Handle main toggle change
   */
  async function handleMainToggle() {
    const enabled = elements.mainToggle.checked;

    await window.Storage.setEnabled(enabled);
    await updateRuleset(enabled);
    updateStatusText(enabled);

    // Show/hide duration section
    elements.durationSection.hidden = !enabled;

    // Notify background to update badge
    chrome.runtime.sendMessage({
      type: "UPDATE_BADGE",
      enabled,
    });

    // Refresh tab toggle visibility
    await checkTabContext();
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
   * Handle duration selection
   */
  async function handleDurationSelect() {
    const duration = parseInt(elements.disableDuration.value, 10);
    if (!duration) return;

    // Disable the extension
    elements.mainToggle.checked = false;
    await handleMainToggle();

    // Set temporary disable
    const expiresAt = new Date(Date.now() + duration).toISOString();
    await window.Storage.setTemporaryDisable({
      active: true,
      expiresAt,
      duration,
    });

    // Notify background to set alarm
    chrome.runtime.sendMessage({
      type: "SET_TEMP_DISABLE",
      duration,
      expiresAt,
    });

    // Show temp disable section
    showTempDisable();
    startCountdown();

    // Reset dropdown
    elements.disableDuration.value = "";
  }

  /**
   * Show temporary disable section
   */
  function showTempDisable() {
    elements.tempDisableSection.hidden = false;
    elements.durationSection.hidden = true;
  }

  /**
   * Hide temporary disable section
   */
  function hideTempDisable() {
    elements.tempDisableSection.hidden = true;
    elements.durationSection.hidden = false;
    clearInterval(countdownInterval);
  }

  /**
   * Start countdown timer
   */
  function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  /**
   * Update countdown display
   */
  async function updateCountdown() {
    const tempDisable = await window.Storage.getTemporaryDisable();

    if (!tempDisable.active || !tempDisable.expiresAt) {
      hideTempDisable();
      return;
    }

    const remaining = new Date(tempDisable.expiresAt) - Date.now();

    if (remaining <= 0) {
      hideTempDisable();
      return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    elements.countdown.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Cancel temporary disable
   */
  async function handleCancelTempDisable() {
    // Clear temp disable state
    await window.Storage.setTemporaryDisable({
      active: false,
      expiresAt: null,
      duration: null,
    });

    // Notify background to clear alarm
    chrome.runtime.sendMessage({ type: "CANCEL_TEMP_DISABLE" });

    // Re-enable
    elements.mainToggle.checked = true;
    await handleMainToggle();

    hideTempDisable();
  }

  /**
   * Handle tab toggle
   */
  async function handleTabToggle() {
    const enabled = elements.tabToggle.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      handleLastError();
      if (tabs.length === 0) return;

      const tab = tabs[0];
      chrome.runtime.sendMessage({
        type: enabled ? "ENABLE_FOR_TAB" : "DISABLE_FOR_TAB",
        tabId: tab.id,
      });
    });
  }

  /**
   * Open options page
   */
  function handleOpenOptions() {
    chrome.runtime.openOptionsPage(() => {
      handleLastError();
    });
  }

  /**
   * Load dark mode preference
   */
  async function loadDarkMode() {
    const darkMode = await window.Storage.getDarkMode();
    elements.darkModeSelect.value = darkMode.enabled || "auto";
  }

  /**
   * Handle dark mode selection change
   */
  async function handleDarkModeChange() {
    const selected = elements.darkModeSelect.value;
    const darkMode = await window.Storage.getDarkMode();
    darkMode.enabled = selected;
    await window.Storage.setDarkMode(darkMode);

    // Notify all old.reddit.com tabs to update their dark mode
    chrome.tabs.query({ url: "*://old.reddit.com/*" }, (tabs) => {
      handleLastError();
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_DARK_MODE" }, () => {
          // Ignore errors - tab might not have content script loaded
          void chrome.runtime.lastError;
        });
      });
    });
  }

  /**
   * Attach event listeners
   */
  function attachListeners() {
    elements.mainToggle.addEventListener("change", handleMainToggle);
    elements.disableDuration.addEventListener("change", handleDurationSelect);
    elements.cancelTempDisable.addEventListener(
      "click",
      handleCancelTempDisable
    );
    elements.tabToggle.addEventListener("change", handleTabToggle);
    elements.openOptions.addEventListener("click", handleOpenOptions);
    elements.darkModeSelect.addEventListener("change", handleDarkModeChange);

    // Listen for storage changes to keep popup in sync (debounced for performance)
    let statsUpdateTimeout = null;
    let stateUpdateTimeout = null;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        if (changes.stats) {
          // Debounce stats updates
          clearTimeout(statsUpdateTimeout);
          statsUpdateTimeout = setTimeout(() => {
            loadStats();
          }, 100);
        }
        if (changes.enabled || changes.temporaryDisable) {
          // Debounce state updates
          clearTimeout(stateUpdateTimeout);
          stateUpdateTimeout = setTimeout(() => {
            loadState();
          }, 50);
        }
      }
    });
  }

  // Initialize when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

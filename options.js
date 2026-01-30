"use strict";

(function () {
  const RULESET_ID = "ruleset_1";
  const toggleCheckbox = document.getElementById("toggle-redirect");
  const customizeShortcutLink = document.getElementById("customize-shortcut");
  const shortcutDisplay = document.getElementById("shortcut-display");

  function handleLastError() {
    void chrome.runtime.lastError;
  }

  function loadCurrentState() {
    chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
      handleLastError();
      const enabledRulesets = Array.isArray(rulesets) ? rulesets : [];
      toggleCheckbox.checked = enabledRulesets.includes(RULESET_ID);
    });
  }

  function updateRedirectState(enabled) {
    chrome.declarativeNetRequest.updateEnabledRulesets(
      enabled
        ? { enableRulesetIds: [RULESET_ID], disableRulesetIds: [] }
        : { enableRulesetIds: [], disableRulesetIds: [RULESET_ID] },
      () => {
        handleLastError();
        // Update the badge in background
        chrome.action.setBadgeBackgroundColor({ color: "#d14343" }, () => {
          handleLastError();
          chrome.action.setBadgeText({ text: enabled ? "" : "OFF" }, () => {
            handleLastError();
            chrome.action.setTitle(
              {
                title: enabled
                  ? "Old Reddit Redirect is ON (click to disable)"
                  : "Old Reddit Redirect is OFF (click to enable)",
              },
              () => {
                handleLastError();
              }
            );
          });
        });
      }
    );
  }

  function loadShortcut() {
    chrome.commands.getAll((commands) => {
      handleLastError();
      const toggleCommand = commands.find(
        (cmd) => cmd.name === "toggle-redirect"
      );
      if (toggleCommand && toggleCommand.shortcut) {
        shortcutDisplay.textContent = toggleCommand.shortcut;
      } else {
        shortcutDisplay.textContent = "Not set";
      }
    });
  }

  function openShortcutSettings() {
    // Chrome and Firefox have different URLs for extension shortcuts
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

  toggleCheckbox.addEventListener("change", () => {
    updateRedirectState(toggleCheckbox.checked);
  });

  customizeShortcutLink.addEventListener("click", (e) => {
    e.preventDefault();
    openShortcutSettings();
  });

  // Initialize
  loadCurrentState();
  loadShortcut();
})();

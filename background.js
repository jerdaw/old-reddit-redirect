"use strict";

(function () {
  const RULESET_ID = "ruleset_1";

  function handleLastError() {
    void chrome.runtime.lastError;
  }

  function updateActionUi(enabled) {
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

  function toggleRedirect() {
    chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
      handleLastError();
      const enabledRulesets = Array.isArray(rulesets) ? rulesets : [];
      const currentlyEnabled = enabledRulesets.includes(RULESET_ID);
      const newState = !currentlyEnabled;

      chrome.declarativeNetRequest.updateEnabledRulesets(
        newState
          ? { enableRulesetIds: [RULESET_ID], disableRulesetIds: [] }
          : { enableRulesetIds: [], disableRulesetIds: [RULESET_ID] },
        () => {
          handleLastError();
          updateActionUi(newState);
        }
      );
    });
  }

  function initializeActionUi() {
    chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
      handleLastError();
      const enabledRulesets = Array.isArray(rulesets) ? rulesets : [];
      const enabled = enabledRulesets.includes(RULESET_ID);
      updateActionUi(enabled);
    });
  }

  chrome.action.onClicked.addListener(() => {
    toggleRedirect();
  });

  chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-redirect") {
      toggleRedirect();
    }
  });

  function createContextMenus() {
    chrome.contextMenus.removeAll(() => {
      handleLastError();
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
    });
  }

  chrome.contextMenus.onClicked.addListener((info) => {
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
    }
  });

  chrome.runtime.onInstalled.addListener(() => {
    initializeActionUi();
    createContextMenus();
  });

  chrome.runtime.onStartup.addListener(() => {
    initializeActionUi();
  });
})();

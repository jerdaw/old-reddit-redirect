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
        },
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
      },
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

chrome.runtime.onInstalled.addListener(() => {
  initializeActionUi();
});

chrome.runtime.onStartup.addListener(() => {
  initializeActionUi();
});

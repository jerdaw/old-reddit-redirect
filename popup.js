const RULESET_ID = "ruleset_1";

const statusElement = document.getElementById("status");

function handleLastError() {
  void chrome.runtime.lastError;
}

function setStatus(text) {
  if (!statusElement) return;
  statusElement.textContent = text;
}

function updateActionUi(enabled, done) {
  chrome.action.setBadgeBackgroundColor({ color: "#d14343" }, () => {
    handleLastError();
    chrome.action.setBadgeText({ text: enabled ? "" : "OFF" }, () => {
      handleLastError();
      chrome.action.setTitle(
        {
          title: enabled
            ? "Old Reddit Redirect is ON (click to turn off)"
            : "Old Reddit Redirect is OFF (click to turn on)",
        },
        () => {
          handleLastError();
          done?.();
        },
      );
    });
  });
}

function updateRulesetState(enabled, done) {
  chrome.declarativeNetRequest.updateEnabledRulesets(
    enabled
      ? { enableRulesetIds: [RULESET_ID], disableRulesetIds: [] }
      : { enableRulesetIds: [], disableRulesetIds: [RULESET_ID] },
    () => {
      handleLastError();
      done?.();
    },
  );
}

function toggleRedirect() {
  chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
    handleLastError();
    const enabledRulesets = Array.isArray(rulesets) ? rulesets : [];
    const enabled = !enabledRulesets.includes(RULESET_ID);

    updateRulesetState(enabled, () => {
      updateActionUi(enabled, () => {
        setStatus(enabled ? "Redirect enabled" : "Redirect disabled");
        window.close();
      });
    });
  });
}

toggleRedirect();

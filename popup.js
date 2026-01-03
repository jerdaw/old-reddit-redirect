const RULESET_ID = "ruleset_1";

const statusElement = document.getElementById("status");
const toggleButton = document.getElementById("toggle");

let redirectEnabled = null;

function handleLastError() {
  void chrome.runtime.lastError;
}

function setStatus(text) {
  if (!statusElement) return;
  statusElement.textContent = text;
}

function setToggleLabel(enabled) {
  if (!toggleButton) return;
  toggleButton.textContent = enabled ? "Disable redirect" : "Enable redirect";
  toggleButton.disabled = false;
}

function updateActionUi(enabled, done) {
  chrome.action.setBadgeBackgroundColor({ color: "#d14343" }, () => {
    handleLastError();
    chrome.action.setBadgeText({ text: enabled ? "" : "OFF" }, () => {
      handleLastError();
      chrome.action.setTitle(
        {
          title: enabled
            ? "Old Reddit Redirect is ON"
            : "Old Reddit Redirect is OFF",
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
    const enabled = enabledRulesets.includes(RULESET_ID);
    redirectEnabled = enabled;

    updateActionUi(enabled);
    setStatus(enabled ? "Redirect is enabled" : "Redirect is disabled");
    setToggleLabel(enabled);
  });
}

function setRedirectEnabled(enabled) {
  if (!toggleButton) return;
  toggleButton.disabled = true;

  updateRulesetState(enabled, () => {
    redirectEnabled = enabled;
    updateActionUi(enabled, () => {
      setStatus(enabled ? "Redirect is enabled" : "Redirect is disabled");
      setToggleLabel(enabled);
    });
  });
}

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    if (redirectEnabled === null) return;
    setRedirectEnabled(!redirectEnabled);
  });
}

toggleRedirect();

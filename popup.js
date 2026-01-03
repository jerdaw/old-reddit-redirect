const RULESET_ID = "ruleset_1";
const STORAGE_KEY = "enabled";

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
  chrome.storage.local.get({ [STORAGE_KEY]: true }, (items) => {
    handleLastError();
    const enabled = !Boolean(items[STORAGE_KEY]);

    chrome.storage.local.set({ [STORAGE_KEY]: enabled }, () => {
      handleLastError();
      updateRulesetState(enabled, () => {
        updateActionUi(enabled, () => {
          setStatus(enabled ? "Redirect enabled" : "Redirect disabled");
          window.close();
        });
      });
    });
  });
}

toggleRedirect();


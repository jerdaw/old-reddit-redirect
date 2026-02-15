"use strict";

(function () {
  const DEFAULT_SETTINGS = {
    languageOverride: "auto",
  };

  const SUPPORTED_OVERRIDE_LANGUAGES = ["en"];
  const RTL_PREFIXES = ["ar", "he", "fa", "ur", "ps", "dv", "ku", "yi"];

  let i18nState = {
    languageOverride: "auto",
    effectiveLanguage: "en",
    catalog: null,
  };

  function normalizeLanguageCode(languageCode) {
    const normalized = String(languageCode || "en")
      .toLowerCase()
      .replace(/_/g, "-");
    return normalized.split("-")[0];
  }

  function sanitizeOverride(languageOverride) {
    if (languageOverride === "auto") {
      return "auto";
    }

    const normalized = normalizeLanguageCode(languageOverride);
    return SUPPORTED_OVERRIDE_LANGUAGES.includes(normalized)
      ? normalized
      : "auto";
  }

  async function getSettings() {
    try {
      const result = await chrome.storage.local.get({ i18n: DEFAULT_SETTINGS });
      const i18n = result.i18n || DEFAULT_SETTINGS;
      return {
        languageOverride: sanitizeOverride(i18n.languageOverride),
      };
    } catch (error) {
      console.error("[ORR] i18n settings read error:", error);
      return DEFAULT_SETTINGS;
    }
  }

  async function setLanguageOverride(languageOverride) {
    const safeOverride = sanitizeOverride(languageOverride);
    const result = await chrome.storage.local.get({ i18n: DEFAULT_SETTINGS });
    const i18n = result.i18n || DEFAULT_SETTINGS;

    await chrome.storage.local.set({
      i18n: {
        ...i18n,
        languageOverride: safeOverride,
      },
    });
  }

  function resolveEffectiveLanguage(languageOverride) {
    if (languageOverride !== "auto") {
      return languageOverride;
    }

    return normalizeLanguageCode(chrome.i18n.getUILanguage?.() || "en");
  }

  async function loadCatalog(languageCode) {
    const candidateUrls = [
      chrome.runtime.getURL(`_locales/${languageCode}/messages.json`),
      chrome.runtime.getURL(`src/_locales/${languageCode}/messages.json`),
    ];

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          continue;
        }
        return await response.json();
      } catch (_error) {
        // Continue to next path candidate
      }
    }

    return null;
  }

  function applySubstitutions(entry, substitutions) {
    let text = entry?.message || "";
    if (substitutions === undefined || substitutions === null) {
      return text;
    }

    const values = Array.isArray(substitutions)
      ? substitutions
      : [substitutions];
    const placeholders = entry?.placeholders || {};

    Object.entries(placeholders).forEach(([name, meta]) => {
      const token = String(meta?.content || "");
      const match = token.match(/\$(\d+)/);
      if (!match) return;

      const idx = Number(match[1]) - 1;
      const replacement = values[idx] !== undefined ? String(values[idx]) : "";
      text = text.replace(new RegExp(`\\$${name}\\$`, "gi"), replacement);
    });

    return text;
  }

  function msg(key, substitutions) {
    const entry = i18nState.catalog?.[key];
    if (entry) {
      return applySubstitutions(entry, substitutions);
    }

    return chrome.i18n.getMessage(key, substitutions) || key;
  }

  function localizePage() {
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = msg(key);
      if (text !== key) {
        el.placeholder = text;
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const text = msg(key);
      if (text !== key) {
        el.title = text;
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const text = msg(key);
      if (text !== key) {
        el.setAttribute("aria-label", text);
      }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      const text = msg(key);
      if (text !== key) {
        el.setAttribute("alt", text);
      }
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = msg(key);
      if (text !== key) {
        el.textContent = text;
      }
    });
  }

  function applyDocumentLanguageAndDirection() {
    const language = i18nState.effectiveLanguage || "en";
    const isRtl = RTL_PREFIXES.some(
      (prefix) => language === prefix || language.startsWith(`${prefix}-`)
    );

    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }

  async function init() {
    const settings = await getSettings();
    let effectiveLanguage = resolveEffectiveLanguage(settings.languageOverride);
    let catalog = null;

    // Only override behavior requires explicit catalog loading.
    if (settings.languageOverride !== "auto") {
      catalog = await loadCatalog(effectiveLanguage);

      if (!catalog && effectiveLanguage !== "en") {
        effectiveLanguage = "en";
        catalog = await loadCatalog("en");
      }
    }

    i18nState = {
      languageOverride: settings.languageOverride,
      effectiveLanguage,
      catalog,
    };

    return {
      ...i18nState,
    };
  }

  window.ORRI18n = {
    init,
    msg,
    localizePage,
    applyDocumentLanguageAndDirection,
    getSettings,
    setLanguageOverride,
  };
})();

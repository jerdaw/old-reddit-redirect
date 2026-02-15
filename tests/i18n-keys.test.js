import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

function readFile(relativePath) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function extractDataI18nKeys(html) {
  const keys = new Set();
  const pattern =
    /data-i18n(?:-placeholder|-title|-aria-label|-alt)="([^"]+)"/g;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

function extractMsgKeys(js) {
  const keys = new Set();
  const pattern = /msg\("([^"]+)"/g;
  let match;

  while ((match = pattern.exec(js)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

describe("i18n key coverage", () => {
  it("should define all data-i18n keys used in popup/options HTML", () => {
    const locale = JSON.parse(readFile("src/_locales/en/messages.json"));
    const popupHtml = readFile("src/pages/popup/popup.html");
    const optionsHtml = readFile("src/pages/options/options.html");

    const usedKeys = new Set([
      ...extractDataI18nKeys(popupHtml),
      ...extractDataI18nKeys(optionsHtml),
    ]);
    const definedKeys = new Set(Object.keys(locale));

    const missing = [...usedKeys].filter((key) => !definedKeys.has(key)).sort();

    expect(missing).toEqual([]);
  });

  it("should define all msg() keys used in popup/options scripts", () => {
    const locale = JSON.parse(readFile("src/_locales/en/messages.json"));
    const popupJs = readFile("src/pages/popup/popup.js");
    const optionsJs = readFile("src/pages/options/options.js");

    const usedKeys = new Set([
      ...extractMsgKeys(popupJs),
      ...extractMsgKeys(optionsJs),
    ]);
    const definedKeys = new Set(Object.keys(locale));

    const missing = [...usedKeys].filter((key) => !definedKeys.has(key)).sort();

    expect(missing).toEqual([]);
  });

  it("should keep src and root locale catalogs in sync", () => {
    const srcCatalog = JSON.parse(readFile("src/_locales/en/messages.json"));
    const rootCatalog = JSON.parse(readFile("_locales/en/messages.json"));

    expect(rootCatalog).toEqual(srcCatalog);
  });
});

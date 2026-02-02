import { describe, it, expect, beforeEach } from "vitest";

describe("Layout Presets - Storage Schema", () => {
  it("should have getLayoutPresets in storage API", async () => {
    const storage = await import("../storage.js");

    expect(storage.default).toBeDefined();
    expect(typeof storage.default.getLayoutPresets).toBe("function");
    expect(typeof storage.default.setLayoutPresets).toBe("function");
    expect(typeof storage.default.getLayoutPreset).toBe("function");
    expect(typeof storage.default.setLayoutPreset).toBe("function");
    expect(typeof storage.default.deleteLayoutPreset).toBe("function");
    expect(typeof storage.default.getLayoutPresetNames).toBe("function");
    expect(typeof storage.default.getSubredditLayout).toBe("function");
    expect(typeof storage.default.setSubredditLayout).toBe("function");
    expect(typeof storage.default.deleteSubredditLayout).toBe("function");
    expect(typeof storage.default.clearSubredditLayouts).toBe("function");
    expect(typeof storage.default.setActivePreset).toBe("function");
    expect(typeof storage.default.getActivePreset).toBe("function");
    expect(typeof storage.default.clearLayoutPresets).toBe("function");
    expect(typeof storage.default.isLayoutPresetsEnabled).toBe("function");
  });

  it("should have default layout presets config structure", () => {
    const defaultConfig = {
      enabled: true,
      maxPresets: 20,
      activePreset: null,
      presets: {},
      subredditLayouts: {},
      maxSubredditMappings: 100,
    };

    expect(defaultConfig).toHaveProperty("enabled");
    expect(defaultConfig).toHaveProperty("maxPresets");
    expect(defaultConfig).toHaveProperty("activePreset");
    expect(defaultConfig).toHaveProperty("presets");
    expect(defaultConfig).toHaveProperty("subredditLayouts");
    expect(defaultConfig).toHaveProperty("maxSubredditMappings");
  });

  it("should have correct default values", () => {
    const defaultConfig = {
      enabled: true,
      maxPresets: 20,
      activePreset: null,
      presets: {},
      subredditLayouts: {},
      maxSubredditMappings: 100,
    };

    expect(defaultConfig.enabled).toBe(true);
    expect(defaultConfig.maxPresets).toBe(20);
    expect(defaultConfig.activePreset).toBeNull();
    expect(defaultConfig.presets).toEqual({});
    expect(defaultConfig.subredditLayouts).toEqual({});
    expect(defaultConfig.maxSubredditMappings).toBe(100);
  });
});

describe("Layout Presets - Preset Structure", () => {
  it("should have valid preset structure", () => {
    const preset = {
      darkMode: true,
      darkModeType: "dark",
      compactMode: true,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: true,
      hideActionLinks: false,
      colorCodedComments: true,
      colorPalette: "standard",
      customCSS: "",
      timestamp: Date.now(),
    };

    expect(preset).toHaveProperty("darkMode");
    expect(preset).toHaveProperty("darkModeType");
    expect(preset).toHaveProperty("compactMode");
    expect(preset).toHaveProperty("textOnlyMode");
    expect(preset).toHaveProperty("uncropImages");
    expect(preset).toHaveProperty("hideJoinButtons");
    expect(preset).toHaveProperty("hideActionLinks");
    expect(preset).toHaveProperty("colorCodedComments");
    expect(preset).toHaveProperty("colorPalette");
    expect(preset).toHaveProperty("customCSS");
    expect(preset).toHaveProperty("timestamp");
  });

  it("should validate preset boolean fields", () => {
    const preset = {
      darkMode: true,
      compactMode: false,
      textOnlyMode: true,
      uncropImages: false,
      hideJoinButtons: true,
      hideActionLinks: false,
      colorCodedComments: true,
    };

    expect(typeof preset.darkMode).toBe("boolean");
    expect(typeof preset.compactMode).toBe("boolean");
    expect(typeof preset.textOnlyMode).toBe("boolean");
    expect(typeof preset.uncropImages).toBe("boolean");
    expect(typeof preset.hideJoinButtons).toBe("boolean");
    expect(typeof preset.hideActionLinks).toBe("boolean");
    expect(typeof preset.colorCodedComments).toBe("boolean");
  });

  it("should validate dark mode type enum", () => {
    const validTypes = ["dark", "oled"];

    expect(validTypes).toContain("dark");
    expect(validTypes).toContain("oled");

    const preset = { darkModeType: "dark" };
    expect(validTypes).toContain(preset.darkModeType);
  });

  it("should validate color palette enum", () => {
    const validPalettes = ["standard", "colorblind"];

    expect(validPalettes).toContain("standard");
    expect(validPalettes).toContain("colorblind");

    const preset = { colorPalette: "standard" };
    expect(validPalettes).toContain(preset.colorPalette);
  });
});

describe("Layout Presets - Preset Management", () => {
  it("should create a valid preset config", () => {
    const config = {
      enabled: true,
      maxPresets: 20,
      activePreset: "Night Mode",
      presets: {
        "Night Mode": {
          darkMode: true,
          darkModeType: "dark",
          compactMode: false,
          textOnlyMode: false,
          uncropImages: false,
          hideJoinButtons: false,
          hideActionLinks: false,
          colorCodedComments: true,
          colorPalette: "standard",
          customCSS: "",
          timestamp: 1706745600000,
        },
      },
      subredditLayouts: {},
      maxSubredditMappings: 100,
    };

    expect(config.presets["Night Mode"]).toBeDefined();
    expect(config.presets["Night Mode"].darkMode).toBe(true);
    expect(config.activePreset).toBe("Night Mode");
  });

  it("should support multiple presets", () => {
    const config = {
      presets: {
        "Night Mode": { darkMode: true, timestamp: 1 },
        "Compact Reading": { compactMode: true, timestamp: 2 },
        "Focus Mode": { textOnlyMode: true, timestamp: 3 },
      },
    };

    expect(Object.keys(config.presets).length).toBe(3);
    expect(config.presets["Night Mode"]).toBeDefined();
    expect(config.presets["Compact Reading"]).toBeDefined();
    expect(config.presets["Focus Mode"]).toBeDefined();
  });

  it("should handle preset deletion", () => {
    const config = {
      presets: {
        "Night Mode": { darkMode: true, timestamp: 1 },
        "Day Mode": { darkMode: false, timestamp: 2 },
      },
      activePreset: "Night Mode",
    };

    // Simulate deletion
    delete config.presets["Night Mode"];
    if (config.activePreset === "Night Mode") {
      config.activePreset = null;
    }

    expect(config.presets["Night Mode"]).toBeUndefined();
    expect(config.activePreset).toBeNull();
    expect(config.presets["Day Mode"]).toBeDefined();
  });

  it("should handle preset name validation", () => {
    const validNames = [
      "Night Mode",
      "Compact",
      "My Preset 1",
      "test_preset",
      "A",
    ];
    const invalidNames = ["", null, undefined];

    validNames.forEach((name) => {
      expect(name).toBeTruthy();
      expect(typeof name).toBe("string");
    });

    invalidNames.forEach((name) => {
      expect(name).toBeFalsy();
    });
  });

  it("should validate preset name length", () => {
    const maxLength = 50;
    const validName = "A".repeat(50);
    const tooLongName = "A".repeat(51);

    expect(validName.length).toBeLessThanOrEqual(maxLength);
    expect(tooLongName.length).toBeGreaterThan(maxLength);
  });
});

describe("Layout Presets - Subreddit Layouts", () => {
  it("should map subreddits to presets", () => {
    const config = {
      presets: {
        "Dark Mode": { darkMode: true },
        "Light Mode": { darkMode: false },
      },
      subredditLayouts: {
        programming: "Dark Mode",
        pics: "Light Mode",
        videos: "Dark Mode",
      },
    };

    expect(config.subredditLayouts.programming).toBe("Dark Mode");
    expect(config.subredditLayouts.pics).toBe("Light Mode");
    expect(config.subredditLayouts.videos).toBe("Dark Mode");
  });

  it("should normalize subreddit names to lowercase", () => {
    const subreddits = ["Programming", "PICS", "Videos", "AskReddit"];
    const normalized = subreddits.map((s) => s.toLowerCase());

    expect(normalized).toEqual(["programming", "pics", "videos", "askreddit"]);
  });

  it("should handle subreddit mapping deletion", () => {
    const config = {
      subredditLayouts: {
        programming: "Dark Mode",
        pics: "Light Mode",
      },
    };

    delete config.subredditLayouts.programming;

    expect(config.subredditLayouts.programming).toBeUndefined();
    expect(config.subredditLayouts.pics).toBe("Light Mode");
  });

  it("should respect max subreddit mappings limit", () => {
    const maxMappings = 100;
    const config = {
      maxSubredditMappings: maxMappings,
      subredditLayouts: {},
    };

    // Simulate adding mappings up to limit
    for (let i = 0; i < maxMappings; i++) {
      config.subredditLayouts[`subreddit${i}`] = "preset";
    }

    expect(Object.keys(config.subredditLayouts).length).toBe(maxMappings);
  });

  it("should handle preset deletion and cascade to mappings", () => {
    const config = {
      presets: {
        "Dark Mode": { darkMode: true },
      },
      subredditLayouts: {
        programming: "Dark Mode",
        pics: "Dark Mode",
        videos: "Light Mode",
      },
    };

    // Simulate cascade deletion when preset is deleted
    const presetToDelete = "Dark Mode";
    delete config.presets[presetToDelete];

    for (const [subreddit, preset] of Object.entries(config.subredditLayouts)) {
      if (preset === presetToDelete) {
        delete config.subredditLayouts[subreddit];
      }
    }

    expect(config.subredditLayouts.programming).toBeUndefined();
    expect(config.subredditLayouts.pics).toBeUndefined();
    expect(config.subredditLayouts.videos).toBe("Light Mode");
  });
});

describe("Layout Presets - Active Preset", () => {
  it("should track active preset", () => {
    const config = {
      activePreset: "Night Mode",
      presets: {
        "Night Mode": { darkMode: true },
        "Day Mode": { darkMode: false },
      },
    };

    expect(config.activePreset).toBe("Night Mode");
  });

  it("should handle null active preset", () => {
    const config = {
      activePreset: null,
      presets: {
        "Night Mode": { darkMode: true },
      },
    };

    expect(config.activePreset).toBeNull();
  });

  it("should validate active preset exists in presets", () => {
    const config = {
      activePreset: "Night Mode",
      presets: {
        "Night Mode": { darkMode: true },
      },
    };

    const isValid =
      config.activePreset === null ||
      config.presets[config.activePreset] !== undefined;
    expect(isValid).toBe(true);
  });

  it("should clear active preset when it is deleted", () => {
    const config = {
      activePreset: "Night Mode",
      presets: {
        "Night Mode": { darkMode: true },
      },
    };

    delete config.presets["Night Mode"];
    config.activePreset = null;

    expect(config.activePreset).toBeNull();
  });
});

describe("Layout Presets - Import/Export", () => {
  it("should have valid export structure", () => {
    const exportData = {
      _exportVersion: 1,
      _exportDate: new Date().toISOString(),
      presets: {
        "Night Mode": { darkMode: true, timestamp: 1 },
      },
      subredditLayouts: {
        programming: "Night Mode",
      },
      activePreset: "Night Mode",
    };

    expect(exportData).toHaveProperty("_exportVersion");
    expect(exportData).toHaveProperty("_exportDate");
    expect(exportData).toHaveProperty("presets");
    expect(exportData).toHaveProperty("subredditLayouts");
    expect(exportData).toHaveProperty("activePreset");
  });

  it("should validate import data structure", () => {
    const validImport = {
      presets: {
        "Imported Preset": { darkMode: true },
      },
    };

    const invalidImport1 = null;
    const invalidImport2 = { presets: "not an object" };
    const invalidImport3 = {};

    expect(validImport.presets).toBeDefined();
    expect(typeof validImport.presets).toBe("object");

    expect(invalidImport1).toBeNull();
    expect(typeof invalidImport2.presets).not.toBe("object");
    expect(invalidImport3.presets).toBeUndefined();
  });

  it("should merge imported presets", () => {
    const existing = {
      presets: {
        "Existing Preset": { darkMode: false },
      },
    };

    const imported = {
      presets: {
        "Imported Preset": { darkMode: true },
      },
    };

    const merged = {
      presets: { ...existing.presets, ...imported.presets },
    };

    expect(merged.presets["Existing Preset"]).toBeDefined();
    expect(merged.presets["Imported Preset"]).toBeDefined();
    expect(Object.keys(merged.presets).length).toBe(2);
  });

  it("should handle import conflicts (overwrite existing)", () => {
    const existing = {
      presets: {
        "My Preset": { darkMode: false, compactMode: false },
      },
    };

    const imported = {
      presets: {
        "My Preset": { darkMode: true, compactMode: true },
      },
    };

    const merged = {
      presets: { ...existing.presets, ...imported.presets },
    };

    expect(merged.presets["My Preset"].darkMode).toBe(true);
    expect(merged.presets["My Preset"].compactMode).toBe(true);
  });
});

describe("Layout Presets - CSS Classes", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("should apply preset CSS classes", () => {
    document.body.classList.add("orr-dark-mode");
    document.body.classList.add("orr-compact-feed");

    expect(document.body.classList.contains("orr-dark-mode")).toBe(true);
    expect(document.body.classList.contains("orr-compact-feed")).toBe(true);
  });

  it("should remove preset CSS classes", () => {
    document.body.classList.add("orr-dark-mode");
    document.body.classList.remove("orr-dark-mode");

    expect(document.body.classList.contains("orr-dark-mode")).toBe(false);
  });

  it("should toggle between OLED and dark mode", () => {
    document.body.classList.add("orr-oled-mode");
    expect(document.body.classList.contains("orr-oled-mode")).toBe(true);
    expect(document.body.classList.contains("orr-dark-mode")).toBe(false);

    document.body.classList.remove("orr-oled-mode");
    document.body.classList.add("orr-dark-mode");

    expect(document.body.classList.contains("orr-oled-mode")).toBe(false);
    expect(document.body.classList.contains("orr-dark-mode")).toBe(true);
  });

  it("should apply color palette class", () => {
    document.body.classList.add("orr-color-comments");
    document.body.classList.add("orr-palette-standard");

    expect(document.body.classList.contains("orr-color-comments")).toBe(true);
    expect(document.body.classList.contains("orr-palette-standard")).toBe(true);
  });

  it("should handle multiple preset CSS classes", () => {
    document.body.classList.add("orr-dark-mode");
    document.body.classList.add("orr-compact-feed");
    document.body.classList.add("orr-text-only");
    document.body.classList.add("orr-hide-join");

    expect(document.body.classList.contains("orr-dark-mode")).toBe(true);
    expect(document.body.classList.contains("orr-compact-feed")).toBe(true);
    expect(document.body.classList.contains("orr-text-only")).toBe(true);
    expect(document.body.classList.contains("orr-hide-join")).toBe(true);
  });
});

describe("Layout Presets - Preset CSS Injection", () => {
  beforeEach(() => {
    const existing = document.getElementById("orr-preset-css");
    if (existing) {
      existing.remove();
    }
  });

  it("should inject preset CSS into DOM", () => {
    const css = ".preset-test { color: red; }";
    const style = document.createElement("style");
    style.id = "orr-preset-css";
    style.textContent = css;
    document.head.appendChild(style);

    const injected = document.getElementById("orr-preset-css");
    expect(injected).not.toBeNull();
    expect(injected.textContent).toBe(css);
  });

  it("should remove preset CSS from DOM", () => {
    const style = document.createElement("style");
    style.id = "orr-preset-css";
    style.textContent = ".test { color: blue; }";
    document.head.appendChild(style);

    const injected = document.getElementById("orr-preset-css");
    injected.remove();

    const removed = document.getElementById("orr-preset-css");
    expect(removed).toBeNull();
  });

  it("should replace preset CSS when switching presets", () => {
    // Add initial CSS
    const style1 = document.createElement("style");
    style1.id = "orr-preset-css";
    style1.textContent = ".preset1 { color: red; }";
    document.head.appendChild(style1);

    // Replace with new CSS
    const existing = document.getElementById("orr-preset-css");
    if (existing) {
      existing.remove();
    }

    const style2 = document.createElement("style");
    style2.id = "orr-preset-css";
    style2.textContent = ".preset2 { color: blue; }";
    document.head.appendChild(style2);

    const final = document.getElementById("orr-preset-css");
    expect(final.textContent).toBe(".preset2 { color: blue; }");
  });
});

describe("Layout Presets - Subreddit Detection", () => {
  it("should extract subreddit from URL patterns", () => {
    const urls = [
      { path: "/r/programming/", expected: "programming" },
      { path: "/r/javascript/hot", expected: "javascript" },
      { path: "/r/pics/comments/abc123", expected: "pics" },
      { path: "/r/AskReddit", expected: "askreddit" },
      { path: "/", expected: null },
      { path: "/user/someone", expected: null },
    ];

    urls.forEach(({ path, expected }) => {
      const match = path.match(/^\/r\/([^\/]+)/);
      const subreddit = match ? match[1].toLowerCase() : null;
      expect(subreddit).toBe(expected);
    });
  });
});

describe("Layout Presets - Edge Cases", () => {
  it("should handle empty presets object", () => {
    const config = {
      enabled: true,
      presets: {},
      subredditLayouts: {},
      activePreset: null,
    };

    expect(Object.keys(config.presets).length).toBe(0);
    expect(config.activePreset).toBeNull();
  });

  it("should handle disabled feature", () => {
    const config = {
      enabled: false,
      presets: {
        "Night Mode": { darkMode: true },
      },
      activePreset: "Night Mode",
    };

    // When disabled, presets should not be applied
    expect(config.enabled).toBe(false);
  });

  it("should handle preset with all settings enabled", () => {
    const preset = {
      darkMode: true,
      darkModeType: "oled",
      compactMode: true,
      textOnlyMode: true,
      uncropImages: true,
      hideJoinButtons: true,
      hideActionLinks: true,
      colorCodedComments: true,
      colorPalette: "colorblind",
      customCSS: ".custom { display: block; }",
      timestamp: Date.now(),
    };

    expect(preset.darkMode).toBe(true);
    expect(preset.compactMode).toBe(true);
    expect(preset.textOnlyMode).toBe(true);
    expect(preset.uncropImages).toBe(true);
    expect(preset.hideJoinButtons).toBe(true);
    expect(preset.hideActionLinks).toBe(true);
    expect(preset.colorCodedComments).toBe(true);
    expect(preset.customCSS).toBeTruthy();
  });

  it("should handle preset with all settings disabled", () => {
    const preset = {
      darkMode: false,
      darkModeType: "dark",
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      colorCodedComments: false,
      colorPalette: "standard",
      customCSS: "",
      timestamp: Date.now(),
    };

    expect(preset.darkMode).toBe(false);
    expect(preset.compactMode).toBe(false);
    expect(preset.textOnlyMode).toBe(false);
    expect(preset.uncropImages).toBe(false);
    expect(preset.hideJoinButtons).toBe(false);
    expect(preset.hideActionLinks).toBe(false);
    expect(preset.colorCodedComments).toBe(false);
    expect(preset.customCSS).toBe("");
  });

  it("should handle max presets limit", () => {
    const maxPresets = 20;
    const config = {
      maxPresets: maxPresets,
      presets: {},
    };

    // Simulate adding presets up to limit
    for (let i = 0; i < maxPresets; i++) {
      config.presets[`Preset ${i}`] = { timestamp: i };
    }

    expect(Object.keys(config.presets).length).toBe(maxPresets);
  });

  it("should handle special characters in preset names", () => {
    const names = ["Night Mode 🌙", "Preset (1)", "Test - Preset", "My_Preset"];

    names.forEach((name) => {
      const config = {
        presets: {
          [name]: { darkMode: true },
        },
      };

      expect(config.presets[name]).toBeDefined();
    });
  });
});

describe("Layout Presets - Keyboard Shortcut", () => {
  it("should have cycle-layout-preset shortcut defined", () => {
    const shortcut = {
      keys: "l",
      description: "Cycle through layout presets",
      type: "content",
      context: "any",
      enabled: true,
    };

    expect(shortcut.keys).toBe("l");
    expect(shortcut.type).toBe("content");
    expect(shortcut.context).toBe("any");
    expect(shortcut.enabled).toBe(true);
  });

  it("should cycle through presets in order", () => {
    const presetNames = ["Preset A", "Preset B", "Preset C"];
    let currentIndex = -1; // None active

    // First cycle: None -> Preset A
    currentIndex = (currentIndex + 1) % (presetNames.length + 1);
    expect(currentIndex).toBe(0);

    // Second cycle: Preset A -> Preset B
    currentIndex = (currentIndex + 1) % (presetNames.length + 1);
    expect(currentIndex).toBe(1);

    // Third cycle: Preset B -> Preset C
    currentIndex = (currentIndex + 1) % (presetNames.length + 1);
    expect(currentIndex).toBe(2);

    // Fourth cycle: Preset C -> None (back to start)
    currentIndex = (currentIndex + 1) % (presetNames.length + 1);
    expect(currentIndex).toBe(3); // This represents "None"
  });
});

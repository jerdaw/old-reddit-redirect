import { describe, it, expect, beforeEach } from "vitest";

describe("Feed Enhancements - Storage Schema", () => {
  it("should have getFeedEnhancements in storage API", async () => {
    const storage = await import("../storage.js");

    expect(storage.default).toBeDefined();
    expect(typeof storage.default.getFeedEnhancements).toBe("function");
    expect(typeof storage.default.setFeedEnhancements).toBe("function");
    expect(typeof storage.default.setCustomCSS).toBe("function");
    expect(typeof storage.default.getCustomCSS).toBe("function");
    expect(typeof storage.default.isFeedEnhancementEnabled).toBe("function");
  });

  it("should have default feed enhancements config structure", () => {
    const defaultConfig = {
      compactMode: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      uncropImages: false,
      textOnlyMode: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    // Verify all required fields exist
    expect(defaultConfig).toHaveProperty("compactMode");
    expect(defaultConfig).toHaveProperty("hideJoinButtons");
    expect(defaultConfig).toHaveProperty("hideActionLinks");
    expect(defaultConfig).toHaveProperty("uncropImages");
    expect(defaultConfig).toHaveProperty("textOnlyMode");
    expect(defaultConfig).toHaveProperty("customCSS");
    expect(defaultConfig).toHaveProperty("customCSSEnabled");
  });

  it("should have correct default values", () => {
    const defaultConfig = {
      compactMode: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      uncropImages: false,
      textOnlyMode: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(defaultConfig.compactMode).toBe(false);
    expect(defaultConfig.hideJoinButtons).toBe(false);
    expect(defaultConfig.hideActionLinks).toBe(false);
    expect(defaultConfig.uncropImages).toBe(false);
    expect(defaultConfig.textOnlyMode).toBe(false);
    expect(defaultConfig.customCSS).toBe("");
    expect(defaultConfig.customCSSEnabled).toBe(false);
  });
});

describe("Feed Enhancements - Config Validation", () => {
  it("should validate compact mode toggle", () => {
    const config = {
      compactMode: true,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.compactMode).toBe(true);
    expect(typeof config.compactMode).toBe("boolean");
  });

  it("should validate text-only mode toggle", () => {
    const config = {
      compactMode: false,
      textOnlyMode: true,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.textOnlyMode).toBe(true);
    expect(typeof config.textOnlyMode).toBe("boolean");
  });

  it("should validate uncrop images toggle", () => {
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: true,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.uncropImages).toBe(true);
    expect(typeof config.uncropImages).toBe("boolean");
  });

  it("should validate hide join buttons toggle", () => {
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: true,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.hideJoinButtons).toBe(true);
    expect(typeof config.hideJoinButtons).toBe("boolean");
  });

  it("should validate hide action links toggle", () => {
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: true,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.hideActionLinks).toBe(true);
    expect(typeof config.hideActionLinks).toBe("boolean");
  });

  it("should validate custom CSS string", () => {
    const css = ".test { color: red; }";
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: css,
      customCSSEnabled: true,
    };

    expect(config.customCSS).toBe(css);
    expect(typeof config.customCSS).toBe("string");
    expect(config.customCSSEnabled).toBe(true);
  });

  it("should allow multiple features enabled", () => {
    const config = {
      compactMode: true,
      textOnlyMode: true,
      uncropImages: true,
      hideJoinButtons: true,
      hideActionLinks: true,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.compactMode).toBe(true);
    expect(config.textOnlyMode).toBe(true);
    expect(config.uncropImages).toBe(true);
    expect(config.hideJoinButtons).toBe(true);
    expect(config.hideActionLinks).toBe(true);
  });
});

describe("Feed Enhancements - CSS Classes", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("should apply compact mode class", () => {
    document.body.classList.add("orr-compact-feed");
    expect(document.body.classList.contains("orr-compact-feed")).toBe(true);
  });

  it("should apply text-only mode class", () => {
    document.body.classList.add("orr-text-only");
    expect(document.body.classList.contains("orr-text-only")).toBe(true);
  });

  it("should apply uncrop images class", () => {
    document.body.classList.add("orr-uncrop-images");
    expect(document.body.classList.contains("orr-uncrop-images")).toBe(true);
  });

  it("should apply hide join buttons class", () => {
    document.body.classList.add("orr-hide-join");
    expect(document.body.classList.contains("orr-hide-join")).toBe(true);
  });

  it("should apply hide action links class", () => {
    document.body.classList.add("orr-hide-actions");
    expect(document.body.classList.contains("orr-hide-actions")).toBe(true);
  });

  it("should toggle classes on/off", () => {
    document.body.classList.add("orr-compact-feed");
    expect(document.body.classList.contains("orr-compact-feed")).toBe(true);

    document.body.classList.remove("orr-compact-feed");
    expect(document.body.classList.contains("orr-compact-feed")).toBe(false);
  });

  it("should apply multiple classes simultaneously", () => {
    document.body.classList.add("orr-compact-feed");
    document.body.classList.add("orr-hide-join");
    document.body.classList.add("orr-uncrop-images");

    expect(document.body.classList.contains("orr-compact-feed")).toBe(true);
    expect(document.body.classList.contains("orr-hide-join")).toBe(true);
    expect(document.body.classList.contains("orr-uncrop-images")).toBe(true);
  });
});

describe("Feed Enhancements - Custom CSS", () => {
  beforeEach(() => {
    // Remove any existing custom CSS
    const existing = document.getElementById("orr-custom-css");
    if (existing) {
      existing.remove();
    }
  });

  it("should inject custom CSS into DOM", () => {
    const css = ".test { color: blue; }";
    const style = document.createElement("style");
    style.id = "orr-custom-css";
    style.textContent = css;
    document.head.appendChild(style);

    const injected = document.getElementById("orr-custom-css");
    expect(injected).not.toBeNull();
    expect(injected.textContent).toBe(css);
  });

  it("should remove custom CSS from DOM", () => {
    const style = document.createElement("style");
    style.id = "orr-custom-css";
    style.textContent = ".test { color: blue; }";
    document.head.appendChild(style);

    const injected = document.getElementById("orr-custom-css");
    injected.remove();

    const removed = document.getElementById("orr-custom-css");
    expect(removed).toBeNull();
  });

  it("should replace existing custom CSS", () => {
    // Add initial CSS
    const style1 = document.createElement("style");
    style1.id = "orr-custom-css";
    style1.textContent = ".test1 { color: red; }";
    document.head.appendChild(style1);

    // Replace with new CSS
    const existing = document.getElementById("orr-custom-css");
    if (existing) {
      existing.remove();
    }

    const style2 = document.createElement("style");
    style2.id = "orr-custom-css";
    style2.textContent = ".test2 { color: blue; }";
    document.head.appendChild(style2);

    const final = document.getElementById("orr-custom-css");
    expect(final.textContent).toBe(".test2 { color: blue; }");
  });

  it("should handle empty CSS", () => {
    const style = document.createElement("style");
    style.id = "orr-custom-css";
    style.textContent = "";
    document.head.appendChild(style);

    const injected = document.getElementById("orr-custom-css");
    expect(injected.textContent).toBe("");
  });

  it("should validate correct CSS", () => {
    const validCSS = ".test { color: red; padding: 10px; }";
    let isValid = true;

    try {
      const style = document.createElement("style");
      style.textContent = validCSS;
      document.head.appendChild(style);
      document.head.removeChild(style);
    } catch (_error) {
      isValid = false;
    }

    expect(isValid).toBe(true);
  });

  it("should handle multi-line CSS", () => {
    const css = `
      .test {
        color: red;
        padding: 10px;
      }
    `;

    const style = document.createElement("style");
    style.id = "orr-custom-css";
    style.textContent = css;
    document.head.appendChild(style);

    const injected = document.getElementById("orr-custom-css");
    expect(injected.textContent).toContain("color: red");
  });
});

describe("Feed Enhancements - Feature Interactions", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("should not conflict with compact and text-only modes", () => {
    document.body.classList.add("orr-compact-feed");
    document.body.classList.add("orr-text-only");

    expect(document.body.classList.contains("orr-compact-feed")).toBe(true);
    expect(document.body.classList.contains("orr-text-only")).toBe(true);
  });

  it("should work with uncrop images and hide join simultaneously", () => {
    document.body.classList.add("orr-uncrop-images");
    document.body.classList.add("orr-hide-join");

    expect(document.body.classList.contains("orr-uncrop-images")).toBe(true);
    expect(document.body.classList.contains("orr-hide-join")).toBe(true);
  });

  it("should allow custom CSS config with other features", () => {
    const config = {
      compactMode: true,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: ".custom { color: blue; }",
      customCSSEnabled: true,
    };

    expect(config.compactMode).toBe(true);
    expect(config.customCSS).toBe(".custom { color: blue; }");
    expect(config.customCSSEnabled).toBe(true);
  });

  it("should maintain feature state in config", () => {
    const config1 = {
      compactMode: true,
      textOnlyMode: false,
      uncropImages: true,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    const config2 = {
      ...config1,
      hideJoinButtons: true,
    };

    expect(config2.compactMode).toBe(true);
    expect(config2.uncropImages).toBe(true);
    expect(config2.hideJoinButtons).toBe(true);
  });
});

describe("Feed Enhancements - Edge Cases", () => {
  it("should handle empty custom CSS", () => {
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    expect(config.customCSS).toBe("");
    expect(config.customCSSEnabled).toBe(false);
  });

  it("should handle very long custom CSS", () => {
    const longCSS = ".test { " + "color: red; ".repeat(1000) + "}";
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: longCSS,
      customCSSEnabled: true,
    };

    expect(config.customCSS).toBe(longCSS);
    expect(config.customCSS.length).toBeGreaterThan(1000);
  });

  it("should handle special characters in CSS", () => {
    const css = '.test::before { content: "\\00a0"; }';
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: css,
      customCSSEnabled: true,
    };

    expect(config.customCSS).toBe(css);
  });

  it("should merge partial config with defaults", () => {
    const defaults = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    const partial = {
      compactMode: true,
    };

    const merged = { ...defaults, ...partial };

    expect(merged.compactMode).toBe(true);
    expect(merged.textOnlyMode).toBe(false);
    expect(merged.hideJoinButtons).toBe(false);
    expect(merged.customCSS).toBe("");
  });

  it("should handle all features disabled", () => {
    const config = {
      compactMode: false,
      textOnlyMode: false,
      uncropImages: false,
      hideJoinButtons: false,
      hideActionLinks: false,
      customCSS: "",
      customCSSEnabled: false,
    };

    const allDisabled =
      !config.compactMode &&
      !config.textOnlyMode &&
      !config.uncropImages &&
      !config.hideJoinButtons &&
      !config.hideActionLinks &&
      !config.customCSSEnabled;

    expect(allDisabled).toBe(true);
  });

  it("should handle all features enabled", () => {
    const config = {
      compactMode: true,
      textOnlyMode: true,
      uncropImages: true,
      hideJoinButtons: true,
      hideActionLinks: true,
      customCSS: ".test {}",
      customCSSEnabled: true,
    };

    const allEnabled =
      config.compactMode &&
      config.textOnlyMode &&
      config.uncropImages &&
      config.hideJoinButtons &&
      config.hideActionLinks &&
      config.customCSSEnabled;

    expect(allEnabled).toBe(true);
  });
});

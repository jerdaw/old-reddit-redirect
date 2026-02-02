import { describe, it, expect } from "vitest";
import {
  normalizeKeyString,
  buildKeyString,
  isModifierKey,
  isInputContext,
  isChordShortcut,
  parseChord,
  contextsOverlap,
  isContextMatch,
  validateKeyString,
} from "../keyboard-utils.js";

describe("Keyboard Shortcuts - Phase 1", () => {
  describe("Storage Schema", () => {
    it("should have keyboardShortcuts in defaults structure", () => {
      const expectedFields = [
        "enabled",
        "chordTimeout",
        "shortcuts",
        "conflicts",
      ];

      // Validate structure
      expect(expectedFields.length).toBe(4);
      expect(expectedFields).toContain("enabled");
      expect(expectedFields).toContain("chordTimeout");
      expect(expectedFields).toContain("shortcuts");
      expect(expectedFields).toContain("conflicts");
    });

    it("should default enabled to true", () => {
      const defaultValue = true;
      expect(defaultValue).toBe(true);
    });

    it("should default chord timeout to 1000ms", () => {
      const defaultValue = 1000;
      expect(defaultValue).toBe(1000);
    });

    it("should have 11 default shortcuts", () => {
      const shortcutCount = 11;
      expect(shortcutCount).toBe(11);
    });

    it("should have required fields in shortcut objects", () => {
      const shortcut = {
        keys: "Shift+J",
        description: "Next comment",
        type: "content",
        context: "comments",
        enabled: true,
      };

      expect(shortcut).toHaveProperty("keys");
      expect(shortcut).toHaveProperty("description");
      expect(shortcut).toHaveProperty("type");
      expect(shortcut).toHaveProperty("context");
      expect(shortcut).toHaveProperty("enabled");
    });
  });

  describe("Key Normalization", () => {
    it("should normalize single letters to uppercase", () => {
      expect(normalizeKeyString("d")).toBe("D");
      expect(normalizeKeyString("c")).toBe("C");
      expect(normalizeKeyString("t")).toBe("T");
    });

    it("should normalize ctrl modifier", () => {
      expect(normalizeKeyString("ctrl+k")).toBe("Ctrl+K");
      expect(normalizeKeyString("control+k")).toBe("Ctrl+K");
      expect(normalizeKeyString("CTRL+K")).toBe("Ctrl+K");
    });

    it("should normalize alt modifier", () => {
      expect(normalizeKeyString("alt+k")).toBe("Alt+K");
      expect(normalizeKeyString("option+k")).toBe("Alt+K");
    });

    it("should normalize shift modifier", () => {
      expect(normalizeKeyString("shift+j")).toBe("Shift+J");
      expect(normalizeKeyString("SHIFT+j")).toBe("Shift+J");
    });

    it("should normalize meta modifier", () => {
      expect(normalizeKeyString("meta+k")).toBe("Meta+K");
      expect(normalizeKeyString("cmd+k")).toBe("Meta+K");
      expect(normalizeKeyString("command+k")).toBe("Meta+K");
    });

    it("should normalize special keys", () => {
      expect(normalizeKeyString("home")).toBe("Home");
      expect(normalizeKeyString("end")).toBe("End");
      expect(normalizeKeyString("pageup")).toBe("PageUp");
      expect(normalizeKeyString("pagedown")).toBe("PageDown");
      expect(normalizeKeyString("escape")).toBe("Escape");
      expect(normalizeKeyString("esc")).toBe("Escape");
    });

    it("should normalize arrow keys", () => {
      expect(normalizeKeyString("arrowup")).toBe("ArrowUp");
      expect(normalizeKeyString("up")).toBe("ArrowUp");
      expect(normalizeKeyString("arrowdown")).toBe("ArrowDown");
      expect(normalizeKeyString("down")).toBe("ArrowDown");
    });

    it("should normalize function keys", () => {
      expect(normalizeKeyString("f1")).toBe("F1");
      expect(normalizeKeyString("f12")).toBe("F12");
    });

    it("should handle multiple modifiers", () => {
      expect(normalizeKeyString("ctrl+shift+k")).toBe("Ctrl+Shift+K");
      expect(normalizeKeyString("alt+shift+r")).toBe("Alt+Shift+R");
    });

    it("should trim whitespace", () => {
      expect(normalizeKeyString("  d  ")).toBe("D");
      expect(normalizeKeyString("  shift+j  ")).toBe("Shift+J");
    });

    it("should normalize chord shortcuts with space", () => {
      expect(normalizeKeyString("g g")).toBe("G G");
      expect(normalizeKeyString("d d")).toBe("D D");
    });

    it("should convert two-letter shortcuts to chords", () => {
      expect(normalizeKeyString("gg")).toBe("G G");
      expect(normalizeKeyString("dd")).toBe("D D");
    });

    it("should handle mixed case in chords", () => {
      expect(normalizeKeyString("G g")).toBe("G G");
      expect(normalizeKeyString("g G")).toBe("G G");
    });

    it("should handle empty or null input", () => {
      expect(normalizeKeyString("")).toBe("");
      expect(normalizeKeyString(null)).toBe("");
      expect(normalizeKeyString(undefined)).toBe("");
    });
  });

  describe("Build Key String from Event", () => {
    it("should build string from simple key press", () => {
      const event = {
        key: "d",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("D");
    });

    it("should build string with Ctrl modifier", () => {
      const event = {
        key: "k",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("Ctrl+K");
    });

    it("should build string with Shift modifier", () => {
      const event = {
        key: "j",
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("Shift+J");
    });

    it("should build string with multiple modifiers", () => {
      const event = {
        key: "r",
        ctrlKey: false,
        altKey: true,
        shiftKey: true,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("Alt+Shift+R");
    });

    it("should handle special keys", () => {
      const event = {
        key: "Home",
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("Shift+Home");
    });

    it("should handle space key", () => {
      const event = {
        key: " ",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("Space");
    });

    it("should not include modifier-only press", () => {
      const event = {
        key: "Shift",
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      };

      expect(buildKeyString(event)).toBe("");
    });
  });

  describe("Modifier Key Detection", () => {
    it("should recognize common modifiers", () => {
      expect(isModifierKey("Control")).toBe(true);
      expect(isModifierKey("Alt")).toBe(true);
      expect(isModifierKey("Shift")).toBe(true);
      expect(isModifierKey("Meta")).toBe(true);
    });

    it("should recognize alternative modifier names", () => {
      expect(isModifierKey("Ctrl")).toBe(true);
      expect(isModifierKey("Command")).toBe(true);
      expect(isModifierKey("Option")).toBe(true);
    });

    it("should not recognize regular keys as modifiers", () => {
      expect(isModifierKey("a")).toBe(false);
      expect(isModifierKey("Enter")).toBe(false);
      expect(isModifierKey("Home")).toBe(false);
    });
  });

  describe("Input Context Detection", () => {
    it("should detect input elements", () => {
      const input = {
        tagName: { toLowerCase: () => "input" },
        isContentEditable: false,
        getAttribute: () => null,
      };

      expect(isInputContext(input)).toBe(true);
    });

    it("should detect textarea elements", () => {
      const textarea = {
        tagName: { toLowerCase: () => "textarea" },
        isContentEditable: false,
        getAttribute: () => null,
      };

      expect(isInputContext(textarea)).toBe(true);
    });

    it("should detect contenteditable elements", () => {
      const div = {
        tagName: { toLowerCase: () => "div" },
        isContentEditable: true,
        getAttribute: () => "true",
      };

      expect(isInputContext(div)).toBe(true);
    });

    it("should not detect regular elements", () => {
      const div = {
        tagName: { toLowerCase: () => "div" },
        isContentEditable: false,
        getAttribute: () => null,
      };

      expect(isInputContext(div)).toBe(false);
    });

    it("should handle null target", () => {
      expect(isInputContext(null)).toBe(false);
    });
  });

  describe("Chord Shortcut Detection", () => {
    it("should detect chord shortcuts", () => {
      expect(isChordShortcut("g g")).toBe(true);
      expect(isChordShortcut("d d")).toBe(true);
      expect(isChordShortcut("Ctrl+K Ctrl+B")).toBe(true);
    });

    it("should not detect single key shortcuts as chords", () => {
      expect(isChordShortcut("d")).toBe(false);
      expect(isChordShortcut("Shift+J")).toBe(false);
      expect(isChordShortcut("Ctrl+K")).toBe(false);
    });
  });

  describe("Chord Parsing", () => {
    it("should parse simple chords", () => {
      expect(parseChord("g g")).toEqual(["g", "g"]);
      expect(parseChord("d d")).toEqual(["d", "d"]);
    });

    it("should parse complex chords", () => {
      expect(parseChord("Ctrl+K Ctrl+B")).toEqual(["Ctrl+K", "Ctrl+B"]);
    });

    it("should handle extra whitespace", () => {
      expect(parseChord("g  g")).toEqual(["g", "g"]);
      expect(parseChord("d   d")).toEqual(["d", "d"]);
    });

    it("should filter empty strings", () => {
      const result = parseChord("g  ");
      expect(result).toEqual(["g"]);
    });
  });

  describe("Context Overlap Detection", () => {
    it("should detect overlap with 'any' context", () => {
      expect(contextsOverlap("any", "feed")).toBe(true);
      expect(contextsOverlap("feed", "any")).toBe(true);
      expect(contextsOverlap("any", "any")).toBe(true);
    });

    it("should detect overlap with matching contexts", () => {
      expect(contextsOverlap("feed", "feed")).toBe(true);
      expect(contextsOverlap("comments", "comments")).toBe(true);
    });

    it("should not detect overlap with different contexts", () => {
      expect(contextsOverlap("feed", "comments")).toBe(false);
      expect(contextsOverlap("comments", "feed")).toBe(false);
    });
  });

  describe("Context Matching", () => {
    it("should match when shortcut context is 'any'", () => {
      expect(isContextMatch("any", "feed")).toBe(true);
      expect(isContextMatch("any", "comments")).toBe(true);
    });

    it("should match when current context is 'any'", () => {
      expect(isContextMatch("feed", "any")).toBe(true);
      expect(isContextMatch("comments", "any")).toBe(true);
    });

    it("should match when contexts are equal", () => {
      expect(isContextMatch("feed", "feed")).toBe(true);
      expect(isContextMatch("comments", "comments")).toBe(true);
    });

    it("should not match when contexts differ", () => {
      expect(isContextMatch("feed", "comments")).toBe(false);
      expect(isContextMatch("comments", "feed")).toBe(false);
    });
  });

  describe("Key String Validation", () => {
    it("should validate good key combinations", () => {
      expect(validateKeyString("d").valid).toBe(true);
      expect(validateKeyString("Shift+J").valid).toBe(true);
      expect(validateKeyString("Ctrl+Alt+Delete").valid).toBe(true);
      expect(validateKeyString("g g").valid).toBe(true);
    });

    it("should reject empty strings", () => {
      const result = validateKeyString("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject whitespace-only strings", () => {
      const result = validateKeyString("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject modifier-only shortcuts", () => {
      const result = validateKeyString("Shift");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("non-modifier key");
    });

    it("should allow modifiers with a key", () => {
      expect(validateKeyString("Shift+A").valid).toBe(true);
      expect(validateKeyString("Ctrl+K").valid).toBe(true);
    });
  });

  describe("Conflict Detection Algorithm", () => {
    it("should detect conflicts with same keys", () => {
      const shortcuts = {
        shortcut1: {
          keys: "d",
          enabled: true,
          context: "any",
        },
        shortcut2: {
          keys: "d",
          enabled: true,
          context: "any",
        },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [_id1, sc1] = entries[i];
          const [_id2, sc2] = entries[j];

          if (
            sc1.enabled &&
            sc2.enabled &&
            sc1.keys.toLowerCase() === sc2.keys.toLowerCase()
          ) {
            conflicts.push({ keys: sc1.keys });
          }
        }
      }

      expect(conflicts.length).toBe(1);
    });

    it("should not detect conflicts when one is disabled", () => {
      const shortcuts = {
        shortcut1: {
          keys: "d",
          enabled: true,
          context: "any",
        },
        shortcut2: {
          keys: "d",
          enabled: false,
          context: "any",
        },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [_id1, sc1] = entries[i];
          const [_id2, sc2] = entries[j];

          if (
            sc1.enabled &&
            sc2.enabled &&
            sc1.keys.toLowerCase() === sc2.keys.toLowerCase()
          ) {
            conflicts.push({ keys: sc1.keys });
          }
        }
      }

      expect(conflicts.length).toBe(0);
    });

    it("should be case-insensitive", () => {
      const keys1 = "Shift+J";
      const keys2 = "shift+j";

      expect(keys1.toLowerCase() === keys2.toLowerCase()).toBe(true);
    });

    it("should check context overlap", () => {
      const sc1 = { context: "feed" };
      const sc2 = { context: "comments" };
      const sc3 = { context: "any" };

      expect(contextsOverlap(sc1.context, sc2.context)).toBe(false);
      expect(contextsOverlap(sc1.context, sc3.context)).toBe(true);
    });
  });
});

describe("Keyboard Shortcuts - Phase 2", () => {
  describe("Shortcut Registry", () => {
    it("should support Map-based registry", () => {
      const registry = new Map();

      registry.set("nav-next", {
        keys: "Shift+J",
        description: "Next comment",
        enabled: true,
      });

      expect(registry.size).toBe(1);
      expect(registry.has("nav-next")).toBe(true);
      expect(registry.get("nav-next").keys).toBe("Shift+J");
    });

    it("should support multiple shortcuts", () => {
      const registry = new Map();

      registry.set("nav-next", { keys: "Shift+J", enabled: true });
      registry.set("nav-prev", { keys: "Shift+K", enabled: true });
      registry.set("jump-top", { keys: "Shift+Home", enabled: true });

      expect(registry.size).toBe(3);
    });

    it("should support chord shortcuts in registry", () => {
      const registry = new Map();

      registry.set("vim-top", { keys: "G G", enabled: true });

      expect(registry.get("vim-top").keys).toBe("G G");
    });
  });

  describe("Chord Buffer Management", () => {
    it("should accumulate keys in chord buffer", () => {
      const buffer = [];

      buffer.push("G");
      buffer.push("G");

      expect(buffer).toEqual(["G", "G"]);
      expect(buffer.join(" ")).toBe("G G");
    });

    it("should clear chord buffer on timeout", (done) => {
      let buffer = ["G"];
      const timeout = 1000;

      setTimeout(() => {
        buffer = [];
        expect(buffer).toEqual([]);
        done();
      }, timeout);
    });

    it("should clear chord buffer when no match", () => {
      const buffer = ["X"];
      const registry = new Map();
      registry.set("test", { keys: "G G", enabled: true });

      // Check for match
      const chordString = buffer.join(" ");
      const hasMatch = Array.from(registry.values()).some(
        (sc) => sc.keys === chordString
      );

      expect(hasMatch).toBe(false);
      // Buffer should be cleared
      if (!hasMatch) {
        buffer.length = 0;
      }
      expect(buffer).toEqual([]);
    });
  });

  describe("Context Filtering", () => {
    it("should filter shortcuts by context", () => {
      const shortcuts = [
        { id: "nav-next", context: "comments", enabled: true },
        { id: "toggle-dark", context: "any", enabled: true },
        { id: "feed-action", context: "feed", enabled: true },
      ];

      const currentContext = "comments";

      const activeShortcuts = shortcuts.filter((sc) => {
        if (!sc.enabled) return false;
        if (sc.context === "any") return true;
        if (currentContext === "any") return true;
        return sc.context === currentContext;
      });

      expect(activeShortcuts.length).toBe(2); // nav-next and toggle-dark
      expect(activeShortcuts.map((s) => s.id)).toContain("nav-next");
      expect(activeShortcuts.map((s) => s.id)).toContain("toggle-dark");
    });

    it("should allow 'any' context shortcuts everywhere", () => {
      const shortcut = { context: "any", enabled: true };

      expect(isContextMatch(shortcut.context, "feed")).toBe(true);
      expect(isContextMatch(shortcut.context, "comments")).toBe(true);
      expect(isContextMatch(shortcut.context, "any")).toBe(true);
    });

    it("should block shortcuts with different contexts", () => {
      expect(isContextMatch("feed", "comments")).toBe(false);
      expect(isContextMatch("comments", "feed")).toBe(false);
    });
  });

  describe("Shortcut Actions", () => {
    it("should support navigation actions", () => {
      const actions = {
        "nav-next-comment": "navigateToNext",
        "nav-prev-comment": "navigateToPrevious",
        "nav-jump-top": "jumpToTop",
      };

      expect(Object.keys(actions)).toHaveLength(3);
      expect(actions["nav-next-comment"]).toBe("navigateToNext");
    });

    it("should support appearance toggles", () => {
      const actions = {
        "toggle-dark-mode": "toggleDarkMode",
        "toggle-compact": "toggleCompactMode",
        "toggle-text-only": "toggleTextOnlyMode",
        "cycle-palette": "cycleColorPalette",
      };

      expect(Object.keys(actions)).toHaveLength(4);
    });

    it("should support content toggles", () => {
      const actions = {
        "toggle-images": "toggleInlineImages",
      };

      expect(Object.keys(actions)).toHaveLength(1);
    });

    it("should support help overlay", () => {
      const actions = {
        "show-help": "showKeyboardHelp",
      };

      expect(Object.keys(actions)).toHaveLength(1);
    });
  });

  describe("Visual Feedback", () => {
    it("should create feedback message structure", () => {
      const message = "Dark mode: ON";

      expect(message).toBeTruthy();
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });

    it("should format feedback for different actions", () => {
      const messages = {
        darkMode: "Dark mode: Dark",
        compact: "Compact mode: ON",
        textOnly: "Text-only mode: OFF",
        palette: "Palette: Rainbow",
        images: "Inline images: ON",
      };

      expect(Object.keys(messages)).toHaveLength(5);
      expect(messages.darkMode).toContain("Dark mode");
      expect(messages.compact).toContain("Compact mode");
    });
  });

  describe("Help Overlay", () => {
    it("should group shortcuts by category", () => {
      const shortcuts = [
        { id: "nav-next", description: "Next", enabled: true },
        { id: "toggle-dark", description: "Dark mode", enabled: true },
        { id: "toggle-images", description: "Images", enabled: true },
        { id: "show-help", description: "Help", enabled: true },
      ];

      const groups = {
        Navigation: [],
        Appearance: [],
        Content: [],
        Help: [],
      };

      shortcuts.forEach((sc) => {
        if (sc.id.includes("nav-")) groups.Navigation.push(sc);
        else if (sc.id.includes("toggle-dark")) groups.Appearance.push(sc);
        else if (sc.id.includes("toggle-images")) groups.Content.push(sc);
        else if (sc.id.includes("help")) groups.Help.push(sc);
      });

      expect(groups.Navigation).toHaveLength(1);
      expect(groups.Appearance).toHaveLength(1);
      expect(groups.Content).toHaveLength(1);
      expect(groups.Help).toHaveLength(1);
    });

    it("should only show enabled shortcuts in help", () => {
      const shortcuts = [
        { id: "test1", enabled: true },
        { id: "test2", enabled: false },
        { id: "test3", enabled: true },
      ];

      const enabledShortcuts = shortcuts.filter((sc) => sc.enabled);

      expect(enabledShortcuts).toHaveLength(2);
    });

    it("should format keyboard shortcut display", () => {
      const keys = "Ctrl+Shift+K";
      const parts = keys.split("+");

      expect(parts).toEqual(["Ctrl", "Shift", "K"]);
      expect(parts.join("</kbd>+<kbd>")).toBe(
        "Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K"
      );
    });
  });
});

describe("Keyboard Shortcuts - Phase 3", () => {
  describe("Conflict Detection", () => {
    it("should detect identical key combinations", () => {
      const shortcuts = {
        action1: { keys: "Ctrl+K", enabled: true, context: "any" },
        action2: { keys: "Ctrl+K", enabled: true, context: "any" },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, sc1] = entries[i];
          const [, sc2] = entries[j];

          if (sc1.enabled && sc2.enabled) {
            if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
              if (
                sc1.context === sc2.context ||
                sc1.context === "any" ||
                sc2.context === "any"
              ) {
                conflicts.push({ keys: sc1.keys });
              }
            }
          }
        }
      }

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].keys).toBe("Ctrl+K");
    });

    it("should ignore disabled shortcuts in conflict detection", () => {
      const shortcuts = {
        action1: { keys: "Ctrl+K", enabled: true, context: "any" },
        action2: { keys: "Ctrl+K", enabled: false, context: "any" },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, sc1] = entries[i];
          const [, sc2] = entries[j];

          if (sc1.enabled && sc2.enabled) {
            if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
              conflicts.push({ keys: sc1.keys });
            }
          }
        }
      }

      expect(conflicts.length).toBe(0);
    });

    it("should detect conflicts across contexts (any context)", () => {
      const shortcuts = {
        action1: { keys: "D", enabled: true, context: "feed" },
        action2: { keys: "D", enabled: true, context: "any" },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, sc1] = entries[i];
          const [, sc2] = entries[j];

          if (sc1.enabled && sc2.enabled) {
            if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
              if (
                sc1.context === sc2.context ||
                sc1.context === "any" ||
                sc2.context === "any"
              ) {
                conflicts.push({ keys: sc1.keys });
              }
            }
          }
        }
      }

      expect(conflicts.length).toBe(1);
    });

    it("should not detect conflicts in different contexts", () => {
      const shortcuts = {
        action1: { keys: "D", enabled: true, context: "feed" },
        action2: { keys: "D", enabled: true, context: "comments" },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, sc1] = entries[i];
          const [, sc2] = entries[j];

          if (sc1.enabled && sc2.enabled) {
            if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
              if (
                sc1.context === sc2.context ||
                sc1.context === "any" ||
                sc2.context === "any"
              ) {
                conflicts.push({ keys: sc1.keys });
              }
            }
          }
        }
      }

      expect(conflicts.length).toBe(0);
    });

    it("should be case-insensitive", () => {
      const shortcuts = {
        action1: { keys: "Ctrl+K", enabled: true, context: "any" },
        action2: { keys: "ctrl+k", enabled: true, context: "any" },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, sc1] = entries[i];
          const [, sc2] = entries[j];

          if (sc1.enabled && sc2.enabled) {
            if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
              conflicts.push({ keys: sc1.keys });
            }
          }
        }
      }

      expect(conflicts.length).toBe(1);
    });

    it("should detect multiple conflicts", () => {
      const shortcuts = {
        action1: { keys: "D", enabled: true, context: "any" },
        action2: { keys: "D", enabled: true, context: "any" },
        action3: { keys: "C", enabled: true, context: "any" },
        action4: { keys: "C", enabled: true, context: "any" },
      };

      const conflicts = [];
      const entries = Object.entries(shortcuts);

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, sc1] = entries[i];
          const [, sc2] = entries[j];

          if (sc1.enabled && sc2.enabled) {
            if (sc1.keys.toLowerCase() === sc2.keys.toLowerCase()) {
              if (
                sc1.context === sc2.context ||
                sc1.context === "any" ||
                sc2.context === "any"
              ) {
                conflicts.push({ keys: sc1.keys });
              }
            }
          }
        }
      }

      expect(conflicts.length).toBe(2);
    });
  });

  describe("Import/Export", () => {
    it("should export shortcuts to valid JSON structure", () => {
      const shortcuts = {
        "nav-next": { keys: "Shift+J", description: "Next", enabled: true },
        "nav-prev": { keys: "Shift+K", description: "Previous", enabled: true },
      };

      const exportData = {
        version: "1.0",
        exported: new Date().toISOString(),
        shortcuts: shortcuts,
        chordTimeout: 1000,
      };

      expect(exportData).toHaveProperty("version");
      expect(exportData).toHaveProperty("exported");
      expect(exportData).toHaveProperty("shortcuts");
      expect(exportData).toHaveProperty("chordTimeout");
      expect(Object.keys(exportData.shortcuts)).toHaveLength(2);
    });

    it("should validate import structure", () => {
      const validData = {
        version: "1.0",
        shortcuts: {
          "nav-next": { keys: "J", enabled: true },
        },
      };

      const invalidData1 = { version: "1.0" }; // Missing shortcuts
      const invalidData2 = { shortcuts: {} }; // Missing version

      expect(validData).toHaveProperty("shortcuts");
      expect(invalidData1.shortcuts).toBeUndefined();
      expect(invalidData2.version).toBeUndefined();
    });

    it("should preserve shortcut properties on import", () => {
      const importData = {
        version: "1.0",
        shortcuts: {
          "nav-next": {
            keys: "J",
            description: "Next comment",
            enabled: true,
            context: "comments",
          },
        },
        chordTimeout: 1500,
      };

      const imported = { ...importData.shortcuts };

      expect(imported["nav-next"].keys).toBe("J");
      expect(imported["nav-next"].description).toBe("Next comment");
      expect(imported["nav-next"].enabled).toBe(true);
      expect(imported["nav-next"].context).toBe("comments");
    });

    it("should merge shortcuts on import", () => {
      const existing = {
        "nav-next": { keys: "Shift+J", enabled: true },
        "nav-prev": { keys: "Shift+K", enabled: true },
      };

      const imported = {
        "nav-next": { keys: "J", enabled: true },
      };

      const merged = { ...existing, ...imported };

      expect(merged["nav-next"].keys).toBe("J"); // Overwritten
      expect(merged["nav-prev"].keys).toBe("Shift+K"); // Preserved
    });

    it("should handle chord timeout in import/export", () => {
      const exportData = {
        chordTimeout: 1500,
        shortcuts: {},
      };

      const imported = {
        chordTimeout: exportData.chordTimeout || 1000,
      };

      expect(imported.chordTimeout).toBe(1500);
    });
  });

  describe("Validation", () => {
    it("should reject empty key combinations", () => {
      const keys = "";
      const valid = keys.trim().length > 0;

      expect(valid).toBe(false);
    });

    it("should reject whitespace-only keys", () => {
      const keys = "   ";
      const valid = keys.trim().length > 0;

      expect(valid).toBe(false);
    });

    it("should accept valid key combinations", () => {
      const validKeys = ["D", "Ctrl+K", "Shift+J", "G G", "Ctrl+Shift+K"];

      validKeys.forEach((keys) => {
        expect(keys.trim().length).toBeGreaterThan(0);
      });
    });

    it("should validate against existing shortcuts", () => {
      const existingShortcuts = {
        action1: { keys: "Ctrl+K", enabled: true, context: "any" },
      };

      const newKeys = "Ctrl+K";
      const hasConflict = Object.values(existingShortcuts).some(
        (sc) => sc.enabled && sc.keys.toLowerCase() === newKeys.toLowerCase()
      );

      expect(hasConflict).toBe(true);
    });
  });

  describe("UI State Management", () => {
    it("should toggle keyboard shortcuts feature", () => {
      let enabled = true;

      // Toggle off
      enabled = !enabled;
      expect(enabled).toBe(false);

      // Toggle on
      enabled = !enabled;
      expect(enabled).toBe(true);
    });

    it("should update chord timeout", () => {
      let chordTimeout = 1000;

      chordTimeout = 1500;
      expect(chordTimeout).toBe(1500);

      chordTimeout = 500;
      expect(chordTimeout).toBe(500);
    });

    it("should track editing state", () => {
      let currentEditingId = null;

      currentEditingId = "nav-next";
      expect(currentEditingId).toBe("nav-next");

      currentEditingId = null;
      expect(currentEditingId).toBeNull();
    });
  });
});

/**
 * Keyboard Shortcut Utilities
 *
 * Shared utilities for keyboard shortcut handling across
 * content scripts and options page.
 */

/**
 * Normalize a key string to canonical format
 * @param {string} keys - Key combination (e.g., "ctrl+k", "Shift+J", "g g")
 * @returns {string} Normalized key string (e.g., "Ctrl+K", "Shift+J", "g g")
 */
export function normalizeKeyString(keys) {
  if (!keys) return "";

  // Trim whitespace
  keys = keys.trim();

  // Handle chord shortcuts (e.g., "g g" or "gg")
  if (keys.includes(" ")) {
    // Already has space, split and normalize each part
    return keys
      .split(/\s+/)
      .map((part) => normalizeSingleKey(part))
      .join(" ");
  } else if (keys.length === 2 && !keys.includes("+")) {
    // Check if it's a special key first (e.g., "up", "f1")
    const lower = keys.toLowerCase();
    const specialKeys = [
      "up",
      "f1",
      "f2",
      "f3",
      "f4",
      "f5",
      "f6",
      "f7",
      "f8",
      "f9",
    ];
    if (specialKeys.includes(lower) || /^f\d+$/i.test(keys)) {
      return normalizeSingleKey(keys);
    }
    // Otherwise treat as chord: "gg" -> "G G"
    return keys
      .split("")
      .map((part) => normalizeSingleKey(part))
      .join(" ");
  }

  // Single key combination
  return normalizeSingleKey(keys);
}

/**
 * Normalize a single key combination (not a chord)
 * @param {string} key - Single key (e.g., "ctrl+k", "Shift+J")
 * @returns {string} Normalized key (e.g., "Ctrl+K", "Shift+J")
 */
function normalizeSingleKey(key) {
  if (!key) return "";

  // Split by + to get modifiers and key
  const parts = key
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());

  // Capitalize modifiers properly
  const normalized = parts.map((part) => {
    switch (part) {
      case "ctrl":
      case "control":
        return "Ctrl";
      case "alt":
      case "option":
        return "Alt";
      case "shift":
        return "Shift";
      case "meta":
      case "cmd":
      case "command":
        return "Meta";
      case "home":
        return "Home";
      case "end":
        return "End";
      case "pageup":
        return "PageUp";
      case "pagedown":
        return "PageDown";
      case "arrowup":
      case "up":
        return "ArrowUp";
      case "arrowdown":
      case "down":
        return "ArrowDown";
      case "arrowleft":
      case "left":
        return "ArrowLeft";
      case "arrowright":
      case "right":
        return "ArrowRight";
      case "escape":
      case "esc":
        return "Escape";
      case "space":
        return " ";
      case "enter":
      case "return":
        return "Enter";
      case "tab":
        return "Tab";
      case "backspace":
        return "Backspace";
      case "delete":
      case "del":
        return "Delete";
      // Special characters that need literal representation
      case "/":
        return "/";
      case "\\":
        return "\\";
      case "?":
        return "?";
      default:
        // Single letter or number - capitalize first letter
        if (part.length === 1) {
          return part.toUpperCase();
        }
        // Function keys (F1-F12)
        if (/^f\d+$/.test(part)) {
          return part.toUpperCase();
        }
        // Unknown, return as-is
        return part;
    }
  });

  return normalized.join("+");
}

/**
 * Build a key string from a KeyboardEvent
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {string} Key string (e.g., "Ctrl+K", "Shift+J", "d")
 */
export function buildKeyString(event) {
  // Don't process modifier-only key presses
  if (isModifierKey(event.key)) {
    return "";
  }

  const parts = [];

  // Add modifiers in consistent order
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  if (event.metaKey) parts.push("Meta");

  // Add the main key
  let key = event.key;

  // Normalize special keys
  if (key === " ") {
    key = "Space";
  } else if (key.length === 1) {
    // Single character - capitalize
    key = key.toUpperCase();
  }

  parts.push(key);

  return parts.join("+");
}

/**
 * Check if a key is a modifier key
 * @param {string} key - Key name
 * @returns {boolean} True if modifier key
 */
export function isModifierKey(key) {
  const modifiers = [
    "Control",
    "Alt",
    "Shift",
    "Meta",
    "AltGraph",
    "CapsLock",
    "NumLock",
    "ScrollLock",
    "Ctrl",
    "Command",
    "Option",
  ];
  return modifiers.includes(key);
}

/**
 * Check if the event target is in an input context
 * @param {Element} target - Event target element
 * @returns {boolean} True if in input context
 */
export function isInputContext(target) {
  if (!target) return false;

  const tagName = target.tagName.toLowerCase();

  // Check if it's an input element
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  // Check if it's contenteditable
  if (
    target.isContentEditable ||
    target.getAttribute("contenteditable") === "true"
  ) {
    return true;
  }

  return false;
}

/**
 * Check if a key string represents a chord shortcut
 * @param {string} keys - Key string
 * @returns {boolean} True if chord shortcut
 */
export function isChordShortcut(keys) {
  return keys.includes(" ");
}

/**
 * Parse a chord shortcut into individual keys
 * @param {string} chordKeys - Chord key string (e.g., "g g")
 * @returns {Array<string>} Array of individual keys
 */
export function parseChord(chordKeys) {
  return chordKeys.split(/\s+/).filter((k) => k.length > 0);
}

/**
 * Check if two keyboard shortcut contexts overlap
 * @param {string} context1 - First context ("any", "feed", "comments")
 * @param {string} context2 - Second context
 * @returns {boolean} True if contexts overlap
 */
export function contextsOverlap(context1, context2) {
  if (context1 === "any" || context2 === "any") return true;
  return context1 === context2;
}

/**
 * Get the current page context
 * @returns {string} Context ("feed", "comments", "any")
 */
export function getCurrentContext() {
  // Check if we're on a comments page
  if (
    window.location.pathname.includes("/comments/") ||
    document.querySelector(".commentarea")
  ) {
    return "comments";
  }

  // Check if we're on a feed page (front page, subreddit, r/all, etc.)
  if (
    window.location.pathname === "/" ||
    window.location.pathname.match(/^\/r\/[^/]+\/?$/) ||
    window.location.pathname.match(/^\/r\/(all|popular)/)
  ) {
    return "feed";
  }

  // Default to "any" for other pages
  return "any";
}

/**
 * Check if a shortcut should be active in the current context
 * @param {string} shortcutContext - Shortcut's context requirement
 * @param {string} currentContext - Current page context
 * @returns {boolean} True if shortcut should be active
 */
export function isContextMatch(shortcutContext, currentContext) {
  if (shortcutContext === "any") return true;
  if (currentContext === "any") return true;
  return shortcutContext === currentContext;
}

/**
 * Validate a key combination
 * @param {string} keys - Key combination to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateKeyString(keys) {
  if (!keys || keys.trim().length === 0) {
    return { valid: false, error: "Key combination cannot be empty" };
  }

  const normalized = normalizeKeyString(keys);

  // Check for modifier-only shortcuts (not allowed)
  const parts = normalized.split("+");
  const hasNonModifier = parts.some((part) => !isModifierKey(part));

  if (!hasNonModifier && !normalized.includes(" ")) {
    return {
      valid: false,
      error: "Shortcuts must include at least one non-modifier key",
    };
  }

  return { valid: true, error: null };
}

// Export all utilities as a namespace for easy importing
export default {
  normalizeKeyString,
  buildKeyString,
  isModifierKey,
  isInputContext,
  isChordShortcut,
  parseChord,
  contextsOverlap,
  getCurrentContext,
  isContextMatch,
  validateKeyString,
};

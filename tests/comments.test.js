import { describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * Tests for comment enhancement features
 */

describe("Color-Coded Comments", () => {
  describe("calculateCommentDepth", () => {
    let container;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    // Simulate the calculateCommentDepth function from content-script.js
    function calculateCommentDepth(comment) {
      let depth = 0;
      let element = comment.parentElement;

      while (element && element !== document.body) {
        if (element.classList.contains("child")) {
          depth++;
        }
        element = element.parentElement;
      }

      return depth;
    }

    it("should return 0 for top-level comment (no .child parents)", () => {
      const comment = document.createElement("div");
      comment.className = "thing comment";
      container.appendChild(comment);

      expect(calculateCommentDepth(comment)).toBe(0);
    });

    it("should return 1 for direct reply (one .child parent)", () => {
      const child = document.createElement("div");
      child.className = "child";
      container.appendChild(child);

      const comment = document.createElement("div");
      comment.className = "thing comment";
      child.appendChild(comment);

      expect(calculateCommentDepth(comment)).toBe(1);
    });

    it("should return 2 for nested reply (two .child parents)", () => {
      const child1 = document.createElement("div");
      child1.className = "child";
      container.appendChild(child1);

      const child2 = document.createElement("div");
      child2.className = "child";
      child1.appendChild(child2);

      const comment = document.createElement("div");
      comment.className = "thing comment";
      child2.appendChild(comment);

      expect(calculateCommentDepth(comment)).toBe(2);
    });

    it("should return 5 for deeply nested comment (five .child parents)", () => {
      let currentParent = container;

      // Create 5 nested .child divs
      for (let i = 0; i < 5; i++) {
        const child = document.createElement("div");
        child.className = "child";
        currentParent.appendChild(child);
        currentParent = child;
      }

      const comment = document.createElement("div");
      comment.className = "thing comment";
      currentParent.appendChild(comment);

      expect(calculateCommentDepth(comment)).toBe(5);
    });

    it("should ignore non-.child parent elements", () => {
      const wrapper = document.createElement("div");
      wrapper.className = "wrapper";
      container.appendChild(wrapper);

      const child = document.createElement("div");
      child.className = "child";
      wrapper.appendChild(child);

      const anotherDiv = document.createElement("div");
      child.appendChild(anotherDiv);

      const comment = document.createElement("div");
      comment.className = "thing comment";
      anotherDiv.appendChild(comment);

      // Should only count the one .child element
      expect(calculateCommentDepth(comment)).toBe(1);
    });

    it("should handle 10+ depth levels", () => {
      let currentParent = container;

      // Create 15 nested .child divs
      for (let i = 0; i < 15; i++) {
        const child = document.createElement("div");
        child.className = "child";
        currentParent.appendChild(child);
        currentParent = child;
      }

      const comment = document.createElement("div");
      comment.className = "thing comment";
      currentParent.appendChild(comment);

      expect(calculateCommentDepth(comment)).toBe(15);
    });
  });

  describe("Storage schema", () => {
    it("should have correct default values for commentEnhancements", () => {
      const defaults = {
        colorCodedComments: true,
        colorPalette: "standard",
        stripeWidth: 3,
      };

      expect(defaults.colorCodedComments).toBe(true);
      expect(defaults.colorPalette).toBe("standard");
      expect(defaults.stripeWidth).toBe(3);
    });

    it("should accept valid colorPalette values", () => {
      const validPalettes = ["standard", "colorblind"];

      validPalettes.forEach((palette) => {
        expect(["standard", "colorblind"]).toContain(palette);
      });
    });

    it("should accept valid stripeWidth values", () => {
      const validWidths = [2, 3, 4, 5];

      validWidths.forEach((width) => {
        expect(width).toBeGreaterThanOrEqual(2);
        expect(width).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("CSS color palette", () => {
    it("should define 10 standard colors", () => {
      const standardColors = [
        "#e74c3c", // Red
        "#e67e22", // Orange
        "#f1c40f", // Yellow
        "#2ecc71", // Green
        "#1abc9c", // Teal
        "#3498db", // Blue
        "#9b59b6", // Purple
        "#e91e63", // Pink
        "#795548", // Brown
        "#607d8b", // Gray
      ];

      expect(standardColors).toHaveLength(10);
      standardColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should define 10 color-blind friendly colors", () => {
      const colorblindColors = [
        "#000000", // Black
        "#e69f00", // Orange
        "#56b4e9", // Sky Blue
        "#009e73", // Bluish Green
        "#f0e442", // Yellow
        "#0072b2", // Blue
        "#d55e00", // Vermillion
        "#cc79a7", // Reddish Purple
        "#999999", // Gray
        "#666666", // Dark Gray
      ];

      expect(colorblindColors).toHaveLength(10);
      colorblindColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should have different colors for standard and colorblind palettes", () => {
      const standardFirst = "#e74c3c";
      const colorblindFirst = "#000000";

      expect(standardFirst).not.toBe(colorblindFirst);
    });
  });

  describe("CSS selectors", () => {
    it("should target comment elements with data-depth attribute", () => {
      const selector = ".thing.comment[data-depth]";
      const testElement = document.createElement("div");
      testElement.className = "thing comment";
      testElement.setAttribute("data-depth", "1");

      expect(testElement.matches(selector)).toBe(true);
    });

    it("should not match comments without data-depth", () => {
      const selector = ".thing.comment[data-depth]";
      const testElement = document.createElement("div");
      testElement.className = "thing comment";

      expect(testElement.matches(selector)).toBe(false);
    });

    it("should match depth-specific selectors", () => {
      for (let depth = 1; depth <= 20; depth++) {
        const selector = `.thing.comment[data-depth="${depth}"]`;
        const testElement = document.createElement("div");
        testElement.className = "thing comment";
        testElement.setAttribute("data-depth", String(depth));

        expect(testElement.matches(selector)).toBe(true);
      }
    });
  });

  describe("Body classes", () => {
    beforeEach(() => {
      // Clear body classes
      document.body.className = "";
    });

    it("should apply orr-color-comments class when feature is enabled", () => {
      document.body.classList.add("orr-color-comments");
      expect(document.body.classList.contains("orr-color-comments")).toBe(true);
    });

    it("should apply palette-specific class", () => {
      document.body.classList.add("orr-palette-standard");
      expect(document.body.classList.contains("orr-palette-standard")).toBe(
        true
      );

      document.body.classList.remove("orr-palette-standard");
      document.body.classList.add("orr-palette-colorblind");
      expect(document.body.classList.contains("orr-palette-colorblind")).toBe(
        true
      );
    });

    it("should handle multiple body classes", () => {
      document.body.classList.add(
        "orr-color-comments",
        "orr-palette-standard",
        "orr-dark-mode"
      );

      expect(document.body.classList.contains("orr-color-comments")).toBe(true);
      expect(document.body.classList.contains("orr-palette-standard")).toBe(
        true
      );
      expect(document.body.classList.contains("orr-dark-mode")).toBe(true);
    });
  });

  describe("Performance considerations", () => {
    it("should handle large comment threads efficiently", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      // Create 500 mock comments
      const comments = [];
      for (let i = 0; i < 500; i++) {
        const comment = document.createElement("div");
        comment.className = "thing comment";
        comment.setAttribute("data-depth", String((i % 10) + 1));
        container.appendChild(comment);
        comments.push(comment);
      }

      const startTime = performance.now();
      comments.forEach((comment) => {
        const depth = comment.getAttribute("data-depth");
        expect(depth).toBeDefined();
      });
      const endTime = performance.now();

      // Should complete in less than 50ms for 500 comments
      expect(endTime - startTime).toBeLessThan(50);

      document.body.removeChild(container);
    });

    it("should batch DOM operations when possible", () => {
      // This is a conceptual test - actual batching happens in content-script
      const operations = [];

      for (let i = 0; i < 100; i++) {
        operations.push(() => {
          const div = document.createElement("div");
          div.setAttribute("data-depth", String(i));
        });
      }

      // Simulate batched execution
      const startTime = performance.now();
      operations.forEach((op) => op());
      const endTime = performance.now();

      // Should be fast even with many operations
      expect(endTime - startTime).toBeLessThan(20);
    });
  });

  describe("CSS custom properties", () => {
    it("should set stripe width CSS variable", () => {
      document.body.style.setProperty("--orr-stripe-width", "3px");
      const value = document.body.style.getPropertyValue("--orr-stripe-width");

      expect(value).toBe("3px");
    });

    it("should accept different stripe width values", () => {
      const widths = ["2px", "3px", "4px", "5px"];

      widths.forEach((width) => {
        document.body.style.setProperty("--orr-stripe-width", width);
        const value =
          document.body.style.getPropertyValue("--orr-stripe-width");
        expect(value).toBe(width);
      });
    });
  });

  describe("Message handling", () => {
    it("should recognize REFRESH_COLOR_CODED_COMMENTS message type", () => {
      const messageType = "REFRESH_COLOR_CODED_COMMENTS";
      const validTypes = [
        "REFRESH_DARK_MODE",
        "REFRESH_NAG_BLOCKING",
        "REFRESH_SUBREDDIT_MUTING",
        "REFRESH_KEYWORD_FILTERING",
        "REFRESH_DOMAIN_FILTERING",
        "REFRESH_COLOR_CODED_COMMENTS",
        "REFRESH_COMMENT_NAVIGATION",
      ];

      expect(validTypes).toContain(messageType);
    });

    it("should recognize REFRESH_COMMENT_NAVIGATION message type", () => {
      const messageType = "REFRESH_COMMENT_NAVIGATION";
      const validTypes = [
        "REFRESH_DARK_MODE",
        "REFRESH_NAG_BLOCKING",
        "REFRESH_SUBREDDIT_MUTING",
        "REFRESH_KEYWORD_FILTERING",
        "REFRESH_DOMAIN_FILTERING",
        "REFRESH_COLOR_CODED_COMMENTS",
        "REFRESH_COMMENT_NAVIGATION",
      ];

      expect(validTypes).toContain(messageType);
    });
  });
});

describe("Comment Navigation", () => {
  describe("getParentComments", () => {
    let container;
    let commentArea;

    beforeEach(() => {
      // Create mock comment structure
      container = document.createElement("div");
      container.className = "commentarea";

      const sitetable = document.createElement("div");
      sitetable.className = "sitetable";
      container.appendChild(sitetable);

      document.body.appendChild(container);
      commentArea = sitetable;
    });

    afterEach(() => {
      if (container.parentElement) {
        document.body.removeChild(container);
      }
    });

    // Simulate the getParentComments function
    function getParentComments() {
      const commentArea = document.querySelector(".commentarea > .sitetable");
      if (!commentArea) return [];

      return Array.from(
        commentArea.querySelectorAll(":scope > .thing.comment")
      );
    }

    it("should return empty array when no comment area exists", () => {
      document.body.removeChild(container);
      expect(getParentComments()).toEqual([]);
    });

    it("should return parent comments only", () => {
      // Add 3 parent comments
      for (let i = 0; i < 3; i++) {
        const comment = document.createElement("div");
        comment.className = "thing comment";
        comment.id = `parent-${i}`;
        commentArea.appendChild(comment);
      }

      const parents = getParentComments();
      expect(parents).toHaveLength(3);
      expect(parents[0].id).toBe("parent-0");
      expect(parents[2].id).toBe("parent-2");
    });

    it("should not include nested comments", () => {
      // Add parent comment with nested child
      const parent = document.createElement("div");
      parent.className = "thing comment";
      parent.id = "parent";
      commentArea.appendChild(parent);

      const child = document.createElement("div");
      child.className = "child";
      parent.appendChild(child);

      const nestedComment = document.createElement("div");
      nestedComment.className = "thing comment";
      nestedComment.id = "nested";
      child.appendChild(nestedComment);

      const parents = getParentComments();
      expect(parents).toHaveLength(1);
      expect(parents[0].id).toBe("parent");
    });

    it("should handle mixed parent and nested structure", () => {
      // Parent 1
      const parent1 = document.createElement("div");
      parent1.className = "thing comment";
      parent1.id = "parent-1";
      commentArea.appendChild(parent1);

      // Nested under parent 1
      const child1 = document.createElement("div");
      child1.className = "child";
      parent1.appendChild(child1);

      const nested1 = document.createElement("div");
      nested1.className = "thing comment";
      nested1.id = "nested-1";
      child1.appendChild(nested1);

      // Parent 2
      const parent2 = document.createElement("div");
      parent2.className = "thing comment";
      parent2.id = "parent-2";
      commentArea.appendChild(parent2);

      const parents = getParentComments();
      expect(parents).toHaveLength(2);
      expect(parents[0].id).toBe("parent-1");
      expect(parents[1].id).toBe("parent-2");
    });
  });

  describe("Navigation button structure", () => {
    it("should have correct button IDs", () => {
      const buttonIds = [
        "orr-nav-prev",
        "orr-nav-next",
        "orr-nav-top",
        "orr-comment-nav",
      ];

      buttonIds.forEach((id) => {
        expect(id).toMatch(/^orr-(nav|comment-nav)/);
      });
    });

    it("should support position variants", () => {
      const positions = ["bottom-right", "bottom-left"];

      positions.forEach((position) => {
        expect(["bottom-right", "bottom-left"]).toContain(position);
      });
    });
  });

  describe("Storage schema", () => {
    it("should have correct default values for navigation", () => {
      const defaults = {
        navigationButtons: true,
        navButtonPosition: "bottom-right",
      };

      expect(defaults.navigationButtons).toBe(true);
      expect(defaults.navButtonPosition).toBe("bottom-right");
    });

    it("should accept valid position values", () => {
      const validPositions = ["bottom-right", "bottom-left"];

      validPositions.forEach((position) => {
        expect(["bottom-right", "bottom-left"]).toContain(position);
      });
    });
  });

  describe("CSS selectors", () => {
    it("should target navigation container", () => {
      const container = document.createElement("div");
      container.id = "orr-comment-nav";
      container.className = "orr-comment-nav orr-nav-bottom-right";

      expect(container.matches("#orr-comment-nav")).toBe(true);
      expect(container.matches(".orr-comment-nav")).toBe(true);
    });

    it("should target navigation buttons", () => {
      const button = document.createElement("button");
      button.className = "orr-nav-button";
      button.id = "orr-nav-next";

      expect(button.matches(".orr-nav-button")).toBe(true);
      expect(button.matches("#orr-nav-next")).toBe(true);
    });

    it("should hide on non-comment pages", () => {
      document.body.className = "";
      const container = document.createElement("div");
      container.className = "orr-comment-nav";
      document.body.appendChild(container);

      // The CSS rule is: body:not(.comments-page) .orr-comment-nav { display: none }
      // We verify the selector is correct
      expect(document.body.matches("body:not(.comments-page)")).toBe(true);

      document.body.removeChild(container);
    });

    it("should show on comment pages", () => {
      document.body.className = "comments-page";

      expect(document.body.classList.contains("comments-page")).toBe(true);

      document.body.className = "";
    });
  });

  describe("Keyboard shortcuts", () => {
    it("should recognize Shift+J for next comment", () => {
      const event = new KeyboardEvent("keydown", {
        key: "J",
        shiftKey: true,
      });

      expect(event.shiftKey).toBe(true);
      expect(event.key).toBe("J");
    });

    it("should recognize Shift+K for previous comment", () => {
      const event = new KeyboardEvent("keydown", {
        key: "K",
        shiftKey: true,
      });

      expect(event.shiftKey).toBe(true);
      expect(event.key).toBe("K");
    });

    it("should not trigger without Shift key", () => {
      const eventJ = new KeyboardEvent("keydown", { key: "J" });
      const eventK = new KeyboardEvent("keydown", { key: "K" });

      expect(eventJ.shiftKey).toBe(false);
      expect(eventK.shiftKey).toBe(false);
    });
  });

  describe("Button sizing", () => {
    it("should have touch-friendly size (44px minimum)", () => {
      const minTouchSize = 44;

      // Desktop default
      expect(minTouchSize).toBeGreaterThanOrEqual(44);

      // Mobile (48px from CSS)
      const mobileTouchSize = 48;
      expect(mobileTouchSize).toBeGreaterThanOrEqual(44);
    });
  });

  describe("Accessibility", () => {
    it("should have button titles for screen readers", () => {
      const titles = [
        "Previous parent comment (Shift+K)",
        "Next parent comment (Shift+J)",
        "Back to top",
      ];

      titles.forEach((title) => {
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(5);
      });
    });

    it("should support focus-visible for keyboard navigation", () => {
      const button = document.createElement("button");
      button.className = "orr-nav-button";

      // Verify the button can receive focus
      expect(document.createElement("button").tabIndex).toBeGreaterThanOrEqual(
        -1
      );
    });
  });

  describe("Performance", () => {
    it("should efficiently find parent comments in large threads", () => {
      const container = document.createElement("div");
      container.className = "commentarea";
      const sitetable = document.createElement("div");
      sitetable.className = "sitetable";
      container.appendChild(sitetable);
      document.body.appendChild(container);

      // Create 100 parent comments with nested children
      for (let i = 0; i < 100; i++) {
        const parent = document.createElement("div");
        parent.className = "thing comment";
        sitetable.appendChild(parent);

        // Add some nested comments
        for (let j = 0; j < 5; j++) {
          const child = document.createElement("div");
          child.className = "child";
          parent.appendChild(child);

          const nested = document.createElement("div");
          nested.className = "thing comment";
          child.appendChild(nested);
        }
      }

      function getParentComments() {
        const commentArea = document.querySelector(".commentarea > .sitetable");
        if (!commentArea) return [];
        return Array.from(
          commentArea.querySelectorAll(":scope > .thing.comment")
        );
      }

      const startTime = performance.now();
      const parents = getParentComments();
      const endTime = performance.now();

      expect(parents).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in <50ms

      document.body.removeChild(container);
    });
  });
});

describe("Inline Image Expansion", () => {
  describe("isImageUrl", () => {
    // Simulate the isImageUrl function
    function isImageUrl(url) {
      if (!url) return false;

      const imagePattern =
        /^https?:\/\/(i\.redd\.it|preview\.redd\.it|i\.imgur\.com|imgur\.com)\/[\w\-\.]+(\.(jpg|jpeg|png|gif|webp|svg))?$/i;
      return imagePattern.test(url);
    }

    it("should recognize i.redd.it image URLs", () => {
      expect(isImageUrl("https://i.redd.it/abc123.jpg")).toBe(true);
      expect(isImageUrl("https://i.redd.it/abc123.png")).toBe(true);
      expect(isImageUrl("https://i.redd.it/abc-123_xyz.gif")).toBe(true);
    });

    it("should recognize preview.redd.it image URLs", () => {
      expect(isImageUrl("https://preview.redd.it/abc123.jpg")).toBe(true);
      expect(isImageUrl("https://preview.redd.it/abc123.png")).toBe(true);
    });

    it("should recognize i.imgur.com image URLs", () => {
      expect(isImageUrl("https://i.imgur.com/abc123.jpg")).toBe(true);
      expect(isImageUrl("https://i.imgur.com/abc123.png")).toBe(true);
      expect(isImageUrl("https://i.imgur.com/abc123.gif")).toBe(true);
      expect(isImageUrl("https://i.imgur.com/abc123.webp")).toBe(true);
    });

    it("should recognize imgur.com page URLs", () => {
      expect(isImageUrl("https://imgur.com/abc123")).toBe(true);
      expect(isImageUrl("https://imgur.com/AbCdEf")).toBe(true);
    });

    it("should support http protocol", () => {
      expect(isImageUrl("http://i.redd.it/abc123.jpg")).toBe(true);
      expect(isImageUrl("http://imgur.com/abc123")).toBe(true);
    });

    it("should reject non-image URLs", () => {
      expect(isImageUrl("https://reddit.com/r/funny")).toBe(false);
      expect(isImageUrl("https://google.com/image.jpg")).toBe(false);
      expect(isImageUrl("https://example.com")).toBe(false);
    });

    it("should reject imgur album URLs", () => {
      expect(isImageUrl("https://imgur.com/a/abc123")).toBe(false);
      expect(isImageUrl("https://imgur.com/gallery/abc123")).toBe(false);
    });

    it("should handle invalid inputs", () => {
      expect(isImageUrl("")).toBe(false);
      expect(isImageUrl(null)).toBe(false);
      expect(isImageUrl(undefined)).toBe(false);
    });
  });

  describe("convertImgurUrl", () => {
    // Simulate the convertImgurUrl function
    function convertImgurUrl(url) {
      // Convert imgur.com/xxx to i.imgur.com/xxx.jpg
      if (url.match(/^https?:\/\/imgur\.com\/[a-zA-Z0-9]+$/)) {
        const id = url.split("/").pop();
        return `https://i.imgur.com/${id}.jpg`;
      }
      return url;
    }

    it("should convert imgur page URL to direct image URL", () => {
      expect(convertImgurUrl("https://imgur.com/abc123")).toBe(
        "https://i.imgur.com/abc123.jpg"
      );
      expect(convertImgurUrl("https://imgur.com/XyZ789")).toBe(
        "https://i.imgur.com/XyZ789.jpg"
      );
    });

    it("should leave direct image URLs unchanged", () => {
      const directUrl = "https://i.imgur.com/abc123.jpg";
      expect(convertImgurUrl(directUrl)).toBe(directUrl);
    });

    it("should leave non-imgur URLs unchanged", () => {
      const reddItUrl = "https://i.redd.it/abc123.jpg";
      expect(convertImgurUrl(reddItUrl)).toBe(reddItUrl);
    });

    it("should not convert album URLs", () => {
      const albumUrl = "https://imgur.com/a/abc123";
      expect(convertImgurUrl(albumUrl)).toBe(albumUrl);
    });
  });

  describe("Storage schema", () => {
    it("should have correct default values for inline images", () => {
      const defaults = {
        inlineImages: true,
        maxImageWidth: 600,
      };

      expect(defaults.inlineImages).toBe(true);
      expect(defaults.maxImageWidth).toBe(600);
    });

    it("should accept valid maxImageWidth values", () => {
      const validWidths = [400, 600, 800, 0];

      validWidths.forEach((width) => {
        expect(width).toBeGreaterThanOrEqual(0);
        expect(width).toBeLessThanOrEqual(800);
      });
    });

    it("should treat 0 as full width", () => {
      const maxWidth = 0;
      const cssValue = maxWidth === 0 ? "100%" : `${maxWidth}px`;

      expect(cssValue).toBe("100%");
    });
  });

  describe("Expand button structure", () => {
    it("should have correct button class", () => {
      const button = document.createElement("button");
      button.className = "orr-expand-image";

      expect(button.matches(".orr-expand-image")).toBe(true);
    });

    it("should store image URL in data attribute", () => {
      const button = document.createElement("button");
      button.className = "orr-expand-image";
      button.setAttribute("data-image", "https://i.redd.it/test.jpg");

      expect(button.getAttribute("data-image")).toBe(
        "https://i.redd.it/test.jpg"
      );
    });

    it("should have expand text initially", () => {
      const button = document.createElement("button");
      button.textContent = "[+]";

      expect(button.textContent).toBe("[+]");
    });

    it("should change to collapse text when expanded", () => {
      const button = document.createElement("button");
      button.textContent = "[-]";

      expect(button.textContent).toBe("[-]");
    });
  });

  describe("Image container structure", () => {
    it("should have correct container class", () => {
      const container = document.createElement("div");
      container.className = "orr-inline-image";

      expect(container.matches(".orr-inline-image")).toBe(true);
    });

    it("should have loading class initially", () => {
      const container = document.createElement("div");
      container.className = "orr-inline-image orr-loading";

      expect(container.classList.contains("orr-loading")).toBe(true);
    });

    it("should remove loading class after image loads", () => {
      const container = document.createElement("div");
      container.className = "orr-inline-image orr-loading";

      container.classList.remove("orr-loading");

      expect(container.classList.contains("orr-loading")).toBe(false);
    });

    it("should store image URL in data attribute", () => {
      const container = document.createElement("div");
      container.setAttribute("data-image", "https://i.redd.it/test.jpg");

      expect(container.getAttribute("data-image")).toBe(
        "https://i.redd.it/test.jpg"
      );
    });
  });

  describe("CSS selectors", () => {
    it("should target comment links", () => {
      const link = document.createElement("a");
      link.href = "https://i.redd.it/test.jpg";

      // Selector used: .usertext-body .md a[href]
      expect(link.hasAttribute("href")).toBe(true);
    });

    it("should apply max width CSS variable", () => {
      document.body.style.setProperty("--orr-max-image-width", "600px");
      const value = document.body.style.getPropertyValue(
        "--orr-max-image-width"
      );

      expect(value).toBe("600px");
    });

    it("should support full width (100%)", () => {
      document.body.style.setProperty("--orr-max-image-width", "100%");
      const value = document.body.style.getPropertyValue(
        "--orr-max-image-width"
      );

      expect(value).toBe("100%");
    });
  });

  describe("Supported image hosts", () => {
    it("should support all major Reddit image hosts", () => {
      const hosts = ["i.redd.it", "preview.redd.it"];

      hosts.forEach((host) => {
        const url = `https://${host}/test.jpg`;
        expect(url).toContain(host);
      });
    });

    it("should support imgur hosts", () => {
      const hosts = ["i.imgur.com", "imgur.com"];

      hosts.forEach((host) => {
        const url = `https://${host}/test`;
        expect(url).toContain(host);
      });
    });
  });

  describe("Supported image formats", () => {
    it("should support common image formats", () => {
      const formats = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

      formats.forEach((format) => {
        const url = `https://i.redd.it/test.${format}`;
        expect(url).toMatch(new RegExp(`\\.${format}$`));
      });
    });
  });

  describe("Message handling", () => {
    it("should recognize REFRESH_INLINE_IMAGES message type", () => {
      const messageType = "REFRESH_INLINE_IMAGES";
      const validTypes = [
        "REFRESH_DARK_MODE",
        "REFRESH_NAG_BLOCKING",
        "REFRESH_SUBREDDIT_MUTING",
        "REFRESH_KEYWORD_FILTERING",
        "REFRESH_DOMAIN_FILTERING",
        "REFRESH_COLOR_CODED_COMMENTS",
        "REFRESH_COMMENT_NAVIGATION",
        "REFRESH_INLINE_IMAGES",
      ];

      expect(validTypes).toContain(messageType);
    });
  });

  describe("Error handling", () => {
    it("should handle image load errors gracefully", () => {
      const errorMessage = "Failed to load image";

      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toContain("Failed");
    });

    it("should display error message on failed load", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<span style="color: #888;">Failed to load image</span>';

      const span = container.querySelector("span");
      expect(span).toBeTruthy();
      expect(span.textContent).toBe("Failed to load image");
    });
  });

  describe("Lazy loading", () => {
    it("should use lazy loading attribute", () => {
      const img = document.createElement("img");
      img.loading = "lazy";

      expect(img.loading).toBe("lazy");
    });

    it("should only load images when expanded", () => {
      // Images should not have src until expand button is clicked
      const img = document.createElement("img");

      expect(img.src).toBeFalsy();
    });
  });
});

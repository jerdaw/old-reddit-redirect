import { describe, it, expect } from "vitest";

/**
 * Allowlisted path prefixes that should not be redirected to old Reddit
 * (mirrors the list in background.js)
 */
const ALLOWLISTED_PREFIXES = [
  "/media",
  "/mod",
  "/poll",
  "/settings",
  "/topics",
  "/vault",
  "/avatar",
  "/talk",
  "/coins",
  "/premium",
  "/predictions",
  "/rpan",
];

/**
 * Transform a Reddit URL to old.reddit.com
 * Returns null if the URL should be skipped (allowlisted)
 * Mirrors the logic in background.js switchAllTabsToOld()
 */
function transformToOld(urlString) {
  const url = new URL(urlString);

  // Skip allowlisted paths
  if (ALLOWLISTED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return null;
  }

  // Transform gallery URLs: /gallery/ID → /comments/ID
  if (url.pathname.startsWith("/gallery/")) {
    url.pathname = url.pathname.replace(/^\/gallery\//, "/comments/");
  }

  url.hostname = "old.reddit.com";
  return url.toString();
}

/**
 * Transform an old.reddit.com URL to www.reddit.com
 * Mirrors the logic in background.js switchAllTabsToNew()
 */
function transformToNew(urlString) {
  const url = new URL(urlString);
  url.hostname = "www.reddit.com";
  return url.toString();
}

describe("Switch All Tabs", () => {
  describe("Switch to Old Reddit", () => {
    it("should redirect www.reddit.com to old.reddit.com", () => {
      expect(transformToOld("https://www.reddit.com/r/javascript")).toBe(
        "https://old.reddit.com/r/javascript"
      );
    });

    it("should redirect reddit.com to old.reddit.com", () => {
      expect(transformToOld("https://reddit.com/r/programming")).toBe(
        "https://old.reddit.com/r/programming"
      );
    });

    it("should redirect new.reddit.com to old.reddit.com", () => {
      expect(transformToOld("https://new.reddit.com/r/webdev")).toBe(
        "https://old.reddit.com/r/webdev"
      );
    });

    it("should redirect np.reddit.com to old.reddit.com", () => {
      expect(transformToOld("https://np.reddit.com/r/news/comments/abc")).toBe(
        "https://old.reddit.com/r/news/comments/abc"
      );
    });

    it("should preserve path and query parameters", () => {
      expect(
        transformToOld(
          "https://www.reddit.com/r/test/comments/abc123?sort=new&limit=25"
        )
      ).toBe("https://old.reddit.com/r/test/comments/abc123?sort=new&limit=25");
    });

    it("should preserve hash fragments", () => {
      expect(
        transformToOld("https://www.reddit.com/r/test/comments/abc#thing_xyz")
      ).toBe("https://old.reddit.com/r/test/comments/abc#thing_xyz");
    });

    it("should redirect the front page", () => {
      expect(transformToOld("https://www.reddit.com/")).toBe(
        "https://old.reddit.com/"
      );
    });

    describe("Gallery URL transformation", () => {
      it("should transform /gallery/ID to /comments/ID", () => {
        expect(transformToOld("https://www.reddit.com/gallery/abc123")).toBe(
          "https://old.reddit.com/comments/abc123"
        );
      });

      it("should transform gallery URLs with trailing slash", () => {
        expect(transformToOld("https://www.reddit.com/gallery/xyz789/")).toBe(
          "https://old.reddit.com/comments/xyz789/"
        );
      });
    });

    describe("Allowlisted paths (should be skipped)", () => {
      it.each(ALLOWLISTED_PREFIXES)("should skip %s paths", (prefix) => {
        expect(
          transformToOld(`https://www.reddit.com${prefix}/something`)
        ).toBeNull();
      });

      it("should skip /settings exactly", () => {
        expect(transformToOld("https://www.reddit.com/settings")).toBeNull();
      });

      it("should skip nested allowlisted paths", () => {
        expect(
          transformToOld("https://www.reddit.com/mod/queue/modqueue")
        ).toBeNull();
      });

      it("should NOT skip paths that merely contain allowlisted names", () => {
        // /r/settings is a subreddit, not the /settings path
        expect(transformToOld("https://www.reddit.com/r/settings")).toBe(
          "https://old.reddit.com/r/settings"
        );
      });
    });
  });

  describe("Switch to New Reddit", () => {
    it("should redirect old.reddit.com to www.reddit.com", () => {
      expect(transformToNew("https://old.reddit.com/r/javascript")).toBe(
        "https://www.reddit.com/r/javascript"
      );
    });

    it("should preserve path and query parameters", () => {
      expect(
        transformToNew("https://old.reddit.com/r/test/comments/abc123?sort=new")
      ).toBe("https://www.reddit.com/r/test/comments/abc123?sort=new");
    });

    it("should preserve hash fragments", () => {
      expect(transformToNew("https://old.reddit.com/r/test#thing_xyz")).toBe(
        "https://www.reddit.com/r/test#thing_xyz"
      );
    });

    it("should redirect the front page", () => {
      expect(transformToNew("https://old.reddit.com/")).toBe(
        "https://www.reddit.com/"
      );
    });
  });

  describe("Allowlisted prefixes list", () => {
    it("should contain all expected prefixes", () => {
      expect(ALLOWLISTED_PREFIXES).toContain("/media");
      expect(ALLOWLISTED_PREFIXES).toContain("/mod");
      expect(ALLOWLISTED_PREFIXES).toContain("/poll");
      expect(ALLOWLISTED_PREFIXES).toContain("/settings");
      expect(ALLOWLISTED_PREFIXES).toContain("/topics");
      expect(ALLOWLISTED_PREFIXES).toContain("/vault");
      expect(ALLOWLISTED_PREFIXES).toContain("/avatar");
      expect(ALLOWLISTED_PREFIXES).toContain("/talk");
      expect(ALLOWLISTED_PREFIXES).toContain("/coins");
      expect(ALLOWLISTED_PREFIXES).toContain("/premium");
      expect(ALLOWLISTED_PREFIXES).toContain("/predictions");
      expect(ALLOWLISTED_PREFIXES).toContain("/rpan");
    });

    it("should have exactly 12 prefixes", () => {
      expect(ALLOWLISTED_PREFIXES).toHaveLength(12);
    });
  });
});

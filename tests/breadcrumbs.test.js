import { describe, it, expect, vi, beforeEach } from "vitest";
import { BreadcrumbsManager } from "../modules/comments/breadcrumbs.js";
import { getStorage } from "../modules/shared/storage-helpers.js";

// Mock storage
vi.mock("../modules/shared/storage-helpers.js", () => ({
  getStorage: vi.fn(),
}));

describe("BreadcrumbsManager", () => {
  let manager;

  beforeEach(() => {
    manager = new BreadcrumbsManager();
    document.body.innerHTML = "";
    vi.resetAllMocks();

    // Mock getStorage default
    getStorage.mockResolvedValue({
      breadcrumbs: { enabled: true, showOnScroll: true },
    });

    // Mock elementFromPoint
    document.elementFromPoint = vi.fn();
  });

  it("should initialize and create container if enabled", async () => {
    await manager.init();
    expect(document.getElementById("orr-breadcrumbs")).toBeTruthy();
    expect(document.getElementById("orr-breadcrumbs-style")).toBeTruthy();
  });

  it("should not initialize if disabled", async () => {
    getStorage.mockResolvedValue({
      breadcrumbs: { enabled: false },
    });

    await manager.init();
    expect(document.getElementById("orr-breadcrumbs")).toBeNull();
  });

  describe("Traversing Comments", () => {
    beforeEach(async () => {
      await manager.init();
      // Setup mock DOM structure for comments
      // .thing.comment -> .entry -> .usertext-body
      //   .child -> .sitetable -> .thing.comment (nested)

      const root = document.createElement("div");
      root.className = "sitetable";

      // Parent 1
      const p1 = createComment("t1_1", "User1", "Root comment");
      root.appendChild(p1);

      // Child of P1
      const p2 = createComment("t1_2", "User2", "Level 2");
      p1.querySelector(".child .sitetable").appendChild(p2);

      // Child of P2
      const p3 = createComment("t1_3", "User3", "Level 3");
      p2.querySelector(".child .sitetable").appendChild(p3);

      document.body.appendChild(root);
    });

    it("should extract ancestors correctly", () => {
      const p3 = document.querySelector(".thing.id-t1_3");
      const ancestors = manager.getAncestors(p3);

      expect(ancestors).toHaveLength(3);
      expect(ancestors[0].author).toBe("User1");
      expect(ancestors[1].author).toBe("User2");
      expect(ancestors[2].author).toBe("User3");
    });
  });

  function createComment(id, author, text) {
    const div = document.createElement("div");
    div.className = `thing comment id-${id}`;
    div.setAttribute("data-fullname", id);

    div.innerHTML = `
      <div class="entry">
        <p class="tagline"><a class="author">${author}</a></p>
        <div class="usertext-body">${text}</div>
      </div>
      <div class="child">
        <div class="sitetable"></div>
      </div>
    `;
    return div;
  }
});

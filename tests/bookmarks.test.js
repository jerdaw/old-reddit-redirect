import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookmarksManager } from "../modules/comments/bookmarks.js";
import { getStorage, setStorage } from "../modules/shared/storage-helpers.js";

// Mock storage
vi.mock("../modules/shared/storage-helpers.js", () => ({
  getStorage: vi.fn(),
  setStorage: vi.fn(),
}));

describe("BookmarksManager", () => {
  let manager;

  beforeEach(() => {
    manager = new BookmarksManager();
    document.body.innerHTML = "";
    vi.resetAllMocks();

    getStorage.mockResolvedValue({
      bookmarks: { enabled: true, maxBookmarks: 2, entries: [] },
    });
  });

  it("should inject styles on init", async () => {
    await manager.init();
    expect(document.getElementById("orr-bookmarks-style")).toBeTruthy();
  });

  it("should inject bookmark buttons into comments", async () => {
    // Setup DOM
    const div = document.createElement("div");
    div.className = "thing comment id-t1_test1";
    div.setAttribute("data-fullname", "t1_test1");
    div.innerHTML = `
      <div class="entry">
        <ul class="flat-list buttons">
          <li><a href="#">permalink</a></li>
        </ul>
        <div class="usertext-body">Comment body</div>
      </div>
    `;
    document.body.appendChild(div);

    await manager.init();

    expect(document.querySelector(".orr-bookmark-btn")).toBeTruthy();
  });

  it("should toggle bookmark state and save to storage", async () => {
    // Setup DOM
    const div = document.createElement("div");
    div.className = "thing comment id-t1_test1";
    div.setAttribute("data-fullname", "t1_test1");
    div.innerHTML = `
      <div class="entry">
        <ul class="flat-list buttons"></ul>
        <div class="usertext-body">Comment body</div>
      </div>
    `;
    document.body.appendChild(div);

    await manager.init();

    const btn = document.querySelector(".orr-bookmark-btn");

    // Click to add
    await manager.toggleBookmark("t1_test1", btn);

    expect(setStorage).toHaveBeenCalledWith(
      expect.objectContaining({
        bookmarks: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({ id: "t1_test1" }),
          ]),
        }),
      })
    );
    expect(btn.classList.contains("active")).toBe(true);

    // Click to remove
    await manager.toggleBookmark("t1_test1", btn);

    expect(setStorage).toHaveBeenCalledWith(
      expect.objectContaining({
        bookmarks: expect.objectContaining({
          entries: [],
        }),
      })
    );
    expect(btn.classList.contains("active")).toBe(false);
  });

  it("should respect LRU limit", async () => {
    getStorage.mockResolvedValue({
      bookmarks: { enabled: true, maxBookmarks: 2, entries: [] },
    });

    await manager.init();

    // Mock the button element as we are calling toggleBookmark directly
    const btn = document.createElement("a");
    document.body.appendChild(btn);

    // Add 3 items
    await manager.toggleBookmark("1", btn);
    await manager.toggleBookmark("2", btn);
    await manager.toggleBookmark("3", btn);

    expect(manager.bookmarks.length).toBe(2);
    expect(manager.bookmarks[0].id).toBe("2");
    expect(manager.bookmarks[1].id).toBe("3");
    // "1" should be removed
  });
});

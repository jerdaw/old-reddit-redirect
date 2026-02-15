import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchManager } from "../modules/comments/search.js";
import { getStorage } from "../modules/shared/storage-helpers.js";

// Mock storage
vi.mock("../modules/shared/storage-helpers.js", () => ({
  getStorage: vi.fn(),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe("SearchManager", () => {
  let manager;

  beforeEach(() => {
    manager = new SearchManager();
    document.body.innerHTML = "";
    vi.resetAllMocks();

    getStorage.mockResolvedValue({
      commentSearch: { enabled: true, highlightColor: "#ffeb3b" },
    });
  });

  it("should create widget on init", async () => {
    await manager.init();
    expect(document.querySelector(".orr-search-widget")).toBeTruthy();
    expect(document.getElementById("orr-search-style")).toBeTruthy();
  });

  it("should not create widget if disabled", async () => {
    getStorage.mockResolvedValue({
      commentSearch: { enabled: false },
    });

    await manager.init();
    expect(document.querySelector(".orr-search-widget")).toBeNull();
  });

  it("should open and close widget", async () => {
    await manager.init();

    manager.open();
    expect(document.querySelector(".orr-search-widget.visible")).toBeTruthy();
    expect(manager.isActive).toBe(true);

    manager.close();
    expect(document.querySelector(".orr-search-widget.visible")).toBeNull();
    expect(manager.isActive).toBe(false);
  });

  it("should execute search and highlight matches", async () => {
    await manager.init();

    // Create dummy comments
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="entry">
        <div class="usertext-body">Here is a test comment.</div>
      </div>
      <div class="entry">
        <div class="usertext-body">Another Test comment here.</div>
      </div>
    `;
    document.body.appendChild(div);

    // Perform search
    manager.performSearch("test");

    // Should match 2 times (case insensitive)
    expect(manager.matches.length).toBe(2);

    // Check highlights exist
    const highlights = document.querySelectorAll(".orr-search-match");
    expect(highlights.length).toBe(2);
    expect(highlights[0].textContent.toLowerCase()).toBe("test");
  });

  it("should clear highlights on close", async () => {
    await manager.init();

    // Setup matches
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="entry">
        <div class="usertext-body">Test content</div>
      </div>
    `;
    document.body.appendChild(div);

    manager.performSearch("test");
    expect(document.querySelectorAll(".orr-search-match").length).toBe(1);

    manager.close();
    expect(document.querySelectorAll(".orr-search-match").length).toBe(0);
    // Text should be restored
    expect(document.querySelector(".usertext-body").textContent).toBe(
      "Test content"
    );
  });
});

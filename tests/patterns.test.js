import { describe, it, expect } from "vitest";
import { loadRules } from "./setup.js";

const rules = loadRules();

function findRuleById(id) {
  return rules.find((r) => r.id === id);
}

function testRegex(pattern, url) {
  const regex = new RegExp(pattern);
  return regex.test(url);
}

describe("Domain redirect patterns", () => {
  const rule20 = findRuleById(20);

  it("should match www.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://www.reddit.com/r/test")
    ).toBe(true);
  });

  it("should match np.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://np.reddit.com/r/test")
    ).toBe(true);
  });

  it("should match nr.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://nr.reddit.com/r/test")
    ).toBe(true);
  });

  it("should match ns.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://ns.reddit.com/r/test")
    ).toBe(true);
  });

  it("should match amp.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://amp.reddit.com/r/test")
    ).toBe(true);
  });

  it("should match i.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://i.reddit.com/r/test")
    ).toBe(true);
  });

  it("should match m.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://m.reddit.com/r/test")
    ).toBe(true);
  });

  it("should NOT match old.reddit.com", () => {
    expect(
      testRegex(rule20.condition.regexFilter, "https://old.reddit.com/r/test")
    ).toBe(false);
  });
});

describe("Gallery redirect pattern", () => {
  const rule11 = findRuleById(11);

  it("should match gallery URLs", () => {
    expect(
      testRegex(
        rule11.condition.regexFilter,
        "https://www.reddit.com/gallery/abc123"
      )
    ).toBe(true);
    expect(
      testRegex(
        rule11.condition.regexFilter,
        "https://reddit.com/gallery/xyz789"
      )
    ).toBe(true);
  });

  it("should capture the gallery ID correctly", () => {
    const regex = new RegExp(rule11.condition.regexFilter);
    const match = "https://www.reddit.com/gallery/abc123".match(regex);
    expect(match[2]).toBe("abc123");
  });
});

describe("Videos redirect pattern", () => {
  const rule12 = findRuleById(12);

  it("should match video URLs", () => {
    expect(
      testRegex(
        rule12.condition.regexFilter,
        "https://www.reddit.com/video/abc123"
      )
    ).toBe(true);
    expect(
      testRegex(
        rule12.condition.regexFilter,
        "https://www.reddit.com/videos/xyz789"
      )
    ).toBe(true);
  });

  it("should capture the video ID correctly", () => {
    const regex = new RegExp(rule12.condition.regexFilter);
    const match = "https://www.reddit.com/video/abc123".match(regex);
    expect(match[2]).toBe("abc123");
  });

  it("should match video URLs with a title slug", () => {
    expect(
      testRegex(
        rule12.condition.regexFilter,
        "https://www.reddit.com/videos/1miong5/some_title_slug/"
      )
    ).toBe(true);
  });

  it("should capture ID and slug together for correct redirect", () => {
    const regex = new RegExp(rule12.condition.regexFilter);
    const match =
      "https://www.reddit.com/videos/1miong5/some_title_slug/".match(regex);
    expect(match[2]).toBe("1miong5/some_title_slug");
  });
});

describe("Allowlist patterns", () => {
  const rule1 = findRuleById(1);
  const rule2 = findRuleById(2);

  it("should allowlist /settings", () => {
    expect(
      testRegex(rule1.condition.regexFilter, "https://www.reddit.com/settings")
    ).toBe(true);
    expect(
      testRegex(
        rule1.condition.regexFilter,
        "https://www.reddit.com/settings/profile"
      )
    ).toBe(true);
  });

  it("should allowlist /media", () => {
    expect(
      testRegex(rule1.condition.regexFilter, "https://www.reddit.com/media")
    ).toBe(true);
  });

  it("should allowlist /notifications", () => {
    expect(
      testRegex(
        rule2.condition.regexFilter,
        "https://www.reddit.com/notifications"
      )
    ).toBe(true);
  });

  it("should NOT allowlist share links (they get redirected)", () => {
    expect(
      testRegex(
        rule2.condition.regexFilter,
        "https://www.reddit.com/r/javascript/s/abc123"
      )
    ).toBe(false);
  });

  it("should NOT allowlist regular subreddit paths", () => {
    expect(
      testRegex(
        rule1.condition.regexFilter,
        "https://www.reddit.com/r/javascript"
      )
    ).toBe(false);
    expect(
      testRegex(
        rule2.condition.regexFilter,
        "https://www.reddit.com/r/javascript"
      )
    ).toBe(false);
  });
});

describe("Onion domain pattern", () => {
  const rule22 = findRuleById(22);

  it("should match reddit.com.onion", () => {
    expect(
      testRegex(rule22.condition.regexFilter, "https://reddit.com.onion/r/test")
    ).toBe(true);
    expect(
      testRegex(rule22.condition.regexFilter, "http://reddit.com.onion/r/test")
    ).toBe(true);
  });

  it("should match www.reddit.com.onion", () => {
    expect(
      testRegex(
        rule22.condition.regexFilter,
        "https://www.reddit.com.onion/r/test"
      )
    ).toBe(true);
  });
});

describe("i.redd.it header modification", () => {
  const rule10 = findRuleById(10);

  it("should match i.redd.it", () => {
    expect(
      testRegex(rule10.condition.regexFilter, "https://i.redd.it/abc123.jpg")
    ).toBe(true);
  });

  it("should match preview.redd.it", () => {
    expect(
      testRegex(
        rule10.condition.regexFilter,
        "https://preview.redd.it/abc123.jpg"
      )
    ).toBe(true);
  });
});

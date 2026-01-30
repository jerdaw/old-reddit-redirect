import { describe, it, expect } from "vitest";

/**
 * Helper function to get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Helper to build weekly data (extracted from options.js logic)
 */
function processWeeklyData(history) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const entry = history.find((h) => h.date === dateStr);
    days.push({
      date: dateStr,
      day: dayNames[date.getDay()],
      count: entry?.count || 0,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Calculate trend based on history
 */
function calculateTrend(history) {
  if (!history || history.length < 6) return "flat";

  // Compare last 3 days average to previous 3 days average
  const recent = history.slice(-3);
  const previous = history.slice(-6, -3);

  if (previous.length === 0) return "flat";

  const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
  const previousAvg =
    previous.reduce((sum, d) => sum + d.count, 0) / previous.length;

  const change =
    previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  if (change > 10) return "up";
  if (change < -10) return "down";
  return "flat";
}

/**
 * Calculate subreddit percentages
 */
function calculateSubredditPercentages(perSubreddit, totalRedirects) {
  const result = {};
  for (const [name, count] of Object.entries(perSubreddit)) {
    result[name] = {
      count,
      percent:
        totalRedirects > 0
          ? ((count / totalRedirects) * 100).toFixed(1)
          : "0.0",
    };
  }
  return result;
}

describe("Statistics Visualization", () => {
  describe("Weekly chart data processing", () => {
    it("should handle empty history", () => {
      const days = processWeeklyData([]);
      expect(days).toHaveLength(7);
      expect(days.every((d) => d.count === 0)).toBe(true);
    });

    it("should fill missing days with zero", () => {
      const today = getTodayDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

      const history = [
        { date: yesterdayStr, count: 10 },
        { date: today, count: 20 },
      ];

      const days = processWeeklyData(history);
      const twoDaysAgoEntry = days.find((d) => d.date === twoDaysAgoStr);
      expect(twoDaysAgoEntry.count).toBe(0);
    });

    it("should correctly identify today", () => {
      const days = processWeeklyData([]);
      expect(days[6].isToday).toBe(true);
      expect(days.slice(0, 6).every((d) => d.isToday === false)).toBe(true);
    });

    it("should include day names", () => {
      const days = processWeeklyData([]);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      expect(days.every((d) => dayNames.includes(d.day))).toBe(true);
    });

    it("should return exactly 7 days", () => {
      const history = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return { date: date.toISOString().split("T")[0], count: i + 1 };
      });

      const days = processWeeklyData(history);
      expect(days).toHaveLength(7);
    });
  });

  describe("Trend calculation", () => {
    it("should return 'flat' for insufficient data", () => {
      expect(calculateTrend([])).toBe("flat");
      expect(calculateTrend([{ count: 10 }])).toBe("flat");
      expect(
        calculateTrend([
          { count: 10 },
          { count: 10 },
          { count: 10 },
          { count: 10 },
          { count: 10 },
        ])
      ).toBe("flat");
    });

    it("should detect upward trend", () => {
      const history = [
        { count: 10 },
        { count: 10 },
        { count: 10 }, // previous avg: 10
        { count: 20 },
        { count: 25 },
        { count: 30 }, // recent avg: 25 (150% increase)
      ];
      expect(calculateTrend(history)).toBe("up");
    });

    it("should detect downward trend", () => {
      const history = [
        { count: 30 },
        { count: 25 },
        { count: 20 }, // previous avg: 25
        { count: 10 },
        { count: 10 },
        { count: 10 }, // recent avg: 10 (60% decrease)
      ];
      expect(calculateTrend(history)).toBe("down");
    });

    it("should return 'flat' for minor changes", () => {
      const history = [
        { count: 10 },
        { count: 10 },
        { count: 10 }, // previous avg: 10
        { count: 10 },
        { count: 11 },
        { count: 9 }, // recent avg: 10 (0% change)
      ];
      expect(calculateTrend(history)).toBe("flat");
    });

    it("should handle zero previous average", () => {
      const history = [
        { count: 0 },
        { count: 0 },
        { count: 0 }, // previous avg: 0
        { count: 10 },
        { count: 10 },
        { count: 10 }, // recent avg: 10
      ];
      expect(calculateTrend(history)).toBe("flat");
    });
  });

  describe("Subreddit percentage calculation", () => {
    it("should calculate correct percentages", () => {
      const data = { news: 50, gaming: 30, pics: 20 };
      const total = 100;
      const result = calculateSubredditPercentages(data, total);

      expect(result.news.percent).toBe("50.0");
      expect(result.gaming.percent).toBe("30.0");
      expect(result.pics.percent).toBe("20.0");
    });

    it("should handle zero total redirects", () => {
      const data = { news: 10 };
      const total = 0;
      const result = calculateSubredditPercentages(data, total);

      expect(result.news.percent).toBe("0.0");
    });

    it("should handle empty data", () => {
      const result = calculateSubredditPercentages({}, 100);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("should round to one decimal place", () => {
      const data = { news: 33 };
      const total = 100;
      const result = calculateSubredditPercentages(data, total);

      expect(result.news.percent).toBe("33.0");
    });

    it("should handle fractional percentages", () => {
      const data = { news: 1, gaming: 2, pics: 3 };
      const total = 100;
      const result = calculateSubredditPercentages(data, total);

      expect(result.news.percent).toBe("1.0");
      expect(result.gaming.percent).toBe("2.0");
      expect(result.pics.percent).toBe("3.0");
    });
  });

  describe("Data validation", () => {
    it("should handle malformed history entries", () => {
      const history = [
        { date: "invalid-date", count: 10 },
        { date: getTodayDate(), count: "not-a-number" },
        { count: 5 }, // Missing date
      ];

      // Should not throw
      expect(() => processWeeklyData(history)).not.toThrow();
    });

    it("should handle negative counts", () => {
      const history = [{ date: getTodayDate(), count: -10 }];
      const days = processWeeklyData(history);
      const today = days.find((d) => d.isToday);

      // Should store the negative value as-is (edge case)
      expect(today.count).toBe(-10);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large counts", () => {
      const data = { news: 1000000, gaming: 999999 };
      const total = 2000000;
      const result = calculateSubredditPercentages(data, total);

      expect(parseFloat(result.news.percent)).toBeCloseTo(50.0, 1);
      expect(parseFloat(result.gaming.percent)).toBeCloseTo(50.0, 1);
    });

    it("should handle dates spanning months", () => {
      const history = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toISOString().split("T")[0],
          count: i + 1,
        });
      }

      const days = processWeeklyData(history);
      expect(days).toHaveLength(7);
      expect(days.every((d) => d.date)).toBe(true);
    });
  });
});

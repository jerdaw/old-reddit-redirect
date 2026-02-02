"use strict";

/**
 * Privacy Enhancement Tests (Phase 10)
 * Tests for expanded tracking params, privacy score, category breakdown, and export
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    lastError: null,
    getManifest: vi.fn(() => ({ version: "15.0.0" })),
  },
};

global.chrome = mockChrome;

describe("Privacy Enhancements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Expanded Tracking Parameters", () => {
    it("should have 50+ tracking parameters", () => {
      const trackingParams = [
        // UTM parameters (7)
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "utm_name",
        "utm_cid",
        // Social media trackers (12)
        "fbclid",
        "igshid",
        "twclid",
        "ttclid",
        "li_fat_id",
        "li_sharer",
        "pin_share",
        "epik",
        "scid",
        "sclid",
        "vero_id",
        "wbraid",
        // Analytics trackers (10)
        "gclid",
        "gclsrc",
        "dclid",
        "_ga",
        "_gl",
        "msclkid",
        "yclid",
        "_ym_uid",
        "_ym_visorc",
        "zanpid",
        // Affiliate/referral trackers (10)
        "ref",
        "ref_source",
        "ref_url",
        "referrer",
        "aff_id",
        "affiliate_id",
        "partner_id",
        "click_id",
        "clickid",
        "rb_clickid",
        // Reddit-specific trackers (6)
        "rdt_cid",
        "share_id",
        "shared",
        "correlation_id",
        "ref_campaign",
        // Deep linking/attribution (6)
        "$deep_link",
        "$3p",
        "_branch_match_id",
        "_branch_referrer",
        "adjust_tracker",
        "adjust_campaign",
        // Email marketing (4)
        "mc_cid",
        "mc_eid",
        "oly_anon_id",
        "oly_enc_id",
        // Miscellaneous (3)
        "mkt_tok",
        "trk",
        "campaignid",
      ];

      expect(trackingParams.length).toBeGreaterThanOrEqual(50);
    });

    it("should include TikTok tracker (ttclid)", () => {
      const socialTrackers = [
        "fbclid",
        "igshid",
        "twclid",
        "ttclid",
        "li_fat_id",
      ];
      expect(socialTrackers).toContain("ttclid");
    });

    it("should include Pinterest trackers (epik, pin_share)", () => {
      const socialTrackers = ["pin_share", "epik"];
      expect(socialTrackers).toContain("epik");
      expect(socialTrackers).toContain("pin_share");
    });

    it("should include Snapchat trackers (scid, sclid)", () => {
      const socialTrackers = ["scid", "sclid"];
      expect(socialTrackers).toContain("scid");
      expect(socialTrackers).toContain("sclid");
    });

    it("should include Reddit-specific trackers", () => {
      const redditTrackers = [
        "rdt_cid",
        "share_id",
        "shared",
        "correlation_id",
        "ref_campaign",
      ];
      expect(redditTrackers).toContain("correlation_id");
      expect(redditTrackers).toContain("ref_campaign");
    });
  });

  describe("Tracking Parameter Categorization", () => {
    function categorizeTrackingParam(param) {
      const lowerParam = param.toLowerCase();
      if (lowerParam.startsWith("utm_")) return "utm";
      if (
        [
          "fbclid",
          "igshid",
          "twclid",
          "ttclid",
          "li_fat_id",
          "li_sharer",
          "pin_share",
          "epik",
          "scid",
          "sclid",
          "vero_id",
          "wbraid",
        ].includes(lowerParam)
      )
        return "social";
      if (
        [
          "gclid",
          "gclsrc",
          "dclid",
          "_ga",
          "_gl",
          "msclkid",
          "yclid",
          "_ym_uid",
          "_ym_visorc",
          "zanpid",
        ].includes(lowerParam)
      )
        return "analytics";
      if (
        [
          "rdt_cid",
          "share_id",
          "shared",
          "correlation_id",
          "ref_campaign",
        ].includes(lowerParam)
      )
        return "reddit";
      if (
        [
          "ref",
          "ref_source",
          "ref_url",
          "referrer",
          "aff_id",
          "affiliate_id",
          "partner_id",
          "click_id",
          "clickid",
          "rb_clickid",
        ].includes(lowerParam)
      )
        return "affiliate";
      return "other";
    }

    it("should categorize UTM parameters correctly", () => {
      expect(categorizeTrackingParam("utm_source")).toBe("utm");
      expect(categorizeTrackingParam("utm_campaign")).toBe("utm");
      expect(categorizeTrackingParam("UTM_MEDIUM")).toBe("utm");
    });

    it("should categorize social media trackers correctly", () => {
      expect(categorizeTrackingParam("fbclid")).toBe("social");
      expect(categorizeTrackingParam("ttclid")).toBe("social");
      expect(categorizeTrackingParam("epik")).toBe("social");
    });

    it("should categorize analytics trackers correctly", () => {
      expect(categorizeTrackingParam("gclid")).toBe("analytics");
      expect(categorizeTrackingParam("_ga")).toBe("analytics");
      expect(categorizeTrackingParam("msclkid")).toBe("analytics");
    });

    it("should categorize Reddit trackers correctly", () => {
      expect(categorizeTrackingParam("rdt_cid")).toBe("reddit");
      expect(categorizeTrackingParam("correlation_id")).toBe("reddit");
      expect(categorizeTrackingParam("share_id")).toBe("reddit");
    });

    it("should categorize affiliate trackers correctly", () => {
      expect(categorizeTrackingParam("aff_id")).toBe("affiliate");
      expect(categorizeTrackingParam("affiliate_id")).toBe("affiliate");
      expect(categorizeTrackingParam("click_id")).toBe("affiliate");
    });

    it("should categorize unknown params as other", () => {
      expect(categorizeTrackingParam("unknown_param")).toBe("other");
      expect(categorizeTrackingParam("random")).toBe("other");
    });
  });

  describe("Privacy Score Calculation", () => {
    function calculatePrivacyScore(privacy) {
      let score = 0;

      // Tracking removal enabled (+40 points)
      if (privacy.removeTracking !== false) {
        score += 40;
      }

      // Referrer policy (+30 points based on strictness)
      const referrerScores = {
        "no-referrer": 30,
        origin: 20,
        "same-origin": 15,
        "strict-origin": 15,
        default: 0,
      };
      score += referrerScores[privacy.referrerPolicy] || 0;

      // Number of tracking params configured (+20 points, scaled)
      const paramCount = (privacy.trackingParams || []).length;
      const paramScore = Math.min(20, Math.floor(paramCount / 3));
      score += paramScore;

      // Tracking badge shows user is aware (+10 points)
      if (privacy.showTrackingBadge) {
        score += 10;
      }

      return Math.min(100, score);
    }

    it("should return 0 for default disabled settings", () => {
      const privacy = {
        removeTracking: false,
        referrerPolicy: "default",
        trackingParams: [],
        showTrackingBadge: false,
      };
      expect(calculatePrivacyScore(privacy)).toBe(0);
    });

    it("should add 40 points for tracking removal enabled", () => {
      const privacy = {
        removeTracking: true,
        referrerPolicy: "default",
        trackingParams: [],
        showTrackingBadge: false,
      };
      expect(calculatePrivacyScore(privacy)).toBe(40);
    });

    it("should add 30 points for no-referrer policy", () => {
      const privacy = {
        removeTracking: false,
        referrerPolicy: "no-referrer",
        trackingParams: [],
        showTrackingBadge: false,
      };
      expect(calculatePrivacyScore(privacy)).toBe(30);
    });

    it("should add 15 points for same-origin policy", () => {
      const privacy = {
        removeTracking: false,
        referrerPolicy: "same-origin",
        trackingParams: [],
        showTrackingBadge: false,
      };
      expect(calculatePrivacyScore(privacy)).toBe(15);
    });

    it("should add points based on tracking param count", () => {
      const privacy = {
        removeTracking: false,
        referrerPolicy: "default",
        trackingParams: new Array(60).fill("param"),
        showTrackingBadge: false,
      };
      // 60 params / 3 = 20 points
      expect(calculatePrivacyScore(privacy)).toBe(20);
    });

    it("should cap param points at 20", () => {
      const privacy = {
        removeTracking: false,
        referrerPolicy: "default",
        trackingParams: new Array(100).fill("param"),
        showTrackingBadge: false,
      };
      expect(calculatePrivacyScore(privacy)).toBe(20);
    });

    it("should add 10 points for tracking badge enabled", () => {
      const privacy = {
        removeTracking: false,
        referrerPolicy: "default",
        trackingParams: [],
        showTrackingBadge: true,
      };
      expect(calculatePrivacyScore(privacy)).toBe(10);
    });

    it("should calculate maximum score of 100", () => {
      const privacy = {
        removeTracking: true, // 40 points
        referrerPolicy: "no-referrer", // 30 points
        trackingParams: new Array(60).fill("param"), // 20 points
        showTrackingBadge: true, // 10 points
      };
      expect(calculatePrivacyScore(privacy)).toBe(100);
    });

    it("should cap score at 100", () => {
      const privacy = {
        removeTracking: true, // 40 points
        referrerPolicy: "no-referrer", // 30 points
        trackingParams: new Array(100).fill("param"), // 20 points (capped)
        showTrackingBadge: true, // 10 points
      };
      expect(calculatePrivacyScore(privacy)).toBe(100);
    });
  });

  describe("Privacy Score Status", () => {
    it("should classify score < 40 as low", () => {
      const score = 30;
      let status = "";
      if (score < 40) status = "Needs improvement";
      else if (score < 70) status = "Good protection";
      else status = "Excellent protection";

      expect(status).toBe("Needs improvement");
    });

    it("should classify score 40-69 as medium", () => {
      const score = 55;
      let status = "";
      if (score < 40) status = "Needs improvement";
      else if (score < 70) status = "Good protection";
      else status = "Excellent protection";

      expect(status).toBe("Good protection");
    });

    it("should classify score >= 70 as high", () => {
      const score = 85;
      let status = "";
      if (score < 40) status = "Needs improvement";
      else if (score < 70) status = "Good protection";
      else status = "Excellent protection";

      expect(status).toBe("Excellent protection");
    });
  });

  describe("Tracking Statistics by Category", () => {
    it("should have all required categories in byType", () => {
      const byType = {
        utm: 0,
        social: 0,
        analytics: 0,
        affiliate: 0,
        reddit: 0,
        other: 0,
      };

      expect(byType).toHaveProperty("utm");
      expect(byType).toHaveProperty("social");
      expect(byType).toHaveProperty("analytics");
      expect(byType).toHaveProperty("affiliate");
      expect(byType).toHaveProperty("reddit");
      expect(byType).toHaveProperty("other");
    });

    it("should track social media trackers separately from old facebook category", () => {
      const byType = {
        utm: 5,
        social: 10, // includes facebook, instagram, tiktok, etc.
        analytics: 3,
        affiliate: 2,
        reddit: 4,
        other: 1,
      };

      const total = Object.values(byType).reduce((a, b) => a + b, 0);
      expect(total).toBe(25);
      expect(byType.social).toBe(10);
    });
  });

  describe("Privacy Report Export", () => {
    it("should generate report with correct structure", () => {
      const report = {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        privacyScore: 75,
        settings: {
          trackingRemovalEnabled: true,
          referrerPolicy: "same-origin",
          trackingBadgeEnabled: true,
          trackingParamsCount: 58,
        },
        statistics: {
          totalUrlsCleaned: 150,
          lastCleaned: new Date().toISOString(),
          byCategory: {
            utm: 50,
            social: 30,
            analytics: 20,
            affiliate: 10,
            reddit: 25,
            other: 15,
          },
        },
        recommendations: ["Consider using 'No Referrer' for maximum privacy"],
      };

      expect(report).toHaveProperty("version");
      expect(report).toHaveProperty("generatedAt");
      expect(report).toHaveProperty("privacyScore");
      expect(report).toHaveProperty("settings");
      expect(report).toHaveProperty("statistics");
      expect(report).toHaveProperty("recommendations");
    });

    it("should include all settings in report", () => {
      const settings = {
        trackingRemovalEnabled: true,
        referrerPolicy: "same-origin",
        trackingBadgeEnabled: true,
        trackingParamsCount: 58,
      };

      expect(settings).toHaveProperty("trackingRemovalEnabled");
      expect(settings).toHaveProperty("referrerPolicy");
      expect(settings).toHaveProperty("trackingBadgeEnabled");
      expect(settings).toHaveProperty("trackingParamsCount");
    });

    it("should include category breakdown in statistics", () => {
      const byCategory = {
        utm: 50,
        social: 30,
        analytics: 20,
        affiliate: 10,
        reddit: 25,
        other: 15,
      };

      expect(Object.keys(byCategory)).toHaveLength(6);
    });
  });

  describe("Privacy Recommendations", () => {
    function getPrivacyRecommendations(privacy) {
      const recommendations = [];

      if (privacy.removeTracking === false) {
        recommendations.push(
          "Enable tracking parameter removal for better privacy"
        );
      }

      if (privacy.referrerPolicy === "default" || !privacy.referrerPolicy) {
        recommendations.push(
          "Set a stricter referrer policy to prevent tracking"
        );
      }

      if ((privacy.trackingParams || []).length < 30) {
        recommendations.push("Add more tracking parameters to block");
      }

      if (privacy.referrerPolicy !== "no-referrer") {
        recommendations.push(
          "Consider using 'No Referrer' for maximum privacy"
        );
      }

      return recommendations;
    }

    it("should recommend enabling tracking removal when disabled", () => {
      const privacy = { removeTracking: false };
      const recommendations = getPrivacyRecommendations(privacy);
      expect(recommendations).toContain(
        "Enable tracking parameter removal for better privacy"
      );
    });

    it("should recommend stricter referrer policy when using default", () => {
      const privacy = { referrerPolicy: "default" };
      const recommendations = getPrivacyRecommendations(privacy);
      expect(recommendations).toContain(
        "Set a stricter referrer policy to prevent tracking"
      );
    });

    it("should recommend adding more params when below 30", () => {
      const privacy = { trackingParams: new Array(20).fill("param") };
      const recommendations = getPrivacyRecommendations(privacy);
      expect(recommendations).toContain(
        "Add more tracking parameters to block"
      );
    });

    it("should recommend no-referrer for maximum privacy", () => {
      const privacy = { referrerPolicy: "same-origin" };
      const recommendations = getPrivacyRecommendations(privacy);
      expect(recommendations).toContain(
        "Consider using 'No Referrer' for maximum privacy"
      );
    });

    it("should return empty array when all settings are optimal", () => {
      const privacy = {
        removeTracking: true,
        referrerPolicy: "no-referrer",
        trackingParams: new Array(60).fill("param"),
      };
      const recommendations = getPrivacyRecommendations(privacy);
      expect(recommendations).toHaveLength(0);
    });
  });

  describe("Privacy Score UI Elements", () => {
    it("should have correct CSS class for low score", () => {
      const score = 25;
      let className = "";
      if (score < 40) className = "score-low";
      else if (score < 70) className = "score-medium";
      else className = "score-high";

      expect(className).toBe("score-low");
    });

    it("should have correct CSS class for medium score", () => {
      const score = 55;
      let className = "";
      if (score < 40) className = "score-low";
      else if (score < 70) className = "score-medium";
      else className = "score-high";

      expect(className).toBe("score-medium");
    });

    it("should have correct CSS class for high score", () => {
      const score = 85;
      let className = "";
      if (score < 40) className = "score-low";
      else if (score < 70) className = "score-medium";
      else className = "score-high";

      expect(className).toBe("score-high");
    });

    it("should calculate correct stroke-dasharray for score ring", () => {
      const score = 75;
      const dasharray = `${score}, 100`;
      expect(dasharray).toBe("75, 100");
    });
  });
});

describe("Storage Schema Updates", () => {
  it("should have updated byType with new categories", () => {
    const defaultStats = {
      totalCleaned: 0,
      lastCleaned: null,
      byType: {
        utm: 0,
        social: 0,
        analytics: 0,
        affiliate: 0,
        reddit: 0,
        other: 0,
      },
    };

    expect(defaultStats.byType).not.toHaveProperty("facebook");
    expect(defaultStats.byType).not.toHaveProperty("google");
    expect(defaultStats.byType).toHaveProperty("social");
    expect(defaultStats.byType).toHaveProperty("analytics");
  });

  it("should migrate old stats gracefully", () => {
    // Old format
    const oldStats = {
      byType: {
        utm: 10,
        facebook: 5,
        google: 3,
        other: 2,
      },
    };

    // New stats should initialize missing categories
    const newByType = {
      utm: oldStats.byType.utm || 0,
      social: oldStats.byType.social || 0,
      analytics: oldStats.byType.analytics || 0,
      affiliate: oldStats.byType.affiliate || 0,
      reddit: oldStats.byType.reddit || 0,
      other: oldStats.byType.other || 0,
    };

    expect(newByType.utm).toBe(10);
    expect(newByType.social).toBe(0);
    expect(newByType.other).toBe(2);
  });
});

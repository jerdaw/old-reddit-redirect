import { describe, it, expect, vi, beforeEach } from "vitest";
import { ComplianceManager } from "../modules/core/compliance.js";

// Mock storage-helpers
vi.mock("../modules/shared/storage-helpers.js", () => ({
  getStorage: vi.fn(),
  setStorage: vi.fn(),
}));

// Mock debug-helpers
vi.mock("../modules/shared/debug-helpers.js", () => ({
  debugLog: vi.fn(),
}));

import { getStorage } from "../modules/shared/storage-helpers.js";

describe("ComplianceManager", () => {
  let complianceManager;

  beforeEach(() => {
    complianceManager = new ComplianceManager();
    vi.resetAllMocks();

    // Clean up DOM
    document.body.innerHTML = "";
    sessionStorage.clear();
  });

  describe("init", () => {
    it("should verify age if enabled in settings", async () => {
      getStorage.mockResolvedValue({
        compliance: { ageVerificationEnabled: true },
      });

      // Mock checkAgeVerification method to verify it's called
      const checkSpy = vi.spyOn(complianceManager, "checkAgeVerification");
      checkSpy.mockImplementation(() => {});

      await complianceManager.init();

      expect(getStorage).toHaveBeenCalled();
      expect(checkSpy).toHaveBeenCalled();
    });

    it("should not verify age if disabled in settings", async () => {
      getStorage.mockResolvedValue({
        compliance: { ageVerificationEnabled: false },
      });

      const checkSpy = vi.spyOn(complianceManager, "checkAgeVerification");

      await complianceManager.init();

      expect(getStorage).toHaveBeenCalled();
      expect(checkSpy).not.toHaveBeenCalled();
    });
  });

  describe("checkAgeVerification", () => {
    it("should not show modal if page is not NSFW", async () => {
      // Setup non-NSFW page
      document.body.className = "";

      const showSpy = vi.spyOn(complianceManager, "showAgeVerificationModal");

      await complianceManager.checkAgeVerification();

      expect(showSpy).not.toHaveBeenCalled();
    });

    it("should show modal if page is NSFW and not verified", async () => {
      // Setup NSFW page
      document.body.classList.add("over18");

      const showSpy = vi.spyOn(complianceManager, "showAgeVerificationModal");

      await complianceManager.checkAgeVerification();

      expect(showSpy).toHaveBeenCalled();
    });

    it("should not show modal if already verified in session", async () => {
      // Setup NSFW page
      document.body.classList.add("over18");
      // Setup verification
      sessionStorage.setItem("orr-age-verified", "true");

      const showSpy = vi.spyOn(complianceManager, "showAgeVerificationModal");

      await complianceManager.checkAgeVerification();

      expect(showSpy).not.toHaveBeenCalled();
    });
  });

  describe("verifyAge", () => {
    it("should set session storage", async () => {
      await complianceManager.verifyAge();

      expect(sessionStorage.getItem("orr-age-verified")).toBe("true");
    });
  });

  describe("DOM Interaction", () => {
    it("should create modal when showing verification", () => {
      complianceManager.showAgeVerificationModal();

      const modal = document.getElementById("orr-age-verify-modal");
      expect(modal).toBeTruthy();
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should remove modal and unlock scroll on verification", () => {
      complianceManager.showAgeVerificationModal();

      const yesBtn = document.getElementById("orr-verify-yes");
      yesBtn.click();

      expect(document.getElementById("orr-age-verify-modal")).toBeNull();
      expect(document.body.style.overflow).toBe("");
      expect(sessionStorage.getItem("orr-age-verified")).toBe("true");
    });

    it("should go back on denial", () => {
      // Mock history.back
      const backSpy = vi.spyOn(history, "back");

      complianceManager.showAgeVerificationModal();

      const noBtn = document.getElementById("orr-verify-no");
      noBtn.click();

      expect(backSpy).toHaveBeenCalled();
    });
  });
});

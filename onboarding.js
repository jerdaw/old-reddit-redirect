"use strict";

(function () {
  let currentSlide = 1;
  const totalSlides = 5;

  function showSlide(n) {
    document.querySelectorAll(".slide").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".dot").forEach((d) => d.classList.remove("active"));

    const slide = document.querySelector(`[data-slide="${n}"]`);
    const dot = document.querySelector(`.dot[data-slide="${n}"]`);

    if (slide) slide.classList.add("active");
    if (dot) dot.classList.add("active");

    currentSlide = n;
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      showSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      showSlide(currentSlide - 1);
    }
  }

  async function finishOnboarding() {
    // Save onboarding preference
    const enableNotifications = document.getElementById("enable-notifications").checked;

    if (enableNotifications) {
      const prefs = await window.Storage.getUIPreferences();
      prefs.showNotifications = true;
      await window.Storage.setUIPreferences(prefs);
    }

    // Mark onboarding complete
    await window.Storage.set("onboardingComplete", true);

    // Close tab
    window.close();
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  // Event listeners
  document.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (!action) return;

    switch (action) {
      case "next":
        nextSlide();
        break;
      case "prev":
        prevSlide();
        break;
      case "close":
        finishOnboarding();
        break;
      case "options":
        openOptions();
        break;
    }
  });

  // Dot navigation
  document.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      const slide = parseInt(dot.dataset.slide, 10);
      showSlide(slide);
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "Enter" && currentSlide === totalSlides) finishOnboarding();
  });
})();

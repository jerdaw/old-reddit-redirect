"use strict";

(function () {
  const UI_STRINGS = {
    SUBSCRIBE: "Subscribe",
    SUBSCRIBED: "✓ Subscribed",
    SUBSCRIBING: "Subscribing...",
    ERROR: "Failed to load marketplace",
  };

  function makeId() {
    if (crypto && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function getSubscriptions() {
    const result = await chrome.storage.local.get("community");
    return result.community?.subscriptions || [];
  }

  async function addSubscription(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch list");

    const listData = await response.json();
    if (
      listData.type !== "orr-list" ||
      !Array.isArray(listData.items) ||
      !listData.metadata
    ) {
      throw new Error("Invalid list format");
    }

    const subscriptions = await getSubscriptions();
    if (subscriptions.some((sub) => sub.url === url)) {
      throw new Error("Already subscribed");
    }

    const next = [
      ...subscriptions,
      {
        id: makeId(),
        url,
        name: listData.metadata.name,
        description: listData.metadata.description || "",
        author: listData.metadata.author || "Unknown",
        type: listData.contentType || "unknown",
        lastUpdated: new Date().toISOString(),
      },
    ];

    const existing = await chrome.storage.local.get("community");
    await chrome.storage.local.set({
      community: {
        ...(existing.community || {}),
        subscriptions: next,
      },
    });
  }

  async function init() {
    const grid = document.getElementById("lists-grid");
    const loading = document.getElementById("loading");
    const errorEl = document.getElementById("error");

    try {
      const response = await fetch("../../assets/marketplace/lists.json");
      if (!response.ok) throw new Error("Failed to load lists");

      const data = await response.json();
      const lists = data.lists || [];
      const currentSubs = await getSubscriptions();
      const subUrls = new Set(currentSubs.map((s) => s.url));

      loading.style.display = "none";
      lists.forEach((list) => {
        const card = createCard(list, subUrls.has(list.url));
        grid.appendChild(card);
      });
    } catch (error) {
      console.error(error);
      loading.style.display = "none";
      errorEl.textContent = UI_STRINGS.ERROR;
      errorEl.style.display = "block";
    }
  }

  function createCard(list, isSubscribed) {
    const el = document.createElement("div");
    el.className = "card";

    const typeClass = `type-${list.type}`;

    el.innerHTML = `
      <div class="card-header">
        <h3>${list.name}</h3>
        <span class="badge ${typeClass}">${list.type}</span>
      </div>
      <div class="card-body">
        <div class="author">by ${list.author}</div>
        <p>${list.description}</p>
        <div class="stats">
          <span>👥 ${list.stats.subscribers.toLocaleString()} subscribers</span>
          <span>★ ${list.stats.rating}</span>
        </div>
      </div>
      <div class="actions">
        <button class="button ${isSubscribed ? "secondary subscribed" : "primary"}"
                data-url="${list.url}"
                ${isSubscribed ? "disabled" : ""}>
          ${isSubscribed ? UI_STRINGS.SUBSCRIBED : UI_STRINGS.SUBSCRIBE}
        </button>
      </div>
    `;

    const btn = el.querySelector("button");
    if (!isSubscribed) {
      btn.addEventListener("click", () => handleSubscribe(list, btn));
    }

    return el;
  }

  async function handleSubscribe(list, btn) {
    try {
      btn.disabled = true;
      btn.textContent = UI_STRINGS.SUBSCRIBING;

      await addSubscription(list.url);

      btn.textContent = UI_STRINGS.SUBSCRIBED;
      btn.classList.remove("primary");
      btn.classList.add("secondary", "subscribed");
      btn.disabled = true;
    } catch (error) {
      console.error(error);
      btn.textContent = UI_STRINGS.SUBSCRIBE;
      btn.disabled = false;
      alert(`Failed to subscribe: ${error.message}`);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

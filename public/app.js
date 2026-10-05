const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const state = {
  bikes: [],
  saved: new Set(JSON.parse(localStorage.getItem("savedBikes") || "[]")),
  selectedBike: null
};

const bikeGrid = document.querySelector("#bikeGrid");
const filters = document.querySelector("#filters");
const quickSearch = document.querySelector("#quickSearch");
const resultCount = document.querySelector("#resultCount");
const maxPrice = document.querySelector("#maxPrice");
const maxPriceLabel = document.querySelector("#maxPriceLabel");
const drawer = document.querySelector("#drawer");
const drawerTitle = document.querySelector("#drawerTitle");
const bikeId = document.querySelector("#bikeId");
const inquiryForm = document.querySelector("#inquiryForm");
const formStatus = document.querySelector("#formStatus");
const savedCount = document.querySelector("#savedCount");
const serviceStatus = document.querySelector("#serviceStatus");
const reviewsList = document.querySelector("#reviewsList");
const offersList = document.querySelector("#offersList");
const workshopList = document.querySelector("#workshopList");

function updateSavedCount() {
  savedCount.textContent = state.saved.size;
  localStorage.setItem("savedBikes", JSON.stringify([...state.saved]));
}

function bikeCard(bike) {
  const saved = state.saved.has(bike.id);
  const tags = bike.tags.map(tag => `<span class="tag">${tag}</span>`).join("");

  return `
    <article class="bike-card">
      <div class="bike-media">
        <img src="${bike.image}" alt="${bike.brand} ${bike.model}" loading="lazy">
        <button class="save-button" type="button" data-save="${bike.id}" aria-label="Save ${bike.brand} ${bike.model}">
          ${saved ? "♥" : "♡"}
        </button>
      </div>
      <div class="bike-body">
        <div class="bike-title">
          <h3>${bike.brand} ${bike.model}</h3>
          <span class="price">${formatter.format(bike.price)}</span>
        </div>
        <div class="bike-meta">
          <span>${bike.type}</span>
          <span>${bike.frame}</span>
          <span>${bike.weight}</span>
          <span>${bike.location}</span>
        </div>
        <div class="tag-row">${tags}</div>
        <div class="card-actions">
          <button class="primary-button" type="button" data-inquire="${bike.id}">Request details</button>
          <button class="ghost-button" type="button" data-type="${bike.type}">Show similar</button>
        </div>
      </div>
    </article>
  `;
}

async function loadStats() {
  const response = await fetch("/api/stats");
  const stats = await response.json();
  document.querySelector("#totalBikes").textContent = stats.totalBikes;
  document.querySelector("#averagePrice").textContent = formatter.format(stats.averagePrice);
  document.querySelector("#categories").textContent = stats.categories;
}

async function loadBikes(params = new URLSearchParams(new FormData(filters))) {
  const response = await fetch(`/api/bikes?${params.toString()}`);
  const data = await response.json();
  state.bikes = data.bikes;
  resultCount.textContent = `${state.bikes.length} matching bikes`;
  bikeGrid.innerHTML = state.bikes.length
    ? state.bikes.map(bikeCard).join("")
    : `<div class="bike-card"><div class="bike-body"><h3>No bikes found</h3><p>Try another riding style or price range.</p></div></div>`;
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return response.json();
}

function renderReviews(reviews) {
  reviewsList.innerHTML = reviews.map(review => `
    <div class="service-item">
      <strong>${review.rating}/5 ${review.name}</strong>
      <span>${review.bike}</span>
      <p>${review.comment}</p>
    </div>
  `).join("");
}

function renderOffers(offers) {
  offersList.innerHTML = offers.map(offer => `
    <div class="service-item">
      <strong>${offer.title}</strong>
      <span>${offer.value}</span>
      <p>${offer.detail}</p>
    </div>
  `).join("");
}

function renderWorkshop(slots) {
  workshopList.innerHTML = slots.map(slot => `
    <div class="service-item">
      <strong>${slot.day}</strong>
      <span>${slot.window}</span>
      <p>${slot.service}</p>
    </div>
  `).join("");
}

async function loadServiceData() {
  try {
    const [health, reviews, offers, workshop] = await Promise.all([
      loadJson("/api/health"),
      loadJson("/api/reviews"),
      loadJson("/api/offers"),
      loadJson("/api/workshop-slots")
    ]);

    const running = health.dependencies.filter(item => item.status === "ok").length;
    serviceStatus.textContent = `${running}/${health.dependencies.length} services online`;
    renderReviews(reviews.reviews);
    renderOffers(offers.offers);
    renderWorkshop(workshop.slots);
  } catch (error) {
    serviceStatus.textContent = "Service data unavailable";
    reviewsList.innerHTML = `<p class="service-error">Start the compose services to load reviews.</p>`;
    offersList.innerHTML = `<p class="service-error">Start the compose services to load offers.</p>`;
    workshopList.innerHTML = `<p class="service-error">Start the compose services to load workshop slots.</p>`;
  }
}

function openDrawer(id) {
  const bike = state.bikes.find(item => item.id === id);
  if (!bike) return;
  state.selectedBike = bike;
  drawerTitle.textContent = `${bike.brand} ${bike.model}`;
  bikeId.value = bike.id;
  formStatus.textContent = "";
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

filters.addEventListener("input", () => {
  maxPriceLabel.textContent = formatter.format(Number(maxPrice.value));
  loadBikes();
});

quickSearch.addEventListener("submit", event => {
  event.preventDefault();
  const params = new URLSearchParams(new FormData(quickSearch));
  params.set("maxPrice", maxPrice.value);
  filters.search.value = params.get("search") || "";
  filters.type.value = params.get("type") || "all";
  filters.frame.value = params.get("frame") || "all";
  loadBikes(params);
  document.querySelector("#inventory").scrollIntoView({ behavior: "smooth" });
});

bikeGrid.addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  const inquireButton = event.target.closest("[data-inquire]");
  const similarButton = event.target.closest("[data-type]");

  if (saveButton) {
    const id = Number(saveButton.dataset.save);
    if (state.saved.has(id)) {
      state.saved.delete(id);
    } else {
      state.saved.add(id);
    }
    updateSavedCount();
    loadBikes();
  }

  if (inquireButton) {
    openDrawer(Number(inquireButton.dataset.inquire));
  }

  if (similarButton) {
    filters.type.value = similarButton.dataset.type;
    loadBikes();
    document.querySelector("#inventory").scrollIntoView({ behavior: "smooth" });
  }
});

document.querySelector("#closeDrawer").addEventListener("click", closeDrawer);

drawer.addEventListener("click", event => {
  if (event.target === drawer) {
    closeDrawer();
  }
});

inquiryForm.addEventListener("submit", async event => {
  event.preventDefault();
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(new FormData(inquiryForm)))
  });
  const data = await response.json();
  formStatus.textContent = data.message || data.error;
  if (response.ok) {
    inquiryForm.reset();
    if (state.selectedBike) {
      bikeId.value = state.selectedBike.id;
    }
  }
});

document.querySelector("#openSaved").addEventListener("click", () => {
  if (!state.saved.size) {
    resultCount.textContent = "No saved bikes yet";
    document.querySelector("#inventory").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const savedBikes = state.bikes.filter(bike => state.saved.has(bike.id));
  resultCount.textContent = `${savedBikes.length} saved bikes`;
  bikeGrid.innerHTML = savedBikes.map(bikeCard).join("");
  document.querySelector("#inventory").scrollIntoView({ behavior: "smooth" });
});

updateSavedCount();
loadStats();
loadBikes();
loadServiceData();

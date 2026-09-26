const cinemaGrid = document.getElementById("cinemaGrid");
const continueBtn = document.getElementById("continueCinema");

let allCinemas = [];
let selectedCinemaId = localStorage.getItem("selectedCinemaId") || "";

function refreshSelectionUI() {
  const cards = cinemaGrid.querySelectorAll(".cinema-card");
  cards.forEach(card => {
    card.classList.toggle("selected", card.dataset.id === selectedCinemaId);
  });

  if (continueBtn) {
    continueBtn.disabled = !selectedCinemaId;
  }
}

function renderCinemas(list) {
  if (!cinemaGrid) return;

  if (!list || list.length === 0) {
    cinemaGrid.innerHTML = `
      <div class="empty" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <div>📍</div>
        <h3>No Cinemas Found</h3>
        <p>Please check back later.</p>
      </div>
    `;
    return;
  }

  cinemaGrid.innerHTML = list.map(c => {
    const id = c._id || c.id;
    const name = c.name || "Cinema";
    const location = c.location || c.address || "Cairo";
    const image = c.image || c.imageUrl || "../assets/images/cinema-placeholder.jpg";
    const isSelected = String(selectedCinemaId) === String(id);

    return `
      <button class="cinema-card ${isSelected ? "selected" : ""}" data-id="${id}">
        <img src="${image}" alt="${name}" onerror="this.src='../assets/images/cinema-placeholder.jpg'">
        <div class="cinema-card-body">
          <h3>${name}</h3>
          <p>📍 ${location}</p>
          <span class="radio"></span>
        </div>
      </button>
    `;
  }).join("");

  // Attach card click handlers via delegation
  cinemaGrid.querySelectorAll(".cinema-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedCinemaId = card.dataset.id;
      localStorage.setItem("selectedCinemaId", selectedCinemaId);
      refreshSelectionUI();
    });
  });

  refreshSelectionUI();
}

async function loadCinemas() {
  if (cinemaGrid) {
    cinemaGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <p>Loading cinemas...</p>
      </div>
    `;
  }

  // 1. Try Backend API
  if (typeof api !== "undefined") {
    try {
      const res = await api.get("/cinemas");
      let list = res.data;
      if (list && list.data) list = list.data;
      if (list && list.cinemas) list = list.cinemas;

      if (Array.isArray(list) && list.length > 0) {
        allCinemas = list;
        renderCinemas(allCinemas);
        return;
      }
    } catch (err) {
      console.warn("Backend API fetch failed, falling back to local data.js:", err.message);
    }
  }

  // 2. Fallback to local data.js
  if (typeof cinemas !== "undefined" && Array.isArray(cinemas)) {
    allCinemas = cinemas;
  } else {
    allCinemas = [];
  }

  renderCinemas(allCinemas);
}

document.addEventListener("DOMContentLoaded", () => {
  loadCinemas();

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      if (selectedCinemaId) {
        window.location.href = "showtimes.html";
      }
    });
  }
});
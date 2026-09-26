const detailsContainer = document.getElementById("details");

function renderLoading() {
  if (!detailsContainer) return;
  detailsContainer.innerHTML = `
    <div class="state-message" style="text-align: center; padding: 60px 20px;">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>
  `;
}

function renderNotFound() {
  if (!detailsContainer) return;
  detailsContainer.innerHTML = `
    <div class="empty" style="text-align: center; padding: 60px 20px;">
      <div>🎬</div>
      <h3>Movie Not Found</h3>
      <p>We couldn't find details for the requested movie.</p>
      <a href="movies.html" class="btn primary" style="margin-top: 15px; display: inline-block;">Back to Movies</a>
    </div>
  `;
}

function renderMovieDetails(movie) {
  if (!detailsContainer || !movie) return;

  const id = movie._id || movie.id;
  localStorage.setItem("selectedMovieId", id);

  const title = movie.title || "Untitled";
  const poster = movie.posterUrl || movie.poster || "../assets/images/poster-placeholder.jpg";
  const rating = movie.rating || movie.ageRating || "N/A";
  const description = movie.description || "No description available.";
  const language = movie.language || "English";

  // Duration normalization
  let duration = "N/A";
  if (movie.runningTime) {
    duration = `${movie.runningTime} mins`;
  } else if (movie.duration) {
    duration = movie.duration;
  }

  // Release date normalization
  let releaseDate = "N/A";
  if (movie.releaseDate) {
    releaseDate = new Date(movie.releaseDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } else if (movie.release) {
    releaseDate = movie.release;
  }

  // Genre chips normalization
  let genresArray = [];
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    genresArray = movie.genres;
  } else if (Array.isArray(movie.genre)) {
    genresArray = movie.genre;
  } else if (typeof movie.genre === "string") {
    genresArray = movie.genre.split(",").map(g => g.trim());
  }
  const genreChips = genresArray.map(g => `<span>${g}</span>`).join("");

  // Cast / Starring normalization
  let castArray = [];
  if (Array.isArray(movie.starring) && movie.starring.length > 0) {
    castArray = movie.starring;
  } else if (Array.isArray(movie.cast)) {
    castArray = movie.cast;
  } else if (typeof movie.starring === "string") {
    castArray = movie.starring.split(",").map(c => c.trim());
  }

  const castHtml = castArray.length > 0
    ? castArray.map(c => {
        const initials = c.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
        return `
          <div class="cast-item">
            <span>${initials}</span>
            <strong>${c}</strong>
          </div>
        `;
      }).join("")
    : "<p style='color: var(--text-muted, #888);'>Cast details unavailable.</p>";

  detailsContainer.innerHTML = `
    <section class="details-card">
      <div class="details-poster">
        <img src="${poster}" alt="${title} poster" onerror="this.src='../assets/images/poster-placeholder.jpg'">
      </div>
      <div class="details-content">
        <span class="eyebrow">MOVIE DETAILS</span>
        <h1>${title}</h1>
        <div class="rating-line"><span class="stars">★</span> ${rating} <small>/ 10</small></div>
        <div class="chips">${genreChips}</div>
        <div class="meta-grid">
          <div><small>Duration</small><strong>◷ ${duration}</strong></div>
          <div><small>Language</small><strong>◎ ${language}</strong></div>
          <div><small>Release Date</small><strong>▣ ${releaseDate}</strong></div>
        </div>
        <p class="description">${description}</p>
        <h3>Cast</h3>
        <div class="cast-list">${castHtml}</div>
        <a class="btn primary wide" href="showtimes.html" onclick="localStorage.setItem('selectedCinemaId', '1')">Book Now</a>
      </div>
    </section>
  `;
}

async function loadDetails() {
  renderLoading();
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    renderNotFound();
    return;
  }

  // 1. Try Backend API
  if (typeof api !== "undefined") {
    try {
      const res = await api.get(`/movies/${movieId}`);
      let movie = res.data;
      if (movie && movie.data) movie = movie.data;

      if (movie && (movie._id || movie.id)) {
        renderMovieDetails(movie);
        return;
      }
    } catch (err) {
      console.warn("Backend API fetch failed, falling back to local data.js:", err.message);
    }
  }

  // 2. Fallback to local data.js
  if (typeof getMovie === "function") {
    const localMovie = getMovie(movieId);
    if (localMovie) {
      renderMovieDetails(localMovie);
      return;
    }
  }

  renderNotFound();
}

document.addEventListener("DOMContentLoaded", loadDetails);
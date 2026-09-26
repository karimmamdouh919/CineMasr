function renderMovieCards(container, list, compact = false) {
  if (!container) return;
  const movieDetailsPath = location.pathname.includes("/pages/")
    ? "movie-details.html"
    : "pages/movie-details.html";

  container.innerHTML = list.map(m => {
    const id = m._id || m.id;
    const poster = m.posterUrl || m.poster || '../assets/images/poster-placeholder.jpg';
    const title = m.title || 'Untitled';
    const rating = m.rating || 'N/A';
    const language = m.language || 'English';
    const duration = m.duration || '2h';
    
    let genreChips = '';
    const genreList = Array.isArray(m.genres) ? m.genres : (Array.isArray(m.genre) ? m.genre : (typeof m.genre === 'string' ? m.genre.split(',').map(g => g.trim()) : []));
    genreChips = genreList.slice(0, 2).map(g => `<span>${g}</span>`).join("");

    return `
      <article class="movie-card">
        <a href="${movieDetailsPath}?id=${id}" class="poster-wrap">
<img src="${poster}" alt="${title} poster" onerror="this.onerror=null;this.src=location.pathname.includes('/pages/') ? '../assets/images/poster-placeholder.jpg' : 'assets/images/poster-placeholder.jpg'"> <span class="rating">★ ${rating}</span>
        </a>
        <div class="movie-info">
          <h3>${title}</h3>
          <div class="chips">${genreChips}</div>
          ${compact ? "" : `<p>${language} •${duration}</p>`}
        </div>
      </article>`;
  }).join("");
}

function setActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a => {
    const target = a.dataset.nav;
    if ((target === "home" && page === "index.html") ||
        (target === "movies" && page === "movies.html") ||
        (target === "search" && page === "search.html")) {
      a.classList.add("active");
    }
  });
}
setActiveNav();

// Coming Soon Section Data & Logic

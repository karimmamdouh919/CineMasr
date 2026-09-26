const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterGenre = document.getElementById("filterGenre");
const filterRating = document.getElementById("filterRating");
const filterLanguage = document.getElementById("filterLanguage");
const sortMovies = document.getElementById("sortMovies");
const resultsContainer = document.getElementById("searchResults");
const emptyState = document.getElementById("searchEmpty");
const countText = document.getElementById("resultsCount");

let allMovies = [];

function getFallbackMovies() {
  if (typeof movies !== 'undefined' && Array.isArray(movies)) {
    return movies;
  }
  return [];
}

async function fetchMoviesAndInit() {
  try {
    const res = await api.get('/movies');
    let list = res.data;
    if (list && list.data) list = list.data;
    if (list && list.movies) list = list.movies;

    if (Array.isArray(list) && list.length > 0) {
      allMovies = list.map(m => ({
        id: String(m._id || m.id),
        title: m.title || 'Untitled',
        genre: Array.isArray(m.genre) ? m.genre : (m.genre ? m.genre.split(',').map(g => g.trim()) : ['General']),
        rating: Number(m.rating) || 7.0,
        language: m.language || 'English',
        duration: m.duration || '2h',
        poster: m.posterUrl || m.poster || '../assets/images/poster-placeholder.jpg',
        popularity: m.popularity || 0
      }));
    } else {
      allMovies = getFallbackMovies();
    }
  } catch (err) {
    console.warn("API fetch failed, falling back to local data:", err.message);
    allMovies = getFallbackMovies();
  }

  populateGenres();
  runSearch();
}

function populateGenres() {
  const genresSet = new Set();
  allMovies.forEach(m => {
    if (Array.isArray(m.genre)) {
      m.genre.forEach(g => genresSet.add(g));
    } else if (typeof m.genre === 'string') {
      m.genre.split(',').forEach(g => genresSet.add(g.trim()));
    }
  });

  filterGenre.innerHTML = '<option value="">All Genres</option>';
  [...genresSet].sort().forEach(g => {
    filterGenre.insertAdjacentHTML("beforeend", `<option value="${g}">${g}</option>`);
  });
}

function runSearch() {
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedGenre = filterGenre ? filterGenre.value : '';
  const selectedRating = filterRating && filterRating.value ? Number(filterRating.value) : 0;
  const selectedLang = filterLanguage ? filterLanguage.value : '';

  let filtered = allMovies.filter(m => {
    const matchesQuery = !q || (m.title && m.title.toLowerCase().includes(q));
    
    let matchesGenre = true;
    if (selectedGenre) {
      if (Array.isArray(m.genre)) {
        matchesGenre = m.genre.includes(selectedGenre);
      } else if (typeof m.genre === 'string') {
        matchesGenre = m.genre.includes(selectedGenre);
      }
    }

    const matchesRating = !selectedRating || (m.rating >= selectedRating);
    const matchesLang = !selectedLang || (m.language && m.language.toLowerCase() === selectedLang.toLowerCase());

    return matchesQuery && matchesGenre && matchesRating && matchesLang;
  });

  if (sortMovies) {
    if (sortMovies.value === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortMovies.value === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMovies.value === "popular") {
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  }

  if (typeof renderMovieCards === 'function') {
    renderMovieCards(resultsContainer, filtered);
  }

  if (countText) {
    countText.textContent = `${filtered.length} movie${filtered.length === 1 ? "" : "s"} found`;
  }

  if (emptyState) {
    emptyState.classList.toggle("hidden", filtered.length !== 0);
  }
}

[searchInput, filterGenre, filterRating, filterLanguage, sortMovies].forEach(el => {
  if (el) el.addEventListener("input", runSearch);
});

if (searchBtn) searchBtn.addEventListener("click", runSearch);
if (searchInput) {
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") runSearch();
  });
}

document.addEventListener("DOMContentLoaded", fetchMoviesAndInit);
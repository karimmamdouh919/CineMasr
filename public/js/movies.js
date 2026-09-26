const grid = document.getElementById("moviesGrid");
const searchInput = document.getElementById("movieSearch");
const genreFilter = document.getElementById("genreFilter");
const emptyState = document.getElementById("emptyState");

let allMovies = [];

// Safely extract genres as an array regardless of String or Array format
function getGenres(movie) {
  if (!movie || !movie.genre) return [];
  if (Array.isArray(movie.genre)) {
    return movie.genre.map(g => g.trim());
  }
  if (typeof movie.genre === 'string') {
    return movie.genre.split(',').map(g => g.trim());
  }
  return [];
}

// Dynamically populate genre options
function populateGenreDropdown(movieList) {
  if (!genreFilter) return;

  genreFilter.innerHTML = '<option value="">All Genres</option>';

  const uniqueGenres = [...new Set(
    movieList.flatMap(m => getGenres(m))
  )].filter(Boolean).sort();

  uniqueGenres.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    genreFilter.appendChild(option);
  });
}

function updateMovies() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedGenre = genreFilter ? genreFilter.value : '';

  const result = allMovies.filter(m => {
    const titleMatch = (m.title || '').toLowerCase().includes(query);
    const movieGenres = getGenres(m);
    const genreMatch = !selectedGenre || movieGenres.includes(selectedGenre);

    return titleMatch && genreMatch;
  });

  if (typeof renderMovieCards === 'function') {
    renderMovieCards(grid, result);
  }

  if (emptyState) {
    emptyState.classList.toggle("hidden", result.length !== 0);
  }
}

async function loadMovies() {
  // 1. Try Backend API
  if (typeof api !== 'undefined') {
    try {
      const res = await api.get('/movies');
      let list = res.data;
      if (list && list.data) list = list.data;
      if (list && list.movies) list = list.movies;

      if (Array.isArray(list) && list.length > 0) {
        allMovies = list;
        populateGenreDropdown(allMovies);
        updateMovies();
        return;
      }
    } catch (err) {
      console.warn("Backend API unavailable, using data.js fallback:", err.message);
    }
  }

  // 2. Fallback to local data.js
  if (typeof movies !== 'undefined' && Array.isArray(movies)) {
    allMovies = movies;
  } else {
    allMovies = [];
  }

  populateGenreDropdown(allMovies);
  updateMovies();
}

document.addEventListener("DOMContentLoaded", () => {
  loadMovies();

  if (searchInput) {
    searchInput.addEventListener("input", updateMovies);
  }
  if (genreFilter) {
    genreFilter.addEventListener("change", updateMovies);
  }
});
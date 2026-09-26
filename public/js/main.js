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
    if (Array.isArray(m.genre)) {
      genreChips = m.genre.slice(0, 2).map(g => `<span>${g}</span>`).join("");
    } else if (typeof m.genre === 'string') {
      genreChips = m.genre.split(',').slice(0, 2).map(g => `<span>${g.trim()}</span>`).join("");
    }

    return `
      <article class="movie-card">
        <a href="${movieDetailsPath}?id=${id}" class="poster-wrap">
          <img src="${poster}" alt="${title} poster" onerror="this.src='../assets/images/poster-placeholder.jpg'">
          <span class="rating">★ ${rating}</span>
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
const comingSoonData = [
  {
    id: "01",
    title: "The Batman Part II",
    date: "October 2, 2026",
    director: "Matt Reeves",
    desc: "Batman continues his fight against crime in Gotham City, facing a new threat that will test his limits and detective skills.",
    tags: ["ACTION", "CRIME"],
    thumb: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=200&auto=format&fit=crop", 
    bg: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "02",
    title: "Avatar: Fire and Ash",
    date: "December 19, 2025",
    director: "James Cameron",
    desc: "Jake Sully and Neytiri encounter the aggressive Ash People of Pandora as they journey into new, dangerous territories.",
    tags: ["SCI-FI", "ADVENTURE"],
    thumb: "https://image.tmdb.org/t/p/original/3Dqievkc7krcTtDE2hjRkIsEzB1.jpg",
    bg: "https://image.tmdb.org/t/p/original/3Dqievkc7krcTtDE2hjRkIsEzB1.jpg"
  },
  {
    id: "03",
    title: "Dune: Messiah",
    date: "March 15, 2027",
    director: "Denis Villeneuve",
    desc: "Paul Atreides faces the consequences of his holy war across the universe, dealing with political conspiracies and personal tragedy.",
    tags: ["SCI-FI", "DRAMA"],
    thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Q_yZCkt8DiS3BOgIYfEmCsPfYs7Uc4e_nElYYaF3sS0nOwdLSABgRl6g&s=10",
    bg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Q_yZCkt8DiS3BOgIYfEmCsPfYs7Uc4e_nElYYaF3sS0nOwdLSABgRl6g&s=10"
  },
  {
    id: "04",
    title: "Blade Runner 2099",
    date: "August 20, 2026",
    director: "Silka Luisa",
    desc: "Fifty years after the events of 2049, new replicants and hunters navigate a dark, rain-soaked dystopian future.",
    tags: ["THRILLER", "MYSTERY"],
    thumb: "https://wallpapercat.com/w/full/9/7/5/486236-3840x2160-desktop-4k-blade-runner-2049-background-photo.jpg",
    bg: "https://wallpapercat.com/w/full/9/7/5/486236-3840x2160-desktop-4k-blade-runner-2049-background-photo.jpg"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const csList = document.getElementById("cs-list");
  const csDisplay = document.getElementById("cs-display");
  const csTags = document.getElementById("cs-tags");
  const csLargeDate = document.getElementById("cs-large-date");
  const csMovieTitle = document.getElementById("cs-movie-title");
  const csDirectorName = document.getElementById("cs-director-name");
  const csMovieDesc = document.getElementById("cs-movie-desc");

  if (!csList || !csDisplay) return;

  function updateDisplay(movie) {
    if (csDisplay) csDisplay.style.backgroundImage = `url('${movie.bg}')`;
    if (csLargeDate) csLargeDate.textContent = movie.date;
    if (csMovieTitle) csMovieTitle.textContent = movie.title;
    if (csDirectorName) csDirectorName.textContent = movie.director;
    if (csMovieDesc) csMovieDesc.textContent = movie.desc;
    
    if (csTags) {
      csTags.innerHTML = "";
      movie.tags.forEach(tag => {
        const span = document.createElement("span");
        span.textContent = tag;
        csTags.appendChild(span);
      });
    }
  }

  comingSoonData.forEach((movie, index) => {
    const item = document.createElement("div");
    item.className = `cs-item ${index === 0 ? "active" : ""}`;
    
    item.innerHTML = `
      <span class="cs-item-number">${movie.id}</span>
      <img src="${movie.thumb}" alt="${movie.title}">
      <div class="cs-item-text">
        <h4>${movie.title}</h4>
        <p>${movie.date}</p>
      </div>
      <span class="cs-arrow">→</span>
    `;

    item.addEventListener("mouseenter", () => {
      document.querySelectorAll(".cs-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      updateDisplay(movie);
    });

    csList.appendChild(item);
  });

  if (comingSoonData.length > 0) {
    updateDisplay(comingSoonData[0]);
  }
});
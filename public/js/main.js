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

function renderHeroSection(featuredMovie) {
  if (!featuredMovie) return;

  const movieId = featuredMovie._id || featuredMovie.id;
  document.getElementById('heroTitle').textContent = featuredMovie.title || 'Featured Movie';
  document.getElementById('heroDesc').textContent = featuredMovie.description || 'Explore showtimes and book your tickets now.';

  const detailsUrl = `./pages/movie-details.html?id=${movieId}`;
  document.getElementById('heroBookBtn').href = detailsUrl;
  document.getElementById('heroDetailsBtn').href = detailsUrl;

  const heroImage = featuredMovie.posterUrl || featuredMovie.bannerImage || featuredMovie.posterImage || featuredMovie.poster;
  if (heroImage) {
    const heroSection = document.getElementById('heroSection');
    heroSection.style.backgroundImage = `linear-gradient(to right, rgba(10,10,15,0.9), rgba(10,10,15,0.4)), url("${heroImage}")`;
    heroSection.style.backgroundSize = 'cover';
    heroSection.style.backgroundPosition = 'center';
  }
}

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
    thumb: "https://images6.alphacoders.com/140/thumb-1920-1403001.jpg",
    bg: "https://images6.alphacoders.com/140/thumb-1920-1403001.jpg"
  },
  {
    id: "03",
    title: "Dune: Messiah",
    date: "March 15, 2027",
    director: "Denis Villeneuve",
    desc: "Paul Atreides faces the consequences of his holy war across the universe, dealing with political conspiracies and personal tragedy.",
    tags: ["SCI-FI", "DRAMA"],
    thumb: "https://static0.colliderimages.com/wordpress/wp-content/uploads/2024/10/denis-villeneuve-s-next-dune-movie-needs-to-avoid-these-pitfalls-of-frank-herbert-s-dune-messiah.jpg?w=1200&h=900&fit=crop",
    bg: "https://static0.colliderimages.com/wordpress/wp-content/uploads/2024/10/denis-villeneuve-s-next-dune-movie-needs-to-avoid-these-pitfalls-of-frank-herbert-s-dune-messiah.jpg?w=1200&h=900&fit=crop"
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

 
  function updateDisplay(movie) {
    csDisplay.style.backgroundImage = `url('${movie.bg}')`;
    csLargeDate.textContent = movie.date;
    csMovieTitle.textContent = movie.title;
    csDirectorName.textContent = movie.director;
    csMovieDesc.textContent = movie.desc;
    
   
    csTags.innerHTML = "";
    movie.tags.forEach(tag => {
      const span = document.createElement("span");
      span.textContent = tag;
      csTags.appendChild(span);
    });
  }

  
  comingSoonData.forEach((movie, index) => {
    const item = document.createElement("div");
    item.className = `cs-item ${index === 0 ? "active" : ""}`; // تفعيل أول فيلم افتراضياً
    
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
      // إزالة الصنف active من جميع العناصر
      document.querySelectorAll(".cs-item").forEach(el => el.classList.remove("active"));
     
      item.classList.add("active");
     
      updateDisplay(movie);
    });

    csList.appendChild(item);
  });

  // عرض بيانات أول فيلم عند تحميل الصفحة
  if (comingSoonData.length > 0) {
    updateDisplay(comingSoonData[0]);
  }
});

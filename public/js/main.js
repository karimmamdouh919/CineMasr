function renderMovieCards(container, list, compact=false){
  if(!container) return;
  container.innerHTML = list.map(m => `
    <article class="movie-card">
      <a href="movie-details.html?id=${m.id}" class="poster-wrap">
        <img src="${m.poster}" alt="${m.title} poster">
        <span class="rating">★ ${m.rating}</span>
      </a>
      <div class="movie-info">
        <h3>${m.title}</h3>
        <div class="chips">${m.genre.slice(0,2).map(g=>`<span>${g}</span>`).join("")}</div>
        ${compact ? "" : `<p>${m.language} • ${m.duration}</p>`}
      </div>
    </article>`).join("");
}

function setActiveNav(){
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a=>{
    const target = a.dataset.nav;
    if((target==="home" && page==="index.html") ||
       (target==="movies" && page==="movies.html") ||
       (target==="search" && page==="search.html")) a.classList.add("active");
  });
}
setActiveNav();

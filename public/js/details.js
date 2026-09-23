const params = new URLSearchParams(location.search);
const movie = getMovie(params.get("id"));
localStorage.setItem("selectedMovieId", movie.id);
const details = document.getElementById("details");

details.innerHTML = `
<section class="details-card">
  <div class="details-poster"><img src="${movie.poster}" alt="${movie.title} poster"></div>
  <div class="details-content">
    <span class="eyebrow">MOVIE DETAILS</span>
    <h1>${movie.title}</h1>
    <div class="rating-line"><span class="stars">★</span> ${movie.rating} <small>/ 10</small></div>
    <div class="chips">${movie.genre.map(g=>`<span>${g}</span>`).join("")}</div>
    <div class="meta-grid">
      <div><small>Duration</small><strong>◷ ${movie.duration}</strong></div>
      <div><small>Language</small><strong>◎ ${movie.language}</strong></div>
      <div><small>Release Date</small><strong>▣ ${movie.release}</strong></div>
    </div>
    <p class="description">${movie.description}</p>
    <h3>Cast</h3>
    <div class="cast-list">${movie.cast.map((c,i)=>`<div class="cast-item"><span>${c.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><strong>${c}</strong></div>`).join("")}</div>
    <a class="btn primary wide" href="cinema.html">Book Now</a>
  </div>
</section>`;


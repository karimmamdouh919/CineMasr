const grid = document.getElementById("moviesGrid");
const search = document.getElementById("movieSearch");
const genre = document.getElementById("genreFilter");
const empty = document.getElementById("emptyState");

[...new Set(movies.flatMap(m=>m.genre))].sort().forEach(g=>{
  genre.insertAdjacentHTML("beforeend", `<option value="${g}">${g}</option>`);
});

function updateMovies(){
  const q = search.value.trim().toLowerCase();
  const selected = genre.value;
  const result = movies.filter(m =>
    m.title.toLowerCase().includes(q) &&
    (!selected || m.genre.includes(selected))
  );
  renderMovieCards(grid,result);
  empty.classList.toggle("hidden",result.length!==0);
}
search.addEventListener("input",updateMovies);
genre.addEventListener("change",updateMovies);
updateMovies();

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterGenre = document.getElementById("filterGenre");
const filterRating = document.getElementById("filterRating");
const filterLanguage = document.getElementById("filterLanguage");
const sortMovies = document.getElementById("sortMovies");
const results = document.getElementById("searchResults");
const empty = document.getElementById("searchEmpty");
const count = document.getElementById("resultsCount");

[...new Set(movies.flatMap(m=>m.genre))].sort().forEach(g=>{
  filterGenre.insertAdjacentHTML("beforeend", `<option value="${g}">${g}</option>`);
});

function runSearch(){
  const q = searchInput.value.trim().toLowerCase();
  let list = movies.filter(m =>
    m.title.toLowerCase().includes(q) &&
    (!filterGenre.value || m.genre.includes(filterGenre.value)) &&
    (!filterRating.value || m.rating >= Number(filterRating.value)) &&
    (!filterLanguage.value || m.language === filterLanguage.value)
  );
  if(sortMovies.value==="rating") list.sort((a,b)=>b.rating-a.rating);
  if(sortMovies.value==="title") list.sort((a,b)=>a.title.localeCompare(b.title));
  renderMovieCards(results,list);
  count.textContent = `${list.length} movie${list.length===1?"":"s"} found`;
  empty.classList.toggle("hidden",list.length!==0);
}
[searchInput,filterGenre,filterRating,filterLanguage,sortMovies].forEach(el=>el.addEventListener("input",runSearch));
searchBtn.addEventListener("click",runSearch);
searchInput.addEventListener("keydown",e=>{if(e.key==="Enter")runSearch()});
runSearch();

const cinemaGrid = document.getElementById("cinemaGrid");
const continueBtn = document.getElementById("continueCinema");
let selected = localStorage.getItem("selectedCinemaId") || "";

cinemaGrid.innerHTML = cinemas.map(c=>`
  <button class="cinema-card ${selected===c.id?"selected":""}" data-id="${c.id}">
    <img src="${c.image}" alt="${c.name}">
    <div class="cinema-card-body"><h3>${c.name}</h3><p>📍 ${c.location}</p><span class="radio"></span></div>
  </button>`).join("");

function refresh(){
  document.querySelectorAll(".cinema-card").forEach(card=>{
    card.classList.toggle("selected",card.dataset.id===selected);
  });
  continueBtn.disabled = !selected;
}
document.querySelectorAll(".cinema-card").forEach(card=>{
  card.addEventListener("click",()=>{
    selected = card.dataset.id;
    localStorage.setItem("selectedCinemaId",selected);
    refresh();
  });
});
continueBtn.addEventListener("click",()=>location.href="showtimes.html");
refresh();

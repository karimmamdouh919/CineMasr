const movie = getSelectedMovie();
const cinema = getSelectedCinema();
const summary = document.getElementById("bookingSummary");
const dates = document.getElementById("dates");
const times = document.getElementById("times");
const continueBtn = document.getElementById("continueShowtime");
const message = document.getElementById("bookingMessage");

summary.innerHTML = `
  <img src="${movie.poster}" alt="${movie.title} poster">
  <div><h2>${movie.title}</h2><div class="rating-line"><span class="stars">★</span> ${movie.rating}</div>
  <p>📍 ${cinema.name}</p><p>${cinema.location}</p><a href="cinema.html">Change cinema</a></div>`;

const dateOptions = [
  ["Mon","Sep 28"],["Tue","Sep 29"],["Wed","Sep 30"],["Thu","Oct 1"],["Fri","Oct 2"]
];
let selectedDate = "";
let selectedTime = "";

dates.innerHTML = dateOptions.map((d,i)=>`<button class="date-btn ${i===0?"selected":""}" data-date="${d[0]} ${d[1]}"><strong>${d[0]}</strong><span>${d[1]}</span></button>`).join("");
selectedDate = dateOptions[0].join(" ");

times.innerHTML = showtimes.map(t=>`<button class="time-btn" data-time="${t}">${t}</button>`).join("");

document.querySelectorAll(".date-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".date-btn").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected"); selectedDate=btn.dataset.date;
}));
document.querySelectorAll(".time-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".time-btn").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected"); selectedTime=btn.dataset.time; continueBtn.disabled=false;
}));
continueBtn.addEventListener("click",()=>{
  localStorage.setItem("selectedDate",selectedDate);
  localStorage.setItem("selectedTime",selectedTime);
  message.className="message success";
  message.textContent=`✓ Selected ${movie.title} at ${cinema.name} — ${selectedDate}, ${selectedTime}`;
  message.classList.remove("hidden");
});

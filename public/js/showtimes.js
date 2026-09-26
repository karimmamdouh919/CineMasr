const summary = document.getElementById("bookingSummary");
const datesContainer = document.getElementById("dates");
const timesContainer = document.getElementById("times");
const continueBtn = document.getElementById("continueShowtime");
const message = document.getElementById("bookingMessage");

let movie = typeof getSelectedMovie === 'function' ? getSelectedMovie() : null;
let cinema = typeof getSelectedCinema === 'function' ? getSelectedCinema() : null;

if (!movie) {
  movie = JSON.parse(localStorage.getItem("selectedMovie") || '{"title":"Inception","poster":"../assets/images/inception.jpg","rating":"8.8"}');
}
if (!cinema) {
  cinema = JSON.parse(localStorage.getItem("selectedCinema") || '{"name":"CineMisr October","location":"Mall of Arabia"}');
}

summary.innerHTML = `
  <img src="${movie.poster || '../assets/images/poster-placeholder.jpg'}" alt="${movie.title} poster">
  <div>
    <h2>${movie.title}</h2>
    <div class="rating-line"><span class="stars">★</span> ${movie.rating || 'N/A'}</div>
    <p>📍 ${cinema.name}</p>
    <p>${cinema.location}</p>
    <a href="cinema.html">Change cinema</a>
  </div>
`;

function generateUpcomingDates(count = 5) {
  const list = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    list.push({
      dayName: days[d.getDay()],
      dateStr: `${months[d.getMonth()]} ${d.getDate()}`,
      fullDate: d.toISOString().slice(0, 10)
    });
  }
  return list;
}

const dateOptions = generateUpcomingDates(5);
let selectedDateObj = dateOptions[0];
let selectedShowtime = null;
let allShowtimes = [];

function renderDates() {
  datesContainer.innerHTML = dateOptions.map((d, i) => `
    <button class="date-btn ${i === 0 ? "selected" : ""}" data-index="${i}">
      <strong>${d.dayName}</strong>
      <span>${d.dateStr}</span>
    </button>
  `).join("");

  document.querySelectorAll(".date-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".date-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      
      const idx = Number(btn.dataset.index);
      selectedDateObj = dateOptions[idx];
      selectedShowtime = null;
      continueBtn.disabled = true;
      
      renderTimes();
    });
  });
}

async function fetchShowtimes() {
  try {
    const res = await api.get('/showtimes');
    let list = res.data;
    if (list && list.data) list = list.data;
    if (list && list.showtimes) list = list.showtimes;
    
    if (Array.isArray(list) && list.length > 0) {
      allShowtimes = list;
    } else {
      allShowtimes = getFallbackShowtimes();
    }
  } catch (err) {
    console.warn("Could not fetch showtimes from API, using fallback data:", err.message);
    allShowtimes = getFallbackShowtimes();
  }

  renderTimes();
}

function getFallbackShowtimes() {
  const defaultTimes = ["12:30 PM", "03:30 PM", "06:30 PM", "09:30 PM", "11:50 PM"];
  return defaultTimes.map((t, idx) => ({
    id: `fallback-${idx + 1}`,
    time: t,
    price: 100
  }));
}

function renderTimes() {
  if (allShowtimes.length === 0) {
    timesContainer.innerHTML = `<p class="empty-note">No showtimes available for this date.</p>`;
    return;
  }

  timesContainer.innerHTML = allShowtimes.map(s => {
    const timeDisplay = s.time || (s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:00');
    const id = s._id || s.id;
    return `<button class="time-btn" data-id="${id}" data-time="${timeDisplay}" data-price="${s.price || 100}">${timeDisplay}</button>`;
  }).join("");

  document.querySelectorAll(".time-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      
      selectedShowtime = {
        id: btn.dataset.id,
        time: btn.dataset.time,
        price: Number(btn.dataset.price)
      };
      
      continueBtn.disabled = false;
    });
  });
}

continueBtn.addEventListener("click", () => {
  if (!selectedShowtime) return;

  const dateFormatted = `${selectedDateObj.dayName} ${selectedDateObj.dateStr}`;
  localStorage.setItem("selectedDate", dateFormatted);
  localStorage.setItem("selectedTime", selectedShowtime.time);
  localStorage.setItem("selectedShowtimeId", selectedShowtime.id);

  const currentBooking = JSON.parse(localStorage.getItem("cinemisr_booking") || "{}");
  currentBooking.movieId = movie.id || movie._id;
  currentBooking.movieTitle = movie.title;
  currentBooking.cinemaName = cinema.name;
  currentBooking.showtimeId = selectedShowtime.id;
  currentBooking.date = dateFormatted;
  currentBooking.time = selectedShowtime.time;
  currentBooking.pricePerTicket = selectedShowtime.price;

  localStorage.setItem("cinemisr_booking", JSON.stringify(currentBooking));
  location.href = "seats.html";
});

document.addEventListener("DOMContentLoaded", () => {
  renderDates();
  fetchShowtimes();
});
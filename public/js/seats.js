if (!localStorage.getItem('cinemisr_token')) {
  localStorage.setItem('cinemisr_redirect_after_login', 'seats.html');
  window.location.href = 'login.html';
}

const movie = getSelectedMovie();
const cinema = getSelectedCinema();
const selectedDate = localStorage.getItem("selectedDate") || "";
const selectedTime = localStorage.getItem("selectedTime") || "";

const showtimeInfo = document.getElementById('showtimeInfo');
const seatsGrid = document.getElementById('seatsGrid');
const seatsError = document.getElementById('seatsError');
const selectedSeatsList = document.getElementById('selectedSeatsList');
const subtotalAmount = document.getElementById('subtotalAmount');
const continueBtn = document.getElementById('continueBtn');

showtimeInfo.textContent = `${movie.title} — ${cinema.name} — ${selectedDate}, ${selectedTime}`;

const ROWS = 8;
const SEATS_PER_ROW = 10;
const PRICE_PER_SEAT = 100;

const selectedSeats = new Set();

// TODO: replace with real Backend 3 endpoint
function getMockBookedSeats() {
  return new Set(['A3', 'A4', 'C7', 'D1', 'F5', 'F6', 'H9']);
}

const bookedSeats = getMockBookedSeats();

function rowLetter(index) {
  return String.fromCharCode(65 + index);
}

function renderSeats() {
  seatsGrid.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';

    const label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = rowLetter(r);
    rowEl.appendChild(label);

    for (let s = 1; s <= SEATS_PER_ROW; s++) {
      const seatId = `${rowLetter(r)}${s}`;
      const seatBtn = document.createElement('button');
      seatBtn.type = 'button';
      seatBtn.className = 'seat';
      seatBtn.dataset.seatId = seatId;
      seatBtn.setAttribute('aria-label', `Seat ${seatId}`);

      if (bookedSeats.has(seatId)) {
        seatBtn.classList.add('seat-booked');
        seatBtn.disabled = true;
      }

      seatBtn.addEventListener('click', () => toggleSeat(seatId, seatBtn));
      rowEl.appendChild(seatBtn);
    }

    seatsGrid.appendChild(rowEl);
  }
}

function toggleSeat(seatId, seatBtn) {
  if (selectedSeats.has(seatId)) {
    selectedSeats.delete(seatId);
    seatBtn.classList.remove('seat-selected');
  } else {
    selectedSeats.add(seatId);
    seatBtn.classList.add('seat-selected');
  }
  updateSummary();
}

function updateSummary() {
  selectedSeatsList.textContent = selectedSeats.size === 0
    ? 'None'
    : Array.from(selectedSeats).sort().join(', ');
  subtotalAmount.textContent = `EGP ${selectedSeats.size * PRICE_PER_SEAT}`;
  seatsError.textContent = '';
}

continueBtn.addEventListener('click', () => {
  if (selectedSeats.size === 0) {
    seatsError.textContent = 'Please select at least one seat to continue';
    return;
  }

  const bookingData = {
    movieId: movie.id,
    movieName: movie.title,
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    date: selectedDate,
    time: selectedTime,
    seats: Array.from(selectedSeats).sort(),
    seatsSubtotal: selectedSeats.size * PRICE_PER_SEAT
  };

  localStorage.setItem('cinemisr_booking', JSON.stringify(bookingData));
  window.location.href = 'snacks.html';
});

renderSeats();
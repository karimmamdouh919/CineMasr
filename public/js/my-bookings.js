const container = document.getElementById('bookingsContent');

function renderLoading() {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p>Loading your bookings...</p>
    </div>
  `;
}

function renderEmpty() {
  container.innerHTML = `
    <div class="state-message">
      <p>You don't have any bookings yet.</p>
      <a href="index.html">Browse movies to book your first ticket</a>
    </div>
  `;
}

function renderError(message) {
  container.innerHTML = `
    <div class="state-message">
      <p>${message || 'Something went wrong while loading your bookings.'}</p>
      <a href="my-bookings.html">Try again</a>
    </div>
  `;
}

function renderBookings(bookings) {
  if (!bookings || bookings.length === 0) {
    renderEmpty();
    return;
  }

  container.innerHTML = `
    <div class="bookings-list">
      ${bookings.map(b => {
        const total = (b.seatsSubtotal || 0) + (b.snacksSubtotal || 0);
        const statusClass = (b.status || 'confirmed').toLowerCase();
        const dateStr = b.bookedAt ? new Date(b.bookedAt).toLocaleDateString() : '—';

        return `
          <div class="booking-card">
            <div class="booking-card-header">
              <p class="booking-movie">${b.movieName || 'Unknown Movie'}</p>
              <span class="booking-id-small">${b.bookingId || ''}</span>
            </div>
            <div class="booking-details">
              <div>${b.cinemaName || '—'}</div>
              <div>Seats: ${(b.seats || []).join(', ') || '—'}</div>
              <div>Date: ${dateStr}</div>
              <div>Total: EGP ${total}</div>
            </div>
            <span class="booking-status ${statusClass}">${b.status || 'Confirmed'}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// TODO: replace with real Backend 3 endpoint
async function loadBookings() {
  renderLoading();
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    const lastBooking = JSON.parse(localStorage.getItem('cinemisr_last_booking') || 'null');
    const bookings = lastBooking ? [lastBooking] : [];
    renderBookings(bookings);
  } catch (err) {
    renderError('Could not read booking data');
  }
}

loadBookings();

document.getElementById('logoutLink').addEventListener('click', () => {
  localStorage.removeItem('cinemisr_token');
  window.location.href = '../index.html';
});


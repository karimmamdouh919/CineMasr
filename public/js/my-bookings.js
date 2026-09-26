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
      <a href="../index.html" class="btn primary" style="margin-top: 15px; display: inline-block;">Browse movies to book your first ticket</a>
    </div>
  `;
}

function renderError(message) {
  container.innerHTML = `
    <div class="state-message">
      <p>${message || 'Something went wrong while loading your bookings.'}</p>
      <a href="javascript:loadBookings()" class="btn secondary" style="margin-top: 10px; display: inline-block;">Try again</a>
    </div>
  `;
}

function renderBookings(bookings) {
  if (!bookings || bookings.length === 0) {
    renderEmpty();
    return;
  }

  // Generate cards HTML separately to avoid nested template literal syntax errors
  const cardsHtml = bookings.map(b => {
    const seatsSub = Number(b.seatsSubtotal) || 0;
    const snacksSub = Number(b.snacksSubtotal) || 0;
    const computedTotal = seatsSub + snacksSub;
    const total = Number(b.totalAmount || b.total) || computedTotal;

    const statusClass = String(b.status || 'confirmed').toLowerCase();
    
    let dateStr = '—';
    if (b.bookedAt || b.createdAt || b.date) {
      const rawDate = b.bookedAt || b.createdAt || b.date;
      dateStr = new Date(rawDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const seatsFormatted = Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || '—');
    
    let snacksHtml = '';
    if (Array.isArray(b.snacks) && b.snacks.length > 0) {
      const itemsStr = b.snacks.map(s => {
        const opt = s.option ? ` (${s.option})` : '';
        return `${s.qty || 1}x ${s.name || 'Snack'}${opt}`;
      }).join(', ');
      snacksHtml = `<div>🍿 Snacks: ${itemsStr}</div>`;
    }

    const movieTitle = b.movieName || b.movieTitle || (b.movie && b.movie.title) || 'Unknown Movie';
    const cinemaTitle = b.cinemaName || (b.cinema && b.cinema.name) || 'CineMisr Cinema';
    const bookingRef = b.bookingId || b._id || b.id || '';
    const shortRef = bookingRef ? '#' + String(bookingRef).slice(-8) : '';

    return `
      <div class="booking-card">
        <div class="booking-card-header">
          <p class="booking-movie">${movieTitle}</p>
          <span class="booking-id-small">${shortRef}</span>
        </div>
        <div class="booking-details">
          <div>📍 ${cinemaTitle}</div>
          <div>🎟 Seats: ${seatsFormatted}</div>
          ${snacksHtml}
          <div>📅 Date: ${dateStr}</div>
          <div><strong>Total: EGP ${total}</strong></div>
        </div>
        <span class="booking-status ${statusClass}">${b.status || 'Confirmed'}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="bookings-list">${cardsHtml}</div>`;
}

async function loadBookings() {
  renderLoading();

  try {
    const res = await api.get('/bookings');
    let list = res.data;
    if (list && list.data) list = list.data;
    if (list && list.bookings) list = list.bookings;

    if (Array.isArray(list)) {
      renderBookings(list);
      return;
    }
  } catch (err) {
    console.warn('Backend API booking retrieval failed, attempting LocalStorage fallback:', err.message);
  }

  // LocalStorage Fallback strategy
  try {
    const lastBooking = JSON.parse(localStorage.getItem('cinemisr_last_booking') || 'null');
    const storedBooking = JSON.parse(localStorage.getItem('cinemisr_booking') || 'null');
    
    const fallbackList = [];
    if (lastBooking) fallbackList.push(lastBooking);
    if (storedBooking && storedBooking.seats && storedBooking.seats.length > 0) {
      if (!lastBooking || lastBooking.bookingId !== storedBooking.bookingId) {
        fallbackList.push(storedBooking);
      }
    }

    renderBookings(fallbackList);
  } catch (err) {
    renderError('Could not read saved booking data.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadBookings();

  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('cinemisr_user');
      window.location.href = 'login.html';
    });
  }
});
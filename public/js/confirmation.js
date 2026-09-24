// ===== قراءة بيانات آخر حجز مؤكد من localStorage =====
// TODO: لما يبقى فيه endpoint حقيقي، ممكن بدل قراءة localStorage
// نستخدم: const response = await fetch(`/api/bookings/${bookingId}`);
// عشان نجيب أحدث حالة للحجز من السيرفر مباشرة (مثلاً لو الحالة اتغيرت)
const confirmedBooking = JSON.parse(localStorage.getItem('cinemisr_last_booking') || 'null');

const container = document.getElementById('confirmationContent');

function renderConfirmation() {
  if (!confirmedBooking) {
    container.innerHTML = `
      <div class="no-booking-note">
        <p>No recent booking found.</p>
        <a href="login.html" class="auth-switch">Go back to start</a>
      </div>
    `;
    return;
  }

  const snacksHtml = (confirmedBooking.snacks && confirmedBooking.snacks.length > 0)
    ? confirmedBooking.snacks.map(s => {
        const optionText = s.option ? ` (${s.option})` : '';
        return `<div class="snack-line"><span>${s.name}${optionText} × ${s.qty}</span><span>EGP ${s.qty * s.price}</span></div>`;
      }).join('')
    : '<p class="empty-note">No snacks added</p>';

  const total = (confirmedBooking.seatsSubtotal || 0) + (confirmedBooking.snacksSubtotal || 0);
  const bookedDate = confirmedBooking.bookedAt ? new Date(confirmedBooking.bookedAt).toLocaleString() : '—';

  container.innerHTML = `
    <div class="confirmation-header">
      <div class="success-icon">✓</div>
      <h1 class="page-title">Booking Confirmed!</h1>
      <p class="page-subtitle">Your tickets are ready. Enjoy the movie 🎬</p>
      <div class="booking-id">${confirmedBooking.bookingId || '—'}</div>
      <br>
      <span class="status-badge">${confirmedBooking.status || 'Confirmed'}</span>
    </div>

    <div class="glass-card order-summary">
      <div class="summary-block">
        <h3 class="block-title">Booking Details</h3>
        <div class="summary-row"><span>Movie</span><span>${confirmedBooking.movieName || '—'}</span></div>
        <div class="summary-row"><span>Cinema</span><span>${confirmedBooking.cinemaName || '—'}</span></div>
        <div class="summary-row"><span>Seats</span><span>${(confirmedBooking.seats || []).join(', ') || '—'}</span></div>
        <div class="summary-row"><span>Booked at</span><span>${bookedDate}</span></div>
        <div class="summary-row"><span>Tickets subtotal</span><span>EGP ${confirmedBooking.seatsSubtotal || 0}</span></div>
      </div>

      <div class="summary-block">
        <h3 class="block-title">Snacks</h3>
        <div class="snacks-list">${snacksHtml}</div>
        <div class="summary-row"><span>Snacks subtotal</span><span>EGP ${confirmedBooking.snacksSubtotal || 0}</span></div>
      </div>

      <div class="summary-row summary-total">
        <span>Total Paid</span>
        <span>EGP ${total}</span>
      </div>
    </div>

    <div class="confirmation-actions">
      <a href="/index.html" class="btn-primary" style="text-align:center; text-decoration:none;">Back to Home</a>
      <a href="my-bookings.html" class="btn-secondary" style="text-align:center; text-decoration:none;">View My Bookings</a>
    </div>
  `;
}

renderConfirmation();
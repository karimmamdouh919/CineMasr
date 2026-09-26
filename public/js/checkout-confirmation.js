document.addEventListener('DOMContentLoaded', checkBookingStatus);

async function checkBookingStatus() {
  const loadingView = document.getElementById('loading-view');
  const errorView = document.getElementById('error-view');
  const confirmationView = document.getElementById('confirmation-view');
  const errorMessage = document.getElementById('error-message');

  // Extract bookingId or merchant_order_id from URL query params (Paymob fallback)
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId') || urlParams.get('merchant_order_id');

  if (!bookingId) {
    showError('No valid booking ID or transaction reference found in URL parameters.');
    return;
  }

  await fetchAndRenderBooking(bookingId);

  async function fetchAndRenderBooking(id) {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/bookings/${id}`, { headers });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (Status ${response.status}). Check backend route.`);
      }

      const result = await response.json();

      if (!response.ok || (result.success !== undefined && !result.success)) {
        throw new Error(result.message || `Failed to fetch booking details (Status ${response.status})`);
      }

      const booking = result.data?.booking || result.data || result.booking;

      if (!booking || !booking._id) {
        throw new Error('Booking payload format is invalid.');
      }

      // Auto-retry up to 3 times if payment status is still pending (race condition with webhook)
      if (booking.paymentStatus === 'pending' && (!window.pollCount || window.pollCount < 3)) {
        window.pollCount = (window.pollCount || 0) + 1;
        document.getElementById('loading-text').innerText = `Verifying payment with bank (Attempt ${window.pollCount}/3)...`;
        setTimeout(() => fetchAndRenderBooking(id), 3000);
        return;
      }

      showConfirmation(booking);

    } catch (err) {
      showError(err.message || 'Unable to load booking confirmation.');
    }
  }

  function showError(msg) {
    loadingView.classList.add('hidden');
    confirmationView.classList.add('hidden');
    errorView.classList.remove('hidden');
    errorMessage.innerText = msg;
  }

  function showConfirmation(booking) {
    loadingView.classList.add('hidden');
    confirmationView.classList.remove('hidden');

    const currency = booking.currency || 'EGP';
    const showtime = booking.showtimeId || {};
    const movie = showtime.movieId || {};
    const hall = showtime.hallId || {};
    const cinema = booking.cinemaId || showtime.cinemaId || {};

    const isPaid = booking.paymentStatus === 'paid';
    const isPending = booking.paymentStatus === 'pending';

    // Header & Status
    const statusBadge = document.getElementById('booking-status');
    const statusIcon = document.getElementById('status-icon');
    
    document.getElementById('status-title').innerText = isPaid 
      ? 'Booking Confirmed!' 
      : (isPending ? 'Payment Processing' : 'Payment Failed');

    document.getElementById('status-subtext').innerText = isPaid 
      ? 'Thank you for your purchase. Your tickets are ready!' 
      : (isPending ? 'We are waiting for payment confirmation from Paymob.' : 'This booking could not be completed.');
    
    statusIcon.innerText = isPaid ? '✓' : (isPending ? '⏳' : '✕');
    statusBadge.innerText = (booking.paymentStatus || 'PENDING').toUpperCase();
    statusBadge.className = `status-badge ${isPaid ? 'paid' : (isPending ? 'pending' : 'failed')}`;

    // Movie Details
    if (document.getElementById('movie-poster')) {
      document.getElementById('movie-poster').src = movie.posterUrl || './assets/placeholder-poster.png';
    }
    if (document.getElementById('movie-title')) {
      document.getElementById('movie-title').innerText = movie.title || 'Movie Title';
    }
    if (document.getElementById('movie-rating')) {
      document.getElementById('movie-rating').innerText = movie.ageRating || 'N/A';
    }
    if (document.getElementById('movie-duration')) {
      document.getElementById('movie-duration').innerText = movie.runningTime ? `${movie.runningTime} mins` : '';
    }
    if (document.getElementById('showtime-format')) {
      document.getElementById('showtime-format').innerText = showtime.format || 'Standard';
    }

    // Venue Details
    if (document.getElementById('cinema-name')) {
      document.getElementById('cinema-name').innerText = cinema.name || 'Cinema Branch';
    }
    if (document.getElementById('cinema-location')) {
      document.getElementById('cinema-location').innerText = cinema.city ? `${cinema.city}, ${cinema.location}` : (cinema.location || '');
    }
    if (document.getElementById('hall-name')) {
      document.getElementById('hall-name').innerText = hall.name ? `${hall.name} (${hall.type || 'Standard'})` : 'Main Hall';
    }

    if (document.getElementById('showtime-date') && showtime.startTime) {
      const dateObj = new Date(showtime.startTime);
      document.getElementById('showtime-date').innerText = `${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ ${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Render Seats
    const seatsContainer = document.getElementById('seats-list');
    if (seatsContainer) {
      seatsContainer.innerHTML = '';
      if (booking.tickets && booking.tickets.length > 0) {
        booking.tickets.forEach(ticket => {
          const pill = document.createElement('div');
          pill.className = 'seat-pill';
          pill.innerHTML = `<span class="seat-num">${ticket.seatNumber}</span> (${ticket.seatType}) - ${ticket.price} ${currency}`;
          seatsContainer.appendChild(pill);
        });
      }
    }

    // Render Snacks
    const snacksSection = document.getElementById('snacks-section');
    const snacksListContainer = document.getElementById('snacks-list');
    if (snacksSection && snacksListContainer && booking.snacks && booking.snacks.length > 0) {
      snacksSection.classList.remove('hidden');
      document.getElementById('snacks-subtotal-row').classList.remove('hidden');
      snacksListContainer.innerHTML = '';

      booking.snacks.forEach(snack => {
        const li = document.createElement('li');
        li.className = 'snack-item';
        li.innerHTML = `<span>${snack.quantity}x ${snack.name}</span> <span>${snack.quantity * snack.unitPrice} ${currency}</span>`;
        snacksListContainer.appendChild(li);
      });

      document.getElementById('snacks-subtotal').innerText = `${booking.snacksSubtotal || 0} ${currency}`;
    }

    // Financial Breakdown
    if (document.getElementById('tickets-subtotal')) {
      document.getElementById('tickets-subtotal').innerText = `${booking.ticketsSubtotal || booking.totalAmount || 0} ${currency}`;
    }
    if (document.getElementById('booking-total')) {
      document.getElementById('booking-total').innerText = booking.totalAmount || booking.totalPrice || 0;
    }

    // Metadata
    if (document.getElementById('booking-id')) {
      document.getElementById('booking-id').innerText = booking._id;
    }
    if (document.getElementById('transaction-id')) {
      document.getElementById('transaction-id').innerText = booking.transactionId || 'N/A';
    }
    if (document.getElementById('payment-method')) {
      document.getElementById('payment-method').innerText = (booking.paymentMethod || 'card').toUpperCase();
    }
  }
}

async function downloadPDF() {
  const element = document.getElementById('confirmation-view');
  const bookingId = document.getElementById('booking-id')?.innerText || 'receipt';
  const buttonGroup = document.querySelector('.button-group');

  // 1. Temporarily hide action buttons
  if (buttonGroup) buttonGroup.style.display = 'none';

  // 2. Scroll to top to eliminate scroll offset clipping bugs
  window.scrollTo(0, 0);

  // 3. Configure options with clipping & pagebreak fixes
  const opt = {
    margin:       [8, 8, 8, 8], // 8mm uniform margins
    filename:     `ticket-${bookingId}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      scrollY: 0,             // Forces capture from the absolute top of the element
      scrollX: 0,
      windowWidth: document.documentElement.offsetWidth
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Prevents cutting text/boxes in half
  };

  try {
    // 4. Generate & download
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Failed to generate PDF. Please try printing instead.');
  } finally {
    // 5. Restore action buttons
    if (buttonGroup) buttonGroup.style.display = 'flex';
  }
}
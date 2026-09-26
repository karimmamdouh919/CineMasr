let pollInterval = null;

document.getElementById('payBtn').addEventListener('click', handleCheckout);

async function handleCheckout() {

  const stored = JSON.parse(localStorage.getItem('cinemisr_booking') || '{}');

  const bookingData = {
    showtimeId: stored.showtimeId,
    tickets: (stored.seats || []).map(seat => ({
      seatNumber: seat,
      seatType: 'standard',
      price: stored.pricePerTicket || 100
    })),
    snacks: (stored.snacks || []).map(s => ({
      snackId: s.id,
      name: s.name,
      quantity: s.qty,
      unitPrice: s.price
    })),
    totals: {
      ticketsSubtotal: stored.seatsSubtotal || 0,
      snacksSubtotal: stored.snacksSubtotal || 0,
      totalAmount: (stored.seatsSubtotal || 0) + (stored.snacksSubtotal || 0)
    }
  };

  try {
    const response = await api.post('/bookings/checkout', bookingData);
    const result = response.data;

    if (result.success) {
      document.getElementById('paymobIframe').src = result.paymentUrl;

      const modalElement = document.getElementById('paymentModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      const bookingId = result.bookingId || result.data?._id;

      if (bookingId) {
        startPaymentPolling(bookingId);
      }

      modalElement.addEventListener('hidden.bs.modal', () => {
        if (pollInterval) clearInterval(pollInterval);
      }, { once: true });

    } else {
      alert(result.message || 'Checkout failed.');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Something went wrong initiating payment.');
  }
}

function startPaymentPolling(bookingId) {
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    try {
      // ✅ api بدل fetch هنا كمان
      const res = await api.get(`/bookings/${bookingId}`);
      const result = res.data;

      if (result.success && result.data?.paymentStatus === 'paid') {
        clearInterval(pollInterval);
        window.location.href = `/checkout-confirmation.html?bookingId=${bookingId}`;
      }
    } catch (err) {
      console.error('Polling check failed:', err);
    }
  }, 2000);

  setTimeout(() => {
    if (pollInterval) clearInterval(pollInterval);
  }, 5 * 60 * 1000);
}
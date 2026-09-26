let pollInterval = null;

document.getElementById('payBtn').addEventListener('click', handleCheckout);

async function handleCheckout() {
  const bookingData = {
    showtimeId: "65f21a8b9c...",
    seats: ["A1", "A2"],
    snacks: [],
    totalAmount: 200
  };

  try {
    const response = await fetch('/bookings/checkout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();

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
      const res = await fetch(`/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await res.json();

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

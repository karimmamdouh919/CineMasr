const booking = JSON.parse(localStorage.getItem('cinemisr_booking') || '{}');

const sumMovie = document.getElementById('sumMovie');
const sumCinema = document.getElementById('sumCinema');
const sumSeats = document.getElementById('sumSeats');
const sumSeatsSubtotal = document.getElementById('sumSeatsSubtotal');
const sumSnacksList = document.getElementById('sumSnacksList');
const sumSnacksSubtotal = document.getElementById('sumSnacksSubtotal');
const sumTotal = document.getElementById('sumTotal');

function renderSummary() {
  sumMovie.textContent = booking.movieName || '—';
  sumCinema.textContent = booking.cinemaName || '—';
  sumSeats.textContent = (booking.seats && booking.seats.length) ? booking.seats.join(', ') : '—';

  const seatsSubtotal = booking.seatsSubtotal || 0;
  const snacksSubtotal = booking.snacksSubtotal || 0;
  const total = seatsSubtotal + snacksSubtotal;

  sumSeatsSubtotal.textContent = `EGP ${seatsSubtotal}`;
  sumSnacksSubtotal.textContent = `EGP ${snacksSubtotal}`;
  sumTotal.textContent = `EGP ${total}`;

  if (booking.snacks && booking.snacks.length > 0) {
    sumSnacksList.innerHTML = booking.snacks.map(s => {
      const optionText = s.option ? ` (${s.option})` : '';
      return `<div class="snack-line"><span>${s.name}${optionText} × ${s.qty}</span><span>EGP ${s.qty * s.price}</span></div>`;
    }).join('');
  } else {
    sumSnacksList.innerHTML = '<p class="empty-note">No snacks added</p>';
  }
}

renderSummary();

const paymentForm = document.getElementById('paymentForm');
const cardName = document.getElementById('cardName');
const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');

const cardNameError = document.getElementById('cardNameError');
const cardNumberError = document.getElementById('cardNumberError');
const cardExpiryError = document.getElementById('cardExpiryError');
const cardCvvError = document.getElementById('cardCvvError');
const paymentFormError = document.getElementById('paymentFormError');

const payBtn = document.getElementById('payBtn');

cardNumber.addEventListener('input', () => {
  let digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
  cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
});

cardExpiry.addEventListener('input', () => {
  let digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) {
    cardExpiry.value = digits.slice(0, 2) + '/' + digits.slice(2);
  } else {
    cardExpiry.value = digits;
  }
});

cardCvv.addEventListener('input', () => {
  cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);
});

function clearPaymentErrors() {
  [cardNameError, cardNumberError, cardExpiryError, cardCvvError, paymentFormError].forEach(el => {
    el.textContent = '';
  });
  [cardName, cardNumber, cardExpiry, cardCvv].forEach(el => {
    el.classList.remove('input-invalid');
  });
}

function setPayLoading(isLoading) {
  payBtn.disabled = isLoading;
  payBtn.querySelector('.btn-text').hidden = isLoading;
  payBtn.querySelector('.btn-loader').hidden = !isLoading;
}

paymentForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  clearPaymentErrors();

  let isValid = true;

  if (!cardName.value.trim()) {
    cardNameError.textContent = 'Name is required';
    cardName.classList.add('input-invalid');
    isValid = false;
  } else if (!/^[a-zA-Z\s]+$/.test(cardName.value.trim())) {
    cardNameError.textContent = 'Name must not contain numbers';
    cardName.classList.add('input-invalid');
    isValid = false;
  }

  const digitsOnly = cardNumber.value.replace(/\s/g, '');
  if (digitsOnly.length !== 16) {
    cardNumberError.textContent = 'Card number must be 16 digits';
    cardNumber.classList.add('input-invalid');
    isValid = false;
  }

  if (!/^\d{2}\/\d{2}$/.test(cardExpiry.value)) {
    cardExpiryError.textContent = 'Use MM/YY format';
    cardExpiry.classList.add('input-invalid');
    isValid = false;
  }

  if (cardCvv.value.length < 3) {
    cardCvvError.textContent = 'CVV must be 3-4 digits';
    cardCvv.classList.add('input-invalid');
    isValid = false;
  }

  if (booking.seats && (booking.seatsSubtotal || 0) + (booking.snacksSubtotal || 0) === 0) {
    paymentFormError.textContent = 'Your order is empty, please go back and select seats';
    isValid = false;
  }

  if (!isValid) return;

  setPayLoading(true);

  try {
    // TODO: replace with real Backend 3 (booking) + Backend 4 (payment) call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockBookingId = 'CM-' + Math.floor(10000 + Math.random() * 90000);
    const confirmedBooking = {
      ...booking,
      bookingId: mockBookingId,
      status: 'Confirmed',
      bookedAt: new Date().toISOString()
    };
    localStorage.setItem('cinemisr_last_booking', JSON.stringify(confirmedBooking));

    window.location.href = 'confirmation.html';

  } catch (err) {
    paymentFormError.textContent = err.message || 'Payment failed, please try again';
  } finally {
    setPayLoading(false);
  }
});
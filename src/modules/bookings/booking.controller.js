export const holdSeats = (req, res) => {
  res.send('Temporarily hold seats for 10 mins during checkout');
};

export const checkout = (req, res) => {
  res.send('Process booking payment and confirm order');
};

export const getMyBookings = (req, res) => {
  res.send('Get logged in user booking history');
};

export const getBookingById = (req, res) => {
  res.send('Get specific booking receipt/ticket details');
};

export const cancelBooking = (req, res) => {
  res.send('Cancel booking and process refund');
};

export const handleWebhook = (req, res) => {
  res.send('Stripe/Paymob Payment Webhook Handler');
};

export const getAllBookings = (req, res) => {
  res.send('Admin: Get all system bookings');
};
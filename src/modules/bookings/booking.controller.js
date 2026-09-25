import crypto from 'crypto'
import path from 'path';
import {bookingModel} from '../../db/models/booking.model.js'
import {showtimeModel} from '../../db/models/showtime.model.js'
import generatePaymentIframeUrl from '../../services/payment.service.js'
import  User  from '../../db/models/user.model.js';
import { cinemaModel } from '../../db/models/cinema.model.js';
import { movieModel } from '../../db/models/movie.model.js';
import { hallModel } from '../../db/models/hall.model.js';

export const holdSeats = (req, res) => {
  res.send('Temporarily hold seats for 10 mins during checkout');
};

export const checkout = async (req, res) => {
  try {
    const { showtimeId, tickets, snacks, totals } = req.body;

    const userId = req.user._id// From JWT Auth Middleware
    
    const showtime = await showtimeModel.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    const requestedSeats = tickets.map(t => t.seatNumber);

    // 1. Check seat availability against booked seats & active holds
    const isBooked = requestedSeats.some(s => showtime.bookedSeats.includes(s));
    const activeHolds = showtime.tempSeatHolds.filter(h => new Date(h.expiresAt) > new Date());
    const isHeld = activeHolds.some(h => requestedSeats.includes(h.seatNumber));

    if (isBooked || isHeld) {
      return res.status(400).json({ message: 'One or more seats are no longer available.' });
    }

    // 2. Add temporary holds (10-minute timeout)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newHolds = requestedSeats.map(seatNumber => ({
      seatNumber,
      userId,
      expiresAt
    }));

    await showtimeModel.findByIdAndUpdate(showtimeId, {
      $push: { tempSeatHolds: { $each: newHolds } }
    });

    // 3. Save pending booking in MongoDB
    const booking = await bookingModel.create({
      userId,
      showtimeId: showtime._id,
      cinemaId: showtime.cinemaId,
      tickets,
      snacks,
      ticketsSubtotal: totals.ticketsSubtotal,
      snacksSubtotal: totals.snacksSubtotal,
      totalAmount: totals.totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'confirmed'
    });

    // 4. Generate Paymob iframe URL
    const iframeUrl = await generatePaymentIframeUrl(booking, req.user);

    return res.status(200).json({ success: true, paymentUrl: iframeUrl, bookingId: booking._id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = (req, res) => {
  res.send('Get logged in user booking history');
};

export const getBookingById =  async (req, res) => {
  try {
     const booking = await bookingModel.findById(req.params.id)
      .populate('cinemaId', 'name city location')
      .populate({
        path: 'showtimeId',
        select: 'format startTime endTime attributes',
        populate: [
          { path: 'movieId', select: 'title posterUrl runningTime ageRating genres' },
          { path: 'hallId', select: 'name type' }
        ]
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Return booking data containing paymentStatus ('pending', 'paid', etc.)
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = (req, res) => {
  res.send('Cancel booking and process refund');
};

export const handleWebhook = async (req, res) => {
  try {
   const { obj } = req.body;
    // Paymob passes the HMAC signature in query param or body root
    const receivedHmac = req.query.hmac || req.body.hmac;

    if (!obj || !receivedHmac) {
      return res.status(400).send('Missing payload or HMAC signature');
    }

    // 1. Array of Paymob's required 20 fields IN EXACT ORDER
    const lexicalFields = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id,
      obj.owner,
      obj.pending,
      obj.source_data?.pan,
      obj.source_data?.sub_type,
      obj.source_data?.type,
      obj.success
    ];

    // 2. Convert all values to string and concatenate
    const concatenatedString = lexicalFields
      .map(val => (val === undefined || val === null ? '' : String(val)))
      .join('');

    // 3. Compute SHA-512 HMAC using process.env.PAYMOB_HMAC_SECRET
    const calculatedHmac = crypto
      .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
      .update(concatenatedString)
      .digest('hex');

    // 4. Verify match
    if (calculatedHmac !== receivedHmac) {
      console.log('❌ HMAC Mismatch');
      console.log('Calculated:', calculatedHmac);
      console.log('Received:', receivedHmac);
      return res.status(400).send('Invalid HMAC');
    }

    console.log('✅ HMAC Verified Successfully!');

    const bookingId = obj.order.merchant_order_id;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {console.log(2);return res.status(404).send('Booking not found');}

    const seatNumbers = booking.tickets.map(t => t.seatNumber);

    // 2. Process Successful Payment
    if (obj.success === true) {
      booking.paymentStatus = 'paid';
      booking.transactionId = String(obj.id);
      await booking.save();

      // Convert temporary holds into permanent bookedSeats
      await showtimeModel.findByIdAndUpdate(booking.showtimeId, {
        $push: { bookedSeats: { $each: seatNumbers } },
        $pull: { tempSeatHolds: { seatNumber: { $in: seatNumbers } } }


      });
        
      console.log(`✅ Booking ${bookingId} marked as PAID in database.`);
    
    } else {
      // Process Failed Payment
      booking.paymentStatus = 'failed';
      booking.bookingStatus = 'cancelled';
      await booking.save();
console.log(4);
      // Release temporary seat holds immediately
      await showtimeModel.findByIdAndUpdate(booking.showtimeId, {
        $pull: { tempSeatHolds: { seatNumber: { $in: seatNumbers } } }
      });
    }

    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getAllBookings = (req, res) => {
  res.send('Admin: Get all system bookings');
};

export const renderConfirmationPage = (req, res) => {
  res.sendFile(path.resolve('public', 'checkout-confirmation.html'));
};
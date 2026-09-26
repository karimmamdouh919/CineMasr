
// routes/admin.routes.js
import express from 'express';
import {
  getRevenueAnalytics,
  getOccupancyAnalytics,
  getTopPerformers,
  getRecentActivityFeed,
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  deleteMovie,
  createCinema,
  getCinemas,
  createHall,
  updateHallLayout,
  getTimelineShowtimes,
  createShowtime,
  getShowtimeOccupancyInspector,
  createSnack,
  getSnacks,
  toggleSnackAvailability,
  getMasterOrders,
  verifyTicketPOS,
  processRefund,
  getUsers,
  updateUserRoleAndAssignment
} from '../controllers/admin.controller.js';

const router = express.Router();

// 1. Dashboard & Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/occupancy', getOccupancyAnalytics);
router.get('/analytics/top-performers', getTopPerformers);
router.get('/analytics/recent-activity', getRecentActivityFeed);

// 2. Movie Catalog Management
router.post('/movies', createMovie);
router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.put('/movies/:id', updateMovie);
router.patch('/movies/:id/status', updateMovieStatus);
router.delete('/movies/:id', deleteMovie);

// 3. Cinema & Hall Management
router.post('/cinemas', createCinema);
router.get('/cinemas', getCinemas);
router.post('/halls', createHall);
router.put('/halls/:id/layout', updateHallLayout);

// 4. Showtime Scheduler & Timeline
router.get('/showtimes/timeline', getTimelineShowtimes);
router.post('/showtimes', createShowtime);
router.get('/showtimes/:id/occupancy', getShowtimeOccupancyInspector);

// 5. Snacks & Concessions
router.post('/snacks', createSnack);
router.get('/snacks', getSnacks);
router.patch('/snacks/:id/availability', toggleSnackAvailability);

// 6. Bookings, Tickets & Refunds
router.get('/bookings', getMasterOrders);
router.get('/bookings/verify', verifyTicketPOS);
router.post('/bookings/:id/refund', processRefund);

// 7. User & Access Control
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRoleAndAssignment);

export default router;
// controllers/admin.controller.js
import { bookingModel } from '../models/booking.model.js';
import { cinemaModel } from '../models/cinema.model.js';
import { hallModel } from '../models/hall.model.js';
import { movieModel } from '../models/movie.model.js';
import { showtimeModel } from '../models/showtime.model.js';
import { snackModel } from '../models/snack.model.js';
import User from '../models/user.model.js';

// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { groupBy = 'daily', cinemaId } = req.query;
    const matchStage = { paymentStatus: 'paid' };
    if (cinemaId) matchStage.cinemaId = new (req.mongoose.Types.ObjectId)(cinemaId);

    const dateFormat = groupBy === 'weekly' ? '%Y-%U' : '%Y-%m-%d';

    const revenue = await bookingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          ticketsRevenue: { $sum: '$ticketsSubtotal' },
          snacksRevenue: { $sum: '$snacksSubtotal' },
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }         }       },       {$sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupancyAnalytics = async (req, res) => {
  try {
    const { cinemaId } = req.query;
    const matchStage = {};
    if (cinemaId) matchStage.cinemaId = new (req.mongoose.Types.ObjectId)(cinemaId);

    const occupancy = await showtimeModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'halls',
          localField: 'hallId',
          foreignField: '_id',
          as: 'hall'
        }
      },
      { $unwind: '$hall' },
      {
        $project: {
          _id: 1,
          format: 1,
          startTime: 1,
          totalCapacity: { $multiply: ['$hall.totalRows', '$hall.totalCols'] },
          bookedCount: { $size: { $ifNull: ['$bookedSeats', []] } }
        }
      },
      {
        $project: {
          _id: 1,
          format: 1,
          startTime: 1,
          totalCapacity: 1,
          bookedCount: 1,
          occupancyRate: {
            $cond: [
              { $gt: ['$totalCapacity', 0] },               {$multiply: [{ $divide: ['$bookedCount', '$totalCapacity'] }, 100] },               0             ]           }         }       },       {$group: {
          _id: null,
          avgOccupancyRate: { $avg: '$occupancyRate' },
          totalBookedSeats: { $sum: '$bookedCount' },
          totalCapacity: { $sum: '$totalCapacity' }
        }
      }
    ]);

    res.json({ success: true, data: occupancy[0] || { avgOccupancyRate: 0, totalBookedSeats: 0, totalCapacity: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopPerformers = async (req, res) => {
  try {
    const topMovies = await bookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      { $unwind: '$showtime' },
      {
        $group: {
          _id: '$showtime.movieId',
          totalGross: { $sum: '$ticketsSubtotal' },
          ticketsSold: { $sum: { $size: '$tickets' } }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      { $sort: { totalGross: -1 } },
      { $limit: 5 },       {$project: {
          movieId: '$_id',
          title: '$movie.title',
          posterUrl: '$movie.posterUrl',
          totalGross: 1,
          ticketsSold: 1
        }
      }
    ]);

    const topSnacks = await bookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$snacks' },
      {
        $group: {
          _id: '$snacks.snackId',
          name: { $first: '$snacks.name' },
          totalQuantitySold: { $sum: '$snacks.quantity' },
          totalRevenue: { $sum: {$multiply: ['$snacks.quantity', '$snacks.unitPrice'] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } },       {$limit: 5 }
    ]);

    res.json({ success: true, data: { topMovies, topSnacks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentActivityFeed = async (req, res) => {
  try {
    const recentPaid = await bookingModel.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'first_name last_name email')
      .populate('showtimeId');

    const recentRefunds = await bookingModel.find({ paymentStatus: 'refunded' })
      .sort({ 'refundDetails.refundedAt': -1 })
      .limit(10)
      .populate('userId', 'first_name last_name email');

    res.json({ success: true, data: { recentPaid, recentRefunds } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. MOVIE CATALOG MANAGEMENT
// ==========================================

export const createMovie = async (req, res) => {
  try {
    const movie = await movieModel.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMovies = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const movies = await movieModel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await movieModel.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const activeShowtimesCount = await showtimeModel.countDocuments({
      movieId: movie._id,
      startTime: { $gte: new Date() }
    });

    res.json({
      success: true,
      data: { ...movie.toObject(), activeShowtimesCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await movieModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMovieStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Coming Soon', 'Now Showing', 'Archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (status === 'Archived') {
      const activeShowtimesCount = await showtimeModel.countDocuments({
        movieId: req.params.id,
        startTime: { $gte: new Date() }
      });
      if (activeShowtimesCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot archive movie with ${activeShowtimesCount} active showtimes`
        });
      }
    }

    const movie = await movieModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const activeShowtimesCount = await showtimeModel.countDocuments({
      movieId: req.params.id,
      startTime: { $gte: new Date() }
    });

    if (activeShowtimesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete movie attached to ${activeShowtimesCount} active showtimes`
      });
    }

    await movieModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. CINEMA & HALL MANAGEMENT
// ==========================================

export const createCinema = async (req, res) => {
  try {
    const cinema = await cinemaModel.create(req.body);
    res.status(201).json({ success: true, data: cinema });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCinemas = async (req, res) => {
  try {
    const cinemas = await cinemaModel.find();
    res.json({ success: true, data: cinemas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHall = async (req, res) => {
  try {
    const { cinemaId, name, type, totalRows, totalCols, supportedFormats, seats } = req.body;

    // Generate seats grid if non-customized layout was provided
    let layoutSeats = seats;
    if (!layoutSeats || layoutSeats.length === 0) {
      layoutSeats = [];
      for (let r = 0; r < totalRows; r++) {
        const rowChar = String.fromCharCode(65 + r);
        for (let c = 1; c <= totalCols; c++) {
          layoutSeats.push({
            seatNumber: `${rowChar}${c}`,
            row: rowChar,
            column: c,
            type: 'Standard',
            priceMultiplier: 1.0
          });
        }
      }
    }

    const hall = await hallModel.create({
      cinemaId,
      name,
      type,
      totalRows,
      totalCols,
      supportedFormats,
      seats: layoutSeats
    });

    res.status(201).json({ success: true, data: hall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateHallLayout = async (req, res) => {
  try {
    const { totalRows, totalCols, seats, name, type, supportedFormats } = req.body;
    const hall = await hallModel.findByIdAndUpdate(
      req.params.id,
      { totalRows, totalCols, seats, name, type, supportedFormats },
      { new: true, runValidators: true }
    );

    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
    res.json({ success: true, data: hall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. SHOWTIME SCHEDULER & TIMELINE
// ==========================================

export const getTimelineShowtimes = async (req, res) => {
  try {
    const { cinemaId, date } = req.query;
    if (!cinemaId || !date) {
      return res.status(400).json({ success: false, message: 'cinemaId and date are required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const showtimes = await showtimeModel.find({
      cinemaId,
      startTime: { $gte: startOfDay,$lte: endOfDay }
    }).populate('movieId', 'title runningTime posterUrl').populate('hallId', 'name type');

    res.json({ success: true, data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShowtime = async (req, res) => {
  try {
    const { movieId, hallId, cinemaId, format, price, startTime, attributes, cleaningBufferMinutes = 30 } = req.body;

    const movie = await movieModel.findById(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const start = new Date(startTime);
    // End time = start time + movie running time + buffer time
    const end = new Date(start.getTime() + (movie.runningTime + cleaningBufferMinutes) * 60000);

    // Collision Detection Engine: Checks overlapping showtimes in the same hall
    const existingOverlap = await showtimeModel.findOne({
      hallId,
      $or: [
        { startTime: { $lt: end }, endTime: {$gt: start } }
      ]
    });

    if (existingOverlap) {
      return res.status(409).json({
        success: false,
        message: 'Showtime collision detected in this hall for the selected timeframe (including cleaning buffer).'
      });
    }

    const showtime = await showtimeModel.create({
      movieId,
      hallId,
      cinemaId,
      format,
      price,
      startTime: start,
      endTime: end,
      attributes
    });

    res.status(201).json({ success: true, data: showtime });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getShowtimeOccupancyInspector = async (req, res) => {
  try {
    const showtime = await showtimeModel.findById(req.params.id)
      .populate('movieId', 'title')
      .populate('hallId');

    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });

    // Filter out expired seat holds
    const now = new Date();
    const activeHolds = showtime.tempSeatHolds.filter(hold => hold.expiresAt > now);

    res.json({
      success: true,
      data: {
        showtimeId: showtime._id,
        movieTitle: showtime.movieId.title,
        hall: showtime.hallId,
        bookedSeats: showtime.bookedSeats,
        activeHolds
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. SNACKS & CONCESSIONS
// ==========================================

export const createSnack = async (req, res) => {
  try {
    const snack = await snackModel.create(req.body);
    res.status(201).json({ success: true, data: snack });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSnacks = async (req, res) => {
  try {
    const snacks = await snackModel.find();
    res.json({ success: true, data: snacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleSnackAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const snack = await snackModel.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );
    if (!snack) return res.status(404).json({ success: false, message: 'Snack not found' });
    res.json({ success: true, data: snack });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. BOOKINGS, TICKETS & REFUNDS
// ==========================================

export const getMasterOrders = async (req, res) => {
  try {
    const { paymentStatus, bookingStatus, cinemaId, startDate, endDate } = req.query;
    const filter = {};

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (bookingStatus) filter.bookingStatus = bookingStatus;
    if (cinemaId) filter.cinemaId = cinemaId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await bookingModel.find(filter)
      .populate('userId', 'first_name last_name email phone')
      .populate('cinemaId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTicketPOS = async (req, res) => {
  try {
    const { query } = req.query; // search term: transactionId, email, or phone
    if (!query) return res.status(400).json({ success: false, message: 'Query parameter required' });

    let booking = await bookingModel.findOne({ transactionId: query })
      .populate('userId', 'first_name last_name email phone')
      .populate('showtimeId')
      .populate('cinemaId', 'name');

    if (!booking) {
      const users = await User.find({
        $or: [{ email: query.toLowerCase() }, { phone: query }]
      });
      const userIds = users.map(u => u._id);

      booking = await bookingModel.find({ userId: { $in: userIds } })
        .populate('userId', 'first_name last_name email phone')
        .populate('showtimeId')
        .populate('cinemaId', 'name')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, reason } = req.body;

    const booking = await bookingModel.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.paymentStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'Booking already refunded' });
    }

    // 1. Update order payment & booking status
    booking.paymentStatus = 'refunded';
    booking.bookingStatus = 'cancelled';
    booking.refundDetails = {
      refundedAt: new Date(),
      refundAmount: refundAmount || booking.totalAmount,
      reason: reason || 'Customer refund request'
    };
    await booking.save();

    // 2. Clear booked seats from associated Showtime
    const seatNumbersToRelease = booking.tickets.map(t => t.seatNumber);
    await showtimeModel.findByIdAndUpdate(booking.showtimeId, {
      $pull: { bookedSeats: {$in: seatNumbersToRelease } }
    });

    res.json({ success: true, message: 'Refund processed successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. USER & ACCESS CONTROL (RBAC)
// ==========================================

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('assignedCinemaId', 'name');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRoleAndAssignment = async (req, res) => {
  try {
    const { role, assignedCinemaId } = req.body;
    
    if (role && !['user', 'cinema_manager', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const updateFields = {};
    if (role) updateFields.role = role;
    if (assignedCinemaId !== undefined) updateFields.assignedCinemaId = assignedCinemaId;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import Showtime from '../../db/models/showtime.model.js';
import Hall from '../../db/models/hall.model.js';
import Movie from '../../db/models/movie.model.js';
import Cinema from '../../db/models/cinema.model.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert "HH:MM" string to total minutes
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Check if two time ranges overlap
const timesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// GET /api/showtimes?movie=&cinema=&date=&page=1&limit=20
export const getAllShowtimes = async (req, res, next) => {
  try {
    const { movie, cinema, date, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (movie) filter.movie = movie;
    if (cinema) filter.cinema = cinema;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [showtimes, total] = await Promise.all([
      Showtime.find(filter)
        .populate('movie', 'title poster duration status')
        .populate('cinema', 'name city')
        .populate({
          path: 'hall',
          select: 'name totalSeats',
          populate: { path: 'theaterType', select: 'name extraPrice' },
        })
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Showtime.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: showtimes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/showtimes/:id
export const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('cinema', 'name city address phone')
      .populate({
        path: 'hall',
        populate: { path: 'theaterType', select: 'name extraPrice description' },
      });

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:movieId/showtimes?date=&cinema=
export const getShowtimesByMovie = async (req, res, next) => {
  try {
    const { date, cinema } = req.query;
    const filter = { movie: req.params.movieId, status: 'scheduled' };

    if (cinema) filter.cinema = cinema;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const showtimes = await Showtime.find(filter)
      .populate('cinema', 'name city address')
      .populate({
        path: 'hall',
        select: 'name totalSeats',
        populate: { path: 'theaterType', select: 'name extraPrice' },
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, total: showtimes.length, data: showtimes });
  } catch (error) {
    next(error);
  }
};

// POST /api/showtimes
export const createShowtime = async (req, res, next) => {
  try {
    const { movie, cinema, hall, date, startTime, price } = req.body;

    // Required fields
    if (!movie || !cinema || !hall || !date || !startTime || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: movie, cinema, hall, date, startTime, price',
      });
    }

    // Validate references
    const [movieDoc, cinemaDoc, hallDoc] = await Promise.all([
      Movie.findById(movie),
      Cinema.findById(cinema),
      Hall.findById(hall).populate('theaterType', 'extraPrice'),
    ]);

    if (!movieDoc) return res.status(404).json({ success: false, message: 'Movie not found' });
    if (!cinemaDoc) return res.status(404).json({ success: false, message: 'Cinema not found' });
    if (!hallDoc) return res.status(404).json({ success: false, message: 'Hall not found' });

    // Hall must belong to the given cinema
    if (hallDoc.cinema.toString() !== cinema) {
      return res.status(400).json({
        success: false,
        message: 'Hall does not belong to the specified cinema',
      });
    }

    // Auto-calculate endTime from movie duration
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + movieDoc.duration;
    const endHour = Math.floor(endMinutes / 60) % 24;
    const endMin = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // ── Conflict check: same hall, same date, overlapping time ──────────────
    const showtimeDate = new Date(date);
    const dayStart = new Date(showtimeDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(showtimeDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingShowtimes = await Showtime.find({
      hall,
      date: { $gte: dayStart, $lte: dayEnd },
      status: 'scheduled',
    });

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    const conflict = existingShowtimes.find((s) => {
      const exStart = timeToMinutes(s.startTime);
      const exEnd = s.endTime ? timeToMinutes(s.endTime) : exStart + 120;
      return timesOverlap(startMins, endMins, exStart, exEnd);
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Hall is already booked from ${conflict.startTime} to ${conflict.endTime} on this date`,
      });
    }

    const showtime = await Showtime.create({ ...req.body, endTime });
    const populated = await Showtime.findById(showtime._id)
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name city')
      .populate({
        path: 'hall',
        select: 'name totalSeats',
        populate: { path: 'theaterType', select: 'name extraPrice' },
      });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/showtimes/:id
export const updateShowtime = async (req, res, next) => {
  try {
    // Recalculate endTime if startTime or movie changed
    let updateData = { ...req.body };

    if (req.body.startTime || req.body.movie) {
      const showtime = await Showtime.findById(req.params.id).populate('movie', 'duration');
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found' });
      }

      const movieId = req.body.movie || showtime.movie._id;
      const movie = await Movie.findById(movieId);
      const startTime = req.body.startTime || showtime.startTime;

      if (movie) {
        const startMins = timeToMinutes(startTime);
        const endMins = startMins + movie.duration;
        const endHour = Math.floor(endMins / 60) % 24;
        const endMin = endMins % 60;
        updateData.endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      }
    }

    const showtime = await Showtime.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name city')
      .populate('hall', 'name totalSeats');

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/showtimes/:id
export const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }
    res.status(200).json({ success: true, message: 'Showtime deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/showtimes/:id/book-seats
// Called by the booking flow to mark seats as taken
export const bookSeats = async (req, res, next) => {
  try {
    const { seats } = req.body; // e.g. ["A1", "A2"]

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'seats must be a non-empty array' });
    }

    const showtime = await Showtime.findById(req.params.id).populate('hall', 'totalSeats rows seatsPerRow');
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    if (showtime.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Cannot book seats for a non-scheduled showtime' });
    }

    // Check if any seat is already booked
    const alreadyBooked = seats.filter((s) => showtime.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.join(', ')}`,
      });
    }

    // Validate seat IDs match hall layout
    const hall = showtime.hall;
    const validSeats = [];
    for (let r = 0; r < hall.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let s = 1; s <= hall.seatsPerRow; s++) {
        validSeats.push(`${rowLabel}${s}`);
      }
    }
    const invalidSeats = seats.filter((s) => !validSeats.includes(s));
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seat IDs for this hall: ${invalidSeats.join(', ')}`,
      });
    }

    showtime.bookedSeats.push(...seats);
    await showtime.save();

    res.status(200).json({
      success: true,
      message: `${seats.length} seat(s) booked successfully`,
      data: {
        bookedSeats: showtime.bookedSeats,
        availableCount: hall.totalSeats - showtime.bookedSeats.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

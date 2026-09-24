import Hall from '../../db/models/hall.model.js';
import Cinema from '../../db/models/cinema.model.js';
import TheaterType from '../../db/models/theaterType.model.js';
import Showtime from '../../db/models/showtime.model.js';

// GET /api/cinemas/:cinemaId/halls
export const getHallsByCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.cinemaId);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const halls = await Hall.find({ cinema: req.params.cinemaId }).populate(
      'theaterType',
      'name extraPrice description'
    );

    res.status(200).json({ success: true, total: halls.length, data: halls });
  } catch (error) {
    next(error);
  }
};

// GET /api/halls/:id
export const getHallById = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id)
      .populate('theaterType', 'name extraPrice description')
      .populate('cinema', 'name city');

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    res.status(200).json({ success: true, data: hall });
  } catch (error) {
    next(error);
  }
};

// GET /api/halls/:id/seat-map?showtimeId=
// Returns the full seat grid with availability for a given showtime
export const getHallSeatMap = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id).populate('theaterType', 'name extraPrice');
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    let bookedSeats = [];
    if (req.query.showtimeId) {
      const showtime = await Showtime.findById(req.query.showtimeId);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found' });
      }
      bookedSeats = showtime.bookedSeats || [];
    }

    // Build the seat grid
    // Row labels: A, B, C, … (one letter per row)
    const rows = [];
    for (let r = 0; r < hall.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // A=65
      const seats = [];
      for (let s = 1; s <= hall.seatsPerRow; s++) {
        const seatId = `${rowLabel}${s}`;
        seats.push({
          id: seatId,
          row: rowLabel,
          number: s,
          isBooked: bookedSeats.includes(seatId),
        });
      }
      rows.push({ row: rowLabel, seats });
    }

    res.status(200).json({
      success: true,
      data: {
        hallId: hall._id,
        hallName: hall.name,
        theaterType: hall.theaterType,
        totalSeats: hall.totalSeats,
        bookedCount: bookedSeats.length,
        availableCount: hall.totalSeats - bookedSeats.length,
        seatMap: rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cinemas/:cinemaId/halls
export const createHall = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.cinemaId);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const { name, rows, seatsPerRow, theaterType } = req.body;

    if (!name || !rows || !seatsPerRow || !theaterType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, rows, seatsPerRow, theaterType',
      });
    }

    // Validate that theaterType exists
    const typeExists = await TheaterType.findById(theaterType);
    if (!typeExists) {
      return res.status(404).json({ success: false, message: 'Theater type not found' });
    }

    // ✅ Fixed: capture the returned document
    const hall = await Hall.create({ ...req.body, cinema: cinema._id });
    const populated = await hall.populate('theaterType', 'name extraPrice');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/halls/:id
export const updateHall = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    // Validate new theaterType if provided
    if (req.body.theaterType) {
      const typeExists = await TheaterType.findById(req.body.theaterType);
      if (!typeExists) {
        return res.status(404).json({ success: false, message: 'Theater type not found' });
      }
    }

    Object.assign(hall, req.body);
    await hall.save(); // triggers pre-save hook → recalculates totalSeats

    await hall.populate('theaterType', 'name extraPrice');
    res.status(200).json({ success: true, data: hall });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/halls/:id
export const deleteHall = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    // Cascade: delete showtimes tied to this hall
    await Showtime.deleteMany({ hall: hall._id });
    await hall.deleteOne();

    res.status(200).json({ success: true, message: 'Hall and its showtimes deleted successfully' });
  } catch (error) {
    next(error);
  }
};

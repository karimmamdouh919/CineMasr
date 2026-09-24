import Cinema from '../../db/models/cinema.model.js';
import Hall from '../../db/models/hall.model.js';
import Showtime from '../../db/models/showtime.model.js';

// GET /api/cinemas?city=
export const getAllCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };

    const cinemas = await Cinema.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, total: cinemas.length, data: cinemas });
  } catch (error) {
    next(error);
  }
};

// GET /api/cinemas/:id  — includes halls with their theater types
export const getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const halls = await Hall.find({ cinema: cinema._id, isActive: true }).populate(
      'theaterType',
      'name extraPrice description'
    );

    res.status(200).json({
      success: true,
      data: { ...cinema.toObject(), halls },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cinemas
export const createCinema = async (req, res, next) => {
  try {
    const { name, city, address } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, city, address',
      });
    }

    const cinema = await Cinema.create(req.body);
    res.status(201).json({ success: true, data: cinema });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cinemas/:id
export const updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    res.status(200).json({ success: true, data: cinema });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cinemas/:id  — cascades to halls and their showtimes
export const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    // Cascade: delete all halls belonging to this cinema
    const halls = await Hall.find({ cinema: cinema._id });
    const hallIds = halls.map((h) => h._id);

    // Cascade: delete all showtimes tied to those halls
    if (hallIds.length > 0) {
      await Showtime.deleteMany({ hall: { $in: hallIds } });
    }

    await Hall.deleteMany({ cinema: cinema._id });
    await cinema.deleteOne();

    res.status(200).json({
      success: true,
      message: `Cinema "${cinema.name}" and all its halls and showtimes deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

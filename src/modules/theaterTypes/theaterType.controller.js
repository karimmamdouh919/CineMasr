import TheaterType from '../../db/models/theaterType.model.js';
import Hall from '../../db/models/hall.model.js';

// GET /api/theater-types
export const getAllTheaterTypes = async (req, res, next) => {
  try {
    const types = await TheaterType.find().sort({ name: 1 });
    res.status(200).json({ success: true, total: types.length, data: types });
  } catch (error) {
    next(error);
  }
};

// GET /api/theater-types/:id
export const getTheaterTypeById = async (req, res, next) => {
  try {
    const type = await TheaterType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Theater type not found' });
    }
    res.status(200).json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
};

// POST /api/theater-types
export const createTheaterType = async (req, res, next) => {
  try {
    const { name, extraPrice, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Theater type name is required' });
    }

    const exists = await TheaterType.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: `Theater type "${name}" already exists` });
    }

    const type = await TheaterType.create({ name, extraPrice, description });
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
};

// PUT /api/theater-types/:id
export const updateTheaterType = async (req, res, next) => {
  try {
    const type = await TheaterType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!type) {
      return res.status(404).json({ success: false, message: 'Theater type not found' });
    }
    res.status(200).json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/theater-types/:id
export const deleteTheaterType = async (req, res, next) => {
  try {
    // Prevent deletion if halls are using this type
    const inUse = await Hall.findOne({ theaterType: req.params.id });
    if (inUse) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete: this theater type is assigned to one or more halls',
      });
    }

    const type = await TheaterType.findByIdAndDelete(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Theater type not found' });
    }

    res.status(200).json({ success: true, message: 'Theater type deleted successfully' });
  } catch (error) {
    next(error);
  }
};

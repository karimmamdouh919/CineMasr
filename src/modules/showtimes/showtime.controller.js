import { showtimeModel } from '../../db/models/showtime.model.js';

export const getShowtimes = async (req, res) => {
  try {
    const showtimes = await showtimeModel
      .find(req.query)
      .populate('movieId hallId cinemaId');
    res.status(200).json({ success: true, count: showtimes.length, data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await showtimeModel
      .findById(req.params.id)
      .populate('movieId hallId cinemaId');
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });
    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShowtime = async (req, res) => {
  try {
    const showtime = await showtimeModel.create(req.body);
    res.status(201).json({ success: true, data: showtime });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateShowtime = async (req, res) => {
  try {
    const showtime = await showtimeModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });
    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteShowtime = async (req, res) => {
  try {
    const showtime = await showtimeModel.findByIdAndDelete(req.params.id);
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });
    res.status(200).json({ success: true, message: 'Showtime deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
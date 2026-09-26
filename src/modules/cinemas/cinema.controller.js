import { cinemaModel } from '../../db/models/cinema.model.js';
import { hallModel } from '../../db/models/hall.model.js';

export const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await cinemaModel.find(req.query);
    res.status(200).json({ success: true, count: cinemas.length, data: cinemas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCinemaById = async (req, res) => {
  try {
    const cinema = await cinemaModel.findById(req.params.id);
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
    res.status(200).json({ success: true, data: cinema });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCinemaHalls = (req, res) => {
  res.send('Get halls for a specific cinema branch');
};

export const createCinema = async (req, res) => {
  try {
    const cinema = await cinemaModel.create(req.body);
    res.status(201).json({ success: true, data: cinema });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCinema = async (req, res) => {
  try {
    const cinema = await cinemaModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
    res.status(200).json({ success: true, data: cinema });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCinema = async (req, res) => {
  try {
    const cinema = await cinemaModel.findByIdAndDelete(req.params.id);
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
    res.status(200).json({ success: true, message: 'Cinema deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHall = async (req, res) => {
  try {
    const hall = await hallModel.create(req.body);
    res.status(201).json({ success: true, data: hall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateHall = async (req, res) => {
  try {
    const hall = await hallModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
    res.status(200).json({ success: true, data: hall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteHall = async (req, res) => {
  try {
    const hall = await hallModel.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
    res.status(200).json({ success: true, message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllHalls = async (req, res) => {
  try {
    const halls = await hallModel.find(req.query).populate('cinemaId');
    res.status(200).json({ success: true, count: halls.length, data: halls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHallById = async (req, res) => {
  try {
    const hall = await hallModel.findById(req.params.id).populate('cinemaId');
    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
    res.status(200).json({ success: true, data: hall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
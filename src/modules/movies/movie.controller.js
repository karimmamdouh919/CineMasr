import { movieModel } from '../../db/models/movie.model.js';

export const getAllMovies = async (req, res) => {
  try {
    const movies = await movieModel.find(req.query);
    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await movieModel.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMovie =async (req, res) => {
  try {
    const movie = await movieModel.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await movieModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await movieModel.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
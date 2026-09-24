import Movie from '../../db/models/movie.model.js';
import Category from '../../db/models/category.model.js';

// GET /api/movies?search=&category=&language=&status=&page=1&limit=10
export const getAllMovies = async (req, res, next) => {
  try {
    const { search, category, language, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.categories = category;        // category ObjectId
    if (language) filter.language = { $regex: language, $options: 'i' };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .populate('categories', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Movie.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/now-showing
export const getNowShowing = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'now_showing' })
      .populate('categories', 'name')
      .sort({ releaseDate: -1 });

    res.status(200).json({ success: true, total: movies.length, data: movies });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/coming-soon
export const getComingSoon = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'coming_soon' })
      .populate('categories', 'name')
      .sort({ releaseDate: 1 });

    res.status(200).json({ success: true, total: movies.length, data: movies });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:id
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('categories', 'name');
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// POST /api/movies
export const createMovie = async (req, res, next) => {
  try {
    const { title, description, categories, duration, language, releaseDate } = req.body;

    // Required fields check
    if (!title || !description || !categories || !duration || !language || !releaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, categories, duration, language, releaseDate',
      });
    }

    // Validate that all category IDs exist
    const cats = Array.isArray(categories) ? categories : [categories];
    const foundCats = await Category.find({ _id: { $in: cats } });
    if (foundCats.length !== cats.length) {
      return res.status(400).json({ success: false, message: 'One or more category IDs are invalid' });
    }

    const movie = await Movie.create(req.body);
    const populated = await movie.populate('categories', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/movies/:id
export const updateMovie = async (req, res, next) => {
  try {
    // If updating categories, validate them
    if (req.body.categories) {
      const cats = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];
      const foundCats = await Category.find({ _id: { $in: cats } });
      if (foundCats.length !== cats.length) {
        return res.status(400).json({ success: false, message: 'One or more category IDs are invalid' });
      }
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categories', 'name');

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/movies/:id
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};

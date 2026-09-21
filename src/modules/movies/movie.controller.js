export const getAllMovies = (req, res) => {
  res.send('Get all movies with filters & search');
};

export const getMovieById = (req, res) => {
  res.send('Get movie details by ID');
};

export const createMovie = (req, res) => {
  res.send('Admin: Add new movie');
};

export const updateMovie = (req, res) => {
  res.send('Admin: Update movie');
};

export const deleteMovie = (req, res) => {
  res.send('Admin: Delete movie');
};
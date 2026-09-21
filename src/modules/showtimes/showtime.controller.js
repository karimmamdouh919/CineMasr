export const getShowtimes = (req, res) => {
  res.send('Get showtimes filtered by movie, cinema, or date');
};

export const getShowtimeById = (req, res) => {
  res.send('Get single showtime details and current seat matrix');
};

export const createShowtime = (req, res) => {
  res.send('Admin: Create showtime slot');
};

export const updateShowtime = (req, res) => {
  res.send('Admin: Update showtime slot');
};

export const deleteShowtime = (req, res) => {
  res.send('Admin: Cancel/Delete showtime slot');
};
export const getAllCinemas = (req, res) => {
  res.send('Get all cinema branches');
};

export const getCinemaById = (req, res) => {
  res.send('Get cinema branch details');
};

export const getCinemaHalls = (req, res) => {
  res.send('Get halls for a specific cinema branch');
};

export const createCinema = (req, res) => {
  res.send('Admin: Create cinema branch');
};

export const updateCinema = (req, res) => {
  res.send('Admin: Update cinema branch');
};

export const deleteCinema = (req, res) => {
  res.send('Admin: Delete cinema branch');
};

export const createHall = (req, res) => {
  res.send('Admin: Add hall to cinema');
};

export const updateHall = (req, res) => {
  res.send('Admin: Update hall configuration');
};

export const deleteHall = (req, res) => {
  res.send('Admin: Delete hall');
};
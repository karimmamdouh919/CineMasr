export const getAllSnacks = (req, res) => {
  res.send('Get list of available snacks');
};

export const createSnack = (req, res) => {
  res.send('Admin: Add new snack item');
};

export const updateSnack = (req, res) => {
  res.send('Admin: Update snack item');
};

export const deleteSnack = (req, res) => {
  res.send('Admin: Delete snack item');
};
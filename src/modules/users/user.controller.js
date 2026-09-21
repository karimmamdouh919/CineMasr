export const getProfile = (req, res) => {
  res.send('Get current user profile');
};

export const updateProfile = (req, res) => {
  res.send('Update user profile');
};

export const getAllUsers = (req, res) => {
  res.send('Admin: Get all users');
};

export const getUserById = (req, res) => {
  res.send('Admin: Get user details');
};

export const updateUserRole = (req, res) => {
  res.send('Admin: Update user role');
};

export const deleteUser = (req, res) => {
  res.send('Admin: Delete user');
};
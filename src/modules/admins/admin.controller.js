export const getSummaryStats = (req, res) => {
  res.send('Get total revenue, ticket count, user counts');
};

export const getRevenueByMovie = (req, res) => {
  res.send('Get revenue stats per movie');
};

export const getRevenueByCinema = (req, res) => {
  res.send('Get revenue stats per branch');
};
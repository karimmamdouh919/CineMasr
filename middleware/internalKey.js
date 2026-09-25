const AppError = require('../utils/AppError');

const requireInternalKey = (req, res, next) => {
  const expected = process.env.INTERNAL_API_KEY;

  if (!expected) {
    return next(new AppError('INTERNAL_API_KEY is not configured on the server.', 500));
  }

  const provided = req.header('x-internal-api-key');
  if (!provided || provided !== expected) {
    return next(new AppError('Forbidden: missing or invalid internal API key.', 403));
  }

  return next();
};

module.exports = requireInternalKey;
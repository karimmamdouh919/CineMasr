const AppError = require('../utils/AppError');


const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};


const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal server error.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value: this record already exists or the seat is no longer available.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in the request body.';
  } else {
    console.error('Unexpected error:', err);
  }

  const body = { success: false, message };
  if (process.env.NODE_ENV === 'development' && statusCode === 500) body.stack = err.stack;

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
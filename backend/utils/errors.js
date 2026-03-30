class AppError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not Found' });
}

function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    details: err.details,
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };


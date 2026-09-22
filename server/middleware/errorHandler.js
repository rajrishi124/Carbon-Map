// Centralized error handling middleware
// Ensures consistent JSON error responses and prevents raw stack trace leakage

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Something went wrong. Please try again.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.isAbsurdInput && { isAbsurdInput: true, maxThreshold: err.maxThreshold }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

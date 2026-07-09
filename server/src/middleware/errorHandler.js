export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

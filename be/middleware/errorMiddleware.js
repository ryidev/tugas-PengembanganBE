/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // If statusCode is 200 but an error is thrown, we set it to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  res.json({
    message: err.message,
    // Provide stack trace only in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

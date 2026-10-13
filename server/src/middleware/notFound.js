/**
 * Middleware to handle unknown routes (404 Not Found)
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`
    }
  });
}


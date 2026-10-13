/**
 * Centralized error handling middleware for the application.
 */
export function errorHandler(err, req, res, _next) {
  // Determine HTTP status code
  let statusCode = err.status || err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal server error occurred.';

  // Handle express JSON body parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON_BODY';
    message = 'Malformed JSON payload in request body.';
  }

  // Handle MS SQL Server unique constraint violation (Error 2627 or 2601)
  if (err.number === 2627 || err.number === 2601 || err.originalError?.number === 2627 || err.originalError?.number === 2601) {
    statusCode = 409;
    errorCode = 'EMAIL_ALREADY_EXISTS';
    message = 'A user with this email address already exists.';
  }

  // Handle MS SQL Server check constraint violation (Error 547)
  if (err.number === 547 || err.originalError?.number === 547) {
    statusCode = 400;
    errorCode = 'CONSTRAINT_VIOLATION';
    message = 'A data constraint was violated (check name or age range).';
  }

  // Handle Database connection failures
  if (err.code === 'DB_CONNECTION_FAILED' || err.code === 'ELOGIN' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'DATABASE_UNAVAILABLE';
    message = 'The database service is currently unavailable. Please check SQL Server connection.';
  }

  // Log error details on server side in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    if (statusCode >= 500) {
      console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
    } else {
      console.warn(`[CLIENT ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, message);
    }
  }

  // Build clean JSON response
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  };

  if (err.errors && Array.isArray(err.errors)) {
    response.error.details = err.errors;
  }

  res.status(statusCode).json(response);
}


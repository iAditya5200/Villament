/**
 * asyncHandler.js
 * ---------------
 * Express 4 does not automatically catch errors thrown inside "async" route
 * functions. This helper wraps a route so that any error is forwarded to the
 * central error handler (middleware/errorHandlers.js) instead of crashing.
 *
 * Usage:
 *     router.get("/", asyncHandler(async (request, response) => { ... }));
 */

export function asyncHandler(routeFunction) {
  return function wrappedRoute(request, response, next) {
    Promise.resolve(routeFunction(request, response, next)).catch(next);
  };
}

/**
 * Creates an Error object that also carries an HTTP status code.
 * The central error handler reads "statusCode" to send the right response.
 *
 * @param {number} statusCode - e.g. 404
 * @param {string} message - human readable explanation
 */
export function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

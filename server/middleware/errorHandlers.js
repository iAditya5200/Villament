/**
 * errorHandlers.js
 * ----------------
 * Two small pieces of middleware that keep error handling in one place:
 *
 *  1. handleUnknownRoute  – answers 404 for any API address that does not exist.
 *  2. handleErrors        – turns any thrown error into a friendly JSON reply.
 */

/** Runs when no route matched the request. */
export function handleUnknownRoute(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

/**
 * Express recognises error handlers because they take FOUR arguments.
 * Any error passed to next(error) or thrown inside an async route ends up here.
 */
// eslint-disable-next-line no-unused-vars
export function handleErrors(error, request, response, next) {
  // Mongoose validation error: collect every field message into one list
  if (error.name === "ValidationError") {
    const validationMessages = Object.values(error.errors).map((fieldError) => fieldError.message);
    return response.status(400).json({ message: validationMessages.join(" "), errors: validationMessages });
  }

  // An invalid MongoDB id such as "/api/properties/abc"
  if (error.name === "CastError") {
    return response.status(400).json({ message: "The provided id is not valid." });
  }

  // Duplicate value on a unique field (for example, the same admin email twice)
  if (error.code === 11000) {
    const duplicateFieldName = Object.keys(error.keyValue || {}).join(", ");
    return response.status(409).json({ message: `A record with this ${duplicateFieldName} already exists.` });
  }

  // File upload problems (wrong type, file too large ...)
  if (error.name === "MulterError" || error.message?.startsWith("Only JPG")) {
    return response.status(400).json({ message: error.message });
  }

  const statusCode = error.statusCode || 500;
  if (statusCode === 500) {
    console.error(error); // log unexpected errors for the developer
  }

  return response.status(statusCode).json({
    message: statusCode === 500 ? "Something went wrong on the server." : error.message,
  });
}

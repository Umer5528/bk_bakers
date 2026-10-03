import ApiError from "../utils/ApiError.js";

// Central error handler. Normalizes Mongoose/JWT errors into ApiError-shaped
// responses and always logs full details server-side while keeping
// customer-facing messages friendly.
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === "CastError") {
    error = new ApiError(404, "Resource not found");
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `An account with this ${field} already exists`);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(". ");
    error = new ApiError(400, message);
  }

  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Not authorized, invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Your session has expired, please log in again");
  }

  // Multer's own errors (too large, too many files) arrive with a
  // .code rather than our ApiError shape — translate them the same way.
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "That file is too large — the maximum size is 5MB",
      LIMIT_FILE_COUNT: "Too many files uploaded at once",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
    };
    error = new ApiError(400, messages[err.code] || "File upload failed");
  }

  const statusCode = error.statusCode || 500;
  const message = error.statusCode
    ? error.message
    : "Something went wrong. Please try again.";

  if (statusCode === 500) {
    console.error("UNEXPECTED ERROR:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};

export default errorHandler;

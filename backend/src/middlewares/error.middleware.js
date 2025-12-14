import { errorResponse } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, 400, "File size exceeds 5MB limit");
    }
    return errorResponse(res, 400, err.message);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(res, 400, `${field} already exists`);
  }

  return errorResponse(res, 500, err.message || "Internal server error");
};

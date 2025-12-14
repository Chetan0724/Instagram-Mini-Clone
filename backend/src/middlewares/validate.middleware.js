import { errorResponse } from "../utils/apiResponse.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return errorResponse(res, 400, errors[0].message);
      }
      return errorResponse(res, 400, error.message || "Validation failed");
    }
  };
};

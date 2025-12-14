import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Access token required");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return errorResponse(res, 401, "Invalid or expired access token");
    }
  } catch (error) {
    return errorResponse(res, 500, "Authentication error");
  }
};

import jwt from "jsonwebtoken";
import Token from "../models/token.model.js";

export const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await Token.create({ userId, refreshToken, expiresAt });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const tokenDoc = await Token.findOne({
      userId: decoded.userId,
      refreshToken: token,
    });

    if (!tokenDoc) {
      throw new Error("Invalid refresh token");
    }

    return decoded.userId;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const deleteRefreshToken = async (token) => {
  await Token.deleteOne({ refreshToken: token });
};

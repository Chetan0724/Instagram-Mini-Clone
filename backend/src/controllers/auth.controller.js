import User from "../models/user.model.js";
import {
  generateTokens,
  verifyRefreshToken,
  deleteRefreshToken,
} from "../utils/generateTokens.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const signup = async (req, res, next) => {
  try {
    const { username, email, password, fullName, bio } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return errorResponse(res, 400, "Email or username already exists");
    }

    let profileImageUrl = "";
    if (req.file) {
      profileImageUrl = await uploadToCloudinary(
        req.file.path,
        "instagram-clone/users"
      );
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName,
      bio: bio || "",
      profileImage: profileImageUrl,
    });

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      bio: user.bio,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    };

    return successResponse(res, 201, "User created successfully", {
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const oldRefreshToken = req.cookies.refreshToken;
    if (oldRefreshToken) {
      try {
        await deleteRefreshToken(oldRefreshToken);
      } catch (error) {
        console.error("Error deleting old refresh token:", error);
      }
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      bio: user.bio,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    };

    return successResponse(res, 200, "Login successful", {
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return errorResponse(res, 401, "Refresh token not found");
    }

    let userId;
    try {
      userId = await verifyRefreshToken(refreshToken);
    } catch (error) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return errorResponse(res, 401, "Invalid refresh token");
    }

    await deleteRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      userId
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 200, "Token refreshed successfully", {
      accessToken,
    });
  } catch (error) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return errorResponse(res, 401, "Invalid refresh token");
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      try {
        await deleteRefreshToken(refreshToken);
      } catch (error) {
        console.error("Error deleting refresh token:", error);
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, 200, "Logout successful");
  } catch (error) {
    next(error);
  }
};

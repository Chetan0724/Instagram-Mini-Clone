import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Follow from "../models/follow.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const isFollowing = await Follow.findOne({
      followerId: req.userId,
      followingId: user._id,
    });

    const userResponse = {
      ...user.toObject(),
      isFollowing: !!isFollowing,
    };

    return successResponse(
      res,
      200,
      "Profile fetched successfully",
      userResponse
    );
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { cursor, limit = 10 } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const query = { userId: user._id };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate("userId", "username fullName profileImage");

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, limit) : posts;

    return successResponse(res, 200, "Posts fetched successfully", {
      posts: result,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { query, cursor, limit = 20 } = req.query;

    if (!query || query.trim() === "") {
      return errorResponse(res, 400, "Search query is required");
    }

    const searchQuery = {
      username: { $regex: query.trim(), $options: "i" },
    };

    if (cursor) {
      searchQuery._id = { $gt: cursor };
    }

    const users = await User.find(searchQuery)
      .select("username fullName profileImage bio followersCount")
      .sort({ username: 1 })
      .limit(parseInt(limit) + 1);

    const hasMore = users.length > limit;
    const result = hasMore ? users.slice(0, limit) : users;

    return successResponse(res, 200, "Users found successfully", {
      users: result,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

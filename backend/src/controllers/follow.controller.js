import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId.toString()) {
      return errorResponse(res, 400, "Cannot follow yourself");
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return errorResponse(res, 404, "User not found");
    }

    const existingFollow = await Follow.findOne({
      followerId: req.userId,
      followingId: userId,
    });

    if (existingFollow) {
      return errorResponse(res, 400, "Already following this user");
    }

    await Follow.create({
      followerId: req.userId,
      followingId: userId,
    });

    await User.findByIdAndUpdate(req.userId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });

    return successResponse(res, 200, "User followed successfully");
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({
      followerId: req.userId,
      followingId: userId,
    });

    if (!follow) {
      return errorResponse(res, 400, "Not following this user");
    }

    await User.findByIdAndUpdate(req.userId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });

    return successResponse(res, 200, "User unfollowed successfully");
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cursor, limit = 20 } = req.query;

    const query = { followingId: userId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const follows = await Follow.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate("followerId", "username fullName profileImage");

    const hasMore = follows.length > limit;
    const result = hasMore ? follows.slice(0, limit) : follows;

    const followers = result.map((f) => f.followerId);

    return successResponse(res, 200, "Followers fetched successfully", {
      followers,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cursor, limit = 20 } = req.query;

    const query = { followerId: userId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const follows = await Follow.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate("followingId", "username fullName profileImage");

    const hasMore = follows.length > limit;
    const result = hasMore ? follows.slice(0, limit) : follows;

    const following = result.map((f) => f.followingId);

    return successResponse(res, 200, "Following fetched successfully", {
      following,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

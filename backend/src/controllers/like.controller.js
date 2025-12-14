import Like from "../models/like.model.js";
import Post from "../models/post.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const existingLike = await Like.findOne({
      userId: req.userId,
      postId,
    });

    if (existingLike) {
      return errorResponse(res, 400, "Post already liked");
    }

    await Like.create({
      userId: req.userId,
      postId,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    return successResponse(res, 200, "Post liked successfully");
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const like = await Like.findOneAndDelete({
      userId: req.userId,
      postId,
    });

    if (!like) {
      return errorResponse(res, 400, "Post not liked");
    }

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    return successResponse(res, 200, "Post unliked successfully");
  } catch (error) {
    next(error);
  }
};

export const getPostLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { cursor, limit = 20 } = req.query;

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const query = { postId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const likes = await Like.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate("userId", "username fullName profileImage");

    const hasMore = likes.length > limit;
    const result = hasMore ? likes.slice(0, limit) : likes;

    const users = result.map((like) => like.userId);

    return successResponse(res, 200, "Likes fetched successfully", {
      users,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

import Post from "../models/post.model.js";
import Follow from "../models/follow.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createPost = async (req, res, next) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return errorResponse(res, 400, "Post image is required");
    }

    const imageUrl = await uploadToCloudinary(
      req.file.path,
      "instagram-clone/posts"
    );

    const post = await Post.create({
      userId: req.userId,
      imageUrl,
      caption: caption || "",
    });

    const populatedPost = await Post.findById(post._id).populate(
      "userId",
      "username fullName profileImage"
    );

    return successResponse(
      res,
      201,
      "Post created successfully",
      populatedPost
    );
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const { cursor, limit = 10 } = req.query;

    const following = await Follow.find({ followerId: req.userId }).select(
      "followingId"
    );
    const followingIds = following.map((f) => f.followingId);
    followingIds.push(req.userId);

    const query = { userId: { $in: followingIds } };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate("userId", "username fullName profileImage");

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, limit) : posts;

    const postsWithLikeStatus = await Promise.all(
      result.map(async (post) => {
        const isLiked = await Like.findOne({
          userId: req.userId,
          postId: post._id,
        });

        return {
          ...post.toObject(),
          isLiked: !!isLiked,
        };
      })
    );

    return successResponse(res, 200, "Feed fetched successfully", {
      posts: postsWithLikeStatus,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "userId",
      "username fullName profileImage"
    );

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const isLiked = await Like.findOne({
      userId: req.userId,
      postId: post._id,
    });

    const postWithStatus = {
      ...post.toObject(),
      isLiked: !!isLiked,
    };

    return successResponse(
      res,
      200,
      "Post fetched successfully",
      postWithStatus
    );
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
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

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate("userId", "username fullName profileImage");

    const hasMore = comments.length > limit;
    const result = hasMore ? comments.slice(0, limit) : comments;

    return successResponse(res, 200, "Comments fetched successfully", {
      comments: result,
      hasMore,
      nextCursor: hasMore ? result[result.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

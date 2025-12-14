import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const comment = await Comment.create({
      userId: req.userId,
      postId,
      text,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username fullName profileImage"
    );

    return successResponse(
      res,
      201,
      "Comment created successfully",
      populatedComment
    );
  } catch (error) {
    next(error);
  }
};

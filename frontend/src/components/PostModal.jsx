import { useState, useEffect } from "react";
import { X, Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postAPI, commentAPI, likeAPI } from "../api/endpoints";
import { commentSchema } from "../lib/validators";
import { formatTimeAgo } from "../lib/utils";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const PostModal = ({ post, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const { data } = await postAPI.getPostComments(post._id);
        if (isMounted) {
          setComments(data.data.comments);
          setHasMore(data.data.hasMore);
          setNextCursor(data.data.nextCursor);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load comments");
        }
      } finally {
        if (isMounted) {
          setLoadingComments(false);
        }
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [post._id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data } = await postAPI.getPostComments(post._id, nextCursor);
      setComments((prev) => [...prev, ...data.data.comments]);
      setHasMore(data.data.hasMore);
      setNextCursor(data.data.nextCursor);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await likeAPI.unlikePost(post._id);
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await likeAPI.likePost(post._id);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const onSubmit = async (data) => {
    try {
      const { data: response } = await commentAPI.createComment(
        post._id,
        data.text
      );
      setComments((prev) => [response.data, ...prev]);
      reset();
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add comment");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={32} />
        </button>

        <div className="md:w-3/5 bg-black flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt="Post"
            className="max-h-[90vh] w-full object-contain"
          />
        </div>

        <div className="md:w-2/5 flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-gray-200">
            <Link
              to={`/${post.userId.username}`}
              className="flex items-center gap-3"
            >
              <img
                src={
                  post.userId.profileImage ||
                  `https://ui-avatars.com/api/?name=${post.userId.fullName}`
                }
                alt={post.userId.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">{post.userId.username}</div>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {post.caption && (
              <div className="mb-4 flex gap-3">
                <Link to={`/${post.userId.username}`}>
                  <img
                    src={
                      post.userId.profileImage ||
                      `https://ui-avatars.com/api/?name=${post.userId.fullName}`
                    }
                    alt={post.userId.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <div>
                    <Link
                      to={`/${post.userId.username}`}
                      className="font-semibold mr-2"
                    >
                      {post.userId.username}
                    </Link>
                    <span>{post.caption}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
            )}

            {comments.map((comment) => (
              <div key={comment._id} className="mb-4 flex gap-3">
                <Link to={`/${comment.userId.username}`}>
                  <img
                    src={
                      comment.userId.profileImage ||
                      `https://ui-avatars.com/api/?name=${comment.userId.fullName}`
                    }
                    alt={comment.userId.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <div>
                    <Link
                      to={`/${comment.userId.username}`}
                      className="font-semibold mr-2"
                    >
                      {comment.userId.username}
                    </Link>
                    <span>{comment.text}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))}

            {loadingComments && (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            )}

            {hasMore && !loadingComments && (
              <button
                onClick={loadComments}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Load more comments
              </button>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={handleLike}
                className="hover:opacity-60 transition"
              >
                <Heart
                  size={24}
                  fill={isLiked ? "#ef4444" : "none"}
                  className={isLiked ? "text-red-500" : "text-gray-900"}
                />
              </button>
              <MessageCircle size={24} />
            </div>

            {likesCount > 0 && (
              <div className="font-semibold text-sm mb-2">
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </div>
            )}

            <div className="text-xs text-gray-500 uppercase mb-3">
              {formatTimeAgo(post.createdAt)}
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-center gap-2"
            >
              <input
                {...register("text")}
                placeholder="Add a comment..."
                className="flex-1 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-primary font-semibold text-sm disabled:opacity-50"
              >
                Post
              </button>
            </form>
            {errors.text && (
              <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;

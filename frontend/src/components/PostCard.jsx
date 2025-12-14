import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import { likeAPI } from "../api/endpoints";
import { formatTimeAgo, formatNumber } from "../lib/utils";
import toast from "react-hot-toast";
import PostModal from "./PostModal";

const PostCard = ({ post, onLikeUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showModal, setShowModal] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
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
      if (onLikeUpdate) onLikeUpdate(post._id, !isLiked);
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg mb-4">
        <div className="flex items-center justify-between p-3">
          <Link
            to={`/${post.userId.username}`}
            className="flex items-center gap-2"
          >
            <img
              src={
                post.userId.profileImage ||
                `https://ui-avatars.com/api/?name=${post.userId.fullName}`
              }
              alt={post.userId.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-sm">
              {post.userId.username}
            </span>
          </Link>
        </div>

        <div className="cursor-pointer" onClick={() => setShowModal(true)}>
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full aspect-square object-cover"
          />
        </div>

        <div className="p-3">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={handleLike}
              className="hover:opacity-60 transition cursor-pointer"
            >
              <Heart
                size={24}
                fill={isLiked ? "#ef4444" : "none"}
                className={isLiked ? "text-red-500" : "text-gray-900"}
              />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="hover:opacity-60 transition cursor-pointer"
            >
              <MessageCircle size={24} />
            </button>
          </div>

          {likesCount > 0 && (
            <div className="font-semibold text-sm mb-2">
              {formatNumber(likesCount)} {likesCount === 1 ? "like" : "likes"}
            </div>
          )}

          {post.caption && (
            <div className="text-sm mb-1">
              <Link
                to={`/${post.userId.username}`}
                className="font-semibold mr-2"
              >
                {post.userId.username}
              </Link>
              <span>{post.caption}</span>
            </div>
          )}

          {post.commentsCount > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-gray-500 mb-1"
            >
              View all {post.commentsCount} comments
            </button>
          )}

          <div className="text-xs text-gray-500 uppercase">
            {formatTimeAgo(post.createdAt)}
          </div>
        </div>
      </div>

      {showModal && (
        <PostModal post={post} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default PostCard;

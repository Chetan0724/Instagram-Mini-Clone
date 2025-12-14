import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useInView } from "react-intersection-observer";
import { Grid } from "lucide-react";
import { userAPI, followAPI } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";
import { formatNumber } from "../lib/utils";
import LoadingSpinner from "../components/LoadingSpinner";
import PostModal from "../components/PostModal";
import toast from "react-hot-toast";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMorePosts();
    }
  }, [inView, hasMore, loadingMore]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(username),
        userAPI.getUserPosts(username),
      ]);

      setProfile(profileRes.data.data);
      setIsFollowing(profileRes.data.data.isFollowing);
      setFollowersCount(profileRes.data.data.followersCount);
      setPosts(postsRes.data.data.posts);
      setHasMore(postsRes.data.data.hasMore);
      setNextCursor(postsRes.data.data.nextCursor);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!nextCursor) return;

    setLoadingMore(true);
    try {
      const { data } = await userAPI.getUserPosts(username, nextCursor);
      setPosts((prev) => [...prev, ...data.data.posts]);
      setHasMore(data.data.hasMore);
      setNextCursor(data.data.nextCursor);
    } catch (error) {
      toast.error("Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(profile._id);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        toast.success("Unfollowed");
      } else {
        await followAPI.followUser(profile._id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.success("Following");
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 px-4">
      <div className="mb-8">
        <div className="flex items-start gap-8 mb-8">
          <img
            src={
              profile.profileImage ||
              `https://ui-avatars.com/api/?name=${profile.fullName}`
            }
            alt={profile.username}
            className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-xl font-light">{profile.username}</h1>
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-1 rounded-lg font-semibold text-sm ${
                    isFollowing
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-primary hover:bg-primary-hover text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <div className="flex gap-8 mb-4">
              <div>
                <span className="font-semibold">{posts.length}</span> posts
              </div>
              <div>
                <span className="font-semibold">
                  {formatNumber(followersCount)}
                </span>{" "}
                followers
              </div>
              <div>
                <span className="font-semibold">
                  {formatNumber(profile.followingCount)}
                </span>{" "}
                following
              </div>
            </div>

            <div>
              <div className="font-semibold">{profile.fullName}</div>
              {profile.bio && (
                <div className="text-sm whitespace-pre-line">{profile.bio}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300">
        <div className="flex justify-center py-3 border-t border-black">
          <div className="flex items-center gap-1 text-xs font-semibold tracking-wider">
            <Grid size={12} />
            POSTS
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No posts yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {posts.map((post) => (
              <button
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className="aspect-square overflow-hidden bg-gray-100"
              >
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-full object-cover hover:opacity-90 transition"
                />
              </button>
            ))}
          </div>

          {hasMore && (
            <div ref={ref} className="flex justify-center py-8">
              {loadingMore && <LoadingSpinner />}
            </div>
          )}
        </>
      )}

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default Profile;

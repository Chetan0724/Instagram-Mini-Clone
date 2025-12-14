import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { postAPI } from "../api/endpoints";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore();
    }
  }, [inView, hasMore, loadingMore]);

  const loadFeed = async () => {
    try {
      const { data } = await postAPI.getFeed();
      setPosts(data.data.posts);
      setHasMore(data.data.hasMore);
      setNextCursor(data.data.nextCursor);
    } catch (error) {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;

    setLoadingMore(true);
    try {
      const { data } = await postAPI.getFeed(nextCursor);
      setPosts((prev) => [...prev, ...data.data.posts]);
      setHasMore(data.data.hasMore);
      setNextCursor(data.data.nextCursor);
    } catch (error) {
      toast.error("Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-4 px-4">
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No posts yet</p>
          <p className="text-gray-400 text-sm">
            Follow users to see their posts in your feed
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {hasMore && (
            <div ref={ref} className="flex justify-center py-8">
              {loadingMore && <LoadingSpinner />}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              You're all caught up!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;

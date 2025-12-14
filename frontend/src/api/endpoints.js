import api from "./axios";

export const authAPI = {
  signup: (formData) =>
    api.post("/auth/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  checkUsername: (username) => api.get(`/auth/check-username/${username}`),
};

export const userAPI = {
  getCurrentUser: () => api.get("/users/me"),
  getProfile: (username) => api.get(`/users/${username}`),
  getUserPosts: (username, cursor, limit = 12) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/users/${username}/posts?${params}`);
  },
  searchUsers: (query, cursor, limit = 20) => {
    const params = new URLSearchParams({ query, limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/users/search?${params}`);
  },
};

export const postAPI = {
  createPost: (formData) =>
    api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getFeed: (cursor, limit = 10) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/posts/feed?${params}`);
  },
  getPost: (postId) => api.get(`/posts/${postId}`),
  getPostComments: (postId, cursor, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/posts/${postId}/comments?${params}`);
  },
};

export const commentAPI = {
  createComment: (postId, text) => api.post(`/comments/${postId}`, { text }),
};

export const likeAPI = {
  likePost: (postId) => api.post(`/likes/${postId}`),
  unlikePost: (postId) => api.delete(`/likes/${postId}`),
  getPostLikes: (postId, cursor, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/likes/${postId}?${params}`);
  },
};

export const followAPI = {
  followUser: (userId) => api.post(`/follows/${userId}`),
  unfollowUser: (userId) => api.delete(`/follows/${userId}`),
  getFollowers: (userId, cursor, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/follows/${userId}/followers?${params}`);
  },
  getFollowing: (userId, cursor, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return api.get(`/follows/${userId}/following?${params}`);
  },
};

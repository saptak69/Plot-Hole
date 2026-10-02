/**
 * PlotHole API Service Layer
 * Centralized fetch helpers — replaces inline fetch() calls across components.
 */
import { API_URL, getAuthHeaders } from '../config';

/**
 * Base fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(url, config);
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Authenticated request wrapper
 */
function authRequest(endpoint, options = {}) {
  return request(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
}

// ─── TMDB / Movie Data ───────────────────────────────────────

export const movies = {
  getHomeBundle: () => request('/home/bundle'),
  getExploreBundle: () => request('/explore/bundle'),
  
  getDetails: (id, mediaType) => {
    const url = mediaType 
      ? `/media/${mediaType}/${id}/full` 
      : `/movies/${id}/full`;
    return request(url);
  },
  
  search: (query) => request(`/movies/search?query=${encodeURIComponent(query)}`),
  getTrending: () => request('/trending'),
  getPersonDetails: (id) => request(`/person/${id}`),
};

// ─── Reviews ─────────────────────────────────────────────────

export const reviews = {
  getForMovie: (movieId) => request(`/reviews/movie/${movieId}`),
  getRecent: () => request(`/reviews/recent`),
  
  like: (reviewId) => authRequest(`/reviews/${reviewId}/like`, { method: 'POST' }),
  
  getComments: (reviewId) => request(`/reviews/${reviewId}/comments`),
  addComment: (reviewId, text) => authRequest(`/reviews/${reviewId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment_text: text }),
  }),
  deleteComment: (commentId) => authRequest(`/reviews/comments/${commentId}`, {
    method: 'DELETE',
  }),
};

// ─── Watchlist ───────────────────────────────────────────────

export const watchlist = {
  check: (movieId) => authRequest(`/watchlist/check/${movieId}`),
  toggle: (data) => authRequest('/watchlist/toggle', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAll: () => authRequest('/watchlist'),
  getForUser: (username) => request(`/watchlist/user/${username}`),
};

// ─── Diary ───────────────────────────────────────────────────

export const diary = {
  checkWatched: (movieId) => authRequest(`/diary/check-watched/${movieId}`),
  toggleWatched: (data) => authRequest('/diary/toggle-watched', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  log: (data) => authRequest('/diary', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getForUser: (username) => request(`/diary/user/${username}`),
  getExcited: (movieId) => request(`/movies/${movieId}/excited`),
};

// ─── Lists ───────────────────────────────────────────────────

export const lists = {
  getAll: () => request('/lists'),
  getById: (id) => request(`/lists/${id}`),
  getForUser: (username) => request(`/lists/user/${username}`),
  create: (data) => authRequest('/lists', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteList: (id) => authRequest(`/lists/${id}`, { method: 'DELETE' }),
  addItem: (listId, data) => authRequest(`/lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  removeItem: (listId, movieId) => authRequest(`/lists/${listId}/items/${movieId}`, {
    method: 'DELETE',
  }),
  like: (listId) => authRequest(`/lists/${listId}/like`, { method: 'POST' }),
};

// ─── Social ──────────────────────────────────────────────────

export const social = {
  getProfile: (username, currentUserId) => {
    const params = currentUserId ? `?currentUserId=${currentUserId}` : '';
    return request(`/users/profile/${username}${params}`);
  },
  getStats: (username) => request(`/users/profile/${username}/stats`),
  getRatingsDist: (username) => request(`/users/profile/${username}/ratings-dist`),
  exportData: (username) => request(`/users/profile/${username}/export`),
  
  follow: (userId) => authRequest(`/social/follow/${userId}`, { method: 'POST' }),
  unfollow: (userId) => authRequest(`/social/unfollow/${userId}`, { method: 'POST' }),
  
  getFeed: () => authRequest('/social/feed'),
  getGlobalFeed: () => request('/social/global'),
  getSuggestions: () => authRequest('/users/suggestions'),
  getTicker: () => request('/social/ticker'),
};

// ─── Spaces (Community) ──────────────────────────────────────

export const spaces = {
  getPosts: (category) => {
    const params = category && category !== 'all' ? `?category=${category}` : '';
    return request(`/spaces/posts${params}`);
  },
  createPost: (data) => authRequest('/spaces/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deletePost: (id) => authRequest(`/spaces/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => authRequest(`/spaces/posts/${id}/like`, { method: 'POST' }),
  getComments: (postId) => request(`/spaces/posts/${postId}/comments`),
  addComment: (postId, text) => authRequest(`/spaces/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment_text: text }),
  }),
};

// ─── Notifications ───────────────────────────────────────────

export const notifications = {
  getAll: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
};

// ─── AI ──────────────────────────────────────────────────────

export const ai = {
  recommend: (data) => request('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

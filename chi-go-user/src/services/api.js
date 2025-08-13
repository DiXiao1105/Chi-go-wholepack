import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Set baseURL to Flask backend for all API calls

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// Attractions API
export const attractionsAPI = {
  getAll: () => api.get('/api/attractions'),
  getById: (id) => api.get(`/api/attractions/${id}`),
  create: (data) => api.post('/api/attractions', data),
  update: (id, data) => api.put(`/api/attractions/${id}`, data),
  delete: (id) => api.delete(`/api/attractions/${id}`),
};

// Restaurants API
export const restaurantsAPI = {
  getAll: () => api.get('/api/restaurants'),
  getById: (id) => api.get(`/api/restaurants/${id}`),
  create: (data) => api.post('/api/restaurants', data),
  update: (id, data) => api.put(`/api/restaurants/${id}`, data),
  delete: (id) => api.delete(`/api/restaurants/${id}`),
};

// Checklist API
export const checklistAPI = {
  get: (userId) => api.get(`/api/checklists/${userId}`),
  add: (userId, item) => api.post(`/api/checklists/${userId}/add`, item),
    // Remove an item from the user's checklist by sending itemId and itemType in the request body (data)
    remove: (userId, itemId, itemType) =>
      api.delete(`/api/checklists/${userId}/remove`, {
        data: { itemId, itemType },
        headers: { 'Content-Type': 'application/json' },
      }),
};

// Community API
export const communityAPI = {
  getPosts: () => api.get('/api/posts'),
  getPost: (id) => api.get(`/api/posts/${id}`),
  createPost: (data) => api.post('/api/posts', data),
  updatePost: (id, data) => api.put(`/api/posts/${id}`, data),
  deletePost: (id) => api.delete(`/api/posts/${id}`),
  // likePost and getMyPosts need backend support if required
};

// Admin API
export const adminAPI = {
  // Attractions management
  createAttraction: (data) => api.post('/admin/attractions', data),
  updateAttraction: (id, data) => api.put(`/admin/attractions/${id}`, data),
  deleteAttraction: (id) => api.delete(`/admin/attractions/${id}`),
  
  // Restaurants management
  createRestaurant: (data) => api.post('/admin/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`),
  
  // Posts management
  getAllPosts: () => api.get('/admin/posts'),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  
  // Users management
  getAllUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
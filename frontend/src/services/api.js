import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://miniature-space-palm-tree-8080.app.github.dev/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getAlertDetail: (alertId) => api.get(`/dashboard/alerts/${alertId}`),
  getDrugHistory: (drugName) => api.get(`/dashboard/drugs/${encodeURIComponent(drugName)}/history`),
  markAlertRead: (alertId) => api.patch(`/dashboard/alerts/${alertId}/read`),
};

export const watchlistAPI = {
  getWatchlist: () => api.get('/watchlist'),
  addDrug: (data) => api.post('/watchlist', data),
  removeDrug: (drugId) => api.delete(`/watchlist/${drugId}`),
};

export default api;
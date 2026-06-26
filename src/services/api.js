import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fixora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fixora_token');
      localStorage.removeItem('fixora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getTechnicians: () => api.get('/users/technicians'),
  addManager: (data) => api.post('/users/add-manager', data),
  addTechnician: (data) => api.post('/users/add-technician', data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
};

// Requests
export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getOne: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.put(`/requests/${id}`, data),
  cancel: (id) => api.patch(`/requests/${id}/cancel`),
};

// Tasks
export const tasksAPI = {
  assign: (data) => api.post('/tasks/assign', data),
  getAll: (params) => api.get('/tasks', { params }),
  updateStatus: (id, data) => api.put(`/tasks/${id}/status`, data),
};

// Location
export const locationAPI = {
  update: (data) => api.put('/location/update', data),
  get: (techId, params) => api.get(`/location/${techId}`, { params }),
};

// Ratings
export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  getAll: (params) => api.get('/ratings', { params }),
  getTop: () => api.get('/ratings/top-technicians'),
};

// Salaries
export const salariesAPI = {
  create: (data) => api.post('/salaries', data),
  getAll: () => api.get('/salaries'),
  getMyPayslip: () => api.get('/salaries/me'),
  update: (id, data) => api.put(`/salaries/${id}`, data),
};

// Chat
export const chatAPI = {
  send: (data) => api.post('/chat/send', data),
  getConversations: () => api.get('/chat/conversations'),
  getHistory: (userId) => api.get(`/chat/history/${userId}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/read/${id}`),
};

// Admin
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  aiChat: (data) => api.post('/admin/ai-chat', data),
  getActivityLogs: () => api.get('/admin/activity-logs'),
};

export default api;

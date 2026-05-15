/*
  API client wrapper
  - Centralizes axios instance configuration and request/response interceptors
  - Interceptor automatically attaches `Authorization: Bearer <token>` when a token is present in localStorage
  - On 401 responses we clear local token and redirect to `/login` to force re-authentication
*/
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to outgoing requests when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handler: on 401 clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Use location replace to avoid keeping a bad history entry
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

// Export organized API groups to keep call sites readable
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const usersAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const patientsAPI = {
  create: (data) => api.post('/patients', data),
  list: (params = {}) => api.get('/patients', { params }),
  get: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  list: (params = {}) => api.get('/appointments', { params }),
  get: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export default api;

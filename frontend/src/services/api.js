import axios from 'axios';

// Create central Axios instance
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

export const complaintAPI = {
  create: (formData) => {
    // Note: formData holds category, description, and optional photo file
    return API.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: (params) => API.get('/complaints', { params }),
  getById: (id) => API.get(`/complaints/${id}`),
  updatePriority: (id, priority) => API.patch(`/complaints/${id}/priority`, { priority }),
  updateStatus: (id, status, note) => API.patch(`/complaints/${id}/status`, { status, note }),
};

export const noticeAPI = {
  create: (data) => API.post('/notices', data),
  getAll: () => API.get('/notices'),
  delete: (id) => API.delete(`/notices/${id}`),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export default API;

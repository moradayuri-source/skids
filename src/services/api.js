import axios from 'axios';

const normalizeApiBaseUrl = (url) => {
  const baseUrl = (url || 'http://localhost:5000/api').replace(/\/+$/, '');

  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const normalizeMongoIds = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeMongoIds);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, normalizeMongoIds(item)])
  );

  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id;
  }

  return normalized;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Render Free services can take about a minute to wake after being idle.
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    response.data = normalizeMongoIds(response.data);
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints - will be implemented as needed
export const api = {
  // Auth
  auth: {
    google: (credential) => apiClient.post('/auth/google', { credential }),
    me: () => apiClient.get('/auth/me'),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    register: (data) => apiClient.post('/auth/register', data),
  },

  uploads: {
    signature: (data) => apiClient.post('/uploads/signature', data),
  },

  // Admin endpoints
  admin: {
    managers: {
      list: () => apiClient.get('/admin/managers'),
      add: (data) => apiClient.post('/admin/managers', data),
      remove: (id) => apiClient.delete(`/admin/managers/${id}`),
    },

    // Youth management
    getYouth: () => apiClient.get('/admin/youth'),
    addYouth: (data) => apiClient.post('/admin/youth', data),
    updateYouth: (id, data) => apiClient.put(`/admin/youth/${id}`, data),
    deleteYouth: (id) => apiClient.delete(`/admin/youth/${id}`),

    // Announcements
    getAnnouncements: () => apiClient.get('/admin/announcements'),
    addAnnouncement: (data) => apiClient.post('/admin/announcements', data),
    updateAnnouncement: (id, data) => apiClient.put(`/admin/announcements/${id}`, data),
    deleteAnnouncement: (id) => apiClient.delete(`/admin/announcements/${id}`),

    // Events
    getEvents: () => apiClient.get('/admin/events'),
    addEvent: (data) => apiClient.post('/admin/events', data),
    updateEvent: (id, data) => apiClient.put(`/admin/events/${id}`, data),
    deleteEvent: (id) => apiClient.delete(`/admin/events/${id}`),

    // Budget
    getBudget: () => apiClient.get('/admin/budget'),
    addBudget: (data) => apiClient.post('/admin/budget', data),
    updateBudget: (id, data) => apiClient.put(`/admin/budget/${id}`, data),
    deleteBudget: (id) => apiClient.delete(`/admin/budget/${id}`),

    // Documents
    getDocuments: () => apiClient.get('/admin/documents'),
    uploadDocument: (data) => apiClient.post('/admin/documents', data),
    deleteDocument: (id) => apiClient.delete(`/admin/documents/${id}`),

    // Messages
    getMessages: () => apiClient.get('/admin/messages'),
    replyMessage: (id, data) => apiClient.post(`/admin/messages/${id}/reply`, data),
    markMessageRead: (id) => apiClient.put(`/admin/messages/${id}/read`),
    deleteMessage: (id) => apiClient.delete(`/admin/messages/${id}`),

    // History
    getHistory: (params) => apiClient.get('/admin/history', { params }),

    // Profile
    getProfile: () => apiClient.get('/admin/profile'),
    updateProfile: (data) => apiClient.put('/admin/profile', data),
  },

  // User endpoints
  user: {
    getAnnouncements: () => apiClient.get('/announcements'),
    getEvents: () => apiClient.get('/events'),
    getBudget: () => apiClient.get('/budget'),
    getDocuments: () => apiClient.get('/documents'),
    sendMessage: (data) => apiClient.post('/messages', data),
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data) => apiClient.put('/user/profile', data),
  },
};

export default apiClient;

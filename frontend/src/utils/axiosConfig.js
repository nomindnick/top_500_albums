import axios from 'axios';

// Configure axios defaults
// In production, use relative URLs (same domain)
// In development, use localhost
const isDevelopment = import.meta.env.DEV;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:5000' : '');

// Request interceptor to add auth token
axios.interceptors.request.use(
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

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Network error
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export default axios;
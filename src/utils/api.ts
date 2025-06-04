import axios, { AxiosInstance } from 'axios';

// Environment Configuration
const ENV = {
  DEV: 'development',
  PROD: 'production'
};

// API Configuration
const API_CONFIG = {
  BASE_URL: {
    [ENV.DEV]: 'http://localhost:5126/api',
    [ENV.PROD]: 'https://api.ordrmate.com/api'
  },
  TIMEOUT: 10000, // 10 seconds
};

// Determine current environment
const isDevelopment = process.env.NODE_ENV === ENV.DEV;
const currentEnv = isDevelopment ? ENV.DEV : ENV.PROD;

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL[currentEnv],
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
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

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden access
          console.error('Access forbidden');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

// Log current environment in development
if (isDevelopment) {
  console.log('API running in development mode');
  console.log('Base URL:', API_CONFIG.BASE_URL[currentEnv]);
}

export default api; 
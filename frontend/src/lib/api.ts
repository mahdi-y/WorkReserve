import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*'
  },
  timeout: 15000 
});

api.interceptors.request.use(
  (config) => {
    if (window.location.hostname.includes('ngrok')) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out - this might be due to slow network on ngrok');
    }
    return Promise.reject(error);
  }
);

export default api;
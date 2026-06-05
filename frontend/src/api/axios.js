import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 60s — covers Render cold start
  headers: {
    'Content-Type': 'application/json',
  }
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response) {
      console.error(`API ${error.response.status}:`, error.response.data);

      // Auto-logout only on non-auth 401s
      if (error.response.status === 401 && !config.url?.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      // Timeout or no response — likely Render cold start
      // Retry once after 3 seconds
      if (!config._retried) {
        config._retried = true;
        console.warn('Server timeout — retrying once (possible cold start)...');
        await new Promise(res => setTimeout(res, 3000));
        return api(config);
      }
      console.error('Server unreachable after retry. Backend may be starting up.');
    }

    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: '',  // ← bo'sh, Vercel proxy orqali o'tadi
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post('/api/auth/refresh-token', { refreshToken });

        if (response.data?.token || response.data?.accessToken) {
          const newToken = response.data.token ?? response.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
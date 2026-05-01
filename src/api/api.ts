import axios from 'axios';

const api = axios.create({
  baseURL: '',   // Vercel proxy orqali o'tadi
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📡 Request:', config.method?.toUpperCase(), (config.baseURL ?? '') + (config.url ?? ''));
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('❌ Response error:', error.response?.status, error.config?.url);

    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';

    // ← Login va Register da interceptor ishlamasin — xato to'g'ri catch ga ketsin
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !url.includes('/auth/refresh-token') &&
      !isAuthEndpoint   // ← asosiy tuzatish
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
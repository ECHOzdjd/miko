import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://miko-backend-cl3w.onrender.com/api';
const MEDIA_BASE_URL = process.env.REACT_APP_MEDIA_URL || 'https://miko-backend-cl3w.onrender.com';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除认证状态
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 媒体文件 URL 辅助函数
export const getMediaUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE_URL}${path}`;
};

export default apiClient;

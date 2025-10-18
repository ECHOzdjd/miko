import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/user';

export const authApi = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/users/register/', data);
    return response.data;
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/users/login/', data);
    return response.data;
  },

  // 用户登出
  logout: async (): Promise<void> => {
    await apiClient.post('/users/logout/');
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/users/me/');
    return response.data;
  },

  // 更新用户信息
  updateUser: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch('/users/me/', data);
    return response.data;
  },

  // 上传头像
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.patch('/users/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 获取用户详情
  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}/`);
    return response.data;
  },

  // 获取用户发布的帖子
  getUserPosts: async (userId: number, page = 1): Promise<{ results: any[]; count: number; next: string | null }> => {
    const response = await apiClient.get(`/users/${userId}/posts/?page=${page}`);
    return response.data;
  },

  // 获取用户点赞的帖子
  getUserLikedPosts: async (userId: number, page = 1): Promise<{ results: any[]; count: number; next: string | null }> => {
    const response = await apiClient.get(`/users/${userId}/liked-posts/?page=${page}`);
    return response.data;
  },

  // 获取用户收藏的帖子
  getUserBookmarkedPosts: async (page = 1): Promise<{ results: any[]; count: number; next: string | null }> => {
    const response = await apiClient.get(`/users/bookmarked-posts/?page=${page}`);
    return response.data;
  },

  // 关注用户
  followUser: async (userId: number): Promise<void> => {
    await apiClient.post('/users/follows/follow/', { user_id: userId });
  },

  // 取消关注用户
  unfollowUser: async (userId: number): Promise<void> => {
    await apiClient.post('/users/follows/unfollow/', { user_id: userId });
  },

  // 获取用户粉丝列表
  getUserFollowers: async (userId: number, page = 1): Promise<{ results: User[]; count: number }> => {
    const response = await apiClient.get(`/users/${userId}/followers/?page=${page}`);
    return response.data;
  },

  // 获取用户关注列表
  getUserFollowing: async (userId: number, page = 1): Promise<{ results: User[]; count: number }> => {
    const response = await apiClient.get(`/users/${userId}/following/?page=${page}`);
    return response.data;
  },
};

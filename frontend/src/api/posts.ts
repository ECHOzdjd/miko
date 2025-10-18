import apiClient from './client';
import { Post, CreatePostRequest, PostFilters } from '../types/post';

export const postsApi = {
  // 获取帖子列表
  getPosts: async (filters: PostFilters = {}): Promise<{ results: Post[]; count: number; next: string | null }> => {
    const params = new URLSearchParams();
    
    if (filters.post_type) params.append('post_type', filters.post_type);
    if (filters.author_id) params.append('author_id', filters.author_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    
    const response = await apiClient.get(`/posts/posts/?${params.toString()}`);
    return response.data;
  },

  // 获取帖子详情
  getPost: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/posts/posts/${postId}/`);
    return response.data;
  },

  // 创建帖子
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('post_type', data.post_type);
    
    data.images.forEach((image, index) => {
      formData.append(`images`, image);
    });
    
    const response = await apiClient.post('/posts/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 更新帖子
  updatePost: async (postId: number, data: Partial<CreatePostRequest>): Promise<Post> => {
    const response = await apiClient.patch(`/posts/posts/${postId}/`, data);
    return response.data;
  },

  // 删除帖子
  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/posts/posts/${postId}/`);
  },

  // 点赞/取消点赞帖子
  toggleLike: async (postId: number): Promise<{ status: string; likes_count: number }> => {
    const response = await apiClient.post(`/posts/posts/${postId}/like/`);
    return response.data;
  },

  // 收藏/取消收藏帖子
  toggleBookmark: async (postId: number): Promise<{ status: string; bookmarks_count: number }> => {
    const response = await apiClient.post(`/posts/posts/${postId}/bookmark/`);
    return response.data;
  },

  // 分享帖子
  sharePost: async (postId: number, platform: string): Promise<void> => {
    await apiClient.post(`/posts/posts/${postId}/share/`, { platform });
  },


  // 获取热门帖子
  getTrendingPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get('/posts/posts/trending/');
    return response.data;
  },

  // 获取推荐帖子
  getRecommendedPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get('/posts/posts/recommended/');
    return response.data;
  },
};

import apiClient from './client';
import { Comment, CreateCommentRequest } from '../types/comment';

export const commentsApi = {
  // 获取帖子的评论列表
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get(`/posts/posts/${postId}/comments/`);
    return response.data.results || response.data; // 处理分页响应
  },

  // 创建评论
  createComment: async (postId: number, data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post(`/posts/posts/${postId}/comments/`, data);
    return response.data;
  },

  // 获取评论详情
  getComment: async (commentId: number): Promise<Comment> => {
    const response = await apiClient.get(`/posts/comments/${commentId}/`);
    return response.data;
  },

  // 更新评论
  updateComment: async (commentId: number, data: Partial<CreateCommentRequest>): Promise<Comment> => {
    const response = await apiClient.patch(`/posts/comments/${commentId}/`, data);
    return response.data;
  },

  // 删除评论
  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/posts/comments/${commentId}/`);
  },

};

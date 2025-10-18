import apiClient from './client';

export interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    nickname: string;
    avatar_url: string;
  }>;
  last_message?: {
    id: number;
    sender: {
      id: number;
      nickname: string;
      avatar_url: string;
    };
    content: string;
    is_read: boolean;
    created_at: string;
  };
  other_participant?: {
    id: number;
    nickname: string;
    avatar_url: string;
  };
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender: {
    id: number;
    nickname: string;
    avatar_url: string;
  };
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface StartConversationRequest {
  user_id: number;
}

export const messagesApi = {
  // 获取对话列表
  getConversations: async (): Promise<{ results: Conversation[]; count: number }> => {
    const response = await apiClient.get('/messages/conversations/');
    return response.data;
  },

  // 获取对话详情
  getConversation: async (conversationId: number): Promise<Conversation> => {
    const response = await apiClient.get(`/messages/conversations/${conversationId}/`);
    return response.data;
  },

  // 获取对话中的消息
  getMessages: async (conversationId: number): Promise<{ results: Message[]; count: number }> => {
    const response = await apiClient.get(`/messages/conversations/${conversationId}/messages/`);
    return response.data;
  },

  // 发送消息
  sendMessage: async (conversationId: number, content: string): Promise<Message> => {
    const response = await apiClient.post(`/messages/conversations/${conversationId}/messages/`, {
      content,
    });
    return response.data;
  },

  // 开始对话
  startConversation: async (data: StartConversationRequest): Promise<Conversation> => {
    const response = await apiClient.post('/messages/start-conversation/', data);
    return response.data;
  },

  // 标记消息为已读
  markMessagesRead: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/messages/conversations/${conversationId}/mark-read/`);
  },
};

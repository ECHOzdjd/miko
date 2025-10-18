import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { messagesApi, Message } from '../api/messages';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取对话详情
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => messagesApi.getConversation(Number(conversationId)),
    enabled: !!conversationId,
  });

  // 获取消息列表
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.getMessages(Number(conversationId)),
    enabled: !!conversationId,
    refetchInterval: 3000, // 每3秒刷新一次
  });

  // 发送消息
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => messagesApi.sendMessage(Number(conversationId), content),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries(['messages', conversationId]);
      queryClient.invalidateQueries(['conversations']);
    },
    onError: (error: any) => {
      console.error('发送消息失败:', error);
      toast.error('发送消息失败，请稍后重试');
    },
  });

  // 标记消息为已读
  const markReadMutation = useMutation({
    mutationFn: () => messagesApi.markMessagesRead(Number(conversationId)),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    },
  });

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData?.results]);

  // 当进入对话时标记为已读
  useEffect(() => {
    if (conversationId && conversation && conversation.unread_count > 0) {
      markReadMutation.mutate();
    }
  }, [conversationId, conversation, markReadMutation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (conversationLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">对话不存在</div>
      </div>
    );
  }

  const otherUser = conversation.other_participant;
  const messages = messagesData?.results || [];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={otherUser?.avatar_url || '/default-avatar.svg'}
            alt={otherUser?.nickname}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold text-gray-900">{otherUser?.nickname}</h2>
            <p className="text-sm text-gray-500">在线</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message: Message) => {
          const isOwn = message.sender.id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sendMessageMutation.isLoading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isLoading}
            className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

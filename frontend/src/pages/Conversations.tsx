import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MessageSquare, Clock } from 'lucide-react';
import { messagesApi, Conversation } from '../api/messages';
import { useAuthStore } from '../stores/authStore';

const Conversations: React.FC = () => {
  const { user } = useAuthStore();

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.getConversations,
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const conversations = conversationsData?.results || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">私信</h1>
          <p className="text-gray-600 mt-1">与朋友和关注的人聊天</p>
        </div>

        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有对话</h3>
            <p className="text-gray-500">开始与朋友聊天吧！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation: Conversation) => (
              <Link
                key={conversation.id}
                to={`/chat/${conversation.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={conversation.other_participant?.avatar_url || '/default-avatar.svg'}
                      alt={conversation.other_participant?.nickname}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {conversation.other_participant?.nickname}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(conversation.updated_at)}</span>
                      </div>
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-gray-600 truncate mt-1">
                        {conversation.last_message.sender.id === user?.id ? '你: ' : ''}
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;

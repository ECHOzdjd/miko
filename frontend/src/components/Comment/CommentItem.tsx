import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Reply, MoreHorizontal, Trash2 } from 'lucide-react';
import { Comment } from '../../types/comment';
import { useAuthStore } from '../../stores/authStore';

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  depth?: number; // 添加深度参数
  maxDepth?: number; // 最大深度限制
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onDelete, 
  depth = 0, 
  maxDepth = 5 
}) => {
  const { user } = useAuthStore();
  const [showReplies, setShowReplies] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };


  const handleDelete = () => {
    if (window.confirm('确定要删除这条评论吗？')) {
      onDelete(comment.id);
    }
  };

  const isOwnComment = user && user.id === comment.author.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex space-x-3 py-4">
        <Link to={`/profile/${comment.author.id}`}>
          <img
            src={comment.author.avatar_url || '/default-avatar.svg'}
            alt={comment.author.nickname}
            className="w-8 h-8 rounded-full flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/profile/${comment.author.id}`}
                  className="font-medium text-gray-900 text-sm hover:text-primary-600 transition-colors"
                >
                  {comment.author.nickname}
                </Link>
                <span className="text-gray-500 text-xs">
                  {formatTime(comment.created_at)}
                </span>
                {depth > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    L{depth}
                  </span>
                )}
              </div>
            {isOwnComment && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
                {showMoreOptions && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center text-sm"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-gray-900 text-sm mt-1 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>回复</span>
              </button>
            )}
            {depth >= maxDepth && (
              <span className="text-xs text-gray-400">
                回复层级过深，无法继续回复
              </span>
            )}
          </div>
          
          {/* 回复列表 */}
          {hasReplies && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-gray-500 hover:text-gray-700 mb-2"
              >
                {showReplies ? '隐藏' : '查看'} {comment.replies.length} 条回复
              </button>
              
              {showReplies && (
                <div 
                  className={`space-y-3 pl-6 border-l-2 py-2 rounded-r-md ${
                    depth === 0 
                      ? 'border-gray-200 bg-gray-50' 
                      : depth === 1 
                      ? 'border-blue-200 bg-blue-50' 
                      : depth === 2 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-purple-200 bg-purple-50'
                  }`}
                >
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onDelete={onDelete}
                      depth={depth + 1}
                      maxDepth={maxDepth}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;

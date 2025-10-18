import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Send } from 'lucide-react';
import { commentsApi } from '../../api/comments';
import { Comment, CreateCommentRequest } from '../../types/comment';
import CommentItem from './CommentItem';
import toast from 'react-hot-toast';

interface CommentListProps {
  postId: number;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const { data: comments = [], isLoading, error } = useQuery<Comment[]>(
    ['comments', postId],
    () => commentsApi.getComments(postId),
    {
      enabled: !!postId,
    }
  );

  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['post', postId]); // 更新帖子详情页的评论数
      setNewComment('');
      setReplyingTo(null);
      toast.success('评论发布成功');
    },
    onError: (error: any) => {
      console.error('评论发布失败:', error);
      toast.error(error.response?.data?.detail || '评论发布失败，请稍后重试');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['post', postId]); // 更新帖子详情页的评论数
      toast.success('评论删除成功');
    },
    onError: (error: any) => {
      console.error('评论删除失败:', error);
      toast.error(error.response?.data?.detail || '评论删除失败，请稍后重试');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const data: CreateCommentRequest = {
      content: newComment.trim(),
      parent: replyingTo?.id || null,
    };

    createCommentMutation.mutate(data);
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleDelete = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">加载评论失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 评论输入框 */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? `回复 ${replyingTo.author.nickname}...` : '写下你的评论...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            disabled={createCommentMutation.isLoading}
          />
          {replyingTo && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                回复 {replyingTo.author.nickname}
              </span>
              <button
                type="button"
                onClick={cancelReply}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!newComment.trim() || createCommentMutation.isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{createCommentMutation.isLoading ? '发布中...' : '发布'}</span>
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex space-x-3 py-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
              depth={0}
              maxDepth={5}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无评论，来抢沙发吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;

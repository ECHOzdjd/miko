import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Clock } from 'lucide-react';
import { Post } from '../../types/post';
import { postsApi } from '../../api/posts';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../api/client';

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onBookmark }) => {
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  // 本地状态用于即时UI更新
  const [localPost, setLocalPost] = useState(post);
  
  // 当post prop变化时更新本地状态
  React.useEffect(() => {
    setLocalPost(post);
  }, [post]);
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      
      // 立即更新本地状态（乐观更新）
      setLocalPost(prev => ({
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
      
      const result = await postsApi.toggleLike(post.id);
      
      // 更新React Query缓存
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((p: Post) => 
            p.id === post.id 
              ? { 
                  ...p, 
                  is_liked: result.status === 'liked',
                  likes_count: result.likes_count 
                }
              : p
          )
        };
      });
      
      // 同步本地状态与服务器响应
      setLocalPost(prev => ({
        ...prev,
        is_liked: result.status === 'liked',
        likes_count: result.likes_count
      }));
      
      // 如果有父组件回调，也调用它
      onLike?.(post.id);
      
      toast.success(result.status === 'liked' ? '点赞成功' : '取消点赞');
    } catch (error) {
      console.error('点赞失败:', error);
      toast.error('操作失败，请稍后重试');
      
      // 发生错误时回滚本地状态
      setLocalPost(prev => ({
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count + 1 : prev.likes_count - 1
      }));
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    
    try {
      setIsBookmarking(true);
      
      // 立即更新本地状态（乐观更新）
      setLocalPost(prev => ({
        ...prev,
        is_bookmarked: !prev.is_bookmarked,
        bookmarks_count: prev.is_bookmarked ? prev.bookmarks_count - 1 : prev.bookmarks_count + 1
      }));
      
      const result = await postsApi.toggleBookmark(post.id);
      
      // 更新React Query缓存
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((p: Post) => 
            p.id === post.id 
              ? { 
                  ...p, 
                  is_bookmarked: result.status === 'bookmarked',
                  bookmarks_count: result.bookmarks_count 
                }
              : p
          )
        };
      });
      
      // 同步本地状态与服务器响应
      setLocalPost(prev => ({
        ...prev,
        is_bookmarked: result.status === 'bookmarked',
        bookmarks_count: result.bookmarks_count
      }));
      
      // 如果有父组件回调，也调用它
      onBookmark?.(post.id);
      
      toast.success(result.status === 'bookmarked' ? '收藏成功' : '取消收藏');
    } catch (error) {
      console.error('收藏失败:', error);
      toast.error('操作失败，请稍后重试');
      
      // 发生错误时回滚本地状态
      setLocalPost(prev => ({
        ...prev,
        is_bookmarked: !prev.is_bookmarked,
        bookmarks_count: prev.is_bookmarked ? prev.bookmarks_count + 1 : prev.bookmarks_count - 1
      }));
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 帖子头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${localPost.author.id}`}>
            <img
              src={getMediaUrl(localPost.author.avatar_url)}
              alt={localPost.author.nickname}
              className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Link 
                to={`/profile/${localPost.author.id}`}
                className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
              >
                {localPost.author.nickname}
              </Link>
              {localPost.author.is_verified && (
                <span className="text-blue-500 text-xs">✓</span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(localPost.created_at)}
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* 帖子内容 */}
      <div className="p-4">
        <Link to={`/post/${localPost.id}`} className="block">
          <h2 className="text-lg font-medium text-gray-900 mb-2 hover:text-primary-600">
            {localPost.title}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
            {localPost.content}
          </p>
        </Link>

        {/* 图片显示 */}
        {localPost.images && localPost.images.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {localPost.images.slice(0, 6).map((imageUrl, index) => (
                <img
                  key={index}
                  src={getMediaUrl(imageUrl)}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
            {localPost.images.length > 6 && (
              <p className="text-sm text-gray-500 mt-2">
                还有 {localPost.images.length - 6} 张图片...
              </p>
            )}
          </div>
        )}

      </div>

      {/* 互动按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 transition-colors ${
              localPost.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-5 h-5 ${localPost.is_liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{localPost.likes_count || 0}</span>
          </button>
          <Link
            to={`/post/${localPost.id}`}
            className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{localPost.comments_count || 0}</span>
          </Link>
        </div>
        <button
          onClick={handleBookmark}
          disabled={isBookmarking}
          className={`p-2 rounded-full transition-colors ${
            localPost.is_bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Bookmark className={`w-5 h-5 ${localPost.is_bookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;

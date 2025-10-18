import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { postsApi } from '../api/posts';
import { Post } from '../types/post';
import { useAuthStore } from '../stores/authStore';
import CommentList from '../components/Comment/CommentList';
import toast from 'react-hot-toast';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const { data: post, isLoading, error } = useQuery<Post>(
    ['post', postId],
    () => postsApi.getPost(Number(postId!)),
    {
      enabled: !!postId,
    }
  );

  // 本地状态用于即时UI更新
  const [localPost, setLocalPost] = useState<Post | null>(null);
  
  // 当post数据变化时更新本地状态
  React.useEffect(() => {
    if (post) {
      setLocalPost(post);
    }
  }, [post]);

  // 删除帖子
  const deletePostMutation = useMutation({
    mutationFn: () => postsApi.deletePost(Number(postId!)),
    onSuccess: () => {
      queryClient.invalidateQueries(['userPosts']);
      queryClient.invalidateQueries(['posts']);
      toast.success('帖子删除成功');
      navigate('/');
    },
    onError: () => {
      toast.error('删除失败，请稍后重试');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post || !localPost) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">帖子不存在</h1>
          <p className="text-gray-600 mt-2">该帖子可能已被删除或不存在。</p>
          <Link
            to="/"
            className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && localPost?.images) {
      setSelectedImageIndex((selectedImageIndex + 1) % localPost.images.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && localPost?.images) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? localPost.images.length - 1 : selectedImageIndex - 1
      );
    }
  };

  const handleDeletePost = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = () => {
    deletePostMutation.mutate();
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirm(false);
  };

  const handleLike = async () => {
    if (!localPost || isLiking) return;
    
    try {
      setIsLiking(true);
      
      // 立即更新本地状态（乐观更新）
      setLocalPost(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
      } : null);
      
      const result = await postsApi.toggleLike(localPost.id);
      
      // 更新React Query缓存
      queryClient.setQueryData(['post', postId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          is_liked: result.status === 'liked',
          likes_count: result.likes_count
        };
      });
      
      // 同步本地状态与服务器响应
      setLocalPost(prev => prev ? {
        ...prev,
        is_liked: result.status === 'liked',
        likes_count: result.likes_count
      } : null);
      
      toast.success(result.status === 'liked' ? '点赞成功' : '取消点赞');
    } catch (error) {
      console.error('点赞失败:', error);
      toast.error('操作失败，请稍后重试');
      
      // 发生错误时回滚本地状态
      setLocalPost(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count + 1 : prev.likes_count - 1
      } : null);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!localPost || isBookmarking) return;
    
    try {
      setIsBookmarking(true);
      
      // 立即更新本地状态（乐观更新）
      setLocalPost(prev => prev ? {
        ...prev,
        is_bookmarked: !prev.is_bookmarked,
        bookmarks_count: prev.is_bookmarked ? prev.bookmarks_count - 1 : prev.bookmarks_count + 1
      } : null);
      
      const result = await postsApi.toggleBookmark(localPost.id);
      
      // 更新React Query缓存
      queryClient.setQueryData(['post', postId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          is_bookmarked: result.status === 'bookmarked',
          bookmarks_count: result.bookmarks_count
        };
      });
      
      // 同步本地状态与服务器响应
      setLocalPost(prev => prev ? {
        ...prev,
        is_bookmarked: result.status === 'bookmarked',
        bookmarks_count: result.bookmarks_count
      } : null);
      
      toast.success(result.status === 'bookmarked' ? '收藏成功' : '取消收藏');
    } catch (error) {
      console.error('收藏失败:', error);
      toast.error('操作失败，请稍后重试');
      
      // 发生错误时回滚本地状态
      setLocalPost(prev => prev ? {
        ...prev,
        is_bookmarked: !prev.is_bookmarked,
        bookmarks_count: prev.is_bookmarked ? prev.bookmarks_count + 1 : prev.bookmarks_count - 1
      } : null);
    } finally {
      setIsBookmarking(false);
    }
  };

  const isOwnPost = user && localPost && user.id === localPost.author.id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回首页
        </Link>
      </div>

      {/* 帖子内容 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 作者信息 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${localPost.author.id}`}>
                <img
                  src={localPost.author.avatar_url || '/default-avatar.svg'}
                  alt={localPost.author.nickname}
                  className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <div>
                <Link 
                  to={`/profile/${localPost.author.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {localPost.author.nickname}
                </Link>
                <p className="text-sm text-gray-500">
                  {new Date(localPost.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
            {isOwnPost && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showMoreOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleDeletePost}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除帖子
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 帖子标题和内容 */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{localPost.title}</h1>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {localPost.content}
            </p>
          </div>
        </div>

        {/* 图片展示 */}
        {localPost.images && localPost.images.length > 0 && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localPost.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={imageUrl}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 互动按钮 */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 transition-colors ${
                  localPost.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-5 h-5 ${localPost.is_liked ? 'fill-current' : ''}`} />
                <span>{localPost.likes_count || 0}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{localPost.comments_count || 0}</span>
              </button>
            </div>
            <button 
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={`flex items-center space-x-2 transition-colors ${
                localPost.is_bookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
              } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark className={`w-5 h-5 ${localPost.is_bookmarked ? 'fill-current' : ''}`} />
              <span>{localPost.bookmarks_count || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 图片查看模态框 */}
      {selectedImageIndex !== null && localPost?.images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={localPost.images[selectedImageIndex]}
              alt={`图片 ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {localPost.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {selectedImageIndex + 1} / {localPost.images.length}
            </div>
          </div>
        </div>
      )}

      {/* 评论区域 */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">
            评论 ({localPost.comments_count || 0})
          </h3>
        </div>
        <div className="p-6">
          <CommentList postId={localPost.id} />
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                删除帖子
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                确定要删除帖子 <strong>"{post?.title}"</strong> 吗？此操作无法撤销。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeletePost}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmDeletePost}
                  disabled={deletePostMutation.isLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletePostMutation.isLoading ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;

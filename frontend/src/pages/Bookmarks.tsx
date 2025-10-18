import React from 'react';
import { useQuery } from 'react-query';
import { authApi } from '../api/auth';
import PostCard from '../components/Post/PostCard';
import PostSkeleton from '../components/Post/PostSkeleton';

const Bookmarks: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookmarkedPosts'],
    queryFn: () => authApi.getUserBookmarkedPosts(),
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">加载失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
        <p className="text-gray-600 mt-2">查看您收藏的所有帖子</p>
      </div>

      {/* 收藏的帖子列表 */}
      <div className="space-y-6">
        {isLoading ? (
          // 骨架屏
          Array.from({ length: 5 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))
        ) : data?.results?.length ? (
          data.results.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
            <p className="text-gray-500">您还没有收藏任何帖子</p>
          </div>
        )}
      </div>

      {/* 加载更多 */}
      {data?.next && (
        <div className="text-center mt-8">
          <button className="btn-outline">
            加载更多
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;

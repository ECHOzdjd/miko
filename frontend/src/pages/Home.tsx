import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { postsApi } from '../api/posts';
import PostCard from '../components/Post/PostCard';
import PostSkeleton from '../components/Post/PostSkeleton';
import { PostFilters } from '../types/post';

const Home: React.FC = () => {
  const [filters, setFilters] = useState<PostFilters>({
    ordering: '-created_at',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postsApi.getPosts(filters),
  });

  const handleFilterChange = (newFilters: Partial<PostFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">加载失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange({ ordering: '-created_at' })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.ordering === '-created_at'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            最新
          </button>
          <button
            onClick={() => handleFilterChange({ ordering: '-likes_count' })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.ordering === '-likes_count'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            热门
          </button>
          <button
            onClick={() => handleFilterChange({ ordering: '-views_count' })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.ordering === '-views_count'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            浏览最多
          </button>
        </div>
      </div>

      {/* 帖子列表 */}
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
            <p className="text-gray-500">暂无帖子</p>
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

export default Home;

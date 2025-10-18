import React from 'react';

const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-3">
        <div className="skeleton w-10 h-10 rounded-full"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-3 w-16"></div>
          </div>
          
          <div className="skeleton h-6 w-3/4 mt-2"></div>
          
          <div className="space-y-2 mt-3">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
            <div className="skeleton h-4 w-4/6"></div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <div className="skeleton h-6 w-12 rounded-full"></div>
            <div className="skeleton h-6 w-16 rounded-full"></div>
            <div className="skeleton h-6 w-14 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="skeleton h-4 w-8"></div>
              <div className="skeleton h-4 w-8"></div>
              <div className="skeleton h-4 w-8"></div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="skeleton h-4 w-4"></div>
              <div className="skeleton h-4 w-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;

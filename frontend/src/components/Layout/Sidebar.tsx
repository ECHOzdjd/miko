import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Heart, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const navigation = [
    { name: '首页', href: '/', icon: Home },
  ];

  const authNavigation = [
    { name: '私信', href: '/conversations', icon: MessageSquare },
    { name: '收藏', href: '/bookmarks', icon: Heart },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {/* 主要导航 */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* 分隔线 */}
        {isAuthenticated && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            
            {/* 需要登录的导航 */}
            <div className="space-y-1">
              {authNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </>
        )}

      </nav>
    </aside>
  );
};

export default Sidebar;

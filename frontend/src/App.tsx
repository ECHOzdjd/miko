import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Bookmarks from './pages/Bookmarks';
import Conversations from './pages/Conversations';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="App">
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 需要布局的路由 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="post/:postId" element={<PostDetail />} />
          
          {/* 需要登录的路由 */}
          {isAuthenticated && (
            <>
              <Route path="create-post" element={<CreatePost />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="conversations" element={<Conversations />} />
            </>
          )}
        </Route>
        
        {/* 私信页面（不需要布局） */}
        {isAuthenticated && (
          <Route path="chat/:conversationId" element={<Chat />} />
        )}
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

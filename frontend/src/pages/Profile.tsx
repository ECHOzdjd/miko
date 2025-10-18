import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Camera, Edit3, Save, X, Heart, MessageSquare, Users, FileText, 
  Calendar, MapPin, Globe, Mail, Phone, Eye, EyeOff,
  UserPlus, UserMinus, Trash2
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authApi } from '../api/auth';
import { postsApi } from '../api/posts';
import { messagesApi } from '../api/messages';
import toast from 'react-hot-toast';

interface ProfileForm {
  nickname: string;
  signature: string;
  bio: string;
  birthday: string;
  gender: 'male' | 'female' | 'other' | '';
  location: string;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'following' | 'followers'>('posts');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; postId: number | null; postTitle: string }>({
    show: false,
    postId: null,
    postTitle: ''
  });

  const targetUserId = userId ? parseInt(userId) : user?.id;
  const isOwnProfile = !userId || parseInt(userId) === user?.id;

  // 获取用户信息
  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', targetUserId],
    queryFn: () => targetUserId ? authApi.getUser(targetUserId) : Promise.resolve(user),
    enabled: !!targetUserId,
  });

  // 获取用户帖子
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', targetUserId],
    queryFn: () => targetUserId ? authApi.getUserPosts(targetUserId) : { results: [], count: 0, next: null },
    enabled: !!targetUserId && activeTab === 'posts',
  });

  // 获取用户点赞的帖子
  const { data: likedPosts, isLoading: likesLoading } = useQuery({
    queryKey: ['userLikedPosts', targetUserId],
    queryFn: () => targetUserId ? authApi.getUserLikedPosts(targetUserId) : { results: [], count: 0, next: null },
    enabled: !!targetUserId && activeTab === 'likes',
  });

  // 获取关注列表
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['userFollowing', targetUserId],
    queryFn: () => targetUserId ? authApi.getUserFollowing(targetUserId) : { results: [], count: 0 },
    enabled: !!targetUserId && activeTab === 'following',
    staleTime: 0, // 禁用缓存
    cacheTime: 0, // 禁用缓存
  });


  // 获取粉丝列表
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['userFollowers', targetUserId],
    queryFn: () => targetUserId ? authApi.getUserFollowers(targetUserId) : { results: [], count: 0 },
    enabled: !!targetUserId && activeTab === 'followers',
    staleTime: 0, // 禁用缓存
    cacheTime: 0, // 禁用缓存
  });

  // 更新用户信息
  const updateUserMutation = useMutation({
    mutationFn: authApi.updateUser,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries(['user', targetUserId]);
      toast.success('资料更新成功！');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('更新失败，请稍后重试');
    },
  });

  // 上传头像
  const uploadAvatarMutation = useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: (updatedUser) => {
      console.log('头像上传成功，返回的用户信息:', updatedUser);
      console.log('新的头像URL:', updatedUser.avatar_url);
      updateUser(updatedUser);
      queryClient.invalidateQueries(['user', targetUserId]);
      // 立即清除预览，因为后端已经返回了新的头像URL
      setAvatarPreview(null);
      toast.success('头像更新成功！');
    },
    onError: (error) => {
      console.error('头像上传失败:', error);
      toast.error('头像上传失败，请稍后重试');
      setAvatarPreview(null);
    },
  });

  // 关注/取消关注
  const followMutation = useMutation({
    mutationFn: (userId: number) => 
      profileUser?.is_following ? authApi.unfollowUser(userId) : authApi.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', targetUserId]);
      queryClient.invalidateQueries(['userFollowers', targetUserId]);
      toast.success(profileUser?.is_following ? '已取消关注' : '关注成功');
    },
    onError: () => {
      toast.error('操作失败，请稍后重试');
    },
  });

  // 删除帖子
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => postsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userPosts', targetUserId]);
      queryClient.invalidateQueries(['user', targetUserId]);
      setDeleteConfirm({ show: false, postId: null, postTitle: '' });
      toast.success('帖子删除成功');
    },
    onError: () => {
      toast.error('删除失败，请稍后重试');
    },
  });

  // 开始对话
  const startConversationMutation = useMutation({
    mutationFn: (userId: number) => messagesApi.startConversation({ user_id: userId }),
    onSuccess: (conversation) => {
      // 跳转到聊天页面
      window.location.href = `/chat/${conversation.id}`;
    },
    onError: (err: any) => {
      console.error('开始对话失败:', err);
      toast.error(err.response?.data?.detail || '开始对话失败，请稍后重试');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      nickname: profileUser?.nickname || '',
      signature: profileUser?.signature || '',
      bio: profileUser?.bio || '',
      birthday: profileUser?.birthday || '',
      gender: profileUser?.gender || '',
      location: profileUser?.location || '',
    },
  });

  // 当用户数据加载完成时重置表单
  useEffect(() => {
    if (profileUser) {
      reset({
        nickname: profileUser.nickname || '',
        signature: profileUser.signature || '',
        bio: profileUser.bio || '',
        birthday: profileUser.birthday || '',
        gender: profileUser.gender || '',
        location: profileUser.location || '',
      });
    }
  }, [profileUser, reset]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('头像文件不能超过5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 立即上传头像
      uploadAvatarMutation.mutate(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    updateUserMutation.mutate(data);
  };

  const handleFollow = () => {
    if (targetUserId) {
      followMutation.mutate(targetUserId);
    }
  };

  const handleDeletePost = (postId: number, postTitle: string) => {
    setDeleteConfirm({ show: true, postId, postTitle });
  };

  const confirmDeletePost = () => {
    if (deleteConfirm.postId) {
      deletePostMutation.mutate(deleteConfirm.postId);
    }
  };

  const cancelDeletePost = () => {
    setDeleteConfirm({ show: false, postId: null, postTitle: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      default: return '未设置';
    }
  };

  const getAge = (birthday: string) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        if (postsLoading) {
          return <div className="text-center py-8 text-gray-500">加载中...</div>;
        }
        
        if (!userPosts?.results?.length) {
          return <div className="text-center py-8 text-gray-500">暂无帖子</div>;
        }

        return (
          <div className="space-y-4">
            {userPosts.results.map((post: any) => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <Link to={`/post/${post.id}`} className="block">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 mb-2 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  
                  {/* 图片预览 */}
                  {post.images && post.images.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        {post.images.slice(0, 3).map((imageUrl: string, index: number) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                      {post.images.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          还有 {post.images.length - 3} 张图片...
                        </p>
                      )}
                    </div>
                  )}
                </Link>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes_count || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    {isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePost(post.id, post.title);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="删除帖子"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'likes':
        if (likesLoading) {
          return <div className="text-center py-8 text-gray-500">加载中...</div>;
        }
        
        if (!likedPosts?.results?.length) {
          return <div className="text-center py-8 text-gray-500">暂无点赞的帖子</div>;
        }

        return (
          <div className="space-y-4">
            {likedPosts.results.map((post: any) => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <Link to={`/post/${post.id}`} className="block">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 mb-2 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  
                  {/* 图片预览 */}
                  {post.images && post.images.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        {post.images.slice(0, 3).map((imageUrl: string, index: number) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                      {post.images.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          还有 {post.images.length - 3} 张图片...
                        </p>
                      )}
                    </div>
                  )}
                </Link>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-red-500">
                      <Heart className="w-4 h-4 mr-1 fill-current" />
                      已点赞
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments_count || 0}
                    </span>
                  </div>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'following':
        if (followingLoading) {
          return <div className="text-center py-8 text-gray-500">加载中...</div>;
        }
        
        if (!followingData?.results?.length) {
          return <div className="text-center py-8 text-gray-500">暂无关注的用户</div>;
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followingData.results.map((followUser: any) => (
              <div key={followUser.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${followUser.id}`}>
                    <img
                      src={followUser.avatar_url}
                      alt={followUser.nickname}
                      className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/profile/${followUser.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {followUser.nickname}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{followUser.signature}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {followUser.followers_count} 粉丝
                    </p>
                  </div>
                  <button 
                    onClick={() => followMutation.mutate(followUser.id)}
                    disabled={followMutation.isLoading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 hover:shadow-sm"
                  >
                    {followMutation.isLoading ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        处理中
                      </div>
                    ) : '已关注'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'followers':
        if (followersLoading) {
          return <div className="text-center py-8 text-gray-500">加载中...</div>;
        }
        
        if (!followersData?.results?.length) {
          return <div className="text-center py-8 text-gray-500">暂无粉丝</div>;
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followersData.results.map((follower: any) => (
              <div key={follower.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${follower.id}`}>
                    <img
                      src={follower.avatar_url}
                      alt={follower.nickname}
                      className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/profile/${follower.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {follower.nickname}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{follower.signature}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {follower.followers_count} 粉丝
                    </p>
                  </div>
                  <button 
                    onClick={() => followMutation.mutate(follower.id)}
                    disabled={followMutation.isLoading}
                    className={`px-3 py-1 text-sm rounded-md disabled:opacity-50 transition-all duration-200 ${
                      follower.is_following
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
                    }`}
                  >
                    {followMutation.isLoading ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        处理中
                      </div>
                    ) : (follower.is_following ? '已关注' : '关注')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-300 rounded-t-lg mb-4"></div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-500">用户不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* 个人资料卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* 背景图 */}
        <div 
          className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 rounded-t-lg relative"
          style={{
            backgroundImage: profileUser.background_url ? `url(${profileUser.background_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
        </div>

        <div className="px-6 pb-6">
          {/* 头像和基本信息 */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative">
            <div className="relative">
              <img
                src={avatarPreview || profileUser?.avatar_url || '/default-avatar.svg'}
                alt={profileUser?.nickname || '用户'}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                onError={(e) => {
                  // 如果头像加载失败，使用默认头像
                  e.currentTarget.src = '/default-avatar.svg';
                }}
              />
              
              {isOwnProfile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isLoading}
                  className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profileUser.nickname}</h1>
                  <p className="text-gray-600 mt-1">{profileUser.signature}</p>
                  <p className="text-sm text-gray-500 mt-2">{profileUser.bio}</p>
                  
                  {/* 详细信息 */}
                  <div className="mt-3 space-y-1">
                    {profileUser.birthday && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(profileUser.birthday)}
                        {getAge(profileUser.birthday) && (
                          <span className="ml-2 text-gray-500">({getAge(profileUser.birthday)}岁)</span>
                        )}
                      </div>
                    )}
                    {profileUser.gender && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {getGenderText(profileUser.gender)}
                      </div>
                    )}
                    {profileUser.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {profileUser.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      加入于 {formatDate(profileUser.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                      {isEditing ? '取消' : '编辑资料'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleFollow}
                        disabled={followMutation.isLoading}
                        className={`flex items-center px-4 py-2 rounded-md disabled:opacity-50 transition-all duration-200 ${
                          profileUser.is_following
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
                        }`}
                      >
                        {followMutation.isLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            处理中...
                          </div>
                        ) : (
                          <>
                            {profileUser.is_following ? (
                              <UserMinus className="w-4 h-4 mr-2" />
                            ) : (
                              <UserPlus className="w-4 h-4 mr-2" />
                            )}
                            {profileUser.is_following ? '已关注' : '关注'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (targetUserId) {
                            startConversationMutation.mutate(targetUserId);
                          }
                        }}
                        disabled={startConversationMutation.isLoading}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        私信
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 统计数据 */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileUser.posts_count || 0}</div>
                  <div className="text-sm text-gray-500">帖子</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileUser.followers_count || 0}</div>
                  <div className="text-sm text-gray-500">粉丝</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileUser.following_count || 0}</div>
                  <div className="text-sm text-gray-500">关注</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profileUser.likes_received || 0}</div>
                  <div className="text-sm text-gray-500">获赞</div>
                </div>
              </div>
            </div>
          </div>

          {/* 编辑表单 */}
          {isEditing && isOwnProfile && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">编辑个人资料</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    昵称 *
                  </label>
                  <input
                    {...register('nickname', { required: '请输入昵称' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="请输入昵称"
                  />
                  {errors.nickname && (
                    <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性别
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">请选择性别</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生日
                  </label>
                  <input
                    {...register('birthday')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在地
                  </label>
                  <input
                    {...register('location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="请输入所在地"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    个性签名
                  </label>
                  <input
                    {...register('signature')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="写点什么介绍一下自己..."
                    maxLength={200}
                  />
                </div>
                
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人简介
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="详细介绍一下自己..."
                  maxLength={500}
                />
                <div className="mt-1 text-right text-sm text-gray-500">
                  {watch('bio')?.length || 0} / 500
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={updateUserMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateUserMutation.isLoading ? '保存中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    取消
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                    className="flex items-center hover:text-gray-700"
                  >
                    {showPrivateInfo ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showPrivateInfo ? '隐藏' : '显示'}隐私信息
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              我的帖子 ({profileUser.posts_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'likes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              我的点赞
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              我的关注 ({profileUser.following_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'followers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              我的粉丝 ({profileUser.followers_count || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirm.show && (
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
                确定要删除帖子 <strong>"{deleteConfirm.postTitle}"</strong> 吗？此操作无法撤销。
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

export default Profile;
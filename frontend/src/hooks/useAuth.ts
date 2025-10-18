import { useMutation, useQuery } from 'react-query';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
// import { LoginRequest, RegisterRequest } from '../types/user';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { login, logout, updateUser } = useAuthStore();

  // 登录
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('登录成功！');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '登录失败');
    },
  });

  // 注册
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('注册成功！');
    },
    onError: (error: any) => {
      console.log('Registration error:', error.response?.data);
      
      // 处理详细的字段错误信息
      const errorData = error.response?.data;
      if (errorData) {
        let errorMessages: string[] = [];
        
        // 处理密码错误
        if (errorData.password && Array.isArray(errorData.password)) {
          errorMessages = errorMessages.concat(errorData.password);
        }
        
        // 处理邮箱错误
        if (errorData.email && Array.isArray(errorData.email)) {
          errorMessages = errorMessages.concat(errorData.email);
        }
        
        // 处理昵称错误
        if (errorData.nickname && Array.isArray(errorData.nickname)) {
          errorMessages = errorMessages.concat(errorData.nickname);
        }
        
        // 处理确认密码错误
        if (errorData.password_confirm && Array.isArray(errorData.password_confirm)) {
          errorMessages = errorMessages.concat(errorData.password_confirm);
        }
        
        // 处理非字段错误
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMessages = errorMessages.concat(errorData.non_field_errors);
        }
        
        // 显示所有错误信息
        if (errorMessages.length > 0) {
          errorMessages.forEach(message => {
            toast.error(message);
          });
        } else {
          toast.error(errorData.error || errorData.detail || '注册失败');
        }
      } else {
        toast.error('注册失败，请稍后重试');
      }
    },
  });

  // 登出
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      toast.success('已退出登录');
    },
    onError: () => {
      // 即使API调用失败，也要清除本地状态
      logout();
    },
  });

  // 更新用户信息
  const updateUserMutation = useMutation({
    mutationFn: authApi.updateUser,
    onSuccess: (data) => {
      updateUser(data);
      toast.success('资料更新成功！');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '更新失败');
    },
  });

  // 关注用户
  const followUserMutation = useMutation({
    mutationFn: authApi.followUser,
    onSuccess: () => {
      toast.success('关注成功！');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '关注失败');
    },
  });

  // 取消关注用户
  const unfollowUserMutation = useMutation({
    mutationFn: authApi.unfollowUser,
    onSuccess: () => {
      toast.success('取消关注成功！');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '取消关注失败');
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateUser: updateUserMutation.mutate,
    followUser: followUserMutation.mutate,
    unfollowUser: unfollowUserMutation.mutate,
    isLoading: loginMutation.isLoading || registerMutation.isLoading,
  };
};

// 获取当前用户信息的Hook
export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: false,
  });
};

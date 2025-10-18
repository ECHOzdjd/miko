from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q
from .models import User, UserProfile, UserFollow
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserProfileSerializer, UserFollowSerializer, UserUpdateSerializer
)
from apps.posts.models import Post, PostBookmark


class UserRegistrationView(generics.CreateAPIView):
    """用户注册"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """用户登录"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'token': token.key
        })


class UserLogoutView(generics.GenericAPIView):
    """用户登出"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete()
        except:
            pass
        logout(request)
        return Response({'message': '登出成功'})


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """当前用户信息"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UserUpdateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = UserUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # 重新获取用户实例以确保获取最新的头像URL
        instance.refresh_from_db()
        
        # 返回完整的用户信息
        response_serializer = UserSerializer(instance, context={'request': request})
        return Response(response_serializer.data)


class UserDetailView(generics.RetrieveAPIView):
    """用户详情"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        return User.objects.get(id=user_id)


class UserProfileViewSet(viewsets.ModelViewSet):
    """用户资料管理"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            return UserProfile.objects.filter(user=self.request.user)
        return UserProfile.objects.all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """获取当前用户资料"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class UserPostsView(generics.ListAPIView):
    """用户帖子列表"""
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        from apps.posts.models import Post
        return Post.objects.filter(author_id=user_id, status='published').order_by('-created_at')

    def get_serializer_class(self):
        from apps.posts.serializers import PostSerializer
        return PostSerializer


class UserFollowersView(generics.ListAPIView):
    """用户粉丝列表"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return User.objects.filter(follower_relations__following_id=user_id)


class UserFollowingView(generics.ListAPIView):
    """用户关注列表"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return User.objects.filter(follower_relations__follower_id=user_id)


class UserLikedPostsView(generics.ListAPIView):
    """用户点赞的帖子列表"""
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        from apps.posts.models import Post
        from apps.likes.models import Like
        from django.contrib.contenttypes.models import ContentType
        
        post_content_type = ContentType.objects.get_for_model(Post)
        liked_post_ids = Like.objects.filter(
            user_id=user_id,
            content_type=post_content_type
        ).values_list('object_id', flat=True)
        
        return Post.objects.filter(
            id__in=liked_post_ids,
            status='published'
        ).order_by('-created_at')

    def get_serializer_class(self):
        from apps.posts.serializers import PostSerializer
        return PostSerializer


class FollowViewSet(viewsets.ModelViewSet):
    """关注管理"""
    queryset = UserFollow.objects.all()
    serializer_class = UserFollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFollow.objects.filter(follower=self.request.user)

    @action(detail=False, methods=['post'])
    def follow(self, request):
        """关注用户"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': '需要提供user_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'error': '不能关注自己'}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = UserFollow.objects.get_or_create(
            follower=request.user,
            following=target_user
        )

        if created:
            # 更新关注数
            request.user.following_count += 1
            target_user.followers_count += 1
            request.user.save(update_fields=['following_count'])
            target_user.save(update_fields=['followers_count'])
            
            return Response({'message': '关注成功'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': '已经关注过了'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def unfollow(self, request):
        """取消关注"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': '需要提供user_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            follow = UserFollow.objects.get(
                follower=request.user,
                following_id=user_id
            )
            target_user = follow.following
            follow.delete()
            
            # 更新关注数
            request.user.following_count -= 1
            target_user.followers_count -= 1
            request.user.save(update_fields=['following_count'])
            target_user.save(update_fields=['followers_count'])
            
            return Response({'message': '取消关注成功'})
        except UserFollow.DoesNotExist:
            return Response({'error': '未关注该用户'}, status=status.HTTP_404_NOT_FOUND)


class UserBookmarkedPostsView(generics.ListAPIView):
    """获取用户收藏的帖子"""
    from apps.posts.serializers import PostSerializer
    
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            # 获取指定用户的收藏帖子
            bookmarked_post_ids = PostBookmark.objects.filter(
                user_id=user_id
            ).values_list('post_id', flat=True)
            return Post.objects.filter(
                id__in=bookmarked_post_ids,
                status='published'
            ).order_by('-created_at')
        else:
            # 获取当前用户的收藏帖子
            bookmarked_post_ids = PostBookmark.objects.filter(
                user=self.request.user
            ).values_list('post_id', flat=True)
            return Post.objects.filter(
                id__in=bookmarked_post_ids,
                status='published'
            ).order_by('-created_at')

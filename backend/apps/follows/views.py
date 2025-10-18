from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Follow
from .serializers import FollowSerializer
from apps.users.models import User


class FollowViewSet(viewsets.ModelViewSet):
    """关注视图集"""
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """只返回当前用户的关注记录"""
        return Follow.objects.filter(follower=self.request.user)

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """切换关注状态"""
        following_id = request.data.get('following_id')
        
        if not following_id:
            return Response(
                {'error': '缺少用户ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        following_user = get_object_or_404(User, id=following_id)
        
        if following_user == request.user:
            return Response(
                {'error': '不能关注自己'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            follow = Follow.objects.get(
                follower=request.user,
                following=following_user
            )
            follow.delete()
            # 更新关注数统计
            request.user.following_count -= 1
            request.user.save(update_fields=['following_count'])
            following_user.followers_count -= 1
            following_user.save(update_fields=['followers_count'])
            return Response({'status': 'unfollowed'})
        except Follow.DoesNotExist:
            Follow.objects.create(
                follower=request.user,
                following=following_user
            )
            # 更新关注数统计
            request.user.following_count += 1
            request.user.save(update_fields=['following_count'])
            following_user.followers_count += 1
            following_user.save(update_fields=['followers_count'])
            return Response({'status': 'followed'})

    @action(detail=False, methods=['get'])
    def followers(self, request):
        """获取粉丝列表"""
        followers = Follow.objects.filter(following=request.user)
        serializer = FollowSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def following(self, request):
        """获取关注列表"""
        following = Follow.objects.filter(follower=request.user)
        serializer = FollowSerializer(following, many=True)
        return Response(serializer.data)

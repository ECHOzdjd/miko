from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Like
from .serializers import LikeSerializer


class LikeViewSet(viewsets.ModelViewSet):
    """点赞视图集"""
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """只返回当前用户的点赞记录"""
        return Like.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """切换点赞状态"""
        content_type_id = request.data.get('content_type')
        object_id = request.data.get('object_id')
        
        if not content_type_id or not object_id:
            return Response(
                {'error': '缺少必要参数'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            like = Like.objects.get(
                user=request.user,
                content_type_id=content_type_id,
                object_id=object_id
            )
            like.delete()
            return Response({'status': 'unliked'})
        except Like.DoesNotExist:
            Like.objects.create(
                user=request.user,
                content_type_id=content_type_id,
                object_id=object_id
            )
            return Response({'status': 'liked'})
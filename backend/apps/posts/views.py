from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from .models import Post, PostImage, PostBookmark, PostShare, Comment
from .serializers import PostSerializer, PostImageSerializer, CommentSerializer, CommentCreateSerializer
from apps.likes.models import Like


class PostViewSet(viewsets.ModelViewSet):
    """帖子视图集"""
    queryset = Post.objects.filter(status='published')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['post_type', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'likes_count', 'views_count']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        try:
            # 处理图片文件
            images = request.FILES.getlist('images', [])
            print(f"接收到 {len(images)} 个图片文件")
            
            # 创建序列化器实例
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                print("序列化器验证失败:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # 保存帖子
            post = serializer.save(author=request.user)
            
            # 更新用户的帖子数
            request.user.posts_count += 1
            request.user.save(update_fields=['posts_count'])
            
            # 处理图片
            if images:
                for i, image_file in enumerate(images):
                    PostImage.objects.create(
                        post=post,
                        image=image_file,
                        order=i
                    )
                
                # 更新images字段为图片URL列表
                post_images = post.post_images.all()
                post.images = [img.image.url for img in post_images]
                post.save()
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print("创建帖子时发生错误:", str(e))
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """删除帖子"""
        instance = self.get_object()
        
        # 检查权限：只有作者可以删除自己的帖子
        if instance.author != request.user:
            return Response(
                {'error': '您没有权限删除此帖子'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 减少用户的帖子数
        if instance.author.posts_count > 0:
            instance.author.posts_count -= 1
            instance.author.save(update_fields=['posts_count'])
        
        # 删除帖子
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """点赞帖子"""
        from django.contrib.contenttypes.models import ContentType
        
        post = self.get_object()
        content_type = ContentType.objects.get_for_model(Post)
        
        like, created = Like.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            object_id=post.id
        )
        if not created:
            like.delete()
            post.likes_count = max(0, post.likes_count - 1)
            post.save(update_fields=['likes_count'])
            return Response({'status': 'unliked', 'likes_count': post.likes_count})
        
        post.likes_count += 1
        post.save(update_fields=['likes_count'])
        return Response({'status': 'liked', 'likes_count': post.likes_count})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def bookmark(self, request, pk=None):
        """收藏帖子"""
        post = self.get_object()
        bookmark, created = PostBookmark.objects.get_or_create(
            user=request.user,
            post=post
        )
        if not created:
            bookmark.delete()
            post.bookmarks_count = max(0, post.bookmarks_count - 1)
            post.save(update_fields=['bookmarks_count'])
            return Response({'status': 'unbookmarked', 'bookmarks_count': post.bookmarks_count})
        
        post.bookmarks_count += 1
        post.save(update_fields=['bookmarks_count'])
        return Response({'status': 'bookmarked', 'bookmarks_count': post.bookmarks_count})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def share(self, request, pk=None):
        """分享帖子"""
        post = self.get_object()
        platform = request.data.get('platform', 'unknown')
        PostShare.objects.create(
            user=request.user,
            post=post,
            platform=platform
        )
        post.shares_count += 1
        post.save(update_fields=['shares_count'])
        return Response({'status': 'shared'})

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """增加浏览量"""
        post = self.get_object()
        post.increment_views()
        return Response({'views_count': post.views_count})


class PostImageViewSet(viewsets.ModelViewSet):
    """帖子图片视图集"""
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # 确保只有帖子作者可以添加图片
        post = serializer.validated_data['post']
        if post.author != self.request.user:
            raise PermissionError("只有帖子作者可以添加图片")
        serializer.save()


class CommentListCreateView(generics.ListCreateAPIView):
    """评论列表和创建视图"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(
            post_id=post_id, 
            parent__isnull=True  # 只获取顶级评论
        ).order_by('created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['post'] = get_object_or_404(Post, id=self.kwargs['post_id'])
        return context
    
    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['post_id'])
        comment = serializer.save()
        
        # 更新帖子的评论数（只计算顶级评论）
        if comment.parent is None:
            post.comments_count += 1
            post.save(update_fields=['comments_count'])


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """评论详情视图"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        return Comment.objects.all()
    
    def perform_destroy(self, instance):
        # 更新帖子的评论数（只计算顶级评论）
        post = instance.post
        if instance.parent is None:
            post.comments_count = max(0, post.comments_count - 1)
            post.save(update_fields=['comments_count'])
        
        # 删除评论
        instance.delete()


from rest_framework import serializers
from .models import Post, PostImage, PostBookmark, PostShare, Comment
from apps.users.serializers import UserSerializer
from apps.likes.models import Like


class PostImageSerializer(serializers.ModelSerializer):
    """帖子图片序列化器"""
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'caption', 'order', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """帖子序列化器"""
    author = UserSerializer(read_only=True)
    post_images = PostImageSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'post_type', 'status', 'author',
            'images', 'video_url', 'video_thumbnail', 'views_count',
            'likes_count', 'comments_count', 'shares_count', 'bookmarks_count',
            'created_at', 'updated_at', 'published_at', 'post_images',
            'is_liked', 'is_bookmarked'
        ]
        read_only_fields = [
            'author', 'views_count', 'likes_count', 'comments_count',
            'shares_count', 'bookmarks_count', 'created_at', 'updated_at',
            'published_at', 'images'
        ]

    def to_representation(self, instance):
        """自定义序列化输出，确保图片URL是完整的"""
        data = super().to_representation(instance)
        
        # 处理图片URL，确保是完整的URL
        if 'images' in data and data['images']:
            request = self.context.get('request')
            if request:
                # 只处理相对路径的URL，已经是完整URL的保持不变
                processed_images = []
                for url in data['images']:
                    if url and not url.startswith('http'):
                        processed_images.append(request.build_absolute_uri(url))
                    elif url:
                        processed_images.append(url)
                data['images'] = processed_images
        
        return data


    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该帖子"""
        from django.contrib.contenttypes.models import ContentType
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            content_type = ContentType.objects.get_for_model(Post)
            return Like.objects.filter(
                user=request.user,
                content_type=content_type,
                object_id=obj.id
            ).exists()
        return False

    def get_is_bookmarked(self, obj):
        """检查当前用户是否收藏了该帖子"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostBookmark.objects.filter(
                user=request.user,
                post=obj
            ).exists()
        return False


class PostBookmarkSerializer(serializers.ModelSerializer):
    """帖子收藏序列化器"""
    post = PostSerializer(read_only=True)

    class Meta:
        model = PostBookmark
        fields = ['id', 'post', 'created_at']


class PostShareSerializer(serializers.ModelSerializer):
    """帖子分享序列化器"""
    post = PostSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = PostShare
        fields = ['id', 'user', 'post', 'platform', 'created_at']




class CommentSerializer(serializers.ModelSerializer):
    """评论序列化器"""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'content', 'parent', 'replies',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """获取回复评论 - 支持无限嵌套"""
        # 对所有评论都获取其回复，实现真正的无限嵌套
        replies = obj.replies.all().order_by('created_at')
        return CommentSerializer(replies, many=True, context=self.context).data
    


class CommentCreateSerializer(serializers.ModelSerializer):
    """评论创建序列化器"""
    class Meta:
        model = Comment
        fields = ['content', 'parent']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['post'] = self.context['post']
        return super().create(validated_data)
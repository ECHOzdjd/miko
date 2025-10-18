from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from django.utils import timezone
from apps.users.models import User
from apps.likes.models import Like


class Post(models.Model):
    """帖子模型"""
    POST_TYPE_CHOICES = [
        ('text', '纯文本'),
        ('image', '图文'),
        ('video', '视频'),
        ('article', '文章'),
    ]
    
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
        ('hidden', '隐藏'),
        ('deleted', '已删除'),
    ]

    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name='作者'
    )
    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    post_type = models.CharField(
        max_length=20, 
        choices=POST_TYPE_CHOICES, 
        default='text',
        verbose_name='帖子类型'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='published',
        verbose_name='状态'
    )
    images = models.JSONField(default=list, verbose_name='图片列表')
    video_url = models.URLField(blank=True, verbose_name='视频链接')
    video_thumbnail = models.URLField(blank=True, verbose_name='视频缩略图')
    
    # 统计字段
    views_count = models.PositiveIntegerField(default=0, verbose_name='浏览数')
    likes_count = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    comments_count = models.PositiveIntegerField(default=0, verbose_name='评论数')
    shares_count = models.PositiveIntegerField(default=0, verbose_name='分享数')
    bookmarks_count = models.PositiveIntegerField(default=0, verbose_name='收藏数')
    
    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='发布时间')
    
    # 关联模型
    likes = GenericRelation(Like, related_query_name='post')

    class Meta:
        db_table = 'posts'
        verbose_name = '帖子'
        verbose_name_plural = '帖子'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/posts/{self.id}/"

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])


class PostImage(models.Model):
    """帖子图片模型"""
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='post_images',
        verbose_name='帖子'
    )
    image = models.ImageField(upload_to='posts/images/', verbose_name='图片')
    caption = models.CharField(max_length=200, blank=True, verbose_name='图片说明')
    order = models.PositiveIntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'post_images'
        verbose_name = '帖子图片'
        verbose_name_plural = '帖子图片'
        ordering = ['order']

    def __str__(self):
        return f"{self.post.title} - 图片 {self.order}"


class PostBookmark(models.Model):
    """帖子收藏模型"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='bookmarks',
        verbose_name='用户'
    )
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='bookmark_users',
        verbose_name='帖子'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='收藏时间')

    class Meta:
        db_table = 'post_bookmarks'
        verbose_name = '帖子收藏'
        verbose_name_plural = '帖子收藏'
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.nickname} 收藏 {self.post.title}"


class PostShare(models.Model):
    """帖子分享模型"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='shares',
        verbose_name='分享者'
    )
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='share_users',
        verbose_name='帖子'
    )
    platform = models.CharField(max_length=50, verbose_name='分享平台')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='分享时间')

    class Meta:
        db_table = 'post_shares'
        verbose_name = '帖子分享'
        verbose_name_plural = '帖子分享'

    def __str__(self):
        return f"{self.user.nickname} 分享 {self.post.title} 到 {self.platform}"


class Comment(models.Model):
    """评论模型"""
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name='帖子'
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name='评论者'
    )
    content = models.TextField(verbose_name='评论内容')
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='replies',
        verbose_name='父评论'
    )
    
    # 统计字段
    likes_count = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    
    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    # 关联模型
    likes = GenericRelation(Like, related_query_name='comment')

    class Meta:
        db_table = 'comments'
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.nickname} 评论 {self.post.title}"

    def is_reply(self):
        """判断是否为回复评论"""
        return self.parent is not None



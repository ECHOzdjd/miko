from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from apps.users.models import User


class Like(models.Model):
    """通用点赞模型"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='用户'
    )
    
    # 通用外键，可以点赞帖子、评论等
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='点赞时间')

    class Meta:
        db_table = 'likes'
        verbose_name = '点赞'
        verbose_name_plural = '点赞'
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"{self.user.nickname} 点赞 {self.content_type.model} {self.object_id}"

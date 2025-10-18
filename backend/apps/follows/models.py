from django.db import models
from apps.users.models import User


class Follow(models.Model):
    """关注模型"""
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name='关注者'
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name='被关注者'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='关注时间')

    class Meta:
        db_table = 'follows'
        verbose_name = '关注'
        verbose_name_plural = '关注'
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.nickname} 关注 {self.following.nickname}"

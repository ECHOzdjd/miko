from django.db import models
from django.utils import timezone
from apps.users.models import User


class Conversation(models.Model):
    """对话模型"""
    participants = models.ManyToManyField(
        User, 
        related_name='conversations',
        verbose_name='参与者'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'conversations'
        verbose_name = '对话'
        verbose_name_plural = '对话'
        ordering = ['-updated_at']

    def __str__(self):
        return f"对话 {self.id}"

    def get_other_participant(self, user):
        """获取对话中的另一个参与者"""
        return self.participants.exclude(id=user.id).first()


class Message(models.Model):
    """消息模型"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name='对话'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name='发送者'
    )
    content = models.TextField(verbose_name='消息内容')
    is_read = models.BooleanField(default=False, verbose_name='是否已读')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='发送时间')

    class Meta:
        db_table = 'messages'
        verbose_name = '消息'
        verbose_name_plural = '消息'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.nickname}: {self.content[:50]}"

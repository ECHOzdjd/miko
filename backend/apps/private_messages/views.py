from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, MessageCreateSerializer
from apps.users.models import User


class ConversationListView(generics.ListAPIView):
    """对话列表视图"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')


class ConversationDetailView(generics.RetrieveAPIView):
    """对话详情视图"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')


class MessageListView(generics.ListCreateAPIView):
    """消息列表视图"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(
            Conversation.objects.filter(participants=self.request.user),
            id=conversation_id
        )
        return Message.objects.filter(conversation=conversation).select_related('sender')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        conversation_id = self.kwargs['conversation_id']
        context['conversation'] = get_object_or_404(
            Conversation.objects.filter(participants=self.request.user),
            id=conversation_id
        )
        return context
    
    def perform_create(self, serializer):
        conversation = self.get_serializer_context()['conversation']
        message = serializer.save()
        
        # 更新对话的更新时间
        conversation.save()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request):
    """开始对话"""
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': '需要提供user_id'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    if target_user == request.user:
        return Response({'error': '不能与自己对话'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 查找是否已存在对话
    conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=target_user
    ).first()
    
    if not conversation:
        # 创建新对话
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, target_user)
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """标记消息为已读"""
    conversation = get_object_or_404(
        Conversation.objects.filter(participants=request.user),
        id=conversation_id
    )
    
    # 标记该对话中除自己发送的消息外的所有消息为已读
    Message.objects.filter(
        conversation=conversation
    ).exclude(
        sender=request.user
    ).update(is_read=True)
    
    return Response({'message': '消息已标记为已读'})

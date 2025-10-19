#!/usr/bin/env python
"""
数据库检查脚本
"""
import os
import sys
import django
from django.conf import settings

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.posts.models import Post, Comment
from apps.follows.models import UserFollow

def check_database():
    """检查数据库数据"""
    print("=" * 50)
    print("数据库检查报告")
    print("=" * 50)
    
    # 检查用户数据
    print("\n1. 用户数据:")
    users = User.objects.all()
    print(f"总用户数: {users.count()}")
    
    for user in users:
        print(f"  - ID: {user.id}, 昵称: {user.nickname}, 邮箱: {user.email}")
        if user.avatar:
            print(f"    头像: {user.avatar.name}")
            print(f"    头像URL: {user.avatar.url}")
        else:
            print(f"    头像: 无")
    
    # 检查帖子数据
    print("\n2. 帖子数据:")
    posts = Post.objects.all()
    print(f"总帖子数: {posts.count()}")
    
    for post in posts[:5]:  # 只显示前5个
        print(f"  - ID: {post.id}, 标题: {post.title}, 作者: {post.author.nickname}")
        if post.images:
            print(f"    图片: {post.images}")
    
    # 检查评论数据
    print("\n3. 评论数据:")
    comments = Comment.objects.all()
    print(f"总评论数: {comments.count()}")
    
    # 检查关注关系
    print("\n4. 关注关系:")
    follows = UserFollow.objects.all()
    print(f"总关注数: {follows.count()}")
    
    for follow in follows[:5]:  # 只显示前5个
        print(f"  - {follow.follower.nickname} 关注 {follow.following.nickname}")
    
    print("\n" + "=" * 50)
    print("检查完成")
    print("=" * 50)

if __name__ == '__main__':
    check_database()

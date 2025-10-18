#!/usr/bin/env python
import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User, UserProfile
from django.contrib.auth.hashers import make_password

def create_test_users():
    """创建测试用户"""
    
    # 创建用户1 - 测试用户A
    user_a, created = User.objects.get_or_create(
        username='testuser_a',
        defaults={
            'email': 'testuser_a@example.com',
            'password': make_password('password123'),
            'is_active': True
        }
    )
    
    if created:
        UserProfile.objects.create(
            user=user_a,
            nickname='测试用户A',
            signature='这是测试用户A的签名',
            bio='测试用户A的个人简介'
        )
        print(f"✅ 创建用户A: {user_a.username}")
    else:
        print(f"ℹ️ 用户A已存在: {user_a.username}")
    
    # 创建用户2 - 测试用户B
    user_b, created = User.objects.get_or_create(
        username='testuser_b',
        defaults={
            'email': 'testuser_b@example.com',
            'password': make_password('password123'),
            'is_active': True
        }
    )
    
    if created:
        UserProfile.objects.create(
            user=user_b,
            nickname='测试用户B',
            signature='这是测试用户B的签名',
            bio='测试用户B的个人简介'
        )
        print(f"✅ 创建用户B: {user_b.username}")
    else:
        print(f"ℹ️ 用户B已存在: {user_b.username}")
    
    # 创建用户3 - 测试用户C
    user_c, created = User.objects.get_or_create(
        username='testuser_c',
        defaults={
            'email': 'testuser_c@example.com',
            'password': make_password('password123'),
            'is_active': True
        }
    )
    
    if created:
        UserProfile.objects.create(
            user=user_c,
            nickname='测试用户C',
            signature='这是测试用户C的签名',
            bio='测试用户C的个人简介'
        )
        print(f"✅ 创建用户C: {user_c.username}")
    else:
        print(f"ℹ️ 用户C已存在: {user_c.username}")
    
    print("\n📋 测试用户信息:")
    print("=" * 50)
    print("用户名: testuser_a, 密码: password123, 昵称: 测试用户A")
    print("用户名: testuser_b, 密码: password123, 昵称: 测试用户B") 
    print("用户名: testuser_c, 密码: password123, 昵称: 测试用户C")
    print("=" * 50)
    
    return user_a, user_b, user_c

if __name__ == '__main__':
    create_test_users()

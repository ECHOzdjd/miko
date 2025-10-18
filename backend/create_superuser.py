import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

try:
    if not User.objects.filter(email='admin@miko.com').exists():
        User.objects.create_superuser(
            email='admin@miko.com',
            nickname='admin',
            password='admin123'
        )
        print('✅ 超级用户创建成功！')
        print('📧 邮箱: admin@miko.com')
        print('🔑 密码: admin123')
    else:
        print('⚠️  超级用户已存在')
except Exception as e:
    print(f'❌ 创建失败: {e}')


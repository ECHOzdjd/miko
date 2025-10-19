"""
URL configuration for miko project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponse
from django.views.static import serve
import os

def api_root(request):
    """API 根路径视图"""
    return JsonResponse({
        'message': 'Miko API Server',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'admin': '/admin/',
            'users': '/api/users/',
            'posts': '/api/posts/',
            'likes': '/api/likes/',
            'follows': '/api/follows/',
            'messages': '/api/messages/',
        }
    })

def media_serve(request, path):
    """媒体文件服务视图"""
    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    
    # 添加 CORS 头部
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    return response

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/likes/', include('apps.likes.urls')),
    path('api/follows/', include('apps.follows.urls')),
    path('api/messages/', include('apps.private_messages.urls')),
    # 媒体文件服务
    path('media/<path:path>', media_serve, name='media_serve'),
]

# 媒体文件服务配置
if settings.DEBUG:
    # 开发环境直接服务媒体文件
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # 生产环境使用 whitenoise 服务静态文件，媒体文件仍需要直接服务
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

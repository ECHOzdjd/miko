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
    from django.http import HttpResponse, Http404
    import mimetypes
    
    try:
        # 构建完整的文件路径
        file_path = os.path.join(settings.MEDIA_ROOT, path)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            raise Http404(f"File not found: {path}")
        
        # 获取文件 MIME 类型
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # 读取文件内容
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # 创建响应
        response = HttpResponse(file_content, content_type=content_type)
        
        # 添加 CORS 头部
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response
    except Exception as e:
        return HttpResponse(f"Error serving media file: {str(e)}", status=500)

def media_debug(request):
    """媒体文件调试视图"""
    from django.http import JsonResponse
    import os
    
    debug_info = {
        'MEDIA_ROOT': str(settings.MEDIA_ROOT),
        'MEDIA_URL': settings.MEDIA_URL,
        'media_root_exists': os.path.exists(settings.MEDIA_ROOT),
        'media_files': []
    }
    
    if os.path.exists(settings.MEDIA_ROOT):
        for root, dirs, files in os.walk(settings.MEDIA_ROOT):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), settings.MEDIA_ROOT)
                debug_info['media_files'].append(rel_path)
    
    return JsonResponse(debug_info)

def test_image(request):
    """测试图片端点"""
    from django.http import HttpResponse
    import base64
    
    # 创建一个简单的测试图片（1x1像素的PNG）
    test_png = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    )
    
    response = HttpResponse(test_png, content_type='image/png')
    response['Access-Control-Allow-Origin'] = '*'
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
    # 媒体文件调试
    path('debug/media/', media_debug, name='media_debug'),
]

# 媒体文件服务配置 - 所有环境都使用直接服务
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

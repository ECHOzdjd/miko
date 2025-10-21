# 部署指南

## 🚀 Vercel部署（前端）

### 1. 准备工作

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

### 2. 前端部署

1. **进入前端目录**
```bash
cd frontend
```

2. **创建生产环境配置**
创建 `frontend/.env.production` 文件：
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
REACT_APP_BASE_URL=https://your-backend-url.herokuapp.com
```

3. **部署到Vercel**
```bash
vercel --prod
```

### 3. 配置环境变量

在Vercel Dashboard中设置环境变量：
- `REACT_APP_API_URL`: 后端API地址
- `REACT_APP_BASE_URL`: 后端基础地址

## 🐍 后端部署选项

### Render部署

1. **访问Render**
   - 访问 https://render.com
   - 连接GitHub仓库

2. **创建Web Service**
   - 选择backend目录
   - 构建命令: `pip install -r requirements.txt`
   - 启动命令: `python manage.py runserver 0.0.0.0:$PORT`

3. **配置环境变量**
```env
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-app.onrender.com
```

## 📁 项目结构优化

### 1. 创建部署配置

创建 `backend/Procfile` (Heroku):
```
web: python manage.py runserver 0.0.0.0:$PORT
```

创建 `backend/runtime.txt` (Heroku):
```
python-3.11.0
```

### 2. 更新Django设置

在 `backend/config/settings.py` 中添加生产环境配置：

```python
import os
from pathlib import Path

# 生产环境检测
if os.environ.get('DJANGO_ENV') == 'production':
    DEBUG = False
    ALLOWED_HOSTS = [
        'your-app-name.herokuapp.com',
        'your-app.railway.app',
        'your-app.onrender.com',
        'localhost',
        '127.0.0.1'
    ]
    
    # 数据库配置（使用环境变量）
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME'),
            'USER': os.environ.get('DB_USER'),
            'PASSWORD': os.environ.get('DB_PASSWORD'),
            'HOST': os.environ.get('DB_HOST'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
    
    # 静态文件配置
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    
    # 媒体文件配置
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

## 🔧 部署步骤

### 1. 后端部署

1. **选择部署平台**（推荐Railway或Render）
2. **连接GitHub仓库**
3. **配置环境变量**
4. **部署**

### 2. 前端部署

1. **更新API地址**
   - 修改 `frontend/src/api/client.ts` 中的baseURL
   - 或设置环境变量

2. **部署到Vercel**
```bash
cd frontend
vercel --prod
```

### 3. 域名配置

1. **后端域名**: 从部署平台获取
2. **前端域名**: 从Vercel获取
3. **更新CORS设置**: 允许前端域名访问后端

## 📝 部署检查清单

- [ ] 后端成功部署并运行
- [ ] 前端成功部署并运行
- [ ] API连接正常
- [ ] 数据库迁移完成
- [ ] 静态文件配置正确
- [ ] 环境变量设置正确
- [ ] CORS配置正确
- [ ] 域名解析正确

## 🚨 常见问题

### 1. CORS错误
```python
# 在settings.py中添加
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
    "http://localhost:3000",
]
```

### 2. 静态文件404
```python
# 在settings.py中添加
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
```

### 3. 数据库连接失败
- 检查环境变量
- 确保数据库服务正常运行
- 检查网络连接



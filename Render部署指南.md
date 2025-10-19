# 🚀 Render后端部署指南

## 📋 部署步骤

### 第一步：访问Render
1. 打开 https://render.com
2. 使用GitHub账号登录
3. 点击 "New +" 按钮

### 第二步：创建Web Service
1. 选择 "Web Service"
2. 点击 "Build and deploy from a Git repository"
3. 连接您的GitHub账号
4. 选择 `ECHOzdjd/miko` 仓库

### 第三步：配置服务
1. **Name**: `miko-backend`
2. **Root Directory**: `backend`
3. **Environment**: `Python 3`
4. **Build Command**: 
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
5. **Start Command**: 
   ```bash
   gunicorn config.wsgi:application
   ```

### 第四步：设置环境变量
在 "Advanced" 部分添加环境变量：

```
DJANGO_ENV=production
SECRET_KEY=your-very-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=miko-backend.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### 第五步：添加数据库
1. 在Render Dashboard点击 "New +"
2. 选择 "PostgreSQL"
3. 名称：`miko-database`
4. 计划：选择 "Free"
5. 点击 "Create Database"

### 第六步：连接数据库
1. 复制数据库连接信息
2. 在Web Service的环境变量中添加：
```
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
```

### 第七步：部署
1. 点击 "Create Web Service"
2. 等待构建完成（通常5-10分钟）
3. 记录服务URL（例如：`https://miko-backend.onrender.com`）
https://miko-backend-cl3w.onrender.com
## 🔧 部署后配置

### 1. 创建超级用户
在Render的Shell中运行：
```bash
python manage.py createsuperuser
```

### 2. 测试API
访问：`https://your-backend-url.onrender.com/api/`

### 3. 检查日志
在Render Dashboard查看 "Logs" 标签

## 🎯 下一步：部署前端

部署完成后，您将获得后端URL，然后：
1. 在Vercel部署前端
2. 设置前端环境变量：
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_BASE_URL=https://your-backend-url.onrender.com
   ```
3. 在后端添加CORS设置：
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

## 💰 成本
- **Web Service**: 免费（有使用限制）
- **PostgreSQL**: 免费（有使用限制）
- **总计**: 完全免费

## 🎉 完成！
部署完成后，您将拥有一个完整的后端API服务！

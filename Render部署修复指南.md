# Render 部署修复指南

## 🔧 修复内容

### 1. 数据库连接问题修复
- **问题**: `psycopg2-binary==2.9.9` 与 Python 3.13.4 不兼容
- **解决**: 使用 `psycopg[binary]==3.1.18` (psycopg3)
- **优势**: 更好的 Python 3.13+ 兼容性

### 2. 环境变量支持
- **添加**: `dj-database-url==2.1.0` 用于自动解析数据库 URL
- **更新**: Django 设置优先使用 `DATABASE_URL` 环境变量

### 3. 多平台支持
- **Railway**: 支持 `DATABASE_URL` 和 `*.railway.app` 域名
- **Render**: 支持 `*.onrender.com` 域名
- **Heroku**: 支持 `*.herokuapp.com` 域名

## 🚀 部署步骤

### 1. 提交更改
```bash
# Windows
deploy-render.bat

# Linux/Mac
./deploy-render.sh
```

### 2. 在 Render 重新部署
1. 访问 [Render Dashboard](https://dashboard.render.com)
2. 找到您的 `miko-backend` 服务
3. 点击 "Manual Deploy"
4. 选择 "Clear build cache & Deploy"
5. 等待部署完成

### 3. 检查部署日志
在 Render Dashboard 中查看部署日志，应该看到：
- ✅ Python 3.11.9 安装成功
- ✅ psycopg[binary]==3.1.18 安装成功
- ✅ 数据库迁移成功
- ✅ 静态文件收集成功
- ✅ Gunicorn 启动成功

## 🔍 故障排除

### 如果仍然失败：

#### 1. 检查 Python 版本
确保 Render 使用 Python 3.11.9：
- 检查 `backend/runtime.txt` 文件
- 在 Render 设置中确认 Python 版本

#### 2. 检查环境变量
确保以下环境变量已设置：
```
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=*.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

#### 3. 检查数据库配置
- 确保 PostgreSQL 数据库已创建
- 检查 `DATABASE_URL` 环境变量

#### 4. 检查构建命令
确保构建命令正确：
```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
```

## 📊 预期结果

部署成功后，您应该能够：
1. 访问 Render 提供的 URL (如 `https://miko-backend.onrender.com`)
2. 看到 Django API 响应
3. 前端能够正常连接后端 API

## 🎯 下一步

1. **测试 API**: 访问 `https://your-app.onrender.com/api/` 查看 API 状态
2. **更新前端**: 将前端的 API URL 更新为 Render 的 URL
3. **测试功能**: 测试用户注册、登录、发帖等功能

## 📞 如果仍有问题

如果部署仍然失败，请提供：
1. Render 的完整错误日志
2. 具体的错误信息
3. 部署过程中的任何警告

我们将根据具体错误信息进一步诊断和修复。

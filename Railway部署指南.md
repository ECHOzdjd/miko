# Railway 部署指南

## 🚀 Railway 部署步骤

### 1. 准备工作

#### 1.1 创建 Railway 账户
- 访问 [Railway.app](https://railway.app)
- 使用 GitHub 账户登录

#### 1.2 连接 GitHub 仓库
- 在 Railway Dashboard 中点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择您的 `miko` 仓库

### 2. 配置服务

#### 2.1 创建 Web Service
- 选择 "Deploy from GitHub repo"
- 选择 `miko` 仓库
- Railway 会自动检测到这是一个 Python 项目

#### 2.2 配置环境变量
在 Railway Dashboard 的 Variables 标签页中添加以下环境变量：

```bash
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=your-very-secret-key-here-make-it-long-and-random
ALLOWED_HOSTS=*.railway.app,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

#### 2.3 配置构建和启动命令
在 Railway Dashboard 的 Settings 标签页中：

**Root Directory:** `backend`

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
```

**Start Command:**
```bash
gunicorn config.wsgi:application
```

### 3. 数据库配置

#### 3.1 添加 PostgreSQL 数据库
- 在 Railway Dashboard 中点击 "New"
- 选择 "Database" → "PostgreSQL"
- Railway 会自动创建数据库并设置 `DATABASE_URL` 环境变量

#### 3.2 更新数据库配置
Railway 会自动提供 `DATABASE_URL` 环境变量，Django 会自动使用它。

### 4. 部署

#### 4.1 自动部署
- Railway 会在您推送代码到 GitHub 时自动部署
- 您可以在 Railway Dashboard 中查看部署日志

#### 4.2 手动部署
- 在 Railway Dashboard 中点击 "Deploy" 按钮
- 选择要部署的分支（通常是 `main`）

### 5. 获取部署 URL

部署成功后，Railway 会提供一个类似 `https://your-app-name.railway.app` 的 URL。

### 6. 更新前端配置

更新前端的 API 基础 URL：

```typescript
// frontend/src/api/client.ts
const API_BASE_URL = 'https://your-app-name.railway.app/api';
```

### 7. 常见问题解决

#### 7.1 构建失败
- 检查 `requirements.txt` 中的依赖版本
- 查看 Railway 的构建日志

#### 7.2 数据库连接失败
- 确保 PostgreSQL 数据库已正确创建
- 检查 `DATABASE_URL` 环境变量

#### 7.3 静态文件问题
- 确保 `python manage.py collectstatic` 命令成功执行
- 检查 `STATIC_ROOT` 和 `STATIC_URL` 配置

### 8. 监控和维护

#### 8.1 查看日志
- 在 Railway Dashboard 中点击服务名称
- 查看 "Deployments" 和 "Logs" 标签页

#### 8.2 重启服务
- 在 Railway Dashboard 中点击 "Restart" 按钮

#### 8.3 更新环境变量
- 在 Variables 标签页中修改环境变量
- 修改后会自动重新部署

## 🎯 优势

- **简单易用**: 自动检测 Python 项目
- **免费额度**: 每月 $5 免费额度
- **自动部署**: 连接 GitHub 后自动部署
- **内置数据库**: 一键添加 PostgreSQL
- **环境变量管理**: 简单的环境变量配置界面

## 📝 注意事项

1. **免费额度限制**: 免费账户有使用限制，超出后需要付费
2. **数据库备份**: 定期备份数据库数据
3. **环境变量安全**: 不要在前端代码中暴露敏感信息
4. **域名配置**: 可以配置自定义域名

## 🔗 相关链接

- [Railway 官方文档](https://docs.railway.app/)
- [Django 部署指南](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Gunicorn 配置](https://docs.gunicorn.org/en/stable/configure.html)

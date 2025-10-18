# 快速启动指南




- **后端地址**: http://localhost:8000
- **管理后台**: http://localhost:8000/admin
- **API文档**: http://localhost:8000/api

### 管理员账号
- **邮箱**: admin@miko.com
- **密码**: admin123

---

## 🎯 核心功能模块

### ✅ 已实现功能
- ✅ **用户系统** - 注册、登录、个人资料管理
- ✅ **帖子系统** - 发布、浏览、编辑帖子
- ✅ **圈子系统** - 创建、加入、管理圈子
- ✅ **点赞系统** - 帖子点赞、收藏功能
- ✅ **关注系统** - 用户关注、粉丝管理
- ✅ **私信系统** - 实时聊天、消息管理

---

## 🌐 前端启动步骤

由于npm依赖安装遇到权限问题，请按以下步骤手动启动前端：

### 方法1：以管理员权限运行
1. 以**管理员身份**打开PowerShell或命令提示符
2. 进入前端目录：
   ```bash
   cd D:\miko\frontend
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm start
   ```

### 方法2：更改npm缓存目录
1. 打开命令行，执行：
   ```bash
   npm config set cache "C:\Users\你的用户名\.npm-cache" --global
   ```
2. 然后再次尝试：
   ```bash
   cd D:\miko\frontend
   npm install
   npm start
   ```

### 方法3：使用yarn（推荐）
```bash
# 如果没有yarn，先安装
npm install -g yarn

# 使用yarn安装依赖
cd D:\miko\frontend
yarn install
yarn start
```

---

## 📝 项目状态

### ✅ 已完成
- ✅ 后端Django项目重构
- ✅ 数据库设计优化
- ✅ 核心功能模块实现
- ✅ API接口完善
- ✅ 前端页面适配

### 🎯 技术栈
- **后端**: Django 4.2 + Django REST Framework
- **前端**: React 18 + TypeScript + Tailwind CSS
- **数据库**: SQLite (轻量级，无需额外配置)
- **缓存**: Redis (可选)

---

## 🔧 故障排除

### 如果后端停止运行
打开新的命令行窗口：
```bash
cd D:\miko\backend
venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

### 如果需要重新创建数据库
```bash
cd D:\miko\backend
venv\Scripts\activate
python manage.py flush
python create_superuser.py
```

### 前端npm问题解决
1. **关闭所有杀毒软件**（可能会锁定文件）
2. **以管理员运行**命令行
3. **使用yarn代替npm**
4. **更改npm全局缓存位置**

---

## 🎯 访问地址

一旦前端启动成功，你可以访问：

- 🌐 **前端应用**: http://localhost:3000
- 🖥️ **后端API**: http://localhost:8000/api
- 👤 **管理后台**: http://localhost:8000/admin

---
---



如果遇到问题：
1. 检查 `backend/logs/django.log` 查看后端日志
2. 查看控制台错误信息
3. 确保Python、Node.js版本正确
4. 检查8000和3000端口是否被占用

---




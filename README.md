# 二次元社区项目 (Miko)

一个基于React + Django的现代化社交平台，专注于核心社交功能，支持用户互动、私信聊天等功能。
直接访问（需要挂梯子）：https://miko-qvbo.vercel.app/

## 🎯 项目特色

- 🎨 **现代化UI设计** - 基于Tailwind CSS的响应式界面
- 🚀 **高性能架构** - React 18 + Django 4.2 + SQLite
- 🔐 **安全认证** - 支持邮箱注册登录
- 💬 **私信系统** - 完整的私信聊天功能
- 📱 **移动端适配** - 完全响应式设计
- 🎯 **专注核心** - 精简功能，专注用户体验

## 📁 项目结构

```
miko/
├── backend/                 # Django后端
│   ├── config/             # Django配置
│   │   ├── settings.py     # 主配置文件
│   │   ├── urls.py         # URL路由
│   │   └── asgi.py         # ASGI配置
│   ├── apps/               # Django应用
│   │   ├── users/          # 用户管理
│   │   ├── posts/          # 帖子管理
│   │   ├── likes/          # 点赞系统
│   │   ├── follows/        # 关注系统
│   │   └── private_messages/ # 私信系统
│   ├── requirements.txt    # Python依赖
│   ├── manage.py          # Django管理脚本
│   └── env.example        # 环境配置示例
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── stores/         # 状态管理
│   │   ├── api/            # API接口
│   │   ├── types/          # TypeScript类型
│   │   └── App.tsx         # 主应用组件
│   ├── public/             # 静态资源
│   ├── package.json        # Node.js依赖
│   └── env.example         # 环境配置示例
├── start.bat              # Windows启动脚本
├── start.sh               # Linux/Mac启动脚本
└── README.md              # 项目说明
```

## 🚀 功能模块

### 👤 用户中心 (UC)
- ✅ 用户注册/登录（邮箱、社交账号）
- ✅ 个人资料管理（头像、昵称、签名）
- ✅ 用户认证与权限管理
- ✅ 我的帖子、我的点赞、我的关注、我的粉丝

### 📝 内容发布系统
- ✅ 发布帖子（支持多图片上传，最多9张）
- ✅ 帖子编辑和删除
- ✅ 图片预览和上传

### 📖 内容浏览系统
- ✅ 首页信息流（最新帖子）
- ✅ 帖子详情页
- ✅ 图片查看器

### 💬 互动系统
- ✅ 点赞、收藏功能
- ✅ 评论系统（支持嵌套评论）
- ✅ 实时互动体验

### 👥 社交系统
- ✅ 关注用户、取消关注
- ✅ 私信聊天系统
- ✅ 用户关系管理
- ✅ 个人资料页面


## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router** - 客户端路由
- **React Query** - 数据获取和缓存
- **Zustand** - 轻量级状态管理
- **React Hook Form** - 表单处理
- **Framer Motion** - 动画库

### 后端技术
- **Django 4.2** - Python Web框架
- **Django REST Framework** - API开发
- **SQLite** - 轻量级数据库
- **Django ImageKit** - 图片处理
- **CORS Headers** - 跨域支持

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 静态类型检查

## 🚀 快速开始

### 系统要求
- Python 3.8+
- Node.js 16+

### 一键启动 (推荐)

**Windows用户:**
```bash
# 双击运行 start.bat 或在命令行执行
start.bat
```

**Linux/Mac用户:**
```bash
# 设置执行权限并运行
chmod +x start.sh
./start.sh
```

### 手动启动

#### 1. 后端设置
```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp env.example .env
# 编辑 .env 文件配置数据库等（SQLite无需额外配置）

# 运行数据库迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver
```

#### 2. 前端设置
```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp env.example .env

# 启动开发服务器
npm start
```

### 访问地址
- 🌐 **前端应用**: http://localhost:3000
- 🖥️ **后端API**: http://localhost:8000/api
- 👤 **管理后台**: http://localhost:8000/admin

## 📊 数据库设计

### 核心模型
- **User** - 用户模型（自定义用户）
- **UserProfile** - 用户资料模型
- **Post** - 帖子模型
- **PostImage** - 帖子图片模型
- **PostBookmark** - 帖子收藏模型
- **Like** - 点赞模型（通用外键）
- **Follow** - 关注模型
- **Comment** - 评论模型（支持嵌套）
- **Conversation** - 对话模型
- **Message** - 消息模型

### 关系设计
- 用户与帖子：一对多
- 用户与关注：多对多（自关联）
- 帖子与点赞：多对多（通过通用外键）
- 帖子与图片：一对多
- 帖子与评论：一对多
- 评论与回复：自关联（支持无限嵌套）
- 用户与对话：多对多
- 对话与消息：一对多


```

### 详细部署说明

请查看 [DEPLOYMENT.md](DEPLOYMENT.md) 文件获取完整的部署指南。




# 系统架构设计

## 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React 前端    │    │   Django 后端   │    │   数据库层      │
│                 │    │                 │    │                 │
│  - 用户界面     │◄──►│  - REST API     │◄──►│  - SQLite       │
│  - 状态管理     │    │  - 业务逻辑     │    │  - 文件存储     │
│  - 路由管理     │    │  - 认证授权     │    │                 │
│  - 组件库       │    │  - 图片处理     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 前端架构

### 技术栈
- **React 18** - 核心框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **React Query** - 数据获取

### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── Layout/         # 布局组件
│   ├── Post/           # 帖子相关组件
│   ├── Comment/        # 评论相关组件
│   └── Common/         # 通用组件
├── pages/              # 页面组件
│   ├── Auth/           # 认证页面
│   ├── Home/           # 首页
│   ├── Profile/        # 用户页面
│   ├── PostDetail/     # 帖子详情页
│   ├── CreatePost/     # 创建帖子页
│   ├── Bookmarks/      # 收藏页面
│   ├── Conversations/  # 对话列表页
│   └── Chat/           # 聊天页面
├── hooks/              # 自定义Hooks
├── stores/             # 状态管理
├── api/                # API接口
├── types/              # TypeScript类型
└── utils/              # 工具函数
```

### 后端架构

### 技术栈
- **Django 4.2** - Web框架
- **Django REST Framework** - API框架
- **SQLite** - 轻量级数据库
- **Django ImageKit** - 图片处理
- **CORS Headers** - 跨域支持

### 应用结构
```
apps/
├── users/              # 用户管理
├── posts/              # 帖子管理
├── likes/              # 点赞系统
├── follows/            # 关注系统
└── private_messages/   # 私信系统
```

## 数据库设计

### 核心实体关系

```
User (用户)
├── 1:N → Post (帖子)
├── M:N → User (关注关系)
├── M:N → Conversation (对话)
├── 1:1 → UserProfile (用户资料)
└── 1:N → Comment (评论)

Post (帖子)
├── N:1 → User (作者)
├── 1:N → PostImage (图片)
├── 1:N → Comment (评论)
├── M:N → User (点赞，通过Like模型)
└── M:N → User (收藏，通过PostBookmark模型)

Comment (评论)
├── N:1 → User (作者)
├── N:1 → Post (帖子)
├── N:1 → Comment (父评论，支持嵌套)
└── 1:N → Comment (子评论)

Conversation (对话)
├── M:N → User (参与者)
└── 1:N → Message (消息)

Message (消息)
├── N:1 → User (发送者)
└── N:1 → Conversation (对话)
```

### 主要数据表

1. **users** - 用户基础信息
2. **user_profiles** - 用户资料信息
3. **posts** - 帖子内容
4. **post_images** - 帖子图片
5. **post_bookmarks** - 帖子收藏
6. **likes** - 点赞记录（通用外键）
7. **follows** - 关注关系
8. **comments** - 评论内容
9. **conversations** - 对话信息
10. **messages** - 消息内容

## API设计

### RESTful API规范

```
# 用户相关
GET    /api/users/           # 获取用户列表
POST   /api/users/register/  # 用户注册
POST   /api/users/login/     # 用户登录
GET    /api/users/me/        # 获取当前用户信息
GET    /api/users/{id}/      # 获取用户详情
POST   /api/users/{id}/follow/ # 关注用户
DELETE /api/users/{id}/follow/ # 取消关注

# 帖子相关
GET    /api/posts/posts/     # 获取帖子列表
POST   /api/posts/posts/     # 创建帖子
GET    /api/posts/posts/{id}/ # 获取帖子详情
PUT    /api/posts/posts/{id}/ # 更新帖子
DELETE /api/posts/posts/{id}/ # 删除帖子
POST   /api/posts/posts/{id}/like/ # 点赞帖子
DELETE /api/posts/posts/{id}/like/ # 取消点赞
POST   /api/posts/posts/{id}/bookmark/ # 收藏帖子
DELETE /api/posts/posts/{id}/bookmark/ # 取消收藏

# 评论相关
GET    /api/posts/posts/{id}/comments/ # 获取评论列表
POST   /api/posts/posts/{id}/comments/ # 创建评论

# 私信相关
GET    /api/messages/conversations/ # 获取对话列表
POST   /api/messages/conversations/start_conversation/ # 开始对话
GET    /api/messages/conversations/{id}/messages/ # 获取消息列表
POST   /api/messages/conversations/{id}/messages/ # 发送消息
```


## 性能优化

### 前端优化
- 代码分割和懒加载
- 图片懒加载
- 虚拟滚动
- 缓存策略

### 后端优化
- 数据库查询优化
- 分页加载
- 图片压缩处理

### 数据库优化
- 索引优化
- 查询优化
- 连接池管理
- 读写分离

## 部署架构

### 开发环境
```
本地开发 → Docker容器 → 本地数据库
```

### 生产环境
```
负载均衡器 → Web服务器 → 应用服务器 → 数据库集群
```

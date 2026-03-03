# de-bao.github.workers

基于 Cloudflare Workers + D1 + R2 的博客后台管理系统。

## 🚀 功能特性

- ✅ 文章 CRUD 操作
- ✅ 文章发布（生成 Jekyll Markdown 格式）
- ✅ 文件上传到 R2 存储
- ✅ JWT 认证
- ✅ RESTful API

## 📁 项目结构

```
de-bao.github.workers/
├── src/
│   ├── index.ts           # Workers 主入口
│   ├── routes/
│   │   ├── posts.ts       # 文章路由
│   │   ├── auth.ts        # 认证路由
│   │   └── upload.ts      # 文件上传路由
│   └── utils/
│       └── auth.ts        # 认证工具函数
├── schema.sql             # D1 数据库初始化脚本
├── wrangler.toml          # Cloudflare Workers 配置
├── package.json
└── README.md
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 D1 数据库

```bash
npx wrangler d1 create blog-db
```

将生成的 `database_id` 填入 `wrangler.toml` 中的 `database_id` 字段。

### 3. 初始化数据库 Schema

```bash
npx wrangler d1 execute blog-db --file=./schema.sql
```

### 4. 创建 R2 Bucket

```bash
npx wrangler r2 bucket create blog-media
```

### 5. 设置环境变量

```bash
# 设置 JWT Secret（生产环境必须）
npx wrangler secret put JWT_SECRET
```

### 6. 本地开发

```bash
npm run dev
```

### 7. 部署到 Cloudflare

```bash
npm run deploy
```

## 📡 API 端点

### 公开端点

- `POST /api/auth/login` - 登录
- `GET /api/posts` - 获取文章列表（支持 `?status=published&limit=10&offset=0`）
- `GET /api/posts/:slug` - 获取单篇文章

### 需要认证的端点

所有需要认证的请求都需要在 Header 中添加：
```
Authorization: Bearer <token>
```

- `POST /api/posts` - 创建文章
- `PUT /api/posts/:id` - 更新文章
- `DELETE /api/posts/:id` - 删除文章
- `POST /api/posts/:id/publish` - 发布文章（生成 Jekyll Markdown）
- `POST /api/upload` - 上传文件到 R2
- `GET /api/media` - 获取文件列表

## 📝 使用示例

### 登录

```bash
curl -X POST https://your-worker.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

### 创建文章

```bash
curl -X POST https://your-worker.workers.dev/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "我的新文章",
    "content": "# 文章内容\n\n这是文章正文...",
    "excerpt": "文章摘要",
    "tags": ["技术", "教程"],
    "categories": ["前端开发"],
    "date": "2025-01-20",
    "read_time": 5
  }'
```

### 发布文章（生成 Jekyll Markdown）

```bash
curl -X POST https://your-worker.workers.dev/api/posts/{id}/publish \
  -H "Authorization: Bearer <token>"
```

返回的 `content` 字段就是可以直接保存到 `_posts/` 目录的 Markdown 文件内容。

### 上传文件

```bash
curl -X POST https://your-worker.workers.dev/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

## 🔐 安全注意事项

1. **JWT Secret**: 必须使用 `wrangler secret put JWT_SECRET` 设置，不要写在 `wrangler.toml` 中
2. **密码验证**: 当前实现是简化版，生产环境应使用 bcrypt 进行密码哈希和验证
3. **JWT 签名**: 当前实现是简化版，生产环境应使用 `jose` 库进行真正的 JWT 签名和验证
4. **CORS**: 当前允许所有来源，生产环境应限制为特定域名

## 🔄 与 Jekyll 博客集成

发布文章后，可以通过以下方式同步到 Jekyll 仓库：

1. **GitHub API**: 使用 GitHub API 将生成的 Markdown 文件提交到 `_posts/` 目录
2. **GitHub Actions**: 创建 GitHub Action，定期从 API 拉取已发布文章并生成文件
3. **手动同步**: 复制 `publish` 接口返回的 `content` 到 `_posts/` 目录

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [R2 存储文档](https://developers.cloudflare.com/r2/)

## 📄 许可证

MIT

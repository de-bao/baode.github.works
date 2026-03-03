# API 测试指南

## 🔐 JWT Secret 状态

✅ **已设置** - JWT Secret 已成功配置到 Cloudflare Workers

---

## 🧪 API 测试示例

### 1. 测试登录

```bash
curl -X POST https://blog-admin-api.debao-cpc.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

**注意**：当前认证是简化版，用户名必须匹配 `ADMIN_USERNAME`（在 wrangler.toml 中设置为 "admin"），密码验证暂时简化处理。

**响应示例**：
```json
{
  "token": "eyJhbGc...",
  "username": "admin",
  "expiresIn": 604800
}
```

### 2. 使用 Token 创建文章

```bash
# 先登录获取 token
TOKEN=$(curl -s -X POST https://blog-admin-api.debao-cpc.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "test"}' | jq -r '.token')

# 创建文章
curl -X POST https://blog-admin-api.debao-cpc.workers.dev/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "我的第一篇博客文章",
    "content": "# 标题\n\n这是文章内容...",
    "excerpt": "文章摘要",
    "tags": ["技术", "教程"],
    "categories": ["前端开发"],
    "date": "2025-03-03",
    "read_time": 5,
    "status": "draft"
  }'
```

### 3. 获取文章列表

```bash
# 获取已发布文章
curl https://blog-admin-api.debao-cpc.workers.dev/api/posts?status=published

# 获取所有文章（包括草稿，需要认证）
curl -H "Authorization: Bearer $TOKEN" \
  https://blog-admin-api.debao-cpc.workers.dev/api/posts?status=all
```

### 4. 获取单篇文章

```bash
curl https://blog-admin-api.debao-cpc.workers.dev/api/posts/文章-slug
```

### 5. 更新文章

```bash
curl -X PUT https://blog-admin-api.debao-cpc.workers.dev/api/posts/{文章ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "更新后的标题",
    "content": "更新后的内容..."
  }'
```

### 6. 发布文章（生成 Jekyll Markdown）

```bash
curl -X POST https://blog-admin-api.debao-cpc.workers.dev/api/posts/{文章ID}/publish \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**：
```json
{
  "id": "xxx",
  "slug": "文章-slug",
  "filename": "2025-03-03-文章-slug.md",
  "content": "---\nlayout: post\ntitle: \"...\"\n...",
  "status": "published"
}
```

### 7. 删除文章

```bash
curl -X DELETE https://blog-admin-api.debao-cpc.workers.dev/api/posts/{文章ID} \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 前端集成示例

### JavaScript/TypeScript

```typescript
const API_BASE = 'https://blog-admin-api.debao-cpc.workers.dev/api';

// 登录
async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// 创建文章
async function createPost(post: {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  categories?: string[];
  date?: string;
  read_time?: number;
}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });
  return response.json();
}

// 获取文章列表
async function getPosts(status: 'published' | 'draft' | 'all' = 'published') {
  const response = await fetch(`${API_BASE}/posts?status=${status}`);
  return response.json();
}
```

---

## ⚠️ 注意事项

1. **认证**：当前是简化版实现，生产环境建议：
   - 使用真正的 JWT 库（如 `jose`）
   - 实现密码哈希验证（bcrypt）
   - 从数据库验证用户

2. **CORS**：当前允许所有来源，生产环境应限制为你的域名

3. **R2 上传**：需要先启用 R2 并创建 bucket，然后取消注释相关代码

---

## 🔗 Workers 信息

- **URL**: https://blog-admin-api.debao-cpc.workers.dev
- **数据库**: D1 (blog-db)
- **状态**: ✅ 运行中

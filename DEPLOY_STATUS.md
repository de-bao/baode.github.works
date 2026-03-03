# 部署状态

## ✅ 已完成的步骤

1. ✅ **安装依赖** - `npm install` 完成
2. ✅ **登录 Cloudflare** - 已登录 (debao.cpc@gmail.com)
3. ✅ **创建 D1 数据库** - `blog-db` (ID: 46cb0538-d5bf-4e99-85ea-3ff44db69ca7)
4. ✅ **初始化数据库 Schema** - 已执行，创建了 3 个表
5. ✅ **部署 Workers** - 成功部署

## 🌐 Workers 地址

**生产环境 URL:**
```
https://blog-admin-api.debao-cpc.workers.dev
```

## ⚠️ 待完成的步骤

### 1. 设置 JWT Secret（必须）

```bash
cd /home/10355407/下载/baode-resume/de-bao.github.workers
npx wrangler secret put JWT_SECRET
```

输入一个强随机字符串（建议至少 32 位），例如：
```
your-super-secret-jwt-key-at-least-32-characters-long-123456789
```

### 2. 启用 R2 存储（可选，用于文件上传）

1. 在 Cloudflare Dashboard 中启用 R2：
   - 访问：https://dash.cloudflare.com/
   - 进入你的账户
   - 点击左侧菜单 "R2"
   - 如果未启用，点击 "Get started" 启用

2. 创建 R2 Bucket：
```bash
npx wrangler r2 bucket create blog-media
```

3. 更新 `wrangler.toml`，取消注释 R2 配置：
```toml
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "blog-media"
```

4. 更新 `src/index.ts`，取消注释上传路由：
```typescript
router.post('/api/upload', authenticate, Upload.handle);
router.get('/api/media', authenticate, Upload.list);
```

5. 重新部署：
```bash
npm run deploy
```

### 3. 配置自定义域名（可选）

如果你想使用 `api.debao.qzz.io` 作为 API 域名：

1. **在 Cloudflare Dashboard 配置 DNS**：
   - 进入 `debao.qzz.io` 的 DNS 设置
   - 添加 CNAME 记录：
     - 名称：`api`
     - 目标：`blog-admin-api.debao-cpc.workers.dev`
     - 代理状态：已代理（橙色云朵）

2. **更新 `wrangler.toml`**（可选）：
```toml
routes = [
  { pattern = "api.debao.qzz.io/api/*", zone_name = "debao.qzz.io" }
]
```

3. **重新部署**：
```bash
npm run deploy
```

## 🧪 测试 API

### 测试获取文章列表（公开接口）

```bash
curl https://blog-admin-api.debao-cpc.workers.dev/api/posts
```

### 测试登录（需要先设置 JWT_SECRET）

```bash
curl -X POST https://blog-admin-api.debao-cpc.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

### 测试创建文章（需要认证）

```bash
# 先登录获取 token
TOKEN="your-jwt-token"

curl -X POST https://blog-admin-api.debao-cpc.workers.dev/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "测试文章",
    "content": "# 测试内容\n\n这是测试文章...",
    "excerpt": "文章摘要",
    "tags": ["测试"],
    "categories": ["技术"],
    "date": "2025-03-03",
    "read_time": 5
  }'
```

## 📊 数据库信息

- **数据库名称**: `blog-db`
- **数据库 ID**: `46cb0538-d5bf-4e99-85ea-3ff44db69ca7`
- **区域**: APAC (HKG)
- **表结构**: 
  - `posts` - 文章表
  - `users` - 用户表
  - `media` - 媒体文件表

## 📝 后续操作

1. **设置 JWT Secret**（必须，否则认证功能无法使用）
2. **测试 API 接口**
3. **配置自定义域名**（可选）
4. **启用 R2 存储**（可选，用于文件上传功能）
5. **在前端集成 API 调用**

## 🔗 相关链接

- Cloudflare Dashboard: https://dash.cloudflare.com/
- Workers 日志: `npx wrangler tail`
- D1 数据库管理: Cloudflare Dashboard → Workers & Pages → D1

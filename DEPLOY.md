# 部署指南

## 📦 是否需要上传到 GitHub？

**建议上传**，原因：
- ✅ 版本控制和备份
- ✅ 可以使用 GitHub Actions 自动部署
- ✅ 团队协作更方便
- ✅ 代码安全备份

**也可以不上传**，直接本地部署（适合个人项目）。

---

## 🚀 完整部署步骤

### 步骤 1: 安装依赖

```bash
cd /home/10355407/下载/baode-resume/de-bao.github.workers
npm install
```

### 步骤 2: 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器，登录你的 Cloudflare 账号。

### 步骤 3: 创建 D1 数据库

```bash
npx wrangler d1 create blog-db
```

**重要**：复制输出的 `database_id`，例如：
```
✅ Created database blog-db in region APAC
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← 复制这个 ID
```

### 步骤 4: 更新 wrangler.toml

将 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "你的-database-id"  # ← 替换这里
```

### 步骤 5: 初始化数据库 Schema

```bash
npx wrangler d1 execute blog-db --file=./schema.sql
```

### 步骤 6: 创建 R2 Bucket

```bash
npx wrangler r2 bucket create blog-media
```

### 步骤 7: 设置 JWT Secret（重要！）

```bash
npx wrangler secret put JWT_SECRET
```

输入一个强随机字符串作为密钥（建议至少 32 位），例如：
```
请输入密钥: your-super-secret-jwt-key-at-least-32-characters-long
```

### 步骤 8: 本地测试（可选）

```bash
npm run dev
```

访问 `http://localhost:8787` 测试 API。

### 步骤 9: 部署到 Cloudflare

```bash
npm run deploy
```

部署成功后，会显示 Workers 的 URL，例如：
```
✨  Deployed blog-admin-api
   https://blog-admin-api.your-subdomain.workers.dev
```

---

## 🌐 配置自定义域名（可选）

### 方案 A: 使用子域名（推荐）

如果你想使用 `api.debao.qzz.io` 作为 API 域名：

1. **在 Cloudflare Dashboard 配置 DNS**：
   - 添加 CNAME 记录：`api` → `blog-admin-api.your-subdomain.workers.dev`
   - 代理状态：已代理（橙色云朵）

2. **在 wrangler.toml 中添加路由**（可选）：
```toml
routes = [
  { pattern = "api.debao.qzz.io/api/*", zone_name = "debao.qzz.io" }
]
```

### 方案 B: 使用 Workers 默认域名

直接使用 Cloudflare 提供的 Workers 域名：
```
https://blog-admin-api.your-subdomain.workers.dev
```

---

## 📝 部署后验证

### 1. 测试登录接口

```bash
curl -X POST https://你的-workers域名/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

### 2. 测试获取文章列表

```bash
curl https://你的-workers域名/api/posts?status=published
```

---

## 🔄 后续更新部署

每次修改代码后，只需运行：

```bash
npm run deploy
```

---

## 📚 与前端集成

你的前端在 `de-bao.pages.dev`（绑定到 `debao.qzz.io`），可以在前端代码中调用 Workers API：

```javascript
const API_BASE = 'https://blog-admin-api.your-subdomain.workers.dev/api';
// 或使用自定义域名
// const API_BASE = 'https://api.debao.qzz.io/api';
```

---

## ⚠️ 注意事项

1. **JWT Secret** 必须使用 `wrangler secret put` 设置，不要写在代码中
2. **数据库 ID** 需要填入 `wrangler.toml`
3. **CORS** 当前允许所有来源，生产环境建议限制为你的域名
4. **认证** 当前是简化版，生产环境建议使用真正的 JWT 库和密码哈希

---

## 🆘 常见问题

### Q: 部署失败怎么办？
A: 检查：
- 是否已登录 Cloudflare (`npx wrangler whoami`)
- `wrangler.toml` 中的 `database_id` 是否正确
- 是否已创建 D1 数据库和 R2 bucket

### Q: 如何查看日志？
A: 
```bash
npx wrangler tail
```

### Q: 如何删除部署？
A: 在 Cloudflare Dashboard 中删除，或使用：
```bash
npx wrangler delete blog-admin-api
```

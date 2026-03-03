# R2 存储配置指南

## ⚠️ 重要：R2 需要在 Cloudflare Dashboard 中启用

### 步骤 1: 启用 R2

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 登录你的账户
3. 点击左侧菜单 **"R2"**
4. 如果看到 "Get started" 按钮，点击启用 R2
5. 可能需要输入支付信息（免费额度很大，通常不会收费）

### 步骤 2: 创建 Bucket

启用 R2 后，运行以下命令：

```bash
cd /home/10355407/下载/baode-resume/de-bao.github.workers
npx wrangler r2 bucket create blog-media
```

### 步骤 3: 验证配置

`wrangler.toml` 中已经配置了 R2，取消注释后重新部署即可：

```bash
npm run deploy
```

### 步骤 4: 测试上传

部署后，可以通过 API 测试文件上传功能。


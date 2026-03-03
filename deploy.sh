#!/bin/bash

echo "🚀 Cloudflare Workers 部署脚本"
echo "================================"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查是否已登录
echo "🔐 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami &>/dev/null; then
    echo "⚠️  未登录 Cloudflare，请先登录："
    echo "   npx wrangler login"
    exit 1
fi

echo "✅ 已登录 Cloudflare"
echo ""

# 检查 wrangler.toml 中的 database_id
if grep -q "your-d1-database-id" wrangler.toml; then
    echo "⚠️  警告: wrangler.toml 中的 database_id 还未配置！"
    echo ""
    echo "请先执行以下步骤："
    echo "1. 创建 D1 数据库: npx wrangler d1 create blog-db"
    echo "2. 将生成的 database_id 填入 wrangler.toml"
    echo "3. 初始化数据库: npx wrangler d1 execute blog-db --file=./schema.sql"
    echo "4. 创建 R2 bucket: npx wrangler r2 bucket create blog-media"
    echo "5. 设置 JWT Secret: npx wrangler secret put JWT_SECRET"
    echo ""
    read -p "如果已完成上述步骤，按 Enter 继续部署，否则按 Ctrl+C 退出..."
fi

# 部署
echo "🚀 开始部署..."
npm run deploy

echo ""
echo "✅ 部署完成！"
echo ""
echo "下一步："
echo "1. 测试 API: curl https://你的-workers域名/api/posts"
echo "2. 查看日志: npx wrangler tail"
echo "3. 配置自定义域名（可选）: 在 Cloudflare Dashboard 添加 DNS 记录"

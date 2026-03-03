#!/bin/bash

echo "🚀 开始初始化博客后台管理系统..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 提示创建 D1 数据库
echo ""
echo "📊 请创建 D1 数据库："
echo "   npx wrangler d1 create blog-db"
echo ""
echo "   创建完成后，将生成的 database_id 填入 wrangler.toml"
read -p "按 Enter 继续..."

# 3. 提示初始化数据库
echo ""
echo "🗄️  初始化数据库 Schema..."
echo "   运行: npx wrangler d1 execute blog-db --file=./schema.sql"
read -p "按 Enter 继续..."

# 4. 提示创建 R2 Bucket
echo ""
echo "📦 创建 R2 Bucket..."
echo "   运行: npx wrangler r2 bucket create blog-media"
read -p "按 Enter 继续..."

# 5. 提示设置 JWT Secret
echo ""
echo "🔐 设置 JWT Secret..."
echo "   运行: npx wrangler secret put JWT_SECRET"
echo "   然后输入你的密钥（建议使用随机字符串）"
read -p "按 Enter 继续..."

echo ""
echo "✅ 初始化完成！"
echo ""
echo "下一步："
echo "1. 编辑 wrangler.toml，填入 D1 database_id"
echo "2. 运行 'npm run dev' 开始本地开发"
echo "3. 运行 'npm run deploy' 部署到 Cloudflare"

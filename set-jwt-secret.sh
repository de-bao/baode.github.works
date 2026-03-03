#!/bin/bash

echo "🔐 设置 JWT Secret"
echo "=================="
echo ""
echo "已为你生成一个强随机密钥："
echo ""
JWT_SECRET="e5fc9f8bd8b9ceaa47d19693ec44e6b5717b617ce8b7c030eb02f0af813b2640"
echo "$JWT_SECRET"
echo ""
echo "正在设置到 Cloudflare..."
echo ""

# 使用 echo 管道设置 secret
echo "$JWT_SECRET" | npx wrangler secret put JWT_SECRET

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ JWT Secret 设置成功！"
    echo ""
    echo "密钥已保存（请妥善保管）："
    echo "$JWT_SECRET"
else
    echo ""
    echo "⚠️  自动设置失败，请手动运行："
    echo "   npx wrangler secret put JWT_SECRET"
    echo ""
    echo "然后输入以下密钥："
    echo "$JWT_SECRET"
fi

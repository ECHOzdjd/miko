#!/bin/bash

echo "========================================"
echo "        Railway 部署脚本"
echo "========================================"

echo ""
echo "1. 检查 Git 状态..."
git status

echo ""
echo "2. 添加所有更改..."
git add .

echo ""
echo "3. 提交更改..."
read -p "请输入提交消息 (默认: Deploy to Railway): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Deploy to Railway"
fi
git commit -m "$commit_msg"

echo ""
echo "4. 推送到 GitHub..."
git push origin main

echo ""
echo "========================================"
echo "部署完成！"
echo ""
echo "下一步："
echo "1. 访问 https://railway.app"
echo "2. 创建新项目并连接 GitHub 仓库"
echo "3. 添加 PostgreSQL 数据库"
echo "4. 配置环境变量"
echo "5. 等待自动部署完成"
echo ""
echo "详细步骤请查看: Railway部署指南.md"
echo "========================================"

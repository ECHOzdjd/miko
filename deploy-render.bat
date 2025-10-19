@echo off
echo ========================================
echo        Render 部署脚本
echo ========================================

echo.
echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Fix Render deployment with psycopg3): "
if "%commit_msg%"=="" set commit_msg=Fix Render deployment with psycopg3
git commit -m "%commit_msg%"

echo.
echo 4. 推送到 GitHub...
git push origin main

echo.
echo ========================================
echo 部署完成！
echo.
echo 下一步：
echo 1. 访问 https://dashboard.render.com
echo 2. 找到您的 miko-backend 服务
echo 3. 点击 "Manual Deploy"
echo 4. 选择 "Clear build cache & Deploy"
echo 5. 等待部署完成
echo.
echo 修复内容：
echo - 使用 psycopg[binary]==3.1.18 替代 psycopg2-binary
echo - 添加 dj-database-url 支持
echo - 更新 Django 设置支持多种部署平台
echo ========================================

pause

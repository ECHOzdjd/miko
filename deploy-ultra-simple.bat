@echo off
echo ========================================
echo      超简化 Render 部署脚本
echo ========================================

echo.
echo 修复内容：
echo - 移除 Redis 缓存配置
echo - 移除 Celery 配置
echo - 移除 Channels 配置
echo - 移除 allauth 配置
echo - 移除 django.contrib.sites
echo - 使用本地内存缓存
echo.

echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Ultra simplify settings for deployment): "
if "%commit_msg%"=="" set commit_msg=Ultra simplify settings for deployment
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
echo 这次应该能成功部署！
echo ========================================

pause

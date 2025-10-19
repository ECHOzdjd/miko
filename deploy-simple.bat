@echo off
echo ========================================
echo        简化 Render 部署脚本
echo ========================================

echo.
echo 修复内容：
echo - 使用 psycopg2-binary==2.9.10
echo - 移除可能有问题的包 (allauth, taggit, channels)
echo - 保留核心功能包
echo.

echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Simplify requirements for Render deployment): "
if "%commit_msg%"=="" set commit_msg=Simplify requirements for Render deployment
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
echo 如果仍然失败，我们将尝试其他方案：
echo - 使用 SQLite 数据库
echo - 进一步简化依赖
echo ========================================

pause

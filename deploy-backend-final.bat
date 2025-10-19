@echo off
echo ========================================
echo        后端最终部署脚本
echo ========================================

echo.
echo 当前状态：
echo - 后端已成功部署到 Render
echo - 需要提交 URL 修复并重新部署
echo.

echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Final backend deployment fixes): "
if "%commit_msg%"=="" set commit_msg=Final backend deployment fixes
git commit -m "%commit_msg%"

echo.
echo 4. 推送到 GitHub...
git push origin main

echo.
echo ========================================
echo 后端部署完成！
echo.
echo 后端 URL: https://miko-backend-cl3w.onrender.com
echo.
echo 下一步：
echo 1. 在 Render 重新部署后端
echo 2. 部署前端到 Vercel
echo 3. 更新前端 API URL
echo 4. 测试完整功能
echo ========================================

pause

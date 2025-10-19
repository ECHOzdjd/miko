@echo off
echo ========================================
echo        修复 Vercel 部署问题
echo ========================================

echo.
echo 修复内容：
echo - 添加 CI=false 到构建脚本
echo - 创建 vercel.json 配置文件
echo - 添加 .vercelignore 文件
echo - 设置环境变量
echo.

echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Fix Vercel deployment permissions): "
if "%commit_msg%"=="" set commit_msg=Fix Vercel deployment permissions
git commit -m "%commit_msg%"

echo.
echo 4. 推送到 GitHub...
git push origin main

echo.
echo ========================================
echo 修复完成！
echo.
echo 下一步：
echo 1. 在 Vercel 中重新部署
echo 2. 或者删除现有项目重新导入
echo 3. 确保使用 frontend 作为根目录
echo.
echo 如果仍然失败，尝试：
echo 1. 在 Vercel 设置中手动设置构建命令：CI=false npm run build
echo 2. 或者使用 Vercel CLI 部署
echo ========================================

pause

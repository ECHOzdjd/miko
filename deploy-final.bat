@echo off
echo ========================================
echo        最终 Render 部署脚本
echo ========================================

echo.
echo 修复内容：
echo - 移除 allauth 相关配置
echo - 移除 URL 中的 allauth 引用
echo - 移除中间件中的 allauth 引用
echo - 使用简化的依赖包
echo.

echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Remove allauth references and fix deployment): "
if "%commit_msg%"=="" set commit_msg=Remove allauth references and fix deployment
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
echo 如果仍然失败，我们将：
echo - 使用 SQLite 数据库
echo - 进一步简化依赖
echo - 尝试其他部署平台
echo ========================================

pause

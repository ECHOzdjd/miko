@echo off
echo ========================================
echo        测试媒体文件服务
echo ========================================

echo.
echo 测试媒体文件访问...
echo.

echo 1. 测试头像文件访问：
echo 访问: https://miko-backend-cl3w.onrender.com/media/avatars/Screenshot_2025-07-07_105435_MI4ZQz3.jpg
echo.

echo 2. 测试媒体文件根路径：
echo 访问: https://miko-backend-cl3w.onrender.com/media/
echo.

echo 3. 测试 API 根路径：
echo 访问: https://miko-backend-cl3w.onrender.com/
echo.

echo 修复内容：
echo - 添加了 whitenoise 中间件
echo - 配置了媒体文件服务视图
echo - 添加了 CORS 头部支持
echo - 优化了媒体文件 URL 路由
echo.

echo 下一步：
echo 1. 提交代码到 GitHub
echo 2. 在 Render 重新部署
echo 3. 测试图片显示
echo ========================================

pause

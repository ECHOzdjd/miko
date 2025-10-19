@echo off
echo ========================================
echo        前端部署脚本
echo ========================================

echo.
echo 部署目标：Vercel
echo 后端 API: https://miko-backend-cl3w.onrender.com
echo.

echo 1. 进入前端目录...
cd frontend

echo.
echo 2. 安装依赖...
npm install

echo.
echo 3. 构建前端...
npm run build

echo.
echo 4. 检查构建结果...
if exist "build\index.html" (
    echo ✅ 构建成功！
) else (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo 5. 提交更改到 GitHub...
cd ..
git add .
git commit -m "Update frontend API URL for production deployment"
git push origin main

echo.
echo ========================================
echo 前端准备完成！
echo.
echo 下一步：
echo 1. 访问 https://vercel.com
echo 2. 连接 GitHub 仓库
echo 3. 选择 frontend 目录作为根目录
echo 4. 设置环境变量：
echo    - REACT_APP_API_URL=https://miko-backend-cl3w.onrender.com/api
echo 5. 部署前端
echo.
echo 或者使用 Vercel CLI：
echo 1. npm install -g vercel
echo 2. cd frontend
echo 3. vercel --prod
echo ========================================

pause

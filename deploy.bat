@echo off
chcp 65001 >nul
echo 🚀 开始部署Miko项目...

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 访问: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo 📋 检查部署工具完成

echo 请选择部署方式：
echo 1) Vercel ^(前端^) + Railway ^(后端^)
echo 2) Vercel ^(前端^) + Render ^(后端^)
echo 3) Vercel ^(前端^) + Heroku ^(后端^)
echo 4) 仅部署前端到Vercel
echo 5) 仅部署后端

set /p choice=请输入选择 (1-5): 

if "%choice%"=="1" goto vercel_railway
if "%choice%"=="2" goto vercel_render
if "%choice%"=="3" goto vercel_heroku
if "%choice%"=="4" goto frontend_only
if "%choice%"=="5" goto backend_only

echo ❌ 无效选择
pause
exit /b 1

:frontend_only
echo 🎯 选择: 仅前端到Vercel
echo 📦 部署前端到Vercel...

REM 检查是否安装了Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📥 安装Vercel CLI...
    npm install -g vercel
)

REM 进入前端目录
cd frontend

REM 创建生产环境配置
echo ⚙️ 创建生产环境配置...
(
echo REACT_APP_API_URL=https://your-backend-url.railway.app/api
echo REACT_APP_BASE_URL=https://your-backend-url.railway.app
) > .env.production

echo 📝 请编辑 frontend\.env.production 文件，设置正确的后端URL
pause

REM 部署到Vercel
echo 🚀 部署到Vercel...
vercel --prod

echo ✅ 前端部署完成！
echo 📋 下一步：
echo 1. 在Vercel Dashboard中设置环境变量
echo 2. 更新CORS设置以允许前端域名
goto end

:vercel_railway
echo 🎯 选择: Vercel + Railway
call :frontend_only

echo 📋 Railway后端部署步骤：
echo 1. 访问 https://railway.app
echo 2. 连接GitHub仓库
echo 3. 选择backend目录
echo 4. 设置环境变量：
echo    - DJANGO_ENV=production
echo    - SECRET_KEY=your-secret-key
echo    - DB_NAME=railway
echo    - DB_USER=postgres
echo    - DB_PASSWORD=your-password
echo    - DB_HOST=your-host
echo    - DB_PORT=5432
echo 5. 部署完成后，更新前端环境变量中的API URL
goto end

:vercel_render
echo 🎯 选择: Vercel + Render
call :frontend_only

echo 📋 Render后端部署步骤：
echo 1. 访问 https://render.com
echo 2. 连接GitHub仓库
echo 3. 创建Web Service，选择backend目录
echo 4. 设置构建命令: pip install -r requirements.txt
echo 5. 设置启动命令: python manage.py runserver 0.0.0.0:$PORT
echo 6. 设置环境变量（同Railway）
echo 7. 部署完成后，更新前端环境变量中的API URL
goto end

:vercel_heroku
echo 🎯 选择: Vercel + Heroku
call :frontend_only

REM 检查是否安装了Heroku CLI
heroku --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Heroku CLI未安装，请先安装
    echo 访问: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

echo 📋 Heroku后端部署步骤：
echo 1. 登录Heroku: heroku login
echo 2. 创建应用: heroku create your-app-name
echo 3. 设置环境变量:
echo    heroku config:set DJANGO_ENV=production
echo    heroku config:set SECRET_KEY=your-secret-key
echo 4. 部署: git push heroku main
echo 5. 运行迁移: heroku run python manage.py migrate
echo 6. 创建超级用户: heroku run python manage.py createsuperuser
goto end

:backend_only
echo 🐍 部署后端...
echo 请选择后端部署平台：
echo 1) Railway
echo 2) Render
echo 3) Heroku

set /p backend_choice=请输入选择 (1-3): 

if "%backend_choice%"=="1" (
    echo 📋 Railway部署步骤：
    echo 1. 访问 https://railway.app
    echo 2. 连接GitHub仓库
    echo 3. 选择backend目录
    echo 4. 设置环境变量
) else if "%backend_choice%"=="2" (
    echo 📋 Render部署步骤：
    echo 1. 访问 https://render.com
    echo 2. 连接GitHub仓库
    echo 3. 创建Web Service
    echo 4. 设置环境变量
) else if "%backend_choice%"=="3" (
    echo 📋 Heroku部署步骤：
    echo 1. heroku create your-app-name
    echo 2. 设置环境变量
    echo 3. git push heroku main
) else (
    echo ❌ 无效选择
    pause
    exit /b 1
)
goto end

:end
echo 🎉 部署指南完成！
echo 📖 详细说明请查看 DEPLOYMENT.md 文件
pause

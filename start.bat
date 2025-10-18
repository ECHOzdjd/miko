@echo off
chcp 65001 >nul
echo 🚀 启动二次元社区项目...

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js 16+
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo ✅ 系统要求检查完成

REM 设置后端
echo 🔧 设置后端环境...
cd backend

REM 创建虚拟环境
if not exist "venv" (
    echo 📦 创建Python虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装依赖
echo 📦 安装Python依赖...
pip install -r requirements.txt

REM 复制环境配置文件
if not exist ".env" (
    echo 📝 创建环境配置文件...
    copy env.example .env
    echo ⚠️  请编辑 backend\.env 文件配置数据库和其他设置
)

REM 运行数据库迁移
echo 🗄️  运行数据库迁移...
python manage.py makemigrations
python manage.py migrate

REM 创建超级用户
echo 👤 创建超级用户...
python manage.py createsuperuser --noinput --username admin --email admin@example.com 2>nul

cd ..

REM 设置前端
echo 🔧 设置前端环境...
cd frontend

REM 安装依赖
echo 📦 安装Node.js依赖...
npm install

REM 复制环境配置文件
if not exist ".env" (
    echo 📝 创建环境配置文件...
    copy env.example .env
)

cd ..

echo ✅ 项目设置完成！
echo.
echo 📱 前端地址: http://localhost:3000
echo 🖥️  后端地址: http://localhost:8000
echo 👤 管理后台: http://localhost:8000/admin
echo.
echo 按任意键启动服务...
pause >nul

REM 启动后端
echo 🖥️  启动Django后端...
cd backend
start "Django Backend" cmd /k "venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"
cd ..

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端
echo 🌐 启动React前端...
cd frontend
start "React Frontend" cmd /k "npm start"
cd ..

echo ✅ 服务启动完成！
echo.
echo 两个命令行窗口已打开，分别运行前端和后端服务
echo 关闭这些窗口即可停止服务
echo.
pause

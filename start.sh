#!/bin/bash

# 二次元社区项目启动脚本

echo "🚀 启动二次元社区项目..."

# 检查是否安装了必要的工具
check_requirements() {
    echo "📋 检查系统要求..."
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安装，请先安装 Python 3.8+"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 16+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm"
        exit 1
    fi
    
    if ! command -v redis-server &> /dev/null; then
        echo "⚠️  Redis 未安装，某些功能可能无法正常工作"
    fi
    
    if ! command -v psql &> /dev/null; then
        echo "⚠️  PostgreSQL 未安装，请确保数据库服务可用"
    fi
    
    echo "✅ 系统要求检查完成"
}

# 设置后端环境
setup_backend() {
    echo "🔧 设置后端环境..."
    
    cd backend
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        echo "📦 创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    echo "📦 安装Python依赖..."
    pip install -r requirements.txt
    
    # 复制环境配置文件
    if [ ! -f ".env" ]; then
        echo "📝 创建环境配置文件..."
        cp env.example .env
        echo "⚠️  请编辑 backend/.env 文件配置数据库和其他设置"
    fi
    
    # 运行数据库迁移
    echo "🗄️  运行数据库迁移..."
    python manage.py makemigrations
    python manage.py migrate
    
    # 创建超级用户
    echo "👤 创建超级用户..."
    python manage.py createsuperuser --noinput --username admin --email admin@example.com || true
    
    cd ..
    echo "✅ 后端环境设置完成"
}

# 设置前端环境
setup_frontend() {
    echo "🔧 设置前端环境..."
    
    cd frontend
    
    # 安装依赖
    echo "📦 安装Node.js依赖..."
    npm install
    
    # 复制环境配置文件
    if [ ! -f ".env" ]; then
        echo "📝 创建环境配置文件..."
        cp env.example .env
    fi
    
    cd ..
    echo "✅ 前端环境设置完成"
}

# 启动服务
start_services() {
    echo "🚀 启动服务..."
    
    # 启动Redis（如果可用）
    if command -v redis-server &> /dev/null; then
        echo "🔄 启动Redis..."
        redis-server --daemonize yes || true
    fi
    
    # 启动后端
    echo "🖥️  启动Django后端..."
    cd backend
    source venv/bin/activate
    python manage.py runserver 0.0.0.0:8000 &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 3
    
    # 启动前端
    echo "🌐 启动React前端..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    echo "✅ 服务启动完成！"
    echo ""
    echo "📱 前端地址: http://localhost:3000"
    echo "🖥️  后端地址: http://localhost:8000"
    echo "👤 管理后台: http://localhost:8000/admin"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
    
    # 等待用户中断
    wait
}

# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止服务..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ 服务已停止"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    check_requirements
    
    if [ "$1" = "setup" ]; then
        setup_backend
        setup_frontend
        echo "✅ 项目设置完成！运行 './start.sh' 启动服务"
    else
        if [ ! -d "backend/venv" ] || [ ! -d "frontend/node_modules" ]; then
            echo "⚠️  检测到项目未设置，正在自动设置..."
            setup_backend
            setup_frontend
        fi
        start_services
    fi
}

# 运行主函数
main "$@"

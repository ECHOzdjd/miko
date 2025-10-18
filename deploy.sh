#!/bin/bash

# Miko项目部署脚本

echo "🚀 开始部署Miko项目..."

# 检查是否安装了必要的工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        exit 1
    fi
}

echo "📋 检查部署工具..."
check_tool "git"
check_tool "node"
check_tool "npm"

# 选择部署方式
echo "请选择部署方式："
echo "1) Vercel (前端) + Railway (后端)"
echo "2) Vercel (前端) + Render (后端)"
echo "3) Vercel (前端) + Heroku (后端)"
echo "4) 仅部署前端到Vercel"
echo "5) 仅部署后端"

read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        echo "🎯 选择: Vercel + Railway"
        deploy_vercel_railway
        ;;
    2)
        echo "🎯 选择: Vercel + Render"
        deploy_vercel_render
        ;;
    3)
        echo "🎯 选择: Vercel + Heroku"
        deploy_vercel_heroku
        ;;
    4)
        echo "🎯 选择: 仅前端到Vercel"
        deploy_frontend_only
        ;;
    5)
        echo "🎯 选择: 仅后端"
        deploy_backend_only
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

deploy_frontend_only() {
    echo "📦 部署前端到Vercel..."
    
    # 检查是否安装了Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "📥 安装Vercel CLI..."
        npm install -g vercel
    fi
    
    # 进入前端目录
    cd frontend
    
    # 创建生产环境配置
    echo "⚙️ 创建生产环境配置..."
    cat > .env.production << EOF
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_BASE_URL=https://your-backend-url.railway.app
EOF
    
    echo "📝 请编辑 frontend/.env.production 文件，设置正确的后端URL"
    read -p "按回车键继续部署..."
    
    # 部署到Vercel
    echo "🚀 部署到Vercel..."
    vercel --prod
    
    echo "✅ 前端部署完成！"
    echo "📋 下一步："
    echo "1. 在Vercel Dashboard中设置环境变量"
    echo "2. 更新CORS设置以允许前端域名"
}

deploy_vercel_railway() {
    echo "🚀 部署到Vercel + Railway..."
    
    # 部署前端
    deploy_frontend_only
    
    echo "📋 Railway后端部署步骤："
    echo "1. 访问 https://railway.app"
    echo "2. 连接GitHub仓库"
    echo "3. 选择backend目录"
    echo "4. 设置环境变量："
    echo "   - DJANGO_ENV=production"
    echo "   - SECRET_KEY=your-secret-key"
    echo "   - DB_NAME=railway"
    echo "   - DB_USER=postgres"
    echo "   - DB_PASSWORD=your-password"
    echo "   - DB_HOST=your-host"
    echo "   - DB_PORT=5432"
    echo "5. 部署完成后，更新前端环境变量中的API URL"
}

deploy_vercel_render() {
    echo "🚀 部署到Vercel + Render..."
    
    # 部署前端
    deploy_frontend_only
    
    echo "📋 Render后端部署步骤："
    echo "1. 访问 https://render.com"
    echo "2. 连接GitHub仓库"
    echo "3. 创建Web Service，选择backend目录"
    echo "4. 设置构建命令: pip install -r requirements.txt"
    echo "5. 设置启动命令: python manage.py runserver 0.0.0.0:\$PORT"
    echo "6. 设置环境变量（同Railway）"
    echo "7. 部署完成后，更新前端环境变量中的API URL"
}

deploy_vercel_heroku() {
    echo "🚀 部署到Vercel + Heroku..."
    
    # 检查是否安装了Heroku CLI
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI未安装，请先安装"
        echo "访问: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # 部署前端
    deploy_frontend_only
    
    echo "📋 Heroku后端部署步骤："
    echo "1. 登录Heroku: heroku login"
    echo "2. 创建应用: heroku create your-app-name"
    echo "3. 设置环境变量:"
    echo "   heroku config:set DJANGO_ENV=production"
    echo "   heroku config:set SECRET_KEY=your-secret-key"
    echo "4. 部署: git push heroku main"
    echo "5. 运行迁移: heroku run python manage.py migrate"
    echo "6. 创建超级用户: heroku run python manage.py createsuperuser"
}

deploy_backend_only() {
    echo "🐍 部署后端..."
    
    echo "请选择后端部署平台："
    echo "1) Railway"
    echo "2) Render" 
    echo "3) Heroku"
    
    read -p "请输入选择 (1-3): " backend_choice
    
    case $backend_choice in
        1)
            echo "📋 Railway部署步骤："
            echo "1. 访问 https://railway.app"
            echo "2. 连接GitHub仓库"
            echo "3. 选择backend目录"
            echo "4. 设置环境变量"
            ;;
        2)
            echo "📋 Render部署步骤："
            echo "1. 访问 https://render.com"
            echo "2. 连接GitHub仓库"
            echo "3. 创建Web Service"
            echo "4. 设置环境变量"
            ;;
        3)
            echo "📋 Heroku部署步骤："
            echo "1. heroku create your-app-name"
            echo "2. 设置环境变量"
            echo "3. git push heroku main"
            ;;
    esac
}

echo "🎉 部署指南完成！"
echo "📖 详细说明请查看 DEPLOYMENT.md 文件"

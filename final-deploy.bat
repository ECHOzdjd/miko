@echo off
echo ========================================
echo        最终部署完成脚本
echo ========================================

echo.
echo 项目状态：
echo - 后端: https://miko-backend-cl3w.onrender.com ✅
echo - 前端: https://miko-qvbo.vercel.app/ ✅
echo - 需要更新 CORS 配置
echo.

echo 1. 检查 Git 状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
set /p commit_msg="请输入提交消息 (默认: Final deployment - update CORS for production): "
if "%commit_msg%"=="" set commit_msg=Final deployment - update CORS for production
git commit -m "%commit_msg%"

echo.
echo 4. 推送到 GitHub...
git push origin main

echo.
echo ========================================
echo 最终部署完成！🎉
echo.
echo 项目信息：
echo - 后端 API: https://miko-backend-cl3w.onrender.com
echo - 前端应用: https://miko-qvbo.vercel.app/
echo - 管理后台: https://miko-backend-cl3w.onrender.com/admin/
echo.
echo 下一步：
echo 1. 在 Render 重新部署后端（应用 CORS 更新）
echo 2. 测试前端功能
echo 3. 创建管理员账户
echo 4. 开始使用应用！
echo ========================================

pause

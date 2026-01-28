@echo off
chcp 65001 >nul
color 0B
title EC退货率Dashboard - 一键部署到Vercel

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           EC退货率Dashboard - Vercel部署向导              ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo 📋 部署前检查清单...
echo ═══════════════════════════════════════════════════════════
echo.

:: 检查Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ 未检测到 Git
    echo.
    echo 请先安装 Git: https://git-scm.com/
    echo.
    pause
    exit /b
)
echo ✅ Git 已安装

:: 检查数据文件
if not exist "public\data\processed_data.json" (
    color 0E
    echo.
    echo ⚠️  警告: 数据文件未找到
    echo.
    echo 💡 Vercel不会自动运行Python脚本
    echo    必须先本地生成数据文件
    echo.
    choice /C YN /M "是否先运行数据处理脚本"
    if %errorlevel%==1 (
        echo.
        echo 📊 正在处理数据...
        if exist "scripts\convertData.py" (
            python scripts\convertData.py
            if %errorlevel% neq 0 (
                echo ❌ 数据处理失败
                pause
                exit /b
            )
        ) else (
            echo ❌ 未找到数据处理脚本
            pause
            exit /b
        )
    )
)

echo.
echo ═══════════════════════════════════════════════════════════
echo   第一步: 推送到 GitHub
echo ═══════════════════════════════════════════════════════════
echo.

:: 检查Git仓库
if not exist ".git" (
    echo 📝 初始化Git仓库...
    git init
    git branch -M main
    echo ✅ Git仓库已初始化
    echo.
)

:: 询问GitHub仓库地址
echo 请输入GitHub仓库地址:
echo 例如: https://github.com/username/ec-return-dashboard.git
echo.
set /p REPO_URL=仓库地址: 

if "%REPO_URL%"=="" (
    color 0C
    echo ❌ 未输入仓库地址
    pause
    exit /b
)

:: 配置远程仓库
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo 📌 添加远程仓库...
    git remote add origin %REPO_URL%
) else (
    echo 📌 更新远程仓库地址...
    git remote set-url origin %REPO_URL%
)

echo.
echo 📦 准备提交文件...
git add .

echo.
set /p COMMIT_MSG=提交信息（直接回车使用默认）: 
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=初始化EC退货率Dashboard项目
)

echo.
echo 💾 提交更改...
git commit -m "%COMMIT_MSG%"

echo.
echo 🚀 推送到GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    color 0E
    echo.
    echo ⚠️  推送失败
    echo.
    echo 💡 可能的原因：
    echo    1. 仓库尚未创建 - 请先在GitHub创建仓库
    echo    2. 需要身份验证 - 请配置Git凭据
    echo    3. 分支冲突 - 可能需要先pull
    echo.
    echo 🔧 解决方案：
    echo    1. 访问 GitHub.com 创建新仓库
    echo    2. 配置Git凭据: git config --global user.name "Your Name"
    echo    3. 使用GitHub Desktop或手动解决冲突
    echo.
    pause
    exit /b
)

echo.
echo ✅ 代码已成功推送到GitHub
echo.

echo ═══════════════════════════════════════════════════════════
echo   第二步: 部署到 Vercel
echo ═══════════════════════════════════════════════════════════
echo.
echo 📝 请按照以下步骤在Vercel上部署：
echo.
echo 1️⃣  访问 Vercel
echo    🌐 https://vercel.com
echo.
echo 2️⃣  登录账号
echo    使用 GitHub 账号登录
echo.
echo 3️⃣  导入项目
echo    • 点击 "New Project"
echo    • 点击 "Import Git Repository"
echo    • 选择您的仓库: %REPO_URL%
echo.
echo 4️⃣  配置项目
echo    • Framework Preset: Next.js (自动检测)
echo    • Root Directory: ./
echo    • Build Command: npm run build
echo    • Output Directory: .next
echo.
echo 5️⃣  开始部署
echo    • 点击 "Deploy"
echo    • 等待1-2分钟构建完成
echo.
echo 6️⃣  获取URL
echo    • 部署成功后获得生产环境URL
echo    • 格式: https://your-project.vercel.app
echo.
echo ═══════════════════════════════════════════════════════════
echo.

choice /C YN /M "是否现在打开Vercel网站"
if %errorlevel%==1 (
    start https://vercel.com
    echo.
    echo ✅ 已在浏览器中打开Vercel
)

echo.
echo ═══════════════════════════════════════════════════════════
echo   部署完成后的验证
echo ═══════════════════════════════════════════════════════════
echo.
echo ✅ 检查清单:
echo    □ 页面能正常访问
echo    □ 数据正确显示
echo    □ 渠道卡片正常展示
echo    □ 详情页能正常跳转
echo    □ 响应式布局正常
echo.
echo 💡 后续维护:
echo    • 数据更新: 运行"📊处理数据.bat"后重新push
echo    • 代码更新: git push后Vercel自动重新部署
echo    • 自定义域名: 在Vercel项目设置中配置
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo 🎉 部署向导完成！
echo.
echo 📞 需要帮助？查看 DEPLOYMENT.md 获取详细说明
echo.

pause

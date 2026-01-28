@echo off
chcp 65001 >nul
title 上传Dashboard到GitHub并发布到Vercel

echo.
echo ════════════════════════════════════════════════════════════
echo    🚀 EC OR Return Dashboard - 发布到GitHub和Vercel
echo ════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 1/5：检查Git是否已初始化
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if not exist ".git" (
    echo ✅ 初始化Git仓库...
    git init
    if errorlevel 1 (
        echo ❌ Git初始化失败！请确保已安装Git
        pause
        exit /b 1
    )
) else (
    echo ✅ Git仓库已存在
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 2/5：提交所有更改
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 📊 当前Git状态：
git status

echo.
echo ➕ 添加所有文件...
git add .

echo.
echo 💾 创建提交...
git commit -m "feat: EC OR Return Dashboard - 完整版本

✨ 功能特性
- 渠道分析（5个渠道：DY、JD、TM、VIP、WeChat）
- 品牌概览（MLB、MLB KIDS、Discovery）
- 4级风险分类（高风险、风险、观察、正常）
- 新开店铺识别
- YOY数据对比分析
- 响应式设计

🎨 设计亮点
- 渠道色卡区分
- 统一布局对齐
- 详细数据展示
- 交互式模态框

📊 数据处理
- Node.js数据处理
- CSV自动导入
- 实时计算分析"

if errorlevel 1 (
    echo.
    echo ⚠️  没有新的更改需要提交，或提交失败
    echo 继续下一步...
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 3/5：创建GitHub仓库并推送
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 📝 请输入GitHub仓库名称（默认：ec-return-dashboard）：
set /p REPO_NAME="仓库名称 > "
if "%REPO_NAME%"=="" set REPO_NAME=ec-return-dashboard

echo.
echo 🔐 检查GitHub CLI是否已安装...
where gh >nul 2>nul
if errorlevel 1 (
    echo.
    echo ❌ GitHub CLI (gh) 未安装！
    echo.
    echo 请选择以下方式之一：
    echo.
    echo 方式1：安装GitHub CLI（推荐）
    echo   1. 访问：https://cli.github.com/
    echo   2. 下载并安装 GitHub CLI
    echo   3. 运行：gh auth login
    echo   4. 重新运行本脚本
    echo.
    echo 方式2：手动创建仓库
    echo   1. 访问：https://github.com/new
    echo   2. 创建名为 %REPO_NAME% 的新仓库
    echo   3. 不要初始化README、.gitignore或license
    echo   4. 记下仓库URL
    echo.
    set /p MANUAL="是否手动创建了仓库？(y/n) > "
    if /i "%MANUAL%"=="y" (
        echo.
        echo 请输入您的GitHub用户名：
        set /p GITHUB_USER="用户名 > "
        echo.
        echo 添加远程仓库...
        git remote remove origin 2>nul
        git remote add origin https://github.com/!GITHUB_USER!/%REPO_NAME%.git
        git branch -M main
        echo.
        echo 🚀 推送到GitHub...
        git push -u origin main
        if errorlevel 1 (
            echo.
            echo ❌ 推送失败！请检查：
            echo   1. GitHub用户名是否正确
            echo   2. 仓库是否已创建
            echo   3. 是否有推送权限
            pause
            exit /b 1
        )
    ) else (
        echo.
        echo 请先安装GitHub CLI或手动创建仓库，然后重新运行本脚本
        pause
        exit /b 1
    )
) else (
    echo ✅ GitHub CLI 已安装
    echo.
    echo 🔐 检查GitHub登录状态...
    gh auth status >nul 2>nul
    if errorlevel 1 (
        echo ❌ 未登录GitHub，正在启动登录流程...
        gh auth login
        if errorlevel 1 (
            echo ❌ 登录失败！
            pause
            exit /b 1
        )
    ) else (
        echo ✅ 已登录GitHub
    )
    
    echo.
    echo 🏗️  创建GitHub仓库...
    gh repo create %REPO_NAME% --public --source=. --remote=origin --push
    if errorlevel 1 (
        echo.
        echo ⚠️  仓库创建失败或已存在，尝试推送到现有仓库...
        git branch -M main
        git push -u origin main
        if errorlevel 1 (
            echo ❌ 推送失败！
            pause
            exit /b 1
        )
    )
)

echo.
echo ✅ 代码已成功推送到GitHub！

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 4/5：部署到Vercel
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 🔐 检查Vercel CLI是否已安装...
where vercel >nul 2>nul
if errorlevel 1 (
    echo.
    echo ❌ Vercel CLI 未安装！
    echo.
    echo 正在安装Vercel CLI...
    call npm install -g vercel
    if errorlevel 1 (
        echo ❌ 安装失败！
        echo.
        echo 请手动部署到Vercel：
        echo   1. 访问：https://vercel.com/new
        echo   2. 选择"Import Git Repository"
        echo   3. 导入刚才创建的GitHub仓库
        echo   4. 项目配置：
        echo      - Framework Preset: Next.js
        echo      - Build Command: npm run build
        echo      - Output Directory: .next
        echo   5. 点击Deploy
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI 已就绪
echo.
echo 🔐 检查Vercel登录状态...
vercel whoami >nul 2>nul
if errorlevel 1 (
    echo ❌ 未登录Vercel，正在启动登录流程...
    vercel login
    if errorlevel 1 (
        echo ❌ 登录失败！
        pause
        exit /b 1
    )
)

echo.
echo 🚀 部署到Vercel（生产环境）...
echo.
echo 注意：即将开始部署，请按照提示操作
echo   - 项目名称：可以使用默认或自定义
echo   - 选择账户：选择您的Vercel账户
echo   - 链接到现有项目：选择 N（新项目）
echo.
pause

vercel --prod

if errorlevel 1 (
    echo.
    echo ❌ 部署失败！请检查错误信息
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 5/5：完成
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo ════════════════════════════════════════════════════════════
echo   🎉 部署完成！
echo ════════════════════════════════════════════════════════════
echo.
echo ✅ GitHub仓库：https://github.com/%GITHUB_USER%/%REPO_NAME%
echo ✅ Vercel已部署（URL将显示在上方）
echo.
echo 📋 后续步骤：
echo   1. 访问Vercel提供的URL查看在线Dashboard
echo   2. 在Vercel控制台配置自定义域名（可选）
echo   3. 每次推送到main分支会自动重新部署
echo.
echo 🔄 更新数据和代码：
echo   1. 更新数据：运行"处理数据-Node版.bat"
echo   2. 提交更改：git add . && git commit -m "update: 更新数据"
echo   3. 推送代码：git push
echo   4. Vercel会自动重新部署
echo.
echo ════════════════════════════════════════════════════════════

echo.
pause

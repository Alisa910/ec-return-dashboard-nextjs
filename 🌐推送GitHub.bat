@echo off
chcp 65001 >nul
title 推送到GitHub - EC退货率Dashboard

echo ========================================
echo    推送项目到GitHub
echo ========================================
echo.

:: 检查Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Git
    echo.
    echo 请先安装 Git
    echo 下载地址: https://git-scm.com/
    pause
    exit /b
)

echo ✅ Git 已安装
git --version
echo.

:: 检查是否已初始化Git仓库
if not exist ".git" (
    echo 📝 初始化Git仓库...
    git init
    git branch -M main
    echo.
)

:: 获取GitHub仓库地址
echo 请输入您的GitHub仓库地址 (例如: https://github.com/username/ec-dashboard.git)
set /p REPO_URL=仓库地址: 

if "%REPO_URL%"=="" (
    echo ❌ 未输入仓库地址
    pause
    exit /b
)

:: 检查remote是否已存在
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo 📌 添加远程仓库...
    git remote add origin %REPO_URL%
) else (
    echo 📌 更新远程仓库地址...
    git remote set-url origin %REPO_URL%
)

echo.
echo ========================================
echo    准备提交代码...
echo ========================================
echo.

:: 添加所有文件
echo 📦 添加文件...
git add .

:: 提交
echo.
set /p COMMIT_MSG=提交信息 (直接回车使用默认): 

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=更新EC退货率Dashboard
)

echo.
echo 💾 提交更改...
git commit -m "%COMMIT_MSG%"

:: 推送
echo.
echo 🚀 推送到GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  推送失败，可能需要身份验证
    echo.
    echo 💡 如果是第一次推送，请确保：
    echo    1. GitHub仓库已创建
    echo    2. 已配置Git凭据
    echo    3. 有仓库写入权限
    echo.
    pause
    exit /b
)

echo.
echo ========================================
echo    ✅ 推送成功！
echo ========================================
echo.
echo 🌐 GitHub仓库: %REPO_URL%
echo.
echo 💡 下一步：部署到Vercel
echo    1. 访问 https://vercel.com
echo    2. 导入您的GitHub仓库
echo    3. Vercel会自动检测Next.js项目并部署
echo.

pause

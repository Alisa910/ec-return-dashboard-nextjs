@echo off
chcp 65001 >nul
title 自动修复并推送到GitHub

echo.
echo ════════════════════════════════════════════════════════════
echo    🔧 自动修复404错误 - 提交并推送数据文件
echo ════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 1/5：检查Git状态
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 📊 当前未提交的文件：
git status --short

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 2/5：添加所有更改
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo ➕ 添加所有文件...
git add .

if errorlevel 1 (
    echo ❌ 添加文件失败！
    pause
    exit /b 1
)

echo ✅ 文件添加成功

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 3/5：提交更改
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 💾 创建提交...
git commit -m "fix: 添加缺失的数据文件和配置

- 添加 public/data/processed_data.json
- 修复404错误
- 确保所有必需文件已包含"

if errorlevel 1 (
    echo.
    echo ⚠️  没有新的更改需要提交，或提交失败
    echo 继续推送现有提交...
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 4/5：推送到GitHub
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 🚀 推送到GitHub...
git push

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！可能的原因：
    echo   1. 网络问题
    echo   2. 认证问题
    echo   3. 分支已是最新
    echo.
    echo 💡 尝试在GitHub Desktop中推送
    pause
    exit /b 1
)

echo ✅ 推送成功！

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 步骤 5/5：等待Vercel重新部署
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo ════════════════════════════════════════════════════════════
echo   ✅ 代码已推送到GitHub！
echo ════════════════════════════════════════════════════════════
echo.
echo 📋 接下来会发生什么：
echo.
echo   1. Vercel会自动检测到GitHub更新
echo   2. 自动触发重新部署（约1-2分钟）
echo   3. 部署完成后，404错误应该就修复了
echo.
echo 🔍 查看部署状态：
echo   https://vercel.com/dashboard
echo.
echo ⏱️  等待时间：约1-2分钟
echo.
echo 💡 部署完成后：
echo   1. 访问您的Dashboard URL
echo   2. 按 Ctrl + F5 强制刷新
echo   3. 应该能看到正常页面了！
echo.
echo ════════════════════════════════════════════════════════════

echo.
echo 📊 当前Git状态：
git status

echo.
echo 🎉 操作完成！正在等待Vercel重新部署...
echo.
pause

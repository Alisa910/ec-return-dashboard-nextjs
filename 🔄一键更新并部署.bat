@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo    🔄 一键更新数据并自动部署到Vercel
echo ════════════════════════════════════════════════════════════
echo.

:: ==================== 第1步：检查数据文件 ====================
echo 📋 第1步：检查数据文件...
if not exist "D:\HQ文件夹\data\EC退货率\EC退货率变化.csv" (
    echo.
    echo ❌ 错误：找不到数据文件！
    echo.
    echo 📂 请确保文件存在：
    echo    D:\HQ文件夹\data\EC退货率\EC退货率变化.csv
    echo.
    pause
    exit /b 1
)
echo ✅ 数据文件检查通过！
echo.

:: ==================== 第2步：处理数据 ====================
echo 📊 第2步：处理数据，生成JSON...
node scripts\processDataNode.js

if errorlevel 1 (
    echo.
    echo ❌ 数据处理失败！
    echo.
    pause
    exit /b 1
)
echo ✅ 数据处理完成！
echo.

:: ==================== 第3步：检查Git状态 ====================
echo 🔍 第3步：检查更改...
git status --short

if errorlevel 1 (
    echo.
    echo ⚠️ Git未初始化或Git命令不可用
    echo.
    echo 📌 请使用GitHub Desktop手动提交：
    echo    1. 打开GitHub Desktop
    echo    2. 提交更改：'update: 更新数据'
    echo    3. 点击Push
    echo.
    pause
    exit /b 0
)

:: ==================== 第4步：提交到GitHub ====================
echo.
echo 💾 第4步：提交更改到GitHub...

git add public/data/processed_data.json

git commit -m "update: 更新数据 - %date% %time:~0,5%

- 自动处理最新CSV数据
- 更新Dashboard显示内容
- 自动触发Vercel部署"

if errorlevel 1 (
    echo.
    echo ⚠️ 没有新的更改需要提交，或提交失败
    echo.
    echo 💡 可能的原因：
    echo    1. 数据文件没有变化
    echo    2. Git配置问题
    echo.
    echo 📌 您可以：
    echo    - 检查CSV文件是否有更新
    echo    - 使用GitHub Desktop手动提交
    echo.
    pause
    exit /b 0
)

echo.
echo 🚀 第5步：推送到GitHub...
git push

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 📌 请使用GitHub Desktop：
    echo    1. 打开GitHub Desktop
    echo    2. 点击右上角 "Push origin"
    echo.
    pause
    exit /b 1
)

:: ==================== 完成 ====================
echo.
echo ════════════════════════════════════════════════════════════
echo    ✅ 全部完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 📊 数据已更新
echo 💾 已提交到GitHub
echo 🚀 已推送到远程仓库
echo.
echo ⏱️ Vercel会在1-2分钟内自动重新部署
echo.
echo 🔍 查看部署状态：https://vercel.com/dashboard
echo.
echo 🌐 访问您的Dashboard：
echo    https://ec-return-dashboard-nextjs.vercel.app
echo.
pause

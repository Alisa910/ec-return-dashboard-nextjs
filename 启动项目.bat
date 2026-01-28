@echo off
chcp 65001 >nul
echo ========================================
echo   EC退货率分析Dashboard - Next.js版
echo ========================================
echo.

REM 检查是否已安装依赖
if not exist "node_modules\" (
    echo [步骤 1/2] 首次运行，正在安装依赖...
    echo 这可能需要几分钟...
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败！
        echo 请检查是否已安装 Node.js
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成！
    echo.
)

echo [步骤 2/2] 启动开发服务器...
echo.
echo 🌐 访问地址: http://localhost:3000
echo.
echo 💡 提示:
echo    - 修改代码后会自动刷新
echo    - 按 Ctrl+C 停止服务器
echo.
echo ========================================

npm run dev

if errorlevel 1 (
    echo.
    echo [错误] 服务器启动失败！
    pause
)

@echo off
title EC退货率Dashboard - Next.js
color 0A
cls

echo.
echo ==========================================
echo    EC退货率Dashboard - Next.js版
echo ==========================================
echo.
echo [检查] 正在检查环境...
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请先安装 Node.js:
    echo https://nodejs.org/
    echo.
    echo 推荐版本: Node.js 18.x 或更高
    echo.
    pause
    exit /b 1
)

node --version
npm --version
echo.

REM 检查是否需要安装依赖
if not exist "node_modules\" (
    echo [步骤 1/2] 首次运行，正在安装依赖...
    echo.
    echo 这可能需要 3-5 分钟，请耐心等待...
    echo 不要关闭此窗口！
    echo.
    echo ==========================================
    echo.
    
    call npm install
    
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [错误] 依赖安装失败！
        echo.
        echo 可能的解决方案：
        echo 1. 使用淘宝镜像：npm config set registry https://registry.npmmirror.com
        echo 2. 清除缓存：npm cache clean --force
        echo 3. 删除 node_modules 文件夹后重试
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ==========================================
    echo [成功] 依赖安装完成！
    echo ==========================================
    echo.
) else (
    echo [跳过] 依赖已安装
    echo.
)

echo [步骤 2/2] 正在启动开发服务器...
echo.
echo ==========================================
echo.
echo  访问地址: http://localhost:3000
echo.
echo  提示:
echo    - 浏览器将自动打开
echo    - 修改代码后会自动刷新
echo    - 按 Ctrl+C 停止服务器
echo.
echo ==========================================
echo.

start http://localhost:3000

call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [错误] 服务器启动失败！
    echo.
    pause
)

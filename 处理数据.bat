@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo    📊 处理CSV数据生成JSON
echo ════════════════════════════════════════════════════════════
echo.

:: 检查数据文件
echo 🔍 检查数据文件...
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
echo ✅ 数据文件找到！
echo.

:: 处理数据
echo 📊 正在处理数据...
node scripts\processDataNode.js

if errorlevel 1 (
    echo.
    echo ❌ 数据处理失败！
    echo.
    echo 💡 可能的原因：
    echo    1. CSV格式不正确
    echo    2. 数据字段缺失
    echo    3. Node.js未安装
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo    ✅ 数据处理完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 📁 输出文件：
echo    public\data\processed_data.json
echo.
echo 🎯 下一步：
echo    1. 运行 npm run dev 查看本地效果
echo    2. 或运行 🔄一键更新并部署.bat 自动上传到Vercel
echo.
pause

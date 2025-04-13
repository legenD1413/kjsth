@echo off
chcp 65001
echo ======================================================
echo       文件检查与转换工具
echo ======================================================
echo.
echo 此工具将:
echo 1. 检测新的或更新的新闻Markdown文件
echo 2. 将新闻Markdown文件转换为HTML
echo 3. 自动更新相关索引页面
echo 4. 根据区域将文件分类到适当的目录
echo.
echo 开始处理...
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0file-check-utf8.ps1" -Verbose

echo.
echo 所有处理完成!
echo.
pause 
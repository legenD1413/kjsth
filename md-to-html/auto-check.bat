@echo off
chcp 65001 >nul
echo ======================================================
echo       Markdown Auto Detect, Convert and Index Update Tool
echo ======================================================
echo.
echo This tool will:
echo 1. Detect new or updated Markdown files
echo 2. Convert Markdown files to HTML
echo 3. Automatically update related index pages
echo 4. Sort files into appropriate directories based on categories and regions
echo.
echo Starting process...
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0file-check-fixed.ps1" -Verbose
echo.
echo 继续处理指南文件...
echo.
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0guide-check-fixed.ps1" -Verbose

echo.
echo 所有处理完成!
echo.
pause 
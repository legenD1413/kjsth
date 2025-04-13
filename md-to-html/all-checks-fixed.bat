@echo off
chcp 65001
setlocal

echo ====================================================
echo 开始检查并转换所有Markdown文件
echo ====================================================

echo.
echo 正在检查新闻Markdown文件...
powershell -ExecutionPolicy Bypass -File "%~dp0file-check-fixed.ps1" -Verbose

echo.
echo 正在检查指南Markdown文件...
powershell -ExecutionPolicy Bypass -File "%~dp0guide-check-fixed.ps1" -Verbose

echo.
echo 所有Markdown文件检查并转换完成!
echo ====================================================
echo 请注意，新闻文件会根据region字段存入对应区域的目录中，
echo 指南文件会根据category或categories字段存入对应分类的目录中。
echo ====================================================

pause 
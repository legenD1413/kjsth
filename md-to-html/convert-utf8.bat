@echo off
chcp 65001 > nul
echo ======================================================
echo       Markdown自动检测、转换及索引更新工具
echo ======================================================
echo.
echo 该工具将：
echo 1. 检测新的或已更新的Markdown文件
echo 2. 将Markdown文件转换为HTML
echo 3. 自动更新相关的索引页面
echo.
echo 开始处理...
echo.

powershell -ExecutionPolicy Bypass -Command "& {[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '%~dp0file-check.ps1'}" 
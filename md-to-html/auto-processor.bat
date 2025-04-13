@echo off
setlocal enabledelayedexpansion

REM 设置UTF-8编码
chcp 65001 > nul
echo 正在启动自动Markdown处理工具...

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未检测到Node.js。请先安装Node.js后再运行此脚本。
    exit /b 1
)

REM 检查是否安装了所需的依赖
echo 正在检查必要的依赖...
call npm list glob fs-extra cheerio marked moment >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 正在安装缺少的依赖...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo 错误: 依赖安装失败。请检查网络连接或手动运行 npm install。
        exit /b 1
    )
)

echo 开始处理...

REM 检查命令行参数
if "%1"=="news" (
    echo 自动处理新闻文件...
    node auto-news-processor.js
    goto end
) else if "%1"=="guides" (
    echo 自动处理指南文件...
    node auto-guides-processor.js
    goto end
) else if "%1"=="all" (
    echo 自动处理所有文件...
    node auto-news-processor.js
    node auto-guides-processor.js
    goto end
)

REM 如果没有命令行参数，则提供交互式选择
set /p choice=处理选项 [1=新闻, 2=指南, 3=全部, q=退出]: 

if "%choice%"=="1" (
    echo 处理新闻文件...
    node auto-news-processor.js
) else if "%choice%"=="2" (
    echo 处理指南文件...
    node auto-guides-processor.js
) else if "%choice%"=="3" (
    echo 处理所有文件...
    node auto-news-processor.js
    node auto-guides-processor.js
) else if /i "%choice%"=="q" (
    echo 操作已取消。
    exit /b 0
) else (
    echo 无效的选择，请输入1、2、3或q。
    exit /b 1
)

:end
echo 处理完成！

if "%2"=="nopause" (
    exit /b 0
) else (
    pause
) 
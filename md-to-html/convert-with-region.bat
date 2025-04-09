@echo off
REM 转换新闻Markdown文件到指定地区目录的批处理文件
REM 用法: convert-with-region.bat <markdown-file> <region>

if "%~1"=="" (
    echo 用法: convert-with-region.bat ^<markdown-file^> ^<region^>
    exit /b 1
)

set MD_FILE=%~1
set REGION=%~2

if "%REGION%"=="" (
    set REGION=global
)

echo 转换文件: %MD_FILE%
echo 目标地区: %REGION%

powershell -ExecutionPolicy Bypass -File "%~dp0simple-convert-news.ps1" "%MD_FILE%" "%REGION%"

if %ERRORLEVEL% NEQ 0 (
    echo 转换失败!
    exit /b 1
)

echo 转换成功完成!
echo.
echo 按任意键退出...
pause > nul 
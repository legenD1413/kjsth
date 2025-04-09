@echo off
REM 转换Markdown文件到指定分类目录的批处理文件
REM 用法: convert-with-category.bat <markdown-file> <category>

if "%~1"=="" (
    echo 用法: convert-with-category.bat ^<markdown-file^> ^<category^>
    exit /b 1
)

set MD_FILE=%~1
set CATEGORY=%~2

if "%CATEGORY%"=="" (
    set CATEGORY=fba
)

echo 转换文件: %MD_FILE%
echo 目标分类: %CATEGORY%

powershell -ExecutionPolicy Bypass -File "%~dp0simple-convert.ps1" "%MD_FILE%" "%CATEGORY%"

if %ERRORLEVEL% NEQ 0 (
    echo 转换失败!
    exit /b 1
)

echo 转换成功完成!
echo.
echo 按任意键退出...
pause > nul 
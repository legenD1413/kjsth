@echo off
setlocal enabledelayedexpansion

REM 设置UTF-8编码
chcp 65001 > nul
echo 单个Markdown文件转换测试工具

if "%~1"=="" (
    echo 使用方法: test-convert.bat [markdown文件路径] [模板类型(news/guide)]
    echo 例如: test-convert.bat ..\guides-md\guide-template.md guide
    exit /b 1
)

set input_file=%~1
set template_type=%~2

if "%template_type%"=="" (
    set template_type=guide
)

REM 验证输入文件是否存在
if not exist "%input_file%" (
    echo 错误: 找不到输入文件 "%input_file%"
    exit /b 1
)

REM 确定输出文件名
set datetime=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set datetime=%datetime: =0%
set random_num=%random%

if /i "%template_type%"=="news" (
    set output_file=..\static-news\north-america\news_%datetime%_%random_num%.html
) else (
    set output_file=..\tools-guides\warehouse\guide_%datetime%_%random_num%.html
)

echo 输入文件: %input_file%
echo 输出文件: %output_file%
echo 模板类型: %template_type%
echo.

REM 调用Node.js脚本进行转换
echo 正在转换...
node md-convert.js "%input_file%" "%output_file%" "%template_type%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo 转换成功！
    echo 输出文件: %output_file%
    
    REM 询问是否在浏览器中打开生成的HTML文件
    set /p open_browser=是否在浏览器中打开生成的HTML文件？(y/n): 
    if /i "%open_browser%"=="y" (
        start "" "%output_file%"
    )
) else (
    echo.
    echo 转换失败！请检查错误信息。
)

pause 
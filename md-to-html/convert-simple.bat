@echo off
chcp 65001
setlocal EnableDelayedExpansion

echo ====================================================
echo 简易Markdown文件转换工具
echo ====================================================

REM 设置目录路径
set NEWS_MD_DIR=..\news-md
set NEWS_HTML_DIR=..\static-news\north-america
set GUIDES_MD_DIR=..\guides-md
set GUIDES_HTML_DIR=..\tools-guides\shipping
set TOOLS_HTML_DIR=..\tools

REM 确保输出目录存在
if not exist "%NEWS_HTML_DIR%" mkdir "%NEWS_HTML_DIR%"
if not exist "%GUIDES_HTML_DIR%" mkdir "%GUIDES_HTML_DIR%"

echo.
echo 处理新闻文件...
echo.

REM 处理新闻Markdown文件
for %%f in ("%NEWS_MD_DIR%\*.md") do (
    if not "%%~nf"=="news-template" (
        echo 处理: %%f
        
        REM 生成输出文件名
        set "datetime=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
        set "datetime=!datetime: =0!"
        set "random_num=%random%"
        set "output_file=%NEWS_HTML_DIR%\news_!datetime!_!random_num!.html"
        
        REM 调用Node.js脚本进行转换
        node md-convert.js "%%f" "!output_file!"
    )
)

echo.
echo 处理指南文件...
echo.

REM 处理指南Markdown文件
for %%f in ("%GUIDES_MD_DIR%\*.md") do (
    if not "%%~nf"=="guide-template" (
        echo 处理: %%f
        
        REM 生成输出文件名
        set "datetime=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
        set "datetime=!datetime: =0!"
        set "random_num=%random%"
        set "guide_output_file=%GUIDES_HTML_DIR%\guide_!datetime!_!random_num!.html"
        set "tool_output_file=%TOOLS_HTML_DIR%\tool_!datetime!_!random_num!.html"
        
        REM 调用Node.js脚本进行转换
        node md-convert.js "%%f" "!guide_output_file!" "!tool_output_file!"
    )
)

echo.
echo 更新索引页面...
echo.

REM 更新索引页面
node update-lists.js news north-america
node update-lists.js guide shipping
node update-lists.js tool

echo.
echo 所有处理完成!
echo.

pause 
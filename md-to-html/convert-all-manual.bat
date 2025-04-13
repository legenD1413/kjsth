@echo off
chcp 65001
setlocal EnableDelayedExpansion

echo ====================================================
echo 手动处理所有Markdown文件
echo ====================================================

echo.
echo 处理新闻文件...
echo.

:: 处理news-md目录中的文件
for %%f in (..\news-md\*.md) do (
    if not "%%~nf"=="news-template" (
        echo 处理: %%f
        
        :: 提取region信息，默认为global
        set "region=north-america"
        
        :: 确保目录存在
        if not exist "..\static-news\!region!" mkdir "..\static-news\!region!"
        
        :: 生成输出文件名
        set "datetime=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
        set "datetime=!datetime: =0!"
        set "random_num=%random%"
        
        :: 调用Node.js脚本进行转换
        node md-convert.js "%%f" "..\static-news\!region!\news_!datetime!_!random_num!.html"
    )
)

echo.
echo 处理指南文件...
echo.

:: 处理guides-md目录中的文件
for %%f in (..\guides-md\*.md) do (
    if not "%%~nf"=="guide-template" (
        echo 处理: %%f
        
        :: 提取category信息，默认为general
        set "category=shipping"
        
        :: 确保目录存在
        if not exist "..\tools-guides\!category!" mkdir "..\tools-guides\!category!"
        
        :: 生成输出文件名
        set "datetime=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
        set "datetime=!datetime: =0!"
        set "random_num=%random%"
        
        :: 调用Node.js脚本进行转换
        node md-convert.js "%%f" "..\tools-guides\!category!\guide_!datetime!_!random_num!.html"
    )
)

echo.
echo 更新索引...
echo.

:: 更新区域索引
node update-lists.js news north-america

:: 更新分类索引
node update-lists.js guide shipping

echo.
echo 处理完成!
echo.

pause 
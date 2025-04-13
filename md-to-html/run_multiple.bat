@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo 开始处理所有Markdown文件...
echo.

:: 设置输出目录
set "output_dir=..\static-news\north-america"
if not exist "%output_dir%" mkdir "%output_dir%"

:: 获取当前时间作为随机标识
set "timestamp=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
set "timestamp=%timestamp: =0%"

:: 处理新闻文件
echo 处理新闻文件: 发往加拿大的超大超重商业货物？海运专线全程操作指南 (电商卖家必看).md
node md-convert.js "..\news-md\发往加拿大的超大超重商业货物？海运专线全程操作指南 (电商卖家必看).md" "%output_dir%\news_1_%timestamp%.html"

echo.
echo 更新新闻索引...
node .\update-lists.js news north-america
echo.

:: 设置指南输出目录
set "guide_output_dir=..\tools-guides\shipping"
if not exist "%guide_output_dir%" mkdir "%guide_output_dir%"

:: 处理指南文件
echo 处理指南文件: 如何应对加拿大FBA海运途中的常见风险？.md
node md-convert.js "..\guides-md\如何应对加拿大FBA海运途中的常见风险？.md" "%guide_output_dir%\guide_1_%timestamp%.html"

echo.
echo 更新指南索引...
node .\update-lists.js guide shipping
echo.

echo 所有处理完成!
echo.
pause 
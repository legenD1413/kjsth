@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo 处理单个示例文件...

:: 设置区域
set "region=north-america"

:: 确保目录存在
if not exist "..\static-news\%region%" mkdir "..\static-news\%region%"

:: 获取当前时间
set "datetime=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
:: 去除时间中可能的空格
set "datetime=%datetime: =0%"
set "random_num=%random%"

:: 设置输出文件路径
set "output_file=..\static-news\%region%\news_test_%random_num%.html"

:: 处理单个文件
echo 正在生成文件: %output_file%
node md-convert.js "..\news-md\发往加拿大的超大超重商业货物？海运专线全程操作指南 (电商卖家必看).md" "%output_file%"

echo 完成!
pause 
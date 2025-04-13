@echo off
setlocal enabledelayedexpansion

REM 设置UTF-8编码
chcp 65001 > nul
echo 创建测试文件...

REM 确保目录存在
if not exist "..\news-md\temp" mkdir "..\news-md\temp"
if not exist "..\guides-md\temp" mkdir "..\guides-md\temp"

REM 复制示例新闻文件
copy "..\news-md\news-template.md" "..\news-md\temp\测试新闻_%time:~0,2%%time:~3,2%%time:~6,2%.md" /Y
echo 新闻测试文件已创建

REM 复制示例指南文件
copy "..\guides-md\guide-template.md" "..\guides-md\temp\测试指南_%time:~0,2%%time:~3,2%%time:~6,2%.md" /Y
echo 指南测试文件已创建

echo 运行自动处理...
call auto-all.bat

echo 测试完成！
pause 
@echo off
setlocal enabledelayedexpansion

REM 设置UTF-8编码
chcp 65001 > nul
echo 正在启动Markdown处理工具...

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未检测到Node.js。请先安装Node.js后再运行此脚本。
    exit /b 1
)

REM 检查必要的npm包
call :check_package marked
call :check_package fs-extra
call :check_package cheerio
call :check_package moment

REM 确保目录存在
echo 正在检查目录结构...
call :ensure_directory "..\static-news\north-america"
call :ensure_directory "..\static-news\europe"
call :ensure_directory "..\static-news\southeast-asia"
call :ensure_directory "..\static-news\oceania"

call :ensure_directory "..\tools-guides\regulations"
call :ensure_directory "..\tools-guides\customs"
call :ensure_directory "..\tools-guides\shipping"
call :ensure_directory "..\tools-guides\packaging"
call :ensure_directory "..\tools-guides\fba"
call :ensure_directory "..\tools-guides\logistics"
call :ensure_directory "..\tools-guides\calculator"
call :ensure_directory "..\tools-guides\declaration"
call :ensure_directory "..\tools-guides\tax"
call :ensure_directory "..\tools-guides\insurance"
call :ensure_directory "..\tools-guides\tracking"
call :ensure_directory "..\tools-guides\returns"
call :ensure_directory "..\tools-guides\international"
call :ensure_directory "..\tools-guides\express"
call :ensure_directory "..\tools-guides\commercial"
call :ensure_directory "..\tools-guides\biggoods"
call :ensure_directory "..\tools-guides\warehouse"

REM 初始化计数器
set news_processed=0
set news_success=0
set guides_processed=0
set guides_success=0

REM 处理新闻Markdown文件
echo 开始处理新闻Markdown文件...
for %%f in (..\news-md\*.md) do (
    set /a news_processed+=1
    echo 正在处理: %%f
    
    REM 提取区域信息
    set region=north-america
    for /f "tokens=*" %%r in ('node -e "const fs=require('fs');const content=fs.readFileSync('%%f','utf8');const match=content.match(/region\s*:\s*([^\r\n]+)/);console.log(match ? match[1].trim() : 'north-america');"') do (
        set region_raw=%%r
    )
    
    REM 映射中文区域名称到英文目录名
    if "!region_raw!"=="北美" set region=north-america
    if "!region_raw!"=="欧洲" set region=europe
    if "!region_raw!"=="东南亚" set region=southeast-asia
    if "!region_raw!"=="大洋洲" set region=oceania
    
    REM 生成输出文件名
    set datetime=!date:~0,4!!date:~5,2!!date:~8,2!_!time:~0,2!!time:~3,2!!time:~6,2!
    set datetime=!datetime: =0!
    set random_num=!random!
    set output_file=..\static-news\!region!\news_!datetime!_!random_num!.html
    
    REM 使用Node.js脚本转换Markdown到HTML
    node md-convert.js "%%f" "!output_file!" news
    
    if !ERRORLEVEL! equ 0 (
        echo 成功: %%f 已转换为 !output_file!
        set /a news_success+=1
    ) else (
        echo 失败: %%f 转换失败
    )
)

REM 处理指南Markdown文件
echo 开始处理指南Markdown文件...
for %%f in (..\guides-md\*.md) do (
    set /a guides_processed+=1
    echo 正在处理: %%f
    
    REM 提取分类信息
    set category=regulations
    for /f "tokens=*" %%c in ('node -e "const fs=require('fs');const content=fs.readFileSync('%%f','utf8');const match=content.match(/category\s*:\s*([^\r\n]+)/);console.log(match ? match[1].trim() : 'regulations');"') do (
        set category_raw=%%c
    )
    
    REM 映射中文分类名称到英文目录名
    if "!category_raw!"=="监管法规" set category=regulations
    if "!category_raw!"=="海关指南" set category=customs
    if "!category_raw!"=="运输指南" set category=shipping
    if "!category_raw!"=="包装指南" set category=packaging
    if "!category_raw!"=="亚马逊FBA" set category=fba
    if "!category_raw!"=="物流基础知识" set category=logistics
    if "!category_raw!"=="实用工具使用指南" set category=calculator
    if "!category_raw!"=="报关指南" set category=declaration
    if "!category_raw!"=="税务指南" set category=tax
    if "!category_raw!"=="保险指南" set category=insurance
    if "!category_raw!"=="物流跟踪" set category=tracking
    if "!category_raw!"=="退货处理" set category=returns
    if "!category_raw!"=="国际物流" set category=international
    if "!category_raw!"=="快递服务" set category=express
    if "!category_raw!"=="商业件运输" set category=commercial
    if "!category_raw!"=="超大件运输" set category=biggoods
    if "!category_raw!"=="海外仓" set category=warehouse
    
    REM 生成输出文件名
    set datetime=!date:~0,4!!date:~5,2!!date:~8,2!_!time:~0,2!!time:~3,2!!time:~6,2!
    set datetime=!datetime: =0!
    set random_num=!random!
    set output_file=..\tools-guides\!category!\guide_!datetime!_!random_num!.html
    
    REM 使用Node.js脚本转换Markdown到HTML
    node md-convert.js "%%f" "!output_file!" guide
    
    if !ERRORLEVEL! equ 0 (
        echo 成功: %%f 已转换为 !output_file!
        set /a guides_success+=1
    ) else (
        echo 失败: %%f 转换失败
    )
)

REM 如果有文件被成功处理，更新索引
if !news_success! gtr 0 (
    echo 正在更新新闻索引...
    node ..\tools\update-news-index.js
)

if !guides_success! gtr 0 (
    echo 正在更新指南索引...
    node ..\tools\update-guide-index.js
)

REM 总结处理结果
echo.
echo 处理完成:
echo - 新闻文件: 处理 !news_processed! 个, 成功 !news_success! 个
echo - 指南文件: 处理 !guides_processed! 个, 成功 !guides_success! 个
echo.

pause
exit /b 0

:check_package
node -e "try{require('%1');console.log('OK')}catch(e){process.exit(1)}" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 正在安装缺少的npm包: %1
    npm install %1 --save
)
exit /b 0

:ensure_directory
if not exist "%~1" (
    echo 创建目录: %~1
    mkdir "%~1"
)
exit /b 0 
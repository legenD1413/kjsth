@echo off
chcp 65001

echo ====================================================
echo 转换单个文件
echo ====================================================

REM 设置文件路径
set INPUT_FILE=..\guides-md\如何应对加拿大FBA海运途中的常见风险？.md
set OUTPUT_DIR=..\tools-guides\shipping
set OUTPUT_FILE=%OUTPUT_DIR%\single_file_test.html

REM 确保目录存在
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM 转换文件
echo 转换文件: %INPUT_FILE% 到 %OUTPUT_FILE%
node md-convert.js "%INPUT_FILE%" "%OUTPUT_FILE%"

echo 转换完成!
echo ====================================================

pause 
@echo off
cd /d %~dp0
echo 开始执行CMS内容更新 - %date% %time%
node auto-update-cms-content.js
echo 更新完成 - %date% %time%
pause 
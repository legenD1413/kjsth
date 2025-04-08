@echo off
chcp 65001 > nul
cd /d D:/HaigeProject/WebMaigeeku
cd articel_BAT
echo [Start] Running CMS content update - %date% %time%
node auto-update-cms-content.js
echo [Done] Update completed - %date% %time%
pause 
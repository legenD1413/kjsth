@echo off
chcp 65001
setlocal

echo ====================================================
echo 正在将PowerShell脚本转换为UTF-8格式...
echo ====================================================

powershell -Command "Get-Content -Path 'file-check-fixed.ps1' -Encoding Default | Set-Content -Path 'file-check-fixed-temp.ps1' -Encoding UTF8"
powershell -Command "If (Test-Path 'file-check-fixed-temp.ps1') { Remove-Item -Path 'file-check-fixed.ps1' -Force; Rename-Item -Path 'file-check-fixed-temp.ps1' -NewName 'file-check-fixed.ps1' }"

powershell -Command "Get-Content -Path 'guide-check-fixed.ps1' -Encoding Default | Set-Content -Path 'guide-check-fixed-temp.ps1' -Encoding UTF8"
powershell -Command "If (Test-Path 'guide-check-fixed-temp.ps1') { Remove-Item -Path 'guide-check-fixed.ps1' -Force; Rename-Item -Path 'guide-check-fixed-temp.ps1' -NewName 'guide-check-fixed.ps1' }"

echo 转换完成!
echo ====================================================

pause 
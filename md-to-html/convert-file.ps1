# 简单的文件转换脚本
# 使用: convert-file.ps1 <input-file> <output-dir> <output-name>
param(
    [string]$inputFile,
    [string]$outputDir,
    [string]$outputName
)

# 获取脚本目录
$scriptDir = $PSScriptRoot
$rootDir = Split-Path -Parent $scriptDir

# 模板文件
$templateFile = Join-Path -Path $rootDir -ChildPath "tools/tool-template.html"

# 确保输出目录存在
if (-not (Test-Path -Path $outputDir)) {
    Write-Host "Creating directory: $outputDir"
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}

# 构建输出路径
$outputFile = Join-Path -Path $outputDir -ChildPath "$outputName.html"

# 运行转换
Write-Host "Converting: $inputFile -> $outputFile"
& node "$scriptDir\md-convert.js" $inputFile $outputFile $templateFile

Write-Host "Done!" 
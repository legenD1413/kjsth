# 简单的文件转换脚本，避免中文编码问题
param(
    [string]$inputFile,
    [string]$category = "fba"  # 默认保存到fba目录
)

# 如果没有提供输入文件，显示用法
if ([string]::IsNullOrEmpty($inputFile)) {
    Write-Host "Usage: simple-convert.ps1 <markdown-file> [category]"
    exit 1
}

# 确保输入文件存在
if (-not (Test-Path -Path $inputFile)) {
    Write-Host "Input file not found: $inputFile"
    exit 1
}

# 获取脚本目录
$scriptDir = $PSScriptRoot
$rootDir = Split-Path -Parent $scriptDir

# 模板文件
$templateFile = Join-Path -Path $rootDir -ChildPath "tools/tool-template.html"

# 生成随机文件名
$currentDate = Get-Date -Format "yyyyMMdd"
$randomPart = Get-Random -Maximum 10000
$outputName = "guide_${currentDate}_${randomPart}"

# 构建输出目录和文件路径
$outputDir = Join-Path -Path $rootDir -ChildPath "tools-guides/$category"
$outputFile = Join-Path -Path $outputDir -ChildPath "$outputName.html"

# 确保输出目录存在
if (-not (Test-Path -Path $outputDir)) {
    Write-Host "Creating directory: $outputDir"
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}

# 运行转换
Write-Host "Converting: $inputFile -> $outputFile"
& node "$scriptDir\md-convert.js" $inputFile $outputFile $templateFile

Write-Host "Done!" 
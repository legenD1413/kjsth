# 自动提取category/region并生成简单文件名的转换脚本
param(
    [string]$inputFile
)

# 如果没有提供输入文件，显示用法
if ([string]::IsNullOrEmpty($inputFile)) {
    Write-Host "Usage: auto-convert.ps1 <markdown-file>"
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
$guideTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/tool-template.html"
$newsTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/news-template.html"

# 分类和地区映射表
$categoryMap = @{
    "监管法规" = "regulations";
    "海关指南" = "customs";
    "运输指南" = "shipping";
    "包装指南" = "packaging";
    "亚马逊FBA" = "fba";
    "物流基础知识" = "logistics";
    "实用工具使用指南" = "calculator";
    "报关指南" = "declaration";
    "税务指南" = "tax";
    "保险指南" = "insurance";
    "物流跟踪" = "tracking";
    "退货处理" = "returns";
    "国际物流" = "international";
    "快递服务" = "express";
    "商业件运输" = "commercial";
    "超大件运输" = "biggoods";
    "海外仓" = "warehouse";
    "测试" = "test"
}

$regionMap = @{
    "全球" = "global";
    "北美" = "north-america";
    "南美" = "south-america";
    "欧洲" = "europe";
    "亚洲" = "asia";
    "大洋洲" = "australia";
    "非洲" = "africa";
    "中东" = "middle-east"
}

# 读取文件内容
$mdContent = Get-Content -Path $inputFile -Raw -Encoding UTF8

# 确定是新闻还是指南
$isNews = $inputFile -match "news-md"
$isGuide = $inputFile -match "guides-md"

if (-not ($isNews -or $isGuide)) {
    # 直接从路径猜测
    $isNews = $inputFile -match "news"
    $isGuide = $inputFile -match "guide"
}

# 如果仍然无法确定，根据内容进一步判断
if (-not ($isNews -or $isGuide)) {
    $isNews = $mdContent -match "新闻|资讯|行业动态|市场趋势|政策更新"
    $isGuide = (-not $isNews) -or $mdContent -match "指南|攻略|教程|指导|说明|步骤"
}

Write-Host "文件类型: $(if ($isNews) { '新闻' } else { '指南' })"

if ($isNews) {
    # 提取region
    $region = "global"
    
    if ($mdContent -match "region:\s*(\S[^\r\n]*)") {
        $region = $Matches[1].Trim()
        $region = $region -replace '[''"]', ''
    }
    
    if ($mdContent -match "regions:[^\r\n]*[\r\n]+\s*-\s*([^\r\n]+)") {
        $region = $Matches[1].Trim()
    }
    
    Write-Host "提取的地区: $region"
    
    # 转换中文地区名到英文目录名
    $dirName = $region
    if ($regionMap.ContainsKey($region)) {
        $dirName = $regionMap[$region]
        Write-Host "映射到目录: $dirName"
    } else {
        $dirName = "global"
        Write-Host "未找到映射，使用默认目录: $dirName"
    }
    
    # 构建输出目录
    $outputDir = Join-Path -Path $rootDir -ChildPath "static-news/$dirName"
    
    # 生成文件名
    $currentDate = Get-Date -Format "yyyyMMdd"
    $randomPart = Get-Random -Maximum 10000
    $outputName = "news_${currentDate}_${randomPart}"
    
    # 使用新闻模板
    $templateFile = $newsTemplateFile
} else {
    # 提取category
    $category = "default"
    
    if ($mdContent -match "category:\s*(\S[^\r\n]*)") {
        $category = $Matches[1].Trim()
        $category = $category -replace '[''"]', ''
    }
    
    if ($mdContent -match "categories:[^\r\n]*[\r\n]+\s*-\s*([^\r\n]+)") {
        $category = $Matches[1].Trim()
    }
    
    Write-Host "提取的分类: $category"
    
    # 转换中文分类名到英文目录名
    $dirName = $category
    if ($categoryMap.ContainsKey($category)) {
        $dirName = $categoryMap[$category]
        Write-Host "映射到目录: $dirName"
    } else {
        $dirName = "misc"
        Write-Host "未找到映射，使用默认目录: $dirName"
    }
    
    # 构建输出目录
    $outputDir = Join-Path -Path $rootDir -ChildPath "tools-guides/$dirName"
    
    # 生成文件名
    $currentDate = Get-Date -Format "yyyyMMdd"
    $randomPart = Get-Random -Maximum 10000
    $outputName = "guide_${currentDate}_${randomPart}"
    
    # 使用指南模板
    $templateFile = $guideTemplateFile
}

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
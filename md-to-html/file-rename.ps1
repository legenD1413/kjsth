# 重命名Markdown转HTML脚本
# 将中文HTML文件名改为简洁的编号形式，并根据category/region放入正确的目录

# 获取脚本目录
$scriptDir = $PSScriptRoot
$rootDir = Split-Path -Parent $scriptDir

# 定义源和目标目录
$guidesMdDir = Join-Path -Path $rootDir -ChildPath "guides-md"
$newsMdDir = Join-Path -Path $rootDir -ChildPath "news-md"
$toolsGuidesDir = Join-Path -Path $rootDir -ChildPath "tools-guides"
$staticNewsDir = Join-Path -Path $rootDir -ChildPath "static-news"

# 模板文件
$guideTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/tool-template.html"
$newsTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/news-template.html"

# 初始化更新标记
$newsUpdated = @{}
$guidesUpdated = @{}

# 分类映射表
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

# 地区映射表
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

# 处理指南文件
Write-Host "Checking guides-md directory..."
$guideFiles = Get-ChildItem -Path $guidesMdDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
$convertedGuideCount = 0

if ($guideFiles) {
    foreach ($mdFile in $guideFiles) {
        # 读取Markdown文件内容以提取category
        $mdContent = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
        
        # 尝试提取category（支持多种格式）
        $category = "default"
        
        # 首先尝试匹配单行category定义
        if ($mdContent -match "category:\s*(\S[^\r\n]*)") {
            $category = $Matches[1].Trim()
            # 移除可能的尾部引号
            $category = $category -replace '[''"]', ''
        }
        
        # 尝试匹配categories数组的第一项
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
            # 如果找不到映射，使用misc
            $dirName = "misc"
            Write-Host "未找到映射，使用默认目录: $dirName"
        }
        
        # 生成新的文件名（使用日期+随机数）
        $currentDate = Get-Date -Format "yyyyMMdd"
        $randomPart = Get-Random -Maximum 10000
        $newFileName = "guide_${currentDate}_${randomPart}.html"
        
        # 构建输出路径
        $targetDir = Join-Path -Path $toolsGuidesDir -ChildPath $dirName
        $htmlPath = Join-Path -Path $targetDir -ChildPath $newFileName
        
        $needConversion = $true
        
        # Convert if needed
        if ($needConversion) {
            # Ensure output directory exists
            if (-not (Test-Path -Path $targetDir)) {
                Write-Host "Creating directory: $targetDir"
                New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
            }
            
            # Run conversion
            Write-Host "Converting guide: $($mdFile.FullName) -> $htmlPath"
            try {
                & node "$scriptDir\md-convert.js" $mdFile.FullName $htmlPath $guideTemplateFile
                $convertedGuideCount++
                
                # 记录需要更新的分类
                $guidesUpdated[$dirName] = $true
                
                Write-Host "成功转换并保存到: $htmlPath" -ForegroundColor Green
            }
            catch {
                Write-Host "转换过程中出错: $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "Guides conversion complete: $convertedGuideCount files processed"

# 处理新闻文件
Write-Host "Checking news-md directory..."
$newsFiles = Get-ChildItem -Path $newsMdDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
$convertedNewsCount = 0

if ($newsFiles) {
    foreach ($mdFile in $newsFiles) {
        # 读取Markdown文件内容以提取region
        $mdContent = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
        
        # 尝试提取region（支持多种格式）
        $region = "global"
        
        # 首先尝试匹配单行region定义
        if ($mdContent -match "region:\s*(\S[^\r\n]*)") {
            $region = $Matches[1].Trim()
            # 移除可能的尾部引号
            $region = $region -replace '[''"]', ''
        }
        
        # 尝试匹配regions数组的第一项
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
            # 如果找不到映射，默认为global
            $dirName = "global"
            Write-Host "未找到映射，使用默认目录: $dirName"
        }
        
        # 生成新的文件名（使用日期+随机数）
        $currentDate = Get-Date -Format "yyyyMMdd"
        $randomPart = Get-Random -Maximum 10000
        $newFileName = "news_${currentDate}_${randomPart}.html"
        
        # 构建输出路径
        $targetDir = Join-Path -Path $staticNewsDir -ChildPath $dirName
        $htmlPath = Join-Path -Path $targetDir -ChildPath $newFileName
        
        $needConversion = $true
        
        # Convert if needed
        if ($needConversion) {
            # Ensure output directory exists
            if (-not (Test-Path -Path $targetDir)) {
                Write-Host "Creating directory: $targetDir"
                New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
            }
            
            # Run conversion
            Write-Host "Converting news: $($mdFile.FullName) -> $htmlPath"
            try {
                & node "$scriptDir\md-convert.js" $mdFile.FullName $htmlPath $newsTemplateFile
                $convertedNewsCount++
                
                # 记录需要更新的区域
                $newsUpdated[$dirName] = $true
                
                Write-Host "成功转换并保存到: $htmlPath" -ForegroundColor Green
            }
            catch {
                Write-Host "转换过程中出错: $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "News conversion complete: $convertedNewsCount files processed"

# 更新索引页面
if ($convertedGuideCount + $convertedNewsCount -gt 0) {
    Write-Host "Updating index pages..."
    
    # 安装必要的依赖
    $nodeModulesDir = Join-Path -Path $scriptDir -ChildPath "node_modules"
    if (-not (Test-Path -Path "$nodeModulesDir\cheerio")) {
        Write-Host "Installing required dependencies..."
        Set-Location -Path $scriptDir
        & npm install cheerio --save
    }
    
    # 更新新闻索引
    if ($newsUpdated.Count -gt 0) {
        Write-Host "Updating news indices..."
        foreach ($region in $newsUpdated.Keys) {
            & node "$scriptDir\update-lists.js" news $region
        }
    }
    
    # 更新指南索引
    if ($guidesUpdated.Count -gt 0) {
        Write-Host "Updating guides indices..."
        foreach ($category in $guidesUpdated.Keys) {
            & node "$scriptDir\update-lists.js" guides $category
        }
    }
    
    Write-Host "Index pages updated successfully!"
} else {
    Write-Host "No files were processed."
}

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey() | Out-Null 
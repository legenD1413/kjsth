# 检测和转换新的Markdown文件
# 此脚本会检查guides-md和news-md目录中的Markdown文件，
# 与对应的HTML文件进行比较，只转换新的或更新的文件

# 设置编码为UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "====================================================="
Write-Host "     迈格库网站Markdown自动检测与转换工具"
Write-Host "====================================================="
Write-Host ""

# 获取当前脚本所在目录
$scriptDir = $PSScriptRoot
$rootDir = Split-Path -Parent $scriptDir

# 定义源目录和目标目录
$guidesMdDir = Join-Path -Path $rootDir -ChildPath "guides-md"
$newsMdDir = Join-Path -Path $rootDir -ChildPath "news-md"
$toolsGuidesDir = Join-Path -Path $rootDir -ChildPath "tools-guides"
$staticNewsDir = Join-Path -Path $rootDir -ChildPath "static-news"

# 定义模板文件路径
$guideTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/tool-template.html"
$newsTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/news-template.html"

# 1. 检查并转换guides-md目录中的文件
Write-Host "正在检查guides-md目录中的Markdown文件..."
$guideFiles = Get-ChildItem -Path $guidesMdDir -Filter "*.md" -Recurse
$convertedGuideCount = 0

foreach ($mdFile in $guideFiles) {
    # 计算对应的HTML文件路径
    $relativePath = $mdFile.FullName.Substring($guidesMdDir.Length)
    $htmlPath = Join-Path -Path $toolsGuidesDir -ChildPath ($relativePath -replace "\.md$", ".html")
    
    $needConversion = $false
    
    # 检查HTML文件是否存在
    if (-not (Test-Path -Path $htmlPath)) {
        Write-Host "发现新文件: $($mdFile.FullName)"
        $needConversion = $true
    } else {
        # 比较修改时间
        $mdLastModified = $mdFile.LastWriteTime
        $htmlLastModified = (Get-Item -Path $htmlPath).LastWriteTime
        
        if ($mdLastModified -gt $htmlLastModified) {
            Write-Host "文件已更新: $($mdFile.FullName)"
            $needConversion = $true
        }
    }
    
    # 如果需要转换，就执行转换
    if ($needConversion) {
        # 确保输出目录存在
        $outputDir = [System.IO.Path]::GetDirectoryName($htmlPath)
        if (-not (Test-Path -Path $outputDir)) {
            New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
        }
        
        # 执行转换
        Write-Host "正在转换: $($mdFile.FullName) -> $htmlPath"
        & node "$scriptDir\md-convert.js" $mdFile.FullName $htmlPath $guideTemplateFile
        $convertedGuideCount++
    }
}

Write-Host ""
Write-Host "guides-md目录检查完成，共转换 $convertedGuideCount 个文件"
Write-Host ""

# 2. 检查并转换news-md目录中的文件
Write-Host "正在检查news-md目录中的Markdown文件..."
$newsFiles = Get-ChildItem -Path $newsMdDir -Filter "*.md" -Recurse
$convertedNewsCount = 0

foreach ($mdFile in $newsFiles) {
    # 获取相对路径
    $relativePath = $mdFile.DirectoryName.Substring($newsMdDir.Length)
    
    # 获取文件名（不带扩展名）
    $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
    
    # 检查文件名是否以数字开头
    $outputFileName = $fileNameWithoutExt
    if ($fileNameWithoutExt -match "^\d+") {
        $outputFileName = $Matches[0]
    }
    
    # 构建输出文件路径
    $outputDir = Join-Path -Path $staticNewsDir -ChildPath $relativePath
    $htmlPath = Join-Path -Path $outputDir -ChildPath "$outputFileName.html"
    
    $needConversion = $false
    
    # 检查HTML文件是否存在
    if (-not (Test-Path -Path $htmlPath)) {
        Write-Host "发现新文件: $($mdFile.FullName)"
        $needConversion = $true
    } else {
        # 比较修改时间
        $mdLastModified = $mdFile.LastWriteTime
        $htmlLastModified = (Get-Item -Path $htmlPath).LastWriteTime
        
        if ($mdLastModified -gt $htmlLastModified) {
            Write-Host "文件已更新: $($mdFile.FullName)"
            $needConversion = $true
        }
    }
    
    # 如果需要转换，就执行转换
    if ($needConversion) {
        # 确保输出目录存在
        if (-not (Test-Path -Path $outputDir)) {
            New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
        }
        
        # 执行转换
        Write-Host "正在转换: $($mdFile.FullName) -> $htmlPath"
        & node "$scriptDir\md-convert.js" $mdFile.FullName $htmlPath $newsTemplateFile
        $convertedNewsCount++
    }
}

Write-Host ""
Write-Host "news-md目录检查完成，共转换 $convertedNewsCount 个文件"
Write-Host ""

# 总结
$totalConverted = $convertedGuideCount + $convertedNewsCount

if ($totalConverted -gt 0) {
    Write-Host "转换完成！共转换了 $totalConverted 个文件。"
} else {
    Write-Host "所有文件都是最新的，无需转换。"
}

Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
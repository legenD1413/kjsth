# Check and convert Markdown files to HTML
# This script checks for new or updated MD files

# Get script directory
$scriptDir = $PSScriptRoot
$rootDir = Split-Path -Parent $scriptDir

# Define source and target directories
$guidesMdDir = Join-Path -Path $rootDir -ChildPath "guides-md"
$newsMdDir = Join-Path -Path $rootDir -ChildPath "news-md"
$toolsGuidesDir = Join-Path -Path $rootDir -ChildPath "tools-guides"
$staticNewsDir = Join-Path -Path $rootDir -ChildPath "static-news"

# Template files
$guideTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/tool-template.html"
$newsTemplateFile = Join-Path -Path $rootDir -ChildPath "tools/news-template.html"

# 初始化更新标记
$newsUpdated = @{}
$guidesUpdated = @{}

# Process guides-md files
Write-Host "Checking guides-md directory..."
$guideFiles = Get-ChildItem -Path $guidesMdDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
$convertedGuideCount = 0

if ($guideFiles) {
    foreach ($mdFile in $guideFiles) {
        # Calculate HTML path
        $relativePath = $mdFile.FullName.Substring($guidesMdDir.Length)
        $htmlPath = Join-Path -Path $toolsGuidesDir -ChildPath ($relativePath -replace "\.md$", ".html")
        
        $needConversion = $false
        
        # Check if HTML exists
        if (-not (Test-Path -Path $htmlPath)) {
            Write-Host "New file (guide): $($mdFile.FullName)"
            $needConversion = $true
        } else {
            # Compare timestamps
            $mdLastModified = $mdFile.LastWriteTime
            $htmlLastModified = (Get-Item -Path $htmlPath).LastWriteTime
            
            if ($mdLastModified -gt $htmlLastModified) {
                Write-Host "Updated file (guide): $($mdFile.FullName)"
                $needConversion = $true
            }
        }
        
        # Convert if needed
        if ($needConversion) {
            # Ensure output directory exists
            $outputDir = [System.IO.Path]::GetDirectoryName($htmlPath)
            if (-not (Test-Path -Path $outputDir)) {
                New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
            }
            
            # Run conversion
            Write-Host "Converting guide: $($mdFile.FullName) -> $htmlPath"
            & node "$scriptDir\md-convert.js" $mdFile.FullName $htmlPath $guideTemplateFile
            $convertedGuideCount++
            
            # 记录需要更新的分类
            $categoryPath = $relativePath.Split([System.IO.Path]::DirectorySeparatorChar)[1]
            if ($categoryPath) {
                $guidesUpdated[$categoryPath] = $true
            }
        }
    }
}

Write-Host "Guides conversion complete: $convertedGuideCount files processed"

# Process news-md files
Write-Host "Checking news-md directory..."
$newsFiles = Get-ChildItem -Path $newsMdDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
$convertedNewsCount = 0

if ($newsFiles) {
    foreach ($mdFile in $newsFiles) {
        # Get relative path 
        $relativePath = $mdFile.DirectoryName.Substring($newsMdDir.Length)
        
        # Get filename without extension
        $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
        
        # Check if filename starts with digits
        $outputFileName = $fileNameWithoutExt
        if ($fileNameWithoutExt -match "^\d+") {
            $outputFileName = $Matches[0]
        }
        
        # Build output path
        $outputDir = Join-Path -Path $staticNewsDir -ChildPath $relativePath
        $htmlPath = Join-Path -Path $outputDir -ChildPath "$outputFileName.html"
        
        $needConversion = $false
        
        # Check if HTML exists
        if (-not (Test-Path -Path $htmlPath)) {
            Write-Host "New file (news): $($mdFile.FullName)"
            $needConversion = $true
        } else {
            # Compare timestamps
            $mdLastModified = $mdFile.LastWriteTime
            $htmlLastModified = (Get-Item -Path $htmlPath).LastWriteTime
            
            if ($mdLastModified -gt $htmlLastModified) {
                Write-Host "Updated file (news): $($mdFile.FullName)"
                $needConversion = $true
            }
        }
        
        # Convert if needed
        if ($needConversion) {
            # Ensure output directory exists
            if (-not (Test-Path -Path $outputDir)) {
                New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
            }
            
            # Run conversion
            Write-Host "Converting news: $($mdFile.FullName) -> $htmlPath"
            & node "$scriptDir\md-convert.js" $mdFile.FullName $htmlPath $newsTemplateFile
            $convertedNewsCount++
            
            # 记录需要更新的区域
            $regionPath = $relativePath.Split([System.IO.Path]::DirectorySeparatorChar)[1]
            if ($regionPath) {
                $newsUpdated[$regionPath] = $true
            }
        }
    }
}

Write-Host "News conversion complete: $convertedNewsCount files processed"

# Summary
$totalConverted = $convertedGuideCount + $convertedNewsCount

if ($totalConverted -gt 0) {
    Write-Host "Conversion complete! $totalConverted files were processed."
    
    # 更新索引页面
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
    Write-Host "All files are up to date. No conversion needed."
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
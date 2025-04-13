# 设置错误和详细输出
$VerbosePreference = "Continue"
$ErrorActionPreference = "Continue"

# 设置工作环境
$scriptRoot = $PSScriptRoot
$guidesMdPath = "../guides-md"
$toolsGuidesPath = "../tools-guides"
$newsMdPath = "../news-md"
$staticNewsPath = "../static-news"
$toolTemplatePath = "../tools/tool-template.html"
$newsTemplatePath = "../static-news/news-template.html"

# 验证必需目录和文件是否存在
Write-Host "检查必需的目录和文件..."
$directoriesToCheck = @($guidesMdPath, $newsMdPath, $toolsGuidesPath, $staticNewsPath)
$filesToCheck = @($toolTemplatePath, $newsTemplatePath)

foreach ($dir in $directoriesToCheck) {
    if (-not (Test-Path $dir -PathType Container)) {
        Write-Warning "目录不存在: $dir"
    }
}

foreach ($file in $filesToCheck) {
    if (-not (Test-Path $file -PathType Leaf)) {
        Write-Warning "模板文件不存在: $file"
    }
}

# 初始化状态跟踪
$updatedNewsFiles = @{}
$processedCount = 0

# 处理新闻Markdown文件
Write-Host "正在检查 $newsMdPath 目录..."
$newsFiles = Get-ChildItem -Path $newsMdPath -Filter "*.md" -File
Write-Host "找到 $($newsFiles.Count) 个Markdown文件"

foreach ($file in $newsFiles) {
    Write-Host "处理文件: $($file.FullName)"
    
    # 读取文件内容
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    }
    catch {
        Write-Error "无法读取文件 $($file.FullName): $_"
        continue
    }
    
    # 提取region信息
    $regionMatch = [regex]::Match($content, 'region:\s*(.*?)(\r?\n|\Z)')
    $region = "global"  # 默认
    
    if ($regionMatch.Success) {
        $region = $regionMatch.Groups[1].Value.Trim()
        Write-Verbose "从文件提取的区域: $region"
    }
    
    # 如果找不到区域，尝试提取多个区域
    if ($region -eq "global") {
        $regionsMatch = [regex]::Match($content, 'regions:\s*\[(.*?)\]', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if ($regionsMatch.Success) {
            $regionsStr = $regionsMatch.Groups[1].Value
            $regions = $regionsStr -split ',' | ForEach-Object { $_.Trim(' "''') }
            if ($regions.Count -gt 0) {
                $region = $regions[0]
                Write-Verbose "从多个区域中提取的第一个区域: $region"
            }
        }
        
        # 尝试提取YAML格式的regions
        if ($region -eq "global") {
            $yamlMatch = [regex]::Match($content, 'regions:[^\r\n]*[\r\n]+\s*-\s*([^\r\n]+)')
            if ($yamlMatch.Success) {
                $region = $yamlMatch.Groups[1].Value.Trim()
                Write-Verbose "从YAML格式的regions中提取的第一个区域: $region"
            }
        }
    }
    
    # 映射区域到目录名
    $regionMap = @{
        "北美" = "north-america";
        "南美" = "south-america";
        "欧洲" = "europe";
        "亚洲" = "asia";
        "全球" = "global";
        "大洋洲" = "australia";
        "非洲" = "africa";
        "中东" = "middle-east"
    }
    
    $dirName = $regionMap[$region]
    if (-not $dirName) {
        $dirName = "global"
        Write-Verbose "未找到对应区域，使用默认区域: $dirName"
    }
    
    # 创建区域目录（如果不存在）
    $targetDir = Join-Path $staticNewsPath $dirName
    if (-not (Test-Path $targetDir -PathType Container)) {
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        Write-Host "创建目录: $targetDir"
    }
    
    # 生成输出路径
    $dateStamp = Get-Date -Format "yyyyMMdd_HHmm"
    $randomNum = Get-Random -Minimum 1000 -Maximum 9999
    $outputFileName = "news_${dateStamp}_${randomNum}.html"
    $outputPath = Join-Path $targetDir $outputFileName
    
    # 检查HTML文件是否已存在且比MD文件新
    if (Test-Path $outputPath) {
        $mdLastWrite = (Get-Item $file.FullName).LastWriteTime
        $htmlLastWrite = (Get-Item $outputPath).LastWriteTime
        
        if ($htmlLastWrite -gt $mdLastWrite) {
            Write-Verbose "已跳过 (HTML 已是最新): $($file.Name)"
            continue
        }
    }
    
    # 显示处理信息
    Write-Host "正在处理: $($file.Name)"
    
    # 读取文件前100个字符以显示
    $preview = if ($content.Length -gt 100) { $content.Substring(0, 100) } else { $content }
    Write-Host "文件内容预览: $preview"
    
    # 调用Node.js脚本进行转换
    $nodePath = Join-Path $scriptRoot "md-convert.js"
    $command = "node `"$nodePath`" `"$($file.FullName)`" `"$outputPath`""
    
    try {
        Write-Host "执行命令: $command"
        Invoke-Expression $command
        
        # 检查是否成功创建HTML文件
        if (Test-Path $outputPath) {
            Write-Host "已成功转换: $outputPath" -ForegroundColor Green
            $processedCount++
            $updatedNewsFiles[$dirName] = $true
        }
        else {
            Write-Warning "未能创建HTML文件: $outputPath"
        }
    }
    catch {
        Write-Error "转换失败: $_"
    }
}

# 处理指南Markdown文件
Write-Host "正在检查 $guidesMdPath 目录..."
$guideFiles = Get-ChildItem -Path $guidesMdPath -Filter "*.md" -File
Write-Host "找到 $($guideFiles.Count) 个Markdown文件"

# 如果有任何文件更新，更新索引页面
if ($processedCount -gt 0) {
    Write-Host "处理了 $processedCount 个文件"
    
    # 更新索引页面
    foreach ($dir in $updatedNewsFiles.Keys) {
        $updateCmd = "node $scriptRoot/update-lists.js news $dir"
        Write-Host "更新索引: $updateCmd"
        
        try {
            Invoke-Expression $updateCmd
            Write-Host "成功更新索引页面: $dir" -ForegroundColor Green
        }
        catch {
            Write-Error "更新索引页面时出错: $_"
        }
    }
} else {
    Write-Host "没有文件需要处理"
}

Write-Host "脚本执行完成"

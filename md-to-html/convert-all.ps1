# 转换所有Markdown文件为HTML
# 转换guides-md目录中的Markdown文件
$guideFiles = Get-ChildItem -Path "guides-md" -Filter "*.md" -Recurse
foreach ($file in $guideFiles) {
    $outputFile = $file.FullName -replace "guides-md", "tools-guides" -replace "\.md$", ".html"
    $templateFile = "./tools/tool-template.html"
    $outputDir = [System.IO.Path]::GetDirectoryName($outputFile)
    # 创建输出目录（如果不存在）
    if (-not (Test-Path -Path $outputDir)) {
        New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
    }
    # 执行转换
    Write-Host "转换: $($file.FullName) -> $outputFile"
    cd md-to-html
    node md-convert.js $file.FullName $outputFile $templateFile
    cd ..
}
Write-Host "guides-md目录的文件转换完成"

# 转换news-md目录中的Markdown文件
$newsFiles = Get-ChildItem -Path "news-md" -Filter "*.md" -Recurse
foreach ($file in $newsFiles) {
    $fileName = $file.Name
    $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    # 检查文件名是否以数字开头，如果是，则只使用数字部分作为输出文件名
    if ($fileNameWithoutExt -match "^\d+") {
        $outputFileName = $Matches[0]
    } else {
        $outputFileName = $fileNameWithoutExt
    }
    $relativePath = $file.DirectoryName -replace [regex]::Escape($PWD.Path + "\news-md"), ""
    $outputDir = "static-news" + $relativePath
    $outputFile = Join-Path -Path $outputDir -ChildPath "$outputFileName.html"
    $templateFile = "./tools/news-template.html"
    # 创建输出目录（如果不存在）
    if (-not (Test-Path -Path $outputDir)) {
        New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
    }
    # 执行转换
    Write-Host "转换: $($file.FullName) -> $outputFile"
    cd md-to-html
    node md-convert.js $file.FullName $outputFile $templateFile
    cd ..
}
Write-Host "news-md目录的文件转换完成"
Write-Host "所有文件转换完成！"

/**
 * 图片优化工具 - 用于优化网站图片资源
 * 
 * 功能：
 * 1. 自动调整图片尺寸
 * 2. 压缩图片文件大小
 * 3. 生成多种尺寸的响应式图片
 * 4. 添加适当的alt属性建议
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');

// 配置
const config = {
  // 源图片目录
  sourceDir: './assets/images',
  // 输出目录
  outputDir: './assets/images/optimized',
  // 响应式图片尺寸
  sizes: [
    { width: 1920, suffix: 'xl' },
    { width: 1200, suffix: 'lg' },
    { width: 768, suffix: 'md' },
    { width: 480, suffix: 'sm' },
    { width: 320, suffix: 'xs' }
  ],
  // 图片质量 (1-100)
  quality: 80,
  // 扩展名
  extensions: ['.jpg', '.jpeg', '.png', '.webp']
};

// 确保输出目录存在
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`✓ 创建目录: ${dir}`));
  }
}

// 获取所有图片文件
function getImageFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      const subDirResults = getImageFiles(filePath);
      results = results.concat(subDirResults);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (config.extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// 优化单个图片
async function optimizeImage(imagePath) {
  const filename = path.basename(imagePath);
  const fileExt = path.extname(imagePath);
  const filenameWithoutExt = path.basename(imagePath, fileExt);
  
  // 获取相对路径，以保持目录结构
  const relativePath = path.relative(config.sourceDir, path.dirname(imagePath));
  const outputPath = path.join(config.outputDir, relativePath);
  
  // 确保输出目录存在
  ensureDirectoryExists(outputPath);
  
  // 检查图片原始尺寸
  const metadata = await sharp(imagePath).metadata();
  console.log(chalk.blue(`处理图片: ${filename} (${metadata.width}x${metadata.height}, ${(fs.statSync(imagePath).size / 1024).toFixed(2)} KB)`));
  
  // 生成各种尺寸的图片
  for (const size of config.sizes) {
    // 只生成比原图小的尺寸
    if (size.width < metadata.width) {
      const outputFilename = `${filenameWithoutExt}-${size.suffix}${fileExt}`;
      const outputFilePath = path.join(outputPath, outputFilename);
      
      try {
        await sharp(imagePath)
          .resize(size.width)
          .jpeg({ quality: config.quality })
          .toFile(outputFilePath);
        
        const optimizedSize = fs.statSync(outputFilePath).size / 1024;
        console.log(chalk.green(`  ✓ ${outputFilename} (${size.width}px, ${optimizedSize.toFixed(2)} KB)`));
      } catch (err) {
        console.error(chalk.red(`  × 处理失败: ${outputFilename}`, err.message));
      }
    }
  }
  
  // 生成原始尺寸的优化版本
  const outputFilename = `${filenameWithoutExt}-optimized${fileExt}`;
  const outputFilePath = path.join(outputPath, outputFilename);
  
  try {
    await sharp(imagePath)
      .jpeg({ quality: config.quality })
      .toFile(outputFilePath);
    
    const originalSize = fs.statSync(imagePath).size / 1024;
    const optimizedSize = fs.statSync(outputFilePath).size / 1024;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
    
    console.log(chalk.green(`  ✓ ${outputFilename} (原始尺寸, ${optimizedSize.toFixed(2)} KB, 节省 ${savings}%)`));
  } catch (err) {
    console.error(chalk.red(`  × 处理失败: ${outputFilename}`, err.message));
  }
}

// 生成优化后的图片使用HTML
function generateHTMLUsage(imagePath) {
  const fileExt = path.extname(imagePath);
  const filenameWithoutExt = path.basename(imagePath, fileExt);
  const relativePath = path.relative(config.sourceDir, path.dirname(imagePath));
  
  // 生成响应式图片HTML
  let html = '<picture>\n';
  
  // WebP格式（如果浏览器支持）
  html += '  <source\n';
  html += '    srcset="';
  
  config.sizes.forEach((size, index) => {
    if (index > 0) html += ', ';
    html += `/assets/images/optimized/${relativePath}/${filenameWithoutExt}-${size.suffix}.webp ${size.width}w`;
  });
  
  html += '"\n';
  html += '    type="image/webp"\n';
  html += '  />\n';
  
  // 原始格式
  html += '  <source\n';
  html += '    srcset="';
  
  config.sizes.forEach((size, index) => {
    if (index > 0) html += ', ';
    html += `/assets/images/optimized/${relativePath}/${filenameWithoutExt}-${size.suffix}${fileExt} ${size.width}w`;
  });
  
  html += '"\n';
  html += '    type="image/' + (fileExt === '.jpg' || fileExt === '.jpeg' ? 'jpeg' : fileExt.substring(1)) + '"\n';
  html += '  />\n';
  
  // 回退
  html += `  <img src="/assets/images/optimized/${relativePath}/${filenameWithoutExt}-optimized${fileExt}" alt="描述图片内容" class="responsive-img" />\n`;
  html += '</picture>';
  
  return html;
}

// 生成图片优化报告
function generateReport(images, optimizedImages) {
  const reportPath = path.join(config.outputDir, 'optimization-report.html');
  
  let reportHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>图片优化报告 - 迈格库物流</title>
  <style>
    body {
      font-family: "SF Pro Display", "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "微软雅黑", sans-serif;
      line-height: 1.5;
      color: #1d1d1f;
      margin: 0;
      padding: 20px;
    }
    h1 {
      font-weight: 500;
      margin-bottom: 20px;
    }
    .report {
      max-width: 1200px;
      margin: 0 auto;
    }
    .summary {
      background-color: #f5f5f7;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .image-item {
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .image-details {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .image-preview {
      max-width: 300px;
    }
    .image-preview img {
      max-width: 100%;
      border-radius: 4px;
    }
    .image-info {
      flex: 1;
      min-width: 300px;
    }
    .code-block {
      background-color: #f5f5f7;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.4;
    }
    .savings-high {
      color: #35c759;
    }
    .savings-medium {
      color: #f19a38;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e6e6e6;
    }
    th {
      font-weight: 500;
      background-color: #f5f5f7;
    }
  </style>
</head>
<body>
  <div class="report">
    <h1>图片优化报告</h1>
    
    <div class="summary">
      <h2>优化摘要</h2>
      <p>处理图片总数: ${images.length}</p>
      <p>优化后的图片总数: ${optimizedImages}</p>
      <p>生成时间: ${new Date().toLocaleString()}</p>
    </div>
    
    <h2>图片详情</h2>
  `;
  
  // 这里添加每个图片的详细信息
  // ...
  
  reportHtml += `
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, reportHtml);
  console.log(chalk.green(`✓ 优化报告已生成: ${reportPath}`));
}

// 主函数
async function main() {
  console.log(chalk.blue('=== 图片优化工具 ==='));
  console.log(chalk.blue(`源目录: ${config.sourceDir}`));
  console.log(chalk.blue(`输出目录: ${config.outputDir}`));
  
  // 确保输出目录存在
  ensureDirectoryExists(config.outputDir);
  
  // 获取所有图片文件
  const imageFiles = getImageFiles(config.sourceDir);
  console.log(chalk.blue(`找到 ${imageFiles.length} 个图片文件`));
  
  // 优化每个图片
  let optimizedCount = 0;
  for (const [index, imagePath] of imageFiles.entries()) {
    console.log(chalk.blue(`\n[${index + 1}/${imageFiles.length}] 处理中...`));
    try {
      await optimizeImage(imagePath);
      optimizedCount++;
    } catch (err) {
      console.error(chalk.red(`处理失败: ${imagePath}`, err.message));
    }
  }
  
  // 生成报告
  generateReport(imageFiles, optimizedCount);
  
  console.log(chalk.green(`\n✓ 完成! 共优化 ${optimizedCount}/${imageFiles.length} 个图片`));
  console.log(chalk.blue(`优化后的图片保存在: ${config.outputDir}`));
}

// 运行程序
main().catch(err => {
  console.error(chalk.red('程序出错:', err));
  process.exit(1);
}); 
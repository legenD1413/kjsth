/**
 * SEO检查工具 - 检查网站页面的SEO状况
 * 
 * 功能：
 * 1. 检查页面标题和描述是否合适
 * 2. 检查页面是否有合适的标题结构
 * 3. 检查图片是否有alt属性
 * 4. 检查链接是否有合适的描述
 * 5. 生成SEO改进建议报告
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cheerio = require('cheerio');

// 配置
const config = {
  // 要扫描的目录
  scanDirs: [
    './static-tools',
    './regions',
    './products',
    './shipping-methods',
    './'
  ],
  // 文件扩展名
  extensions: ['.html'],
  // 关键词列表（用于检查页面相关性）
  keywords: [
    '物流', '国际物流', '跨境物流', '空运', '海运', '专线', '快递',
    '电商物流', '仓储', 'FBA', '亚马逊物流', '电子烟物流', '电池物流',
    '北美物流', '欧洲物流', '澳洲物流', '东南亚物流', '南美物流', '中东物流', '非洲物流'
  ]
};

// 获取所有HTML文件
function getHtmlFiles(dir) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const subDirResults = getHtmlFiles(filePath);
        results = results.concat(subDirResults);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (config.extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`读取目录失败 ${dir}:`, error.message));
  }
  
  return results;
}

// 检查单个页面
function checkPage(filePath) {
  console.log(chalk.blue(`检查文件: ${filePath}`));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    
    // 结果对象
    const result = {
      filePath,
      issues: [],
      score: 100  // 初始满分
    };
    
    // 1. 检查标题
    const title = $('title').text().trim();
    if (!title) {
      result.issues.push({
        type: 'error',
        message: '页面缺少标题标签',
        suggestion: '添加一个描述性的<title>标签，长度在50-60个字符之间'
      });
      result.score -= 15;
    } else if (title.length < 10) {
      result.issues.push({
        type: 'warning',
        message: '页面标题过短',
        suggestion: '扩展标题以包含更多相关关键词，当前长度: ' + title.length
      });
      result.score -= 5;
    } else if (title.length > 70) {
      result.issues.push({
        type: 'warning',
        message: '页面标题过长',
        suggestion: '缩短标题以避免在搜索结果中被截断，当前长度: ' + title.length
      });
      result.score -= 3;
    }
    
    // 2. 检查描述
    const description = $('meta[name="description"]').attr('content');
    if (!description) {
      result.issues.push({
        type: 'error',
        message: '页面缺少meta描述',
        suggestion: '添加一个包含关键词的描述性meta描述，长度在150-160个字符之间'
      });
      result.score -= 10;
    } else if (description.length < 50) {
      result.issues.push({
        type: 'warning',
        message: 'meta描述过短',
        suggestion: '扩展meta描述以包含更多相关信息，当前长度: ' + description.length
      });
      result.score -= 3;
    } else if (description.length > 180) {
      result.issues.push({
        type: 'warning',
        message: 'meta描述过长',
        suggestion: '缩短meta描述以避免在搜索结果中被截断，当前长度: ' + description.length
      });
      result.score -= 2;
    }
    
    // 3. 检查标题结构
    const h1Count = $('h1').length;
    if (h1Count === 0) {
      result.issues.push({
        type: 'error',
        message: '页面没有H1标题',
        suggestion: '添加一个主要的H1标题，描述页面的主要内容'
      });
      result.score -= 10;
    } else if (h1Count > 1) {
      result.issues.push({
        type: 'warning',
        message: '页面有多个H1标题',
        suggestion: '保留一个主要的H1标题，将其他标题改为H2或更低级别'
      });
      result.score -= 5;
    }
    
    // 4. 检查图片alt属性
    const images = $('img');
    let imagesWithoutAlt = 0;
    
    images.each(function() {
      const alt = $(this).attr('alt');
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt++;
      }
    });
    
    if (imagesWithoutAlt > 0) {
      result.issues.push({
        type: images.length === imagesWithoutAlt ? 'error' : 'warning',
        message: `${imagesWithoutAlt}/${images.length} 个图片缺少alt属性`,
        suggestion: '为所有图片添加描述性的alt属性，以改善可访问性和SEO'
      });
      result.score -= Math.min(10, imagesWithoutAlt);
    }
    
    // 5. 检查关键词
    let keywordsFound = 0;
    const bodyText = $('body').text().toLowerCase();
    
    for (const keyword of config.keywords) {
      if (bodyText.includes(keyword.toLowerCase())) {
        keywordsFound++;
      }
    }
    
    const keywordPercentage = keywordsFound / config.keywords.length;
    if (keywordPercentage < 0.1 && images.length > 0) {
      result.issues.push({
        type: 'warning',
        message: '页面缺少关键词',
        suggestion: '在页面内容中自然地添加更多相关关键词'
      });
      result.score -= 5;
    }
    
    // 6. 检查链接文本
    const links = $('a');
    let genericLinks = 0;
    
    links.each(function() {
      const text = $(this).text().trim().toLowerCase();
      if (text === '点击这里' || text === '查看更多' || text === '更多' || text === '这里' || text === '' || text === 'click here') {
        genericLinks++;
      }
    });
    
    if (genericLinks > 0) {
      result.issues.push({
        type: 'warning',
        message: `${genericLinks} 个链接使用通用文本`,
        suggestion: '使用更具描述性的链接文本，而不是"点击这里"或"查看更多"'
      });
      result.score -= Math.min(5, genericLinks);
    }
    
    // 7. 检查移动友好度
    const viewport = $('meta[name="viewport"]').attr('content');
    if (!viewport) {
      result.issues.push({
        type: 'error',
        message: '缺少viewport元标签',
        suggestion: '添加viewport元标签以确保页面在移动设备上正确显示'
      });
      result.score -= 10;
    }
    
    // 8. 检查语言标签
    const htmlLang = $('html').attr('lang');
    if (!htmlLang) {
      result.issues.push({
        type: 'warning',
        message: '缺少html语言属性',
        suggestion: '添加lang属性到html标签，例如lang="zh-CN"'
      });
      result.score -= 3;
    }
    
    return result;
  } catch (err) {
    console.error(chalk.red(`检查失败: ${err.message}`));
    return {
      filePath,
      issues: [{
        type: 'error',
        message: `无法解析文件: ${err.message}`,
        suggestion: '检查文件编码和HTML结构'
      }],
      score: 0
    };
  }
}

// 生成SEO报告
function generateReport(results) {
  const reportPath = './seo-report.html';
  
  // 按分数排序
  results.sort((a, b) => a.score - b.score);
  
  // 计算平均分
  const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
  
  let reportHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO优化报告 - 迈格库物流</title>
  <style>
    body {
      font-family: "SF Pro Display", "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "微软雅黑", sans-serif;
      line-height: 1.5;
      color: #1d1d1f;
      margin: 0;
      padding: 20px;
    }
    h1, h2, h3 {
      font-weight: 500;
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
    .score-container {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    .score {
      font-size: 48px;
      font-weight: 700;
      margin-right: 20px;
    }
    .score-good {
      color: #34c759;
    }
    .score-medium {
      color: #ff9500;
    }
    .score-bad {
      color: #ff3b30;
    }
    .page-item {
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e6e6e6;
    }
    .page-title {
      font-weight: 500;
      margin: 0;
    }
    .page-score {
      font-size: 24px;
      font-weight: 600;
    }
    .issue-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .issue-item {
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f7;
    }
    .issue-error {
      color: #ff3b30;
    }
    .issue-warning {
      color: #ff9500;
    }
    .issue-suggestion {
      margin-top: 4px;
      color: #6e6e73;
      font-size: 14px;
    }
    .no-issues {
      color: #34c759;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="report">
    <h1>SEO优化报告</h1>
    
    <div class="summary">
      <h2>总体评估</h2>
      
      <div class="score-container">
        <div class="score ${averageScore >= 90 ? 'score-good' : averageScore >= 70 ? 'score-medium' : 'score-bad'}">${Math.round(averageScore)}</div>
        <div class="score-info">
          <h3>网站SEO评分</h3>
          <p>基于 ${results.length} 个页面的分析</p>
        </div>
      </div>
      
      <h3>主要发现</h3>
      <ul>
`;
  
  // 统计常见问题
  const issueCount = {};
  results.forEach(result => {
    result.issues.forEach(issue => {
      if (!issueCount[issue.message]) {
        issueCount[issue.message] = 1;
      } else {
        issueCount[issue.message]++;
      }
    });
  });
  
  // 按出现频率排序问题
  const sortedIssues = Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  sortedIssues.forEach(([message, count]) => {
    reportHtml += `        <li>${message} (出现在 ${count} 个页面)</li>\n`;
  });
  
  reportHtml += `
      </ul>
    </div>
    
    <h2>页面详情</h2>
`;
  
  results.forEach(result => {
    const scoreClass = result.score >= 90 ? 'score-good' : result.score >= 70 ? 'score-medium' : 'score-bad';
    
    reportHtml += `
    <div class="page-item">
      <div class="page-header">
        <h3 class="page-title">${result.filePath}</h3>
        <div class="page-score ${scoreClass}">${result.score}</div>
      </div>
      
      ${result.issues.length === 0 
        ? '<p class="no-issues">没有发现问题！</p>' 
        : `<ul class="issue-list">
        ${result.issues.map(issue => `
          <li class="issue-item issue-${issue.type}">
            <strong>${issue.message}</strong>
            <div class="issue-suggestion">${issue.suggestion}</div>
          </li>
        `).join('')}
      </ul>`}
    </div>
`;
  });
  
  reportHtml += `
    <h2>改进建议</h2>
    <ol>
      <li>为所有图片添加有描述性的alt属性</li>
      <li>确保每个页面有一个明确的、包含关键词的H1标题</li>
      <li>优化页面标题和meta描述，使其既有吸引力又包含关键词</li>
      <li>使用更具描述性的链接文本，避免"点击这里"等通用词汇</li>
      <li>确保所有页面都适配移动设备</li>
    </ol>
  </div>
</body>
</html>
`;
  
  fs.writeFileSync(reportPath, reportHtml);
  console.log(chalk.green(`✓ SEO报告已生成: ${reportPath}`));
}

// 主函数
async function main() {
  console.log(chalk.blue('=== SEO检查工具 ==='));
  
  // 获取所有HTML文件
  let allFiles = [];
  for (const dir of config.scanDirs) {
    if (fs.existsSync(dir)) {
      const files = getHtmlFiles(dir);
      allFiles = allFiles.concat(files);
    } else {
      console.log(chalk.yellow(`警告: 目录不存在 ${dir}`));
    }
  }
  
  console.log(chalk.blue(`找到 ${allFiles.length} 个HTML文件`));
  
  // 检查每个页面
  const results = [];
  for (const [index, filePath] of allFiles.entries()) {
    console.log(chalk.blue(`\n[${index + 1}/${allFiles.length}] 检查中...`));
    const result = checkPage(filePath);
    results.push(result);
    
    // 显示简要结果
    if (result.score >= 90) {
      console.log(chalk.green(`  ✓ 评分: ${result.score} (良好)`));
    } else if (result.score >= 70) {
      console.log(chalk.yellow(`  ⚠ 评分: ${result.score} (一般)`));
    } else {
      console.log(chalk.red(`  ✗ 评分: ${result.score} (较差)`));
    }
    
    if (result.issues.length > 0) {
      console.log(chalk.blue(`  - 发现 ${result.issues.length} 个问题`));
    }
  }
  
  // 生成报告
  generateReport(results);
  
  console.log(chalk.green(`\n✓ 完成! 共检查 ${allFiles.length} 个页面`));
}

// 运行程序
main().catch(err => {
  console.error(chalk.red('程序出错:', err));
  process.exit(1);
});
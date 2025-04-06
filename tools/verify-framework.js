/**
 * 框架验证工具
 * 
 * 此工具用于验证网站页面是否正确应用了统一框架设计。
 * 扫描所有HTML文件，检查是否包含必要的框架元素。
 * 
 * @author 迈格库开发团队
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// 配置项
const config = {
  // 要扫描的目录
  directories: [
    '.',
    './products',
    './regions',
    './tools-guides',
    './static-tools',
    './static-news',
    './news'
  ],
  // 要排除的目录
  excludeDirs: [
    'node_modules',
    '.git',
    'assets',
    'components',
    'tools',
    'docs'
  ],
  // 要检查的框架元素
  frameworkElements: {
    globalCss: 'global.css',
    layoutCss: 'layout.css',
    headerElement: 'id="header"',
    footerElement: 'id="footer"',
    componentsJs: 'components.js'
  },
  // 报告文件路径
  reportPath: './docs/framework-verification-report.md'
};

/**
 * 查找目录中的所有HTML文件（同步版本）
 * @param {string} dir - 要扫描的目录
 * @param {Array} results - 结果数组
 * @returns {Array} HTML文件路径数组
 */
function findHtmlFilesSync(dir, results = []) {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`目录不存在，跳过: ${dir}`);
      return results;
    }
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = fs.statSync(filePath);
      
      if (fileStat.isDirectory()) {
        if (!config.excludeDirs.includes(file)) {
          findHtmlFilesSync(filePath, results);
        }
      } else if (path.extname(file).toLowerCase() === '.html') {
        results.push(filePath);
      }
    }
    
    return results;
  } catch (err) {
    console.error(`扫描目录 ${dir} 出错:`, err);
    return results;
  }
}

/**
 * 验证单个HTML文件（同步版本）
 * @param {string} filePath - HTML文件路径
 * @returns {Object} 验证结果
 */
function verifyHtmlFileSync(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = {
      filePath,
      hasGlobalCss: content.includes(config.frameworkElements.globalCss),
      hasLayoutCss: content.includes(config.frameworkElements.layoutCss),
      hasHeader: content.includes(config.frameworkElements.headerElement),
      hasFooter: content.includes(config.frameworkElements.footerElement),
      hasComponentsJs: content.includes(config.frameworkElements.componentsJs),
    };
    
    result.isValid = result.hasGlobalCss && result.hasLayoutCss && 
                    result.hasHeader && result.hasFooter && result.hasComponentsJs;
    
    return result;
  } catch (err) {
    console.error(`验证文件 ${filePath} 出错:`, err);
    return {
      filePath,
      error: err.message,
      isValid: false
    };
  }
}

/**
 * 生成控制台报告
 * @param {Array} results - 验证结果
 */
function generateConsoleReport(results) {
  const validFiles = results.filter(r => r.isValid);
  const invalidFiles = results.filter(r => !r.isValid);
  
  console.log('\n================================================');
  console.log('           迈格库网站框架验证报告               ');
  console.log('================================================\n');
  
  console.log(`总计检查: ${results.length} 个文件`);
  console.log(`验证通过: ${validFiles.length} 个文件`);
  console.log(`验证失败: ${invalidFiles.length} 个文件\n`);
  
  if (invalidFiles.length > 0) {
    console.log('以下文件需要注意:');
    console.log('------------------------------------------------');
    
    // 仅显示前10个失败文件
    const displayFiles = invalidFiles.slice(0, 10);
    
    displayFiles.forEach(file => {
      console.log(`\n文件: ${file.filePath}`);
      if (file.error) {
        console.log(`错误: ${file.error}`);
      } else {
        if (!file.hasGlobalCss) console.log('- 缺少全局样式表 (global.css)');
        if (!file.hasLayoutCss) console.log('- 缺少布局样式表 (layout.css)');
        if (!file.hasHeader) console.log('- 缺少头部元素 (id="header")');
        if (!file.hasFooter) console.log('- 缺少页脚元素 (id="footer")');
        if (!file.hasComponentsJs) console.log('- 缺少组件脚本 (components.js)');
      }
    });
    
    if (invalidFiles.length > 10) {
      console.log(`\n...以及其他 ${invalidFiles.length - 10} 个文件`);
    }
    
    console.log('\n完整报告已保存至: ' + config.reportPath);
  } else {
    console.log('恭喜! 所有文件均已正确应用框架。');
  }
  
  console.log('\n================================================');
  console.log(`验证时间: ${new Date().toLocaleString()}`);
  console.log('================================================\n');
}

/**
 * 生成Markdown报告文件
 * @param {Array} results - 验证结果
 */
function generateMarkdownReport(results) {
  const validFiles = results.filter(r => r.isValid);
  const invalidFiles = results.filter(r => !r.isValid);
  
  let markdown = `# 迈格库网站框架验证报告

## 概述

本报告列出了网站所有页面的框架验证结果，帮助开发团队识别任何尚未正确应用统一框架的页面。

## 验证统计

- **检查文件总数**: ${results.length}
- **验证通过文件**: ${validFiles.length}
- **验证失败文件**: ${invalidFiles.length}

## 验证项目

框架验证工具检查了以下元素是否存在于每个HTML文件中:

- 全局样式表 (\`global.css\`)
- 布局样式表 (\`layout.css\`)
- 头部组件元素 (\`id="header"\`)
- 页脚组件元素 (\`id="footer"\`)
- 组件加载脚本 (\`components.js\`)

## 验证详情

`;

  if (invalidFiles.length > 0) {
    markdown += `### 需要注意的文件

以下文件需要手动检查，因为它们缺少一个或多个框架元素:

| 文件路径 | 问题描述 |
|---------|---------|
`;

    invalidFiles.forEach(file => {
      let issues = [];
      if (file.error) {
        issues.push(`读取错误: ${file.error}`);
      } else {
        if (!file.hasGlobalCss) issues.push('缺少全局样式表');
        if (!file.hasLayoutCss) issues.push('缺少布局样式表');
        if (!file.hasHeader) issues.push('缺少头部元素');
        if (!file.hasFooter) issues.push('缺少页脚元素');
        if (!file.hasComponentsJs) issues.push('缺少组件脚本');
      }
      
      markdown += `| \`${file.filePath}\` | ${issues.join(', ')} |\n`;
    });
  } else {
    markdown += `### 验证结果

✅ **所有检查的文件均已正确应用框架**

没有发现任何问题，所有文件都包含所需的框架元素。
`;
  }

  markdown += `\n## 推荐操作`;
  
  if (invalidFiles.length > 0) {
    markdown += `

针对验证失败的文件，建议采取以下操作:

1. 运行以下命令，使用框架更新工具重新应用框架:
   \`\`\`
   node tools/update-framework.js
   \`\`\`

2. 对于特殊页面(如登录、注册等)，可能需要手动调整框架应用方式

3. 更新完成后，再次运行验证工具确认问题已解决:
   \`\`\`
   node tools/verify-framework.js
   \`\`\``;
  } else {
    markdown += `

✅ **无需采取操作**

所有页面已正确应用框架，无需额外处理。

建议定期运行验证工具，确保新添加的页面也遵循框架规范。`;
  }

  markdown += `

## 后续工作

1. 增强网站性能
   - 考虑启用资源压缩
   - 优化图片加载

2. 完善响应式设计
   - 测试所有设备尺寸
   - 优化移动端体验

报告生成时间: ${new Date().toLocaleString()}`;

  try {
    fs.writeFileSync(config.reportPath, markdown);
    console.log(`报告已保存至: ${config.reportPath}`);
  } catch (err) {
    console.error(`保存报告失败:`, err);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('迈格库网站框架验证工具 v1.0.0');
  console.log('==================================');
  console.log('正在扫描HTML文件...');
  
  let allFiles = [];
  
  // 扫描所有目录
  for (const dir of config.directories) {
    try {
      const files = findHtmlFilesSync(dir);
      allFiles = [...allFiles, ...files];
    } catch (err) {
      console.error(`扫描目录 ${dir} 时出错:`, err);
    }
  }
  
  console.log(`找到 ${allFiles.length} 个HTML文件`);
  console.log('正在验证文件...');
  
  // 验证每个文件
  const results = [];
  let counter = 0;
  
  for (const file of allFiles) {
    counter++;
    const result = verifyHtmlFileSync(file);
    results.push(result);
    
    // 实时输出进度
    process.stdout.write(`\r正在验证: ${counter}/${allFiles.length}`);
  }
  
  // 清除进度行
  process.stdout.write('\r\x1b[K');
  
  // 生成报告
  generateConsoleReport(results);
  
  // 生成Markdown报告
  generateMarkdownReport(results);
}

// 执行主函数
try {
  main();
} catch (err) {
  console.error('发生错误:', err);
  process.exit(1);
} 
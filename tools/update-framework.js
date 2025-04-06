/**
 * 框架更新工具
 * 
 * 此工具用于将新的统一框架设计应用到网站的所有现有页面。
 * 自动扫描指定目录下的HTML文件，并更新它们以使用新的头部、页脚组件和样式表。
 * 
 * @author 迈格库开发团队
 * @version 1.0.0
 */

// 导入所需模块
const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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
    './news',
    './shipping-methods'
  ],
  // 要排除的目录
  excludeDirs: [
    'node_modules',
    '.git',
    'assets',
    'components'
  ],
  // 要插入的CSS链接
  cssLinks: [
    '<link rel="stylesheet" href="/assets/css/global.css">',
    '<link rel="stylesheet" href="/assets/css/layout.css">'
  ],
  // 要加载的组件JS
  componentScript: '<script src="/assets/js/components.js"></script>',
  // 头部组件HTML ID
  headerPlaceholder: '<header id="header"></header>',
  // 页脚组件HTML ID
  footerPlaceholder: '<footer id="footer"></footer>',
  // 字体和图标链接
  fontLinks: [
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">',
    '<link href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600&display=swap" rel="stylesheet">'
  ],
  // 视口设置
  viewportMeta: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
};

/**
 * 查找目录中的所有HTML文件
 * @param {string} dir - 要扫描的目录
 * @param {Array} results - 结果数组
 * @returns {Promise<Array>} HTML文件路径数组
 */
async function findHtmlFiles(dir, results = []) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        if (!config.excludeDirs.includes(file)) {
          await findHtmlFiles(filePath, results);
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
 * 更新HTML文件以应用新框架
 * @param {string} filePath - HTML文件路径
 * @returns {Promise<boolean>} 是否成功更新
 */
async function updateHtmlFile(filePath) {
  try {
    // 读取文件内容
    let content = await readFile(filePath, 'utf8');
    let modified = false;
    
    // 检查文件是否已经使用了新框架
    if (content.includes('global.css') && content.includes('layout.css') && 
        content.includes('id="header"') && content.includes('id="footer"')) {
      console.log(`文件已更新: ${filePath}`);
      return false;
    }
    
    // 创建备份
    await writeFile(`${filePath}.bak`, content, 'utf8');
    
    // 插入视口设置
    if (!content.includes('viewport')) {
      content = content.replace(/<head[^>]*>/, `$&\n  ${config.viewportMeta}`);
      modified = true;
    }
    
    // 插入CSS链接
    if (!content.includes('global.css')) {
      const cssLinksStr = config.cssLinks.join('\n  ');
      content = content.replace(/<\/head>/, `  ${cssLinksStr}\n</head>`);
      modified = true;
    }
    
    // 插入字体和图标链接
    if (!content.includes('font-awesome')) {
      const fontLinksStr = config.fontLinks.join('\n  ');
      content = content.replace(/<\/head>/, `  ${fontLinksStr}\n</head>`);
      modified = true;
    }
    
    // 替换或添加头部
    if (!content.includes('id="header"')) {
      if (content.includes('<header')) {
        content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/, config.headerPlaceholder);
      } else {
        content = content.replace(/<body[^>]*>/, `$&\n  ${config.headerPlaceholder}`);
      }
      modified = true;
    }
    
    // 替换或添加页脚
    if (!content.includes('id="footer"')) {
      if (content.includes('<footer')) {
        content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/, config.footerPlaceholder);
      } else {
        content = content.replace(/<\/body>/, `  ${config.footerPlaceholder}\n</body>`);
      }
      modified = true;
    }
    
    // 添加组件脚本
    if (!content.includes('components.js')) {
      content = content.replace(/<\/body>/, `  ${config.componentScript}\n</body>`);
      modified = true;
    }
    
    // 如果有修改，写入文件
    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`已更新文件: ${filePath}`);
      return true;
    } else {
      console.log(`无需更新: ${filePath}`);
      return false;
    }
    
  } catch (err) {
    console.error(`更新文件 ${filePath} 出错:`, err);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('迈格库网站框架更新工具 v1.0.0');
  console.log('==================================');
  console.log('正在扫描HTML文件...');
  
  let allFiles = [];
  
  // 扫描所有目录
  for (const dir of config.directories) {
    const files = await findHtmlFiles(dir);
    allFiles = [...allFiles, ...files];
  }
  
  console.log(`找到 ${allFiles.length} 个HTML文件`);
  console.log('开始更新文件...');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  // 更新每个文件
  for (const file of allFiles) {
    try {
      const updated = await updateHtmlFile(file);
      if (updated) {
        successCount++;
      } else {
        skipCount++;
      }
    } catch (err) {
      console.error(`更新 ${file} 时出错:`, err);
      errorCount++;
    }
  }
  
  console.log('\n更新完成!');
  console.log(`成功更新: ${successCount} 个文件`);
  console.log(`无需更新: ${skipCount} 个文件`);
  console.log(`更新失败: ${errorCount} 个文件`);
}

// 执行主函数
main().catch(err => {
  console.error('发生错误:', err);
  process.exit(1);
}); 
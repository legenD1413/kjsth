/**
 * 工具与指南静态页面生成脚本
 * 从CMS抓取最新的工具与指南内容，并生成静态HTML页面
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

// 配置参数
const CONFIG = {
  // CMS API 地址
  cmsApiUrl: 'https://cms.kjsth.com/wp-json/wp/v2',
  // 输出目录
  outputDir: path.join(__dirname, '../tools-guides'),
  // 工具模板路径
  templatePath: path.join(__dirname, './tool-template.html'),
  // 工具与指南分类映射
  categories: {
    calculators: { id: 10, name: '计算工具', icon: 'fas fa-calculator' },
    guides: { id: 11, name: '指南文档', icon: 'fas fa-book' },
    forms: { id: 12, name: '表格文档', icon: 'fas fa-file-alt' },
    regulations: { id: 13, name: '法规解读', icon: 'fas fa-gavel' },
    interactive: { id: 14, name: '互动工具', icon: 'fas fa-laptop-code' }
  },
  // 地区映射
  regions: {
    global: { id: 20, name: '全球' },
    'north-america': { id: 21, name: '北美' },
    'south-america': { id: 22, name: '南美' },
    europe: { id: 23, name: '欧洲' },
    australia: { id: 24, name: '澳洲' },
    'middle-east': { id: 25, name: '中东' },
    'southeast-asia': { id: 26, name: '东南亚' },
    africa: { id: 27, name: '非洲' }
  },
  // 重要程度映射
  importance: {
    normal: { class: 'importance-normal', name: '普通' },
    important: { class: 'importance-important', name: '重要' },
    critical: { class: 'importance-critical', name: '关键' }
  }
};

/**
 * 从CMS获取最新工具与指南内容
 * @param {string} category 工具分类
 * @returns {Promise<Array>} 工具与指南文章数组
 */
async function fetchToolsFromCMS(category) {
  try {
    const categoryId = CONFIG.categories[category].id;
    const response = await axios.get(`${CONFIG.cmsApiUrl}/posts`, {
      params: {
        categories: categoryId,
        per_page: 100,
        _embed: true
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`获取${category}内容失败:`, error.message);
    return [];
  }
}

/**
 * 解析文章内容，处理特殊标记和内容
 * @param {string} content 文章原始内容
 * @returns {Object} 处理后的内容对象
 */
function parseToolContent(content) {
  // 解析HTML内容
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  // 提取交互工具代码
  let interactiveCode = '';
  const interactiveDiv = document.querySelector('.interactive-tool');
  if (interactiveDiv) {
    interactiveCode = interactiveDiv.outerHTML;
    interactiveDiv.remove();
  }
  
  // 提取相关工具
  let relatedTools = [];
  const relatedToolsList = document.querySelector('.related-tools-list');
  if (relatedToolsList) {
    const links = relatedToolsList.querySelectorAll('a');
    links.forEach(link => {
      relatedTools.push({
        title: link.textContent.trim(),
        url: link.getAttribute('href'),
        icon: link.querySelector('i')?.className || 'fas fa-link'
      });
    });
    
    // 移除相关工具部分，因为会单独处理
    const relatedToolsDiv = document.querySelector('.related-tools');
    if (relatedToolsDiv) {
      relatedToolsDiv.remove();
    }
  }
  
  // 清理内容，移除不必要的属性
  const contentElements = document.querySelectorAll('body > *');
  let cleanedContent = '';
  contentElements.forEach(el => {
    cleanedContent += el.outerHTML;
  });

  return {
    mainContent: cleanedContent,
    interactiveCode,
    relatedTools
  };
}

/**
 * 检查并创建目录
 * @param {string} dir 目录路径
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`创建目录: ${dir}`);
  }
}

/**
 * 生成工具详情页面
 * @param {Object} tool 工具详情对象
 * @param {string} category 工具分类
 */
async function generateToolPage(tool, category) {
  try {
    // 确保分类目录存在
    const categoryDir = path.join(CONFIG.outputDir, category);
    ensureDirectoryExists(categoryDir);
    
    // 读取模板文件
    const template = fs.readFileSync(CONFIG.templatePath, 'utf8');
    
    // 解析文章内容
    const { mainContent, interactiveCode, relatedTools } = parseToolContent(tool.content.rendered);
    
    // 获取日期
    const date = new Date(tool.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 获取地区信息
    let regionName = '全球';
    if (tool._embedded && tool._embedded['wp:term']) {
      // 查找区域分类
      for (const terms of tool._embedded['wp:term']) {
        for (const term of terms) {
          // 检查是否是地区分类
          for (const regionKey in CONFIG.regions) {
            if (CONFIG.regions[regionKey].id === term.id) {
              regionName = CONFIG.regions[regionKey].name;
              break;
            }
          }
        }
      }
    }
    
    // 获取重要性
    let importance = CONFIG.importance.normal;
    // 这里可以添加逻辑来从文章标签或自定义字段中获取重要性
    
    // 替换模板变量
    let htmlContent = template
      .replace(/{{TITLE}}/g, tool.title.rendered)
      .replace(/{{DATE}}/g, formattedDate)
      .replace(/{{CATEGORY}}/g, CONFIG.categories[category].name)
      .replace(/{{REGION_NAME}}/g, regionName)
      .replace(/{{IMPORTANCE}}/g, importance.name)
      .replace(/{{IMPORTANCE_CLASS}}/g, importance.class)
      .replace(/{{CONTENT}}/g, mainContent);
    
    // 插入交互工具代码
    if (interactiveCode) {
      htmlContent = htmlContent.replace(/<!-- {{INTERACTIVE_TOOL}} -->/g, interactiveCode);
    } else {
      // 移除交互工具区域占位符
      htmlContent = htmlContent.replace(/<!-- {{INTERACTIVE_TOOL}} -->/g, '');
    }
    
    // 处理相关工具
    if (relatedTools.length > 0) {
      let relatedToolsHTML = '<div class="related-tools">\n';
      relatedToolsHTML += '  <h4>相关工具</h4>\n';
      relatedToolsHTML += '  <ul class="related-tools-list">\n';
      
      relatedTools.forEach(tool => {
        relatedToolsHTML += `    <li>\n`;
        relatedToolsHTML += `      <a href="${tool.url}" class="related-tool-link">\n`;
        relatedToolsHTML += `        <i class="${tool.icon}"></i>\n`;
        relatedToolsHTML += `        ${tool.title}\n`;
        relatedToolsHTML += `      </a>\n`;
        relatedToolsHTML += `    </li>\n`;
      });
      
      relatedToolsHTML += '  </ul>\n';
      relatedToolsHTML += '</div>';
      
      htmlContent = htmlContent.replace(/<!-- {{RELATED_TOOLS}} -->/g, relatedToolsHTML);
    } else {
      // 移除相关工具区域占位符
      htmlContent = htmlContent.replace(/<!-- {{RELATED_TOOLS}} -->/g, '');
    }
    
    // 写入HTML文件
    const outputFile = path.join(categoryDir, `${tool.id}.html`);
    fs.writeFileSync(outputFile, htmlContent);
    console.log(`生成工具页面: ${outputFile}`);
    
    return {
      id: tool.id,
      title: tool.title.rendered,
      slug: tool.slug,
      date: formattedDate,
      excerpt: tool.excerpt.rendered,
      region: regionName,
      importance: importance.name
    };
  } catch (error) {
    console.error(`生成工具页面失败:`, error);
    return null;
  }
}

/**
 * 生成分类索引页面
 * @param {string} category 工具分类
 * @param {Array} tools 工具列表
 */
function generateCategoryIndexPage(category, tools) {
  try {
    const categoryInfo = CONFIG.categories[category];
    const categoryDir = path.join(CONFIG.outputDir, category);
    
    // 创建HTML内容
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${categoryInfo.name} | 麦极客物流</title>
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        /* 全局字体设置 - 采用Apple风格字体 */
        body, h1, h2, h3, h4, h5, h6, p, a, span, div, button {
            font-family: "SF Pro Display", "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "微软雅黑", sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .tools-container {
            max-width: 1000px;
            margin: 40px auto;
            padding: 0 20px;
        }
        
        .page-header {
            margin-bottom: 30px;
            text-align: center;
            padding: 30px 0;
            background-color: #f5f5f7;
            border-radius: 12px;
        }
        
        .page-header h1 {
            font-size: 2.2rem;
            font-weight: 500;
            color: #1d1d1f;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .page-header h1 i {
            margin-right: 15px;
            color: #0071e3;
        }
        
        .page-header p {
            font-size: 1.1rem;
            color: #6e6e73;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .tools-list {
            list-style: none;
            padding: 0;
        }
        
        .tool-item {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            margin-bottom: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .tool-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .tool-link {
            display: flex;
            text-decoration: none;
            color: inherit;
            padding: 20px;
        }
        
        .tool-icon {
            flex: 0 0 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0071e3;
            font-size: 1.8rem;
        }
        
        .tool-content {
            flex: 1;
            padding-left: 15px;
        }
        
        .tool-title {
            font-size: 1.2rem;
            font-weight: 500;
            margin: 0 0 10px 0;
            color: #1d1d1f;
        }
        
        .tool-excerpt {
            color: #6e6e73;
            font-size: 0.95rem;
            margin: 0 0 10px 0;
            line-height: 1.5;
        }
        
        .tool-meta {
            display: flex;
            color: #86868b;
            font-size: 0.85rem;
            align-items: center;
        }
        
        .tool-meta span {
            display: flex;
            align-items: center;
            margin-right: 15px;
        }
        
        .tool-meta i {
            margin-right: 5px;
        }
        
        .importance-tag {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-left: auto;
        }
        
        .importance-normal {
            background-color: #f5f5f7;
            color: #6e6e73;
        }
        
        .importance-important {
            background-color: #fff9e9;
            color: #b58e00;
        }
        
        .importance-critical {
            background-color: #fef2f2;
            color: #dc2626;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            padding: 0.8rem 1.2rem;
            background-color: #f5f5f7;
            color: #1d1d1f;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.95rem;
            margin-top: 30px;
            transition: all 0.2s ease;
        }
        
        .back-link:hover {
            background-color: #e8e8ed;
        }
        
        .back-link i {
            margin-right: 8px;
        }
        
        @media (max-width: 768px) {
            .tool-link {
                flex-direction: column;
            }
            
            .tool-icon {
                margin-bottom: 15px;
            }
            
            .tool-content {
                padding-left: 0;
            }
            
            .tool-meta {
                flex-wrap: wrap;
            }
            
            .importance-tag {
                margin-left: 0;
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="main-nav">
            <div class="logo">
                <img src="../../assets/images/logo.png" alt="麦极客物流Logo">
                <span>麦极客物流</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="fas fa-globe-americas"></i>
                        区域
                        <i class="fas fa-chevron-down"></i>
                    </a>
                    <ul class="submenu">
                        <li><a href="../../regions/north-america/index.html">北美</a></li>
                        <li><a href="../../regions/south-america/index.html">南美</a></li>
                        <li><a href="../../regions/europe/index.html">欧洲</a></li>
                        <li><a href="../../regions/australia/index.html">澳洲</a></li>
                        <li><a href="../../regions/middle-east/index.html">中东</a></li>
                        <li><a href="../../regions/southeast-asia/index.html">东南亚</a></li>
                        <li><a href="../../regions/africa/index.html">非洲</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="fas fa-box"></i>
                        货品
                        <i class="fas fa-chevron-down"></i>
                    </a>
                    <ul class="submenu">
                        <li><a href="../../products/regular/index.html">普货</a></li>
                        <li><a href="../../products/cosmetics/index.html">化妆品</a></li>
                        <li><a href="../../products/liquids/index.html">液体</a></li>
                        <li><a href="../../products/e-cigarettes/index.html">电子烟</a></li>
                        <li><a href="../../products/batteries/index.html">电池</a></li>
                        <li><a href="../../products/electronic-with-battery/index.html">内电</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a href="../index.html" class="nav-link active">
                        <i class="fas fa-tools"></i>
                        工具与指南
                    </a>
                </li>
                <li class="nav-item">
                    <a href="../../contact.html" class="nav-link">
                        <i class="fas fa-envelope"></i>
                        联系我们
                    </a>
                </li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="tools-container">
            <div class="page-header">
                <h1><i class="${categoryInfo.icon}"></i>${categoryInfo.name}</h1>
                <p>${getCategoryDescription(category)}</p>
            </div>
            
            <ul class="tools-list">`;
    
    // 添加工具列表
    if (tools.length > 0) {
      tools.sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期降序排序
      
      tools.forEach(tool => {
        // 获取重要性样式
        let importanceClass = 'importance-normal';
        for (const key in CONFIG.importance) {
          if (CONFIG.importance[key].name === tool.importance) {
            importanceClass = CONFIG.importance[key].class;
            break;
          }
        }
        
        // 清理摘要内容
        let excerpt = tool.excerpt;
        excerpt = excerpt.replace(/<p>/g, '').replace(/<\/p>/g, '').trim();
        
        html += `
                <li class="tool-item">
                    <a href="${tool.id}.html" class="tool-link">
                        <div class="tool-icon">
                            <i class="${categoryInfo.icon}"></i>
                        </div>
                        <div class="tool-content">
                            <h3 class="tool-title">${tool.title}</h3>
                            <p class="tool-excerpt">${excerpt}</p>
                            <div class="tool-meta">
                                <span><i class="far fa-calendar-alt"></i>${tool.date}</span>
                                <span><i class="fas fa-map-marker-alt"></i>${tool.region}</span>
                                <span class="importance-tag ${importanceClass}">${tool.importance}</span>
                            </div>
                        </div>
                    </a>
                </li>`;
      });
    } else {
      html += `
                <li class="tool-item" style="text-align: center; padding: 30px;">
                    <p>当前分类暂无工具</p>
                </li>`;
    }
    
    html += `
            </ul>
            
            <a href="../index.html" class="back-link">
                <i class="fas fa-arrow-left"></i>
                返回所有工具
            </a>
        </div>
    </main>
    
    <footer>
        <p>&copy; 2024 麦极客物流 | 让全球物流触手可及</p>
    </footer>
</body>
</html>`;
    
    // 写入HTML文件
    const outputFile = path.join(categoryDir, 'index.html');
    fs.writeFileSync(outputFile, html);
    console.log(`生成分类索引页面: ${outputFile}`);
  } catch (error) {
    console.error(`生成分类索引页面失败:`, error);
  }
}

/**
 * 获取分类描述
 * @param {string} category 分类名称
 * @returns {string} 分类描述
 */
function getCategoryDescription(category) {
  const descriptions = {
    calculators: '提供国际物流所需的各类计算工具，包括体积重计算、运费估算、关税计算等，帮助您准确评估物流成本和时间。',
    guides: '提供详细的物流操作指南，包括包装指南、清关流程、物流选择等实用内容，助您轻松应对国际物流的各个环节。',
    forms: '提供国际物流必备的各类表格文档，包括报关单、商业发票、装箱单等，支持下载和在线填写，简化您的物流流程。',
    regulations: '提供最新的国际物流法规解读，帮助您了解各国海关政策、进出口限制、合规要求等重要信息，避免物流障碍。',
    interactive: '提供交互式物流工具，包括路线规划、物流方案比较、货物跟踪等功能，为您提供更加直观和便捷的物流体验。'
  };
  
  return descriptions[category] || '提供国际物流所需的各类工具和指南，助您轻松应对全球物流挑战。';
}

/**
 * 更新主工具与指南索引页面
 * @param {Object} toolsData 各分类工具数据
 */
function updateMainIndexPage(toolsData) {
  try {
    const indexPath = path.join(CONFIG.outputDir, 'index.html');
    
    // 检查index.html是否存在
    if (!fs.existsSync(indexPath)) {
      console.error(`主索引页面 ${indexPath} 不存在，请先创建模板文件`);
      return;
    }
    
    // 读取现有索引页面
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    
    // 使用cheerio解析HTML
    const $ = cheerio.load(indexHtml);
    
    // 更新各分类工具
    for (const category in toolsData) {
      const tools = toolsData[category];
      const $categorySection = $(`#${category}`);
      
      if ($categorySection.length > 0) {
        const $toolsGrid = $categorySection.find('.tools-grid');
        
        // 清空现有内容
        $toolsGrid.empty();
        
        // 显示工具卡片或"无工具"消息
        if (tools.length > 0) {
          // 只显示最新的3个工具
          const recentTools = tools.slice(0, 3);
          
          recentTools.forEach(tool => {
            const toolCard = `
              <a href="${category}/${tool.id}.html" class="tool-card-link">
                <div class="tool-card">
                  <div class="tool-card-icon">
                    <i class="${CONFIG.categories[category].icon}"></i>
                  </div>
                  <div class="tool-card-content">
                    <h3 class="tool-card-title">${tool.title}</h3>
                    <p class="tool-card-desc">${$(tool.excerpt).text()}</p>
                    <div class="tool-card-meta">
                      <span><i class="fas fa-map-marker-alt"></i>${tool.region}</span>
                      <span><i class="far fa-clock"></i>2分钟</span>
                    </div>
                  </div>
                </div>
              </a>
            `;
            
            $toolsGrid.append(toolCard);
          });
        } else {
          $toolsGrid.append(`
            <div class="no-tools-msg">
              <p>${CONFIG.categories[category].name}正在编写中，敬请期待！</p>
            </div>
          `);
        }
      }
    }
    
    // 保存更新后的HTML
    fs.writeFileSync(indexPath, $.html());
    console.log(`更新主索引页面: ${indexPath}`);
  } catch (error) {
    console.error(`更新主索引页面失败:`, error);
  }
}

/**
 * 主函数：生成所有工具与指南页面
 */
async function generateAllToolsPages() {
  console.log('开始生成工具与指南静态页面...');
  
  // 确保输出目录存在
  ensureDirectoryExists(CONFIG.outputDir);
  
  // 存储各分类工具数据
  const toolsData = {};
  
  // 处理每个分类
  for (const category in CONFIG.categories) {
    console.log(`处理分类: ${CONFIG.categories[category].name}`);
    
    // 从CMS获取该分类的工具
    const tools = await fetchToolsFromCMS(category);
    
    if (tools.length > 0) {
      console.log(`找到 ${tools.length} 个${CONFIG.categories[category].name}`);
      
      // 存储该分类的工具数据
      toolsData[category] = [];
      
      // 生成每个工具的详情页面
      for (const tool of tools) {
        const toolData = await generateToolPage(tool, category);
        if (toolData) {
          toolsData[category].push(toolData);
        }
      }
      
      // 生成分类索引页面
      generateCategoryIndexPage(category, toolsData[category]);
    } else {
      console.log(`分类 ${CONFIG.categories[category].name} 暂无工具`);
      toolsData[category] = [];
      
      // 生成空的分类索引页面
      generateCategoryIndexPage(category, []);
    }
  }
  
  // 更新主索引页面
  updateMainIndexPage(toolsData);
  
  console.log('工具与指南静态页面生成完成!');
}

// 执行生成
generateAllToolsPages().catch(error => {
  console.error('生成工具与指南静态页面时发生错误:', error);
}); 
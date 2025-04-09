/**
 * 索引页面自动更新工具
 * 扫描HTML文件目录，提取元数据，生成文章索引页面
 * 用于静态新闻系统和工具指南系统
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 配置信息
const config = {
  // 新闻系统配置
  news: {
    sourceDir: path.resolve(__dirname, '../static-news'),
    regions: ['global', 'north-america', 'south-america', 'europe', 'asia', 'australia', 'africa', 'middle-east'],
    categories: [
      'industry_news', 'policy_updates', 'market_trends', 'technology_innovation', 
      'company_news', 'service_updates', 'price_adjustments', 'trade_alerts', 
      'seasonal_updates', 'disruption_alerts', 'success_stories', 'expert_insights'
    ],
    templateFile: path.resolve(__dirname, '../static-news/news-template.html'),
    indexTemplateName: 'index-template.html',
    getOutputPath: (region) => path.resolve(__dirname, `../static-news/${region}/index.html`)
  },
  // 指南系统配置
  guides: {
    sourceDir: path.resolve(__dirname, '../tools-guides'),
    categories: [
      'regulations', 'customs', 'shipping', 'packaging', 'fba', 'logistics', 
      'calculator', 'declaration', 'tax', 'insurance', 'tracking', 'returns', 
      'international', 'express', 'commercial', 'biggoods', 'warehouse',
      'interactive', 'guides', 'calculators', 'forms'
    ],
    templateFile: path.resolve(__dirname, '../tools-guides/tool-template.html'),
    indexTemplateName: 'index-template.html',
    getOutputPath: (category) => path.resolve(__dirname, `../tools-guides/${category}/index.html`)
  }
};

/**
 * 从HTML文件中提取元数据
 * @param {string} filePath - HTML文件路径
 * @returns {Object|null} - 提取的元数据
 */
function extractMetadata(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // 提取标题
    const title = $('.news-title, .tool-title').first().text().trim();
    if (!title) return null;
    
    // 提取日期
    const dateText = $('.news-date span, .tool-meta .tool-date').text().trim();
    const date = dateText || new Date().toISOString().split('T')[0];
    
    // 提取摘要/内容
    let excerpt = '';
    const content = $('.news-content p, .tool-content p').first().text().trim();
    if (content) {
      excerpt = content.length > 150 ? content.substring(0, 150) + '...' : content;
    }
    
    // 提取重要性
    let importance = 'normal';
    if ($('.importance-important').length > 0) {
      importance = 'important';
    } else if ($('.importance-critical, .importance-very_important').length > 0) {
      importance = 'critical';
    }
    
    // 提取分类和地区
    let category = $('.news-category, .tool-category').text().trim();
    const categories = category.split(',').map(cat => cat.trim());
    
    let region = $('.news-region, .tool-region').text().trim();
    const regions = region.split(',').map(reg => reg.trim().replace(/区域$/, ''));
    
    // 提取关键字
    const keywords = [];
    $('.keyword-tag').each(function() {
      keywords.push($(this).text().trim());
    });
    
    // 计算文件ID
    const fileName = path.basename(filePath);
    const id = fileName.replace('.html', '');
    
    return {
      id,
      title,
      date,
      excerpt,
      importance,
      category,
      categories,
      region,
      regions,
      keywords,
      filePath: filePath.replace(/\\/g, '/'),
      fileName
    };
  } catch (error) {
    console.error(`处理文件${filePath}时出错:`, error);
    return null;
  }
}

/**
 * 扫描目录，获取所有HTML文件的元数据
 * @param {string} directory - 要扫描的目录
 * @param {string} extension - 文件扩展名
 * @param {string} baseDir - 基础目录，用于计算相对路径
 * @returns {Array} - 元数据数组
 */
function scanDirectory(directory, extension = '.html', baseDir = '') {
  if (!baseDir) baseDir = directory;
  
  let results = [];
  
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 递归处理子目录
        const subResults = scanDirectory(fullPath, extension, baseDir);
        results = results.concat(subResults);
      } else if (item.endsWith(extension) && item !== 'index.html' && !item.includes('template')) {
        // 处理HTML文件
        const metadata = extractMetadata(fullPath);
        if (metadata) {
          // 添加相对路径信息
          metadata.relativePath = fullPath.substring(baseDir.length).replace(/\\/g, '/');
          metadata.directory = path.dirname(metadata.relativePath).replace(/^\//, '');
          results.push(metadata);
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录${directory}时出错:`, error);
  }
  
  return results;
}

/**
 * 创建新闻列表HTML
 * @param {Array} articles - 文章元数据数组
 * @returns {string} - HTML字符串
 */
function generateNewsListHTML(articles) {
  if (!articles || articles.length === 0) {
    return `
      <div class="no-news">
        <h3><i class="fas fa-info-circle mr-2"></i> 暂无资讯</h3>
        <p>目前该区域暂无最新物流资讯，请稍后再来查看。</p>
        <a href="../index.html" class="btn btn-outline-primary mt-3">查看其他区域资讯</a>
      </div>
    `;
  }
  
  let html = '';
  
  // 按日期排序
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (const article of articles) {
    // 添加"NEW"标签（如果文章是在最近48小时内发布的）
    const isNew = (new Date() - new Date(article.date)) / (1000 * 60 * 60) < 48;
    const newLabel = isNew ? '<span class="new-label">NEW</span>' : '';
    
    // 添加关键字（最多显示3个）
    let keywordsHtml = '';
    if (article.keywords && article.keywords.length > 0) {
      const displayKeywords = article.keywords.slice(0, 3);
      keywordsHtml = '<div class="article-keywords">';
      displayKeywords.forEach(keyword => {
        keywordsHtml += `<span class="article-keyword">${keyword}</span>`;
      });
      if (article.keywords.length > 3) {
        keywordsHtml += `<span class="article-keyword-more">+${article.keywords.length - 3}</span>`;
      }
      keywordsHtml += '</div>';
    }
    
    html += `
      <div class="news-card">
        <div class="news-card-content">
          <h3 class="news-title">${article.title} ${newLabel}</h3>
          <div class="news-meta">
            <div class="news-date">
              <i class="far fa-calendar-alt mr-2"></i>${article.date}
            </div>
            <div class="news-importance importance-${article.importance}">
              ${article.importance === 'normal' ? '普通' : 
                article.importance === 'important' ? '重要' : '关键'}
            </div>
          </div>
          <p class="news-excerpt">${article.excerpt}</p>
          ${keywordsHtml}
          <a href="${article.fileName}" class="news-read-more">
            <i class="fas fa-arrow-right mr-1"></i>阅读全文
          </a>
        </div>
      </div>
    `;
  }
  
  return html;
}

/**
 * 创建工具指南列表HTML
 * @param {Array} guides - 指南元数据数组
 * @returns {string} - HTML字符串
 */
function generateGuidesListHTML(guides) {
  if (!guides || guides.length === 0) {
    return `
      <div class="no-guides">
        <h3><i class="fas fa-info-circle mr-2"></i> 暂无指南</h3>
        <p>目前该分类暂无工具和指南，请稍后再来查看。</p>
        <a href="../index.html" class="btn btn-outline-primary mt-3">查看其他分类</a>
      </div>
    `;
  }
  
  let html = '';
  
  // 按日期排序
  guides.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (const guide of guides) {
    // 添加"NEW"标签（如果指南是在最近48小时内发布的）
    const isNew = (new Date() - new Date(guide.date)) / (1000 * 60 * 60) < 48;
    const newLabel = isNew ? '<span class="new-label">NEW</span>' : '';
    
    // 添加关键字（最多显示3个）
    let keywordsHtml = '';
    if (guide.keywords && guide.keywords.length > 0) {
      const displayKeywords = guide.keywords.slice(0, 3);
      keywordsHtml = '<div class="article-keywords">';
      displayKeywords.forEach(keyword => {
        keywordsHtml += `<span class="article-keyword">${keyword}</span>`;
      });
      if (guide.keywords.length > 3) {
        keywordsHtml += `<span class="article-keyword-more">+${guide.keywords.length - 3}</span>`;
      }
      keywordsHtml += '</div>';
    }
    
    html += `
      <div class="tool-card">
        <div class="tool-card-content">
          <h3 class="tool-title">${guide.title} ${newLabel}</h3>
          <div class="tool-meta">
            <div class="tool-date">
              <i class="far fa-calendar-alt mr-2"></i>${guide.date}
            </div>
            <div class="tool-importance importance-${guide.importance}">
              ${guide.importance === 'normal' ? '普通' : 
                guide.importance === 'important' ? '重要' : '关键'}
            </div>
          </div>
          <p class="tool-excerpt">${guide.excerpt}</p>
          ${keywordsHtml}
          <a href="${guide.fileName}" class="tool-read-more">
            <i class="fas fa-arrow-right mr-1"></i>查看详情
          </a>
        </div>
      </div>
    `;
  }
  
  return html;
}

/**
 * 更新索引页面内容
 * @param {string} templatePath - 模板文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} contentHTML - 内容HTML
 */
function updateIndexPage(templatePath, outputPath, contentHTML) {
  try {
    let template;
    
    // 尝试读取索引模板
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf8');
    } else {
      // 模板不存在，尝试读取当前索引文件
      if (fs.existsSync(outputPath)) {
        template = fs.readFileSync(outputPath, 'utf8');
      } else {
        console.error(`无法找到模板文件: ${templatePath}`);
        return;
      }
    }
    
    // 使用Cheerio操作HTML
    const $ = cheerio.load(template);
    
    // 确保列表页有关键字样式
    if (!$('style').text().includes('.article-keywords')) {
      $('head').append(`
        <style>
          .article-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
            margin-top: 0.5rem;
            margin-bottom: 0.8rem;
          }
          .article-keyword {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            font-size: 0.75rem;
            border-radius: 2rem;
            background-color: #f0f0f0;
            color: #666;
          }
          .article-keyword-more {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            font-size: 0.75rem;
            border-radius: 2rem;
            background-color: #e9ecef;
            color: #6c757d;
          }
        </style>
      `);
    }
    
    // 更新文章列表区域
    $('.news-list-container .no-news, .news-list-container .news-card, .tools-list-container .no-guides, .tools-list-container .tool-card').remove();
    $('.news-list-container .news-filter, .tools-list-container .tools-filter').after(contentHTML);
    
    // 更新最后更新时间
    const currentTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    $('#lastUpdate').text(currentTime);
    
    // 写入输出文件
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, $.html(), 'utf8');
    console.log(`已更新索引页面: ${outputPath}`);
  } catch (error) {
    console.error(`更新索引页面${outputPath}时出错:`, error);
  }
}

/**
 * 更新新闻列表
 * @param {string} region - 地区
 */
function updateNewsIndex(region) {
  // 获取该区域的所有新闻文件
  const regionDir = path.join(config.news.sourceDir, region);
  
  if (!fs.existsSync(regionDir)) {
    console.log(`区域目录不存在: ${regionDir}`);
    return;
  }
  
  // 获取所有新闻文件
  const allArticles = scanDirectory(config.news.sourceDir);
  
  // 筛选适用于该区域的文章
  const articles = allArticles.filter(article => {
    // 检查文件是否位于该区域目录下
    if (article.directory === region) return true;
    
    // 或者文章的regions包含该区域
    const regionName = getHumanReadableRegion(region);
    return article.regions && article.regions.includes(regionName);
  });
  
  console.log(`区域 ${region} 找到 ${articles.length} 篇文章`);
  
  // 生成列表HTML
  const listHTML = generateNewsListHTML(articles);
  
  // 更新索引页面
  const templatePath = path.join(config.news.sourceDir, config.news.indexTemplateName);
  const outputPath = config.news.getOutputPath(region);
  updateIndexPage(templatePath, outputPath, listHTML);
}

/**
 * 更新指南列表
 * @param {string} category - 分类
 */
function updateGuidesIndex(category) {
  // 获取该分类的所有指南文件
  const categoryDir = path.join(config.guides.sourceDir, category);
  
  if (!fs.existsSync(categoryDir)) {
    console.log(`分类目录不存在: ${categoryDir}`);
    return;
  }
  
  // 获取所有指南文件
  const allGuides = scanDirectory(config.guides.sourceDir);
  
  // 筛选适用于该分类的指南
  const guides = allGuides.filter(guide => {
    // 检查文件是否位于该分类目录下
    if (guide.directory === category) return true;
    
    // 或者指南的categories包含该分类
    const categoryName = getHumanReadableCategory(category);
    return guide.categories && guide.categories.includes(categoryName);
  });
  
  console.log(`分类 ${category} 找到 ${guides.length} 个指南`);
  
  // 生成列表HTML
  const listHTML = generateGuidesListHTML(guides);
  
  // 更新索引页面
  const templatePath = path.join(config.guides.sourceDir, config.guides.indexTemplateName);
  const outputPath = config.guides.getOutputPath(category);
  updateIndexPage(templatePath, outputPath, listHTML);
}

/**
 * 获取地区的人类可读名称
 * @param {string} regionCode - 地区代码
 * @returns {string} - 人类可读的地区名称
 */
function getHumanReadableRegion(regionCode) {
  const regionMap = {
    'global': '全球',
    'north-america': '北美',
    'south-america': '南美',
    'europe': '欧洲',
    'asia': '亚洲',
    'australia': '大洋洲',
    'africa': '非洲',
    'middle-east': '中东'
  };
  
  return regionMap[regionCode] || regionCode;
}

/**
 * 获取分类的人类可读名称
 * @param {string} categoryCode - 分类代码
 * @returns {string} - 人类可读的分类名称
 */
function getHumanReadableCategory(categoryCode) {
  const categoryMap = {
    'regulations': '监管法规',
    'customs': '海关指南',
    'shipping': '运输指南',
    'packaging': '包装指南',
    'fba': '亚马逊FBA',
    'logistics': '物流基础知识',
    'calculator': '实用工具使用指南',
    'declaration': '报关指南',
    'tax': '税务指南',
    'insurance': '保险指南',
    'tracking': '物流跟踪',
    'returns': '退货处理',
    'international': '国际物流',
    'express': '快递服务',
    'commercial': '商业件运输',
    'biggoods': '超大件运输',
    'warehouse': '海外仓',
    'interactive': '互动工具',
    'guides': '指南',
    'calculators': '计算工具',
    'forms': '表单工具'
  };
  
  return categoryMap[categoryCode] || categoryCode;
}

/**
 * 更新所有区域的新闻列表
 */
function updateAllNewsIndices() {
  console.log('开始更新所有新闻列表...');
  
  for (const region of config.news.regions) {
    updateNewsIndex(region);
  }
  
  console.log('所有新闻列表更新完成');
}

/**
 * 更新所有分类的指南列表
 */
function updateAllGuidesIndices() {
  console.log('开始更新所有指南列表...');
  
  for (const category of config.guides.categories) {
    updateGuidesIndex(category);
  }
  
  console.log('所有指南列表更新完成');
}

/**
 * 更新所有索引页面
 */
function updateAllIndices() {
  updateAllNewsIndices();
  updateAllGuidesIndices();
}

// 检查命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  // 默认更新所有索引
  updateAllIndices();
} else {
  const type = args[0].toLowerCase();
  const target = args[1];
  
  if (type === 'news') {
    if (target && config.news.regions.includes(target)) {
      updateNewsIndex(target);
    } else {
      updateAllNewsIndices();
    }
  } else if (type === 'guides') {
    if (target && config.guides.categories.includes(target)) {
      updateGuidesIndex(target);
    } else {
      updateAllGuidesIndices();
    }
  } else {
    console.log('用法: node update-lists.js [news|guides] [地区|分类]');
  }
}

module.exports = {
  updateNewsIndex,
  updateAllNewsIndices,
  updateGuidesIndex,
  updateAllGuidesIndices,
  updateAllIndices
}; 
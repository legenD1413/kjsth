/**
 * 索引页面自动更新工具
 * 扫描HTML文件目录，提取元数据，生成文章索引页面
 * 用于静态新闻系统和工具指南系统
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const moment = require('moment');

// 设置中文日期格式
moment.locale('zh-cn');

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
    templateFile: path.resolve(__dirname, '../templates/content/content-template.html'),
    indexTemplateName: 'index-template.html',
    listTemplatePath: path.resolve(__dirname, '../templates/list/category-list-template.html'),
    mainIndexTemplatePath: path.resolve(__dirname, '../templates/list/index-template.html'),
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
    templateFile: path.resolve(__dirname, '../templates/content/content-template.html'),
    indexTemplateName: 'index-template.html',
    listTemplatePath: path.resolve(__dirname, '../templates/list/category-list-template.html'),
    mainIndexTemplatePath: path.resolve(__dirname, '../templates/list/index-template.html'),
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
 * 更新索引页面
 * @param {string} templatePath - 模板文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} contentHTML - 文章列表HTML
 * @param {Object} options - 其他选项
 */
function updateIndexPage(templatePath, outputPath, contentHTML, options = {}) {
  try {
    // 确保使用统一模板
    let templateContent;
    
    // 首先尝试使用统一的模板
    const type = options.type || 'news';
    const isMainIndex = options.isMainIndex || false;
    
    if (isMainIndex) {
      // 主索引页面使用index-template
      const mainTemplatePath = config[type].mainIndexTemplatePath;
      if (fs.existsSync(mainTemplatePath)) {
        templateContent = fs.readFileSync(mainTemplatePath, 'utf8');
      }
    } else {
      // 分类列表页面使用category-list-template
      const listTemplatePath = config[type].listTemplatePath;
      if (fs.existsSync(listTemplatePath)) {
        templateContent = fs.readFileSync(listTemplatePath, 'utf8');
      }
    }
    
    // 如果找不到统一模板，回退到原模板
    if (!templateContent && fs.existsSync(templatePath)) {
      templateContent = fs.readFileSync(templatePath, 'utf8');
    }
    
    if (!templateContent) {
      throw new Error(`找不到模板文件: ${templatePath}`);
    }
    
    // 准备替换变量
    const categoryCode = options.categoryCode || '';
    const categoryName = getHumanReadableName(categoryCode, type);
    const sectionName = type === 'news' ? '物流资讯' : '工具与指南';
    
    // 替换模板变量
    let result = templateContent
      .replace(/{{content_items}}/g, contentHTML)
      .replace(/{{category_name}}/g, categoryName)
      .replace(/{{category_code}}/g, categoryCode)
      .replace(/{{section_name}}/g, sectionName)
      .replace(/{{site_section_name}}/g, sectionName)
      .replace(/{{section_id}}/g, type)
      .replace(/{{current_date}}/g, moment().format('YYYY年MM月DD日'));
    
    // 设置分类图标
    let categoryIcon = 'fas fa-folder';
    if (type === 'news') {
      categoryIcon = 'fas fa-newspaper';
    } else {
      // 根据分类代码设置图标
      if (categoryCode === 'shipping') categoryIcon = 'fas fa-ship';
      else if (categoryCode === 'warehouse') categoryIcon = 'fas fa-warehouse';
      else if (categoryCode === 'logistics') categoryIcon = 'fas fa-truck';
      else if (categoryCode === 'customs') categoryIcon = 'fas fa-clipboard-check';
      else if (categoryCode === 'regulations') categoryIcon = 'fas fa-gavel';
      else if (categoryCode === 'fba') categoryIcon = 'fab fa-amazon';
      else if (categoryCode === 'packaging') categoryIcon = 'fas fa-box';
      else categoryIcon = 'fas fa-tools';
    }
    result = result.replace(/{{category_icon}}/g, categoryIcon);
    
    // 替换分类描述
    let categoryDescription = '';
    if (type === 'news') {
      categoryDescription = `${categoryName}区域的最新物流资讯，为您提供及时的行业动态和市场趋势。`;
    } else {
      categoryDescription = `关于${categoryName}的详细指南和实用工具，帮助您高效处理物流运输环节。`;
    }
    result = result.replace(/{{category_description}}/g, categoryDescription);
    
    // 添加更多分类导航标签
    let categoryNavItems = '';
    if (type === 'news') {
      // 新闻区域导航
      config.news.regions.forEach(region => {
        const name = getHumanReadableRegion(region);
        const isActive = region === categoryCode ? 'active' : '';
        categoryNavItems += `<a href="../${region}/index.html" class="category-nav-item ${isActive}">${name}</a>`;
      });
    } else {
      // 指南分类导航
      config.guides.categories.forEach(cat => {
        try {
          const catDirPath = path.join(config.guides.sourceDir, cat);
          if (!fs.existsSync(catDirPath)) return;
          
          const name = getHumanReadableCategory(cat);
          const isActive = cat === categoryCode ? 'active' : '';
          categoryNavItems += `<a href="../${cat}/index.html" class="category-nav-item ${isActive}">${name}</a>`;
        } catch (err) {
          // 忽略不存在的目录
        }
      });
    }
    result = result.replace(/{{category_nav_items}}/g, categoryNavItems);
    
    // 为主索引页面添加特色分类和最新内容
    if (isMainIndex) {
      // 这里可以增加逻辑生成特色分类和最新内容
      result = result.replace(/{{featured_categories}}/g, '<!-- 特色分类内容 -->');
      result = result.replace(/{{latest_content}}/g, '<!-- 最新内容 -->');
      result = result.replace(/{{all_categories}}/g, '<!-- 所有分类 -->');
      result = result.replace(/{{category_tabs}}/g, '<!-- 分类标签 -->');
    }
    
    // 替换分页
    result = result.replace(/{{pagination_items}}/g, '<!-- 分页导航 -->');
    
    // 写入文件
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, result, 'utf8');
    console.log(`已更新索引页面: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error(`更新索引页面时出错:`, error);
    return false;
  }
}

/**
 * 获取人类可读的名称
 * @param {string} code - 代码
 * @param {string} type - 类型 (news 或 guides)
 * @returns {string} - 人类可读的名称
 */
function getHumanReadableName(code, type) {
  if (type === 'news') {
    return getHumanReadableRegion(code);
  } else {
    return getHumanReadableCategory(code);
  }
}

/**
 * 更新特定区域的新闻索引
 * @param {string} region - 区域代码
 * @returns {boolean} - 是否成功
 */
function updateNewsIndex(region) {
  // 验证区域有效性
  if (!config.news.regions.includes(region)) {
    console.error(`无效的区域: ${region}`);
    return false;
  }
  
  try {
    // 构建区域目录路径
    const regionDir = path.join(config.news.sourceDir, region);
    
    // 确保区域目录存在
    if (!fs.existsSync(regionDir)) {
      fs.mkdirSync(regionDir, { recursive: true });
    }
    
    // 扫描该区域的所有新闻文件
    const articles = scanDirectory(regionDir, '.html', config.news.sourceDir);
    
    console.log(`区域 ${region} 找到 ${articles.length} 篇文章`);
    
    // 生成新闻列表HTML
    const newsListHTML = generateNewsListHTML(articles);
    
    // 构建索引模板路径
    const indexTemplatePath = path.join(config.news.sourceDir, config.news.indexTemplateName);
    
    // 更新索引页面
    const outputPath = config.news.getOutputPath(region);
    return updateIndexPage(indexTemplatePath, outputPath, newsListHTML, {
      categoryCode: region, 
      type: 'news',
      isMainIndex: false
    });
  } catch (error) {
    console.error(`更新${region}区域索引时出错:`, error);
    return false;
  }
}

/**
 * 更新特定分类的指南索引
 * @param {string} category - 分类代码
 * @returns {boolean} - 是否成功
 */
function updateGuidesIndex(category) {
  // 验证分类有效性
  if (!config.guides.categories.includes(category)) {
    // 如果不是预定义的分类但目录存在，也允许更新
    const categoryPath = path.join(config.guides.sourceDir, category);
    if (!fs.existsSync(categoryPath)) {
      console.error(`无效的分类: ${category}`);
      return false;
    }
  }
  
  try {
    // 构建分类目录路径
    const categoryDir = path.join(config.guides.sourceDir, category);
    
    // 确保分类目录存在
    if (!fs.existsSync(categoryDir)) {
      console.error(`分类目录不存在: ${categoryDir}`);
      return false;
    }
    
    // 扫描该分类的所有指南文件
    const guides = scanDirectory(categoryDir, '.html', config.guides.sourceDir);
    
    console.log(`分类 ${category} 找到 ${guides.length} 个指南`);
    
    // 生成指南列表HTML
    const guidesListHTML = generateGuidesListHTML(guides);
    
    // 构建索引模板路径
    const indexTemplatePath = path.join(config.guides.sourceDir, config.guides.indexTemplateName);
    
    // 更新索引页面
    const outputPath = config.guides.getOutputPath(category);
    return updateIndexPage(indexTemplatePath, outputPath, guidesListHTML, {
      categoryCode: category, 
      type: 'guides',
      isMainIndex: false
    });
  } catch (error) {
    console.error(`更新${category}分类索引时出错:`, error);
    return false;
  }
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
 * 更新新闻主索引页面
 * @returns {boolean} - 是否成功
 */
function updateNewsMainIndex() {
  try {
    // 构建主索引模板路径
    const indexTemplatePath = config.news.mainIndexTemplatePath;
    
    // 生成一些示例内容
    const dummyContentHTML = '<!-- 示例内容 -->';
    
    // 更新索引页面
    const outputPath = path.resolve(__dirname, '../static-news/index.html');
    return updateIndexPage(indexTemplatePath, outputPath, dummyContentHTML, {
      type: 'news',
      isMainIndex: true
    });
  } catch (error) {
    console.error(`更新新闻主索引时出错:`, error);
    return false;
  }
}

/**
 * 更新指南主索引页面
 * @returns {boolean} - 是否成功
 */
function updateGuidesMainIndex() {
  try {
    // 构建主索引模板路径
    const indexTemplatePath = config.guides.mainIndexTemplatePath;
    
    // 生成一些示例内容
    const dummyContentHTML = '<!-- 示例内容 -->';
    
    // 更新索引页面
    const outputPath = path.resolve(__dirname, '../tools-guides/index.html');
    return updateIndexPage(indexTemplatePath, outputPath, dummyContentHTML, {
      type: 'guides',
      isMainIndex: true
    });
  } catch (error) {
    console.error(`更新指南主索引时出错:`, error);
    return false;
  }
}

/**
 * 更新所有新闻索引
 */
function updateAllNewsIndices() {
  console.log('开始更新所有新闻列表...');
  
  // 更新新闻主索引
  updateNewsMainIndex();
  
  // 更新所有区域索引
  config.news.regions.forEach(region => {
    updateNewsIndex(region);
  });
  
  console.log('所有新闻列表更新完成');
}

/**
 * 更新所有指南索引
 */
function updateAllGuidesIndices() {
  console.log('开始更新所有指南列表...');
  
  // 更新指南主索引
  updateGuidesMainIndex();
  
  // 更新所有分类索引
  config.guides.categories.forEach(category => {
    updateGuidesIndex(category);
  });
  
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

// 导出模块
module.exports = {
  updateNewsIndex,
  updateGuidesIndex,
  updateAllNewsIndices,
  updateAllGuidesIndices,
  updateAllIndices,
  updateNewsMainIndex,
  updateGuidesMainIndex,
  getHumanReadableRegion,
  getHumanReadableCategory
}; 
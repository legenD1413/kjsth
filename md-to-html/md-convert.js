/**
 * Markdown到HTML转换器
 * 将Markdown文件转换为HTML，应用指定的模板，并处理文件元数据
 */

const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const cheerio = require('cheerio');
const moment = require('moment');

// 设置中文日期格式
moment.locale('zh-cn');

/**
 * 从Markdown文件中提取元数据
 * @param {string} content - Markdown文件内容
 * @returns {Object} 元数据对象
 */
function extractMetadata(content) {
  const metadataRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(metadataRegex);
  
  if (!match) {
    return { 
      title: '未命名文档',
      date: moment().format('YYYY-MM-DD'),
      category: '未分类',
      importance: 3,
      region: '全球',
      keywords: []
    };
  }
  
  const metadataStr = match[1];
  const metadata = {};
  
  // 提取常规键值对
  const lineRegex = /^([^:]+):\s*(.+)$/gm;
  let lineMatch;
  
  while ((lineMatch = lineRegex.exec(metadataStr)) !== null) {
    const key = lineMatch[1].trim();
    let value = lineMatch[2].trim();
    
    // 处理数组格式 [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch (e) {
        value = value.slice(1, -1).split(',').map(item => item.trim());
      }
    }
    
    metadata[key] = value;
  }
  
  // 设置默认值
  metadata.title = metadata.title || '未命名文档';
  metadata.date = metadata.date || moment().format('YYYY-MM-DD');
  metadata.category = metadata.category || '未分类';
  metadata.importance = metadata.importance || 3;
  metadata.region = metadata.region || '全球';
  
  // 确保关键词始终是数组类型
  if (!metadata.keywords) {
    metadata.keywords = [];
  } else if (!Array.isArray(metadata.keywords)) {
    // 如果不是数组，转换成数组
    if (typeof metadata.keywords === 'string') {
      metadata.keywords = [metadata.keywords];
    } else {
      metadata.keywords = [];
    }
  }
  
  return metadata;
}

/**
 * 从Markdown文件中提取内容（移除元数据部分）
 * @param {string} content - Markdown文件内容
 * @returns {string} 不包含元数据的内容
 */
function extractContent(content) {
  const metadataRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
  return content.replace(metadataRegex, '');
}

/**
 * 将Markdown转换为HTML
 * @param {string} markdownContent - Markdown内容
 * @returns {string} 转换后的HTML
 */
function convertMarkdownToHtml(markdownContent) {
  return marked.parse(markdownContent);
}

/**
 * 应用HTML模板
 * @param {string} htmlContent - 转换后的HTML内容
 * @param {Object} metadata - 元数据对象
 * @param {string} templatePath - 模板文件路径
 * @returns {string} 应用模板后的完整HTML
 */
function applyTemplate(htmlContent, metadata, templatePath) {
  try {
    // 读取模板文件
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const $ = cheerio.load(templateHtml);
    
    // 替换标题
    $('title').text(metadata.title);
    $('.article-title, .news-title, .tool-title').text(metadata.title);
    
    // 替换其他元数据
    try {
      const formattedDate = moment(metadata.date, 'YYYY-MM-DD').format('YYYY年MM月DD日');
      $('.article-date, .news-date, .tool-date').text(formattedDate);
    } catch (dateError) {
      console.warn(`日期格式化警告: ${dateError.message}`);
      // 使用原始日期
      $('.article-date, .news-date, .tool-date').text(metadata.date);
    }
    
    $('.article-category, .news-category, .tool-category').text(metadata.category);
    $('.article-region, .news-region, .tool-region').text(metadata.region);
    
    // 替换内容区域
    $('.article-content, .news-content, .tool-content').html(htmlContent);
    
    // 处理关键词
    if (metadata.keywords && Array.isArray(metadata.keywords) && metadata.keywords.length > 0) {
      const keywordsHtml = metadata.keywords.map(keyword => 
        `<span class="keyword-tag">${keyword}</span>`
      ).join(' ');
      $('.article-keywords, .news-keywords, .tool-keywords').html(keywordsHtml);
    } else {
      // 如果没有关键词，尝试隐藏关键词部分
      try {
        $('.article-keywords, .news-keywords, .tool-keywords').parent().css('display', 'none');
      } catch (error) {
        console.warn(`隐藏关键词容器警告: ${error.message}`);
      }
    }
    
    return $.html();
  } catch (error) {
    console.error(`应用模板失败: ${error.message}`);
    throw error;
  }
}

/**
 * 获取模板路径
 * @param {string} templateType - 模板类型 (news 或 tool)
 * @param {string} category - 可选，文档分类
 * @returns {string} 模板文件路径
 */
function getTemplatePath(templateType, category) {
  // 统一模板目录
  const templatesDir = path.resolve(__dirname, '../templates');
  
  // 特殊处理海外仓分类
  if (category === 'warehouse') {
    const warehouseTemplatePath = path.resolve(__dirname, '../tools-guides/warehouse/template.html');
    if (fs.existsSync(warehouseTemplatePath)) {
      return warehouseTemplatePath;
    }
  }
  
  // 统一的内容页面模板
  const unifiedTemplatePath = path.join(templatesDir, 'content/content-template.html');
  if (fs.existsSync(unifiedTemplatePath)) {
    return unifiedTemplatePath;
  }
  
  // 后备：如果统一模板不存在，尝试旧的模板位置
  const possibleLocations = [
    // 优先从项目根目录的tools目录查找
    path.resolve(__dirname, '../tools'),
    // 从tools-guides目录查找
    path.resolve(__dirname, '../tools-guides'),
    // 从static-news目录查找
    path.resolve(__dirname, '../static-news')
  ];
  
  let templateFileName;
  if (templateType === 'news') {
    templateFileName = 'news-template.html';
  } else if (templateType === 'tool') {
    templateFileName = 'tool-template.html';
  } else {
    throw new Error(`未知的模板类型: ${templateType}`);
  }
  
  // 检查所有可能的位置
  for (const location of possibleLocations) {
    const templatePath = path.join(location, templateFileName);
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }
  }
  
  // 如果找不到，抛出错误
  throw new Error(`找不到${templateType}模板文件，已检查: ${possibleLocations.map(l => path.join(l, templateFileName)).join(', ')}`);
}

/**
 * 主函数 - 处理Markdown文件并生成HTML
 * @param {string} inputFile - 输入文件路径
 * @param {string} outputFile - 输出文件路径
 * @param {string} templateType - 模板类型 (news 或 tool)
 */
function processMarkdownFile(inputFile, outputFile, templateType) {
  try {
    console.log(`处理文件: ${inputFile}`);
    
    // 确保输入文件存在
    if (!fs.existsSync(inputFile)) {
      throw new Error(`输入文件不存在: ${inputFile}`);
    }
    
    // 读取Markdown文件
    const markdownContent = fs.readFileSync(inputFile, 'utf8');
    
    // 提取元数据和内容
    const metadata = extractMetadata(markdownContent);
    const content = extractContent(markdownContent);
    
    // 转换Markdown到HTML
    const htmlContent = convertMarkdownToHtml(content);
    
    // 获取模板路径
    const templatePath = getTemplatePath(templateType);
    
    // 应用模板
    const finalHtml = applyTemplate(htmlContent, metadata, templatePath);
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputFile);
    fs.ensureDirSync(outputDir);
    
    // 写入输出文件
    fs.writeFileSync(outputFile, finalHtml, 'utf8');
    
    console.log(`生成HTML文件: ${outputFile}`);
    return { success: true, metadata };
  } catch (error) {
    console.error(`处理文件失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 如果直接运行此脚本（而不是作为模块导入）
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('用法: node md-convert.js <输入文件> <输出文件> <模板类型>');
    console.log('模板类型: news 或 tool');
    process.exit(1);
  }
  
  const [inputFile, outputFile, templateType] = args;
  
  const result = processMarkdownFile(inputFile, outputFile, templateType);
  
  if (!result.success) {
    process.exit(1);
  }
}

module.exports = {
  processMarkdownFile,
  extractMetadata,
  extractContent,
  convertMarkdownToHtml,
  applyTemplate,
  getTemplatePath
}; 
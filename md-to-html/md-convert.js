/**
 * 简单的Markdown到HTML转换工具
 * 读取Markdown文件，解析前置元数据，并基于模板转换为HTML文件
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');

// 检查命令行参数
if (process.argv.length < 4) {
  console.error('用法: node md-convert.js <markdown文件> <输出HTML文件> [模板文件]');
  process.exit(1);
}

// 获取命令行参数
const markdownFile = process.argv[2];
const outputFile = process.argv[3];
const templateFile = process.argv[4] || path.resolve(__dirname, '../tools/tool-template.html');

// 确保目录存在
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 读取Markdown文件
try {
  console.log(`开始处理文件: ${markdownFile}`);
  
  // 以UTF-8格式读取文件内容
  let markdownContent = fs.readFileSync(markdownFile, { encoding: 'utf8' });
  
  // 显示文件前100个字符，用于调试
  console.log('文件前100个字符:', markdownContent.substring(0, 100));
  
  // 解析前置元数据
  const { metadata, content } = parseFrontMatter(markdownContent);
  console.log('解析的元数据:', metadata);
  
  // 将Markdown转换为HTML
  const htmlContent = marked.parse(content);
  
  // 读取模板文件
  let templateContent = fs.readFileSync(templateFile, { encoding: 'utf8' });
  
  // 替换模板中的变量
  let outputContent = templateContent;
  
  // 替换标题
  outputContent = outputContent.replace(/\{\{TITLE\}\}/g, metadata.title || '无标题');
  
  // 替换日期
  outputContent = outputContent.replace(/\{\{DATE\}\}/g, metadata.date || new Date().toISOString().split('T')[0]);
  
  // 替换分类
  let categoryDisplay = metadata.category || '';
  // 如果有多个分类，尝试使用categories
  if (metadata.categories) {
    try {
      // 尝试解析categories数组
      const categoriesArray = parseArrayField(metadata.categories);
      if (categoriesArray.length > 0) {
        categoryDisplay = categoriesArray.join(', ');
      }
    } catch (e) {
      console.log('无法解析categories字段:', e);
    }
  }
  outputContent = outputContent.replace(/\{\{CATEGORY\}\}/g, categoryDisplay);
  
  // 替换地区
  let regionDisplay = metadata.region || '全球';
  // 如果有多个地区，尝试使用regions
  if (metadata.regions) {
    try {
      // 尝试解析regions数组
      const regionsArray = parseArrayField(metadata.regions);
      if (regionsArray.length > 0) {
        regionDisplay = regionsArray.join(', ');
      }
    } catch (e) {
      console.log('无法解析regions字段:', e);
    }
  }
  outputContent = outputContent.replace(/\{\{REGION\}\}/g, regionDisplay);
  
  // 处理关键字
  let keywordsHtml = '';
  if (metadata.keywords) {
    try {
      const keywordsArray = parseArrayField(metadata.keywords);
      if (keywordsArray.length > 0) {
        keywordsHtml = '<div class="keywords-container">';
        keywordsArray.forEach(keyword => {
          keywordsHtml += `<span class="keyword-tag">${keyword}</span>`;
        });
        keywordsHtml += '</div>';
      }
    } catch (e) {
      console.log('无法解析keywords字段:', e);
    }
  }
  outputContent = outputContent.replace(/\{\{KEYWORDS\}\}/g, keywordsHtml);
  
  // 处理重要性
  const importance = metadata.importance || 'normal';
  let importanceClass = 'importance-normal';
  let importanceText = '普通';
  
  if (importance === 'important') {
    importanceClass = 'importance-important';
    importanceText = '重要';
  } else if (importance === 'critical') {
    importanceClass = 'importance-critical';
    importanceText = '关键';
  }
  
  outputContent = outputContent.replace(/\{\{IMPORTANCE_CLASS\}\}/g, importanceClass);
  outputContent = outputContent.replace(/\{\{IMPORTANCE_TEXT\}\}/g, importanceText);
  
  // 替换内容
  outputContent = outputContent.replace(/\{\{CONTENT\}\}/g, htmlContent);
  
  // 替换其他占位符
  outputContent = outputContent.replace(/\{\{INTERACTIVE_TOOL\}\}/g, '');
  outputContent = outputContent.replace(/\{\{RELATED_TOOLS\}\}/g, '');
  
  // 添加默认的关键字样式（如果模板中没有）
  if (keywordsHtml && !outputContent.includes('.keyword-tag')) {
    const keywordStyles = `
    <style>
      .keywords-container {
        margin: 1rem 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .keyword-tag {
        display: inline-block;
        padding: 0.3rem 0.7rem;
        font-size: 0.8rem;
        border-radius: 2rem;
        background-color: #f0f0f0;
        color: #666;
      }
      .keyword-tag:hover {
        background-color: #e0e0e0;
      }
    </style>
    `;
    outputContent = outputContent.replace('</head>', keywordStyles + '</head>');
  }
  
  // 写入输出文件，使用UTF-8格式
  fs.writeFileSync(outputFile, outputContent, { encoding: 'utf8' });
  console.log(`已生成HTML文件: ${outputFile}`);
  
} catch (error) {
  console.error('转换过程中出错:', error);
  process.exit(1);
}

/**
 * 解析数组字段
 * @param {string} arrayField - 数组字段字符串
 * @returns {Array} - 解析后的数组
 */
function parseArrayField(arrayField) {
  if (Array.isArray(arrayField)) {
    return arrayField;
  }
  
  // 如果是字符串，尝试解析
  if (typeof arrayField === 'string') {
    // 尝试JSON解析（可能是YAML数组被转成JSON字符串）
    try {
      const parsed = JSON.parse(arrayField);
      if (Array.isArray(parsed)) {
        console.log('成功解析JSON数组:', parsed);
        return parsed;
      }
    } catch (e) {
      console.log('JSON解析失败:', e.message);
      // 解析失败，继续其他方法
    }
    
    // 移除前后的 [ ]，然后按逗号分割（传统方式）
    if (arrayField.startsWith('[') && arrayField.endsWith(']')) {
      const content = arrayField.substring(1, arrayField.length - 1);
      // 分割并去除每项的空白
      const result = content.split(',').map(item => item.trim()).filter(item => item);
      console.log('使用传统方式解析数组:', result);
      return result;
    } else {
      // 如果不是数组格式，则当作单个项处理
      console.log('将字符串当作单个项处理:', arrayField.trim());
      return [arrayField.trim()];
    }
  }
  
  return [];
}

/**
 * 解析Markdown文件的前置元数据
 * @param {string} content - Markdown内容
 * @returns {Object} - 解析后的元数据和内容
 */
function parseFrontMatter(content) {
  // 检查是否包含前置元数据部分
  if (!content.startsWith('---')) {
    console.log('未找到前置元数据部分');
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : '无标题';
    
    return {
      metadata: {
        title: title,
        date: new Date().toISOString().split('T')[0],
        importance: 'normal'
      },
      content: content
    };
  }
  
  // 使用正则表达式提取前置元数据部分和正文部分
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  
  if (!frontMatterMatch) {
    console.log('前置元数据格式不正确');
    return {
      metadata: {
        title: '无标题',
        date: new Date().toISOString().split('T')[0],
        importance: 'normal'
      },
      content: content
    };
  }
  
  const frontMatterContent = frontMatterMatch[1];
  const markdownContent = frontMatterMatch[2];
  
  // 逐行解析前置元数据
  const metadata = {};
  let currentArrayKey = null;
  let currentArray = [];
  
  // 调试输出
  console.log('前置元数据内容:', frontMatterContent);
  
  frontMatterContent.split(/\r?\n/).forEach((line, index, allLines) => {
    // 忽略空行
    if (!line.trim()) {
      return;
    }
    
    // 检查是否是YAML格式的数组项（以破折号开头的缩进行）
    const yamlArrayItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (yamlArrayItemMatch && currentArrayKey) {
      // 这是YAML格式数组中的一个项目
      const value = yamlArrayItemMatch[1].trim();
      currentArray.push(value);
      
      // 如果是最后一行或下一行缩进不同，表示数组已结束
      const nextLine = allLines[index + 1];
      if (!nextLine || !nextLine.match(/^\s+-\s+/)) {
        // 数组结束，保存到元数据
        metadata[currentArrayKey] = JSON.stringify(currentArray);
        console.log(`解析YAML数组 ${currentArrayKey}:`, currentArray);
        currentArrayKey = null;
        currentArray = [];
      }
      return;
    }
    
    // 处理传统JSON形式的数组 (categories: [a, b, c])
    const jsonArrayMatch = line.match(/^(\w+):\s*\[(.*)\]$/);
    if (jsonArrayMatch) {
      const key = jsonArrayMatch[1].trim();
      const values = jsonArrayMatch[2].trim();
      metadata[key] = values ? `[${values}]` : '[]';
      
      // 重置当前数组状态
      currentArrayKey = null;
      currentArray = [];
      return;
    }
    
    // 处理常规形式的值 (key: value) 或 YAML数组开始标记
    const keyValueMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyValueMatch) {
      const key = keyValueMatch[1].trim();
      const value = keyValueMatch[2].trim();
      
      // 如果当前有正在构建的数组，先保存它
      if (currentArrayKey && currentArray.length > 0) {
        metadata[currentArrayKey] = JSON.stringify(currentArray);
        console.log(`保存前一个YAML数组 ${currentArrayKey}:`, currentArray);
        currentArrayKey = null;
        currentArray = [];
      }
      
      // 如果value为空，并且下一行可能是破折号开始的数组项，则标记为当前数组的键
      if (!value && index < allLines.length - 1) {
        const nextLine = allLines[index + 1];
        if (nextLine && nextLine.match(/^\s+-\s+/)) {
          // 确认是YAML数组的开始
          console.log(`发现YAML数组开始: ${key}`);
          currentArrayKey = key;
          currentArray = [];
        } else {
          // 普通的空值键值对
          metadata[key] = value;
        }
      } else {
        // 普通的键值对
        metadata[key] = value;
      }
    }
  });
  
  // 检查是否有未完成的YAML数组需要添加到元数据
  if (currentArrayKey && currentArray.length > 0) {
    metadata[currentArrayKey] = JSON.stringify(currentArray);
    console.log(`解析最后的YAML数组 ${currentArrayKey}:`, currentArray);
  }
  
  // 确保至少有基本的元数据
  if (!metadata.title) {
    const titleMatch = markdownContent.match(/^#\s+(.+)/m);
    metadata.title = titleMatch ? titleMatch[1].trim() : '无标题';
  }
  
  if (!metadata.date) {
    metadata.date = new Date().toISOString().split('T')[0];
  }
  
  if (!metadata.importance) {
    metadata.importance = 'normal';
  }
  
  return {
    metadata,
    content: markdownContent
  };
} 
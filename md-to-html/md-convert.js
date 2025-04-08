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
  outputContent = outputContent.replace(/\{\{CATEGORY\}\}/g, metadata.category || '');
  
  // 替换地区
  outputContent = outputContent.replace(/\{\{REGION\}\}/g, metadata.region || '全球');
  
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
  
  // 写入输出文件，使用UTF-8格式
  fs.writeFileSync(outputFile, outputContent, { encoding: 'utf8' });
  console.log(`已生成HTML文件: ${outputFile}`);
  
} catch (error) {
  console.error('转换过程中出错:', error);
  process.exit(1);
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
  frontMatterContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      metadata[key] = value;
    }
  });
  
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
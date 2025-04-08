
/**
 * 修复不完整的tools页面
 * 自动生成的脚本，用于重新获取并修复内容不完整的页面
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const marked = require('marked');

// 设置marked选项
marked.setOptions({
  headerIds: true,
  gfm: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

// 主要配置
const CONFIG = {
  cmsUrl: 'https://cms.kjsth.com',
  categories: ["guides", "forms", "interactive", "regulations", "calculators"],
  baseDir: path.resolve(__dirname, "../tools-guides")
};

// 处理Markdown内容
function processMarkdownContent(markdownContent) {
  if (!markdownContent) return '';
  
  console.log(`处理Markdown内容，长度: ${markdownContent.length}`);
  
  // 预处理Markdown内容
  let processedMarkdown = markdownContent
    .replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
    .replace(/^(\s*)-([^\s])/gm, '$1- $2')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
      return `[${text}](${link.trim()})`;
    })
    .replace(/\n{3,}/g, '\n\n')
    .replace(/```([^`]+)```/g, (match, code) => {
      if (!code.startsWith('\n')) {
        return '```\n' + code + '\n```';
      }
      return match;
    });
  
  // 使用marked转换为HTML
  let htmlContent = marked(processedMarkdown);
  
  // HTML后处理
  htmlContent = htmlContent
    .replace(/<h([1-6])>/g, '<h$1 class="content-heading heading-$1">')
    .replace(/<p>/g, '<p class="content-paragraph">')
    .replace(/<ul>/g, '<ul class="content-list">')
    .replace(/<ol>/g, '<ol class="content-ordered-list">')
    .replace(/<table>/g, '<table class="content-table">')
    .replace(/<pre><code>/g, '<pre class="content-code-block"><code>')
    .replace(/<img/g, '<img class="responsive-image"');
  
  return htmlContent;
}

// 扫描并修复不完整页面
async function scanAndFixPages() {
  console.log('开始扫描不完整页面...');
  
  // 检查基础目录是否存在
  if (!fs.existsSync(CONFIG.baseDir)) {
    console.error(`基础目录不存在: ${CONFIG.baseDir}`);
    return;
  }
  
  // 获取所有HTML文件
  let htmlFiles = [];
  let subdirs = [];
  
  if ('tools' === 'news') {
    // 对于新闻，检查每个区域目录
    subdirs = CONFIG.regions.map(region => path.join(CONFIG.baseDir, region));
  } else {
    // 对于工具，检查每个分类目录
    subdirs = CONFIG.categories.map(category => path.join(CONFIG.baseDir, category));
  }
  
  // 收集所有HTML文件
  for (const dir of subdirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.html') && file !== 'index.html')
        .map(file => ({
          path: path.join(dir, file),
          id: parseInt(file.replace('.html', '')),
          category: path.basename(dir)
        }))
        .filter(file => !isNaN(file.id));
      
      htmlFiles.push(...files);
    }
  }
  
  console.log(`找到${htmlFiles.length}个页面文件需要检查`);
  
  // 检查每个文件的完整性
  let incompleteFiles = [];
  
  for (const file of htmlFiles) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      
      // 检查内容是否完整的标志
      const hasMainContent = content.includes('<div class="content-main">') || 
                           content.includes('<div class="tool-content">');
      const hasTitle = content.includes('<title>') && !content.includes('<title></title>');
      const hasMeta = content.includes('<meta name="description"');
      const hasFooter = content.includes('</footer>');
      
      // 检查是否包含错误提示
      const hasErrorMessage = content.includes('内容加载失败') || 
                            content.includes('数据获取异常') ||
                            content.includes('无法获取完整内容');
      
      // 检查内容长度是否合理
      const isReasonableLength = content.length > 1000;
      
      // 如果缺少关键部分或有错误信息，标记为不完整
      if (!hasMainContent || !hasTitle || !hasMeta || !hasFooter || hasErrorMessage || !isReasonableLength) {
        incompleteFiles.push(file);
      }
    } catch (error) {
      console.error(`读取文件 ${file.path} 失败: ${error.message}`);
      incompleteFiles.push(file);
    }
  }
  
  console.log(`发现${incompleteFiles.length}个不完整的页面需要修复`);
  
  // 修复不完整的页面
  for (const file of incompleteFiles) {
    try {
      console.log(`准备修复: ${file.path} (ID: ${file.id})`);
      
      let apiUrl;
      if ('tools' === 'news') {
        apiUrl = `${CONFIG.cmsUrl}/wp-json/maigeeku/v1/news-by-id/${file.id}`;
      } else {
        apiUrl = `${CONFIG.cmsUrl}/wp-json/wp/v2/tools_guides/${file.id}`;
      }
      
      console.log(`从API获取内容: ${apiUrl}`);
      
      // 获取内容
      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000
      });
      
      if (response.status === 200 && response.data) {
        let content;
        let title;
        let description;
        
        if ('tools' === 'news') {
          // 处理新闻数据
          if (Array.isArray(response.data)) {
            if (response.data.length === 0) {
              console.error(`ID为${file.id}的内容不存在`);
              continue;
            }
            content = response.data[0].content;
            title = response.data[0].title;
            description = response.data[0].excerpt || title;
          } else {
            content = response.data.content;
            title = response.data.title;
            description = response.data.excerpt || title;
          }
        } else {
          // 处理工具数据
          if (response.data.content && response.data.content.rendered) {
            content = response.data.content.rendered;
          } else if (response.data.content && typeof response.data.content === 'string') {
            content = response.data.content;
          } else {
            console.error(`ID为${file.id}的工具内容格式异常`);
            continue;
          }
          
          if (response.data.title && response.data.title.rendered) {
            title = response.data.title.rendered;
          } else {
            title = response.data.title || `工具 ${file.id}`;
          }
          
          description = response.data.excerpt ? 
            (response.data.excerpt.rendered || response.data.excerpt) : 
            `工具 ${file.id} 说明`;
        }
        
        // 处理Markdown内容
        let processedContent = content;
        if (typeof content === 'string' && (content.includes('#') || content.includes('-') || content.includes('*'))) {
          processedContent = processMarkdownContent(content);
          console.log(`成功处理Markdown内容，处理后长度: ${processedContent.length}`);
        }
        
        // 使用获取的内容重新生成页面
        await regeneratePage(file, {
          title,
          content: processedContent,
          description
        });
        
        console.log(`成功修复页面: ${file.path}`);
      } else {
        console.error(`获取ID为${file.id}的内容失败: ${response.status}`);
      }
    } catch (error) {
      console.error(`修复文件 ${file.path} 失败: ${error.message}`);
    }
  }
}

// 重新生成页面
async function regeneratePage(file, data) {
  // 读取原始页面作为模板
  let template;
  
  try {
    // 尝试读取当前页面作为模板
    template = fs.readFileSync(file.path, 'utf8');
  } catch (error) {
    // 如果读取失败，使用默认模板
    console.log(`读取原始页面失败，使用默认模板`);
    template = '<!DOCTYPE html><html><head><title></title><meta name="description"><link rel="stylesheet" href="/assets/css/styles.css"></head><body><header></header><div class="tool-content"></div><footer></footer></body></html>';
  }
  
  // 替换标题
  template = template.replace(/<title>.*?<\/title>/s, `<title>${data.title} | 麦极客物流</title>`);
  
  // 替换描述
  const metaDescRegex = /<meta\s+name="description"\s+content=".*?">/;
  const newMetaDesc = `<meta name="description" content="${data.description.replace(/"/g, '&quot;')}">`;
  
  if (template.match(metaDescRegex)) {
    template = template.replace(metaDescRegex, newMetaDesc);
  } else {
    // 如果没有找到描述标签，在head中添加
    template = template.replace(/<\/head>/, `${newMetaDesc}\n</head>`);
  }
  
  // 替换主要内容
  if ('tools' === 'news') {
    const contentMainRegex = /<div\s+class="content-main">.*?<\/div>/s;
    if (template.match(contentMainRegex)) {
      template = template.replace(contentMainRegex, `<div class="content-main">${data.content}</div>`);
    } else {
      // 如果没有找到主内容区域，在body中添加
      template = template.replace(/<body>(.+?)<footer>/s, `<body>$1<div class="content-main">${data.content}</div>\n<footer>`);
    }
  } else {
    const toolContentRegex = /<div\s+class="tool-content">.*?<\/div>/s;
    if (template.match(toolContentRegex)) {
      template = template.replace(toolContentRegex, `<div class="tool-content">${data.content}</div>`);
    } else {
      // 如果没有找到工具内容区域，在body中添加
      template = template.replace(/<body>(.+?)<footer>/s, `<body>$1<div class="tool-content">${data.content}</div>\n<footer>`);
    }
  }
  
  // 写入文件
  fs.writeFileSync(file.path, template);
}

// 运行修复程序
scanAndFixPages().catch(error => {
  console.error(`程序运行出错: ${error.message}`);
  process.exit(1);
});
      
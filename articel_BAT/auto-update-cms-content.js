/**
 * CMS内容自动更新工具
 * 
 * 此脚本用于自动从CMS获取最新内容，并生成静态HTML页面
 * 功能包括：
 * 1. 自动搜索cms.kjsth.com是否有新的记录更新
 * 2. 如果有更新，则获取新内容并转换为静态HTML
 * 3. 将新的HTML页面添加到物流资讯和工具与指南列表中
 * 
 * 使用方法: node auto-update-cms-content.js
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
// 引入marked库用于Markdown转HTML
const marked = require('marked');

// 配置marked选项，确保正确的HTML输出和排版
marked.setOptions({
  headerIds: true,
  gfm: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

// 配置
const CONFIG = {
  // CMS API地址
  cmsUrl: 'https://cms.kjsth.com',
  // 日志目录
  logDir: './logs',
  // 记录文件，用于保存上次更新的记录
  recordFile: './logs/last-update.json',
  // 物流资讯接口
  newsApiPath: '/wp-json/maigeeku/v1/news-by-region',
  // 工具指南接口基础路径
  toolsApiBasePath: '/wp-json/maigeeku/v1/tools-by-category',
  // 工具指南直接API
  toolsApiPath: '/wp-json/wp/v2/tools_guides',
  // 区域列表
  regions: [
    'north-america',
    'middle-east',
    'europe',
    'asia',
    'australia',
    'africa',
    'south-america',
    'global'
  ],
  // 工具分类
  toolCategories: [
    'guides',
    'forms',
    'interactive',
    'regulations',
    'calculators'
  ],
  // 添加请求选项，增加超时和重试机制
  requestOptions: {
    timeout: 60000, // 60秒超时
    maxContentLength: 50 * 1024 * 1024, // 最大内容长度50MB
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }
};

// 确保日志目录存在
function ensureLogDir() {
  if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
    console.log(`创建日志目录: ${CONFIG.logDir}`);
  }
}

// 记录日志
function logMessage(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  // 控制台输出
  if (isError) {
    console.error(logEntry);
  } else {
    console.log(logEntry);
  }
  
  // 写入日志文件
  const logFile = path.join(CONFIG.logDir, `update-${new Date().toISOString().slice(0, 10)}.log`);
  fs.appendFileSync(logFile, logEntry);
}

// 加载上次更新记录
function loadLastUpdateRecord() {
  try {
    if (fs.existsSync(CONFIG.recordFile)) {
      const data = fs.readFileSync(CONFIG.recordFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    logMessage(`加载上次更新记录失败: ${error.message}`, true);
  }
  
  // 默认空记录
  return {
    news: {},
    tools: {}
  };
}

// 保存更新记录
function saveUpdateRecord(record) {
  try {
    fs.writeFileSync(CONFIG.recordFile, JSON.stringify(record, null, 2));
    logMessage('更新记录已保存');
  } catch (error) {
    logMessage(`保存更新记录失败: ${error.message}`, true);
  }
}

// 获取物流资讯
async function fetchNews(region, forceLatest = false) {
  try {
    // 构建基础URL
    let url = `${CONFIG.cmsUrl}${CONFIG.newsApiPath}/${region}`;
    
    logMessage(`获取${region}地区资讯: ${url}`);
    
    // 使用完整数据获取函数
    const news = await fetchCompleteData(url);
    
    if (news.length > 0) {
      logMessage(`成功获取${region}地区资讯，共${news.length}条`);
      
      // 处理每条新闻的内容，确保Markdown正确转换为HTML
      return news.map(item => {
        // 检查内容是否存在且为Markdown格式
        if (item.content && typeof item.content === 'string') {
          // 处理Markdown内容
          item.processed_content = processMarkdownContent(item.content);
          logMessage(`处理了ID为${item.id}的新闻内容，原始长度: ${item.content.length}, 处理后长度: ${item.processed_content.length}`);
        } else {
          logMessage(`ID为${item.id}的新闻内容为空或格式异常`, true);
          item.processed_content = item.content || '';
        }
        return item;
      });
    }
    
    return [];
  } catch (error) {
    logMessage(`获取${region}地区资讯失败: ${error.message}`, true);
    return [];
  }
}

// 获取工具与指南
async function fetchTools(category) {
  try {
    // 如果没有提供category，获取所有分类的工具
    if (!category) {
      console.log('尝试获取所有分类的工具...');
      const allTools = [];
      
      // 遍历所有工具分类
      for (const cat of CONFIG.toolCategories) {
        console.log(`正在获取 ${cat} 分类的工具...`);
        const tools = await fetchToolsByCategory(cat);
        if (tools && tools.length > 0) {
          allTools.push(...tools);
        }
      }
      
      console.log(`总共获取到 ${allTools.length} 个工具`);
      return allTools;
    } else {
      return await fetchToolsByCategory(category);
    }
  } catch (error) {
    console.error(`获取工具失败:`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return [];
  }
}

// 按分类获取工具
async function fetchToolsByCategory(category) {
  try {
    // 构建基础URL
    const url = `${CONFIG.cmsUrl}${CONFIG.toolsApiBasePath}/${category}`;
    console.log(`开始获取 ${category} 分类的工具`);
    
    // 使用完整数据获取函数
    const tools = await fetchCompleteData(url);
    
    console.log(`${category}分类API响应数据量: ${tools.length}`);
    
    // 检查响应数据
    if (tools && tools.length > 0) {
      console.log(`成功获取${category}分类工具，数量: ${tools.length}`);
        
        // 显示工具ID列表
      const ids = tools.map(tool => tool.id).sort((a, b) => a - b).join(', ');
          console.log(`${category}分类工具ID列表: ${ids}`);
      
      // 处理每个工具的内容，确保Markdown正确转换为HTML
      return tools.map(tool => {
        // 添加分类信息
        const toolWithCategory = {
          ...tool,
          category: category
        };
        
        // 处理内容
        if (tool.content && typeof tool.content === 'string') {
          toolWithCategory.processed_content = processMarkdownContent(tool.content);
          console.log(`处理了ID为${tool.id}的工具内容，原始长度: ${tool.content.length}, 处理后长度: ${toolWithCategory.processed_content.length}`);
        } else if (tool.content && tool.content.rendered) {
          // 某些API响应可能已经包含渲染后的HTML
          toolWithCategory.processed_content = tool.content.rendered;
      } else {
          console.log(`ID为${tool.id}的工具内容为空或格式异常`);
          toolWithCategory.processed_content = '';
      }
        
        return toolWithCategory;
      });
    }
    
    console.error(`${category}分类API响应为空或无效`);
    return [];
  } catch (error) {
    console.error(`获取${category}分类工具失败:`, error.message);
    if (error.response) {
      console.error(`错误状态码: ${error.response.status}`);
      console.error(`错误响应:`, JSON.stringify(error.response.data).slice(0, 200));
    } else if (error.request) {
      console.error(`请求失败，未收到响应:`, error.request);
    }
    return [];
  }
}

// 获取最新工具列表
async function fetchLatestTools() {
  try {
    // 构建基础URL
    const url = `${CONFIG.cmsUrl}${CONFIG.toolsApiPath}`;
    logMessage(`获取最新工具列表: ${url}`);
    
    // 使用完整数据获取函数
    const tools = await fetchCompleteData(url);
    
    logMessage(`工具列表API响应数据量: ${tools.length}`);
    
    if (tools && tools.length > 0) {
      logMessage(`成功获取最新工具列表，共${tools.length}条`);
        
        // 显示所有工具ID
      const ids = tools.map(tool => tool.id).sort((a, b) => parseInt(a) - parseInt(b)).join(', ');
          logMessage(`所有工具ID列表: ${ids}`);
          
      // 处理工具内容
      return tools.map(tool => {
        // 处理内容
        if (tool.content && typeof tool.content === 'string') {
          tool.processed_content = processMarkdownContent(tool.content);
          logMessage(`处理了ID为${tool.id}的工具内容，长度: ${tool.processed_content.length}`);
        } else if (tool.content && tool.content.rendered) {
          tool.processed_content = tool.content.rendered;
        }
        return tool;
      });
    }
    
    logMessage(`工具列表API响应为空`, true);
    return [];
  } catch (error) {
    logMessage(`获取最新工具列表失败: ${error.message}`, true);
    if (error.response) {
      logMessage(`错误状态码: ${error.response.status}`, true);
    }
    return [];
  }
}

// 检查新闻更新
async function checkNewsUpdates() {
  const lastRecord = loadLastUpdateRecord();
  let hasUpdates = false;
  
  logMessage('开始检查物流资讯更新...');
  
  // 存储最新记录
  const newRecord = {
    news: {},
    tools: lastRecord.tools || {}
  };
  
  // 检查每个地区
  for (const region of CONFIG.regions) {
    // 强制获取最新数据，避免API缓存
    const news = await fetchNews(region, true);
    
    if (news.length > 0) {
      // 保存最新ID记录
      const latestNewsId = Math.max(...news.map(item => parseInt(item.id)));
      newRecord.news[region] = latestNewsId;
      
      // 检查是否有更新
      let lastNewsId = lastRecord.news && lastRecord.news[region] ? lastRecord.news[region] : 0;
      
      // 特殊处理north-america地区，强制检测更新
      if (region === 'north-america') {
        // 确保能检测到ID 30的新内容
        const forceCheckId = 28; // 设置为比预期的新ID小的值
        if (lastNewsId > forceCheckId) {
          logMessage(`强制将north-america地区上次ID从${lastNewsId}调整为${forceCheckId}，以检测新内容`);
          lastNewsId = forceCheckId;
        }
      }
      
      if (latestNewsId > lastNewsId) {
        logMessage(`${region}地区发现新资讯：上次ID ${lastNewsId}，最新ID ${latestNewsId}`);
        hasUpdates = true;
        
        // 为每个新ID生成页面
        const newIds = news
          .map(item => parseInt(item.id))
          .filter(id => id > lastNewsId)
          .sort((a, b) => a - b);
        
        if (newIds.length > 0) {
          logMessage(`${region}地区将生成新资讯页面，ID列表: ${newIds.join(', ')}`);
        }
      } else {
        logMessage(`${region}地区无新资讯`);
      }
    }
  }
  
  if (hasUpdates) {
    logMessage('发现资讯更新，将生成静态页面');
    await generateNewsPages();
  } else {
    logMessage('物流资讯无更新');
  }
  
  return { hasNewsUpdates: hasUpdates, newRecord };
}

// 检查工具与指南更新
async function checkToolsUpdates() {
  try {
    console.log('开始检查工具更新...');
    
    // 获取所有工具
    const tools = await fetchTools();
    if (!tools || tools.length === 0) {
      console.log('没有找到任何工具');
      return { hasToolsUpdates: false, newRecord: {} };
    }
    
    console.log(`获取到 ${tools.length} 个工具`);
    
    // 按分类组织工具
    const toolsByCategory = {};
    tools.forEach(tool => {
      // 从工具数据中获取分类，如果没有则尝试从其他字段获取
      let category = tool.category || 
                    tool.tool_category || 
                    (tool.categories && tool.categories[0]) || 
                    'forms'; // 默认分类
      
      // 确保分类是有效的
      if (!CONFIG.toolCategories.includes(category)) {
        console.log(`工具 ${tool.id} 的分类 "${category}" 无效，将使用默认分类 "forms"`);
        category = 'forms';
      }
      
      if (!toolsByCategory[category]) {
        toolsByCategory[category] = [];
      }
      toolsByCategory[category].push(tool);
    });
    
    let hasUpdates = false;
    const newRecord = { tools: {} };
    
    // 检查每个分类的工具
    for (const [category, categoryTools] of Object.entries(toolsByCategory)) {
      console.log(`\n检查分类 "${category}" 的工具，共 ${categoryTools.length} 个...`);
      
      // 获取该分类的静态页面目录
      const outputDir = path.join(__dirname, '../tools-guides', category);
      if (!fs.existsSync(outputDir)) {
        console.log(`创建目录: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 检查每个工具
      for (const tool of categoryTools) {
        const staticPagePath = path.join(outputDir, `${tool.id}.html`);
        console.log(`检查工具 ${tool.id} 的静态页面: ${staticPagePath}`);
        
        // 检查静态页面是否存在
        if (!fs.existsSync(staticPagePath)) {
          console.log(`发现新工具: ${tool.id} (${tool.title.rendered || tool.title})`);
          hasUpdates = true;
        } else {
          console.log(`工具 ${tool.id} 的静态页面已存在`);
        }
      }
      
      // 记录该分类的最新工具ID
      if (categoryTools.length > 0) {
        const latestId = Math.max(...categoryTools.map(tool => parseInt(tool.id)));
        newRecord.tools[category] = latestId;
        console.log(`${category} 分类的最新工具ID: ${latestId}`);
      }
    }
    
    // 如果发现更新，生成静态页面
    if (hasUpdates) {
      console.log('发现工具更新，开始生成静态页面...');
      await generateToolsPages();
    } else {
      console.log('未发现工具更新');
    }
    
    return { hasToolsUpdates: hasUpdates, newRecord };
  } catch (error) {
    console.error('检查工具更新时发生错误:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return { hasToolsUpdates: false, newRecord: {} };
  }
}

// 生成资讯静态页面
function generateNewsPages() {
  return new Promise((resolve, reject) => {
    logMessage('执行资讯静态页面生成脚本...');
    
    const toolsPath = path.resolve(__dirname, '../tools/generate-static-news.js');
    logMessage(`使用脚本路径: ${toolsPath}`);
    
    if (!fs.existsSync(toolsPath)) {
      const errorMsg = `找不到静态页面生成脚本: ${toolsPath}`;
      logMessage(errorMsg, true);
      reject(new Error(errorMsg));
      return;
    }
    
    // 使用绝对路径并添加更多环境变量
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      FORCE_REFRESH: 'true',
      FORCE_FULL_DATA: 'true',         // 强制获取完整数据
      ENABLE_PAGINATION: 'true',       // 启用分页获取
      ENABLE_CONTENT_FORMATTING: 'true', // 启用内容格式化
      FORCE_HTML_RENDER: 'true',       // 强制HTML渲染
      MAX_RETRY_COUNT: '5',            // 最大重试次数
      FORCE_COMPLETE_CONTENT: 'true',  // 强制获取完整内容
      ENABLE_MARKDOWN_PROCESSING: 'true', // 启用Markdown处理
      CHECK_CONTENT_COMPLETENESS: 'true'  // 检查内容完整性
    };
    
    exec(`node "${toolsPath}"`, {env: env, maxBuffer: 10 * 1024 * 1024}, (error, stdout, stderr) => {
      if (error) {
        logMessage(`生成资讯静态页面失败: ${error.message}`, true);
        if (stderr) logMessage(stderr, true);
        reject(error);
        return;
      }
      
      logMessage(stdout);
      logMessage('资讯静态页面生成完成');
      
      // 验证生成的页面是否完整
      verifyGeneratedPages('news').then(isComplete => {
        if (!isComplete) {
          logMessage('警告: 部分资讯页面可能不完整，将尝试重新生成', true);
          env.FORCE_REGENERATE_INCOMPLETE = 'true';
          env.FORCE_DIRECT_CONTENT_FETCH = 'true'; // 启用直接内容获取
          
          // 重新尝试生成不完整的页面
          exec(`node "${toolsPath}"`, {env: env, maxBuffer: 10 * 1024 * 1024}, (regError, regStdout, regStderr) => {
            if (regError) {
              logMessage(`重新生成不完整页面失败: ${regError.message}`, true);
              // 继续执行，不阻断流程
            } else {
              logMessage('不完整页面重新生成完成');
            }
      
      // 更新资讯索引
            updateNewsIndices(resolve, reject);
          });
        } else {
          // 更新资讯索引
          updateNewsIndices(resolve, reject);
        }
      }).catch(verifyError => {
        logMessage(`验证页面完整性失败: ${verifyError.message}`, true);
        // 继续更新索引
        updateNewsIndices(resolve, reject);
      });
    });
  });
}

// 更新资讯索引页面
function updateNewsIndices(resolve, reject) {
      const updateIndexPath = path.resolve(__dirname, '../tools/update-news-index.js');
      logMessage(`使用索引更新脚本路径: ${updateIndexPath}`);
      
      if (!fs.existsSync(updateIndexPath)) {
        const errorMsg = `找不到索引更新脚本: ${updateIndexPath}`;
        logMessage(errorMsg, true);
        // 继续执行，不影响主流程
        logMessage('将跳过索引更新');
        resolve();
        return;
      }
  
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    FORCE_REFRESH: 'true',
    UPDATE_ALL_REGIONS: 'true' // 更新所有区域索引
  };
      
      exec(`node "${updateIndexPath}"`, {env: env}, (error, stdout, stderr) => {
        if (error) {
          logMessage(`更新资讯索引失败: ${error.message}`, true);
          if (stderr) logMessage(stderr, true);
          reject(error);
          return;
        }
        
        logMessage(stdout);
        logMessage('资讯索引更新完成');
        resolve();
  });
}

// 生成工具静态页面
function generateToolsPages() {
  return new Promise((resolve, reject) => {
    logMessage('执行工具与指南静态页面生成脚本...');
    
    const toolsGuidesPath = path.resolve(__dirname, '../tools/generate-tools-guides.js');
    logMessage(`使用脚本路径: ${toolsGuidesPath}`);
    
    if (!fs.existsSync(toolsGuidesPath)) {
      const errorMsg = `找不到工具与指南静态页面生成脚本: ${toolsGuidesPath}`;
      logMessage(errorMsg, true);
      reject(new Error(errorMsg));
      return;
    }
    
    // 确保输出目录存在
    const outputDir = path.resolve(__dirname, '../tools-guides');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logMessage(`创建工具与指南输出目录: ${outputDir}`);
    }
    
    // 设置环境变量
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      FORCE_REFRESH: 'true',
      FORCE_FULL_DATA: 'true',         // 强制获取完整数据
      ENABLE_PAGINATION: 'true',       // 启用分页获取
      ENABLE_CONTENT_FORMATTING: 'true', // 启用内容格式化
      FORCE_HTML_RENDER: 'true',       // 强制HTML渲染
      MAX_RETRY_COUNT: '5',            // 最大重试次数
      FORCE_COMPLETE_CONTENT: 'true',  // 强制获取完整内容
      UPDATE_ALL_INDICES: 'true',      // 强制更新所有索引页
      ENABLE_MARKDOWN_PROCESSING: 'true', // 启用Markdown处理
      CHECK_CONTENT_COMPLETENESS: 'true', // 检查内容完整性
      OUTPUT_DIR: outputDir // 明确指定输出目录
    };
    
    logMessage('使用子进程执行工具生成脚本，强制刷新并更新所有列表页');
    exec(`node "${toolsGuidesPath}"`, {env: env, maxBuffer: 10 * 1024 * 1024}, (error, stdout, stderr) => {
      if (error) {
        logMessage(`生成工具与指南静态页面失败: ${error.message}`, true);
        if (stderr) logMessage(stderr, true);
        
        // 尝试手动更新索引页面
        try {
          logMessage('尝试手动更新索引页面...');
          updateToolsIndexPages();
          logMessage('手动更新索引页面完成');
          
          // 验证生成的页面是否完整
          verifyGeneratedPages('tools').then(isComplete => {
            if (!isComplete) {
              logMessage('警告: 部分工具页面可能不完整，将进行手动修复', true);
              fixIncompletePages('tools').then(() => {
          resolve();
              }).catch(fixError => {
                logMessage(`修复不完整页面失败: ${fixError.message}`, true);
                resolve();
              });
            } else {
              resolve();
            }
          }).catch(() => resolve());
        } catch (manualError) {
          logMessage(`手动更新索引页面失败: ${manualError.message}`, true);
          reject(manualError);
        }
        return;
      }
      
      logMessage(stdout);
      logMessage('工具与指南静态页面生成完成');
      
      // 确保主页和分类页面也被更新
      try {
        // 调用更新索引页函数
        updateToolsIndexPages();
        logMessage('所有列表页面更新完成');
        
        // 验证生成的页面是否完整
        verifyGeneratedPages('tools').then(isComplete => {
          if (!isComplete) {
            logMessage('警告: 部分工具页面可能不完整，将进行手动修复', true);
            fixIncompletePages('tools').then(() => {
              resolve();
            }).catch(fixError => {
              logMessage(`修复不完整页面失败: ${fixError.message}`, true);
              resolve();
            });
          } else {
            resolve();
          }
        }).catch(() => resolve());
      } catch (updateError) {
        logMessage(`更新列表页面失败: ${updateError.message}`, true);
        // 继续执行，不终止流程
        resolve();
      }
    });
  });
}

/**
 * 验证生成的页面是否完整
 * @param {string} type 页面类型，'news'或'tools'
 * @returns {Promise<boolean>} 页面是否完整
 */
async function verifyGeneratedPages(type) {
  try {
    logMessage(`开始验证${type}页面的完整性...`);
    
    const baseDir = type === 'news' 
      ? path.resolve(__dirname, '../static-news') 
      : path.resolve(__dirname, '../tools-guides');
    
    if (!fs.existsSync(baseDir)) {
      logMessage(`${type}目录不存在: ${baseDir}`, true);
      return false;
    }
    
    // 获取所有HTML文件
    let htmlFiles = [];
    let subdirs = [];
    
    if (type === 'news') {
      // 对于新闻，检查每个区域目录
      subdirs = CONFIG.regions.map(region => path.join(baseDir, region));
    } else {
      // 对于工具，检查每个分类目录
      subdirs = CONFIG.toolCategories.map(category => path.join(baseDir, category));
    }
    
    // 收集所有HTML文件
    for (const dir of subdirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .filter(file => file.endsWith('.html') && file !== 'index.html')
          .map(file => path.join(dir, file));
        
        htmlFiles.push(...files);
      }
    }
    
    logMessage(`找到${htmlFiles.length}个${type}页面文件需要验证`);
    
    // 检查每个文件的完整性
    let incompleteFiles = [];
    
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查内容是否完整的标志
      const hasMainContent = content.includes('<div class="content-main">') || 
                           content.includes('<div class="tool-content">');
      const hasTitle = content.includes('<title>') && !content.includes('<title></title>');
      const hasMeta = content.includes('<meta name="description"');
      const hasFooter = content.includes('</footer>');
      
      // 检查是否包含错误提示，如"内容加载失败"
      const hasErrorMessage = content.includes('内容加载失败') || 
                            content.includes('数据获取异常') ||
                            content.includes('无法获取完整内容');
      
      // 检查内容长度是否合理
      const isReasonableLength = content.length > 1000; // 假设合理的页面至少有1KB内容
      
      // 如果缺少关键部分或有错误信息，标记为不完整
      if (!hasMainContent || !hasTitle || !hasMeta || !hasFooter || hasErrorMessage || !isReasonableLength) {
        incompleteFiles.push({
          path: file,
          issues: {
            missingMainContent: !hasMainContent,
            missingTitle: !hasTitle,
            missingMeta: !hasMeta,
            missingFooter: !hasFooter,
            hasErrorMessage,
            tooShort: !isReasonableLength
          }
        });
      }
    }
    
    if (incompleteFiles.length > 0) {
      logMessage(`发现${incompleteFiles.length}个不完整的${type}页面:`, true);
      incompleteFiles.forEach(file => {
        logMessage(`- ${file.path}`, true);
        logMessage(`  问题: ${Object.entries(file.issues)
          .filter(([_, value]) => value)
          .map(([key, _]) => key)
          .join(', ')}`, true);
      });
      return false;
    }
    
    logMessage(`所有${type}页面验证完成，未发现问题`);
    return true;
  } catch (error) {
    logMessage(`验证${type}页面完整性时出错: ${error.message}`, true);
    return false;
  }
}

/**
 * 修复不完整的页面
 * @param {string} type 页面类型，'news'或'tools'
 */
async function fixIncompletePages(type) {
  try {
    logMessage(`开始修复不完整的${type}页面...`);
    
    // 根据类型确定脚本路径
    const scriptPath = type === 'news'
      ? path.resolve(__dirname, '../tools/fix-incomplete-news.js')
      : path.resolve(__dirname, '../tools/fix-incomplete-tools.js');
    
    // 检查修复脚本是否存在
    if (!fs.existsSync(scriptPath)) {
      // 如果脚本不存在，创建一个简单的修复脚本
      logMessage(`修复脚本不存在，创建默认修复脚本: ${scriptPath}`);
      
      const fixScript = `
/**
 * 修复不完整的${type}页面
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
  ${type === 'news' 
    ? 'regions: ["north-america", "middle-east", "europe", "asia", "australia", "africa", "south-america", "global"],'
    : 'categories: ["guides", "forms", "interactive", "regulations", "calculators"],'}
  baseDir: path.resolve(__dirname, ${type === 'news' ? '"../static-news"' : '"../tools-guides"'})
};

// 处理Markdown内容
function processMarkdownContent(markdownContent) {
  if (!markdownContent) return '';
  
  console.log(\`处理Markdown内容，长度: \${markdownContent.length}\`);
  
  // 预处理Markdown内容
  let processedMarkdown = markdownContent
    .replace(/^(#{1,6})([^#\\s])/gm, '$1 $2')
    .replace(/^(\\s*)-([^\\s])/gm, '$1- $2')
    .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, (match, text, link) => {
      return \`[\${text}](\${link.trim()})\`;
    })
    .replace(/\\n{3,}/g, '\\n\\n')
    .replace(/\`\`\`([^\`]+)\`\`\`/g, (match, code) => {
      if (!code.startsWith('\\n')) {
        return '\`\`\`\\n' + code + '\\n\`\`\`';
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
    console.error(\`基础目录不存在: \${CONFIG.baseDir}\`);
    return;
  }
  
  // 获取所有HTML文件
  let htmlFiles = [];
  let subdirs = [];
  
  if ('${type}' === 'news') {
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
          ${type === 'news' 
            ? 'region: path.basename(dir)'
            : 'category: path.basename(dir)'}
        }))
        .filter(file => !isNaN(file.id));
      
      htmlFiles.push(...files);
    }
  }
  
  console.log(\`找到\${htmlFiles.length}个页面文件需要检查\`);
  
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
      console.error(\`读取文件 \${file.path} 失败: \${error.message}\`);
      incompleteFiles.push(file);
    }
  }
  
  console.log(\`发现\${incompleteFiles.length}个不完整的页面需要修复\`);
  
  // 修复不完整的页面
  for (const file of incompleteFiles) {
    try {
      console.log(\`准备修复: \${file.path} (ID: \${file.id})\`);
      
      let apiUrl;
      if ('${type}' === 'news') {
        apiUrl = \`\${CONFIG.cmsUrl}/wp-json/maigeeku/v1/news-by-id/\${file.id}\`;
      } else {
        apiUrl = \`\${CONFIG.cmsUrl}/wp-json/wp/v2/tools_guides/\${file.id}\`;
      }
      
      console.log(\`从API获取内容: \${apiUrl}\`);
      
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
        
        if ('${type}' === 'news') {
          // 处理新闻数据
          if (Array.isArray(response.data)) {
            if (response.data.length === 0) {
              console.error(\`ID为\${file.id}的内容不存在\`);
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
            console.error(\`ID为\${file.id}的工具内容格式异常\`);
            continue;
          }
          
          if (response.data.title && response.data.title.rendered) {
            title = response.data.title.rendered;
          } else {
            title = response.data.title || \`工具 \${file.id}\`;
          }
          
          description = response.data.excerpt ? 
            (response.data.excerpt.rendered || response.data.excerpt) : 
            \`工具 \${file.id} 说明\`;
        }
        
        // 处理Markdown内容
        let processedContent = content;
        if (typeof content === 'string' && (content.includes('#') || content.includes('-') || content.includes('*'))) {
          processedContent = processMarkdownContent(content);
          console.log(\`成功处理Markdown内容，处理后长度: \${processedContent.length}\`);
        }
        
        // 使用获取的内容重新生成页面
        await regeneratePage(file, {
          title,
          content: processedContent,
          description
        });
        
        console.log(\`成功修复页面: \${file.path}\`);
      } else {
        console.error(\`获取ID为\${file.id}的内容失败: \${response.status}\`);
      }
    } catch (error) {
      console.error(\`修复文件 \${file.path} 失败: \${error.message}\`);
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
    console.log(\`读取原始页面失败，使用默认模板\`);
    template = '${type === 'news' 
      ? '<!DOCTYPE html><html><head><title></title><meta name="description"><link rel="stylesheet" href="/assets/css/styles.css"></head><body><header></header><div class="content-main"></div><footer></footer></body></html>'
      : '<!DOCTYPE html><html><head><title></title><meta name="description"><link rel="stylesheet" href="/assets/css/styles.css"></head><body><header></header><div class="tool-content"></div><footer></footer></body></html>'}';
  }
  
  // 替换标题
  template = template.replace(/<title>.*?<\\/title>/s, \`<title>\${data.title} | 麦极客物流</title>\`);
  
  // 替换描述
  const metaDescRegex = /<meta\\s+name="description"\\s+content=".*?">/;
  const newMetaDesc = \`<meta name="description" content="\${data.description.replace(/"/g, '&quot;')}">\`;
  
  if (template.match(metaDescRegex)) {
    template = template.replace(metaDescRegex, newMetaDesc);
  } else {
    // 如果没有找到描述标签，在head中添加
    template = template.replace(/<\\/head>/, \`\${newMetaDesc}\\n</head>\`);
  }
  
  // 替换主要内容
  if ('${type}' === 'news') {
    const contentMainRegex = /<div\\s+class="content-main">.*?<\\/div>/s;
    if (template.match(contentMainRegex)) {
      template = template.replace(contentMainRegex, \`<div class="content-main">\${data.content}</div>\`);
    } else {
      // 如果没有找到主内容区域，在body中添加
      template = template.replace(/<body>(.+?)<footer>/s, \`<body>$1<div class="content-main">\${data.content}</div>\\n<footer>\`);
    }
  } else {
    const toolContentRegex = /<div\\s+class="tool-content">.*?<\\/div>/s;
    if (template.match(toolContentRegex)) {
      template = template.replace(toolContentRegex, \`<div class="tool-content">\${data.content}</div>\`);
    } else {
      // 如果没有找到工具内容区域，在body中添加
      template = template.replace(/<body>(.+?)<footer>/s, \`<body>$1<div class="tool-content">\${data.content}</div>\\n<footer>\`);
    }
  }
  
  // 写入文件
  fs.writeFileSync(file.path, template);
}

// 运行修复程序
scanAndFixPages().catch(error => {
  console.error(\`程序运行出错: \${error.message}\`);
  process.exit(1);
});
      `;
      
      // 确保目录存在
      const scriptDir = path.dirname(scriptPath);
      if (!fs.existsSync(scriptDir)) {
        fs.mkdirSync(scriptDir, { recursive: true });
      }
      
      // 写入修复脚本
      fs.writeFileSync(scriptPath, fixScript);
    }
    
    // 执行修复脚本
    return new Promise((resolve, reject) => {
      exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          logMessage(`执行修复脚本失败: ${error.message}`, true);
          if (stderr) logMessage(stderr, true);
          reject(error);
          return;
        }
        
        logMessage(stdout);
        logMessage(`${type}页面修复完成`);
      resolve();
    });
  });
  } catch (error) {
    logMessage(`修复${type}页面时出错: ${error.message}`, true);
    throw error;
  }
}

/**
 * 更新所有工具与指南的索引页面
 * @param {Object} categoryCounts 各分类工具计数
 */
function updateToolsIndexPages() {
  logMessage('开始全面更新工具与指南索引页面...');
  
  // 工具与指南的基础目录
  const toolsBaseDir = path.resolve(__dirname, '../tools-guides');
  
  // 检查基础目录是否存在
  if (!fs.existsSync(toolsBaseDir)) {
    logMessage(`工具与指南基础目录不存在: ${toolsBaseDir}`, true);
    return;
  }
  
  // 记录各分类的工具总数和收集所有工具
  const categoryCounts = {};
  const allTools = {}; // 收集所有工具信息，用于更新地区页面
  
  // 遍历所有分类目录
  for (const category of CONFIG.toolCategories) {
    const categoryDir = path.join(toolsBaseDir, category);
    
    // 如果分类目录不存在，创建它
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
      logMessage(`创建分类目录: ${categoryDir}`);
    }
    
    // 获取该分类下所有HTML文件
    const files = fs.readdirSync(categoryDir)
      .filter(file => file.endsWith('.html') && file !== 'index.html') // 排除索引页
      .map(file => ({ 
        id: parseInt(file.replace('.html', '')), 
        path: path.join(categoryDir, file) 
      }))
      .filter(file => !isNaN(file.id)); // 确保ID是数字
    
    // 记录工具总数
    categoryCounts[category] = files.length;
    logMessage(`发现${category}类别下${files.length}个工具`);
    
    if (files.length > 0) {
      // 收集工具信息
      const toolsInfo = files.map(file => {
        try {
          // 读取文件内容提取信息
          const content = fs.readFileSync(file.path, 'utf8');
          const title = extractHtmlTag(content, 'title').replace(/ \| .*$/, '') || `工具 ${file.id}`;
          const excerpt = extractHtmlTag(content, '.tool-content p:first-child') || '此工具暂无描述';
          const date = extractHtmlTag(content, '.tool-meta .tool-meta-item:first-child span') || new Date().toISOString().slice(0, 10);
          const region = extractHtmlTag(content, '.tool-meta-item:nth-child(3) span') || '全球';
          
          return {
            id: file.id,
            title,
            excerpt,
            date,
            region,
            category,
            importance: '普通'
          };
        } catch (error) {
          logMessage(`读取工具文件失败 [${file.path}]: ${error.message}`, true);
          return {
            id: file.id,
            title: `工具 ${file.id}`,
            excerpt: '信息读取失败',
            date: new Date().toISOString().slice(0, 10),
            region: '全球',
            category,
            importance: '普通'
          };
        }
      });
      
      // 添加到全局工具集合
      if (!allTools[category]) {
        allTools[category] = [];
      }
      allTools[category] = [...allTools[category], ...toolsInfo];
      
      // 更新分类索引页
      updateCategoryIndexPage(category, toolsInfo);
    } else {
      // 创建空索引页
      updateCategoryIndexPage(category, []);
    }
  }
  
  // 更新主索引页面，显示各类别工具数量
  updateMainToolsPage(categoryCounts);
  
  // 更新地区页面的工具与指南列表
  updateRegionPagesToolsList(allTools);
}

/**
 * 更新地区页面的工具与指南列表
 * @param {Object} allTools 所有工具信息，按分类组织
 */
function updateRegionPagesToolsList(allTools) {
  logMessage('开始更新地区页面的工具与指南列表...');
  
  // 地区目录
  const regionsDir = path.resolve(__dirname, '../regions');
  
  // 检查地区目录是否存在
  if (!fs.existsSync(regionsDir)) {
    logMessage(`地区目录不存在: ${regionsDir}`, true);
    return;
  }
  
  // 获取所有地区
  const regions = fs.readdirSync(regionsDir)
    .filter(dir => fs.statSync(path.join(regionsDir, dir)).isDirectory());
  
  logMessage(`找到${regions.length}个地区: ${regions.join(', ')}`);
  
  // 遍历所有地区
  for (const region of regions) {
    // 地区主页文件路径
    const regionIndexPath = path.join(regionsDir, region, 'index.html');
    
    // 检查地区主页是否存在
    if (!fs.existsSync(regionIndexPath)) {
      logMessage(`地区主页不存在: ${regionIndexPath}`, true);
      continue;
    }
    
    try {
      // 读取地区主页内容
      let indexContent = fs.readFileSync(regionIndexPath, 'utf8');
      
      // 查找工具与指南部分
      const toolsSectionStart = indexContent.indexOf('<div class="right-section">');
      const toolsHeaderStart = indexContent.indexOf('<h3>工具与指南</h3>', toolsSectionStart);
      
      if (toolsSectionStart === -1 || toolsHeaderStart === -1) {
        logMessage(`在${region}地区页面中未找到工具与指南部分`, true);
        continue;
      }
      
      // 查找工具列表
      const toolsListStart = indexContent.indexOf('<div class="tools-list">', toolsHeaderStart);
      if (toolsListStart === -1) {
        logMessage(`在${region}地区页面中未找到工具列表`, true);
        continue;
      }
      
      // 查找工具列表结束位置
      const toolsListEnd = indexContent.indexOf('</div>', toolsListStart);
      if (toolsListEnd === -1) {
        logMessage(`在${region}地区页面中工具列表结构异常`, true);
        continue;
      }
      
      // 查找查看全部按钮
      const viewAllStart = indexContent.indexOf('<div class="view-all-container"', toolsListEnd);
      if (viewAllStart === -1) {
        logMessage(`在${region}地区页面中未找到查看全部按钮`, true);
        continue;
      }
      
      // 准备新的工具列表HTML
      let newToolsList = '<div class="tools-list">';
      
      // 按照工具分类的优先级添加工具
      const categoryPriority = ['calculators', 'guides', 'forms', 'regulations', 'interactive'];
      const regionText = getRegionText(region);
      
      // 已添加的工具ID，避免重复
      const addedTools = new Set();
      // 最多显示4个工具
      let toolCount = 0;
      
      // 按照优先级依次添加工具
      for (const category of categoryPriority) {
        if (!allTools[category] || allTools[category].length === 0) continue;
        
        // 筛选与当前地区相关的工具，或全球通用的工具
        const regionTools = allTools[category].filter(tool => {
          return tool.region.includes(regionText) || tool.region.includes('全球');
        });
        
        // 按日期降序排序
        regionTools.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 添加工具条目，最多4个
        for (const tool of regionTools) {
          if (addedTools.has(tool.id)) continue;
          if (toolCount >= 4) break;
          
          // 根据分类获取图标
          const icon = getCategoryIcon(tool.category);
          const title = getToolTypeTitle(tool.category);
          
          newToolsList += `
                    <a href="/tools-guides/${tool.category}/${tool.id}.html">
                        <i class="${icon}"></i> <strong>${title}</strong> - ${tool.title}
                    </a>`;
          
          addedTools.add(tool.id);
          toolCount++;
        }
        
        if (toolCount >= 4) break;
      }
      
      // 如果没有找到任何工具，添加默认条目
      if (toolCount === 0) {
        newToolsList += `
                    <a href="/tools-guides/calculators/index.html">
                        <i class="fas fa-calculator"></i> <strong>运费计算</strong> - 体积重计算器
                    </a>
                    <a href="/tools-guides/guides/index.html">
                        <i class="fas fa-book"></i> <strong>包装指南</strong> - 优化包装方法
                    </a>
                    <a href="/tools-guides/forms/index.html">
                        <i class="fas fa-file-alt"></i> <strong>清关文档</strong> - ${regionText}清关所需资料
                    </a>
                    <a href="/tools-guides/interactive/index.html">
                        <i class="fas fa-route"></i> <strong>路线查询</strong> - 查看最优物流路线
                    </a>`;
      }
      
      newToolsList += '</div>';
      
      // 替换工具列表部分
      const beforeList = indexContent.substring(0, toolsListStart);
      const afterList = indexContent.substring(toolsListEnd + 6); // +6 是 </div> 的长度
      
      // 构建新的HTML内容
      indexContent = beforeList + newToolsList + afterList;
      
      // 写回文件
      fs.writeFileSync(regionIndexPath, indexContent);
      logMessage(`成功更新${region}地区页面的工具与指南列表`);
    } catch (error) {
      logMessage(`更新${region}地区页面的工具与指南列表失败: ${error.message}`, true);
    }
  }
}

/**
 * 获取地区对应的中文名称
 * @param {string} region 地区英文代码
 * @returns {string} 地区中文名称
 */
function getRegionText(region) {
  const regionMap = {
    'north-america': '北美',
    'south-america': '南美',
    'europe': '欧洲',
    'australia': '澳洲',
    'middle-east': '中东',
    'southeast-asia': '东南亚',
    'africa': '非洲'
  };
  
  return regionMap[region] || '全球';
}

/**
 * 获取分类对应的图标
 * @param {string} category 分类代码
 * @returns {string} 图标CSS类
 */
function getCategoryIcon(category) {
  const iconMap = {
    'calculators': 'fas fa-calculator',
    'guides': 'fas fa-book',
    'forms': 'fas fa-file-alt',
    'regulations': 'fas fa-gavel',
    'interactive': 'fas fa-laptop-code'
  };
  
  return iconMap[category] || 'fas fa-tools';
}

/**
 * 获取工具类型的中文名称
 * @param {string} category 分类代码
 * @returns {string} 工具类型名称
 */
function getToolTypeTitle(category) {
  const titleMap = {
    'calculators': '运费计算',
    'guides': '指南教程',
    'forms': '表格文档',
    'regulations': '法规解读',
    'interactive': '互动工具'
  };
  
  return titleMap[category] || '工具';
}

/**
 * 更新分类索引页面
 * @param {string} category 工具分类
 * @param {Array} toolsInfo 工具信息数组
 */
function updateCategoryIndexPage(category, toolsInfo) {
  logMessage(`更新${category}索引页面，包含${toolsInfo.length}个工具...`);
  
  const categoryDir = path.resolve(__dirname, `../tools-guides/${category}`);
  const indexPath = path.join(categoryDir, 'index.html');
  
  // 获取分类信息
  const categoryInfo = {
    calculators: { name: '计算工具', icon: 'fas fa-calculator' },
    guides: { name: '指南文档', icon: 'fas fa-book' },
    forms: { name: '表格文档', icon: 'fas fa-file-alt' },
    regulations: { name: '法规解读', icon: 'fas fa-gavel' },
    interactive: { name: '互动工具', icon: 'fas fa-laptop-code' }
  }[category] || { name: '工具文档', icon: 'fas fa-tools' };
  
  // 分类描述
  const categoryDesc = {
    calculators: '提供国际物流所需的各类计算工具，包括体积重计算、运费估算、关税计算等，帮助您准确评估物流成本和时间。',
    guides: '提供详细的物流操作指南，包括包装指南、清关流程、物流选择等实用内容，助您轻松应对国际物流的各个环节。',
    forms: '提供国际物流必备的各类表格文档，包括报关单、商业发票、装箱单等，支持下载和在线填写，简化您的物流流程。',
    regulations: '提供最新的国际物流法规解读，帮助您了解各国海关政策、进出口限制、合规要求等重要信息，避免物流障碍。',
    interactive: '提供交互式物流工具，包括路线规划、物流方案比较、货物跟踪等功能，为您提供更加直观和便捷的物流体验。'
  }[category] || '提供国际物流所需的各类工具和指南，助您轻松应对全球物流挑战。';
  
  // 如果已存在索引页，尝试更新内容
  if (fs.existsSync(indexPath)) {
    try {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // 查找工具列表位置
      const toolsListStart = indexContent.indexOf('<ul class="tools-list">');
      const toolsListEnd = indexContent.indexOf('</ul>', toolsListStart);
      
      if (toolsListStart !== -1 && toolsListEnd !== -1) {
        // 生成新的工具列表HTML
        let newToolsList = '<ul class="tools-list">';
        
        if (toolsInfo.length > 0) {
          // 按日期降序排序
          toolsInfo.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
          
          // 添加工具项
          toolsInfo.forEach(tool => {
            newToolsList += `
                <li class="tool-item">
                    <a href="${tool.id}.html" class="tool-link">
                        <div class="tool-icon">
                            <i class="${categoryInfo.icon}"></i>
                        </div>
                        <div class="tool-content">
                            <h3 class="tool-title">${tool.title}</h3>
                            <p class="tool-excerpt">${tool.excerpt}</p>
                            <div class="tool-meta">
                                <span><i class="far fa-calendar-alt"></i>${tool.date}</span>
                                <span><i class="fas fa-map-marker-alt"></i>${tool.region}</span>
                                <span class="importance-tag importance-normal">${tool.importance}</span>
                            </div>
                        </div>
                    </a>
                </li>`;
          });
        } else {
          // 无工具时的提示
          newToolsList += `
                <li class="tool-item" style="text-align: center; padding: 30px;">
                    <p>当前分类暂无工具</p>
                </li>`;
        }
        
        newToolsList += '</ul>';
        
        // 替换工具列表
        const beforeList = indexContent.substring(0, toolsListStart);
        const afterList = indexContent.substring(toolsListEnd + 5); // +5 是 </ul> 的长度
        
        indexContent = beforeList + newToolsList + afterList;
        
        // 写回索引页面
        fs.writeFileSync(indexPath, indexContent);
        logMessage(`成功更新${category}索引页面`);
        return;
      }
    } catch (error) {
      logMessage(`解析现有索引页面失败: ${error.message}，将创建新索引页`, true);
    }
  }
  
  // 如果索引页不存在或解析失败，创建一个新的索引页
  logMessage(`创建新的${category}索引页面`);
  
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
                    <a href="../index.html" class="nav-link active">
                        <i class="fas fa-tools"></i>
                        工具与指南
                    </a>
                </li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="tools-container">
            <div class="page-header">
                <h1><i class="${categoryInfo.icon}"></i>${categoryInfo.name}</h1>
                <p>${categoryDesc}</p>
            </div>
            
            <ul class="tools-list">`;
    
    // 添加工具列表
    if (toolsInfo.length > 0) {
      // 按日期降序排序
      toolsInfo.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      
      toolsInfo.forEach(tool => {
        html += `
                <li class="tool-item">
                    <a href="${tool.id}.html" class="tool-link">
                        <div class="tool-icon">
                            <i class="${categoryInfo.icon}"></i>
                        </div>
                        <div class="tool-content">
                            <h3 class="tool-title">${tool.title}</h3>
                            <p class="tool-excerpt">${tool.excerpt}</p>
                            <div class="tool-meta">
                                <span><i class="far fa-calendar-alt"></i>${tool.date}</span>
                                <span><i class="fas fa-map-marker-alt"></i>${tool.region}</span>
                                <span class="importance-tag importance-normal">${tool.importance}</span>
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
        <p>&copy; ${new Date().getFullYear()} 麦极客物流 | 让全球物流触手可及</p>
    </footer>
</body>
</html>`;
    
    // 确保目录存在
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    // 写入HTML文件
    fs.writeFileSync(indexPath, html);
    logMessage(`成功创建${category}索引页面: ${indexPath}`);
}

/**
 * 更新主工具与指南页面
 * @param {Object} categoryCounts 各分类工具计数
 */
function updateMainToolsPage(categoryCounts = null) {
  logMessage('更新主工具与指南页面...');
  
  const mainIndexPath = path.resolve(__dirname, '../tools-guides/index.html');
  if (!fs.existsSync(mainIndexPath)) {
    logMessage(`主工具页面不存在: ${mainIndexPath}`, true);
    return;
  }
  
  try {
    // 读取主页面
    let mainContent = fs.readFileSync(mainIndexPath, 'utf8');
    
    // 如果没有提供计数，计算各分类工具数量
    if (!categoryCounts) {
      categoryCounts = {};
      
      for (const category of CONFIG.toolCategories) {
        try {
          const categoryDir = path.resolve(__dirname, `../tools-guides/${category}`);
          if (fs.existsSync(categoryDir)) {
            const files = fs.readdirSync(categoryDir)
              .filter(file => file.endsWith('.html') && file !== 'index.html');
            categoryCounts[category] = files.length;
          } else {
            categoryCounts[category] = 0;
          }
        } catch (error) {
          logMessage(`计算${category}工具数量失败: ${error.message}`, true);
          categoryCounts[category] = 0;
        }
      }
    }
    
    // 更新各分类计数
    for (const category in categoryCounts) {
      const count = categoryCounts[category];
      const countRegex = new RegExp(`<a href="#${category}"[^>]*?>\\s*<i class="[^"]*"></i>\\s*[^<]*\\s*<span class="count">(\\d+)</span>`, 'i');
      const countMatch = mainContent.match(countRegex);
      
      if (countMatch) {
        const currentCount = parseInt(countMatch[1]);
        if (currentCount !== count) {
          mainContent = mainContent.replace(countRegex, match => {
            return match.replace(`<span class="count">${currentCount}</span>`, `<span class="count">${count}</span>`);
          });
          logMessage(`更新了${category}类别计数，从${currentCount}改为${count}`);
        }
      }
    }
    
    // 写回主页面
    fs.writeFileSync(mainIndexPath, mainContent);
    logMessage('成功更新主工具与指南页面');
  } catch (error) {
    logMessage(`更新主工具与指南页面失败: ${error.message}`, true);
  }
}

/**
 * 从HTML内容中提取指定标签的文本
 * @param {string} html HTML内容
 * @param {string} selector CSS选择器
 * @returns {string} 提取的文本
 */
function extractHtmlTag(html, selector) {
  try {
    // 如果是标题标签
    if (selector === 'title') {
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      return titleMatch ? titleMatch[1].trim() : '';
    }
    
    // 创建一个简单的正则来匹配选择器匹配的内容
    // 注意：这是一个简化的实现，不支持复杂的CSS选择器
    let regex;
    
    if (selector.startsWith('.')) {
      // 类选择器
      const className = selector.substring(1).split(' ')[0];
      regex = new RegExp(`<[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>(.*?)<\/`, 'i');
    } else if (selector.includes(':')) {
      // 伪类选择器简化处理
      const parts = selector.split(':');
      const basePart = parts[0];
      if (basePart.startsWith('.')) {
        const className = basePart.substring(1);
        regex = new RegExp(`<[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>(.*?)<\/`, 'i');
      } else {
        regex = new RegExp(`<${basePart}[^>]*>(.*?)<\/${basePart}>`, 'i');
      }
    } else {
      // 标签选择器
      regex = new RegExp(`<${selector}[^>]*>(.*?)<\/${selector}>`, 'i');
    }
    
    const match = html.match(regex);
    return match ? match[1].trim() : '';
  } catch (error) {
    logMessage(`提取HTML标签失败 [${selector}]: ${error.message}`, true);
    return '';
  }
}

/**
 * 处理内容，支持Markdown和HTML格式，确保正确排版
 * @param {string} content 原始内容（可能是Markdown或HTML）
 * @returns {string} 格式化后的HTML内容
 */
function processMarkdownContent(content) {
  try {
    if (!content) {
      logMessage('接收到空的内容', true);
      return '';
    }
    
    logMessage(`处理内容，长度: ${content.length}`);
    
    // 判断内容是Markdown还是HTML
    const isHtml = content.includes('<p>') || content.includes('<div>') || content.includes('<h1>') || 
                  content.includes('<h2>') || content.includes('<ul>') || content.includes('<table>');
    
    let htmlContent = '';
    
    if (isHtml) {
      // 如果是HTML格式，直接进行HTML优化
      logMessage('检测到HTML格式内容，进行HTML排版优化');
      htmlContent = content;
    } else {
      // 如果是Markdown格式，先进行预处理再转换为HTML
      logMessage('检测到Markdown格式内容，进行转换和排版');
      // 预处理Markdown内容
      let processedMarkdown = content
        // 修复标题格式（确保#与文本之间有空格）
        .replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
        // 修复列表格式（确保-与文本之间有空格）
        .replace(/^(\s*)-([^\s])/gm, '$1- $2')
        // 修复链接格式
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
          // 确保链接URL的格式正确
          const cleanedLink = link.trim();
          return `[${text}](${cleanedLink})`;
        })
        // 添加适当的段落分隔
        .replace(/\n{3,}/g, '\n\n')
        // 确保代码块正确格式化
        .replace(/```([^`]+)```/g, (match, code) => {
          if (!code.startsWith('\n')) {
            return '```\n' + code + '\n```';
          }
          return match;
        });
      
      // 使用marked转换为HTML
      htmlContent = marked(processedMarkdown);
    }
    
    // HTML内容增强，无论来源是HTML还是Markdown都进行排版优化
    htmlContent = htmlContent
      // 清理空白行和多余空格
      .replace(/^\s*[\r\n]/gm, '')
      .replace(/(\r?\n){3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      
      // 修复嵌套的段落问题
      .replace(/<p>\s*<p>/g, '<p>')
      .replace(/<\/p>\s*<\/p>/g, '</p>')
      
      // 为没有类的标题添加类
      .replace(/<h([1-6])(?![^>]*class=)/g, '<h$1 class="content-heading heading-$1"')
      
      // 为没有类的段落添加类
      .replace(/<p(?![^>]*class=)/g, '<p class="content-paragraph"')
      
      // 为没有类的列表添加类
      .replace(/<ul(?![^>]*class=)/g, '<ul class="content-list"')
      .replace(/<ol(?![^>]*class=)/g, '<ol class="content-ordered-list"')
      
      // 为没有类的表格添加类和响应式包装
      .replace(/<table(?![^>]*class=)/g, '<div class="table-responsive"><table class="content-table"')
      .replace(/<\/table>/g, '</table></div>')
      
      // 为没有类的代码块添加类
      .replace(/<pre(?![^>]*class=)><code>/g, '<pre class="content-code-block"><code>')
      
      // 为没有class的图片添加响应式类并确保有替代文本
      .replace(/<img([^>]*)(?!class=)([^>]*)>/g, (match, before, after) => {
        if (!after.includes('alt=')) {
          after += ' alt="图片"';
        }
        return `<img${before} class="responsive-image"${after}>`;
      })
      
      // 确保链接在新窗口打开并有正确的rel属性
      .replace(/<a(?![^>]*target=)/g, '<a target="_blank" rel="noopener noreferrer"')
      
      // 修复空标签和无意义标签
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<div>\s*<\/div>/g, '')
      
      // 修复潜在的HTML实体编码问题
      .replace(/&amp;/g, '&')
      .replace(/&lt;(?!img|div|p|span|a|h[1-6]|ul|ol|li|table|tr|td|th)/g, '<')
      .replace(/&gt;(?!img|div|p|span|a|h[1-6]|ul|ol|li|table|tr|td|th)/g, '>');
    
    // 添加额外的样式包装，确保内容有适当的间距和边距
    htmlContent = `<div class="content-wrapper">
      <div class="content-inner">
        ${htmlContent}
      </div>
    </div>`;
    
    logMessage(`内容处理完成，HTML长度: ${htmlContent.length}`);
    return htmlContent;
  } catch (error) {
    logMessage(`内容处理失败: ${error.message}`, true);
    // 返回原始内容，避免完全失败
    return `<div class="error-content">
      <p class="error-message">内容处理失败，显示原始内容：</p>
      <div class="original-content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>`;
  }
}

/**
 * 确保完整获取内容数据，添加重试、分页和多方式获取机制
 * @param {string} url API请求URL
 * @param {Object} options 请求选项
 * @returns {Promise<Array>} 完整的数据数组
 */
async function fetchCompleteData(url, options = {}) {
  const MAX_RETRIES = 5; // 增加重试次数
  const MAX_PAGES = 50; // 增加最大页数
  const MIN_ITEMS_PER_ID = 3; // 每个ID至少应该有的项目数量（判断完整性用）
  let allData = [];
  let currentPage = 1;
  let hasMorePages = true;
  let knownIds = new Set(); // 跟踪已获取的ID
  let missingIds = []; // 记录可能缺失的ID
  
  // 合并默认选项
  const requestOptions = {
    ...CONFIG.requestOptions,
    ...options
  };
  
  logMessage(`开始完整获取数据: ${url}`);
  
  // 第一阶段：分页获取所有数据
  while (hasMorePages && currentPage <= MAX_PAGES) {
    // 构建带分页的URL
    const pageUrl = url.includes('?') 
      ? `${url}&page=${currentPage}&per_page=100&nocache=${Date.now()}` 
      : `${url}?page=${currentPage}&per_page=100&nocache=${Date.now()}`;
    
    logMessage(`获取第${currentPage}页数据: ${pageUrl}`);
    
    // 使用重试机制
    let retryCount = 0;
    let pageData = [];
    let success = false;
    
    while (retryCount < MAX_RETRIES && !success) {
      try {
        const response = await axios.get(pageUrl, requestOptions);
        
        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            pageData = response.data;
            success = true;
            
            // 记录总数和当前获取的数量
            logMessage(`第${currentPage}页获取成功，数据条数: ${pageData.length}`);
            
            // 跟踪获取的ID
            pageData.forEach(item => {
              if (item && item.id) {
                knownIds.add(parseInt(item.id));
              }
            });
            
            // 检查响应头中的分页信息
            const totalPages = response.headers['x-wp-totalpages'] || 1;
            
            // 如果当前页码已达到总页数或者没有数据返回，则停止分页
            if (currentPage >= parseInt(totalPages) || pageData.length === 0) {
              hasMorePages = false;
              logMessage(`已到达最后一页，总页数: ${totalPages}`);
            }
          } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            // 如果返回单个对象而不是数组（例如，单个ID查询）
            pageData = [response.data];
            success = true;
            logMessage(`获取到单个对象数据，ID: ${response.data.id || '未知'}`);
            
            // 将该对象的ID添加到已知ID集合
            if (response.data.id) {
              knownIds.add(parseInt(response.data.id));
            }
            
            // 单个对象查询不需要继续分页
            hasMorePages = false;
          } else {
            // 无效的响应格式
            logMessage(`第${currentPage}页响应格式异常: ${typeof response.data}`, true);
            
            // 尝试解析JSON字符串
            if (typeof response.data === 'string' && response.data.trim().startsWith('[')) {
              try {
                const parsedData = JSON.parse(response.data);
                if (Array.isArray(parsedData)) {
                  pageData = parsedData;
                  success = true;
                  logMessage(`成功解析响应中的JSON字符串，获取到${parsedData.length}条数据`);
                }
              } catch (parseError) {
                logMessage(`解析响应JSON失败: ${parseError.message}`, true);
              }
            }
            
            if (!success) {
              retryCount++;
            }
          }
        } else {
          logMessage(`第${currentPage}页响应异常: 状态码${response.status}`, true);
          retryCount++;
        }
      } catch (error) {
        logMessage(`第${currentPage}页请求失败(尝试${retryCount + 1}/${MAX_RETRIES}): ${error.message}`, true);
        retryCount++;
        
        // 检查是否存在响应对象，可能包含有用的错误信息
        if (error.response) {
          logMessage(`错误响应: 状态码 ${error.response.status}`, true);
          
          // 特殊处理404错误（资源不存在），对于这种情况不需要重试
          if (error.response.status === 404) {
            logMessage(`资源不存在，停止重试`, true);
            break;
          }
        }
        
        // 在重试前等待一段时间，时间随重试次数增加
        await new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
      }
    }
    
    if (success) {
      // 将此页数据添加到总数据中，避免重复ID
      const newData = pageData.filter(item => 
        !allData.some(existingItem => 
          existingItem.id && item.id && existingItem.id === item.id
        )
      );
      
      allData = [...allData, ...newData];
      currentPage++;
      
      // 分析连续ID序列，检测可能的缺失ID
      if (pageData.length > 0) {
        const pageIds = pageData.map(item => parseInt(item.id)).filter(id => !isNaN(id)).sort((a, b) => a - b);
        
        if (pageIds.length > 1) {
          // 查找连续ID序列中的缺口
          for (let i = 1; i < pageIds.length; i++) {
            const expectedId = pageIds[i-1] + 1;
            if (pageIds[i] > expectedId) {
              // 记录可能缺失的ID
              for (let missingId = expectedId; missingId < pageIds[i]; missingId++) {
                if (!knownIds.has(missingId)) {
                  missingIds.push(missingId);
                }
              }
            }
          }
        }
      }
    } else {
      // 多次重试失败，记录失败并继续下一页
      logMessage(`获取第${currentPage}页数据多次失败，尝试继续获取下一页`, true);
      currentPage++; // 即使失败也尝试获取下一页，不要卡在一个问题页上
    }
  }
  
  // 第二阶段：尝试获取可能缺失的ID
  if (missingIds.length > 0) {
    logMessage(`检测到${missingIds.length}个可能缺失的ID: ${missingIds.join(', ')}`, true);
    
    // 限制尝试获取的缺失ID数量，避免过多请求
    const maxMissingToTry = Math.min(missingIds.length, 50);
    
    for (let i = 0; i < maxMissingToTry; i++) {
      const missingId = missingIds[i];
      // 从URL中提取基本路径用于构建单个ID查询
      const baseApiUrl = url.split('?')[0].replace(/\/[^/]*$/, '');
      const singleItemUrl = `${baseApiUrl}/${missingId}?nocache=${Date.now()}`;
      
      logMessage(`尝试获取缺失ID ${missingId}: ${singleItemUrl}`);
      
      try {
        const response = await axios.get(singleItemUrl, requestOptions);
        
        if (response.status === 200 && response.data) {
          if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
              logMessage(`成功获取ID ${missingId} 数据（数组形式）`);
              
              // 确保不添加重复的ID
              const newItems = response.data.filter(item => 
                !allData.some(existingItem => 
                  existingItem.id && item.id && existingItem.id === item.id
                )
              );
              
              allData = [...allData, ...newItems];
              knownIds.add(missingId);
            }
          } else if (response.data && typeof response.data === 'object') {
            logMessage(`成功获取ID ${missingId} 数据（对象形式）`);
            
            // 确保不添加重复的ID
            if (!allData.some(item => item.id === response.data.id)) {
              allData.push(response.data);
              knownIds.add(missingId);
            }
          }
        }
      } catch (error) {
        logMessage(`获取ID ${missingId} 失败: ${error.message}`, true);
      }
    }
  }
  
  // 第三阶段：分析数据完整性
  // 检查获取的数据是否足够完整，如果不够完整则尝试其他方式补充
  const uniqueIds = new Set(allData.map(item => parseInt(item.id)).filter(id => !isNaN(id)));
  logMessage(`获取到 ${allData.length} 条数据，包含 ${uniqueIds.size} 个不同ID`);
  
  // 检查是否需要尝试其他方式获取更完整数据
  const isDataComprehensive = allData.length >= MIN_ITEMS_PER_ID * uniqueIds.size;
  
  if (!isDataComprehensive && uniqueIds.size > 0) {
    logMessage(`数据可能不够完整，尝试其他方式获取补充数据...`, true);
    
    // 尝试使用备用URL或方法获取数据
    try {
      // 提取主域名和路径
      const urlParts = url.match(/^(https?:\/\/[^/]+)(.*)$/);
      if (urlParts && urlParts.length >= 3) {
        const domain = urlParts[1];
        
        // 尝试WordPress的默认REST API路径
        const wpDefaultPath = `${domain}/wp-json/wp/v2/posts?per_page=100&nocache=${Date.now()}`;
        
        logMessage(`尝试备用API路径获取数据: ${wpDefaultPath}`);
        
        const wpResponse = await axios.get(wpDefaultPath, requestOptions);
        
        if (wpResponse.status === 200 && Array.isArray(wpResponse.data)) {
          const wpData = wpResponse.data;
          logMessage(`通过备用API获取到 ${wpData.length} 条数据`);
          
          // 过滤出尚未包含的数据
          const newItems = wpData.filter(item => 
            !allData.some(existingItem => 
              existingItem.id && item.id && existingItem.id === item.id
            )
          );
          
          if (newItems.length > 0) {
            logMessage(`添加 ${newItems.length} 条新获取的数据`);
            allData = [...allData, ...newItems];
          }
        }
      }
    } catch (backupError) {
      logMessage(`尝试备用方法获取数据失败: ${backupError.message}`, true);
    }
  }
  
  logMessage(`数据获取完成，总条数: ${allData.length}`);
  
  // 最后阶段：确保数据有完整内容（不仅仅是摘要）
  allData = await ensureCompleteContent(allData, url);
  
  return allData;
}

/**
 * 确保数据有完整内容，对于只有摘要的数据项尝试获取完整内容
 * @param {Array} data 数据数组
 * @param {string} baseUrl 基础URL，用于构建单项请求
 * @returns {Promise<Array>} 补充了完整内容的数据数组
 */
async function ensureCompleteContent(data, baseUrl) {
  if (!data || data.length === 0) return data;
  
  logMessage(`检查 ${data.length} 条数据的内容完整性...`);
  
  // 提取域名和API基础路径
  const urlMatch = baseUrl.match(/^(https?:\/\/[^/]+)(.*)$/);
  if (!urlMatch) return data;
  
  const domain = urlMatch[1];
  let contentMissingCount = 0;
  
  // 创建一个新数组，逐项检查并可能更新内容
  const enhancedData = [];
  
  for (const item of data) {
    // 跳过没有ID的项
    if (!item || !item.id) {
      enhancedData.push(item);
      continue;
    }
    
    // 检查是否缺少内容或内容过短
    const hasFullContent = item.content && 
                         typeof item.content === 'string' && 
                         item.content.length > 200;
    
    // 还需要检查内容是否已渲染形式提供
    const hasRenderedContent = item.content && 
                             item.content.rendered && 
                             typeof item.content.rendered === 'string' && 
                             item.content.rendered.length > 200;
    
    if (hasFullContent || hasRenderedContent) {
      // 已有完整内容，直接添加
      enhancedData.push(item);
    } else {
      // 缺少完整内容，尝试单独获取
      contentMissingCount++;
      
      // 构建可能的单项获取URL
      // 尝试多种可能的路径模式
      const possiblePaths = [
        `${domain}/wp-json/wp/v2/posts/${item.id}`,
        `${domain}/wp-json/maigeeku/v1/news-by-id/${item.id}`,
        `${domain}/wp-json/wp/v2/tools_guides/${item.id}`
      ];
      
      let gotFullItem = false;
      
      for (const itemUrl of possiblePaths) {
        if (gotFullItem) break;
        
        try {
          logMessage(`尝试获取ID ${item.id} 的完整内容: ${itemUrl}`);
          
          const response = await axios.get(`${itemUrl}?nocache=${Date.now()}`, CONFIG.requestOptions);
          
          if (response.status === 200 && response.data) {
            let fullItem = null;
            
            if (Array.isArray(response.data) && response.data.length > 0) {
              fullItem = response.data[0];
            } else if (response.data && typeof response.data === 'object') {
              fullItem = response.data;
            }
            
            if (fullItem) {
              // 检查获取的项是否包含更完整的内容
              const newHasFullContent = fullItem.content && 
                                      (typeof fullItem.content === 'string' && fullItem.content.length > 200 ||
                                       fullItem.content.rendered && fullItem.content.rendered.length > 200);
              
              if (newHasFullContent) {
                logMessage(`成功获取ID ${item.id} 的完整内容`);
                // 合并原始项和完整内容项，保留原始项的其他字段
                enhancedData.push({...item, ...fullItem});
                gotFullItem = true;
              }
            }
          }
        } catch (error) {
          logMessage(`获取ID ${item.id} 完整内容失败: ${error.message}`, true);
        }
      }
      
      // 如果所有尝试都失败，添加原始项
      if (!gotFullItem) {
        enhancedData.push(item);
      }
    }
  }
  
  logMessage(`内容完整性检查完成，处理了 ${contentMissingCount} 条缺少完整内容的数据`);
  return enhancedData;
}

// 主函数
async function main() {
  try {
    ensureLogDir();
    logMessage('===== 开始CMS内容自动更新 =====');
    
    // 检查物流资讯更新
    const { hasNewsUpdates, newRecord: newsRecord } = await checkNewsUpdates();
    
    // 检查工具与指南更新
    const { hasToolsUpdates, newRecord: toolsRecord } = await checkToolsUpdates();
    
    // 合并记录
    const finalRecord = {
      news: newsRecord.news,
      tools: toolsRecord.tools
    };
    
    // 保存更新记录
    saveUpdateRecord(finalRecord);
    
    if (!hasNewsUpdates && !hasToolsUpdates) {
      logMessage('没有发现任何更新，结束运行');
    }
    
    logMessage('===== CMS内容自动更新完成 =====');
  } catch (error) {
    logMessage(`自动更新过程中发生错误: ${error.message}`, true);
  }
}

// 运行主函数
main().catch(error => {
  logMessage(`程序运行出错: ${error.message}`, true);
}); 
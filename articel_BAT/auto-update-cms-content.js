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
  ]
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
async function fetchNews(region) {
  try {
    const url = `${CONFIG.cmsUrl}${CONFIG.newsApiPath}/${region}`;
    logMessage(`获取${region}地区资讯: ${url}`);
    
    const response = await axios.get(url);
    
    if (response.data && Array.isArray(response.data)) {
      logMessage(`成功获取${region}地区资讯，共${response.data.length}条`);
      return response.data;
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
    const url = `${CONFIG.cmsUrl}${CONFIG.toolsApiBasePath}/${category}`;
    logMessage(`获取${category}类工具: ${url}`);
    
    const response = await axios.get(url);
    
    if (response.data && Array.isArray(response.data)) {
      logMessage(`成功获取${category}类工具，共${response.data.length}条`);
      return response.data;
    }
    
    return [];
  } catch (error) {
    logMessage(`获取${category}类工具失败: ${error.message}`, true);
    return [];
  }
}

// 获取最新工具列表
async function fetchLatestTools() {
  try {
    const url = `${CONFIG.cmsUrl}${CONFIG.toolsApiPath}`;
    logMessage(`获取最新工具列表: ${url}`);
    
    const response = await axios.get(url);
    
    if (response.data && Array.isArray(response.data)) {
      logMessage(`成功获取最新工具列表，共${response.data.length}条`);
      return response.data;
    }
    
    return [];
  } catch (error) {
    logMessage(`获取最新工具列表失败: ${error.message}`, true);
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
    const news = await fetchNews(region);
    
    if (news.length > 0) {
      // 保存最新ID记录
      const latestNewsId = Math.max(...news.map(item => parseInt(item.id)));
      newRecord.news[region] = latestNewsId;
      
      // 检查是否有更新
      const lastNewsId = lastRecord.news && lastRecord.news[region] ? lastRecord.news[region] : 0;
      
      if (latestNewsId > lastNewsId) {
        logMessage(`${region}地区发现新资讯：上次ID ${lastNewsId}，最新ID ${latestNewsId}`);
        hasUpdates = true;
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
  const lastRecord = loadLastUpdateRecord();
  let hasUpdates = false;
  
  logMessage('开始检查工具与指南更新...');
  
  // 获取最新工具列表
  const latestTools = await fetchLatestTools();
  
  if (latestTools.length === 0) {
    logMessage('无法获取工具与指南列表');
    return { hasToolsUpdates: false, newRecord: lastRecord };
  }
  
  // 获取最新工具ID
  const latestToolId = Math.max(...latestTools.map(tool => parseInt(tool.id)));
  
  // 检查每个分类
  const newRecord = {
    news: lastRecord.news || {},
    tools: {}
  };
  
  // 设置最新ID
  newRecord.tools.latest = latestToolId;
  
  // 检查是否有更新
  const lastToolId = lastRecord.tools && lastRecord.tools.latest ? lastRecord.tools.latest : 0;
  
  if (latestToolId > lastToolId) {
    logMessage(`发现工具与指南更新：上次ID ${lastToolId}，最新ID ${latestToolId}`);
    hasUpdates = true;
    
    // 同时检查每个分类的最新工具
    for (const category of CONFIG.toolCategories) {
      const tools = await fetchTools(category);
      
      if (tools.length > 0) {
        const latestCatId = Math.max(...tools.map(tool => parseInt(tool.id)));
        newRecord.tools[category] = latestCatId;
        
        const lastCatId = lastRecord.tools && lastRecord.tools[category] ? lastRecord.tools[category] : 0;
        
        if (latestCatId > lastCatId) {
          logMessage(`${category}类别发现新工具：上次ID ${lastCatId}，最新ID ${latestCatId}`);
        }
      }
    }
  } else {
    logMessage('工具与指南无更新');
    return { hasToolsUpdates: false, newRecord: lastRecord };
  }
  
  if (hasUpdates) {
    logMessage('发现工具与指南更新，将生成静态页面');
    await generateToolsPages();
  }
  
  return { hasToolsUpdates: hasUpdates, newRecord };
}

// 生成资讯静态页面
function generateNewsPages() {
  return new Promise((resolve, reject) => {
    logMessage('执行资讯静态页面生成脚本...');
    
    exec('node ../tools/generate-static-news.js', (error, stdout, stderr) => {
      if (error) {
        logMessage(`生成资讯静态页面失败: ${error.message}`, true);
        if (stderr) logMessage(stderr, true);
        reject(error);
        return;
      }
      
      logMessage(stdout);
      logMessage('资讯静态页面生成完成');
      
      // 更新资讯索引
      exec('node ../tools/update-news-index.js', (error, stdout, stderr) => {
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
    });
  });
}

// 生成工具静态页面
function generateToolsPages() {
  return new Promise((resolve, reject) => {
    logMessage('执行工具与指南静态页面生成脚本...');
    
    exec('node ../tools/generate-tools-guides.js', (error, stdout, stderr) => {
      if (error) {
        logMessage(`生成工具与指南静态页面失败: ${error.message}`, true);
        if (stderr) logMessage(stderr, true);
        reject(error);
        return;
      }
      
      logMessage(stdout);
      logMessage('工具与指南静态页面生成完成');
      resolve();
    });
  });
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
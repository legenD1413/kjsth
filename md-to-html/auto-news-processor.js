/**
 * 自动新闻处理工具
 * 检测新闻Markdown文件的更改，转换为HTML并更新索引
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const mdConverter = require('./md-convert');
const { updateNewsIndex } = require('./update-lists');

// 配置
const config = {
  // 源文件目录
  sourcePath: path.resolve(__dirname, '../news-md'),
  // 目标文件目录
  targetBasePath: path.resolve(__dirname, '../static-news'),
  // 区域映射（从中文到英文目录名）
  regionMap: {
    '全球': 'global',
    '北美': 'north-america',
    '南美': 'south-america',
    '欧洲': 'europe',
    '亚洲': 'asia',
    '大洋洲': 'australia',
    '非洲': 'africa',
    '中东': 'middle-east'
  },
  // 更新的区域列表（用于更新索引）
  updatedRegions: new Set()
};

/**
 * 获取修改过的Markdown文件
 * 比较Markdown文件与对应HTML文件的修改时间
 * @returns {Array} 修改过的文件路径数组
 */
function getModifiedFiles() {
  const mdFiles = glob.sync(`${config.sourcePath}/**/*.md`);
  const modifiedFiles = [];

  for (const mdFile of mdFiles) {
    const mdStat = fs.statSync(mdFile);
    let isModified = true;

    // 提取元数据以确定HTML文件的位置
    try {
      const content = fs.readFileSync(mdFile, 'utf8');
      const metadata = mdConverter.extractMetadata(content);
      
      // 获取所有区域代码
      const regionCodes = getRegionCodes(metadata);
      
      // 默认检查主区域
      let allRegionsUpToDate = true;
      
      // 对每个区域都检查是否有更新
      for (const regionCode of regionCodes) {
        // 查找可能的HTML文件（基于文件名模式匹配）
        const mdBaseName = path.basename(mdFile, '.md');
        const htmlPattern = `${config.targetBasePath}/${regionCode}/news_*_*.html`;
        const possibleHtmlFiles = glob.sync(htmlPattern);
        
        let regionUpToDate = false;
        
        // 检查每个可能的HTML文件的内容，查找标题匹配
        for (const htmlFile of possibleHtmlFiles) {
          try {
            const htmlContent = fs.readFileSync(htmlFile, 'utf8');
            // 如果HTML文件包含Markdown的标题，且HTML文件比Markdown文件新
            if (htmlContent.includes(metadata.title)) {
              const htmlStat = fs.statSync(htmlFile);
              if (htmlStat.mtime >= mdStat.mtime) {
                regionUpToDate = true;
                break;
              }
            }
          } catch (err) {
            // 忽略读取HTML文件的错误
            console.log(`警告: 无法读取可能的HTML文件 ${htmlFile}`);
          }
        }
        
        // 如果任一区域需要更新，则整体需要更新
        if (!regionUpToDate) {
          allRegionsUpToDate = false;
        }
      }
      
      // 如果所有区域都是最新的，则不需要更新
      isModified = !allRegionsUpToDate;
    } catch (err) {
      console.error(`处理文件时出错 ${mdFile}:`, err);
      // 如果无法确定，视为已修改
      isModified = true;
    }
    
    if (isModified) {
      modifiedFiles.push(mdFile);
    }
  }
  
  return modifiedFiles;
}

/**
 * 获取所有区域的英文代码
 * @param {Object} metadata - 文件元数据
 * @returns {Array} 区域代码数组
 */
function getRegionCodes(metadata) {
  const regionCodes = new Set();
  
  // 处理单个区域
  if (metadata.region && config.regionMap[metadata.region]) {
    regionCodes.add(config.regionMap[metadata.region]);
  }
  
  // 处理多个区域
  if (metadata.regions && Array.isArray(metadata.regions)) {
    for (const region of metadata.regions) {
      if (config.regionMap[region]) {
        regionCodes.add(config.regionMap[region]);
      }
    }
  }
  
  // 如果没有找到任何有效区域，使用全球作为默认
  if (regionCodes.size === 0) {
    regionCodes.add('global');
  }
  
  return Array.from(regionCodes);
}

/**
 * 处理单个Markdown文件
 * @param {string} filePath - Markdown文件路径
 * @returns {boolean} 是否成功处理
 */
function processFile(filePath) {
  try {
    console.log(`处理文件: ${filePath}`);
    
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = mdConverter.extractMetadata(content);
    
    // 获取所有区域
    const regionCodes = getRegionCodes(metadata);
    
    let allSuccess = true;
    
    // 为每个区域生成HTML文件
    for (const regionCode of regionCodes) {
      // 确保目标目录存在
      const targetDir = path.join(config.targetBasePath, regionCode);
      fs.ensureDirSync(targetDir);
      
      // 生成输出文件名
      const now = new Date();
      const dateStr = now.getFullYear() + 
                    ('0' + (now.getMonth() + 1)).slice(-2) + 
                    ('0' + now.getDate()).slice(-2) + '_' +
                    ('0' + now.getHours()).slice(-2) + 
                    ('0' + now.getMinutes()).slice(-2) + 
                    ('0' + now.getSeconds()).slice(-2);
      const randomNum = Math.floor(Math.random() * 100000);
      const outputFile = path.join(targetDir, `news_${dateStr}_${randomNum}.html`);
      
      // 转换文件
      const result = mdConverter.processMarkdownFile(filePath, outputFile, 'news');
      
      if (result.success) {
        console.log(`成功: ${filePath} 已转换为 ${outputFile} (区域: ${regionCode})`);
        // 添加到更新区域列表
        config.updatedRegions.add(regionCode);
      } else {
        console.error(`失败: ${filePath} 转换失败 - ${result.error} (区域: ${regionCode})`);
        allSuccess = false;
      }
    }
    
    return allSuccess;
  } catch (error) {
    console.error(`处理文件失败 ${filePath}:`, error);
    return false;
  }
}

/**
 * 更新所有修改过区域的索引
 */
function updateIndices() {
  for (const region of config.updatedRegions) {
    console.log(`更新区域索引: ${region}`);
    updateNewsIndex(region);
  }
}

/**
 * 主函数 - 执行整个处理流程
 */
async function main() {
  try {
    console.log('开始自动新闻处理...');
    
    // 获取修改过的文件
    const modifiedFiles = getModifiedFiles();
    console.log(`发现 ${modifiedFiles.length} 个修改过的文件`);
    
    if (modifiedFiles.length === 0) {
      console.log('没有需要处理的文件');
      return;
    }
    
    // 处理每个文件
    let successCount = 0;
    for (const file of modifiedFiles) {
      if (processFile(file)) {
        successCount++;
      }
    }
    
    console.log(`已处理 ${modifiedFiles.length} 个文件，成功 ${successCount} 个`);
    
    // 更新索引
    if (successCount > 0) {
      updateIndices();
    }
    
    console.log('自动新闻处理完成');
  } catch (error) {
    console.error('处理过程中出错:', error);
  }
}

// 如果直接运行此脚本（而不是作为模块导入）
if (require.main === module) {
  main();
}

module.exports = {
  getModifiedFiles,
  processFile,
  updateIndices,
  main,
  getRegionCodes
}; 
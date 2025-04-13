/**
 * 自动指南处理工具
 * 检测指南Markdown文件的更改，转换为HTML并更新索引
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const mdConverter = require('./md-convert');
const { updateGuidesIndex } = require('./update-lists');

// 配置
const config = {
  // 源文件目录
  sourcePath: path.resolve(__dirname, '../guides-md'),
  // 目标文件目录
  targetBasePath: path.resolve(__dirname, '../tools-guides'),
  // 分类映射（从中文到英文目录名）
  categoryMap: {
    '监管法规': 'regulations',
    '海关指南': 'customs',
    '运输指南': 'shipping',
    '包装指南': 'packaging',
    '亚马逊FBA': 'fba',
    '物流基础知识': 'logistics',
    '实用工具使用指南': 'calculator',
    '报关指南': 'declaration',
    '税务指南': 'tax',
    '保险指南': 'insurance',
    '物流跟踪': 'tracking',
    '退货处理': 'returns',
    '国际物流': 'international',
    '快递服务': 'express',
    '商业件运输': 'commercial',
    '超大件运输': 'biggoods',
    '海外仓': 'warehouse',
    '互动工具': 'interactive',
    '指南': 'guides',
    '计算工具': 'calculators',
    '表单工具': 'forms'
  },
  // 更新的分类列表（用于更新索引）
  updatedCategories: new Set()
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
      
      // 获取所有分类代码
      const categoryCodes = getCategoryCodes(metadata);
      
      // 默认检查主分类
      let allCategoriesUpToDate = true;
      
      // 对每个分类都检查是否有更新
      for (const categoryCode of categoryCodes) {
        // 查找可能的HTML文件（基于文件名模式匹配）
        const mdBaseName = path.basename(mdFile, '.md');
        const htmlPattern = `${config.targetBasePath}/${categoryCode}/guide_*_*.html`;
        const possibleHtmlFiles = glob.sync(htmlPattern);
        
        let categoryUpToDate = false;
        
        // 检查每个可能的HTML文件的内容，查找标题匹配
        for (const htmlFile of possibleHtmlFiles) {
          try {
            const htmlContent = fs.readFileSync(htmlFile, 'utf8');
            // 如果HTML文件包含Markdown的标题，且HTML文件比Markdown文件新
            if (htmlContent.includes(metadata.title)) {
              const htmlStat = fs.statSync(htmlFile);
              if (htmlStat.mtime >= mdStat.mtime) {
                categoryUpToDate = true;
                break;
              }
            }
          } catch (err) {
            // 忽略读取HTML文件的错误
            console.log(`警告: 无法读取可能的HTML文件 ${htmlFile}`);
          }
        }
        
        // 如果任一分类需要更新，则整体需要更新
        if (!categoryUpToDate) {
          allCategoriesUpToDate = false;
        }
      }
      
      // 如果所有分类都是最新的，则不需要更新
      isModified = !allCategoriesUpToDate;
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
 * 获取所有分类的英文代码
 * @param {Object} metadata - 文件元数据
 * @returns {Array} 分类代码数组
 */
function getCategoryCodes(metadata) {
  const categoryCodes = new Set();
  
  // 处理单个分类
  if (metadata.category && config.categoryMap[metadata.category]) {
    categoryCodes.add(config.categoryMap[metadata.category]);
  }
  
  // 处理多个分类
  if (metadata.categories && Array.isArray(metadata.categories)) {
    for (const category of metadata.categories) {
      if (config.categoryMap[category]) {
        categoryCodes.add(config.categoryMap[category]);
      }
    }
  }
  
  // 如果没有找到任何有效分类，使用指南作为默认
  if (categoryCodes.size === 0) {
    categoryCodes.add('guides');
  }
  
  return Array.from(categoryCodes);
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
    
    // 获取所有分类
    const categoryCodes = getCategoryCodes(metadata);
    
    let allSuccess = true;
    
    // 为每个分类生成HTML文件
    for (const categoryCode of categoryCodes) {
      // 确保目标目录存在
      const targetDir = path.join(config.targetBasePath, categoryCode);
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
      const outputFile = path.join(targetDir, `guide_${dateStr}_${randomNum}.html`);
      
      // 转换文件
      const result = mdConverter.processMarkdownFile(filePath, outputFile, 'tool');
      
      if (result.success) {
        console.log(`成功: ${filePath} 已转换为 ${outputFile} (分类: ${categoryCode})`);
        // 添加到更新分类列表
        config.updatedCategories.add(categoryCode);
      } else {
        console.error(`失败: ${filePath} 转换失败 - ${result.error} (分类: ${categoryCode})`);
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
 * 更新所有修改过分类的索引
 */
function updateIndices() {
  for (const category of config.updatedCategories) {
    console.log(`更新分类索引: ${category}`);
    updateGuidesIndex(category);
  }
}

/**
 * 主函数 - 执行整个处理流程
 */
async function main() {
  try {
    console.log('开始自动指南处理...');
    
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
    
    console.log('自动指南处理完成');
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
  getCategoryCodes
}; 
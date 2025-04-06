/**
 * 移除所有静态新闻页面中的"查看原文"按钮
 * 
 * 该脚本扫描所有地区的静态新闻文件，移除"查看原文"按钮
 */

const fs = require('fs');
const path = require('path');

// 静态新闻目录
const staticNewsDir = path.join(__dirname, '..', 'static-news');

/**
 * 处理单个HTML文件并移除"查看原文"按钮
 * @param {string} filePath - 文件路径
 */
function processHtmlFile(filePath) {
    try {
        // 读取文件内容
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 查找并移除"查看原文"按钮
        const regex = /<a\s+href="[^"]*"\s+target="_blank"\s+class="view-original"[^>]*>[\s\S]*?<i[^>]*><\/i>[^<]*查看原文[\s\S]*?<\/a>/;
        
        if (regex.test(content)) {
            // 移除按钮
            content = content.replace(regex, '');
            
            // 写回文件
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`已处理: ${filePath}`);
        } else {
            console.log(`跳过(未找到查看原文按钮): ${filePath}`);
        }
    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error);
    }
}

/**
 * 处理一个地区的所有HTML文件
 * @param {string} regionPath - 地区目录路径
 */
function processRegionFiles(regionPath) {
    try {
        // 获取地区目录中的所有文件
        const files = fs.readdirSync(regionPath);
        
        // 遍历文件，处理HTML文件
        for (const file of files) {
            // 跳过index.html和非HTML文件
            if (file === 'index.html' || !file.endsWith('.html')) continue;
            
            const filePath = path.join(regionPath, file);
            processHtmlFile(filePath);
        }
    } catch (error) {
        console.error(`处理地区 ${regionPath} 时出错:`, error);
    }
}

/**
 * 处理所有区域
 */
function processAllRegions() {
    try {
        // 获取所有地区目录
        const regions = fs.readdirSync(staticNewsDir);
        
        // 遍历地区
        for (const region of regions) {
            // 跳过非目录文件
            const regionPath = path.join(staticNewsDir, region);
            if (!fs.statSync(regionPath).isDirectory()) continue;
            
            console.log(`处理地区: ${region}`);
            processRegionFiles(regionPath);
        }
        
        console.log('所有静态新闻页面已更新');
    } catch (error) {
        console.error('处理静态新闻目录时出错:', error);
    }
}

// 执行主函数
processAllRegions(); 
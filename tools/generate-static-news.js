/**
 * 静态资讯页面生成器
 * 
 * 此脚本用于获取WordPress API中的物流资讯，并生成静态HTML页面
 * 使用方法: node generate-static-news.js
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 配置
const config = {
    // WordPress API地址
    wordpressUrl: 'https://cms.kjsth.com',
    // 静态文件输出目录
    outputDir: '../static-news',
    // 文章模板路径
    templatePath: './news-template.html',
    // 区域列表
    regions: [
        { code: 'north-america', name: '北美' },
        { code: 'middle-east', name: '中东' },
        { code: 'europe', name: '欧洲' },
        { code: 'asia', name: '亚洲' },
        { code: 'australia', name: '澳洲' },
        { code: 'africa', name: '非洲' },
        { code: 'south-america', name: '南美' },
        { code: 'global', name: '全球' }
    ]
};

/**
 * 发起HTTP/HTTPS请求获取数据
 * @param {string} url - 请求地址
 * @returns {Promise<Object>} - 返回JSON数据
 */
function fetchData(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (res) => {
            let data = '';
            
            // 接收数据
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            // 数据接收完成
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    reject(new Error(`解析JSON失败: ${e.message}`));
                }
            });
        }).on('error', (err) => {
            reject(new Error(`请求失败: ${err.message}`));
        });
    });
}

/**
 * 获取指定区域的所有资讯
 * @param {string} region - 区域代码
 * @returns {Promise<Array>} - 返回资讯数组
 */
async function getNewsByRegion(region) {
    const url = `${config.wordpressUrl}/wp-json/maigeeku/v1/news-by-region/${region}?limit=100`;
    
    try {
        return await fetchData(url);
    } catch (error) {
        console.error(`获取${region}区域资讯失败:`, error);
        return [];
    }
}

/**
 * 格式化资讯重要性
 * @param {string} importance - 重要性代码
 * @returns {string} - 格式化后的文本
 */
function formatImportance(importance) {
    const labels = {
        'normal': '普通',
        'important': '重要',
        'very_important': '非常重要'
    };
    return labels[importance] || '普通';
}

/**
 * 生成静态HTML页面
 * @param {Object} newsItem - 资讯数据
 * @param {string} region - 区域代码
 * @param {string} regionName - 区域名称
 */
async function generateNewsPage(newsItem, region, regionName) {
    try {
        // 创建输出目录
        const dirPath = path.join(config.outputDir, region);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // 读取模板
        let template = fs.readFileSync(config.templatePath, 'utf8');
        
        // 替换模板变量
        template = template
            .replace(/\{\{TITLE\}\}/g, newsItem.title)
            .replace(/\{\{DATE\}\}/g, newsItem.date)
            .replace(/\{\{REGION_CODE\}\}/g, region)
            .replace(/\{\{REGION_NAME\}\}/g, regionName)
            .replace(/\{\{CONTENT\}\}/g, newsItem.excerpt || '暂无内容')
            .replace(/\{\{IMPORTANCE\}\}/g, newsItem.importance)
            .replace(/\{\{IMPORTANCE_TEXT\}\}/g, formatImportance(newsItem.importance))
            .replace(/\{\{ORIGINAL_LINK\}\}/g, newsItem.link);
        
        // 写入文件
        const fileName = `${newsItem.id}.html`;
        const filePath = path.join(dirPath, fileName);
        fs.writeFileSync(filePath, template);
        
        console.log(`✅ 生成文章: ${region}/${fileName}`);
        
        return {
            id: newsItem.id,
            title: newsItem.title,
            fileName: fileName,
            region: region
        };
    } catch (error) {
        console.error(`生成页面失败 [${newsItem.id}]:`, error);
        return null;
    }
}

/**
 * 生成索引页面
 * @param {Array} allNews - 所有生成的资讯数据
 */
function generateIndexPage(allNews) {
    try {
        // 按区域组织资讯
        const newsByRegion = {};
        
        config.regions.forEach(region => {
            newsByRegion[region.code] = allNews.filter(item => item.region === region.code);
        });
        
        // 生成HTML
        let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>物流资讯索引 - 物流服务网站</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body, h1, h2, h3, h4, p, a, ul, li {
            font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
        }
        
        .container {
            max-width: 1000px;
            margin: 80px auto 40px;
            padding: 2rem;
            background: white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            border-radius: 8px;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #eee;
        }
        
        .region-section {
            margin-bottom: 2rem;
        }
        
        .region-title {
            font-size: 1.4rem;
            color: #3498db;
            margin-bottom: 1rem;
            position: relative;
            padding-left: 1rem;
        }
        
        .region-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10%;
            height: 80%;
            width: 4px;
            background: linear-gradient(to bottom, #3498db, #2980b9);
            border-radius: 2px;
        }
        
        .news-list {
            list-style: none;
            padding: 0;
        }
        
        .news-item {
            padding: 0.8rem;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid #f5f5f5;
        }
        
        .news-item a {
            color: #2c3e50;
            text-decoration: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .news-item a:hover {
            color: #3498db;
        }
        
        .news-date {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .no-news {
            padding: 1rem;
            color: #7f8c8d;
            text-align: center;
            font-style: italic;
        }
        
        .back-link {
            display: inline-block;
            margin-top: 1rem;
            color: #3498db;
            text-decoration: none;
        }
        
        .back-link i {
            margin-right: 0.3rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>物流资讯索引</h1>`;
        
        config.regions.forEach(region => {
            const regionNews = newsByRegion[region.code];
            
            html += `
        <div class="region-section">
            <h2 class="region-title">${region.name}物流资讯</h2>
            <ul class="news-list">`;
            
            if (regionNews.length > 0) {
                regionNews.forEach(news => {
                    html += `
                <li class="news-item">
                    <a href="${region.code}/${news.id}.html">
                        <span>${news.title}</span>
                    </a>
                </li>`;
                });
            } else {
                html += `
                <li class="no-news">暂无${region.name}区域资讯</li>`;
            }
            
            html += `
            </ul>
        </div>`;
        });
        
        html += `
        <a href="../index.html" class="back-link"><i class="fas fa-home"></i> 返回首页</a>
    </div>
</body>
</html>`;
        
        // 写入文件
        fs.writeFileSync(path.join(config.outputDir, 'index.html'), html);
        console.log('✅ 生成资讯索引页面成功');
    } catch (error) {
        console.error('生成索引页面失败:', error);
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始生成静态资讯页面...');

    // 确保输出目录存在
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // 保存所有生成的资讯信息
    const allGeneratedNews = [];
    
    // 处理每个区域
    for (const region of config.regions) {
        console.log(`📂 处理${region.name}区域的资讯...`);
        
        // 获取资讯
        const news = await getNewsByRegion(region.code);
        
        if (news.length === 0) {
            console.log(`⚠️ ${region.name}区域暂无资讯`);
            continue;
        }
        
        // 生成页面
        for (const item of news) {
            const result = await generateNewsPage(item, region.code, region.name);
            if (result) {
                allGeneratedNews.push(result);
            }
        }
    }
    
    // 生成索引页
    generateIndexPage(allGeneratedNews);
    
    console.log(`🎉 静态资讯页面生成完成，共生成 ${allGeneratedNews.length} 个页面`);
}

// 运行主函数
main().catch(error => {
    console.error('程序运行出错:', error);
}); 
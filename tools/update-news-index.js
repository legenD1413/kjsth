/**
 * 新闻索引页面更新工具
 * 
 * 此脚本用于扫描静态新闻文件并更新索引页面
 * 使用方法: node update-news-index.js
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 配置
const config = {
    // WordPress API地址
    wordpressUrl: 'https://cms.kjsth.com',
    // 静态文件输出目录
    outputDir: path.resolve(__dirname, '../static-news'),
    // 文章模板路径
    templatePath: path.resolve(__dirname, './news-template.html'),
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
    ],
    // 网站主区域页面路径
    regionsDir: path.resolve(__dirname, '../regions')
};

/**
 * 从HTML文件中提取标题和其他元数据
 * @param {string} filePath - HTML文件路径
 * @returns {Object|null} - 提取的元数据
 */
function extractMetaFromHtml(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 提取标题
        const titleMatch = content.match(/<h1 class="news-title">(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1].replace(/<span.*?<\/span>/, '').trim() : '未知标题';
        
        // 提取日期
        const dateMatch = content.match(/<div class="news-date">[^<]*<i[^>]*>[^<]*<\/i>\s*<span>(.*?)<\/span>/);
        const date = dateMatch ? dateMatch[1].trim() : '未知日期';
        
        // 提取重要性
        let importance = 'normal';
        if (content.includes('importance-important')) {
            importance = 'important';
        } else if (content.includes('importance-very_important')) {
            importance = 'very_important';
        }
        
        // 提取摘要内容
        const contentMatch = content.match(/<div class="news-content">([\s\S]*?)<\/div>/);
        let excerpt = '暂无内容摘要';
        if (contentMatch) {
            // 去除HTML标签，保留文本内容
            const textContent = contentMatch[1]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除所有script标签及内容
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // 移除所有style标签及内容
                .replace(/<[^>]+>/g, ' ')  // 替换所有HTML标签为空格
                .replace(/&nbsp;/g, ' ')   // 替换HTML空格
                .replace(/\s+/g, ' ')      // 合并连续空格为单个空格
                .trim();                   // 去除首尾空格
            
            // 限制摘要长度，确保显示内容完整
            excerpt = textContent.substring(0, 150);
            if (textContent.length > 150) {
                // 如果截断了，尝试在最后一个完整单词或标点后截断
                const lastSpace = excerpt.lastIndexOf(' ');
                const lastPunctuation = Math.max(
                    excerpt.lastIndexOf('.'), 
                    excerpt.lastIndexOf('。'),
                    excerpt.lastIndexOf('!'),
                    excerpt.lastIndexOf('！'),
                    excerpt.lastIndexOf('?'),
                    excerpt.lastIndexOf('？')
                );
                const betterBreakPoint = Math.max(lastSpace, lastPunctuation);
                
                if (betterBreakPoint > 100) { // 确保不会截取太短
                    excerpt = excerpt.substring(0, betterBreakPoint + 1);
                }
                
                excerpt += '...';
            }
        }
        
        return {
            title,
            date,
            importance,
            excerpt
        };
    } catch (error) {
        console.error(`提取元数据失败 [${filePath}]:`, error);
        return null;
    }
}

/**
 * 扫描区域并更新索引
 */
async function updateRegionIndices() {
    // 收集所有区域的最新文章数据
    let allRegionsNewsItems = {};
    
    for (const region of config.regions) {
        const regionDir = path.join(config.outputDir, region.code);
        
        if (!fs.existsSync(regionDir)) {
            console.log(`创建区域目录: ${region.code}`);
            fs.mkdirSync(regionDir, { recursive: true });
        }
        
        const files = fs.readdirSync(regionDir);
        console.log(`${region.code} 区域中的文件:`, files);
        
        let newsFiles = files.filter(file => {
            return file.match(/^\d+\.html$/);
        });
        
        console.log(`${region.code} 区域中找到的资讯文件:`, newsFiles);
        
        // 按文件名排序（数字大的在前，即最新的在前）
        newsFiles.sort((a, b) => {
            const numA = parseInt(a.replace('.html', ''));
            const numB = parseInt(b.replace('.html', ''));
            return numB - numA;
        });
        
        // 收集新闻数据
        const newsItems = [];
        for (const file of newsFiles) {
            const filePath = path.join(regionDir, file);
            console.log(`正在处理文件: ${filePath}`);
            
            const meta = extractMetaFromHtml(filePath);
            console.log(`提取的元数据:`, meta);
            
            if (meta) {
                newsItems.push({
                    ...meta,
                    id: file.replace('.html', ''),
                    file
                });
            }
        }
        
        // 保存该区域的新闻项目
        allRegionsNewsItems[region.code] = newsItems;
        
        // 更新区域首页
        updateRegionIndex(region, newsItems);
        console.log(`✅ 已更新 ${region.code} 区域索引，共 ${newsItems.length} 篇文章`);
    }
    
    // 更新主索引页面
    updateMainIndex();
    
    // 更新网站区域页面的资讯侧边栏
    updateWebsiteRegionPages(allRegionsNewsItems);
}

/**
 * 更新网站区域页面的资讯侧边栏
 * @param {Object} allRegionsNewsItems - 所有区域的资讯数据
 */
async function updateWebsiteRegionPages(allRegionsNewsItems) {
    console.log('开始更新网站区域页面的资讯侧边栏...');
    
    for (const region of config.regions) {
        const regionPagePath = path.join(config.regionsDir, region.code, 'index.html');
        
        // 检查文件是否存在
        if (!fs.existsSync(regionPagePath)) {
            console.log(`区域页面不存在，跳过: ${regionPagePath}`);
            continue;
        }
        
        try {
            // 获取该区域的最新资讯
            const newsItems = allRegionsNewsItems[region.code] || [];
            
            // 读取区域页面
            const content = fs.readFileSync(regionPagePath, 'utf8');
            
            // 使用cheerio解析HTML
            const $ = cheerio.load(content);
            
            // 查找资讯列表容器
            const articleList = $('.article-list');
            
            if (articleList.length === 0) {
                console.log(`找不到资讯列表容器，跳过: ${regionPagePath}`);
                continue;
            }
            
            // 清空现有内容
            articleList.empty();
            
            // 添加最新资讯（最多8篇）
            const maxNewsToShow = 8;
            const newsToShow = newsItems.slice(0, maxNewsToShow);
            
            if (newsToShow.length > 0) {
                newsToShow.forEach(item => {
                    articleList.append(`
                        <li>
                            <a href="/static-news/${region.code}/${item.id}.html">
                                ${item.title}
                            </a>
                        </li>
                    `);
                });
            } else {
                articleList.append(`
                    <li>
                        <span style="color: #7f8c8d;">暂无${region.name}地区最新资讯</span>
                    </li>
                `);
            }
            
            // 保存修改后的内容
            fs.writeFileSync(regionPagePath, $.html());
            console.log(`✅ 已更新区域页面资讯侧边栏: ${regionPagePath}`);
        } catch (error) {
            console.error(`更新区域页面失败 [${regionPagePath}]:`, error);
        }
    }
    
    console.log('网站区域页面资讯侧边栏更新完成');
}

/**
 * 更新区域索引页面
 * @param {Object} region - 区域信息
 * @param {Array} newsItems - 新闻条目
 */
function updateRegionIndex(region, newsItems) {
    const indexPath = path.join(config.outputDir, region.code, 'index.html');
    
    // 创建区域标题和描述映射
    const regionDescriptions = {
        'north-america': '关注美国、加拿大等北美地区最新物流动态，包括港口状况、运费变化和政策更新。',
        'middle-east': '了解中东地区物流最新动态、政策变化和运输路线资讯。',
        'europe': '掌握欧洲地区物流市场变化、跨境贸易政策和海运空运最新资讯。',
        'asia': '关注亚洲地区物流行业发展、港口动态和运输新政策。',
        'australia': '了解澳洲地区物流市场、清关政策和海运空运最新资讯。',
        'africa': '掌握非洲地区物流市场发展、国际贸易政策和运输路线动态。',
        'south-america': '关注南美地区物流行业变化、港口状况和国际贸易新政策。',
        'global': '全球物流市场综合资讯，包括行业趋势、技术创新和国际贸易政策。'
    };
    
    // 生成HTML
    let html = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${region.name}地区物流资讯 - 迈格库</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .region-banner {
            background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('../../assets/images/regions/${region.code}.jpg');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 80px 0;
            margin-bottom: 30px;
            position: relative;
        }
        .banner-overlay {
            padding: 0 20px;
            text-align: center;
        }
        .banner-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .banner-description {
            max-width: 800px;
            margin: 0 auto;
            font-size: 1.1rem;
            line-height: 1.6;
        }
        .news-list-container {
            max-width: 900px;
            margin: 0 auto 50px;
            padding: 0 15px;
        }
        .news-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 25px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .news-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .news-card-content {
            padding: 25px;
        }
        .news-title {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 12px;
            line-height: 1.4;
            color: #2c3e50;
        }
        .news-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        .news-date {
            color: #7f8c8d;
            font-size: 14px;
        }
        .news-importance {
            padding: 3px 10px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: bold;
        }
        .importance-normal {
            background-color: #eee;
            color: #555;
        }
        .importance-important {
            background-color: #f39c12;
            color: white;
        }
        .importance-very_important {
            background-color: #e74c3c;
            color: white;
        }
        .news-excerpt {
            margin-bottom: 15px;
            line-height: 1.6;
            color: #555;
        }
        .news-read-more {
            display: inline-block;
            padding: 6px 12px;
            background-color: #3498db;
            color: white;
            border-radius: 4px;
            text-decoration: none;
            transition: background-color 0.3s;
        }
        .news-read-more:hover {
            background-color: #2980b9;
            color: white;
            text-decoration: none;
        }
        .no-news {
            padding: 40px;
            text-align: center;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        .no-news h3 {
            color: #7f8c8d;
            margin-bottom: 15px;
        }
        .update-info {
            text-align: center;
            font-size: 14px;
            color: #95a5a6;
            margin-top: 30px;
        }
        .new-label {
            display: inline-block;
            padding: 2px 6px;
            background-color: #e74c3c;
            color: white;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            margin-left: 10px;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="../../index.html">迈格库</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="../../index.html">首页</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../about.html">关于我们</a>
                        </li>
                        <li class="nav-item active">
                            <a class="nav-link" href="../index.html">物流资讯</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../contact.html">联系我们</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <div class="region-banner">
        <div class="banner-overlay">
            <h1 class="banner-title">${region.name}地区物流资讯</h1>
            <p class="banner-description">${regionDescriptions[region.code] || `关注${region.name}地区最新物流动态和资讯更新。`}</p>
        </div>
    </div>

    <div class="news-list-container">
        <div class="news-filter mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-0">${region.name}地区资讯</h5>
                </div>
                <div>
                    <a href="../index.html" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-arrow-left mr-1"></i> 返回区域选择
                    </a>
                </div>
            </div>
        </div>

        ${newsItems.length > 0 ? 
            newsItems.map((item, index) => `
        ${index === 0 ? `<!-- 最新文章 -->` : `<!-- 文章 ${item.id} -->`}
        <div class="news-card">
            <div class="news-card-content">
                <h2 class="news-title">${item.title} ${index === 0 ? '<span class="new-label">新</span>' : ''}</h2>
                <div class="news-meta">
                    <div class="news-date">
                        <i class="far fa-calendar-alt"></i> ${item.date}
                    </div>
                    <span class="news-importance importance-${item.importance}">${item.importance === 'normal' ? '普通' : item.importance === 'important' ? '重要' : '非常重要'}</span>
                </div>
                <p class="news-excerpt">${item.excerpt}</p>
                <a href="./${item.file}" class="news-read-more">阅读全文</a>
            </div>
        </div>
        `).join('\n') : 
        `
        <div class="no-news">
            <h3><i class="fas fa-info-circle mr-2"></i> 暂无资讯</h3>
            <p>目前${region.name}地区暂无最新物流资讯，请稍后再来查看。</p>
            <a href="../index.html" class="btn btn-outline-primary mt-3">查看其他区域资讯</a>
        </div>
        `}

        <div class="update-info">
            <p>最后更新时间: <span id="lastUpdate"></span></p>
        </div>
    </div>

    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/popper.js/1.16.1/umd/popper.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.min.js"></script>
    <script>
        // 显示最后更新时间
        document.getElementById('lastUpdate').innerText = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    </script>
</body>
</html>
    `;
    
    fs.writeFileSync(indexPath, html);
}

/**
 * 更新主索引页面
 */
function updateMainIndex() {
    const indexPath = path.join(config.outputDir, 'index.html');
    
    // 生成HTML
    let html = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>全球物流资讯中心 - 迈格库</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .page-banner {
            background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../assets/images/global-logistics.jpg');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 100px 0;
            margin-bottom: 50px;
            text-align: center;
        }
        .banner-title {
            font-size: 2.8rem;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .banner-description {
            max-width: 800px;
            margin: 0 auto;
            font-size: 1.2rem;
            line-height: 1.6;
        }
        .regions-container {
            max-width: 1200px;
            margin: 0 auto 70px;
            padding: 0 15px;
        }
        .region-card {
            height: 100%;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .region-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        .region-image {
            height: 180px;
            background-size: cover;
            background-position: center;
            position: relative;
        }
        .region-image::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
        }
        .region-content {
            padding: 20px;
        }
        .region-title {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .region-description {
            color: #7f8c8d;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.5;
        }
        .view-region {
            display: inline-block;
            padding: 8px 20px;
            background-color: #3498db;
            color: white;
            border-radius: 4px;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        .view-region:hover {
            background-color: #2980b9;
            color: white;
            text-decoration: none;
        }
        .update-info {
            text-align: center;
            font-size: 14px;
            color: #95a5a6;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="../index.html">迈格库</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="../index.html">首页</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../about.html">关于我们</a>
                        </li>
                        <li class="nav-item active">
                            <a class="nav-link" href="./index.html">物流资讯</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../contact.html">联系我们</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <div class="page-banner">
        <div class="container">
            <h1 class="banner-title">全球物流资讯中心</h1>
            <p class="banner-description">关注全球各区域最新物流动态、市场趋势和行业政策，助力您的国际物流决策。</p>
        </div>
    </div>

    <div class="regions-container">
        <div class="row">
            ${config.regions.map(region => `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="region-card">
                    <div class="region-image" style="background-image: url('../assets/images/regions/${region.code}.jpg');">
                    </div>
                    <div class="region-content">
                        <h3 class="region-title">${region.name}地区</h3>
                        <p class="region-description">查看${region.name}地区最新物流资讯、政策更新和市场动态。</p>
                        <a href="./${region.code}/index.html" class="view-region">浏览资讯</a>
                    </div>
                </div>
            </div>
            `).join('\n')}
        </div>

        <div class="update-info">
            <p>最后更新时间: <span id="lastUpdate"></span></p>
        </div>
    </div>

    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/popper.js/1.16.1/umd/popper.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.min.js"></script>
    <script>
        // 显示最后更新时间
        document.getElementById('lastUpdate').innerText = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    </script>
</body>
</html>
    `;
    
    fs.writeFileSync(indexPath, html);
    console.log(`✅ 已更新主索引页面`);
}

// 执行更新
updateRegionIndices().catch(error => {
    console.error('更新索引页面时发生错误:', error);
}); 
/**
 * MaigeEku静态物流资讯加载器
 * 
 * 此文件负责从静态HTML文件加载对应地区的物流资讯并显示在网站前端
 * 使用方法：在需要显示物流资讯的页面引入此JS文件
 * 
 * @version 1.0.0
 * @author MaigeEku Team
 */

(function() {
    // 计算静态资讯目录的相对路径
    function getStaticNewsPath() {
        const path = window.location.pathname;
        // 计算当前页面到根目录的相对路径
        let relativePath = '';
        
        // 根据路径深度计算返回的../数量
        const pathParts = path.split('/').filter(p => p);
        if (pathParts.length > 0) {
            // 如果有子目录，则需要添加对应数量的../
            const depth = pathParts.length - 1; // 减去1是因为最后一个部分是文件名
            for (let i = 0; i < depth; i++) {
                relativePath += '../';
            }
        }
        
        console.log('当前页面路径:', path);
        console.log('计算的相对路径:', relativePath + 'static-news');
        
        return relativePath + 'static-news';
    }
    
    // 静态资讯目录 - 动态计算相对路径
    const staticNewsDir = getStaticNewsPath();
    
    // 增加调试日志
    console.log('Static News Loader 初始化...');
    
    // 地区代码到显示名称的映射
    const regionTitles = {
        'north-america': '北美物流资讯',
        'middle-east': '中东物流资讯',
        'europe': '欧洲物流资讯',
        'asia': '亚洲物流资讯',
        'australia': '澳洲物流资讯',
        'africa': '非洲物流资讯',
        'south-america': '南美物流资讯',
        'global': '全球物流资讯'
    };
    
    // 静态资讯数据缓存
    let newsCache = {};
    
    /**
     * 从静态HTML目录加载资讯列表
     * @param {string} region - 地区代码
     * @param {number} limit - 最大显示数量
     * @returns {Promise} 资讯列表Promise
     */
    function fetchStaticNewsList(region, limit = 5) {
        console.log('fetchStaticNewsList 被调用，区域:', region, '限制:', limit);
        
        // 检查缓存
        if (newsCache[region]) {
            console.log('使用缓存数据');
            return Promise.resolve(newsCache[region].slice(0, limit));
        }
        
        // 构建多个可能的URL尝试加载
        const possiblePaths = [
            // 绝对路径
            `/static-news/${region}/index.html`,
            // 站点根目录相对路径
            `./static-news/${region}/index.html`,
            // 深度返回1级
            `../static-news/${region}/index.html`,
            // 深度返回2级
            `../../static-news/${region}/index.html`,
        ];
        
        console.log('尝试以下路径:', possiblePaths);
        
        // 尝试从不同路径加载
        return tryFetchFromPaths(possiblePaths)
            .then(html => {
                if (!html) {
                    throw new Error('无法从任何路径加载资讯列表');
                }
                
                try {
                    // 解析HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // 查找新闻卡片
                    const newsCards = doc.querySelectorAll('.news-card');
                    console.log('找到新闻卡片数量:', newsCards.length);
                    
                    const newsList = [];
                    
                    // 如果没有找到新闻卡片，尝试直接从静态文件构建
                    if (!newsCards || newsCards.length === 0) {
                        console.log('未找到新闻卡片，构建静态列表');
                        const staticEntries = getStaticNewsEntries(region);
                        return staticEntries;
                    }
                    
                    newsCards.forEach(card => {
                        // 提取标题
                        const titleEl = card.querySelector('.news-title');
                        let title = titleEl ? titleEl.textContent.trim() : '无标题';
                        
                        // 移除"新"标签
                        title = title.replace(/<span class="new-label">新<\/span>/, '').trim();
                        
                        // 提取日期
                        const dateEl = card.querySelector('.news-date');
                        const date = dateEl ? 
                            dateEl.textContent.replace(/[\n\r]/g, '').trim() : 
                            '未知日期';
                        
                        // 提取摘要
                        const excerptEl = card.querySelector('.news-excerpt');
                        const excerpt = excerptEl ? 
                            excerptEl.textContent.trim() : 
                            '暂无摘要';
                        
                        // 提取重要性
                        let importance = 'normal';
                        const importanceEl = card.querySelector('.news-importance');
                        if (importanceEl) {
                            if (importanceEl.classList.contains('importance-important')) {
                                importance = 'important';
                            } else if (importanceEl.classList.contains('importance-very_important')) {
                                importance = 'very_important';
                            }
                        }
                        
                        // 提取链接
                        const linkEl = card.querySelector('.news-read-more');
                        const link = linkEl ? linkEl.getAttribute('href') : '#';
                        
                        // 从链接中提取ID
                        const id = link.replace(/^\.\//, '').replace(/\.html$/, '');
                        
                        const newsPath = getSuccessfulPath() || '../../static-news';
                        
                        newsList.push({
                            id,
                            title,
                            date,
                            excerpt,
                            importance,
                            link: `${newsPath}/${region}/${id}.html`,
                            staticLink: true
                        });
                    });
                    
                    // 缓存结果
                    newsCache[region] = newsList;
                    
                    return newsList.slice(0, limit);
                } catch (parseError) {
                    console.error('解析HTML失败:', parseError);
                    // 构建一个备用的新闻列表
                    return getStaticNewsEntries(region);
                }
            })
            .catch(error => {
                console.error('加载静态资讯失败:', error);
                // 构建一个备用的新闻列表
                return getStaticNewsEntries(region);
            });
    }
    
    // 成功路径
    let successfulPath = null;
    
    /**
     * 尝试从多个路径加载资源
     * @param {Array} paths - 路径数组
     * @returns {Promise} HTML内容
     */
    function tryFetchFromPaths(paths) {
        // 递归尝试加载
        function tryNextPath(index) {
            if (index >= paths.length) {
                return Promise.resolve(null);
            }
            
            const currentPath = paths[index];
            console.log(`尝试从路径加载 (${index+1}/${paths.length}): ${currentPath}`);
            
            return fetch(currentPath)
                .then(response => {
                    console.log(`路径 ${currentPath} 响应状态:`, response.status);
                    if (response.ok) {
                        successfulPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                        return response.text();
                    }
                    return tryNextPath(index + 1);
                })
                .catch(error => {
                    console.log(`路径 ${currentPath} 加载失败:`, error.message);
                    return tryNextPath(index + 1);
                });
        }
        
        return tryNextPath(0);
    }
    
    /**
     * 获取成功的路径前缀
     * @returns {string|null} 成功的路径前缀
     */
    function getSuccessfulPath() {
        return successfulPath;
    }
    
    /**
     * 获取静态新闻条目
     * @param {string} region - 地区
     * @returns {Array} 新闻条目数组
     */
    function getStaticNewsEntries(region) {
        // 北美地区的备用数据
        if (region === 'north-america') {
            return [
                {
                    id: '19',
                    title: '为什么你的大件货物总被加拿大物流商拒收？尺寸限制的6个认知误区',
                    date: '2024-04-05',
                    excerpt: '跨境物流发货到加拿大时，大件货物常面临被拒收的情况。本文分析加拿大物流对大件货物的尺寸限制，帮您解决发货难题。',
                    importance: 'important',
                    link: '../../static-news/north-america/19.html',
                    staticLink: true
                },
                {
                    id: '18',
                    title: '美国FBA退货政策新变化及应对策略',
                    date: '2024-03-18',
                    excerpt: '亚马逊美国站近期更新了FBA退货政策，卖家需注意退货处理时间缩短和退款标准变化。',
                    importance: 'normal',
                    link: '../../static-news/north-america/18.html',
                    staticLink: true
                },
                {
                    id: '17',
                    title: '美国最新电池运输管控规定',
                    date: '2024-03-14',
                    excerpt: '美国运输部发布新规定，加强对锂电池产品运输的安全管控，卖家需要更新包装和申报方式。',
                    importance: 'important',
                    link: '../../static-news/north-america/17.html',
                    staticLink: true
                },
                {
                    id: '12',
                    title: '加拿大港口罢工导致物流延迟',
                    date: '2024-02-22',
                    excerpt: '加拿大西海岸港口工人举行罢工，导致温哥华等主要港口货物吞吐量下降，物流时效受到影响。',
                    importance: 'very_important',
                    link: '../../static-news/north-america/12.html',
                    staticLink: true
                }
            ];
        }
        // 中东地区的备用数据
        else if (region === 'middle-east') {
            return [
                {
                    id: '1',
                    title: '中东地区物流新政策概览',
                    date: '2024-03-10',
                    excerpt: '沙特和阿联酋推出新的物流便利化措施，简化清关流程并降低相关费用。',
                    importance: 'normal',
                    link: '../../static-news/middle-east/1.html',
                    staticLink: true
                }
            ];
        }
        // 默认返回空数组
        return [];
    }
    
    /**
     * 加载指定地区的物流资讯
     * @param {string} region - 地区代码
     */
    function loadLogisticsNews(region) {
        console.log('加载地区资讯:', region);
        
        // 获取新闻容器
        const newsContainer = document.querySelector('.article-list');
        console.log('新闻容器元素:', newsContainer);
        
        const newsTitle = document.querySelector('.right-section h3');
        
        if (!newsContainer) {
            console.error('找不到新闻容器元素 (.article-list)');
            return;
        }
        
        // 更新标题
        if (newsTitle) {
            newsTitle.textContent = regionTitles[region] || '物流资讯';
        }
        
        // 显示加载状态
        newsContainer.innerHTML = '<li class="loading-news">加载中<span>.</span><span>.</span><span>.</span></li>';
        
        // 从静态HTML获取数据
        fetchStaticNewsList(region, 4)
            .then(news => {
                if (!news || news.length === 0) {
                    newsContainer.innerHTML = '<li class="no-news">暂无资讯</li>';
                    return;
                }
                
                // 清空容器
                newsContainer.innerHTML = '';
                
                // 添加新闻项
                news.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.className = 'article-item';
                    
                    // 为非常重要的新闻添加特殊样式
                    if (item.importance === 'very_important') {
                        listItem.classList.add('very-important');
                    } else if (item.importance === 'important') {
                        listItem.classList.add('important');
                    }
                    
                    listItem.innerHTML = `
                        <a href="${item.link}" class="article-link">
                            <span class="article-title">${item.title}</span>
                            <span class="article-date">${item.date}</span>
                        </a>
                    `;
                    
                    newsContainer.appendChild(listItem);
                });
                
                // 添加"查看全部"按钮
                const viewAllItem = document.createElement('li');
                viewAllItem.className = 'view-all-item';
                viewAllItem.innerHTML = `
                    <a href="../../news/${region}.html" class="view-all-link">
                        <i class="fas fa-list"></i> 查看全部
                    </a>
                `;
                newsContainer.appendChild(viewAllItem);
            })
            .catch(error => {
                console.error('加载静态资讯失败:', error);
                newsContainer.innerHTML = '<li class="news-error">加载资讯失败，请稍后再试</li>';
            });
    }
    
    /**
     * 添加新闻列表样式
     */
    function addNewsStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .article-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .article-item {
                border-bottom: 1px solid #eee;
                padding: 12px 0;
                transition: background-color 0.3s;
            }
            
            .article-item:hover {
                background-color: #f9f9f9;
            }
            
            .article-item.very-important .article-title {
                font-weight: bold;
                color: #e74c3c;
            }
            
            .article-item.important .article-title {
                font-weight: bold;
                color: #3498db;
            }
            
            .article-link {
                display: flex;
                justify-content: space-between;
                align-items: center;
                text-decoration: none;
                color: #333;
                cursor: pointer;
            }
            
            .article-title {
                flex: 1;
                margin-right: 10px;
            }
            
            .article-date {
                font-size: 0.85em;
                color: #888;
                white-space: nowrap;
            }
            
            .loading-news {
                text-align: center;
                padding: 20px;
                color: #888;
            }
            
            .loading-news span {
                animation: loadingDots 1.5s infinite;
                opacity: 0;
            }
            
            .loading-news span:nth-child(2) {
                animation-delay: 0.5s;
            }
            
            .loading-news span:nth-child(3) {
                animation-delay: 1s;
            }
            
            @keyframes loadingDots {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            
            .no-news, .news-error {
                text-align: center;
                padding: 20px;
                color: #888;
            }
            
            .news-error {
                color: #e74c3c;
            }
            
            .view-all-item {
                text-align: right;
                padding: 12px 0;
            }
            
            .view-all-link {
                display: inline-block;
                padding: 4px 12px;
                background-color: #f8f9fa;
                color: #3498db;
                text-decoration: none;
                border-radius: 4px;
                font-size: 0.9rem;
                transition: all 0.3s;
                border: 1px solid #e9ecef;
            }
            
            .view-all-link:hover {
                background-color: #e9ecef;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    /**
     * 初始化物流资讯加载器
     */
    function initLogisticsNews() {
        console.log('初始化物流资讯加载器...');
        
        // 添加样式
        addNewsStyles();
        
        // 确定当前页面所在区域
        const path = window.location.pathname;
        console.log('当前页面路径:', path);
        
        let region = 'global';
        
        // 从URL路径判断当前区域
        if (path.includes('/north-america/')) {
            region = 'north-america';
        } else if (path.includes('/middle-east/')) {
            region = 'middle-east';
        } else if (path.includes('/europe/')) {
            region = 'europe';
        } else if (path.includes('/asia/')) {
            region = 'asia';
        } else if (path.includes('/australia/')) {
            region = 'australia';
        } else if (path.includes('/africa/')) {
            region = 'africa';
        } else if (path.includes('/south-america/')) {
            region = 'south-america';
        }
        
        // 加载对应区域的资讯
        console.log('自动检测的地区:', region);
        loadLogisticsNews(region);
    }
    
    // 创建全局函数以便外部调用
    window.StaticNewsLoader = {
        loadNews: loadLogisticsNews,
        fetchNewsList: fetchStaticNewsList
    };
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initLogisticsNews);
})(); 
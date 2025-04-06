/**
 * 侧边栏新闻组件
 * 
 * 用于在网站侧边栏显示简洁的新闻列表
 * 
 * @version 1.0.0
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
        
        return relativePath + 'static-news';
    }
    
    // 静态资讯目录 - 动态计算相对路径
    const staticNewsDir = getStaticNewsPath();
    
    /**
     * 初始化侧边栏新闻
     * @param {string} region - 地区代码
     * @param {string} containerId - 容器ID
     * @param {string} title - 标题
     * @param {number} limit - 最大显示数量
     */
    function initSidebarNews(region, containerId = 'sidebar-news', title = null, limit = 5) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`找不到容器元素: #${containerId}`);
            return;
        }
        
        // 设置标题
        if (title) {
            const titleEl = document.createElement('h4');
            titleEl.className = 'sidebar-news-title';
            titleEl.textContent = title;
            container.appendChild(titleEl);
        }
        
        // 创建列表
        const listEl = document.createElement('ul');
        listEl.className = 'sidebar-news-list';
        container.appendChild(listEl);
        
        // 加载中提示
        listEl.innerHTML = '<li class="loading">加载中...</li>';
        
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
        
        // 尝试从不同路径加载
        tryFetchFromPaths(possiblePaths)
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
                    
                    if (!newsCards || newsCards.length === 0) {
                        // 使用备用数据
                        const staticEntries = getStaticNewsEntries(region);
                        if (staticEntries.length > 0) {
                            renderSidebarNews(listEl, staticEntries);
                            // 添加查看全部按钮
                            addViewAllButton(container, region);
                            return;
                        }
                        
                        listEl.innerHTML = '<li class="no-news">暂无资讯</li>';
                        return;
                    }
                    
                    // 解析新闻数据
                    const newsList = [];
                    
                    newsCards.forEach((card, index) => {
                        if (index >= limit) return;
                        
                        // 提取标题
                        const titleEl = card.querySelector('.news-title');
                        let title = titleEl ? titleEl.textContent.trim() : '无标题';
                        
                        // 移除"新"标签和"1. 查看全部"文本
                        title = title.replace(/^\d+\.\s*查看全部/, '').replace(/<span class="new-label">新<\/span>/, '').trim();
                        
                        // 提取日期
                        const dateEl = card.querySelector('.news-date');
                        const date = dateEl ? 
                            dateEl.textContent.replace(/[\n\r]/g, '').trim() : 
                            '未知日期';
                        
                        // 提取文章链接 - 获取真实文章链接而不是统一指向index.html
                        const linkEl = card.querySelector('.news-read-more');
                        let articleLink = '';
                        
                        if (linkEl && linkEl.getAttribute('href')) {
                            const originalLink = linkEl.getAttribute('href');
                            // 提取文件名部分
                            const fileName = originalLink.split('/').pop();
                            
                            // 获取基础路径
                            const basePath = getNewsBasePath(region);
                            
                            // 组合完整路径
                            articleLink = `${basePath}/${fileName}`;
                        } else {
                            // 如果没有找到链接，使用默认的文章ID
                            const articleId = getArticleIdFromTitle(title);
                            const basePath = getNewsBasePath(region);
                            articleLink = `${basePath}/${articleId}.html`;
                        }
                        
                        newsList.push({
                            title,
                            date,
                            link: articleLink
                        });
                    });
                    
                    // 渲染新闻列表
                    renderSidebarNews(listEl, newsList);
                    
                    // 添加查看全部按钮
                    addViewAllButton(container, region);
                } catch (parseError) {
                    console.error('解析HTML失败:', parseError);
                    // 使用备用数据
                    const staticEntries = getStaticNewsEntries(region);
                    if (staticEntries.length > 0) {
                        renderSidebarNews(listEl, staticEntries);
                        // 添加查看全部按钮
                        addViewAllButton(container, region);
                        return;
                    }
                    
                    listEl.innerHTML = '<li class="news-error">加载资讯失败</li>';
                }
            })
            .catch(error => {
                console.error('加载静态资讯失败:', error);
                // 使用备用数据
                const staticEntries = getStaticNewsEntries(region);
                if (staticEntries.length > 0) {
                    renderSidebarNews(listEl, staticEntries);
                    // 添加查看全部按钮
                    addViewAllButton(container, region);
                    return;
                }
                
                listEl.innerHTML = '<li class="news-error">加载资讯失败</li>';
            });
    }
    
    /**
     * 获取文章ID从标题
     * @param {string} title - 文章标题
     * @returns {string} 文章ID
     */
    function getArticleIdFromTitle(title) {
        // 根据标题内容映射到特定ID
        // 这里提供一些常见标题的映射
        const titleMapping = {
            '为什么你的大件货物总被加拿大物流商拒收？': '19',
            '为什么你的大件货物总被加拿大物流商拒收？尺寸限制的6个认知误区': '19',
            '美国FBA退货政策新变化及应对策略': '18',
            '美国最新电池运输管控规定': '17',
            '加拿大港口罢工导致物流延迟': '12',
            '墨西哥跨境物流发展机遇': '9',
            '加拿大物流配送网络优化方案': '8',
            '美国海关最新清关政策解读': '7',
            '2024年北美物流市场趋势分析': '6',
            '洛杉矶港口拥堵情况缓解，集装箱吞吐量回升': '1'
        };
        
        // 尝试从映射表中获取ID
        for (const key in titleMapping) {
            if (title.includes(key)) {
                return titleMapping[key];
            }
        }
        
        // 如果没有匹配项，返回默认ID
        return '19';
    }
    
    /**
     * 获取新闻路径
     * @param {string} region - 地区代码
     * @returns {string} 新闻路径
     */
    function getNewsPath(region) {
        // 检查是否有成功路径
        if (successfulPath) {
            // 提取目录路径
            const pathParts = successfulPath.split('/');
            // 移除最后一个元素(index.html)
            pathParts.pop();
            return pathParts.join('/') + '/index.html';
        }
        
        // 没有成功路径，使用备用路径
        return `../../static-news/${region}/index.html`;
    }
    
    /**
     * 获取新闻基础路径
     * @param {string} region - 地区代码
     * @returns {string} 新闻基础路径
     */
    function getNewsBasePath(region) {
        // 检查是否有成功路径
        if (successfulPath) {
            // 提取目录路径
            const pathParts = successfulPath.split('/');
            // 移除最后一个元素(index.html)
            pathParts.pop();
            return pathParts.join('/');
        }
        
        // 没有成功路径，使用备用路径
        return `../../static-news/${region}`;
    }
    
    /**
     * 添加查看全部按钮
     * @param {HTMLElement} container - 容器元素
     * @param {string} region - 地区代码
     */
    function addViewAllButton(container, region) {
        const viewAllEl = document.createElement('div');
        viewAllEl.className = 'view-all';
        
        const viewAllBtn = document.createElement('a');
        viewAllBtn.className = 'view-all-btn';
        viewAllBtn.href = getNewsPath(region);
        viewAllBtn.innerHTML = '<i class="fas fa-list"></i> 查看全部';
        
        viewAllEl.appendChild(viewAllBtn);
        container.appendChild(viewAllEl);
    }
    
    /**
     * 渲染侧边栏新闻列表
     * @param {HTMLElement} listEl - 列表元素
     * @param {Array} newsList - 新闻列表
     */
    function renderSidebarNews(listEl, newsList) {
        // 清空列表
        listEl.innerHTML = '';
        
        // 添加新闻项
        newsList.forEach(item => {
            const li = document.createElement('li');
            
            li.innerHTML = `
                <a href="${item.link}" title="${item.title}">
                    <span class="news-title">${item.title}</span>
                    <span class="news-date">${item.date}</span>
                </a>
            `;
            
            listEl.appendChild(li);
        });
    }
    
    /**
     * 添加样式
     */
    function addSidebarNewsStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .sidebar-news-title {
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 2px solid #3498db;
                color: #333;
                font-size: 16px;
            }
            
            .sidebar-news-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .sidebar-news-list li {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            
            .sidebar-news-list li:last-child {
                border-bottom: none;
            }
            
            .sidebar-news-list a {
                display: flex;
                flex-direction: column;
                text-decoration: none;
                color: #333;
                transition: color 0.3s;
            }
            
            .sidebar-news-list a:hover {
                color: #3498db;
            }
            
            .sidebar-news-list .news-title {
                margin-bottom: 5px;
                font-size: 14px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .sidebar-news-list .news-date {
                font-size: 12px;
                color: #999;
            }
            
            .sidebar-news-list .loading,
            .sidebar-news-list .no-news,
            .sidebar-news-list .news-error {
                color: #999;
                text-align: center;
                padding: 10px;
            }
            
            .sidebar-news-list .news-error {
                color: #e74c3c;
            }
            
            .view-all {
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }
            
            .view-all-btn {
                display: inline-block;
                padding: 5px 10px;
                font-size: 12px;
                background: #f8f8f8;
                border: 1px solid #ddd;
                border-radius: 3px;
                color: #3498db;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.3s;
                width: 100%;
                text-align: center;
            }
            
            .view-all-btn:hover {
                background: #eee;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // 页面加载完成后添加样式
    document.addEventListener('DOMContentLoaded', addSidebarNewsStyles);
    
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
            
            return fetch(currentPath)
                .then(response => {
                    if (response.ok) {
                        successfulPath = currentPath;
                        return response.text();
                    }
                    return tryNextPath(index + 1);
                })
                .catch(() => {
                    return tryNextPath(index + 1);
                });
        }
        
        return tryNextPath(0);
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
                    title: '为什么你的大件货物总被加拿大物流商拒收？',
                    date: '2024-04-05',
                    link: '../../static-news/north-america/19.html'
                },
                {
                    title: '美国FBA退货政策新变化及应对策略',
                    date: '2024-03-18',
                    link: '../../static-news/north-america/18.html'
                },
                {
                    title: '美国最新电池运输管控规定',
                    date: '2024-03-14',
                    link: '../../static-news/north-america/17.html'
                }
            ];
        }
        // 中东地区的备用数据
        else if (region === 'middle-east') {
            return [
                {
                    title: '中东地区物流新政策概览',
                    date: '2024-03-10',
                    link: '../../static-news/middle-east/1.html'
                }
            ];
        }
        // 默认返回空数组
        return [];
    }
    
    // 暴露全局函数
    window.SidebarNews = {
        init: initSidebarNews
    };
})(); 
/**
 * MaigeEku物流资讯加载器
 * 
 * 此文件负责从WordPress后端获取对应地区的物流资讯并显示在网站前端
 * 使用方法：在需要显示物流资讯的页面引入此JS文件
 * 
 * @version 1.0.0
 * @author MaigeEku Team
 */

(function() {
    // WordPress站点URL，根据实际部署环境修改
    const wordpressUrl = 'https://cms.kjsth.com';
    
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
    
    /**
     * 加载指定地区的物流资讯
     * @param {string} region - 地区代码
     */
    function loadLogisticsNews(region) {
        // 获取新闻容器
        const newsContainer = document.querySelector('.article-list');
        const newsTitle = document.querySelector('.section-title h2');
        
        if (!newsContainer) return;
        
        // 更新标题
        if (newsTitle) {
            newsTitle.textContent = regionTitles[region] || '物流资讯';
        }
        
        // 显示加载状态
        newsContainer.innerHTML = '<li class="loading-news">加载中<span>.</span><span>.</span><span>.</span></li>';
        
        // 从WordPress API获取数据
        fetch(`${wordpressUrl}/wp-json/maigeeku/v1/news-by-region/${region}?limit=4`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应异常');
                }
                return response.json();
            })
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
                        <a href="${item.link}" target="_blank" class="article-link">
                            <span class="article-title">${item.title}</span>
                            <span class="article-date">${item.date}</span>
                        </a>
                    `;
                    
                    newsContainer.appendChild(listItem);
                });
                
                // 添加刷新按钮
                const refreshItem = document.createElement('li');
                refreshItem.className = 'refresh-news';
                refreshItem.innerHTML = '<button class="refresh-btn">刷新资讯</button>';
                newsContainer.appendChild(refreshItem);
                
                // 添加刷新按钮事件
                document.querySelector('.refresh-btn').addEventListener('click', function() {
                    loadLogisticsNews(region);
                });
            })
            .catch(error => {
                console.error('加载资讯失败:', error);
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
            
            .refresh-news {
                text-align: center;
                padding: 10px 0;
            }
            
            .refresh-btn {
                background: #f8f8f8;
                border: 1px solid #ddd;
                padding: 5px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85em;
                transition: all 0.3s;
            }
            
            .refresh-btn:hover {
                background: #eee;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    /**
     * 初始化物流资讯加载器
     */
    function initLogisticsNews() {
        // 添加样式
        addNewsStyles();
        
        // 确定当前页面所在区域
        const path = window.location.pathname;
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
        loadLogisticsNews(region);
        
        // 每5分钟自动刷新一次
        setInterval(function() {
            loadLogisticsNews(region);
        }, 5 * 60 * 1000);
    }
    
    // 当DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogisticsNews);
    } else {
        initLogisticsNews();
    }
})(); 
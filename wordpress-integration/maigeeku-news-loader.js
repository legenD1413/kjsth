/**
 * MaigeEku物流资讯加载器
 * 从WordPress获取特定地区的物流资讯并展示在页面上
 * @version 1.0.0
 */

/**
 * 物流资讯加载器
 * 从WordPress获取特定地区的物流资讯
 * @param {string} region - 地区代码，如'north-america'
 */
function loadLogisticsNews(region) {
    // WordPress站点URL，请替换为您的实际WordPress站点地址
    const wordpressUrl = 'https://cms.kjsth.com';
    
    // 地区名称映射
    const regionNames = {
        'north-america': '北美物流资讯',
        'middle-east': '中东物流资讯',
        'europe': '欧洲物流资讯',
        'asia': '亚洲物流资讯',
        'australia': '澳洲物流资讯',
        'africa': '非洲物流资讯',
        'south-america': '南美物流资讯'
    };
    
    // 获取新闻容器和标题元素
    const newsContainer = document.querySelector('.article-list');
    const newsTitle = document.querySelector('.right-section h3');
    
    if (!newsContainer) return;
    
    // 更新标题（如果存在）
    if (newsTitle && regionNames[region]) {
        newsTitle.innerHTML = regionNames[region] + ' <button id="refresh-news-btn" title="刷新"><i class="fas fa-sync-alt"></i></button>';
    }
    
    // 显示加载状态
    newsContainer.innerHTML = '<li>加载中...</li>';
    
    // 从WordPress API获取数据
    fetch(`${wordpressUrl}/wp-json/maigeeku/v1/news-by-region/${region}?limit=4`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(news => {
            if (!news || news.length === 0) {
                newsContainer.innerHTML = '<li>暂无资讯</li>';
                return;
            }
            
            // 清空容器
            newsContainer.innerHTML = '';
            
            // 添加新闻项
            news.forEach(item => {
                const listItem = document.createElement('li');
                
                // 为非常重要的新闻添加突出显示
                if (item.importance === 'very_important') {
                    listItem.classList.add('news-important');
                }
                
                listItem.innerHTML = `
                    <a href="${item.link}" target="_blank">${item.title}</a>
                    <div class="article-date">${item.date}</div>
                `;
                
                newsContainer.appendChild(listItem);
            });
            
            // 添加刷新按钮事件
            const refreshBtn = document.getElementById('refresh-news-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() {
                    this.classList.add('rotating');
                    loadLogisticsNews(region);
                    
                    setTimeout(() => {
                        this.classList.remove('rotating');
                    }, 1000);
                });
            }
        })
        .catch(error => {
            console.error('加载资讯失败:', error);
            newsContainer.innerHTML = '<li>加载资讯失败，请稍后再试</li>';
        });
}

/**
 * 添加CSS样式
 */
function addNewsStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .news-important a {
            font-weight: bold;
            color: #e74c3c !important;
        }
        
        .rotating {
            animation: rotate 1s linear;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .article-list li {
            transition: background-color 0.3s ease;
        }
        
        .article-list li:hover {
            background-color: rgba(52, 152, 219, 0.05);
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * 初始化函数
 */
function initLogisticsNews() {
    // 添加样式
    addNewsStyles();
    
    // 检测当前页面所在区域
    const path = window.location.pathname;
    let region = 'global';
    
    if (path.includes('north-america')) {
        region = 'north-america';
    } else if (path.includes('middle-east')) {
        region = 'middle-east';
    } else if (path.includes('europe')) {
        region = 'europe';
    } else if (path.includes('asia')) {
        region = 'asia';
    } else if (path.includes('australia')) {
        region = 'australia';
    } else if (path.includes('africa')) {
        region = 'africa';
    } else if (path.includes('south-america')) {
        region = 'south-america';
    }
    
    // 加载对应区域的资讯
    loadLogisticsNews(region);
    
    // 每5分钟自动刷新一次
    setInterval(() => {
        loadLogisticsNews(region);
    }, 300000);
}

// 在DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogisticsNews);
} else {
    initLogisticsNews();
} 
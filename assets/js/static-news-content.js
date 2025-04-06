/**
 * 静态资讯内容处理脚本
 * 
 * 用于解析并显示静态资讯内容，包括资讯正文、图片和相关链接
 * 
 * @version 1.0.0
 */

(function() {
    /**
     * 获取资讯详情页面的基本信息
     * @returns {Object} 资讯详情信息
     */
    function getNewsInfo() {
        // 获取标题信息
        const titleEl = document.querySelector('.news-title');
        const title = titleEl ? titleEl.textContent.trim() : '未知标题';
        
        // 获取日期信息
        const dateEl = document.querySelector('.news-date span');
        const date = dateEl ? dateEl.textContent.trim() : '未知日期';
        
        // 获取区域信息
        const regionEl = document.querySelector('.news-region span');
        const region = regionEl ? regionEl.textContent.trim() : '未知区域';
        
        // 获取重要性信息
        const importanceEl = document.querySelector('.news-importance');
        const importance = importanceEl ? importanceEl.textContent.trim() : '普通';
        
        // 获取正文内容
        const contentEl = document.querySelector('.news-content');
        const content = contentEl ? contentEl.innerHTML : '暂无内容';
        
        return {
            title,
            date,
            region,
            importance,
            content
        };
    }
    
    /**
     * 初始化资讯详情页面内容
     */
    function initNewsContent() {
        // 获取当前资讯信息
        const newsInfo = getNewsInfo();
        
        // 处理段落格式化
        formatParagraphs();
        
        // 添加相关资讯链接
        addRelatedNews();
        
        // 添加分享功能
        addShareFeature();
        
        // 记录浏览历史
        recordViewHistory(newsInfo);
    }
    
    /**
     * 格式化内容段落，提高可读性
     */
    function formatParagraphs() {
        const contentEl = document.querySelector('.news-content');
        if (!contentEl) return;
        
        // 获取所有段落
        const paragraphs = contentEl.querySelectorAll('p');
        
        // 设置适当的行高和字体大小
        paragraphs.forEach(p => {
            if (!p.style.lineHeight) {
                p.style.lineHeight = '1.8';
            }
            
            if (!p.style.marginBottom) {
                p.style.marginBottom = '1.2rem';
            }
        });
        
        // 处理内容中的标题
        const headings = contentEl.querySelectorAll('h3, h4');
        headings.forEach(h => {
            h.style.marginTop = '1.8rem';
            h.style.marginBottom = '1rem';
            h.style.fontWeight = '600';
            h.style.color = '#2c3e50';
        });
    }
    
    /**
     * 添加相关资讯链接
     */
    function addRelatedNews() {
        // 获取当前资讯区域
        const regionEl = document.querySelector('.news-region span');
        const region = regionEl ? regionEl.textContent.replace(/区域$/, '').trim() : '北美';
        
        // 解析当前URL获取区域代码
        const path = window.location.pathname;
        const matches = path.match(/\/static-news\/([^\/]+)\//);
        const regionCode = matches ? matches[1] : 'north-america';
        
        // 构建到索引页的相对路径
        const indexPath = '../index.html';
        
        // 创建相关资讯容器
        const relatedContainer = document.createElement('div');
        relatedContainer.className = 'related-news';
        relatedContainer.innerHTML = `
            <h4>相关资讯</h4>
            <p>正在加载相关资讯...</p>
            <div class="related-links">
                <a href="${indexPath}" class="related-link">
                    <i class="fas fa-list"></i> 查看所有${region}资讯
                </a>
            </div>
        `;
        
        // 插入到操作按钮之前
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.parentNode.insertBefore(relatedContainer, actionButtons);
        }
        
        // 添加样式
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .related-news {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid #eee;
            }
            
            .related-news h4 {
                color: #2c3e50;
                margin-bottom: 1rem;
                font-size: 1.2rem;
            }
            
            .related-links {
                margin-top: 1rem;
            }
            
            .related-link {
                display: inline-block;
                padding: 0.5rem 1rem;
                background-color: #f8f9fa;
                color: #2c3e50;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                text-decoration: none;
                font-size: 0.9rem;
                transition: all 0.3s;
                margin-right: 0.5rem;
                margin-bottom: 0.5rem;
            }
            
            .related-link i {
                margin-right: 0.5rem;
            }
            
            .related-link:hover {
                background-color: #e9ecef;
            }
        `;
        document.head.appendChild(styleEl);
        
        // 异步加载相关资讯
        loadRelatedNews(regionCode, relatedContainer);
    }
    
    /**
     * 加载相关资讯
     * @param {string} regionCode - 区域代码
     * @param {HTMLElement} container - 显示容器
     */
    function loadRelatedNews(regionCode, container) {
        const indexPath = '../index.html';
        
        fetch(indexPath)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // 获取当前资讯标题
                const currentTitle = document.querySelector('.news-title').textContent.trim();
                
                // 查找该区域的所有资讯
                const newsSection = Array.from(doc.querySelectorAll('.region-section')).find(section => {
                    const title = section.querySelector('.region-title');
                    return title && title.textContent.includes(getRegionName(regionCode));
                });
                
                if (!newsSection) {
                    container.querySelector('p').textContent = '暂无相关资讯';
                    return;
                }
                
                // 获取资讯列表
                const newsItems = newsSection.querySelectorAll('.news-item a');
                if (!newsItems || newsItems.length === 0) {
                    container.querySelector('p').textContent = '暂无相关资讯';
                    return;
                }
                
                // 过滤掉当前资讯，选择最多3个相关资讯
                const relatedItems = Array.from(newsItems)
                    .filter(item => item.textContent.trim() !== currentTitle)
                    .slice(0, 3);
                
                if (relatedItems.length === 0) {
                    container.querySelector('p').textContent = '暂无其他相关资讯';
                    return;
                }
                
                // 构建相关资讯列表
                let html = '<ul class="related-list">';
                relatedItems.forEach(item => {
                    const title = item.textContent.trim();
                    const link = item.getAttribute('href');
                    
                    html += `
                        <li class="related-item">
                            <a href="${link}" class="related-title">
                                <i class="fas fa-newspaper"></i> ${title}
                            </a>
                        </li>
                    `;
                });
                html += '</ul>';
                
                // 更新容器内容
                container.querySelector('p').remove();
                container.insertAdjacentHTML('beforeend', html);
                
                // 添加相关列表样式
                const styleEl = document.createElement('style');
                styleEl.textContent = `
                    .related-list {
                        list-style: none;
                        padding: 0;
                        margin: 0 0 1rem 0;
                    }
                    
                    .related-item {
                        padding: 0.5rem 0;
                        border-bottom: 1px solid #f5f5f5;
                    }
                    
                    .related-item:last-child {
                        border-bottom: none;
                    }
                    
                    .related-title {
                        color: #3498db;
                        text-decoration: none;
                        display: block;
                        padding: 0.3rem 0;
                        transition: color 0.2s;
                    }
                    
                    .related-title i {
                        margin-right: 0.5rem;
                        color: #7f8c8d;
                    }
                    
                    .related-title:hover {
                        color: #2980b9;
                    }
                `;
                document.head.appendChild(styleEl);
            })
            .catch(error => {
                console.error('加载相关资讯失败:', error);
                container.querySelector('p').textContent = '加载相关资讯失败';
            });
    }
    
    /**
     * 获取区域名称
     * @param {string} regionCode - 区域代码
     * @returns {string} 区域名称
     */
    function getRegionName(regionCode) {
        const regionMap = {
            'north-america': '北美',
            'south-america': '南美',
            'europe': '欧洲',
            'asia': '亚洲',
            'middle-east': '中东',
            'australia': '澳洲',
            'africa': '非洲',
            'global': '全球'
        };
        
        return regionMap[regionCode] || '未知区域';
    }
    
    /**
     * 添加分享功能
     */
    function addShareFeature() {
        // 创建分享按钮容器
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-container';
        
        // 获取当前页面信息
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        
        // 构建分享HTML
        shareContainer.innerHTML = `
            <div class="share-buttons">
                <span class="share-label">分享至：</span>
                <a href="https://service.weibo.com/share/share.php?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}" target="_blank" class="share-button weibo">
                    <i class="fab fa-weibo"></i>
                </a>
                <a href="https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}" target="_blank" class="share-button qq">
                    <i class="fab fa-qq"></i>
                </a>
                <a href="javascript:void(0);" onclick="copyLink()" class="share-button copy">
                    <i class="fas fa-link"></i>
                </a>
            </div>
        `;
        
        // 插入到相关资讯之后
        const relatedNews = document.querySelector('.related-news');
        if (relatedNews) {
            relatedNews.appendChild(shareContainer);
        } else {
            // 如果找不到相关资讯容器，则插入到操作按钮之前
            const actionButtons = document.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.parentNode.insertBefore(shareContainer, actionButtons);
            }
        }
        
        // 添加样式
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .share-container {
                margin: 1.5rem 0;
            }
            
            .share-buttons {
                display: flex;
                align-items: center;
            }
            
            .share-label {
                margin-right: 1rem;
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .share-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                margin-right: 0.5rem;
                color: white;
                text-decoration: none;
                transition: opacity 0.2s;
            }
            
            .share-button:hover {
                opacity: 0.8;
            }
            
            .share-button.weibo {
                background-color: #e6162d;
            }
            
            .share-button.qq {
                background-color: #12b7f5;
            }
            
            .share-button.copy {
                background-color: #7f8c8d;
            }
        `;
        document.head.appendChild(styleEl);
        
        // 添加复制链接功能
        window.copyLink = function() {
            navigator.clipboard.writeText(pageUrl).then(() => {
                alert('链接已复制到剪贴板');
            }).catch(err => {
                console.error('复制链接失败:', err);
                alert('复制链接失败，请手动复制');
            });
        };
    }
    
    /**
     * 记录浏览历史
     * @param {Object} newsInfo - 资讯信息
     */
    function recordViewHistory(newsInfo) {
        // 从localStorage获取历史记录
        const historyString = localStorage.getItem('newsViewHistory');
        let history = historyString ? JSON.parse(historyString) : [];
        
        // 当前页面URL
        const url = window.location.pathname;
        
        // 解析当前URL获取区域代码和资讯ID
        const matches = url.match(/\/static-news\/([^\/]+)\/(\d+)\.html/);
        if (!matches) return;
        
        const regionCode = matches[1];
        const newsId = matches[2];
        
        // 构建历史记录项
        const historyItem = {
            id: newsId,
            title: newsInfo.title,
            region: regionCode,
            date: newsInfo.date,
            viewTime: new Date().toISOString(),
            url: url
        };
        
        // 检查是否已存在该记录
        const existingIndex = history.findIndex(item => item.url === url);
        if (existingIndex > -1) {
            // 更新已有记录
            history[existingIndex] = historyItem;
        } else {
            // 添加新记录，保持最近10条
            history.unshift(historyItem);
            history = history.slice(0, 10);
        }
        
        // 保存到localStorage
        localStorage.setItem('newsViewHistory', JSON.stringify(history));
    }
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initNewsContent);
})(); 
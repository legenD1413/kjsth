/**
 * MaigeEku工具与指南加载器
 * 从WordPress获取特定分类的工具与指南并展示在页面上
 * @version 1.0.0
 */

/**
 * 工具与指南加载器
 * 从WordPress获取特定分类或地区的工具与指南
 * @param {string} category - 分类代码，如'calculators'
 * @param {string} region - 地区代码，如'north-america'，可选
 * @param {string} containerId - 工具容器ID，默认为'tools-grid'
 */
function loadToolsGuides(options) {
    // 默认参数
    const defaults = {
        category: 'all',
        region: 'all',
        containerId: 'tools-grid',
        limit: 8,
        titleId: 'tools-section-title'
    };
    
    // 合并选项
    const settings = Object.assign({}, defaults, options);
    
    // WordPress站点URL，请替换为您的实际WordPress站点地址
    const wordpressUrl = 'https://cms.kjsth.com';
    
    // 分类名称映射
    const categoryNames = {
        'calculators': '计算工具',
        'guides': '指南文档',
        'forms': '表格文档',
        'regulations': '法规解读',
        'interactive': '互动工具',
        'all': '全部工具与指南'
    };
    
    // 地区名称映射
    const regionNames = {
        'global': '全球',
        'north-america': '北美',
        'south-america': '南美',
        'europe': '欧洲',
        'australia': '澳洲',
        'middle-east': '中东',
        'southeast-asia': '东南亚',
        'africa': '非洲',
        'all': '全部地区'
    };
    
    // 获取工具容器元素
    const toolsContainer = document.getElementById(settings.containerId);
    const titleElement = document.getElementById(settings.titleId);
    
    if (!toolsContainer) return;
    
    // 更新标题（如果存在）
    if (titleElement) {
        const categoryName = categoryNames[settings.category] || '工具与指南';
        const regionName = regionNames[settings.region] || '';
        let titleText = categoryName;
        
        if (settings.region !== 'all') {
            titleText += ` - ${regionName}`;
        }
        
        titleElement.innerHTML = titleText + ' <button id="refresh-tools-btn" title="刷新"><i class="fas fa-sync-alt"></i></button>';
    }
    
    // 显示加载状态
    toolsContainer.innerHTML = '<div class="loading-indicator">加载中...</div>';
    
    // 构建API请求URL
    let apiUrl = '';
    
    if (settings.category !== 'all' && settings.region === 'all') {
        // 按分类获取
        apiUrl = `${wordpressUrl}/wp-json/maigeeku/v1/tools-by-category/${settings.category}?limit=${settings.limit}`;
    } else if (settings.category === 'all' && settings.region !== 'all') {
        // 按地区获取
        apiUrl = `${wordpressUrl}/wp-json/maigeeku/v1/tools-by-region/${settings.region}?limit=${settings.limit}`;
    } else {
        // 获取全部或组合查询
        apiUrl = `${wordpressUrl}/wp-json/wp/v2/tools_guides?per_page=${settings.limit}&_embed=true`;
        
        // 添加分类过滤
        if (settings.category !== 'all') {
            const categoryTerm = getCategoryTermId(settings.category);
            if (categoryTerm) {
                apiUrl += `&tool_category=${categoryTerm}`;
            }
        }
        
        // 添加地区过滤
        if (settings.region !== 'all') {
            const regionTerm = getRegionTermId(settings.region);
            if (regionTerm) {
                apiUrl += `&tool_region=${regionTerm}`;
            }
        }
    }
    
    // 从WordPress API获取数据
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(tools => {
            if (!tools || tools.length === 0) {
                toolsContainer.innerHTML = '<div class="no-tools-msg"><p>暂无相关工具与指南</p></div>';
                return;
            }
            
            // 清空容器
            toolsContainer.innerHTML = '';
            
            // 添加工具卡片
            tools.forEach(tool => {
                const toolCard = document.createElement('a');
                toolCard.href = tool.link;
                toolCard.className = 'tool-card-link';
                
                // 确定图标
                let icon = 'fas fa-tools';
                if (tool.category_slug === 'calculators') {
                    icon = 'fas fa-calculator';
                } else if (tool.category_slug === 'guides') {
                    icon = 'fas fa-book';
                } else if (tool.category_slug === 'forms') {
                    icon = 'fas fa-file-alt';
                } else if (tool.category_slug === 'regulations') {
                    icon = 'fas fa-gavel';
                } else if (tool.category_slug === 'interactive') {
                    icon = 'fas fa-laptop-code';
                }
                
                // 处理重要程度
                let importanceClass = '';
                if (tool.importance === 'important') {
                    importanceClass = 'tool-important';
                } else if (tool.importance === 'critical') {
                    importanceClass = 'tool-critical';
                }
                
                toolCard.innerHTML = `
                    <div class="tool-card ${importanceClass}">
                        <div class="tool-card-icon">
                            <i class="${icon}"></i>
                        </div>
                        <div class="tool-card-content">
                            <h3 class="tool-card-title">${tool.title}</h3>
                            <p class="tool-card-desc">${tool.excerpt}</p>
                            <div class="tool-card-meta">
                                <span><i class="fas fa-map-marker-alt"></i>${tool.region}</span>
                                <span><i class="far fa-clock"></i>${tool.date}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                toolsContainer.appendChild(toolCard);
            });
            
            // 添加刷新按钮事件
            const refreshBtn = document.getElementById('refresh-tools-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() {
                    this.classList.add('rotating');
                    loadToolsGuides(settings);
                    
                    setTimeout(() => {
                        this.classList.remove('rotating');
                    }, 1000);
                });
            }
        })
        .catch(error => {
            console.error('加载工具与指南失败:', error);
            toolsContainer.innerHTML = '<div class="no-tools-msg"><p>加载工具与指南失败，请稍后再试</p></div>';
        });
}

/**
 * 获取分类ID
 * @param {string} slug 分类别名
 * @returns {number} 分类ID
 */
function getCategoryTermId(slug) {
    const categoryIds = {
        'calculators': 10,
        'guides': 11,
        'forms': 12,
        'regulations': 13,
        'interactive': 14
    };
    
    return categoryIds[slug] || null;
}

/**
 * 获取地区ID
 * @param {string} slug 地区别名
 * @returns {number} 地区ID
 */
function getRegionTermId(slug) {
    const regionIds = {
        'global': 20,
        'north-america': 21,
        'south-america': 22,
        'europe': 23,
        'australia': 24,
        'middle-east': 25,
        'southeast-asia': 26,
        'africa': 27
    };
    
    return regionIds[slug] || null;
}

/**
 * 添加CSS样式
 */
function addToolsStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .tool-card-link {
            text-decoration: none;
            color: inherit;
            transition: transform 0.3s ease;
        }
        
        .tool-card-link:hover {
            transform: translateY(-5px);
        }
        
        .tool-card {
            display: flex;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            height: 100%;
            transition: box-shadow 0.3s ease;
        }
        
        .tool-card:hover {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .tool-card-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            background-color: #f5f7fa;
            color: #0071e3;
            font-size: 24px;
        }
        
        .tool-card-content {
            flex: 1;
            padding: 15px;
        }
        
        .tool-card-title {
            margin: 0 0 10px 0;
            color: #1d1d1f;
            font-size: 18px;
        }
        
        .tool-card-desc {
            color: #6e6e73;
            margin: 0 0 15px 0;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .tool-card-meta {
            display: flex;
            justify-content: space-between;
            color: #86868b;
            font-size: 12px;
        }
        
        .tool-card-meta span {
            display: flex;
            align-items: center;
        }
        
        .tool-card-meta i {
            margin-right: 5px;
        }
        
        .tool-important .tool-card-title {
            color: #bf4800;
        }
        
        .tool-critical .tool-card-title {
            color: #bf0000;
        }
        
        .loading-indicator {
            text-align: center;
            padding: 20px;
            color: #6e6e73;
        }
        
        .no-tools-msg {
            background-color: #f5f7fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            color: #6e6e73;
        }
        
        .rotating {
            animation: rotate 1s linear;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * 初始化函数
 */
function initToolsGuides() {
    // 添加样式
    addToolsStyles();
    
    // 检测当前页面所在区域和分类
    const path = window.location.pathname;
    let category = 'all';
    let region = 'all';
    
    // 从URL路径检测分类和地区
    if (path.includes('calculators')) {
        category = 'calculators';
    } else if (path.includes('guides')) {
        category = 'guides';
    } else if (path.includes('forms')) {
        category = 'forms';
    } else if (path.includes('regulations')) {
        category = 'regulations';
    } else if (path.includes('interactive')) {
        category = 'interactive';
    }
    
    if (path.includes('north-america')) {
        region = 'north-america';
    } else if (path.includes('middle-east')) {
        region = 'middle-east';
    } else if (path.includes('europe')) {
        region = 'europe';
    } else if (path.includes('australia')) {
        region = 'australia';
    } else if (path.includes('africa')) {
        region = 'africa';
    } else if (path.includes('south-america')) {
        region = 'south-america';
    } else if (path.includes('southeast-asia')) {
        region = 'southeast-asia';
    }
    
    // 加载工具与指南
    loadToolsGuides({
        category: category,
        region: region
    });
}

/**
 * 在DOM加载完成后初始化，或者暴露函数供外部调用
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolsGuides);
} else {
    initToolsGuides();
}

// 暴露函数供外部调用
window.loadToolsGuides = loadToolsGuides; 
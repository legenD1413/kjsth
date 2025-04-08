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
        useStatic: true  // 添加使用静态文件选项，默认为true
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
    
    if (!toolsContainer) return;
    
    // 显示加载状态
    toolsContainer.innerHTML = '<div class="loading-indicator">加载中...</div>';
    
    // 如果启用了静态文件优先
    if (settings.useStatic) {
        // 尝试从静态文件加载
        loadFromStaticFiles(settings, toolsContainer)
            .then(success => {
                if (!success) {
                    // 静态文件加载失败，回退到API加载
                    loadFromApi(settings, toolsContainer);
                }
            })
            .catch(error => {
                console.error('加载静态文件失败:', error);
                // 回退到API加载
                loadFromApi(settings, toolsContainer);
            });
    } else {
        // 直接从API加载
        loadFromApi(settings, toolsContainer);
    }
}

/**
 * 从静态文件加载工具数据
 * @param {Object} settings - 加载设置
 * @param {HTMLElement} container - 容器元素
 * @returns {Promise<boolean>} 加载成功返回true，否则返回false
 */
function loadFromStaticFiles(settings, container) {
    return new Promise((resolve) => {
        // 构建静态数据路径
        let staticPath = '';
        let data = [];
        
        // 根据分类加载对应的静态文件
        if (settings.category === 'forms') {
            // 手动定义表格文档的静态数据
            data = [
                {
                    id: 28,
                    title: '下单发票2',
                    excerpt: '标准化的下单发票模板，适用于国际物流',
                    link: '../tools-guides/forms/28.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                {
                    id: 31,
                    title: '发票模板04062343',
                    excerpt: '发票模板，可按需定制',
                    link: '../tools-guides/forms/31.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                {
                    id: 33,
                    title: '发票模板04070029',
                    excerpt: '跨境电商专用发票模板',
                    link: '../tools-guides/forms/33.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                {
                    id: 36,
                    title: '发票模板04070048',
                    excerpt: '高级物流发票模板',
                    link: '../tools-guides/forms/36.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                }
            ];
        } else if (settings.category === 'calculators') {
            // 手动定义计算工具的静态数据
            data = [
                {
                    id: 1,
                    title: '体积重计算器',
                    excerpt: '计算国际物流中常用的体积重，帮助您估算运费',
                    link: '../tools-guides/calculators/1.html',
                    category_slug: 'calculators',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'important'
                }
            ];
        } else if (settings.category === 'guides') {
            // 手动定义指南文档的静态数据
            data = [
                {
                    id: 5,
                    title: '物流指南',
                    excerpt: '详尽的国际物流指南，包含各国进出口规定',
                    link: '../tools-guides/guides/index.html',
                    category_slug: 'guides',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                }
            ];
        } else if (settings.category === 'regulations') {
            // 手动定义法规解读的静态数据
            data = [
                {
                    id: 10,
                    title: '国际物流法规解读',
                    excerpt: '主要贸易国家和地区的进出口法规解析',
                    link: '../tools-guides/regulations/index.html',
                    category_slug: 'regulations',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                }
            ];
        } else if (settings.category === 'interactive') {
            // 手动定义互动工具的静态数据
            data = [
                {
                    id: 15,
                    title: '运输路径规划工具',
                    excerpt: '智能规划最优物流路径，节省时间和成本',
                    link: '../tools-guides/interactive/index.html',
                    category_slug: 'interactive',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                }
            ];
        } else if (settings.category === 'all') {
            // 所有工具数据合并
            data = [
                // 计算工具
                {
                    id: 1,
                    title: '体积重计算器',
                    excerpt: '计算国际物流中常用的体积重，帮助您估算运费',
                    link: '../tools-guides/calculators/1.html',
                    category_slug: 'calculators',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'important'
                },
                // 指南文档
                {
                    id: 5,
                    title: '物流指南',
                    excerpt: '详尽的国际物流指南，包含各国进出口规定',
                    link: '../tools-guides/guides/index.html',
                    category_slug: 'guides',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                // 表格文档
                {
                    id: 28,
                    title: '下单发票2',
                    excerpt: '标准化的下单发票模板，适用于国际物流',
                    link: '../tools-guides/forms/28.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                {
                    id: 31,
                    title: '发票模板04062343',
                    excerpt: '发票模板，可按需定制',
                    link: '../tools-guides/forms/31.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                {
                    id: 33,
                    title: '发票模板04070029',
                    excerpt: '跨境电商专用发票模板',
                    link: '../tools-guides/forms/33.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                {
                    id: 36,
                    title: '发票模板04070048',
                    excerpt: '高级物流发票模板',
                    link: '../tools-guides/forms/36.html',
                    category_slug: 'forms',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                // 法规解读
                {
                    id: 10,
                    title: '国际物流法规解读',
                    excerpt: '主要贸易国家和地区的进出口法规解析',
                    link: '../tools-guides/regulations/index.html',
                    category_slug: 'regulations',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                },
                // 互动工具
                {
                    id: 15,
                    title: '运输路径规划工具',
                    excerpt: '智能规划最优物流路径，节省时间和成本',
                    link: '../tools-guides/interactive/index.html',
                    category_slug: 'interactive',
                    region: '全球',
                    date: '2025-04-06',
                    importance: 'normal'
                }
            ];
        }
        
        if (data.length === 0) {
            resolve(false);
            return;
        }
        
        // 根据区域过滤工具
        if (settings.region !== 'all') {
            data = data.filter(item => 
                item.region.toLowerCase().includes(regionNames[settings.region].toLowerCase()));
        }
        
        displayTools(data, container, settings);
        resolve(true);
    });
}

/**
 * 从API加载工具数据
 * @param {Object} settings - 加载设置
 * @param {HTMLElement} container - 容器元素
 */
function loadFromApi(settings, container) {
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
        .then(data => {
            if (!data || (Array.isArray(data) && data.length === 0)) {
                container.innerHTML = '<div class="no-tools-msg"><p>暂无相关工具与指南</p></div>';
                return;
            }
            
            // 格式化工具数据
            const formattedTools = formatToolsData(data);
            
            if (formattedTools.length === 0) {
                container.innerHTML = '<div class="no-tools-msg"><p>暂无相关工具与指南</p></div>';
                return;
            }
            
            displayTools(formattedTools, container, settings);
        })
        .catch(error => {
            console.error('加载工具与指南失败:', error);
            
            // 使用本地测试数据 - 当API请求失败时
            const testData = [
                {
                    id: 1,
                    title: '体积重计算器',
                    excerpt: '计算国际物流中常用的体积重，帮助您估算运费',
                    link: '../tools/calculators/volumetric-weight.html',
                    category_slug: 'calculators',
                    region: '全球通用',
                    date: '2025-04-06',
                    importance: 'important'
                },
                {
                    id: 2,
                    title: '下单发票模板',
                    excerpt: '标准化的下单发票模板，适用于北美地区国际物流',
                    link: '../tools/forms/invoice-template.html',
                    category_slug: 'forms',
                    region: '北美',
                    date: '2025-04-06'
                },
                {
                    id: 3,
                    title: '发票模板04062343',
                    excerpt: '发票模板，可按需定制',
                    link: '../tools/forms/invoice-custom.html',
                    category_slug: 'forms',
                    region: '北美',
                    date: '2025-04-06'
                },
                {
                    id: 4,
                    title: '发票模板04070029',
                    excerpt: '跨境电商专用发票模板',
                    link: '../tools/forms/invoice-ecommerce.html',
                    category_slug: 'forms',
                    region: '北美',
                    date: '2025-04-07'
                },
                {
                    id: 5,
                    title: '美国入境文件指南',
                    excerpt: '详细介绍美国海关所需文件和申报流程',
                    link: '../tools/guides/us-customs-guide.html',
                    category_slug: 'guides',
                    region: '北美',
                    date: '2025-04-05'
                }
            ];
            
            // 根据当前分类和地区过滤测试数据
            let filteredData = testData;
            
            if (settings.category !== 'all') {
                filteredData = filteredData.filter(tool => tool.category_slug === settings.category);
            }
            
            if (settings.region !== 'all') {
                filteredData = filteredData.filter(tool => tool.region.includes(regionNames[settings.region] || ''));
            }
            
            if (filteredData.length === 0) {
                container.innerHTML = '<div class="no-tools-msg"><p>暂无相关工具与指南</p></div>';
                return;
            }
            
            // 清空容器
            container.innerHTML = '';
            
            // 添加失败警告
            const warningEl = document.createElement('div');
            warningEl.className = 'api-warning';
            warningEl.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> API连接失败，显示本地测试数据</p>';
            container.appendChild(warningEl);
            
            // 格式化并显示工具
            const formattedTools = formatToolsData(filteredData);
            displayTools(formattedTools, container, settings);
        });
}

/**
 * 显示工具列表
 * @param {Array} tools - 工具数据数组
 * @param {HTMLElement} container - 容器元素
 * @param {Object} settings - 配置选项
 */
function displayTools(tools, container, settings) {
    // 清空容器
    if (container.querySelector('.api-warning')) {
        // 如果存在警告，保留警告
        const warning = container.querySelector('.api-warning');
        container.innerHTML = '';
        container.appendChild(warning);
    } else {
        container.innerHTML = '';
    }
    
    // 检查容器类型，确定显示样式
    const isList = container.tagName === 'UL' || container.classList.contains('tools-list');
    
    if (tools.length === 0) {
        if (isList) {
            container.innerHTML = '<li class="no-tools-msg"><p>暂无相关工具与指南</p></li>';
        } else {
            container.innerHTML = '<div class="no-tools-msg"><p>暂无相关工具与指南</p></div>';
        }
        return;
    }
    
    // 添加工具项
            tools.forEach(tool => {
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
        
        if (isList) {
            // 列表形式显示
            const toolItem = document.createElement('li');
            toolItem.className = `tool-item ${importanceClass}`;
            
            // 处理工具链接
            const toolLink = document.createElement('a');
            toolLink.href = tool.link || '#';
            toolLink.className = 'tool-item';
            
            toolLink.innerHTML = `
                <div class="tool-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="tool-info">
                    <h3>${tool.title}</h3>
                    <p>${tool.excerpt}</p>
                    <div class="tool-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${tool.region}</span>
                        <span><i class="far fa-clock"></i> ${tool.date}</span>
                    </div>
                </div>
                <div class="tool-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
            
            container.appendChild(toolLink);
        } else {
            // 卡片形式显示（原有方式）
            const toolCard = document.createElement('a');
            
            // 处理工具链接
            toolCard.href = tool.link || '#';
            toolCard.className = 'tool-card-link';
                
                toolCard.innerHTML = `
                    <div class="tool-card ${importanceClass}">
                        <div class="tool-card-icon">
                            <i class="${icon}"></i>
                        </div>
                        <div class="tool-card-content">
                            <h3 class="tool-card-title">${tool.title}</h3>
                            <p class="tool-card-desc">${tool.excerpt}</p>
                            <div class="tool-card-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${tool.region}</span>
                            <span><i class="far fa-clock"></i> ${tool.date}</span>
                            </div>
                        </div>
                    </div>
                `;
                
            container.appendChild(toolCard);
        }
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
        
        .api-warning {
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            padding: 10px 15px;
            margin-bottom: 20px;
            color: #856404;
            width: 100%;
        }
        
        .api-warning p {
            margin: 0;
            display: flex;
            align-items: center;
        }
        
        .api-warning i {
            margin-right: 8px;
            font-size: 16px;
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

/**
 * 处理API返回的工具数据，确保格式一致
 * @param {Object} tools - 从API获取的原始工具数据
 * @returns {Array} 格式化后的工具数据数组
 */
function formatToolsData(tools) {
    if (!Array.isArray(tools)) {
        console.error('工具数据格式错误:', tools);
        return [];
    }
    
    return tools.map(tool => {
        // 创建标准化工具对象
        const formattedTool = {
            id: tool.id || 0,
            title: '',
            excerpt: '',
            link: tool.link || '#',
            category_slug: tool.category_slug || 'other',
            region: '全球',
            date: '最近更新',
            importance: tool.importance || 'normal'
        };
        
        // 处理标题
        if (typeof tool.title === 'string') {
            formattedTool.title = tool.title;
        } else if (tool.title && typeof tool.title.rendered === 'string') {
            formattedTool.title = tool.title.rendered;
        } else if (tool.post_title) {
            formattedTool.title = tool.post_title;
        } else {
            formattedTool.title = `工具 #${tool.id || '未知'}`;
        }
        
        // 处理摘要
        if (typeof tool.excerpt === 'string') {
            formattedTool.excerpt = tool.excerpt;
        } else if (tool.excerpt && typeof tool.excerpt.rendered === 'string') {
            // 移除WordPress自动添加的段落标签
            formattedTool.excerpt = tool.excerpt.rendered
                .replace(/<p>/g, '')
                .replace(/<\/p>/g, '')
                .replace(/\[\&hellip;\]/g, '...');
        } else if (tool.post_excerpt) {
            formattedTool.excerpt = tool.post_excerpt;
        } else {
            formattedTool.excerpt = '暂无描述';
        }
        
        // 处理区域
        if (typeof tool.region === 'string') {
            formattedTool.region = tool.region;
        } else if (Array.isArray(tool.region_names) && tool.region_names.length > 0) {
            formattedTool.region = tool.region_names.join(', ');
        }
        
        // 处理日期
        if (typeof tool.date === 'string') {
            // 尝试格式化日期
            try {
                const date = new Date(tool.date);
                formattedTool.date = date.toLocaleDateString('zh-CN');
            } catch (e) {
                formattedTool.date = tool.date;
            }
        } else if (tool.modified) {
            try {
                const date = new Date(tool.modified);
                formattedTool.date = date.toLocaleDateString('zh-CN');
            } catch (e) {
                formattedTool.date = '最近更新';
            }
        }
        
        return formattedTool;
    });
} 
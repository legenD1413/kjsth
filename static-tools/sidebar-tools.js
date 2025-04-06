/**
 * 侧边栏工具与指南加载模块
 * 
 * 此JavaScript文件用于加载和显示网站侧边栏中的工具与指南链接列表。
 * 它可以从数据源获取工具数据，并根据指定参数展示最新或特定类别的工具链接。
 * 
 * @module sidebarTools
 * @version 1.0.0
 * @author Maigeeku Team
 */

/**
 * 初始化侧边栏工具列表
 * 
 * @param {string} containerId - 侧边栏容器的DOM ID
 * @param {string} sectionTitle - 侧边栏标题
 * @param {number} maxItems - 最大显示项目数
 * @param {string} category - 可选，按类别筛选工具
 */
function initSidebarTools(containerId, sectionTitle, maxItems, category) {
    // 获取容器元素
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('未找到侧边栏容器元素: ' + containerId);
        return;
    }
    
    // 侧边栏数据（实际应用中可能从API加载）
    const sidebarTools = [
        {
            title: '运费计算 - 体积重计算器',
            category: '计算工具',
            url: '../static-tools/global/volumetric-weight-calculator.html',
            region: '全球'
        },
        {
            title: '包装指南 - 优化包装方法',
            category: '指南文档',
            url: '../static-tools/global/packaging-optimization.html',
            region: '全球'
        },
        {
            title: '加拿大海关关税查询',
            category: '指南文档',
            url: '../static-tools/north-america/canada-customs-duty-lookup.html',
            region: '北美'
        },
        {
            title: '美国运费计算器',
            category: '计算工具',
            url: '../static-tools/north-america/us-shipping-calculator.html',
            region: '北美'
        },
        {
            title: '路线查询 - 直查最优物流路线',
            category: '互动工具',
            url: '../static-tools/global/optimal-route-finder.html',
            region: '全球'
        },
        {
            title: '清关文档 - 北美清关所需资料',
            category: '表格文档',
            url: '../static-tools/north-america/canada-customs-duty-lookup.html',
            region: '北美'
        },
        {
            title: '规格查询 - 查询各国快递规格限制',
            category: '法规解读',
            url: '../static-tools/global/size-restrictions.html',
            region: '全球'
        }
    ];
    
    // 应用筛选
    let filteredTools = sidebarTools;
    if (category) {
        filteredTools = sidebarTools.filter(tool => tool.category === category);
    }
    
    // 限制数量
    filteredTools = filteredTools.slice(0, maxItems);
    
    // 创建侧边栏内容
    const sidebarHTML = `
        <div class="sidebar-section sidebar-tools">
            <h3>${sectionTitle || '工具与指南'}</h3>
            ${filteredTools.length > 0 ? `
                <ul class="sidebar-tools-list">
                    ${filteredTools.map(tool => `
                        <li class="sidebar-tool-item">
                            <a href="${tool.url}" class="sidebar-tool-link">
                                <span class="sidebar-tool-title">${tool.title}</span>
                                <span class="sidebar-tool-region">${tool.region}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
                <div class="sidebar-more-link">
                    <a href="../tools-guides/index.html">查看全部 <i class="fas fa-arrow-right"></i></a>
                </div>
            ` : `
                <p class="no-tools-message">暂无相关工具</p>
            `}
        </div>
    `;
    
    // 渲染侧边栏
    container.innerHTML = sidebarHTML;
    
    // 添加事件处理
    addSidebarToolsEvents(container);
}

/**
 * 为侧边栏元素添加事件处理
 * 
 * @param {Element} container - 侧边栏容器元素
 */
function addSidebarToolsEvents(container) {
    // 可能的事件处理，如果需要
}

/**
 * 根据类别获取对应的图标类名
 * 
 * @param {string} category - 工具类别
 * @returns {string} - 对应的Font Awesome图标类名
 */
function getCategoryIcon(category) {
    const icons = {
        '计算工具': 'fas fa-calculator',
        '指南文档': 'fas fa-book',
        '表格文档': 'fas fa-file-alt',
        '法规解读': 'fas fa-gavel',
        '互动工具': 'fas fa-sliders-h'
    };
    
    return icons[category] || 'fas fa-tools';
}

/**
 * 为页面添加侧边栏样式
 */
function appendSidebarToolsStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .sidebar-tools {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .sidebar-tools h3 {
            font-size: 16px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
            color: #333;
        }
        
        .sidebar-tools-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .sidebar-tool-item {
            margin-bottom: 10px;
        }
        
        .sidebar-tool-item:last-child {
            margin-bottom: 0;
        }
        
        .sidebar-tool-link {
            display: block;
            padding: 8px 10px;
            color: #555;
            text-decoration: none;
            border-radius: 4px;
            transition: all 0.2s ease;
            background-color: #fff;
            border: 1px solid #eee;
        }
        
        .sidebar-tool-link:hover {
            background-color: #f0f7ff;
            color: #0056b3;
            border-color: #cce5ff;
        }
        
        .sidebar-tool-title {
            display: block;
            font-weight: 500;
            margin-bottom: 2px;
        }
        
        .sidebar-tool-region {
            display: block;
            font-size: 12px;
            color: #888;
        }
        
        .sidebar-more-link {
            text-align: right;
            margin-top: 12px;
        }
        
        .sidebar-more-link a {
            font-size: 13px;
            color: #0056b3;
            text-decoration: none;
        }
        
        .sidebar-more-link a:hover {
            text-decoration: underline;
        }
        
        .no-tools-message {
            color: #888;
            text-align: center;
            padding: 15px;
            background-color: #fff;
            border-radius: 4px;
            border: 1px solid #eee;
        }
    `;
    document.head.appendChild(styleElement);
}

// 页面加载完成后添加样式
document.addEventListener('DOMContentLoaded', appendSidebarToolsStyles); 
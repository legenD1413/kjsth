/**
 * 通用侧边栏组件
 * 用于在网站各个页面显示文章列表，保持统一风格
 */

class SidebarComponent {
    /**
     * 创建侧边栏组件
     * @param {string} containerId - 容器ID
     * @param {Object} options - 配置选项
     */
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`找不到ID为${containerId}的侧边栏容器`);
            return;
        }

        // 默认选项
        this.options = {
            title: '相关文章',
            category: '',
            limit: 5,
            viewAllUrl: '#',
            viewAllText: '查看全部',
            apiUrl: '/api/articles',
            loadOnInit: true,
            ...options
        };

        // 初始化
        if (this.options.loadOnInit) {
            this.init();
        }
    }

    /**
     * 初始化侧边栏
     */
    init() {
        this.render();
        this.loadArticles();
    }

    /**
     * 渲染侧边栏基本结构
     */
    render() {
        this.container.innerHTML = `
            <div class="sidebar-container">
                <h3 class="sidebar-title">${this.options.title}</h3>
                <div id="${this.container.id}-content">
                    <div class="sidebar-loading">
                        <i class="fas fa-spinner"></i> 正在加载...
                    </div>
                </div>
                <div class="view-all-link">
                    <a href="${this.options.viewAllUrl}">
                        <i class="fas fa-arrow-right"></i> ${this.options.viewAllText}
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * 加载文章数据
     */
    loadArticles() {
        const contentContainer = document.getElementById(`${this.container.id}-content`);
        
        // 这里可以替换为实际的API调用
        // 为了演示，使用模拟数据
        setTimeout(() => {
            const articles = this.getMockArticles();
            this.renderArticles(contentContainer, articles);
        }, 500);

        // 实际API调用示例：
        /*
        fetch(`${this.options.apiUrl}?category=${this.options.category}&limit=${this.options.limit}`)
            .then(response => response.json())
            .then(data => {
                this.renderArticles(contentContainer, data.articles);
            })
            .catch(error => {
                console.error('加载文章失败:', error);
                contentContainer.innerHTML = `
                    <div class="sidebar-empty">
                        加载文章失败，请稍后再试
                    </div>
                `;
            });
        */
    }

    /**
     * 渲染文章列表
     * @param {HTMLElement} container - 内容容器
     * @param {Array} articles - 文章数据
     */
    renderArticles(container, articles) {
        if (!articles || articles.length === 0) {
            container.innerHTML = `
                <div class="sidebar-empty">
                    暂无相关文章
                </div>
            `;
            return;
        }

        const articlesList = document.createElement('ul');
        articlesList.className = 'sidebar-list';

        articles.forEach(article => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="${article.url}" title="${article.title}">
                    ${article.title}
                </a>
            `;
            articlesList.appendChild(listItem);
        });

        container.innerHTML = '';
        container.appendChild(articlesList);
    }

    /**
     * 获取模拟文章数据（仅用于演示）
     * @returns {Array} 文章数据数组
     */
    getMockArticles() {
        // 模拟数据，实际应用中应从API获取
        if (this.options.category === 'north-america') {
            return [
                { id: 1, title: '北美空运价格走势分析', url: '/news/north-america/air-freight-price-analysis.html' },
                { id: 2, title: '北美西海岸港口拥堵情况最新报告', url: '/news/north-america/west-coast-port-congestion.html' },
                { id: 3, title: '美国货运监管新政策对跨境物流的影响', url: '/news/north-america/us-freight-regulation.html' },
                { id: 4, title: '加拿大-美国边境货运效率提升方案', url: '/news/north-america/canada-us-border.html' },
                { id: 5, title: '墨西哥制造业增长带动北美物流需求上升', url: '/news/north-america/mexico-manufacturing.html' }
            ];
        } else if (this.options.category === 'asia') {
            return [
                { id: 1, title: '亚洲区域全面经济伙伴关系对物流行业的影响', url: '/news/asia/rcep-impact.html' },
                { id: 2, title: '中国-东盟物流通道建设最新进展', url: '/news/asia/china-asean-logistics.html' },
                { id: 3, title: '日本物流自动化技术发展趋势', url: '/news/asia/japan-automation.html' },
                { id: 4, title: '韩国海运业复苏态势分析', url: '/news/asia/korea-shipping-recovery.html' },
                { id: 5, title: '东南亚电商物流市场增长报告', url: '/news/asia/southeast-asia-ecommerce.html' }
            ];
        } else {
            return [
                { id: 1, title: '全球供应链最新趋势分析', url: '/news/global-supply-chain-trends.html' },
                { id: 2, title: '国际物流数字化转型案例研究', url: '/news/digital-transformation-cases.html' },
                { id: 3, title: '全球港口自动化水平排名', url: '/news/port-automation-ranking.html' },
                { id: 4, title: '可持续物流发展解决方案', url: '/news/sustainable-logistics-solutions.html' },
                { id: 5, title: '跨境电商物流模式创新', url: '/news/cross-border-ecommerce-innovation.html' }
            ];
        }
    }

    /**
     * 更新侧边栏标题
     * @param {string} title - 新标题
     */
    updateTitle(title) {
        this.options.title = title;
        const titleElement = this.container.querySelector('.sidebar-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * 更改数据类别并重新加载
     * @param {string} category - 新类别
     */
    changeCategory(category) {
        this.options.category = category;
        this.loadArticles();
    }
}

// 添加全局访问点
window.SidebarComponent = SidebarComponent; 
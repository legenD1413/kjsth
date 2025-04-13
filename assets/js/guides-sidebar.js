/**
 * 指南/教程侧边栏组件
 * 用于展示教程目录结构，方便用户导航
 */

class GuidesSidebar {
    /**
     * 创建指南侧边栏组件
     * @param {string} containerId - 容器ID
     * @param {Object} options - 配置选项
     */
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`找不到ID为${containerId}的指南侧边栏容器`);
            return;
        }

        // 默认选项
        this.options = {
            title: '工具与指南',
            category: '',
            viewAllUrl: '/guides/',
            viewAllText: '查看全部',
            guides: [],
            apiUrl: '/api/guides',
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
        this.loadGuides();
    }

    /**
     * 渲染侧边栏基本结构
     */
    render() {
        this.container.innerHTML = `
            <div class="guides-sidebar">
                <h3 class="guides-sidebar-title">${this.options.title}</h3>
                <div id="${this.container.id}-content">
                    <div class="sidebar-loading" style="padding: 20px; text-align: center;">
                        <i class="fas fa-spinner"></i> 正在加载...
                    </div>
                </div>
                <div class="guides-view-all">
                    <a href="${this.options.viewAllUrl}">
                        ${this.options.viewAllText} <i class="fas fa-chevron-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * 加载指南数据
     */
    loadGuides() {
        const contentContainer = document.getElementById(`${this.container.id}-content`);
        
        // 如果已经提供了guides数据，直接使用
        if (this.options.guides && this.options.guides.length > 0) {
            this.renderGuides(contentContainer, this.options.guides);
            return;
        }
        
        // 否则使用模拟数据（实际项目中应通过API获取）
        setTimeout(() => {
            const guides = this.getMockGuides();
            this.renderGuides(contentContainer, guides);
        }, 500);

        // 实际API调用示例：
        /*
        fetch(`${this.options.apiUrl}?category=${this.options.category}`)
            .then(response => response.json())
            .then(data => {
                this.renderGuides(contentContainer, data.guides);
            })
            .catch(error => {
                console.error('加载指南失败:', error);
                contentContainer.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #6e6e73;">
                        加载指南失败，请稍后再试
                    </div>
                `;
            });
        */
    }

    /**
     * 渲染指南列表
     * @param {HTMLElement} container - 内容容器
     * @param {Array} guides - 指南数据
     */
    renderGuides(container, guides) {
        if (!guides || guides.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #6e6e73;">
                    暂无相关指南
                </div>
            `;
            return;
        }

        const guidesList = document.createElement('ul');
        guidesList.className = 'guides-list';

        guides.forEach(guide => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="${guide.url}" class="guide-item" title="${guide.title}">
                    <div class="guide-icon">
                        <i class="${guide.icon || 'fas fa-file-alt'}"></i>
                    </div>
                    <div class="guide-content">
                        <h4 class="guide-title">${guide.title}</h4>
                        <p class="guide-desc">${guide.description || '未知标题'}</p>
                    </div>
                </a>
            `;
            guidesList.appendChild(listItem);
        });

        container.innerHTML = '';
        container.appendChild(guidesList);
    }

    /**
     * 获取模拟指南数据（仅用于演示）
     * @returns {Array} 指南数据数组
     */
    getMockGuides() {
        if (this.options.category === 'fba') {
            return [
                {
                    id: 1,
                    title: '海运货物如何满足亚马逊FBA最新入库标准？',
                    description: '（含包装、标签、托盘化要求）',
                    url: '/guides/fba/shipping-standards.html',
                    icon: 'fas fa-ship'
                },
                {
                    id: 2,
                    title: '如何应对加拿大FBA海运途中的常见风险？',
                    description: '（如海关查验、港口拥堵、FBA拒收）',
                    url: '/guides/fba/risk-management.html',
                    icon: 'fas fa-exclamation-triangle'
                },
                {
                    id: 3,
                    title: '加拿大FBA补货，选择海运还是空运？',
                    description: '成本、时效与库存周转综合分析',
                    url: '/guides/fba/shipping-options.html',
                    icon: 'fas fa-balance-scale'
                },
                {
                    id: 4,
                    title: '快船 vs 普船：哪种加拿大FBA海运服务更适合您的业务需求？',
                    description: '',
                    url: '/guides/fba/fast-vs-regular.html',
                    icon: 'fas fa-shipping-fast'
                }
            ];
        } else {
            return [
                {
                    id: 1, 
                    title: '跨境电商物流全流程指南',
                    description: '从工厂到消费者的完整物流方案',
                    url: '/guides/ecommerce/complete-logistics.html',
                    icon: 'fas fa-route'
                },
                {
                    id: 2,
                    title: '选择最合适的国际物流方式',
                    description: '空运、海运、快递对比详解',
                    url: '/guides/shipping-options.html',
                    icon: 'fas fa-truck-loading'
                },
                {
                    id: 3,
                    title: '海外仓库设置与管理',
                    description: '降低成本提升客户满意度',
                    url: '/guides/warehousing/overseas-warehouse.html',
                    icon: 'fas fa-warehouse'
                },
                {
                    id: 4,
                    title: '跨境退货解决方案',
                    description: '高效处理国际退货流程',
                    url: '/guides/ecommerce/returns.html',
                    icon: 'fas fa-exchange-alt'
                }
            ];
        }
    }

    /**
     * 更新侧边栏标题
     * @param {string} title - 新标题
     */
    updateTitle(title) {
        this.options.title = title;
        const titleElement = this.container.querySelector('.guides-sidebar-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * 更改指南类别并重新加载
     * @param {string} category - 新类别
     */
    changeCategory(category) {
        this.options.category = category;
        this.loadGuides();
    }

    /**
     * 直接设置指南数据并渲染
     * @param {Array} guides - 指南数据
     */
    setGuides(guides) {
        this.options.guides = guides;
        const contentContainer = document.getElementById(`${this.container.id}-content`);
        if (contentContainer) {
            this.renderGuides(contentContainer, guides);
        }
    }
}

// 添加全局访问点
window.GuidesSidebar = GuidesSidebar; 
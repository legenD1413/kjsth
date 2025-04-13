/**
 * 列表页banner组件脚本
 * 用于在页面上动态创建和更新列表页banner组件
 * @module list-banner
 */

/**
 * 创建列表页banner组件并插入到指定元素中
 * @param {string} targetSelector - 目标元素的CSS选择器
 * @param {Object} content - 内容配置对象
 * @param {string} content.title - banner标题
 * @param {string} content.description - banner描述文本
 * @param {string} [content.bgColor] - 可选的背景颜色
 * @param {boolean} [content.darkMode] - 是否启用暗色模式
 * @returns {HTMLElement} 返回创建的banner元素
 */
function createListBanner(targetSelector, content) {
    // 获取目标元素
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.error(`目标元素不存在: ${targetSelector}`);
        return null;
    }

    // 创建banner外层容器
    const banner = document.createElement('div');
    banner.className = 'list-banner';
    
    // 应用自定义背景色（如果提供）
    if (content.bgColor) {
        banner.style.backgroundColor = content.bgColor;
    }
    
    // 应用暗色模式（如果启用）
    if (content.darkMode) {
        banner.classList.add('dark-banner');
    }

    // 创建内容容器
    const container = document.createElement('div');
    container.className = 'list-banner-container';

    // 创建标题
    const title = document.createElement('h1');
    title.className = 'list-banner-title';
    title.textContent = content.title || '列表页标题';

    // 创建描述
    const description = document.createElement('div');
    description.className = 'list-banner-description';
    description.textContent = content.description || '';

    // 组装DOM结构
    container.appendChild(title);
    container.appendChild(description);
    banner.appendChild(container);

    // 插入到目标元素
    targetElement.appendChild(banner);

    return banner;
}

/**
 * 更新已存在的列表页banner组件
 * @param {string} bannerSelector - banner元素的CSS选择器
 * @param {Object} content - 内容配置对象
 * @param {string} [content.title] - banner标题
 * @param {string} [content.description] - banner描述文本
 * @param {string} [content.bgColor] - 背景颜色
 * @param {boolean} [content.darkMode] - 是否启用暗色模式
 */
function updateListBanner(bannerSelector, content) {
    const banner = document.querySelector(bannerSelector);
    if (!banner) {
        console.error(`Banner元素不存在: ${bannerSelector}`);
        return;
    }

    if (content.bgColor) {
        banner.style.backgroundColor = content.bgColor;
    }
    
    if (content.darkMode !== undefined) {
        if (content.darkMode) {
            banner.classList.add('dark-banner');
        } else {
            banner.classList.remove('dark-banner');
        }
    }

    if (content.title) {
        const titleElement = banner.querySelector('.list-banner-title');
        if (titleElement) {
            titleElement.textContent = content.title;
        }
    }

    if (content.description) {
        const descriptionElement = banner.querySelector('.list-banner-description');
        if (descriptionElement) {
            descriptionElement.textContent = content.description;
        }
    }
}

// 导出公共方法
window.ListBanner = {
    create: createListBanner,
    update: updateListBanner
}; 
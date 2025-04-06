/**
 * components.js - 负责加载公共页面组件
 */

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        } else {
            console.error(`Element with ID '${elementId}' not found`);
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// 处理移动端菜单
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(event) {
            const header = document.querySelector('header');
            if (header && !header.contains(event.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// 添加当前页面活动状态
function setActiveNavItem() {
    const currentUrl = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentUrl === href || currentUrl.startsWith(href.replace('index.html', '')))) {
            link.classList.add('active');
            
            // 如果是下拉菜单中的项目，让父菜单项也高亮
            if (link.classList.contains('dropdown-item')) {
                const parentNavItem = link.closest('.nav-item');
                if (parentNavItem) {
                    const parentNavLink = parentNavItem.querySelector('.nav-link');
                    if (parentNavLink) {
                        parentNavLink.classList.add('active');
                    }
                }
            }
        }
    });
}

// 文档加载完成后初始化组件
document.addEventListener('DOMContentLoaded', async function() {
    // 加载头部和页脚
    await loadComponent('header', '/components/header.html');
    await loadComponent('footer', '/components/footer.html');
    
    // 设置移动菜单交互
    setupMobileMenu();
    
    // 设置当前活动导航项
    setActiveNavItem();
});

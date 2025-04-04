document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    const nav = document.querySelector('.main-nav');
    const navMenu = document.querySelector('.nav-menu');
    
    nav.insertBefore(menuToggle, navMenu);
    
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });

    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 添加导航项激活状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.querySelector('.submenu').style.display = 'block';
        });
        
        item.addEventListener('mouseleave', function() {
            this.querySelector('.submenu').style.display = 'none';
        });
    });
}); 
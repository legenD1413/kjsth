# 迈格库网站框架使用指南

## 目录
1. [框架概述](#框架概述)
2. [目录结构](#目录结构)
3. [应用框架到新页面](#应用框架到新页面)
4. [CSS变量系统](#CSS变量系统)
5. [公共组件](#公共组件)
6. [响应式设计](#响应式设计)
7. [SEO优化](#SEO优化)
8. [常见问题解答](#常见问题解答)

## 框架概述

迈格库网站框架是一个轻量级、模块化的前端架构，旨在确保网站各页面的一致性和可维护性。该框架基于HTML、CSS和JavaScript，不依赖于复杂的前端框架，使得初学者也能轻松使用。

### 主要特点

- **一致性**：统一的头部、页脚和布局结构
- **模块化**：样式和组件分离，易于维护
- **响应式**：适配各种设备尺寸
- **易用性**：简单的API和明确的使用方法
- **可扩展**：易于添加新的页面和功能

## 目录结构

```
/
├── assets/
│   ├── css/
│   │   ├── global.css      # 全局变量和基础样式
│   │   ├── layout.css      # 布局和公共组件样式
│   │   └── pages/          # 页面特定样式
│   ├── js/
│   │   ├── components.js   # 组件加载和交互
│   │   └── ...
│   └── images/            # 图片资源
├── components/
│   ├── header.html        # 网站头部
│   └── footer.html        # 网站页脚
└── ...
```

## 应用框架到新页面

要将框架应用到新页面，只需按照以下步骤操作：

1. **基础HTML结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题 - 迈格库物流</title>
    <meta name="description" content="页面描述信息，有助于SEO">
    
    <!-- 引入全局样式 -->
    <link rel="stylesheet" href="/assets/css/global.css">
    <link rel="stylesheet" href="/assets/css/layout.css">
    
    <!-- 引入Font Awesome图标 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    
    <!-- 页面特定样式 -->
    <style>
        /* 此处添加页面特定样式 */
    </style>
</head>
<body>
    <!-- 页面头部 -->
    <header id="site-header"></header>
    
    <!-- 页面主要内容 -->
    <div class="main-container">
        <!-- 此处添加页面内容 -->
    </div>
    
    <!-- 页面页脚 -->
    <footer id="site-footer"></footer>
    
    <!-- 引入组件加载脚本 -->
    <script src="/assets/js/components.js"></script>
    
    <!-- 页面特定脚本 -->
    <script>
        // 此处添加页面特定脚本
    </script>
</body>
</html>
```

2. **添加页面特定样式**

可以直接在页面的`<style>`标签中添加特定样式，或者在`assets/css/pages/`目录下创建单独的CSS文件，然后在页面中引用。

## CSS变量系统

框架使用CSS变量统一管理样式，主要变量包括：

```css
:root {
    /* 布局变量 */
    --site-max-width: 1200px;
    --site-padding: 20px;
    --header-height: 48px;
    
    /* 颜色变量 */
    --primary-color: #0071e3;
    --text-color: #1d1d1f;
    --light-bg: #f5f5f7;
    --border-color: rgba(0, 0, 0, 0.05);
    
    /* 字体和排版 */
    --body-font: "SF Pro Display", "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "微软雅黑", sans-serif;
    --nav-item-spacing: 48px;
}
```

使用这些变量而不是硬编码值，可以确保样式的一致性和可维护性。

## 公共组件

框架提供了两个基本组件：

### 头部(header.html)

包含网站logo、主导航和用户登录入口。通过`components.js`自动加载到`id="site-header"`的容器中。

### 页脚(footer.html)

包含网站信息、导航链接和版权声明。通过`components.js`自动加载到`id="site-footer"`的容器中。

## 响应式设计

框架内置响应式设计，使用媒体查询适配不同屏幕尺寸：

```css
/* 桌面端 */
@media (max-width: 1200px) {
    :root {
        --site-max-width: 100%;
    }
}

/* 平板和移动端 */
@media (max-width: 768px) {
    :root {
        --site-padding: 16px;
        --nav-item-spacing: 32px;
    }
    
    /* 导航菜单变为下拉式 */
    .nav-menu {
        display: none;
        position: absolute;
        /* 其他样式... */
    }
    
    /* 显示移动端菜单按钮 */
    .menu-toggle {
        display: block;
    }
}
```

## SEO优化

为了提高搜索引擎排名，请确保每个页面：

1. 使用适当的`<title>`标签，格式为"页面名称 - 迈格库物流"
2. 添加meta描述：`<meta name="description" content="...">`
3. 使用语义化HTML标签（如`<article>`, `<section>`, `<nav>`等）
4. 为图片添加`alt`属性
5. 确保内容中包含相关关键词

## 常见问题解答

### Q: 如何修改导航菜单？
A: 编辑`components/header.html`文件。

### Q: 如何添加新的CSS变量？
A: 在`assets/css/global.css`的`:root`选择器中添加。

### Q: 移动端菜单不显示怎么办？
A: 检查`components.js`是否正确加载，以及`menu-toggle`和`nav-menu`元素是否存在。

### Q: 如何在特定页面禁用某些全局样式？
A: 可以在页面特定样式中使用更高优先级的选择器覆盖全局样式。 
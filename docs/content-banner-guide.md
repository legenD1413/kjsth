# 内容Banner组件使用指南

内容Banner是迈格库网站框架中的一个基础UI组件，用于展示页面的主要标题和描述信息。它通常位于页面顶部，提供页面的整体概述，帮助用户快速了解页面内容。

## 功能特点

- 展示页面标题和描述文本
- 支持自定义背景颜色
- 响应式设计，适配各种设备
- 提供静态HTML和JavaScript动态生成两种使用方式
- 支持暗色模式

## 使用方法

### 1. 静态HTML方式

如果您只需要在页面中固定展示内容banner，可以使用静态HTML方式：

```html
<!-- 引入样式文件 -->
<link rel="stylesheet" href="/assets/css/content-banner.css">

<!-- 内容banner HTML结构 -->
<div class="content-banner">
    <div class="banner-container">
        <h1 class="content-banner-title">页面标题</h1>
        <div class="content-banner-description">页面描述内容</div>
    </div>
</div>
```

### 2. JavaScript动态生成方式

如果您需要动态生成或更新内容banner，可以使用JavaScript方式：

```html
<!-- 引入样式文件 -->
<link rel="stylesheet" href="/assets/css/content-banner.css">

<!-- 目标容器 -->
<div id="myBanner"></div>

<!-- 引入脚本文件 -->
<script src="/assets/js/content-banner.js"></script>

<!-- 初始化内容banner -->
<script>
    ContentBanner.create('#myBanner', {
        title: '页面标题',
        description: '页面描述内容',
        bgColor: '#ffffff' // 可选，设置背景颜色
    });
</script>
```

### 更新内容banner

使用JavaScript方式时，可以动态更新内容banner的内容：

```javascript
ContentBanner.update('.content-banner', {
    title: '新标题',
    description: '新描述内容',
    bgColor: '#f5f5f7' // 新背景颜色
});
```

## 样式定制

### 自定义背景颜色

1. 静态HTML方式：

```html
<div class="content-banner" style="background-color: #f2f7ff;">
    <!-- 内容 -->
</div>
```

2. 通过添加自定义类：

```html
<style>
    .colored-banner {
        background-color: #f2f7ff;
    }
</style>

<div class="content-banner colored-banner">
    <!-- 内容 -->
</div>
```

3. JavaScript方式：

```javascript
ContentBanner.create('#myBanner', {
    title: '页面标题',
    description: '页面描述内容',
    bgColor: '#f2f7ff'
});
```

### 暗色模式

可以通过添加`.dark-banner`类来实现暗色模式：

```html
<style>
    .dark-banner {
        background-color: #1d1d1f;
    }
    
    .dark-banner .content-banner-title {
        color: #f5f5f7;
    }
    
    .dark-banner .content-banner-description {
        color: #a1a1a6;
    }
</style>

<div class="content-banner dark-banner">
    <!-- 内容 -->
</div>
```

## 响应式行为

内容Banner组件会根据不同设备屏幕尺寸自动调整：

- 在桌面端：标题字体大小为28px，内边距为60px
- 在移动端：标题字体大小为24px，内边距为40px

## 示例页面

查看以下示例页面，了解内容Banner组件的各种使用方式：

1. [动态示例页面](/examples/content-banner-example.html) - 展示JavaScript动态生成和更新内容banner的功能
2. [静态示例页面](/examples/content-banner-static.html) - 展示静态HTML方式使用内容banner的效果

## 最佳实践

- 保持标题简洁明了，通常不超过一行
- 描述文本应当概括页面内容，但不宜过长
- 背景颜色应与整体页面风格协调
- 在创建新页面时，可以使用内容banner来提供页面的主要信息

## 兼容性

内容Banner组件兼容所有现代浏览器，包括：

- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 16+

## 常见问题

### 1. 内容Banner没有显示样式

请确认已正确引入`content-banner.css`样式文件。

### 2. JavaScript方式无法工作

请确认已引入`content-banner.js`脚本文件，并在DOM加载完成后调用相关方法。

### 3. 如何在特定页面中禁用内容Banner的上边距

可以通过CSS覆盖默认样式：

```html
<style>
    .content-banner {
        margin-top: 0;
    }
</style>
``` 
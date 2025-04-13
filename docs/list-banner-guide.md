# 列表页Banner组件使用指南

列表页Banner是迈格库网站框架中的一个基础UI组件，专为列表页设计，用于展示列表页面的主要标题和描述信息。它通常位于列表页顶部，适合用于新闻列表、产品列表、资讯列表等页面。

## 功能特点

- 展示列表页标题和描述文本
- 浅色背景设计，突出列表内容
- 支持自定义背景颜色
- 响应式设计，适配各种设备
- 提供静态HTML和JavaScript动态生成两种使用方式
- 支持暗色模式

## 使用方法

### 1. 静态HTML方式

如果您只需要在页面中固定展示列表页banner，可以使用静态HTML方式：

```html
<!-- 引入样式文件 -->
<link rel="stylesheet" href="/assets/css/list-banner.css">

<!-- 列表页banner HTML结构 -->
<div class="list-banner">
    <div class="list-banner-container">
        <h1 class="list-banner-title">北美地区物流资讯</h1>
        <div class="list-banner-description">关注北美地区最新物流动态，包括港口状况、运费变化和政策更新。</div>
    </div>
</div>
```

### 2. JavaScript动态生成方式

如果您需要动态生成或更新列表页banner，可以使用JavaScript方式：

```html
<!-- 引入样式文件 -->
<link rel="stylesheet" href="/assets/css/list-banner.css">

<!-- 目标容器 -->
<div id="myListBanner"></div>

<!-- 引入脚本文件 -->
<script src="/assets/js/list-banner.js"></script>

<!-- 初始化列表页banner -->
<script>
    ListBanner.create('#myListBanner', {
        title: '北美地区物流资讯',
        description: '关注北美地区最新物流动态，包括港口状况、运费变化和政策更新。',
        bgColor: '#f5f5f7' // 可选，设置背景颜色
    });
</script>
```

### 更新列表页banner

使用JavaScript方式时，可以动态更新列表页banner的内容：

```javascript
ListBanner.update('.list-banner', {
    title: '新标题',
    description: '新描述内容',
    bgColor: '#f0f0f0', // 新背景颜色
    darkMode: false // 是否启用暗色模式
});
```

## 样式定制

### 自定义背景颜色

1. 静态HTML方式：

```html
<div class="list-banner" style="background-color: #edf4ff;">
    <!-- 内容 -->
</div>
```

2. 通过添加自定义类：

```html
<style>
    .colored-banner {
        background-color: #edf4ff;
    }
</style>

<div class="list-banner colored-banner">
    <!-- 内容 -->
</div>
```

3. JavaScript方式：

```javascript
ListBanner.create('#myListBanner', {
    title: '标题',
    description: '描述内容',
    bgColor: '#edf4ff'
});
```

### 暗色模式

可以通过添加`.dark-banner`类来实现暗色模式：

```html
<style>
    .list-banner.dark-banner {
        background-color: #1d1d1f;
    }
    
    .list-banner.dark-banner .list-banner-title {
        color: #f5f5f7;
    }
    
    .list-banner.dark-banner .list-banner-description {
        color: #a1a1a6;
    }
</style>

<div class="list-banner dark-banner">
    <!-- 内容 -->
</div>
```

或使用JavaScript方式：

```javascript
ListBanner.create('#myListBanner', {
    title: '标题',
    description: '描述内容',
    bgColor: '#1d1d1f',
    darkMode: true
});
```

## 响应式行为

列表页Banner组件会根据不同设备屏幕尺寸自动调整：

- **桌面端**：标题字体大小为32px，内边距为60px
- **平板端**（768px以下）：标题字体大小为28px，内边距为45px
- **移动端**（480px以下）：标题字体大小为24px，内边距为35px

## 示例页面

查看以下示例页面，了解列表页Banner组件的各种使用方式：

1. [动态示例页面](/examples/list-banner-example.html) - 展示JavaScript动态生成和更新列表页banner的功能
2. [静态示例页面](/examples/list-banner-static.html) - 展示静态HTML方式使用列表页banner的效果

## 与内容Banner的区别

列表页Banner与内容Banner的主要区别：

| 特性 | 列表页Banner | 内容Banner |
|------|------------|-----------|
| 背景颜色 | 浅灰色 (#f5f5f7) | 白色 (#ffffff) |
| 标题大小 | 32px | 28px |
| 描述文本 | 14px | 0.83em (约13.3px) |
| 内边距 | 上下60px | 上下60px |
| 标题下方间距 | 12px | 8px |
| 适用场景 | 新闻列表、产品列表等 | 内容页、详情页等 |

## 最佳实践

- 保持标题简洁明了，通常不超过15个汉字
- 描述文本应当简要概括列表页的内容主题，不宜过长
- 背景颜色应保持较浅，以确保列表内容阅读舒适
- 在创建列表类页面时，建议使用列表页banner来提供页面的主要信息

## 兼容性

列表页Banner组件兼容所有现代浏览器，包括：

- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 16+

## 常见问题

### 1. 列表页Banner与内容Banner如何选择？

- 如果是展示列表内容（如新闻列表、产品列表等），建议使用列表页Banner
- 如果是展示详细内容（如文章页、产品详情页等），建议使用内容Banner

### 2. 如何调整列表页Banner的字体大小？

可以通过CSS覆盖默认样式：

```html
<style>
    .list-banner-title {
        font-size: 36px; /* 自定义标题字体大小 */
    }
    
    .list-banner-description {
        font-size: 16px; /* 自定义描述文本字体大小 */
    }
</style>
```

### 3. 如何在特定页面中禁用列表页Banner的下边框？

可以通过CSS覆盖默认样式：

```html
<style>
    .list-banner {
        border-bottom: none;
    }
</style>
``` 
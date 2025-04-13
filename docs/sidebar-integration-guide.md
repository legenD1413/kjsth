# 通用侧边栏组件集成指南

这份指南详细说明了如何在麦极客物流网站的各个页面中集成通用侧边栏组件，以展示相关文章列表，确保整个网站风格的一致性。

## 目录

1. [概述](#概述)
2. [文件结构](#文件结构)
3. [快速使用](#快速使用)
4. [配置选项](#配置选项)
5. [API与数据获取](#api与数据获取)
6. [样式定制](#样式定制)
7. [高级用法](#高级用法)
8. [常见问题](#常见问题)

## 概述

侧边栏组件是一个独立的JavaScript类，用于在网站的各个页面中统一展示文章列表，比如新闻资讯、行业动态、物流指南等内容。组件设计遵循Apple风格设计语言，与网站整体视觉保持一致。

![侧边栏组件预览](../assets/images/docs/sidebar-preview.png)

## 文件结构

组件相关文件：

- `/assets/css/sidebar.css` - 组件样式文件
- `/assets/js/sidebar-component.js` - 组件JavaScript实现
- `/examples/sidebar-example.html` - 组件使用示例

## 快速使用

### 步骤1：引入必要文件

在HTML页面的`<head>`标签中引入CSS样式：

```html
<link rel="stylesheet" href="/assets/css/sidebar.css">
```

在页面底部，在关闭`</body>`标签前引入JavaScript文件：

```html
<script src="/assets/js/sidebar-component.js"></script>
```

### 步骤2：添加侧边栏容器

在页面适当位置添加侧边栏容器：

```html
<div id="news-sidebar"></div>
```

### 步骤3：初始化侧边栏

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 创建侧边栏实例
    const newsSidebar = new SidebarComponent('news-sidebar', {
        title: '北美物流资讯',
        category: 'north-america',
        limit: 5,
        viewAllUrl: '/news/north-america/',
        viewAllText: '查看全部'
    });
});
```

## 配置选项

创建侧边栏组件时，可以传入以下配置选项：

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `title` | String | '相关文章' | 侧边栏标题 |
| `category` | String | '' | 文章类别 |
| `limit` | Number | 5 | 显示文章数量 |
| `viewAllUrl` | String | '#' | "查看全部"链接地址 |
| `viewAllText` | String | '查看全部' | "查看全部"按钮文本 |
| `apiUrl` | String | '/api/articles' | 文章数据API地址 |
| `loadOnInit` | Boolean | true | 是否在初始化时加载数据 |

## API与数据获取

默认情况下，组件使用模拟数据进行展示。在实际项目中，应该通过API获取数据，可以修改`loadArticles()`方法实现：

```javascript
loadArticles() {
    const contentContainer = document.getElementById(`${this.container.id}-content`);
    
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
}
```

API应返回以下格式的JSON数据：

```json
{
  "articles": [
    {
      "id": 1,
      "title": "文章标题",
      "url": "/news/article-url.html"
    },
    // 更多文章...
  ]
}
```

## 样式定制

侧边栏组件的样式可以通过修改`sidebar.css`文件进行定制。主要样式类：

- `.sidebar-container` - 侧边栏容器
- `.sidebar-title` - 侧边栏标题
- `.sidebar-list` - 文章列表
- `.view-all-link` - "查看全部"链接

## 高级用法

### 动态更改类别

可以动态更改侧边栏显示的内容类别：

```javascript
// 保存侧边栏实例到全局变量
window.newsSidebar = new SidebarComponent('news-sidebar', {...});

// 更改类别
function changeSidebarCategory(category) {
    if (window.newsSidebar) {
        window.newsSidebar.changeCategory(category);
    }
}
```

### 多个侧边栏

在同一页面可以使用多个侧边栏组件：

```html
<div id="news-sidebar"></div>
<div id="popular-sidebar"></div>
```

```javascript
// 创建新闻侧边栏
const newsSidebar = new SidebarComponent('news-sidebar', {...});

// 创建热门文章侧边栏
const popularSidebar = new SidebarComponent('popular-sidebar', {...});
```

## 常见问题

### 侧边栏不显示内容

1. 检查控制台是否有错误信息
2. 确保提供了正确的容器ID
3. 检查API地址和数据格式是否正确

### 样式与网站风格不匹配

1. 确保正确引入了`sidebar.css`文件
2. 可以根据需要修改CSS类来调整样式

### 移动端适配问题

侧边栏组件已经内置了基本的响应式设计，但如果有特殊需求，可以在媒体查询中进行调整：

```css
@media (max-width: 768px) {
    .sidebar-container {
        /* 自定义移动端样式 */
    }
}
```

---

如有其他问题，请联系技术支持团队。 
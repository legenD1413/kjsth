# 网站模板文件说明

本目录包含网站的所有模板文件，用于生成HTML页面，确保站点风格统一一致。

## 目录结构

```
templates/
├── content/                # 内容页面模板
│   └── content-template.html  # 统一的内容页面模板（指南和资讯）
├── list/                   # 列表页面模板
│   ├── category-list-template.html  # 分类列表页面模板
│   └── index-template.html  # 主索引页面模板
└── backup/                 # 旧模板备份
```

## 模板说明

### 内容页面模板 (content-template.html)

这是一个统一的内容页面模板，适用于工具指南和物流资讯。它包含以下功能：

- 响应式设计，适配各种屏幕尺寸
- 清晰的内容结构和导航
- 支持标签、日期和分类信息显示
- Apple风格的现代UI设计

### 分类列表模板 (category-list-template.html)

用于显示特定分类或区域的内容列表，特点包括：

- 支持网格视图和列表视图切换
- 内置搜索和过滤功能
- 分页导航
- 面包屑导航

### 主索引模板 (index-template.html)

网站主要分类区域的入口页面，包含：

- 热门分类展示
- 最新内容推荐
- 全局搜索功能
- 分类导航

## 模板变量

模板中使用了以下占位变量：

### 内容页面变量
- `{{title}}` - 内容标题
- `{{date}}` - 发布日期
- `{{category}}` - 内容分类
- `{{region}}` - 地区信息
- `{{importance_class}}` - 重要性样式类
- `{{importance_text}}` - 重要性文本
- `{{keywords}}` - 关键词标签
- `{{content}}` - 主体内容
- `{{prev_link}}` - 上一篇链接
- `{{next_link}}` - 下一篇链接
- `{{category_index}}` - 返回分类列表链接

### 列表页面变量
- `{{category_name}}` - 分类名称
- `{{site_section_name}}` - 站点区域名称（工具指南/物流资讯）
- `{{category_icon}}` - 分类图标
- `{{category_description}}` - 分类描述
- `{{category_nav_items}}` - 分类导航项目
- `{{content_items}}` - 内容列表项
- `{{pagination_items}}` - 分页项目

### 主索引页面变量
- `{{section_name}}` - 区域名称
- `{{section_description}}` - 区域描述
- `{{section_id}}` - 区域ID
- `{{category_tabs}}` - 分类标签导航
- `{{featured_categories}}` - 特色分类
- `{{latest_content}}` - 最新内容
- `{{all_categories}}` - 所有分类

## 使用方法

这些模板由 `md-to-html/md-convert.js` 和 `md-to-html/update-lists.js` 文件使用，用于将Markdown文件转换为HTML页面并生成索引页。

### 使用步骤

1. 模板文件不应直接修改，除非需要更改全站设计
2. 添加新内容时，只需编辑Markdown文件，然后使用自动处理脚本生成HTML
3. 索引页会自动更新以包含新内容

### 自动化处理

使用 `md-to-html/auto-processor.bat` 脚本可以自动处理所有Markdown文件并更新索引。

## 模板样式原则

为保持网站风格一致性，所有模板遵循以下设计原则：

1. Apple风格的现代设计
2. 清晰简洁的布局和排版
3. 响应式设计，支持各种设备
4. 一致的颜色方案和组件样式
5. 优化的用户体验和交互

## 注意事项

- 不要直接在HTML文件中编辑内容，应该通过编辑Markdown文件并重新生成来更新
- 添加新的内容类型时，可能需要修改处理脚本和添加相应的模板变量
- 使用的模板变量需要在处理脚本中正确替换
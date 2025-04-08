# 迈格库物流网站

## 项目概述

迈格库物流网站是一个专注于国际物流服务的综合性网站，旨在为跨境电商卖家、国际贸易商和个人用户提供全面的物流服务信息和实用工具。网站采用现代化的设计风格，以用户体验为中心，提供直观的导航和丰富的内容。

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **响应式设计**：自适应各种设备屏幕尺寸
- **图标库**：Font Awesome 5
- **字体**：SF Pro Display, SF Pro Text, PingFang SC

## 项目结构

```
/
├── assets/                # 静态资源
│   ├── css/               # CSS样式表
│   │   ├── global.css     # 全局变量和基础样式
│   │   ├── layout.css     # 布局和公共组件样式
│   │   └── pages/         # 页面特定样式
│   ├── js/                # JavaScript脚本
│   │   ├── components.js  # 公共组件加载和交互
│   │   └── ...            # 其他业务逻辑脚本
│   └── images/            # 图片资源
├── components/            # 公共组件
│   ├── header.html        # 网站头部
│   └── footer.html        # 网站页脚
├── docs/                  # 文档
│   └── framework-guide.md # 框架使用指南
├── regions/               # 区域页面
│   ├── north-america/     # 北美
│   ├── south-america/     # 南美
│   ├── europe/            # 欧洲
│   └── ...                # 其他区域
├── products/              # 产品类别页面
│   ├── regular/           # 普货
│   ├── cosmetics/         # 化妆品
│   └── ...                # 其他产品类别
├── shipping-methods/      # 运输方式页面
│   ├── air/               # 空运
│   ├── sea/               # 海运
│   └── ...                # 其他运输方式
├── static-tools/          # 静态工具和指南
│   ├── global/            # 全球适用工具
│   └── north-america/     # 北美特定工具
├── tools/                 # 开发工具
│   ├── image-optimizer.js # 图片优化工具
│   ├── seo-checker.js     # SEO检查工具
│   └── update-framework.js# 框架更新工具
├── index.html             # 网站首页
└── README.md              # 项目说明文档
```

## 主要功能

### 1. 物流服务信息

网站按照地区和产品类别组织物流服务信息，包括：

- **区域导航**：北美、南美、欧洲、澳洲、中东、东南亚、非洲
- **产品分类**：普货、化妆品、电子烟、纯电、内电等
- **运输方式**：空运、海运、快递、专线、FBA等

### 2. 工具与指南

提供多种实用工具和专业指南，帮助用户优化物流决策：

- **全球工具**：体积重量计算器、包装优化指南等
- **区域特定工具**：美国运费计算器、加拿大海关关税查询等

## 设计原则

1. **一致性**：统一的头部、页脚和布局结构
2. **模块化**：样式和组件分离，易于维护
3. **响应式**：适配各种设备尺寸
4. **用户体验**：简洁明了的导航，清晰的信息层次
5. **性能优化**：优化图片大小，减少HTTP请求

## 开发工具

项目提供了多种开发工具，位于`tools/`目录：

1. **图片优化工具**：自动压缩和生成响应式图片
2. **SEO检查工具**：分析页面SEO状况并提供改进建议
3. **框架更新工具**：批量更新页面以应用新框架

## 如何开始

1. 克隆项目到本地环境
2. 无需特殊安装，直接在浏览器中打开`index.html`即可预览
3. 如需使用开发工具，请先安装Node.js，然后在`tools/`目录下运行`npm install`

## 如何贡献

1. 创建新页面时，请参考`docs/framework-guide.md`中的指南
2. 添加新图片前，请使用图片优化工具处理
3. 提交代码前，请运行SEO检查工具确保质量

## 维护人员

- 迈格库开发团队

## 许可证

© 2024 迈格库物流 | 让全球物流触手可及

## 网站功能

- **产品类别导航**: 按照不同产品类型（普货、化妆品、电子烟、纯电、内电等）分类浏览物流方案
- **地区导航**: 按照不同地区（北美、南美、欧洲、澳洲、中东、东南亚、非洲）浏览物流服务
- **运输方式**: 提供多种运输方式（空运、海运、快递、专线、FBA）的详细信息
- **物流工具**: 提供运费计算器、体积重量计算器等实用工具
- **静态资讯**: 提供各地区的物流资讯和指南

## 技术架构

网站采用统一的框架设计，实现了模块化的开发和维护：

### 目录结构

```
root/
  ├── components/               # 公共组件
  │   ├── header.html           # 头部组件
  │   └── footer.html           # 页脚组件
  ├── assets/
  │   ├── css/
  │   │   ├── global.css        # 全局变量和基础样式
  │   │   └── layout.css        # 布局和导航样式
  │   ├── js/
  │   │   ├── components.js     # 组件加载脚本
  │   │   └── ...               # 其他脚本
  │   └── images/               # 图片资源
  ├── products/                 # 产品类别页面
  ├── regions/                  # 地区页面
  ├── static-tools/             # 静态工具页面
  ├── tools-guides/             # 工具和指南页面
  ├── news/                     # 新闻系统
  ├── static-news/              # 静态新闻页面
  ├── tools/                    # 开发工具
  └── docs/                     # 文档
```

### 开发工具

- **框架更新工具** (`tools/update-framework.js`): 自动将统一框架应用到现有页面
- **框架验证工具** (`tools/verify-framework.js`): 验证页面是否正确应用了框架

### 框架特性

- **组件化设计**: 通过可复用组件实现一致的用户界面
- **响应式布局**: 适应不同设备屏幕尺寸的自适应设计
- **统一样式变量**: 使用CSS变量统一管理颜色、字体等样式
- **动态组件加载**: 使用JavaScript动态加载公共组件

### 开发指南

#### 添加新页面

1. 创建新的HTML文件
2. 引入必要的CSS文件:
   ```html
   <link rel="stylesheet" href="/assets/css/global.css">
   <link rel="stylesheet" href="/assets/css/layout.css">
   ```
3. 添加头部和页脚占位符:
   ```html
   <header id="header"></header>
   <!-- 页面内容 -->
   <footer id="footer"></footer>
   ```
4. 引入组件加载脚本:
   ```html
   <script src="/assets/js/components.js"></script>
   ```

#### 验证框架应用

运行验证工具检查所有页面是否正确应用了框架:

```bash
node tools/verify-framework.js
```

#### 更新框架应用

如需将框架应用到新页面或更新现有页面:

```bash
node tools/update-framework.js
```

### 项目文档

- [框架更新报告](./docs/framework-update-report.md)
- [框架验证报告](./docs/framework-verification-report.md)
- [更新总结](./docs/update-summary.md)

### 维护指南

- 所有页面应遵循统一框架
- 修改公共组件时需全面测试网站
- 添加新功能时应保持与现有设计的一致性

### 联系方式

如有任何问题或建议，请联系开发团队:
- 电子邮件: dev@maigeeku.com 

# 迈格库物流网站Markdown转HTML工具

这个工具用于将Markdown格式的文章和指南自动转换为HTML格式，使其能够在网站上正确显示。本工具支持将指南和新闻两种不同类型的内容转换为各自对应的格式。

## 主要功能

1. 自动解析Markdown文件中的前置元数据
2. 根据不同内容类型选择不同的HTML模板
3. 自动处理文件路径和目录结构
4. 保持原始文件的组织结构
5. 对于新闻文件，支持根据文件名格式自动设置输出文件名
6. **自动检测并转换新的或更新的Markdown文件**

## 目录结构

```
├── md-to-html/            # 转换工具目录
│   ├── md-convert.js      # 核心转换脚本
│   ├── file-check.ps1     # 文件检测和转换脚本
│   ├── auto-check.bat     # 自动检测批处理文件
│   └── convert-all.ps1    # 全量转换脚本
├── guides-md/             # 指南类Markdown源文件目录
│   └── ...                # 各类指南的子目录和文件
├── news-md/               # 新闻类Markdown源文件目录
│   └── ...                # 各类新闻的子目录和文件
├── tools-guides/          # 转换后的指南HTML文件目录
│   └── ...                # 转换后的指南文件
├── static-news/           # 转换后的新闻HTML文件目录
│   └── ...                # 转换后的新闻文件
└── tools/                 # HTML模板文件目录
    ├── tool-template.html # 指南类内容的HTML模板
    └── news-template.html # 新闻类内容的HTML模板
```

## 使用方法

### 准备环境

1. 确保已安装Node.js环境
2. 安装所需依赖包:

```bash
npm install marked
```

### 自动检测和转换新文件

使用`auto-check.bat`批处理文件可以自动检测并转换新的或已更新的Markdown文件:

```bash
md-to-html\auto-check.bat
```

该工具会：
1. 检查guides-md目录中的所有Markdown文件，与对应的HTML文件比较修改时间
2. 仅转换新的或已更新的文件
3. 检查news-md目录中的所有Markdown文件，同样只转换需要更新的文件

### 单个文件转换

使用`md-convert.js`脚本可以转换单个Markdown文件:

```bash
cd md-to-html
node md-convert.js 源Markdown文件路径 输出HTML文件路径 模板文件路径
```

例如:

```bash
node md-convert.js ../guides-md/regulations/import-regulations.md ../tools-guides/regulations/import-regulations.html ../tools/tool-template.html
```

### 批量转换所有文件

使用PowerShell脚本`convert-all.ps1`可以一次性转换所有Markdown文件:

```bash
cd md-to-html
powershell -File convert-all.ps1
```

## Markdown文件格式

Markdown文件应包含前置元数据，格式如下:

```markdown
---
title: 文章标题
date: 2024-04-08
category: 分类名称
importance: normal/important/critical
region: 地区名称(可选)
---

# 文章正文标题

文章内容...
```

前置元数据支持的字段:

| 字段 | 说明 | 可选值 |
|------|------|--------|
| title | 文章标题 | 任意文本 |
| date | 发布日期 | YYYY-MM-DD格式 |
| category | 文章分类 | 任意分类名 |
| importance | 重要程度 | normal(普通), important(重要), critical(关键) |
| region | 地区名称 | 任意地区名,若不填则默认为"全球" |

## HTML模板格式

HTML模板中使用以下占位符:

- `{{TITLE}}` - 文章标题
- `{{DATE}}` - 发布日期
- `{{CATEGORY}}` - 文章分类
- `{{REGION}}` - 地区名称
- `{{IMPORTANCE_CLASS}}` - 重要程度的CSS类名
- `{{IMPORTANCE_TEXT}}` - 重要程度的显示文本
- `{{CONTENT}}` - Markdown转换后的HTML内容

## 文件命名规则

### 指南类文件

指南类文件的输出路径与源文件路径对应，只将`guides-md`替换为`tools-guides`，扩展名由`.md`改为`.html`。

### 新闻类文件

新闻类文件如果文件名以数字开头(如`01 文章标题.md`)，则输出文件名只保留数字部分(如`01.html`)；否则保持原文件名。

## 自动化与集成

### 定时任务设置

您可以设置Windows计划任务来自动运行检测和转换:

1. 打开任务计划程序
2. 创建基本任务
3. 设置触发器(如每天特定时间或文件夹变更时)
4. 设置操作为启动程序
5. 指定程序为`D:\HaigeProject\WebMaigeeku\md-to-html\auto-check.bat`的完整路径
6. 完成设置

### 编辑器集成

您也可以将转换过程集成到您的编辑工作流程中:

1. 在保存Markdown文件后自动运行转换
2. 使用编辑器插件在保存时触发转换脚本
3. 设置Git钩子，在提交前自动运行转换

## 注意事项

1. 确保所有Markdown文件使用UTF-8编码，避免中文显示乱码
2. 每次转换前请备份重要文件
3. 转换脚本会自动创建必要的目录结构
4. 如果文件没有前置元数据，脚本会尝试从文件内容中提取标题

## 常见问题解决

1. **转换后的文件内容乱码**
   - 检查源Markdown文件的编码是否为UTF-8
   - 检查模板文件的编码是否为UTF-8

2. **目录路径错误**
   - 确保在正确的目录中运行脚本
   - 检查相对路径是否正确

3. **Node.js模块未找到**
   - 运行`npm install marked`安装必要的依赖 
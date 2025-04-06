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
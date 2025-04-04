# 网站项目结构规划

## 目录结构

```
WebMaigeeku/
├── assets/
│   ├── css/
│   │   └── styles.css            (全局样式)
│   ├── js/
│   │   ├── script.js             (全局脚本)
│   │   └── ai-pricing.js         (AI询价功能脚本)
│   └── images/                   (所有图片资源)
├── regions/                      (按区域分类)
│   ├── north-america/
│   │   ├── index.html            (原north-america.html)
│   │   ├── ai-pricing.html       (北美地区AI询价)
│   │   └── simple-links.html
│   ├── south-america/
│   │   └── index.html
│   ├── europe/
│   │   └── index.html
│   ├── australia/
│   │   └── index.html
│   ├── middle-east/
│   │   └── index.html
│   ├── southeast-asia/
│   │   └── index.html
│   └── africa/
│       └── index.html
├── products/                     (按货品类型分类)
│   ├── regular/
│   │   └── index.html
│   ├── cosmetics/
│   │   └── index.html
│   ├── liquids/
│   │   └── index.html
│   ├── e-cigarettes/
│   │   └── index.html
│   ├── batteries/
│   │   └── index.html
│   └── electronic-with-battery/
│       └── index.html
├── cargo-types/                  (按货物大小分类)
│   ├── standard/
│   │   └── index.html
│   ├── large/
│   │   └── index.html
│   └── extra-large/
│       └── index.html
├── destinations/                 (按目的地类型分类)
│   ├── commercial/
│   │   └── index.html
│   ├── residential/
│   │   └── index.html
│   ├── fba/
│   │   └── index.html
│   ├── walmart/
│   │   └── index.html
│   └── overseas-warehouse/
│       └── index.html
├── shared/                       (共享组件)
│   ├── header.html
│   ├── footer.html
│   └── ai-chat-component.html
├── index.html                    (网站首页)
└── README.md                     (项目说明文档)
```

## 实施方案

### 第一步：创建基础目录结构

创建上述所有文件夹。

### 第二步：移动和重命名现有文件

1. 将现有CSS和JS文件移动到对应资源目录：
   - `styles.css` → `assets/css/styles.css`
   - `script.js` → `assets/js/script.js`
   - 从`ai-pricing.html`中提取JS逻辑到 → `assets/js/ai-pricing.js`

2. 将现有HTML文件移动到对应目录：
   - `north-america.html` → `regions/north-america/index.html`
   - `ai-pricing.html` → `regions/north-america/ai-pricing.html`
   - `simple-links.html` → `regions/north-america/simple-links.html`

3. 移动图片文件夹：
   - `images/` → `assets/images/`

### 第三步：更新所有文件中的路径引用

所有文件中需要更新资源引用路径，例如：

#### regions/north-america/index.html 文件中：
```html
<!-- 旧路径 -->
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>
<img src="images/logo.png">

<!-- 新路径 -->
<link rel="stylesheet" href="../../assets/css/styles.css">
<script src="../../assets/js/script.js"></script>
<img src="../../assets/images/logo.png">
```

#### regions/north-america/ai-pricing.html 文件中：
```html
<!-- 旧路径 -->
<link rel="stylesheet" href="styles.css">
<a href="north-america.html">返回线路列表</a>

<!-- 新路径 -->
<link rel="stylesheet" href="../../assets/css/styles.css">
<script src="../../assets/js/ai-pricing.js"></script>
<a href="./index.html">返回线路列表</a>
```

### 第四步：为其他部分创建基础模板

为其他尚未开发的部分（如南美、欧洲等区域，以及各种货品类型页面）创建基础的模板文件，确保它们链接到正确的资源。

### 第五步：优化导航链接

更新所有页面中的导航菜单，使其链接到新的文件结构，例如：

```html
<ul class="submenu">
    <li><a href="../../regions/north-america/index.html">北美</a></li>
    <li><a href="../../regions/south-america/index.html">南美</a></li>
    <!-- 其他导航项 -->
</ul>
```

## 未来扩展计划

1. 每个子菜单页面可以进一步包含详细内容：
   - 各区域的具体线路介绍
   - 每种货品类型的特殊运输要求
   - 不同货型的尺寸和重量限制说明
   - 各类目的地的清关文件要求等

2. 考虑添加一个`services`目录，包含增值服务如：
   - 包装服务
   - 保险服务
   - 仓储服务
   - 清关服务

3. 添加一个`tools`目录，包含：
   - 运费计算器
   - 体积重计算器
   - 运输时效查询工具 
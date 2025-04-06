# 物流服务网站

这是一个提供国际物流服务的网站，专注于为客户提供全球范围内的物流解决方案。

## 项目结构

项目采用简洁的文件夹结构组织：

```
/ (根目录)
├── index.html               # 网站首页
├── login.html               # 用户登录页面
├── register.html            # 用户注册页面
├── forgot-password.html     # 密码找回页面
├── user-profile.html        # 用户中心页面
├── assets/                  # 静态资源
│   ├── css/                 # CSS样式文件
│   │   ├── styles.css       # 全局样式
│   │   └── auth.css         # 认证相关样式
│   ├── js/                  # JavaScript文件
│   │   ├── script.js        # 全局脚本
│   │   ├── auth.js          # 认证相关脚本
│   │   └── ai-pricing.js    # AI询价功能
│   └── images/              # 图片资源
├── regions/                 # 按区域分类的页面
│   ├── north-america/       # 北美地区
│   ├── south-america/       # 南美地区
│   ├── europe/              # 欧洲地区
│   ├── australia/           # 澳洲地区
│   ├── middle-east/         # 中东地区
│   ├── southeast-asia/      # 东南亚地区
│   └── africa/              # 非洲地区
├── products/                # 按货品类型分类的页面
│   ├── regular/             # 普货
│   ├── cosmetics/           # 化妆品
│   ├── liquids/             # 液体
│   ├── e-cigarettes/        # 电子烟
│   ├── batteries/           # 纯电池
│   └── electronic-with-battery/ # 内电
├── cargo-types/             # 按货型分类的页面
│   ├── standard/            # 标准件
│   ├── large/               # 大件
│   └── extra-large/         # 超大件
├── destinations/            # 按地址类型分类的页面
│   ├── commercial/          # 商业件
│   ├── residential/         # 私人地址件
│   ├── fba/                 # FBA
│   ├── walmart/             # 沃尔玛
│   └── overseas-warehouse/  # 海外仓
└── shared/                  # 共享组件和模板
```

## 功能特性

### 1. 区域和货品分类
- 提供基于地理区域的服务导航
- 根据货品类型提供专业物流解决方案
- 按货物尺寸和重量提供合适的运输方案
- 根据收件地址类型优化配送服务

### 2. AI智能询价系统
- 集成了AI助手，提供实时物流询价服务
- 根据用户选择的路线展示主要特点和优势
- 支持自然语言交互，让用户能够更轻松地获取物流信息

### 3. 用户认证系统
- 完整的用户注册和登录功能
- 支持密码找回流程
- 用户中心页面展示个人信息和订单历史
- 使用本地存储实现登录状态管理

## 技术实现

### 前端技术
- HTML5, CSS3 和 JavaScript (ES6+)
- 响应式设计，适配不同屏幕尺寸
- 使用FontAwesome图标集增强UI视觉效果

### 认证系统
认证系统使用纯前端实现，主要功能包括：

1. **登录功能**
   - 用户名/邮箱和密码认证
   - "记住我"功能，延长登录状态
   - 表单验证和错误提示

2. **注册功能**
   - 完整的用户信息收集
   - 密码强度检测
   - 用户协议同意机制

3. **密码找回**
   - 多步骤流程指引
   - 邮箱验证
   - 新密码设置

4. **用户中心**
   - 个人信息展示和编辑
   - 订单历史查询
   - 地址管理

### 数据管理
- 使用localStorage实现用户会话管理
- 模拟服务器响应实现前端功能演示

## 开发和部署

### 本地开发
1. 克隆本仓库
2. 在浏览器中直接打开`index.html`或通过本地服务器访问

### 部署
- 可直接部署到任何静态网站托管服务
- 无需特殊服务器环境，纯静态实现

## 未来计划
- 集成真实的后端API
- 添加多语言支持
- 实现更多物流计算功能
- 添加实时物流追踪系统

# 麦极客物流 - 工具与指南系统

## 系统概述

工具与指南系统是麦极客物流平台的重要组成部分，旨在为用户提供各类国际物流相关的实用工具、操作指南、表格文档、法规解读及交互式功能。该系统采用WordPress作为内容管理系统(CMS)，并通过自动化脚本将内容转换为静态HTML页面，确保高性能和良好的用户体验。

## 文件结构

```
/tools-guides/                  # 静态工具与指南页面目录
  /calculators/                 # 计算工具类页面
  /guides/                      # 指南文档类页面
  /forms/                       # 表格文档类页面
  /regulations/                 # 法规解读类页面
  /interactive/                 # 交互式工具类页面
  index.html                    # 主索引页面

/tools/                         # 工具管理脚本目录
  tool-template.html           # 工具页面HTML模板
  generate-tools-guides.js     # 静态页面生成脚本
```

## 静态页面生成过程

系统通过以下步骤生成静态工具与指南页面：

1. 从CMS (https://cms.kjsth.com) 抓取最新的工具与指南内容
2. 使用预定义的模板 (`tool-template.html`) 将内容转换为静态HTML页面
3. 根据分类生成相应的索引页面
4. 更新主索引页面，展示最新添加的工具

## 目录结构说明

### 工具与指南分类目录

系统支持以下五种主要类型的工具与指南：

1. **计算工具** (`/calculators/`): 体积重计算器、运费估算器等实用计算工具
2. **指南文档** (`/guides/`): 包装指南、清关流程等操作指南文档
3. **表格文档** (`/forms/`): 提供各类物流所需表格的模板和填写说明
4. **法规解读** (`/regulations/`): 各国海关政策、进出口限制等法规解读
5. **互动工具** (`/interactive/`): 提供路线规划、物流方案比较等交互式功能

### 配置参数

在 `generate-tools-guides.js` 中定义了以下配置参数：

- **CMS API 地址**: 用于获取内容的WordPress REST API端点
- **输出目录**: 静态页面的生成位置
- **工具模板路径**: HTML模板文件位置
- **工具与指南分类映射**: 定义各分类ID、名称和图标
- **地区映射**: 定义各地区ID和名称
- **重要程度映射**: 定义内容重要性级别及对应样式

## 使用说明

### 添加新工具/指南

1. 登录CMS系统 (https://cms.kjsth.com/wp-admin)
2. 创建新文章，选择对应的工具分类
3. 编写内容，可以使用特定的HTML结构添加交互工具
4. 发布文章后运行生成脚本更新静态页面

### 运行生成脚本

```bash
# 安装依赖
npm install

# 运行生成脚本
node tools/generate-tools-guides.js
```

### 交互式工具开发

要添加交互式工具，需在CMS文章内容中使用以下结构：

```html
<div class="interactive-tool">
    <h3>工具名称</h3>
    <!-- 工具表单和交互元素 -->
    <div id="result" class="tool-result"></div>
</div>

<!-- 在文章末尾添加JavaScript代码 -->
<script>
    // 工具特定的JavaScript代码
</script>
```

## 自动化部署建议

为确保工具与指南内容的及时更新，建议设置以下自动化流程：

1. 配置WordPress钩子，在内容发布/更新时触发静态页面生成
2. 设置定时任务，定期从CMS抓取最新内容并更新静态页面
3. 集成到CI/CD流程，确保代码更新时自动部署最新页面

## 自定义和扩展

系统支持以下自定义和扩展：

1. **添加新分类**: 在配置参数中添加新的工具分类
2. **自定义模板**: 修改 `tool-template.html` 更新页面样式和结构
3. **扩展功能**: 在生成脚本中添加新的处理逻辑，如多语言支持、搜索功能等

## 故障排除

常见问题及解决方法：

1. **内容未更新**: 检查CMS API连接是否正常，确认内容已发布
2. **样式异常**: 检查模板文件和CSS样式定义是否完整
3. **生成脚本错误**: 查看控制台错误信息，确保所有依赖已正确安装

## 更新日志

- **2024-04-06**: 初始系统建立，完成基础功能和体积重计算器工具
- **2024-04-06**: 创建主索引页面和分类结构
- **2024-04-06**: 完成CMS内容抓取和静态页面生成脚本

# MaigeEku工具与指南管理系统

本系统用于管理MaigeEku物流网站中的工具与指南内容，包括计算工具、指南文档、表格文档、法规解读和互动工具等。

## 一、系统概述

本系统基于WordPress作为后台CMS，通过自定义插件"MaigeEku工具与指南管理"创建专门的内容类型和分类方式，实现对各类工具与指南的高效管理。前端网站可以通过JavaScript加载器与WordPress REST API通信，动态获取并展示内容，也可以通过静态HTML生成脚本将内容转换为静态页面。

### 主要功能：

1. 按分类管理工具与指南内容（计算工具、指南文档、表格文档等）
2. 按地区分类内容（全球、北美、南美等）
3. 设置内容重要性级别（普通、重要、关键）
4. 支持交互式工具的嵌入
5. 关联相关工具，增强用户体验
6. 支持静态HTML页面生成，提高访问速度

## 二、系统组件

系统由以下几个主要组件组成：

1. **WordPress插件**：`maigeeku-tools-guides.php`
   - 定义自定义文章类型、分类方式和元数据
   - 提供用户友好的管理界面
   - 创建REST API端点

2. **前端加载器**：`maigeeku-tools-loader.js`
   - 从WordPress动态加载工具与指南内容
   - 提供美观的展示界面
   - 支持按分类和地区筛选

3. **静态页面生成器**：`generate-tools-guides.js`
   - 从WordPress抓取内容并生成静态HTML页面
   - 创建分类和地区索引页面
   - 处理交互式工具的嵌入

## 三、安装与配置

### 3.1 WordPress插件安装

1. 将`maigeeku-tools-guides.php`上传到WordPress的`wp-content/plugins`目录
2. 在WordPress后台激活"MaigeEku工具与指南管理"插件
3. 插件会自动创建必要的自定义文章类型、分类法和默认分类项

### 3.2 前端集成

有两种方式可以在前端网站中集成工具与指南内容：

#### 方式一：动态加载（适合需要实时内容的场景）

1. 将`maigeeku-tools-loader.js`文件上传到网站的`assets/js`目录
2. 在需要显示工具与指南的页面引入此脚本：
   ```html
   <script src="../../assets/js/maigeeku-tools-loader.js"></script>
   ```
3. 在页面中创建容器元素：
   ```html
   <h2 id="tools-section-title">工具与指南</h2>
   <div id="tools-grid"></div>
   ```
4. 调用加载函数（可选，默认会自动初始化）：
   ```html
   <script>
     loadToolsGuides({
       category: 'calculators',  // 可选：calculators, guides, forms, regulations, interactive, all
       region: 'north-america',  // 可选：north-america, europe, asia等，或all
       limit: 8                  // 显示数量
     });
   </script>
   ```

#### 方式二：静态HTML生成（适合高性能需求）

1. 在服务器上安装Node.js环境
2. 上传`generate-tools-guides.js`和`tool-template.html`到网站的`tools`目录
3. 在命令行中执行：
   ```bash
   node generate-tools-guides.js
   ```
4. 脚本会生成静态HTML页面并保存在`tools-guides`目录下
5. 直接链接到生成的HTML页面，如：
   ```html
   <a href="../../tools-guides/calculators/1.html">体积重计算器</a>
   ```

## 四、内容管理

### 4.1 添加新工具或指南

1. 登录WordPress后台
2. 点击左侧导航栏中的"工具与指南 > 添加内容"
3. 填写标题和内容
4. 在右侧面板中：
   - 选择"工具分类"（计算工具、指南文档等）
   - 选择"适用地区"（全球、北美等）
   - 设置"重要程度"（普通/重要/关键）
   - 添加相关工具（可选）
5. 点击"发布"按钮

### 4.2 添加交互式工具

1. 在编辑器中切换到"代码"视图
2. 添加以下HTML结构：
   ```html
   <div class="interactive-tool">
       <h3>工具名称</h3>
       <!-- 表单和交互元素 -->
       <div class="form-group">
           <label for="input1">输入项：</label>
           <input type="text" id="input1" class="form-control">
       </div>
       <button type="button" id="calculate-btn" class="btn-primary">计算</button>
       <div id="result" class="tool-result"></div>
   </div>

   <script>
       // 工具的JavaScript代码
       document.getElementById('calculate-btn').addEventListener('click', function() {
           const input = document.getElementById('input1').value;
           // 处理逻辑
           document.getElementById('result').textContent = '结果: ' + input;
       });
   </script>
   ```

### 4.3 添加相关工具

1. 在右侧面板的"相关工具"部分，从下拉菜单中选择要关联的工具
2. 点击"添加"按钮
3. 可以添加多个相关工具
4. 这些工具将显示在生成的页面底部

## 五、系统维护

### 5.1 更新静态页面

当添加或修改工具与指南内容后，需要重新生成静态页面：

1. 执行`node tools/generate-tools-guides.js`
2. 确认生成的HTML文件是否正确
3. 更新前端网站的链接（如有必要）

### 5.2 自动化部署

可以设置定时任务自动更新静态页面：

1. 创建shell脚本`update-tools.sh`：
   ```bash
   #!/bin/bash
   cd /path/to/website
   node tools/generate-tools-guides.js
   ```

2. 设置crontab任务每天自动执行：
   ```
   0 1 * * * /path/to/update-tools.sh
   ```

## 六、故障排除

### 6.1 动态加载失败

1. 检查浏览器控制台是否有错误信息
2. 确认WordPress REST API是否可访问
3. 检查跨域访问设置（可能需要在WordPress中配置CORS）
4. 验证分类ID和地区ID是否与WordPress中的设置一致

### 6.2 静态页面生成问题

1. 确保Node.js环境正确安装
2. 检查WordPress API连接是否正常
3. 确认模板文件是否存在并格式正确
4. 检查生成的HTML文件是否包含预期内容

## 七、API参考

### 7.1 REST API端点

WordPress插件提供以下API端点：

1. 按分类获取工具：
   ```
   GET /wp-json/maigeeku/v1/tools-by-category/{category}
   ```

2. 按地区获取工具：
   ```
   GET /wp-json/maigeeku/v1/tools-by-region/{region}
   ```

### 7.2 JavaScript加载器API

`loadToolsGuides(options)`函数接受以下选项：

- `category`: 工具分类（calculators, guides, forms, regulations, interactive, all）
- `region`: 适用地区（north-america, europe, 等）
- `containerId`: 容器元素ID（默认：'tools-grid'）
- `titleId`: 标题元素ID（默认：'tools-section-title'）
- `limit`: 显示数量（默认：8）

## 八、联系与支持

如有任何问题或需要技术支持，请联系：

- 邮箱：support@maigeeku.com
- 技术支持：+86 755-XXXX-XXXX

---

© MaigeEku 2024 - 工具与指南管理系统 
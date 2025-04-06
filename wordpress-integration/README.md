# MaigeEku WordPress集成系统

此目录包含了用于MaigeEku网站的WordPress集成插件和脚本，主要包括两部分功能：物流资讯管理和工具与指南管理系统。

---

# 一、物流资讯管理系统

本指南详细介绍如何使用WordPress作为CMS系统，管理MaigeEku物流网站中各地区的物流资讯内容。

## 1. 系统概述

本集成方案使用WordPress作为后台CMS系统，通过自定义插件"MaigeEku物流资讯管理"创建专门的内容类型和分类方式，实现对全球各地区物流资讯的高效管理。前端网站通过JavaScript与WordPress REST API通信，动态获取并展示最新资讯。

### 主要功能：

1. 按地区分类管理物流资讯内容
2. 设置资讯重要性级别
3. 自动按时间排序展示最新资讯
4. 支持前端动态刷新内容
5. 完全可自定义的展示效果

## 2. 安装物流资讯管理插件

1. **上传插件**
   - 将`maigeeku-logistics-news.php`文件上传到WordPress的`wp-content/plugins`目录
   - 在WordPress后台激活"MaigeEku物流资讯管理"插件

2. **插件初始化**
   - 激活后，插件将自动创建物流资讯自定义文章类型
   - 创建地区分类法并添加默认地区
   - 添加示例内容（北美地区的4篇资讯）

## 3. 添加和管理物流资讯

1. **添加新资讯**
   - 登录WordPress后台
   - 点击左侧导航栏中的"物流资讯 > 添加资讯"
   - 填写标题和内容
   - 设置发布日期
   - 在右侧"地区"框中选择适当的地区分类
   - 设置"资讯重要性"（普通/重要/非常重要）
   - 点击"发布"按钮

2. **管理现有资讯**
   - 点击"物流资讯"查看所有资讯列表
   - 使用筛选器按地区过滤
   - 编辑、更新或删除资讯

3. **设置资讯接口**
   - 点击"物流资讯 > 物流资讯设置"
   - 配置每页显示的资讯数量（默认4条）

## 4. 前端集成

1. **引入JavaScript文件**
   - 将`maigeeku-news-loader.js`文件上传到MaigeEku网站的`assets/js`目录
   - 在网站模板文件中添加引用：
   ```html
   <script src="../../assets/js/maigeeku-news-loader.js"></script>
   ```

2. **配置WordPress域名**
   - 编辑`maigeeku-news-loader.js`文件
   - 修改WordPress URL:
   ```javascript
   const wordpressUrl = 'https://cms.kjsth.com';
   ```

3. **HTML结构**
   - 确保页面中存在以下HTML结构：
   ```html
   <div class="right-section">
     <h3>北美物流资讯</h3>
     <ul class="article-list">
       <!-- 内容将由JavaScript动态加载 -->
     </ul>
   </div>
   ```

---

# 二、工具与指南管理系统

本部分详细介绍如何使用WordPress管理MaigeEku物流网站中的工具与指南内容，包括计算工具、指南文档、表格文档、法规解读和互动工具等。

## 1. 系统概述

本系统基于WordPress作为后台CMS，通过自定义插件"MaigeEku工具与指南管理"创建专门的内容类型和分类方式，实现对各类工具与指南的高效管理。前端网站可以通过JavaScript加载器与WordPress REST API通信，动态获取并展示内容，也可以通过静态HTML生成脚本将内容转换为静态页面。

### 主要功能：

1. 按分类管理工具与指南内容（计算工具、指南文档、表格文档等）
2. 按地区分类内容（全球、北美、南美等）
3. 设置内容重要性级别（普通、重要、关键）
4. 支持交互式工具的嵌入
5. 关联相关工具，增强用户体验
6. 支持静态HTML页面生成，提高访问速度

## 2. 系统组件

系统由以下几个主要组件组成：

1. **WordPress插件**：`maigeeku-tools-guides.php`
   - 定义自定义文章类型、分类方式和元数据
   - 提供用户友好的管理界面
   - 创建REST API端点

2. **前端加载器**：`maigeeku-tools-loader.js`
   - 从WordPress动态加载工具与指南内容
   - 提供美观的展示界面
   - 支持按分类和地区筛选

3. **静态页面生成器**：`generate-tools-guides.js`（位于网站根目录的`tools`文件夹）
   - 从WordPress抓取内容并生成静态HTML页面
   - 创建分类和地区索引页面
   - 处理交互式工具的嵌入

## 3. 安装工具与指南管理插件

1. **上传插件**
   - 将`maigeeku-tools-guides.php`上传到WordPress的`wp-content/plugins`目录
   - 在WordPress后台激活"MaigeEku工具与指南管理"插件
   - 插件会自动创建必要的自定义文章类型、分类法和默认分类项

## 4. 前端集成

有两种方式可以在前端网站中集成工具与指南内容：

### 4.1 动态加载（适合需要实时内容的场景）

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

### 4.2 静态HTML生成（适合高性能需求）

1. 在服务器上安装Node.js环境
2. 使用网站根目录中`tools`文件夹内的`generate-tools-guides.js`和`tool-template.html`
3. 在命令行中执行：
   ```bash
   node tools/generate-tools-guides.js
   ```
4. 脚本会生成静态HTML页面并保存在`tools-guides`目录下
5. 直接链接到生成的HTML页面，如：
   ```html
   <a href="../../tools-guides/calculators/1.html">体积重计算器</a>
   ```

## 5. 内容管理

### 5.1 添加新工具或指南

1. 登录WordPress后台
2. 点击左侧导航栏中的"工具与指南 > 添加内容"
3. 填写标题和内容
4. 在右侧面板中：
   - 选择"工具分类"（计算工具、指南文档等）
   - 选择"适用地区"（全球、北美等）
   - 设置"重要程度"（普通/重要/关键）
   - 添加相关工具（可选）
5. 点击"发布"按钮

### 5.2 添加交互式工具

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

## 6. 系统维护

当添加或修改工具与指南内容后，需要重新生成静态页面：

1. 执行`node tools/generate-tools-guides.js`
2. 确认生成的HTML文件是否正确
3. 更新前端网站的链接（如有必要）

或者设置定时任务自动更新静态页面：

```bash
# crontab示例
0 1 * * * cd /path/to/website && node tools/generate-tools-guides.js
```

---

## 通用配置和故障排除

### WordPress配置

1. **WordPress安装**
   - 下载WordPress: [https://cn.wordpress.org/download/](https://cn.wordpress.org/download/)
   - 创建数据库和用户
   - 上传文件并访问域名完成安装向导
   - 建议使用独立域名，如 `cms.maigeeku.com`

2. **基础设置**
   - 更新永久链接结构为"文章名"
   - 安装必要插件：Yoast SEO, WP REST API
   - 调整安全设置，确保API访问权限

### 跨域问题解决

如遇到跨域问题，在WordPress的`.htaccess`文件中添加：
```
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "https://www.maigeeku.com"
  Header set Access-Control-Allow-Methods "GET"
</IfModule>
```

### 常见问题排查

1. **内容不显示**
   - 检查WordPress REST API是否正常工作
   - 验证内容是否已正确分类
   - 检查浏览器控制台是否有错误信息

2. **加载缓慢**
   - 启用WordPress缓存插件
   - 考虑使用CDN加速API请求
   - 使用静态HTML生成替代动态加载

3. **样式问题**
   - 检查CSS冲突
   - 修改相应JS文件中的样式定义

## 联系支持

如有任何问题或需要技术支持，请联系：

- 邮箱：support@maigeeku.com
- 电话：+86 755-8888-8888

---

© MaigeEku 2024 - WordPress集成系统 


https://cms.kjsth.com/wp-json/wp/v2/tools_guides   工具与指南搜索
https://cms.kjsth.com/wp-json/maigeeku/v1/news-by-region/north-america/   物流资讯



请先检测本站中是否有这样的执行代码：  如果没有就创建一个。 实现以下功能：
1. 自动搜索cms.kjsth.com   是否有新的记录更新：搜索（
物流资讯接口： https://cms.kjsth.com/wp-json/maigeeku/v1/news-by-region/{region}


工具指南接口:   
                          https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/guides  
                           https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/forms
                      https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/interactive
                     https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/regulations
                      https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/calculators

# MaigeEku 物流资讯管理插件

## 插件简介

MaigeEku 物流资讯管理插件是专为 MaigeEku 物流网站设计的 WordPress 插件，用于管理全球各地区物流资讯内容，并与网站前端集成。

**版本:** 1.0.0
**作者:** MaigeEku Team

## 功能特点

- 创建和管理全球不同地区的物流资讯
- 按地区分类整理物流资讯
- 设置资讯重要性级别（普通、重要、非常重要）
- 提供 REST API 接口，方便与前端集成
- 自动生成示例内容，快速开始使用
- 简洁易用的管理界面

## 安装说明

### 前提条件

- WordPress 5.0 或更高版本
- PHP 7.2 或更高版本

### 安装步骤

1. 下载插件压缩包或将文件夹上传到 WordPress 插件目录
2. 在 WordPress 后台激活插件
3. 插件会自动创建以下内容：
   - 物流资讯自定义文章类型
   - 地区分类法
   - 示例资讯内容（北美地区）

## 使用指南

### 1. 添加物流资讯

1. 在 WordPress 后台导航菜单中找到"物流资讯"
2. 点击"添加资讯"创建新的物流资讯
3. 填写资讯标题和内容
4. 在右侧"地区"框中选择或创建资讯所属地区
5. 在"资讯重要性"框中设置资讯的重要程度
6. 点击"发布"按钮保存资讯

### 2. 管理地区

1. 在"物流资讯"菜单下点击"地区"
2. 在此页面可以添加、编辑或删除地区
3. 建议使用与前端页面对应的地区代码：
   - north-america (北美)
   - middle-east (中东)
   - europe (欧洲)
   - asia (亚洲)
   - australia (澳洲)
   - africa (非洲)
   - south-america (南美)

### 3. 插件设置

1. 在"物流资讯"菜单下点击"物流资讯设置"
2. 在此页面可以配置以下设置：
   - 每页显示的资讯数量（默认为4）
   - 其他后续可能添加的设置选项

## 前端集成

### 1. JavaScript 加载器

插件包含一个 JavaScript 文件 `maigeeku-news-loader.js`，用于在 MaigeEku 网站前端加载和显示物流资讯。

使用步骤：

1. 将 `maigeeku-news-loader.js` 文件复制到您的网站前端项目中
2. 在需要显示物流资讯的页面引入该 JS 文件：
   ```html
   <script src="path/to/maigeeku-news-loader.js"></script>
   ```
3. 在页面中创建用于显示资讯的 HTML 结构：
   ```html
   <div class="news-section">
     <div class="section-title">
       <h2>物流资讯</h2>
     </div>
     <ul class="article-list"></ul>
   </div>
   ```

### 2. WordPress 域名配置

在 `maigeeku-news-loader.js` 文件的开头，修改 WordPress 站点 URL：

```js
// WordPress站点URL，根据实际部署环境修改
const wordpressUrl = 'https://wordpress.maigeeku.com';
```

将其更改为您的 WordPress 实际部署地址。

### 3. REST API 访问设置

确保您的 WordPress 站点允许跨域请求：

1. 在 WordPress 中安装并启用 WP REST API - CORS 插件
2. 配置允许的域名（MaigeEku 网站域名）
3. 或者在 WordPress 的 `functions.php` 中添加以下代码：

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

## 故障排除

### 常见问题

1. **问题**: 插件安装后没有自动创建示例内容
   **解决方案**: 尝试停用后重新激活插件，或在插件设置页面中寻找"重新创建示例内容"选项

2. **问题**: 前端无法加载资讯内容
   **解决方案**: 
   - 检查 WordPress URL 配置是否正确
   - 确认 REST API 是否启用并正常工作
   - 检查浏览器控制台是否有跨域错误，如有则配置 CORS 设置

3. **问题**: 某些地区没有显示资讯
   **解决方案**: 确保已为该地区创建了资讯内容，并检查地区代码拼写是否与前端一致

## 版本历史

- **1.0.0** (2024-04-05): 初始版本发布

## 插件开发

如需对插件进行扩展开发，文件结构如下：

```
maigeeku-logistics-news/
├── maigeeku-logistics-news.php  # 主插件文件
├── maigeeku-news-loader.js      # 前端资讯加载器
├── README.md                    # 说明文档
└── languages/                   # 多语言文件夹（待添加）
```

## 许可证

本插件基于 GPL v2 或更高版本许可证发布。

## 联系方式

如有任何问题或建议，请联系 MaigeEku 技术支持团队：

- 电子邮件: support@maigeeku.com
- 网站: https://www.maigeeku.com 
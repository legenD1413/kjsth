# 迈格库物流资讯静态页面工具

本目录包含用于管理迈格库物流资讯静态页面的工具，主要功能包括从WordPress API获取数据并生成静态HTML页面，以及更新静态页面索引。

## 文件说明

- `generate-static-news.js` - 从WordPress API获取物流资讯并生成静态HTML页面
- `update-news-index.js` - 扫描已有的静态HTML页面并更新索引页面
- `news-template.html` - 新闻详情页模板

## 使用方法

### 1. 生成静态页面

当有新的物流资讯发布到WordPress后台时，运行以下命令生成新的静态HTML页面：

```bash
node generate-static-news.js
```

此命令会：
- 从WordPress API获取最新物流资讯
- 为每个资讯生成对应的静态HTML页面
- 将页面保存到对应的区域目录下

### 2. 更新索引页面

在生成或修改静态页面后，运行以下命令更新索引页面：

```bash
node update-news-index.js
```

此命令会：
- 扫描`static-news`目录中的所有区域和HTML文件
- 从HTML文件中提取元数据（标题、日期、重要性、摘要等）
- 为每个区域生成索引页面，列出该区域的所有资讯
- 生成全球资讯中心主页，提供所有区域的导航

## 目录结构

生成的静态页面将保存在以下目录结构中：

```
static-news/
├── index.html                 # 全球资讯中心主页
├── north-america/             # 北美区域
│   ├── index.html             # 北美区域索引页
│   ├── 1.html                 # 北美区域资讯1
│   ├── 2.html                 # 北美区域资讯2
│   └── ...
├── middle-east/               # 中东区域
│   ├── index.html             # 中东区域索引页
│   └── ...
└── ...                        # 其他区域
```

## 注意事项

1. 确保Node.js环境已正确安装
2. 静态文件生成后，需要将整个`static-news`目录部署到网站服务器
3. 如果修改了模板文件`news-template.html`，需要重新生成静态页面
4. 定期更新静态页面以保持内容的最新状态

## 参数配置

如需修改API地址、输出目录等配置，请编辑脚本文件中的`config`对象：

```javascript
const config = {
    // WordPress API地址
    wordpressUrl: 'https://cms.kjsth.com',
    // 静态文件输出目录
    outputDir: path.resolve(__dirname, '../static-news'),
    // 文章模板路径
    templatePath: './news-template.html',
    // 区域列表
    regions: [
        { code: 'north-america', name: '北美' },
        // ...其他区域
    ]
};
```

## 功能特点

- 从WordPress API获取各区域最新物流资讯
- 为每篇资讯生成独立的静态HTML页面
- 生成区域资讯索引页面
- 保持与网站其他部分的设计风格一致
- 完全静态，无需JavaScript动态加载
- SEO友好的URL结构

## 自动化部署

推荐设置自动化任务，定期运行脚本更新静态页面：

### Linux/Mac（使用cron）

添加cron任务，每天凌晨2点运行：

```bash
0 2 * * * cd /path/to/website/tools && node generate-static-news.js
```

### Windows（使用计划任务）

1. 创建批处理文件`update-news.bat`：
```bat
cd C:\path\to\website\tools
node generate-static-news.js
```

2. 使用Windows任务计划程序设置定期运行此批处理文件

## HTML模板自定义

可修改`news-template.html`文件来自定义静态页面的样式和结构。模板中使用以下占位符：

- `{{TITLE}}` - 资讯标题
- `{{DATE}}` - 发布日期
- `{{REGION_CODE}}` - 区域代码
- `{{REGION_NAME}}` - 区域名称
- `{{CONTENT}}` - 资讯内容
- `{{IMPORTANCE}}` - 重要性级别(normal, important, very_important)
- `{{IMPORTANCE_TEXT}}` - 格式化的重要性文本(普通, 重要, 非常重要)
- `{{ORIGINAL_LINK}}` - 原始WordPress链接

## 故障排除

### 常见问题

1. **生成脚本报错"无法连接到API"**
   - 检查网络连接和WordPress API地址是否正确
   - 确认WordPress站点是否在线

2. **生成的页面样式异常**
   - 检查静态页面中的CSS路径是否正确
   - 确认网站结构是否与模板中预设的路径一致

3. **生成的页面中图片不显示**
   - 检查图片路径是否正确
   - 确认图片文件是否已复制到正确位置

## 更新日志

- v1.0.0 (2024-04-09): 初始版本 
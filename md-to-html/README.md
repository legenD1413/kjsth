# Markdown转HTML工具

这个工具用于将Markdown文件转换为HTML，并应用指定的模板。

## 安装

```bash
npm install
```

## 使用方法

### 自动处理（推荐）

使用以下命令启动自动处理工具：

```bash
# Windows
auto-processor.bat

# 或通过npm脚本
npm run process-all  # 处理所有文件
npm run process-news # 仅处理新闻
npm run process-guides # 仅处理指南
```

自动处理工具会：

1. 检测新的或已更新的Markdown文件
2. 根据文件中的元数据（地区、分类等）转换为HTML
3. 保存到正确的目录
4. 自动更新相关索引页面

### 单个文件转换

使用以下命令转换单个Markdown文件：

```bash
node md-convert.js <输入文件路径> <输出文件路径> <模板类型>
```

- `<输入文件路径>`: Markdown文件的路径
- `<输出文件路径>`: 生成的HTML文件的路径
- `<模板类型>`: 模板类型，可以是 `news` 或 `tool`

例如：

```bash
node md-convert.js ../guides-md/guide-example.md ../tools-guides/fba/output.html tool
```

## 元数据格式

Markdown文件应包含以下格式的元数据：

```markdown
---
title: 文章标题
date: 2023-04-01
category: 分类名称
categories: [分类1, 分类2]
importance: 5
region: 北美
keywords: [关键词1, 关键词2]
---

正文内容...
```

## 支持的模板

- `news`: 用于新闻文章
- `tool`: 用于工具和指南

## 分类映射

Markdown文件中的中文分类会映射到以下英文目录名：

| 中文分类 | 英文目录 |
|---------|---------|
| 监管法规 | regulations |
| 海关指南 | customs |
| 运输指南 | shipping |
| 包装指南 | packaging |
| 亚马逊FBA | fba |
| 物流基础知识 | logistics |
| 实用工具使用指南 | calculator |
| 报关指南 | declaration |
| 税务指南 | tax |
| 保险指南 | insurance |
| 物流跟踪 | tracking |
| 退货处理 | returns |
| 国际物流 | international |
| 快递服务 | express |
| 商业件运输 | commercial |
| 超大件运输 | biggoods |
| 海外仓 | warehouse |
| 互动工具 | interactive |
| 指南 | guides |
| 计算工具 | calculators |
| 表单工具 | forms |

## 区域映射

Markdown文件中的中文区域会映射到以下英文目录名：

| 中文区域 | 英文目录 |
|---------|---------|
| 全球 | global |
| 北美 | north-america |
| 南美 | south-america |
| 欧洲 | europe |
| 亚洲 | asia |
| 大洋洲 | australia |
| 非洲 | africa |
| 中东 | middle-east |

## 文件结构

```
md-to-html/
  ├── auto-processor.bat          # 一键处理批处理脚本
  ├── auto-news-processor.js      # 自动新闻处理JavaScript
  ├── auto-guides-processor.js    # 自动指南处理JavaScript
  ├── md-convert.js               # 核心转换JavaScript
  ├── update-lists.js             # 更新索引JavaScript
  └── README.md                   # 本文档
```

## 故障排除

1. **中文显示乱码**：确保所有批处理脚本都以UTF-8编码保存，并使用`chcp 65001`命令设置控制台编码。

2. **模板文件找不到**：确保`tools`目录下有`tool-template.html`和`news-template.html`文件。

3. **索引更新失败**：检查`tools-guides`和`static-news`目录下是否有`index-template.html`文件。

4. **目录结构不完整**：运行`auto-processor.bat`脚本，它会自动创建所有必要的目录。

5. **JavaScript脚本执行失败**：确保已安装Node.js，并已安装所需的依赖包（使用`npm install`安装）。

## 注意事项

- Markdown文件必须包含正确的元数据（如category、region），否则将使用默认值。
- 生成的HTML文件名包含日期和随机数，以确保唯一性。
- 自动处理工具会检测文件修改日期，仅处理新的或已更新的文件。 
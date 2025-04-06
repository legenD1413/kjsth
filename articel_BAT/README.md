# CMS内容自动更新工具

此工具用于自动从WordPress CMS系统获取最新内容，并生成静态HTML页面。

## 功能概述

1. 自动搜索cms.kjsth.com是否有新的记录更新
   - 物流资讯接口: `https://cms.kjsth.com/wp-json/maigeeku/v1/news-by-region/{region}`
   - 工具指南接口: 
     - `https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/guides`
     - `https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/forms`
     - `https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/interactive`
     - `https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/regulations`
     - `https://cms.kjsth.com/wp-json/maigeeku/v1/tools-by-category/calculators`

2. 如果有更新，自动获取新内容并生成静态HTML页面

3. 自动将新生成的HTML页面添加到物流资讯和工具与指南列表中

## 安装与设置

### 1. 安装依赖

在`articel_BAT`目录下运行以下命令安装必要的依赖：

```bash
npm install
```

这将安装以下依赖：
- axios: 用于发送HTTP请求

### 2. 目录结构

确保目录结构如下：

```
articel_BAT/
├── auto-update-cms-content.js  # 主脚本
├── update.bat                  # Windows批处理文件
├── package.json                # 项目依赖
├── README.md                   # 说明文档
└── logs/                       # 日志目录（脚本会自动创建）
    └── last-update.json        # 记录上次更新信息（脚本会自动创建）
```

脚本会调用项目中的以下文件：
- `../tools/generate-static-news.js`: 生成物流资讯静态页面
- `../tools/update-news-index.js`: 更新资讯索引页面
- `../tools/generate-tools-guides.js`: 生成工具与指南静态页面

## 使用方法

### 手动运行

1. 直接双击`update.bat`文件运行

2. 或者在命令行中执行以下命令：

```bash
cd articel_BAT
node auto-update-cms-content.js
```

### 设置自动定时执行

#### 本地Windows系统

1. 打开任务计划程序（可以在开始菜单中搜索"任务计划程序"或者运行`taskschd.msc`）

2. 点击右侧的"创建基本任务"

3. 输入任务名称，如"CMS内容自动更新"，然后点击下一步

4. 选择触发器，例如"每天"，然后点击下一步

5. 设置开始时间，例如凌晨2:00，然后点击下一步

6. 选择"启动程序"，然后点击下一步

7. 浏览并选择`articel_BAT`目录下的`update.bat`文件，然后点击下一步

8. 点击完成

这样设置后，Windows会每天凌晨2:00自动运行CMS内容更新脚本。

#### 服务器环境设置定时任务

##### Windows服务器设置定时任务

1. **通过图形界面设置（Windows任务计划程序）**
   - 点击开始菜单，搜索并打开"任务计划程序"
   - 在右侧面板点击"创建基本任务"
   - 输入任务名称，如"CMS内容自动更新"
   - 选择触发器"每天"，设置开始时间为凌晨2:00
   - 选择操作"启动程序"
   - 程序路径选择：`C:\Windows\System32\cmd.exe`
   - 添加参数：`/c "cd /d 您的路径\articel_BAT && node auto-update-cms-content.js"`
   - 完成设置

2. **通过命令行创建**
   ```
   schtasks /create /tn "CMS内容自动更新" /tr "C:\Windows\System32\cmd.exe /c \"cd /d D:\您的路径\articel_BAT && node auto-update-cms-content.js\"" /sc DAILY /st 02:00:00
   ```

##### Linux服务器设置定时任务

1. **使用crontab设置**
   - 登录服务器，打开终端
   - 运行 `crontab -e` 编辑当前用户的cron任务
   - 添加以下行（每天凌晨2点执行）：
     ```
     0 2 * * * cd /path/to/articel_BAT && node auto-update-cms-content.js >> /path/to/articel_BAT/logs/cron-$(date +\%Y-\%m-\%d).log 2>&1
     ```
   - 保存并退出编辑器

2. **创建shell脚本**
   - 在服务器上创建run-update.sh文件：
     ```bash
     #!/bin/bash
     cd /path/to/articel_BAT
     node auto-update-cms-content.js
     ```
   - 赋予执行权限：`chmod +x run-update.sh`
   - 添加到crontab：
     ```
     0 2 * * * /path/to/run-update.sh
     ```

##### Docker容器环境

如果您的服务器使用Docker运行Node.js应用：

1. **在Dockerfile中添加定时任务**
   ```Dockerfile
   FROM node:14
   
   WORKDIR /app
   COPY . .
   RUN npm install
   
   # 安装cron
   RUN apt-get update && apt-get -y install cron
   
   # 添加crontab
   RUN echo "0 2 * * * cd /app/articel_BAT && node auto-update-cms-content.js >> /app/articel_BAT/logs/cron.log 2>&1" > /etc/cron.d/cms-update
   RUN chmod 0644 /etc/cron.d/cms-update
   
   # 运行cron和应用
   CMD cron && tail -f /app/articel_BAT/logs/cron.log
   ```

##### 服务器定时任务注意事项

1. **路径问题**：确保在cron或计划任务中使用绝对路径
2. **环境变量**：定时任务可能无法获取与交互式shell相同的环境变量，需要在脚本中设置必要的环境变量
3. **权限问题**：确保运行任务的用户有足够的文件系统权限
4. **日志记录**：建议将定时任务的输出重定向到日志文件，便于调试
5. **Node.js环境**：确保服务器已安装Node.js环境，如果使用nvm管理Node版本，需要在脚本中指定nvm路径

无论选择哪种方式，建议先手动运行一次脚本，确保它能正常工作，然后再设置定时任务。

## 日志记录

脚本会自动记录运行日志，保存在`logs`目录下：

- 每次运行会创建一个以日期命名的日志文件，如`update-2023-10-25.log`
- `last-update.json`文件记录了最后一次成功更新的信息，用于下次比对是否有新内容

## 故障排除

如果在运行过程中遇到问题，请检查：

1. 确保`logs`目录存在且有写入权限

2. 检查网络连接，确保能够访问cms.kjsth.com

3. 查看日志文件，了解详细的错误信息

4. 确保已安装所有必要的依赖

5. 确保路径配置正确，脚本能够找到并执行相关的生成脚本

## 注意事项

- 建议在服务器或长期运行的电脑上设置自动执行，确保内容能够及时更新
- 脚本默认使用相对路径，请确保在正确的目录结构下运行
- 如需调整CMS接口地址或其他配置，请修改`auto-update-cms-content.js`文件中的`CONFIG`对象 
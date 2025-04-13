---
title: 多分类处理测试指南
date: 2024/04/11
category: 运输指南
categories:
 - 运输指南
 - 物流基础知识
 - 海外仓
importance: important
region: 北美
regions:
 - 北美
 - 全球
keywords:
 - 运输
 - 物流
 - 多分类
---

# 多分类处理测试指南

这是一个测试文件，用于验证自动处理工具的多分类处理功能。

## 测试目标

通过在元数据中设置多个分类（运输指南、物流基础知识、海外仓），测试系统是否能够：

1. 识别出多分类设置
2. 为每个分类生成对应的HTML文件
3. 更新每个分类的索引页面

## 预期结果

执行自动处理工具后，应当：

1. 在tools-guides/shipping目录下生成指南HTML文件
2. 在tools-guides/logistics目录下生成指南HTML文件  
3. 在tools-guides/warehouse目录下生成指南HTML文件
4. 更新所有相关分类的索引页面 
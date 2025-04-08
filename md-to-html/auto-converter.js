/**
 * 自动监测和转换工具
 * 监测news-md和guides-md目录中的最新Markdown文件，并转换为HTML
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const cheerio = require('cheerio');

// 配置
const CONFIG = {
  // 源目录
  sourceDirs: {
    news: 'news-md',
    guides: 'guides-md'
  },
  // 目标目录
  targetDirs: {
    news: 'static-news',
    guides: 'tools-guides'
  },
  // 模板文件
  templates: {
    news: 'tools/news-template.html',
    guides: 'tools/tool-template.html'
  },
  // 最后检查时间
  lastCheckTime: Date.now(),
  // 检查时间间隔（毫秒）
  checkInterval: 10000, // 10秒
  // 文件变更追踪
  fileTracking: {
    news: {},
    guides: {}
  },
  // 重要性映射
  importance: {
    news: {
      'normal': { class: 'importance-normal', text: '普通' },
      'important': { class: 'importance-important', text: '重要' },
      'very_important': { class: 'importance-very_important', text: '非常重要' }
    },
    guides: {
      'normal': { class: 'importance-normal', text: '普通' },
      'important': { class: 'importance-important', text: '重要' },
      'critical': { class: 'importance-critical', text: '关键' }
    }
  }
};

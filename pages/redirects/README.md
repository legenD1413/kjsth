# 重定向页面目录

此目录包含网站的所有重定向页面，用于处理URL迁移和页面重新组织。

## 目录内容

- `auth-redirects.html` - 智能重定向页面，可根据URL参数将用户重定向到不同的认证页面（登录/注册/忘记密码）
- `auth/` - 认证相关重定向页面的子目录，包含：
  - `login.html` - 登录页面重定向
  - `register.html` - 注册页面重定向
  - `forgot-password.html` - 忘记密码页面重定向
- `account/` - 账户相关重定向页面的子目录，包含：
  - `account-redirect.html` - 将用户从旧的账户页面重定向到新的个人中心页面
- `news/` - 物流资讯相关重定向页面的子目录，包含：
  - `news-detail-redirect.html` - 物流资讯详情页面重定向
  - `sidebar-news-test-redirect.html` - 物流资讯列表页面重定向

## 重定向页面的用途

1. **维护向后兼容性**：当页面结构变更时，确保旧链接仍然有效
2. **简化URL迁移**：在重组网站结构时，无需立即更新所有内部和外部链接
3. **提供用户友好的提示**：当页面移动时，向用户显示清晰的信息和新链接

## 目录结构说明

- 单个重定向页面直接放在`redirects`目录下
- 按功能模块分组的重定向页面放在相应的子目录中，如`auth`、`news`等
- 每个子目录包含一个README.md文件，说明该目录下重定向页面的共同特点

## 添加新的重定向页面

添加新的重定向页面时，请遵循以下模板：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面已移动 - 迈格库物流</title>
    <meta http-equiv="refresh" content="0; URL=/新页面路径.html">
    <!-- 这里是样式代码 -->
</head>
<body>
    <div class="container">
        <h1>页面已移动</h1>
        <p>您访问的页面已被移动到新位置。如果您的浏览器没有自动跳转，请点击下方链接。</p>
        <p><a href="/新页面路径.html">前往新页面</a></p>
    </div>
</body>
</html>
```

## 特殊重定向页面

某些重定向页面可能需要更高级的功能：

1. **参数化重定向**：如`auth-redirects.html`，根据URL参数动态确定重定向目标
2. **延迟重定向**：为用户提供足够时间阅读消息后再重定向
3. **多重链接**：提供多个可能的目标页面链接，让用户选择

## 注意事项

- 重定向页面应尽量保持体积小，加载速度快
- 所有重定向页面应使用统一的样式和提示信息
- 确保页面中的重定向URL与`meta refresh`标签中的URL一致
- 对于旧路径URLs的处理，优先使用服务器端重定向（如.htaccess）而不是HTML重定向页面 
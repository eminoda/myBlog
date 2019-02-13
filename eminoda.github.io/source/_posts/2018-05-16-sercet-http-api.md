---
title: 提升接口API的安全等级
tags: http
categories:
    - 开发
    - 其他
thumb_img:
    - http.jpg
date: 2018-05-16 17:00:13
---

{% asset_img http.jpg %}
近期，公司老板发起一个关于 api 设计、安全签名的探讨...，然后就有一项课后作业：

> 有什么方式能提升 api 的安全

## 看看别人家怎么做的？

自身经验不多，来简单看下[微信的 access_token 机制来思考下](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)，我们有哪些可以学习。

{% asset_img wx.png 简易的用户授权过程 %}

1. 用户除了主动授权，没有暴露过其他敏感信息--Oauth2
2. 授权获取的 code 具有**唯一性**和**过期性**
3. 授权过程中的 redirect_uri，微信会对授权链接做正则强匹配校验（server 要是使坏，就把你 close 掉）
4. server 事先有后续获取 access_token 提供请求参数 sercetKey（必须只保存在服务器，不允许传给客户端）
5. 微信信任的 access_token，调用有**次数限制**，和**有效期**

## 具体到我们，能做什么

### 使用 https 代替 http 方式

### 提供权限控制

对于公用的服务，你必须是某某权限才能访问这些 api，可能你没有登录什么都干不了。
比如，只有服务端才能获取微信的 token，因为服务端才有 secretKey 等条件

### [使用 JWT](https://github.com/auth0/node-jsonwebtoken)

1. 规范化 security tokens 机制
2. 服务端可以配置 sercetKey（salt），增加破解难度
3. 具有过期性质的配置，可能你不需要在弄个缓存服务来做超时这事
   备注，需要服务端产生 JWT 给 client。避免客户端自己生成

### 特殊 API 给予特殊控制

防止一些敏感接口重复调用，高频调用等情况发生

### 参数验证

不要相信前端提交的表单，或者接口携带的参数不会出什么问题。
保不齐传个负数，丢个 0 给你处理。甚至于留个超大的文件塞爆你的库

### 注意敏感信息的请求方式

账号密码等名该应该放置于 request body 里，或 header 中

### 注意请求头的 Content-Type

比如：上传图片，必须是 image/jpeg，你 gif、png 不行，其他更不行。
Access-Control-Allow-Origin，允许哪些跨域网站可以访问我们支援。

### 使用 REST 来规范你的接口

1. 限制 Http 方法
   根据 Restful 接口的规范，万物皆资源，获取的方法需要特定的方式。
   GET 用来获取资源，
   POST 用来新建资源（也可以用于更新资源），
   PUT 用来更新资源，
   DELETE 用来删除资源...
2. 提供更丰富的 Http status code
3. 提供*友好的*错误提示
   不要提示详细，具体的错误细节给到 client。那只存在日志或其他地方

## 参考

> https://www.owasp.org/index.php/REST_Security_Cheat_Sheet
> [RESTful API Authentication Basics](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)
> [How to Secure Your REST API using Proven Best Practices](https://stormpath.com/blog/secure-your-rest-api-right-way)
> [header 的安全配置指南](https://www.cnblogs.com/doseoer/p/5676297.html)
> [REST 架构该怎么生动地理解？](https://www.zhihu.com/question/27785028)
> [REST 的许多文献](https://github.com/aisuhua/restful-api-design-references)
> http://tool.oschina.net/commons/

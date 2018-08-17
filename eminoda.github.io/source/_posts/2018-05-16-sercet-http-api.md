---
title: 提升接口API的安全等级
tags: http
categories:
  - 前端
  - http
thumb_img:
  - http.jpg
date: 2018-05-16 17:00:13
---

{% asset_img http.jpg %}
近期，公司老板发起一个关于api设计、安全签名的探讨...，然后就有一项课后作业：
> 有什么方式能提升api的安全

## 看看别人家怎么做的？
自身经验不多，来简单看下[微信的access_token机制来思考下](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)，我们有哪些可以学习。

{% asset_img wx.png 简易的用户授权过程 %}

1. 用户除了主动授权，没有暴露过其他敏感信息--Oauth2
2. 授权获取的code具有**唯一性**和**过期性**
3. 授权过程中的redirect_uri，微信会对授权链接做正则强匹配校验（server要是使坏，就把你close掉）
4. server事先有后续获取access_token提供请求参数sercetKey（必须只保存在服务器，不允许传给客户端）
5. 微信信任的access_token，调用有**次数限制**，和**有效期**

## 具体到我们，能做什么
### 使用https代替http方式

### 提供权限控制
对于公用的服务，你必须是某某权限才能访问这些api，可能你没有登录什么都干不了。
比如，只有服务端才能获取微信的token，因为服务端才有secretKey等条件

### [使用JWT](https://github.com/auth0/node-jsonwebtoken)
1. 规范化security tokens机制
2. 服务端可以配置sercetKey（salt），增加破解难度
3. 具有过期性质的配置，可能你不需要在弄个缓存服务来做超时这事
备注，需要服务端产生JWT给client。避免客户端自己生成

### 特殊API给予特殊控制
防止一些敏感接口重复调用，高频调用等情况发生

### 参数验证
不要相信前端提交的表单，或者接口携带的参数不会出什么问题。
保不齐传个负数，丢个0给你处理。甚至于留个超大的文件塞爆你的库

### 注意敏感信息的请求方式
账号密码等名该应该放置于request body里，或header中

### 注意请求头的Content-Type
比如：上传图片，必须是image/jpeg，你gif、png不行，其他更不行。
Access-Control-Allow-Origin，允许哪些跨域网站可以访问我们支援。

### 使用REST来规范你的接口
1. 限制Http方法
    根据Restful接口的规范，万物皆资源，获取的方法需要特定的方式。
    GET 用来获取资源，
    POST 用来新建资源（也可以用于更新资源），
    PUT 用来更新资源，
    DELETE 用来删除资源...
2. 提供更丰富的Http status code
3. 提供*友好的*错误提示
    不要提示详细，具体的错误细节给到client。那只存在日志或其他地方

## 参考
> https://www.owasp.org/index.php/REST_Security_Cheat_Sheet
  [RESTful API Authentication Basics](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)
  [How to Secure Your REST API using Proven Best Practices](https://stormpath.com/blog/secure-your-rest-api-right-way)
  [header的安全配置指南](https://www.cnblogs.com/doseoer/p/5676297.html)
  [REST 架构该怎么生动地理解？](https://www.zhihu.com/question/27785028)
  [REST的许多文献](https://github.com/aisuhua/restful-api-design-references)
  http://tool.oschina.net/commons/
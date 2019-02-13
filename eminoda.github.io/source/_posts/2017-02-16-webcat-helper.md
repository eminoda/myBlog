---
title: 微信开发指南
tags: 微信
categories:
  - 开发
  - 微信
date: 2017-02-16 18:42:41
thumb_img: webcat.png
---


{% asset_img start.png %}

## 为什么要写这个？
反正和微信相关开发，我是怕了。到现在都没有明白什么是公众号，什么是服务号，开放平台和公众平台有啥区别？
官网文档有时候个别地址还404；
由于自己没有公司账号权限，每次还要让他们运营扫码登录，烦的一笔；
所以特别记录下，方便自己和大家查阅。有什么不对的，请qq我改正:wrench:

## 接口文档地址
- [公众平台 https://mp.weixin.qq.com](https://mp.weixin.qq.com/)
- [开放平台 https://open.weixin.qq.com](https://open.weixin.qq.com/)
- [公众平台 doc](https://mp.weixin.qq.com/wiki)
- [开发平台 doc](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
- [JS-SDK doc](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)
- [网页授权 doc](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)

## 公众平台设置
### 设置开发者权限
如果你没有这样做再使用微信客户端是获取不到相关信息的
{% asset_img auth-1.png 左侧开发菜单 %}
{% asset_img auth-2.png web开发者工具 %}
{% asset_img auth-3.png 绑定相关微信号 %}

### 相关域名设置
{% asset_img domain-1.png 授权入口 %}
{% asset_img domain-2.png 核心3种授权方式 %}

1. 业务域名
设置业务域名后，在微信内访问该域名下页面时，不会被**重新排版**。（比如：如下图一些非法不安全的提示。）
{% asset_img domain-3.png 业务域名 %}

2. JS调用域名（JSSDK）
你在哪些域名下，可以调用微信的SDK，使用微信提供的接口，友情提示：**可设置顶级域名**
{% asset_img domain-4.png js-sdk安全域名调用 %}

3. 网页授权域名
**貌似不能设置顶级域名，自行做页面中间跳转**（由于域名固定，所以只能自己写重定向地址完成特殊需求跳转）
{% asset_img domain-5.png 回调网页授权 %}

4. 设置白名单
开发>基本设置>设置白名单，不然微信不会平白无故接受你的请求
{% asset_img domain-6.png white list %}

### JSSDK使用步骤
1. 绑定域名
    先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
    {% asset_img domain-7.png 你看坑不？和上面JS调用域名有什么区别，我好烦躁 %}
    {% asset_img domain-8.png white list %}
2. 引入JS文件
    http://res.wx.qq.com/open/js/jweixin-1.2.0.js
3. 通过config接口注入权限验证配置（附录有Q&A）
    [config配置](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)

## 开放平台设置
### 设置回调域名
{% asset_img back-1.png 进入网站应用 %}
{% asset_img back-2.png 回调网页授权 %}

## 授权方式地址
### [公众平台](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)
> https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect 

### [开发平台（扫码）](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
> https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect

### 参数说明（参考，具体api文档查阅）
|参数|是否必须|说明|
|-|-|-|
|appid|是|公众号的唯一标识|
|redirect_uri|是|授权后重定向的回调链接地址，**请使用urlEncode对链接进行处理**|
|response_type|是|code|
|scope|是|**snsapi_base** （不弹出授权页面，直接跳转，只能获取用户openid），**snsapi_userinfo** （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）|
|state|否|重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节|
|#wechat_redirect|是|无论直接打开还是做页面302重定向时候，必须带此参数|
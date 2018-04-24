---
title: 微信开发设置
date: 2017-02-16 18:42:41
tags:
  - 微信
categories: 微信
comments: true
---

## 文档地址
1. [公众平台 https://mp.weixin.qq.com](https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token=205458716)
2. [开放平台 https://open.weixin.qq.com](https://open.weixin.qq.com/)
3. [公众平台doc](https://mp.weixin.qq.com/wiki)
6. [开发平台doc](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
4. [JS-SDK](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)
5. [网页授权](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)

## 公众平台设置
**由于没有自己的生产账号，保存截图以做记录**
### 开发者权限
{% asset_img 1.png 左侧开发菜单 %}
{% asset_img 2.png web开发者工具 %}
{% asset_img 3.png 绑定微信号 %}

### 回调授权设置
  {% asset_img 4.png 授权入口 %}
  {% asset_img gzh.png 授权种类 %}

  1. 业务域名
    设置业务域名后，在微信内访问该域名下页面时，不会被**重新排版**。
    {% asset_img gzh2.png 业务域名 %}

  2. JS调用域名（JSSDK）
    **可设置顶级域名**
    {% asset_img 5.png js-sdk安全域名调用 %}
    JSSDK使用步骤：
    - 绑定域名
      先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
    - 引入JS文件
      http://res.wx.qq.com/open/js/jweixin-1.2.0.js
    - 通过config接口注入权限验证配置（附录有Q&A）
      [config配置](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)
  3. 网页授权域名
    **貌似不能设置顶级域名，自行做页面中间跳转**
    {% asset_img 7.png 回调网页授权 %}
  4. 设置白名单
    开发>基本设置>设置白名单
    {% asset_img 10.png white list %}
  
## 开放平台设置
### 设置回调域名
{% asset_img 8.png 进入网站应用 %}
{% asset_img 9.png 回调网页授权 %}

## 授权方式
### 公众平台
> https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect 

### 开发平台（扫码）
> https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect

## 参数
|参数|是否必须|说明|
|-|-|-|
|appid|是|公众号的唯一标识|
|redirect_uri|是|授权后重定向的回调链接地址，**请使用urlEncode对链接进行处理**|
|response_type|是|code|
|scope|是|**snsapi_base** （不弹出授权页面，直接跳转，只能获取用户openid），**snsapi_userinfo** （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）|
|state|否|重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节|
|#wechat_redirect|是|无论直接打开还是做页面302重定向时候，必须带此参数|


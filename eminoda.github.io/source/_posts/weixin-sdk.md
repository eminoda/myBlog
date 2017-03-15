---
title: 微信JS-SDK问题
date: 2017-03-15 14:54:45
tags:
  - 微信
categories: 微信
comments: true
---

## 分享图片显示不出？
1. 分享图片过大，请尽可能的小。几百kb部分手机分享出去显示不全（建议几十kb）
2. 分享描述文案字数过多。（建议20字左右）
{% asset_img 1.png 分享图片 %}

## signature签名生成
1. [线上验证工具](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign)
2. 参数说明

|参数|说明|
|-|-|
|noncestr|随机字符串|
|timestamp|时间戳|
|url|当前网页的URL，**不包含#及其后面部分**|
|jsapi_ticket|票据|

{% asset_img 2.png 微信config初始化参数 %}


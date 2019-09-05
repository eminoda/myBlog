---
title: 微信JS-SDK开发中的问题
tags:
  - 微信
categories:
  - 开发
  - 前端开发
thumb_img: webcat-dev.png
date: 2017-03-15 14:54:45
---

微信社交目前是企业赚取用户流量不可缺少的一环，前端开发多多少少都要涉及一些。但是其中的坑真是要跪倒多少小朋友，你文档就不能搞搞好。看的心累。以下记录一些踩坑经验

## 分享图片显示不出？

1. 分享图片过大，请尽可能的小。几百 kb 部分手机分享出去显示不全（建议几十 kb）
2. 分享描述文案字数过多。（建议 20 字左右）
   {% asset_img 1.png 分享图片 %}

## 分享图片的 ImgUrl 的请求头包含 WeChat

可能你的服务器用了 nginx，对不同端做了拦截分流，请别忘了加这个 userAgent

```
  if ( $http_user_agent !~* "(Mobile|Android|iPad|iPhone|iPod|WeChat|BlackBerry|Windows Phone)" ) {
    rewrite ^/ http://www.xxx.com? last;
  }
```

## 禁用微信返回

{% asset_img inhibit-header.png %}
图上有个返回 button，可以做隐藏

```
history.pushState(null , null , window.location.href),
window.onpopstate = function(e) {
    history.go(1)
}
```

## 调用 sdk 中生成的 signature 签名不正确

1. [线上验证工具](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign)
2. 参数说明

| 参数         | 说明                                    |
| ------------ | --------------------------------------- |
| noncestr     | 随机字符串                              |
| timestamp    | 时间戳                                  |
| url          | 当前网页的 URL，**不包含#及其后面部分** |
| jsapi_ticket | 票据                                    |

{% asset_img 2.png 微信config初始化参数 %}

## SPA 单页面微信分享验证失败

[文档中有涉及，但是你懂的](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)
{% asset_img spa.png %}

原因估计是因为单页面应用基本采用 hash 模式（#），然后微信不认为你浏览器地址发生了变化。然后在跳转页面路由的时候，记录的还是上一个页面的 url，导致**config 接口注入权限验证配置**失败。

具体解决方法（提供 vue 解决方案）

```js
// 提供一个路由拦截
routers.beforeEach((to, from, next) => {
    // 未记录过
    if (!store.state.router.beforeUrl) {
        // 这里处理ios手机访问首页xxx/，router跳转为xxx/#/的问题
        store.state.router.beforeUrl = from && from.path === '/' ? window.location.href.split('#')[0] : window.location.href;
    }
    ...
}

// 生成signature中url的参数处理
// 安卓可能会识别url变化，所以安卓浏览器直接使用原生地址
utilService.getDeviceType() !== 'android' ? store.state.router.beforeUrl : window.location.href
```

## 可能同样的分享代码，会出现分享朋友圈 error，但是分享朋友 ok。

可能是我们代码问题，但也请改个良辰吉日再试试，说不定又好了。亲测过

## errMsg: "onMenuShareAppMessage:fail, the permission value is offline verifying"

先确定 config 参数正常的情况下，查看公众号等平台分享等功能是否有权限。可能账号权限过期，运营等迁移公众号主体等操作影响到了。

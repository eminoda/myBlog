---
title: Node 代理，解决开发测试环境服务器压力
tags:
  - node
categories:
  - 开发
  - 前端开发
comments: true
date: 2018-01-25 16:13:11
---

# 现状

接口调用后台 java 服务，用户登录状态机制通过 cookie 持久化。
本地开发，由于没有域名，所以用本地 host 解析，特殊约定 dev.xxx.com 和后台服务 cookie 存储域名建立一致关系。
测试环境是在 192.168.1.x 上，后台 cookie 配置改为 192.168.1.x。
so，造成的情况在测试虚拟机子上存在 2 套后台，分别对开发和测试提供**2 套**服务，不同的只是 cookie 配置不一样。起初一个网站很和谐，后台同学很乐意维护，现在 7788 很多个产品线需要维护，鬼 tm 会乐意（不过我们也这样做了 1 年多）。

{% asset_img 1.png 现状 %}

# 解决

gulp 构建项目时，用过[browsersync](https://browsersync.io/)，一个简单的 server，其中处理代理问题依靠[http-proxy-middleware](https://www.npmjs.com/package/http-proxy-middleware),webpack server 中也是一样的，以前没特别注意，然后因为这个现状问题，是否可以融入 Node，当然可行。
Node 作为中间服务接入前后端之间，完成类似 nginx 代理的功能。（没错，万能的前端具备这样的能力）

```
//以express举例，就那么几行
// 代理
var proxy = require('http-proxy-middleware');
app.use('*', proxy('/**', {
  target: 'http://192.168.1.65:9188',
  changeOrigin: true,
  onProxyReq: function (proxyReq, req, res) {
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['set-cookie']
  },
  cookieDomainRewrite: {
    '9niutest.com': '127.0.0.1'
  }
}));
```

# 结果

随着产线的扩大，后台的服务基本就是产线的个数，不会因为以前不优雅的配置导致双倍的维护和运行成本。
{% asset_img 2.png 未来的架构 %}

# 可能会遇到的问题

[代理服务器成功代理，但目标服务器没有响应](https://stackoverflow.com/questions/25207333/socket-hang-up-error-with-nodejs/25651651#25651651)

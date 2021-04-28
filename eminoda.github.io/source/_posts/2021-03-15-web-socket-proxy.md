---
title: 如何实现 WebSocket 反向代理？
tags:
  - websocket
  - nginx
  - webpack
categories:
  - 开发
  - 前端开发
date: 2021-03-15 17:25:59
---


# 前言

> 为什么要代理 WebSocket？

是这样的，因为我们有个基于 **electron** 的桌面应用，他在本地提供 **http** 和 **websocket** 两个服务，客户端（浏览器）可以使用这些服务来完成一些核心业务需要。

问题是，目前该应用只支持 **windows** 平台，虽然生产环境对环境有所要求，但部分开发却是 **mac** 电脑，无法安装该客户端，总不能要求开发者安装个虚拟机，或者尽快开发个 **mac** 版，无论硬件还是软件，搭建开发环境的成本都太高。

于是设想在一台 **windows** 电脑上共享桌面应用服务，在测试环境做请求代理，以便持有 **mac** 或者安装应用有问题的同学进行无障碍快速接入。

这篇就讲下如何配置 **webpack** 和 **nginx** 来完成这样的“小工程”。

# 环境配置

## 架构图

下图主要示意了如下几个方面：

- 桌面服务被安装在可用的 windows 机器上
- 开发环境通过配置 **webpack** 进行请求转发
- 对于 **mac** 平台及不适配的情况，统一通过 **nginx** 进行请求转发

{% asset_img 环境架构图.png 跨平台 socket 代理策略 %}

## webpack-dev-server

项目基于 **vue-cli**，首先需要对 **vue.config.js** 中 **webpack** 的代理部分进行修改。

先设置 **VUE_APP_PROXY_URL**，定义目标转发环境的（IP）地址，再添加 **VUE_APP_PROXY_PLATFORM** 决定是否开启转发功能。

```shell
# env.local
VUE_APP_PROXY_PLATFORM = mac
VUE_APP_PROXY_URL = 192.168.1.x:81
```

```js
// vue.config.js
var proxy = {
  // 后端服务
  ['/api']: {
    target: process.env.VUE_PROXY_API,
  },
};

if (VUE_APP_PROXY_PLATFORM == 'mac') {
  proxy = Object.assign(proxy, {
    // 桌面应用 http 服务
    ['/app-api']: {
      target: 'http://' + process.env.VUE_APP_PROXY_URL,
    },
    // 桌面应用 websocket 服务
    ['/app-ws']: {
      target: 'ws://' + process.env.VUE_APP_PROXY_URL,
      ws: true, //开启 websocket 支持
      pathRewrite: {
        '^/app-ws': '/',
      },
    },
  });
}
module.exports = {
  // ...
  devServer: {
    host: '0.0.0.0',
    port: port,
    open: true,
    proxy: proxy,
  },
};
```

接下来只要在业务代码中，添加对应 **/app\*\*** 前缀来匹配代理规则即可。

## nginx

**nginx** 端配置简单，只需要对协议进行升级即可：

```shell
server {
  listen  81;

  # http 代理
  location /app-api/ {
    proxy_pass http://192.168.1.y:18455/;
  }

  # websocket 代理
  location / {
    proxy_pass http://192.168.1.y:18455/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
  }
}
```

# 最后

本文主要记录我在遇到这个问题时，实施的解决方案，但不具备通用性。不过也希望为有遇到类似场景问题的同学提供一个方向的解决思路。

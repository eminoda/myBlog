---
title: 开发中如何接入 HRM 到服务端
tags:
  - webpack
  - hmr
categories:
  - 开发
  - 前端开发
thumb_img: webpack.png
---

## 谈下开发

webpack 的 HMR 都用过，但简单入门的都是依靠 webpack-dev-server ，如果你是个全栈开发，必然会有个 node 服务，那一个粗暴的项目模式将是这样：

{% asset_img development-mode.png 粗暴的开发模式 %}

这样就存在两个 Http 服务（webpack-dev-server 自带的 express 服务、和 node 服务）

当然如何你项目稍稍“复杂些”，可能要用 node 做服务端渲染，这样 express 的 html 静态资源就要挪到 node 服务中，经过几个中间件的穿透，效率是不是会慢？

如果觉得服务地址太多，是不是要用 webpack-dev-server 配置个 proxy ，来统一服务地址？

...

诸如此上的问题，想要精简开发模式，最快的就是去掉一个服务（本身就有些累赘），去除后怎么实现 HMR （脱离了 webpack-dev-server）？

先看下如下开发模式：

{% asset_img development-mode2.png 精简的开发模式 %}

优化点：

- 去除 express 服务，整个开发模式依靠原有的 node 服务（减少硬件资源）
- 单服务，服务地址唯一（服务地址好管理配置）
- 整合相关开发中间件（集中透明管理）

下面逐步看下如何来实现这套开发模式。

## webpack-dev-middleware

## webpack-hot-middleware

### eventsource 通讯

## koa 的兼容方式

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [koa2 + webpack 热更新](https://www.cnblogs.com/liuyt/p/7217024.html?utm_source=itdadao&utm_medium=referral)
- [JS 实时通信三把斧系列之三: eventsource](https://www.jianshu.com/p/3d7b0bbf435a)

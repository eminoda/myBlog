---
title: webpack 构建提速
tags: webpack
categories:
  - 开发
  - 前端开发
thumb_img: webpack.png
---

# 前言

代码构建速度，极为影响开发体验，随着项目代码的增多，原先构建时没有暴露的问题现在倍数级放大。

你随手改个 css ，js 代码整个项目就要 pending 半分钟之多，简直无法忍受，借这个契机，了解 webpack 构建优化方式，并做些提速优化方案。

# 项目说明

再次声明，当然这篇的目的不是指出业务代码的不足（我都想重构了），而是单从构建角度看能否对构建的编译速度有所提升。

在优化之前，先说下这个项目的一些细节：

## 技术栈

这是一个 PC 端的“老”项目，为了兼容性主技术还是 jquery。

第三方 js 依赖集成了：juicer、numeral、moment 等常见工具库。

选用 sass 作为 css 预编译语言。

## 目前构建速度

首次编译：43367ms

再次编译：32595ms

你能感受到其中的绝望吧？

## 文件数量

业务需要，此项目除了服务客户的基本操作外，还负担 SEO 等需求，一个多页面应用，并且服务端渲染输出。

构建 entry 入口文件数量约为：53 个

## 优化方向

利用 webpack-bundle-analyzer 先看下目前项目各个模块的情况。

webpack-bundle-analyzer 是个 webpack 可视化分析工具。

```js
// 在 webpack plugins 注入进去，最后打开默认的 http://127.0.0.1:8888 即可查看
plugins: [new BundleAnalyzerPlugin()];
```

{% asset_img analyzer.png analyzer %}

# 总结

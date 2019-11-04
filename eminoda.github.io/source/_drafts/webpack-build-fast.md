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

你随手改个 css ，js 代码整个项目就要 pending 半分钟之多，简直无法忍受，借这个契机，了解 webpack 构建优化方式，并实践些提速优化方案。

# 项目说明

再次声明，当然这篇的目的不是指出业务代码的不足（我都想重构了），而是单从构建角度看能否对构建的编译速度有所提升。

在优化之前，先说下这个项目的一些细节：

## 技术栈

- jquery：这是一个 PC toB 端的“老”项目，无法割舍部分低版本浏览器的份额（IE 8）
- 第三方库： 集成了 juicer、numeral、moment 等常见工具库。
- sass：选用 sass 作为 css 预编译语言。

## 目前构建速度

- 首次编译：43367ms
- 再次编译：32595ms

你能感受到其中的绝望吧？

## 文件数量

由于业务需要，此项目除了服务客户的基本操作外，还负担 SEO 等需求，一个多页面应用，并且服务端渲染输出。

构建 entry 入口文件数量约为：53 个

## 优化方向

利用 **webpack-bundle-analyzer** 先看下目前项目各个模块的情况。

**webpack-bundle-analyzer** 是个 webpack 可视化分析工具。

```js
// 在 webpack plugins 注入进去，最后打开默认的 http://127.0.0.1:8888 即可查看
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

plugins: [new BundleAnalyzerPlugin()];
```

{% asset_img analyzer.png 分析结果 %}

根据上图，我们大致能看到该项目代码打包后情况：

- 根据不同 entry 入口数量，输出的 chunks 文件同样为 53 个（文件数量）
- 未压缩下，所有输出 js 文件大小基本都大于 500kb ，最高超过 900kb（文件大小）
- 每个 chunks module 下都包含一个 jquery.js 文件，以及内部有部分 node_modules 依赖引用（文件依赖）
- css 在每个 module 也占有一定的比重（文件依赖）

# 总结

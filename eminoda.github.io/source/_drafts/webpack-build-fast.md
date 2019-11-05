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

- 首次编译：43.8 秒
- 再次编译：32 秒

你能感受到其中的绝望吧？

## 文件数量

由于业务需要，此项目除了服务客户的基本操作外，还负担 SEO 等需求，一个多页面应用，并且服务端渲染输出。

构建 entry 入口文件数量约为：53 个

# 怎么优化

你可以随便搜索下，遍地都是 webpack 的构建优化策略，但我们需要根据自己的项目来分析，直接切入问题要点。

介绍两款分析工具：

## webpack-bundle-analyzer

**webpack-bundle-analyzer** 是个 webpack 可视化分析工具。利用 **webpack-bundle-analyzer** 先看下目前项目各个模块的情况。

它的安装非常简单：

```js
// 在 webpack plugins 注入进去
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

plugins: [new BundleAnalyzerPlugin()];
```

等待 webpack 构建，最后打开默认的 http://127.0.0.1:8888 查看即可。

{% asset_img analyzer.png 分析结果 %}

从矩形树图 Treemap 中，我们能大致得到这些信息：

- 每个模块文件很大，原始文件目测都 600 kb 以上，即使压缩了也要 130 kb。（对比了手淘的 js 文件，大了五倍以上）
- 每个模块内部至少一半是 jquery.js 的依赖
- 由于入口文件的数量关系，输出的模块也有 50 个以上

## webpack 自带 profile 分析

profile 这是 webpack 自带的 options ，直接在运行脚本加入即可：

```js
webpack --progress --config build-fast/webpack.dev.conf.js --profile --json > profile.json
```

它会对每个模块的构建过程进行打点，最后生成一个 json 文件，把这个文件上传至网站 [http://webpack.github.io/analyse/#home](http://webpack.github.io/analyse/#home) 即可分析出整个构建过程的详细数据。

{% asset_img profile1.png 分析概况 %}

整个构建耗时 43.8 秒。参与的模块总共有 310 个（js、css、image），chunks 54 个，导出的 assets 292 个。

{% asset_img profile2.png 模块间依赖关系图 %}

整体看，模块的依赖程度还是不小的。

{% asset_img profile3.png 309个模块的使用情况 %}

就前 20 多个 modules 文件，几乎被所有的 chunks 所使用。

{% asset_img profile4.png 单模块多 chunks 的使用情况 %}

这图是上图的进一步具体分析，能看到使用最多 modules 的情况（引用次数、大小）

{% asset_img profile5.png 耗时模块 %}

能看到个别大模块的占用耗时

## 汇总下

根据这两个工具，就已经对这个项目“就诊”完毕了。来看下具体问题：

- 第三方依赖占比过重

  以 jquery 为主，没有从业务代码剥离出去，并且一个未压缩的 jquery 文件占了至少一半大小空间。

- 没有公共依赖资源

  相当一部分 module 被多个 chunks 多次引用，并且累计大小不可忽视。

- css 的编译处理

  sass 被 loader 解析时，耗时过长。

- webpack 版本过低 3.12

  目前 webpack 已到 4x ，5x 都在 beta 阶段，可以考虑升级。

那么根据这几个大点，外加一些优化策略开始对这项目构建进行加速。

# externals 外链第三方依赖

**时间：43.8s -> 40.8s**

externals 是常用优化手段。构建时，将依赖文件相关从 node_modules 导入改为外部链接引用（即 script 标签 cdn 加载方式）

```js
externals: {
  jquery: 'jQuery',
  $: 'jQuery',
  juicer: 'juicer',
  numeral: 'numeral',
  moment: 'moment',
  echarts: 'echarts'
},
```

{% asset_img externals.png 取出依赖文件后 %}

最大的 js 编译后降到了 421 kb （大小减了 30%）

# 替换 css 编译工具

**时间：40.8s -> 35.8**
用 fast-sass-loader 替换 sass-loader

```js
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'fast-sass-loader?sourceMap=true']
}
```

**为什么 fast-sass-loader 那么快？**

fast-sass-loader 将 sass 文件扁平化使 node-sass 不会重复编译同个文件，编译前会对所有的文件进行合并，按照一个大文件进行编译，同时内部有 cache 机制针对每个 entry 文件。

使用了 fast-sass-loader 就不用使用 resolve-url-loader 来解决 sass-loader 路径引用的问题。

# 使用 CommonsChunkPlugin 提取公共代码

**时间：35.8s -> 27.9**

{% asset_img externals-common.png 提取去公共代码后 %}

最大的 js 编译后降到了 285 kb （大小又减了 30%）

{% asset_img profile-commonplugins.png 模块依赖 %}

模块依赖问题对比刚开始明显减少，继续优化。

# babel-loader 优化

**时间：27.9s -> 21.6s**

设置 babel-loader 编译过程中需要解析的路径，以及排除 node_modules 相关依赖；

同时加上 cacheDirectory 开启缓存。

```js
{
  test: /\.js$/,
  exclude: /(node_modules)/,
  include:/(js)/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        [
          'es2015',
          {
            loose: true
          }
        ]
      ]
    }
  }
}
```

# 开启多线程

**时间：21.6s -> 18.3s**

虽说开启多线程会加快编译的速度，但就目前情况而言减少幅度很少，不像网上那么明显。

考虑原因是，基本已经优化的差不多了，代码编译已经瞬时可以完成了，不再需要多线程的帮助了。开启多线程还会增加额外的判断。

# 总结

[详解 CommonsChunkPlugin 的配置和用法](https://segmentfault.com/a/1190000012828879)

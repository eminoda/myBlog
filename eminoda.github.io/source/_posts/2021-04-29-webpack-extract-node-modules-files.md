---
title: 小技巧，如何使用 webpack 降低前端资源文件维护成本
tags: webpack
categories:
  - 开发
  - 前端开发
date: 2021-04-29 01:55:38
---


## 前言

前端现在开发某个常见功能，直接会在 **npm** 找到合适的包，这些包存在于 **node_modules** 目录下。

如何减少包体积，用下 CDN 加速，或者这个模块只有 **script** 标签导入方式时，直接从 **node_modules** 拷贝文件到项目 **public** 资源目录中是常见的**懒操作**，久而久之，那个目录文件会非常多，尤其当这个项目成为“历史项目”后，那堆文件会变得让后人难以维护。

下面将介绍 2 个小技巧，如何使用 **webpack** 的 **copy-webpack-plugin** 和 **script-loader** 来优化 **node_modules** 文件和项目依赖关系，来降低日后的维护成本。

## copy-webpack-plugin

这是个简单的文件复制工具插件，用于把某文件从 A 目录 copy 到 B 目录。

原先我们手工拷贝流程如下：

1. 在资源文件夹（dist/public）新建 **libs/js/jquery** 目录
2. 把 **node_modules** 下的 jquery 相关依赖复制到上述目录中

{% asset_img copy-old.png %}

似乎没什么问题，一两个文件影响不了项目可读性，但对于一个老项目来说乱七八糟的 js 依赖，以及完全脱离工程化的构建方式是极具风险的，万一哪天谁删资源跑路，都是隐患。

我不会告诉你，我在 pdfjs-dist 中引入 cmaps 文件夹提交了多少文件，强迫症表示接受不了。

对于 **copy-webpack-plugin** 使用也非常简单，毕竟现在 **webpack** 都到 5 了：

```js
plugins: [
  new CopyPlugin({
    // 输出路径默认 output.path 下
    patterns: [{ from: 'node_modules/jquery/dist', to: 'js/libs/jquery' }],
  }),
];
```

{% asset_img copy-new.png %}

这样，项目目录就变得清爽多了，也不用了继续维护相关的资源文件内容了，每次打包构建都交给 **webpack** 帮我们从 **node_modules** 找到资源文件。

并且，根据需要可以详细设置目标文件的路径，使项目以后可以灵活调整，减少维护成本。

哦对了，如果你还在用 **webpack4** ，此插件不要使用 7 和 8 两个版本。

## script-loader

上面使用 **copy-webpack-plugin** 插件只是变相的对项目进行**工程化管理**，实际输出到资源目录的文件还是一样；但下面说的 **script-loader** 将减少实际资源目录物理文件数量，从而使项目文件量“瘦身”。

以通过 **webpack** 的 **externals** 引入 **jquery** 模块举例：

```js
externals: {
    jquery: 'jQuery',
},
```

```js
import $ from 'jquery';
```

像上述用法会在 **html** 中额外添加 **script** 以加载 **jquery** 文件，同时对应的资源文件目录会有这个 **jquery.js** 文件存在，但有时我们希望减少这样的物理文件的存在，更希望把 **node_modules** 中的依赖集中打包到项目 **bundle.js** 中。

**webpack** 的 **loader** 提供 [**Inline** 方式](https://webpack.js.org/concepts/loaders/#inline)，使之我们不用再 **module** 中编写对应的规则：

```js
import $ from 'script-loader!jquery/dist/jquery.js';
```

这样，我们减少了物理文件数，同时**使某些插件功能更集中在业务代码中，减少某些外界变化导致依赖功能的不可用**。

## 最后

上面两个方法都很常见，我最近在看 **pdfjs-dist** 模块的 **Demo** 时看到了这样的使用便拿来和大家分享。

有时候我们追求不是技术的高深和多样，能用最简单的技术方案在某个场景解决问题才是有经验开发者应该具备的能力。

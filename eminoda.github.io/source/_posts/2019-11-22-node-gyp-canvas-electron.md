---
title: windows 安装 node-gyp 报错：解决 electron 调用 canvas
tags:
  - electron
  - node
categories:
  - 开发
  - 前端开发
thumb_img: node.png
date: 2019-11-22 14:41:22
---

# 前言

近日做个 electron 项目，涉及使用 canvas 模块。然后调用 canvas 时，就报如下错误：

```js
xxx canvas.node was compiled against a different Node.js version using
NODE_MODULE_VERSION 72. This version of Node.js requires
NODE_MODULE_VERSION 75. Please try re-compiling or re-installing
```

{% asset_img different-version.png %}

现代浏览器中 canvas 只是个普通的 api ，我们直接用就行了。但在 node 端，一切就变得不怎么容易了。

我尝试通过 nvm 更新 node 版本（12.13.1），结果如上图，NODE_MODULE_VERSION 还是比 electron 的低。

看样子这个问题没那么容易，接下来就开始了“漫长”的环境配置过程，接下来我会对每个阶段的插件安装过程做详细描述。

# electron-rebuild

遇到问题找官网，electron 文档上的确有一篇些关于[“使用 Node 原生模块”](https://electronjs.org/docs/tutorial/using-native-node-modules)的文章。

> Electron 支持原生的 Node 模块，但由于 Electron 非常有可能使用一个与您的系统上所安装的 Node 不同的 V8 引擎，您所使用的模块将需要被重新编译。

然后我兴冲冲的安装了 **electron-rebuild** ，原以为问题到此结束。

```shell
npm install --save-dev electron-rebuild

# 每次运行"npm install"后，也运行这条命令
./node_modules/.bin/electron-rebuild

# 在windows下如果上述命令遇到了问题，尝试这个：
.\node_modules\.bin\electron-rebuild.cmd
```

结果这只是开始：

{% asset_img rebuild-failed.png %}

# node-gyp 安装

错误都是从 **node-gyp** 报出来的，也就是说 canvas 是个原生模块（非 js 语言的第三方插件）。

自打我第一次用 node.js 起，sass 的安装就差点让我从入门到放弃，就是因为这个“臭名昭著”的 **node-gyp** 。

以前 sass 的问题可以通过 cnpm 解决，但这次不同，不得不把 **node-gyp** 的环境整一整了。

## windows-build-tools

node-gyp 需要些三方的支持（Visual C++，python ...），当然市面上有集成好的工具，让我们快速的准备好这些环境。

这个就是 **windows-build-tools** ，一个用于 windows 平台的环境构建工具。

```js
npm install --global windows-build-tools
```

只要我们把它安装在全局即可，稍作等待，后续它为我们安装好一系列的插件：

{% asset_img tools.png %}

## python 字符设置

虽然 **windows-build-tools** 为我们安装了 **python** ，但为了避免不必要的麻烦，我建议你事先安装好 python2 。

后续执行 electron-rebuild 还会遇到 **字符编码的错误**，下面我来说下怎么处理（虽然临时学的）

```js
UnicodeDecodeError: 'ascii' codec can't decode byte 0xe5 in position 0: ordinal not in range(128)
```

当你遇到编码问题时，你需要把默认的 ascii 编码设置为 gkb （如果你设置 utf8 没用的话）

不可能每个文件都设置编码，对此我们需要全局范围内修改 python 的编码模式。那怎么做呢？

找到对应 python 的目录，在 xxx\Python27\Lib\site-packages 下，新建文件 **sitecustomize.py** ，内容如下：

```py
# set system default encoding: utf-8
import sys

reload(sys) # 可能不需要
sys.setdefaultencoding('gbk')
```

最后你可以通过命令行试下是否生效：

{% asset_img python-encoding.png %}

## GTK2

node-gyp 后续还需要 GTK2 和 libjpeg-turbo 插件的支持，相比前面基本没什么难度，只要“仔细”些。

node-canvas 只是基于 cairo 的实现，同时为了让 electron-rebuild 能重新编译 canvas ，则需要包含 cairo 的运行时代码，而这些是由 GTK 提供。

你只要到官方提供的网站下载即可：

- win32
  - http://ftp.gnome.org/pub/GNOME/binaries/win32/gtk+/2.24/gtk+-bundle_2.24.10-20120208_win32.zip
- win64
  - http://ftp.gnome.org/pub/GNOME/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip

为了避免不必要的麻烦，一定注意如下两点：

- 明确所属电脑是 32 位还是 64 位
- 点击下载的 exe 后，后续操作全局采取默认配置

当然你直接编译，还是会出错，因为还需要个 libjpeg-turbo ：

{% asset_img jpeg.png %}

## libjpeg-turbo

为了能支持 JPEG 格式的文件，还需要 libjpeg-turbo 插件，同样安装也很简单。

[下载地址](https://sourceforge.net/projects/libjpeg-turbo/files/) ：

https://sourceforge.net/projects/libjpeg-turbo/files/2.0.0/libjpeg-turbo-2.0.0-vc.exe/download

为了避免不必要的麻烦，一定注意如下两点：

- 请选择 2.0.0 中的 vc.exe 版本
- 区别 GTK2 插件，不要选择对应的 32 或者 64 位对应的版本，因为后面实际运行中，会出现文件找不到的问题

## 重新编译

一切顺利的话，你将在 C 盘中看到如下两个新目录：

{% asset_img result.png %}

最后在执行 electron-rebuild 的重新编译命令：

{% asset_img success.png %}

ok，node-canvas 编译成功，后续调用没有再报错。

## 总结

这篇可能阅读下来不足 5 分钟，但实际解决这个问题，我是花了整个下午。个人是非常厌倦解决这类环境问题，但侧面也反应出自己知识面的浅薄，毕竟只会 js 。

最后希望能帮助到类似问题的同学，如果你克服了这问题，可以点个赞哟。

另外，如果你 cmd 控制台出现乱码问题，可以试下控制台直接运行： chcp 65001 。

# 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [node-canvas windows](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows)
- [node-gyp windows](https://github.com/nodejs/node-gyp#on-windows)

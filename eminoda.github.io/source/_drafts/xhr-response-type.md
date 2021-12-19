---
title: XHR 请求怎么下载图片资源 | 前端查漏补缺
tags:
---

# 前端为何要解析图片资源

通常对于前端开发者来说，页面 HTML 中通过 img 标签来内嵌图片资源是家常便饭了，如果需要资源文件的下载，往往由后端提供一个下载链接，然后通过 a 标签进行“无脑”跳转即可。

但往往真实的场景更需要前端通过 XHR 接口来获取图片资源，再做页面显示或者下载操作。比如：

- 请求需要 token 授权，而 img 标签可没法自定义 header
- 客户端页面有多个下载入口，业务上需要整合资源做合并压缩下载
- ...

对于刚入门前端的开发来说，这可比原先要复杂多了。这篇只是查漏补缺，如果你经验丰富可以给我提点宝贵意见，真心的希望所有人能有所收获。

# 如何通过 XHR 来解析图片资源

先说下思路：

1. 通过 XHR 来发送图片资源的请求，定义 responseType 来约定响应回来的内容。
2. 如果是图片预览，借助 Blob 生成图片的 base64， img 引用该值作为 src 即可。
3. 如果是下载，则通过 a 标签的 download 属性来触发浏览器下载功能。

## XHR 中的 responseType

## 图片转 base64

## a 标签的下载

# 不点到为止，来点干货

## ArrayBuffer 和 Blob

https://github.com/noahunallar/arraybuffer-vs-blob

## arraybuffer to blob

https://www.zhuyuntao.cn/js%E4%B8%ADarraybuffer%E4%B8%8Eblob%E7%9A%84%E5%8C%BA%E5%88%AB

## FileSaver.js

## StreamSaver.js

https://juejin.cn/post/6971072490562928648

https://juejin.cn/post/6844904029244358670

## 图片8倍

https://www.cnblogs.com/goloving/p/15305312.html

https://javascript.info/arraybuffer-binary-arrays

https://stackoverflow.com/questions/54236981/when-to-use-uint8array-uint16array-uint32array
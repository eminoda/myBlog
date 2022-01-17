---
title: 怎么通过 XHR 方式来处理图片资源的响应
tags: xhr
categories:
  - 开发
  - 前端开发
post_img:
  bg_color: '#fec830'
  title: XHR.responseType
  title_color: '#fff'
  sub_title: 如何通过 XHR 方式来请求图片资源
  sub_color: '#fff'
date: 2021-12-23 01:01:58
---




# 前端为何要解析图片资源

通常对于前端开发者来说，页面 **HTML** 中通过 **img** 标签来内嵌图片资源是家常便饭了，如果需要资源文件的下载，往往由后端提供一个下载链接，然后通过 **a** 标签进行“无脑”跳转即可。

但真实的场景往往更需要前端不得不通过 **XHR** 方式来获取图片资源，比如：

- 请求需要 **token** 授权，而 **img** 标签可没法自定义 **header**
- 业务上需要前端整合资源做下载功能
- ...

对于刚入门前端的开发来说，这可比原先要复杂多了。这篇将说明如何通过 XHR 来请求图片资源，如果你经验丰富可以给我提点宝贵意见，在此真心地希望所有人能有所收获。

# 如何通过 XHR 来解析图片资源

先说下思路：

1. 通过 XHR 来发送图片资源的请求，定义 **responseType** 来约定响应回来的内容。
2. 如果是图片预览，借助 **Blob** 生成图片的地址， **img** 引用该值作为 **src** 即可。
3. 如果是下载，则通过 **a** 标签的 **download** 属性来触发浏览器下载功能。

## 有哪几种 XHR responseType

平时常听到的 **Ajax** 这词，就是通过 **XHR（XMLHttpRequest）** 对象得以实现的。在 **XHR** 中有个 **responseType** 属性，依靠它可以更改服务端的响应类型。

**responseType** 共有如下可选值：

- text: DOMString 对象中的文本
- arraybuffer: 二进制数据的 ArrayBuffer 对象
- blob: 二进制数据的 Blob 对象
- json: 返回数据转 JSON 对象
- document: HTML 的 Document 对象
- ms-stream: （ie 专属）

我们先看下：浏览器直接访问一个图片地址和 **img** 标签内嵌图片地址，他们返回头信息区别：

{% asset_img responseType-browser.png 浏览器直接请求 %}

{% asset_img responseType-image.png img标签内嵌 %}

这两种方式都依靠浏览器和 **img** 标签的特性约定了 **Accept** 接收内容的类型，并且都展示出了图片。而我们都不能在此之上针对最开始说的业务场景做什么特别处理，那怎么通过 **XHR** 方式来展示图片呢？

先看下，直接使用 **axios** 默认配置请求图片地址有什么效果（不设置 responseType）：

```js
const imageSrc = "http://127.0.0.1:3000/image/google.png";

axios
  .get(imageSrc, {
    responseType: "", //text
  })
  .then((response) => {
    const data = response.data;
    console.log("text:", data);
  });
```

默认 **responseType** 不定义的话和 **text** 是一个效果，返回的图片内容被转成了字符串，也就是下面看到的乱码：

{% asset_img responseType-text.png  xhr直接请求 %}

显而易见，也只有 **responseType** 为 **arraybuffer** 或者 blob 时才能得到二进制的“原始数据”。

## 解析二进制数据

我们选用相对复杂的 **arraybuffer** 进行示例：

首先将 **responseType** 设置为 **arraybuffer** 进行请求：

```js
axios
  .get(imageSrc, {
    responseType: "arraybuffer",
  })
  .then((response) => {
    const arraybuffer = response.data;
    console.log("arraybuffer:", arraybuffer);
    // ...
  });
```

响应后，我们将得到 **ArrayBuffer** 对象类型的二进制字节数组：

{% asset_img responseType-arraybuffer.png  arraybuffer请求 %}

这个 **ArrayBuffer** 不能直接操作，需要转为 **TypeArray** 类型数组。再通过 **String.fromCharCode** 将字节数据转为 **ASCII 码**（即普通字符串）：

```js
const bytes = new Uint8Array(arraybuffer);
const str = bytes.reduce((acc, byte) => {
  return acc + String.fromCharCode(byte);
}, "");
```

得到普通字符串后，调用 **window.btoa** 方法，即可转为 **base64** 数据：

```js
const base64 = window.btoa(str);
// iVBORw0KGgo.....wAAAAAElFTkSuQmCC
showToPage("data:image/png;base64," + base64);
```

最后，页面 **img** 标签前加上 **base64** 前缀即可展示：

{% asset_img responseType-base64.png  base64图片展示 %}

**经过三步，我们通过 arraybuffer 方式解析了图片，那有什么简化办法呢？**

肯定是有的：

如果还是选择 **arraybuffer** 方式，对于支持 **Blob** **对象的浏览器环境来说，ArrayBuffer** 对象可以直接转成 **Blob**，然后通过 **URL.createObjectURL** 直接在内存创建该图片资源的引用地址。

```js
axios
  .get(imageSrc, {
    responseType: "arraybuffer",
  })
  .then((response) => {
    const arraybuffer = response.data;
    const blob = new Blob([arraybuffer], { type: "image/png" });
    const objectURL = URL.createObjectURL(blob);
    showToPage(objectURL);
  });
```

{% asset_img responseType-blob.png  blob图片展示 %}

也可以选择 **responseType** 为 **blob** 方式，响应回来的数据直接就是 **blob** 类型，直接生成 **objectURL** 即可：

```js
axios
  .get(imageSrc, {
    responseType: "blob",
  })
  .then((response) => {
    const blob = response.data;
    console.log("blob:", blob); //  Blob {size: 4026, type: 'image/png'}

    const objectURL = URL.createObjectURL(blob);
    showToPage(objectURL);
  });
```

## 题外话：a 标签的下载

对于一个图片的资源地址来说，浏览器直接访问是会预览该图片的，而不是出现下载弹框。另外，业务上为了实现追踪文件的下载进度这样的功能，我们借助 **XHR** 的 **progress** 就会很容易。

不考虑浏览器兼容问题，我们可以通过 **a** 标签的 **download** 来实现，直接上代码：

```js
// 生成 objectURL 后
function download(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = Date.now() + ".png";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href); // 释放 objectURL
  a.remove();
}
```

{% asset_img a-download.png  a标签下载 %}

# 最后

**responseType** 只是一个很简单的属性值，一般来说手头上的框架中都有已有相关功能的封装，而对于繁忙我们来说很容易忽视这些基本特性。

抛砖引玉，本篇到此也只说了些皮毛，像 arraybuffer 和 blog 的区别，浏览器对于大文件下载兼容性都没有涉及。

虽然社区都有成熟的插件，但这些都需要在业务中投入时间来实践尝试，毕竟要知其所以然。

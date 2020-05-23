---
title: 标签 script 加载机制
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2020-05-23 15:18:27
---


## 前言

我们平时“搬砖”只关注业务代码，页面脚本现在都由 webpack 帮我们自动组装，可能会忽略页面 script 的一些细节。

下面列了有关 script 标签的几个小问题，可以来自测下：

- script 标签放在 header 和 body 的区别？
- script 中的 defer、async 属性有什么作用？
- 多脚本加载时间不同，会影响其执行顺序么？
- document.ready 和 window.load 在 script 加载中的作用？
- 什么是动态脚本加载？

不太明白没有关系，必须承认我做了那么多年也对这块朦朦胧胧（没有具体实践过），下面会从简单的 demo 帮大家捋清这些概念。

**demo 说明**

利用 koa 起一个简单的 server 服务，通过 koa-static 实现资源文件的加载。

```js
const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  await lazyLoadScript(ctx.path);
  await static(path.join(__dirname, 'public'))(ctx, next);
});

app.listen(3000);
```

使用 setTimeout 简单实现一个延迟加载功能的方法，用来模拟 js 脚本加载很慢的场景：

```js
function lazyLoadScript(path, time = 3000) {
  return new Promise((resolve, reject) => {
    try {
      // js 文件将被特意延迟 3 秒
      if (/\/js\/test\d+\.js/.test(path)) {
        console.log(`拦截 ${path}，${time} 秒后返回`);
        setTimeout(() => {
          console.log(`响应 ${path}`);
          resolve(true);
        }, time);
      } else {
        resolve(true);
      }
    } catch (err) {
      reject(err);
    }
  });
}
```

简单的 html：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>script 加载机制</title>
  </head>
  <body>
    <h2>script 加载机制</h2>
  </body>
</html>
```

下面会改动 html 和延迟加载的逻辑，来说明相关的概念，现在开始吧。

## 脚本在页面的位置

script 通常被放在 header 或者 body 标签中，但位置的不同对于页面的加载效果也不一样。

### 放在 header 中

```js
<head>
  <title>script 加载机制</title>
  <script src='/js/test1.js'></script>
  <script src='/js/test2.js'></script>
  <script src='/js/test3.js'></script>
</head>
```

{% asset_img header.gif 效果图 %}

你能看到 html **第一时间被加载进来**，但页面 body 内容迟迟没有渲染出来。因为在等待 header 标签中 script 脚本的加载，3 秒后，整个页面渲染完成。

### 放在 body 底部

```js
<body>
  <h2>script 加载机制</h2>
  <script src='/js/test1.js'></script>
  <script src='/js/test2.js'></script>
  <script src='/js/test3.js'></script>
</body>
```

{% asset_img body.gif 效果图 %}

这次 html 内容第一时间渲染完成，随后等待 js 的加载。

### 总结

**脚本会阻塞页面的渲染**，所以推荐将其放在 body 底部，因为当解析到 script 标签时，通常页面的大部分内容都已经渲染完成，让用户马上能看到一个非空白页面。

另外你能看到多个脚本之间都是异步向服务器请求，他们之间不互相依赖，最终只等待 3 秒，而非 3+3+3 秒。

## 脚本延迟时间不同会影响执行顺序吗？

一般我们都是按如下方式编写 script 脚本顺序的：

```html
<script src="/js/test1.js"></script>
<script src="/js/test2.js"></script>
<script src="/js/test3.js"></script>
```

每个脚本输出一个简单逻辑：

```js
// test1.js
console.log('test1');
```

如果资源请求没有问题，通常脚本的执行顺序都符合预期，能看控制台看到对应的输出：

```text
test1
test2
test3
```

为了模拟复杂的网络环境，假定每个请求都有所延迟（**最先请求最晚响应**），他们的执行执行顺序是否受影响？

```js
function setTime(path) {
  if (path == '/js/test1.js') {
    return 3 * 000;
  } else if (path == '/js/test2.js') {
    return 2 * 1000;
  } else {
    return 1 * 1000;
  }
}

app.use(async (ctx, next) => {
  // await lazyLoadScript(ctx.path);
  await lazyLoadScript(ctx.path, setTime(ctx.path));
  await static(path.join(__dirname, 'public'))(ctx, next);
});
```

和之前的结果一致。多个脚本异步加载，虽然脚本间响应时间不同，但最终执行顺序和请求顺序一致。

```text
# 3 秒后
test1
test2
test3
```

同时也应证了上面提到的，多个脚本之间不互相阻塞。

{% asset_img loaded.gif 效果图 %}

## defer 和 async

这两个要放在一起讨论，因为都有延迟作用。

### defer

最开始提到了 script 的放置位置（header 和 body），defer 属性就可以解决这样的问题。

```html
<head>
  <script defer src="/js/test1.js"></script>
  <script defer src="/js/test2.js"></script>
  <script defer src="/js/test3.js"></script>
</head>
```

标记 defer 的脚本标签，即使写在 header 位置，也不会阻塞页面的加载。但先于 document 加载完之前。

同时，这些脚本执行顺序依旧和他们书写的一致，不受延迟时间不同的影响。

### async

async 和 defer 类似，但有如下两点不同：

- 先加载完的脚本，先执行
- document 全部加载完后，才执行 async 标记的脚本

我们前面已经知道了：脚本之间不受延迟时间的影响，执行顺序和他们请求顺序一致。

如果我们在 test1.js 定义了一个全局变量，即使此脚本会延迟响应很久，但在之后 test3.js 运行时依旧能取到值。

```js
// 延迟 3 秒
console.log('test1');
var globalNum = 1;
```

```js
// 延迟 1 秒
console.log('test3');
console.log(globalNum);
```

不过，放在 async 标记的脚本中，执行顺序就不同了：

{% asset_img async.gif 效果图 %}

能看到，最先响应回来的脚本先执行，此时 test1.js 定义的全局变量还没有声明，就会报错。

### 总结

defer 和 async 主要功能类似，都是为了不阻塞页面内容的渲染。

但在使用 async 属性时，需要特别注意。因为他会脱离脚本之间约定好的顺序，**建议在和业务代码不相干的脚本中使用，避免发生脚本之间互相依赖的问题**。

## document.ready 和 window.onload

document.ready 是 jQuery 里实现的方法，内部其实是对 document 的 DOMContentLoaded 事件做监听。这里就以 document.ready 来示意。

下面，测试他们之间的执行顺序（script 至于 body 底部）：

```html
<body>
  <script>
    window.onload = function () {
      console.log('window ready');
    };
    document.addEventListener('DOMContentLoaded', function () {
      console.log('document  ready');
    });
  </script>
  <script src="/js/test1.js"></script>
  <script src="/js/test2.js"></script>
  <script src="/js/test3.js"></script>
</body>
```

脚本加载和 document.ready 与 window.onload 的顺序如下：

{% asset_img ready.png 顺序 %}

先加载脚本，脚本全部执行后，触发 document 的 DOMContentLoaded 事件，最后执行 window.onload。

### 那 document.ready 和 window.onload 有什么区别？

首先顺序上，window.onload 晚于 document.ready；另外，如果页面有异步资源（图片），window.onload 会等待图片资源响应完后再触发。

{% asset_img image.gif 顺序 %}

能看到 image 图片加载完后，window.onload 才被调用。

### 使用 async 时的不同

使用 defer 不会对他们之间的执行顺序造成影响，脚本执行先于 document.ready 执行。

而 async 却会对原先的执行过程有 **大改变**：

```html
<script>
  window.onload = function () {
    console.log('window ready');
  };
  document.addEventListener('DOMContentLoaded', function () {
    console.log('document  ready');
  });
</script>
<script async src="/js/test1.js"></script>
<script async src="/js/test2.js"></script>
<script async src="/js/test3.js"></script>
```

{% asset_img ready-async.png 顺序 %}

document.ready 不再等待脚本的加载完成，页面渲染完后则会被触发。async 标识的脚本延迟加载，加载完后立马执行。

## 动态加载脚本

直接看代码（摘自《高性能 Javascript》）:

```html
<script>
  var newScript = document.createElement('script');
  newScript.type = 'text/javascript';
  newScript.src = '/js/test1.js';
  document.getElementsByTagName('head')[0].appendChild(newScript);
  // 脚本加载完毕
  if (newScript.readyState) {
    // IE
    newScript.onreadystatechange = function () {
      if (newScript.readyState == 'loaded' || newScript.readyState == 'complete') {
        console.log('loaded', newScript.src);
      }
    };
  } else {
    newScript.onload = function () {
      console.log('loaded', newScript.src);
    };
  }
</script>
```

当页面加载时，只是解析 script 标签内的代码。当 document 全部准备完毕后，将发送请求加载资源。

这样将不影响页面内容的渲染，同时上面代码将动态加载的脚本添加到 head 标签中，能够不受 body 内出现错误的影响。

事实上，应该发现百度统计代码，或者其他平台的一些脚本都是通过这种形式动态将脚本注入到我们页面中的。

## 最后

之前面试时我也遇到过有面试官提过此类问题，那时我回答的很简单。

但通过这样正儿八经的实践后，觉得了解其中的道理对提升网页性能有非常大的帮助。希望同样对大家有所帮助，如果不对之处，请评论指出，谢谢。

---
title: 开发中如何接入 HRM 到服务端
tags:
  - webpack
  - hmr
categories:
  - 开发
  - 前端开发
thumb_img: webpack.png
date: 2019-10-12 18:59:01
---

## 谈下开发

webpack 的 HMR 都用过，但简单入门的都是依靠 webpack-dev-server ，如果你是个全栈开发，必然会有个 node 服务，那一个粗暴的项目模式将是这样：

{% asset_img development-mode.png 粗暴的开发模式 %}

这样就存在两个 Http 服务（webpack-dev-server 自带的 express 服务、和 node 服务）

当然你项目稍稍“复杂些”，涉及服务端渲染，那上面这个模式就会变得难以理解。

很不幸，我们的项目就是这样，未经推敲的构建方式，随着多页面的增多变得异常慢。抛开 webpack 优化，就连热更新都丢掉了。

想要精简，最快的就是去掉一个服务（本身就有些累赘），去除后 **怎么实现 HMR （脱离了 webpack-dev-server）？**

先看下如下开发模式：

{% asset_img development-mode2.png 精简的开发模式 %}

下面会对其中替代 webpack-dev-server 模块的 webpack-dev-middleware 和 webpack-hot-middleware 做说明：

当然你可以跳过如下说明，直接看我已经写的一个 Demo：

> [点击访问，https://gitee.com/eminoda/ssr-learn/tree/webpack-server-middleware](https://gitee.com/eminoda/ssr-learn/tree/webpack-server-middleware)

![express 构建](https://gitee.com/eminoda/ssr-learn/raw/webpack-server-middleware/doc/webpack-middlemare.gif)

## 拆解 webpack-dev-server

如果移除了 webpack-dev-server ，我们要添加那些功能才能还原呢？

### webpack-dev-middleware

首先看到 webpack-dev-server 使用了 webpack-dev-middleware 模块，它提供了如下功能：

- 面对客户端资源的请求，从缓存中给出响应
- 监听本地代码的修改，让 webpack 编译

看下它怎么做的：

```js
// node_modules\webpack-dev-server\lib\Server.js

const webpackDevMiddleware = require('webpack-dev-middleware');

// 定义 webpack dev 中间件
setupDevMiddleware() {
  // middleware for serving webpack bundle
  this.middleware = webpackDevMiddleware(
    this.compiler,
    Object.assign({}, this.options, { logLevel: this.log.options.level })
  );
}

// 添加到整个 express 中间链中
setupMiddleware() {
  this.app.use(this.middleware);
}
```

这个 this.compiler 就是 webpack 编译实例：

```js
compiler = webpack(config);
```

把 compiler 传入到 webpack-dev-middleware 内部，它就会调用 compiler 相关 api 从而执行构建相关事情。

只要模仿 webpack-dev-server 把 webpack-dev-middleware 作为中间件加到我们自己的 node server 就可以了。

```js
const clientConfig = require("./build/webpack.client.config");
const clientCompiler = webpack(clientConfig);
const devMiddleware = require("webpack-dev-middleware")(clientCompiler, {
  publicPath: clientConfig.output.publicPath,
  noInfo: true
});

app.use(devMiddleware);
```

就上面一样，我们 node 中的代码就有了监听，构建的功能。**为了加入 HMR 功能，还少了一些东西**。

### 客户端 HMR 代码的注入

像在 **[探索 webpack-dev-server 的 HMR](/2019/10/12/webpack-dev-server-hmr/)** 说的，为了实现 HMR 功能，客户端代码需要提前埋入各种 runtime 代码。

这样我们就需要修改原有的 webpack config ，为客户端添加对应的 **socket 监听代码** 和 **向服务端获取新资源的代码** 。

这样就要用到 **webpack-hot-middleware** ，其提供了客户端 socket 代码。

```js
// 加入 client 入口文件
clientConfig.entry.app = ["webpack-hot-middleware/client", clientConfig.entry.app];
clientConfig.output.filename = "[name].js";
// 构建时，加入 runtime 代码
clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
```

## webpack-hot-middleware

完成上述两个步骤，并不能实现 HMR 功能，还差最后样东西：服务端与客户端通讯的 socket 通讯。

### eventsource 事件推送

在此之前，先了解下 eventsource ，它和 websocket 不同：

- eventsource 是 HTTP 协议，并且是单通道（服务端发送给客户端）
- websocket 是 TCP 协议，支持双工通道（可以互相发送接收信息）

当然还有实现机制、性能等区别，这里不做展开。对于开发阶段借助 eventsource 完成 HMR 的通知问题，我觉得主要还是简单，轻量，学习成本低。

我也已经准备了个 Demo ，你可以了解 eventsource 的效果:

> [点击访问 https://gitee.com/eminoda/ssr-learn/tree/eventsource](https://gitee.com/eminoda/ssr-learn/tree/eventsource)

![eventsource](https://gitee.com/eminoda/ssr-learn/raw/eventsource/doc/eventsource.gif)

### 实现

有了 eventsource 的基础后，看这块基本没什么问题了，毕竟相比 webpack-dev-server 复杂度下降不少。

首先在客户端的 Network 看到有 /\_\_webpack_hmr 的请求，从这里开始初始化 eventsource 连接和相关事件方法：

```js
// node_modules\webpack-hot-middleware\client.js
function init() {
  source = new window.EventSource(options.path);
  source.onopen = handleOnline;
  source.onerror = handleDisconnect;
  source.onmessage = handleMessage;
}
```

服务端通过中间件，判断是否进行服务端的事件推送：

```js
// node_modules\webpack-hot-middleware\middleware.js
var middleware = function(req, res, next) {
  if (closed) return next();
  // 请求地址不是 _webpack_hmr 则跳过
  if (!pathMatch(req.url, opts.path)) return next();
  eventStream.handler(req, res);
  // ...
};
```

创建后的 eventsource 中，还有健康检查，保持通讯的畅通：

```js
var interval = setInterval(function heartbeatTick() {
  everyClient(function(client) {
    client.write("data: \uD83D\uDC93\n\n");
  });
}, heartbeat).unref();
```

客户端预埋的代码和 webpack\hot\only-dev-server 类似，在结果模块的比对后，如果需要更新，则会执行 **module.hot.check()** 开始向服务端拉取更新代码

```js
if (!upToDate(hash) && module.hot.status() == "idle") {
  if (options.log) console.log("[HMR] Checking for updates on the server...");
  check();
}
// ...
var result = module.hot.check(false, cb);
```

在 cb 中，就会拉取 hot-update.json ，hot-update.js 资源了。

## koa 的兼容方式

很不幸主流的模块都是 express 中间件规范，长这样 fn(req,res,next) ，对于 fn(ctx,next) 需要做一些 refactor 。

当然已经有人做了 koa 专用的模块了 **koa-webpack** （热更新使用 **webpack-hot-client** ），看下 koa-hmr 开发模式怎么实现：

准备了个 Demo :

> [点击访问：https://gitee.com/eminoda/ssr-learn/tree/webpack-server-koa](https://gitee.com/eminoda/ssr-learn/tree/webpack-server-koa)

![koa 构建](https://gitee.com/eminoda/ssr-learn/raw/webpack-server-koa/doc/koawebpack.gif)

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [JS 实时通信三把斧系列之三: eventsource](https://www.jianshu.com/p/3d7b0bbf435a)
- [MDN - EventSource](https://developer.mozilla.org/zh-CN/docs/Server-sent_events/EventSource/EventSource)
- [MDN - addEventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
- [koa2 + webpack 热更新](https://www.cnblogs.com/liuyt/p/7217024.html?utm_source=itdadao&utm_medium=referral)

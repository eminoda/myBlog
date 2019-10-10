---
title: webpack HMR 热更新
tags:
  - ssr
  - webpack
categories:
  - 开发
  - 前端开发
thumb_img: webpack.png
---

相比直接刷新浏览器，通过 webpack 的 HMR 模式更能对开发效率有显著提升。

试想下：开发时，你对客户端的 js、css 做了小改动，浏览器没有再次向服务端发起请求，页面的修改区域就更新了代码，那多美好。

本篇先从 webpack-dev-server 着手，探索 webpack HMR 更新机制，以及结合服务端 SSR 做一切实践。

## webpack-dev-server

依靠 webpack-dev-server 将开启一个服务，它具备代理、静态文件等功能，当然还有本篇的重点功能 ——
Hot Module Reload（HMR）

### 零配置开启 HMR

我已经参照 webpack 官网的 Guide 写了个 Demo ，[点击访问 webpack-hmr-practice](https://gitee.com/eminoda/ssr-learn/tree/webpack-hmr-practice)

### HRM 的实现

能力有限，姑且把 webpack 的 compiler 等当成一个黑盒，暂不做原理分析。

#### Server 服务的创建

首先能看到一个 Server 类，在里面会创建一个 express 服务，在其中开启一个 socket 套接字服务。

node_modules\webpack-dev-server\lib\Server.js

```js
class Server {
  constructor(compiler, options = {}, _log) {
    // ...
    this.setupApp();
  }
  setupApp() {
    this.app = new express();
  }
  createServer() {
    // ...
    this.listeningApp = http.createServer(this.app);
  }
  createSocketServer() {
    // socket 实现（默认 sockjs）
    this.socketServer = new SocketServerImplementation(this);
  }
}
```

### socket 怎么通讯

准备了 sockjs 通讯的简单 Demo ，[点击访问 sockjs](https://gitee.com/eminoda/ssr-learn/tree/sockjs)

### 给客户端注入 socket 代码

在更新 compiler 时，会插入 entry 文件

node_modules\webpack-dev-server\lib\utils\updateCompiler.js
```js
addEntries(webpackConfig, options);
```

### 服务端发送信息



### 全览整个 HMR 过程（图）

### HMR 和 WDS 的不同

## 开发模式

### webpack-dev-middleware

### webpack-hot-middleware

### eventsource 通讯

### koa 的兼容方式

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [koa2 + webpack 热更新](https://www.cnblogs.com/liuyt/p/7217024.html?utm_source=itdadao&utm_medium=referral)
- [JS 实时通信三把斧系列之三: eventsource](https://www.jianshu.com/p/3d7b0bbf435a)
- [webpack 是如何实现 HMR 的以及实现的原理](https://blog.csdn.net/gitchat/article/details/78341649)
- [知乎 - Webpack HMR 原理解析](https://zhuanlan.zhihu.com/p/30669007)
- [掘金 - webpack 实现 HMR 及其实现原理](https://juejin.im/post/5d145d4e6fb9a07eee5ededa)

```

```

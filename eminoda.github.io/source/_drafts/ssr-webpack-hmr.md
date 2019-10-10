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
  // server 开启监听时，创建 socket
  listen(port, hostname, fn) {
    // ...
    return this.listeningApp.listen(port, hostname, err => {
      this.createSocketServer();
      // ...
    });
  }
}
```

### socket 怎么通讯

准备了 sockjs 通讯的简单 Demo ，[点击访问 sockjs](https://gitee.com/eminoda/ssr-learn/tree/sockjs)

### 给客户端注入 HMR 代码

#### hot entry

更新 compiler 时，在原有配置上会插入额外的 hot entry 文件。

node_modules\webpack-dev-server\lib\utils\updateCompiler.js

```js
addEntries(webpackConfig, options);
```

addEntries 会根据配置的 hot 选项，加载指定的 entry 文件：

```js
if (options.hotOnly) {
  hotEntry = require.resolve("webpack/hot/only-dev-server");
} else if (options.hot) {
  hotEntry = require.resolve("webpack/hot/dev-server");
}
```

这两者最大的不同，就是在异常情况下，是否对浏览器进行强刷：window.location.reload();

#### HotModuleReplacementPlugin

这是根据 hot 配置，自动添加到 webpack 配置中的：

```js
config.plugins.push(new webpack.HotModuleReplacementPlugin());
```

#### hot-update.json

添加通过 ajax 方式向服务端请求 hot-update.json 的逻辑

node_modules\webpack\lib\HotModuleReplacement.runtime.js

```js
function hotDownloadManifest(requestTimeout) {
  requestTimeout = requestTimeout || 10000;
  return new Promise(function(resolve, reject) {
    // ...
    var request = new XMLHttpRequest();
    // var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
    var requestPath = $require$.p + $hotMainFilename$;
    request.onreadystatechange = function() {
      // ...
      // success
      try {
        var update = JSON.parse(request.responseText);
      } catch (e) {
        reject(e);
        return;
      }
      resolve(update);
    };
  });
}
```

#### hot-update.js

向服务端请求 hot-update.js 的逻辑

```js
function hotDownloadUpdateChunk(chunkId) {
  var script = document.createElement("script");
  script.charset = "utf-8";
  // script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
  script.src = $require$.p + $hotChunkFilename$;
  if ($crossOriginLoading$) script.crossOrigin = $crossOriginLoading$;
  document.head.appendChild(script);
}
```

在热更新中，HotModuleReplacementPlugin 会触发 JsonpMainTemplatePlugin

```js
mainTemplate.hooks.bootstrap.tap("HotModuleReplacementPlugin", (source, chunk, hash) => {
  source = mainTemplate.hooks.hotBootstrap.call(source, chunk, hash);
  // ...
});
```

查看 JsonpMainTemplatePlugin 就能知道为何每次 HMR 后，新代码就出现在页面上，见下说明：

#### JsonpMainTemplatePlugin

```js
mainTemplate.hooks.hotBootstrap.tap("JsonpMainTemplatePlugin", (source, chunk, hash) => {
  // ...
  const runtimeSource = Template.getFunctionContent(require("./JsonpMainTemplate.runtime"));
});
```

这个 JsonpMainTemplate.runtime 有 html head 中添加标签的逻辑，最后交给 HotModuleReplacementPlugin 中的 source ，这样就能在 html 看到新增的代码：

```html
<script charset="utf-8" src="app.a924ad7db1acc3cd4b8e.hot-update.js"></script>
```

### 服务端的处理

#### HotModuleReplacementPlugin

生成热更新配置 json

```js
{"h":"ba41c82ba5dfb16b4a29","c":{"app":true}}
```

node_modules\webpack\lib\HotModuleReplacementPlugin.js

```js
compilation.hooks.additionalChunkAssets.tap("HotModuleReplacementPlugin", () => {
  const records = compilation.records;
  // ...
  const hotUpdateMainContent = {
    h: compilation.hash,
    c: {}
  };
  for (const key of Object.keys(records.chunkHashs)) {
    const chunkId = isNaN(+key) ? key : +key;
    // ...
    hotUpdateMainContent.c[chunkId] = true;
  }
});
```

随着构建的进度，向 client 发送数据

node_modules\webpack-dev-server\lib\Server.js

```js
sockWrite(sockets, type, data) {
  sockets.forEach((socket) => {
    this.socketServer.send(socket, JSON.stringify({ type, data }));
  });
}
```

### 客户端的处理

客户端如何接受解析服务端发送过来的信息，比如 {type:'ok',msg:'foo'} 。

如下只是其中的一个，示意开始热更新客户端代码：

node_modules\webpack-dev-server\client\index.js

```js
var onSocketMessage = {
  ok: function ok() {
    sendMessage("Ok");
    // ...
    reloadApp(options, status);
  }
};
```

如果是 hot 模式，则发送 webpackHotUpdate 事件：

node_modules\webpack-dev-server\client\utils\reloadApp.js

```js
function reloadApp(_ref, _ref2) {
  // ...
  if (hot) {
    // ...
    hotEmitter.emit("webpackHotUpdate", currentHash);
  }
}
```

webpackHotUpdate 事件的监听，以及触发后执行 check 的逻辑：

node_modules\webpack\hot\only-dev-server.js

```js
if(module.hot) {
  var check = function check() {
    module.hot
      .check()
      .then(function(updatedModules) {
        if (!updatedModules) {
          // ...
          return;
        }
        return module.hot
          .apply({
          // ...
          })
          .then(function(renewedModules) {
            // 未更新完毕，继续 check
            if (!upToDate()) {
              check();
            }
            require("./log-apply-result")(updatedModules, renewedModules);

            if (upToDate()) {
              log("info", "[HMR] App is up to date.");
            }
          });
      })
      .catch(function(err) {
      // ...
      });

  // webpack 热更新状态
  hotEmitter.on("webpackHotUpdate", function(currentHash) {
    lastHash = currentHash;
    // 未更新完毕，查看状态，执行 check
    if (!upToDate()) {
      var status = module.hot.status();
      if (status === "idle") {
        // 确认更新情况
        log("info", "[HMR] Checking for updates on the server...");
        check();
      }
    }
  }
}
```

拉取 hot-update.json

```js
function hotCheck(apply) {
  if (hotStatus !== "idle") {
    throw new Error("check() is only allowed in idle status");
  }
  hotApplyOnUpdate = apply;
  hotSetStatus("check");
  return hotDownloadManifest(hotRequestTimeout).then(function(update) {
    // ...
    return promise;
  }
}
```

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

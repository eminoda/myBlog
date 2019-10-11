---
title: 探索 webpack-dev-server 的 HMR
tags:
  - webpack
  - hmr
categories:
  - 开发
  - 前端开发
thumb_img: webpack.png
---

相比直接刷新浏览器，通过 webpack 的 HMR 模式更能对开发效率有显著提升。

试想下：开发时，你对客户端的 js、css 做了小改动，浏览器没有再次向服务端发起请求，页面的修改区域就更新了代码，那多美好。

本篇先从 webpack-dev-server 着手，探索 webpack HMR 更新机制，~~以及结合服务端 SSR 做一些实践。~~（篇幅过长，另开一篇说明）

## webpack-dev-server 自带的 HMR

可以接触 webpack-dev-server 来开启一个服务，它具备代理、静态文件等功能，当然还有本篇的重点功能 ——
Hot Module Reload（HMR）

### 零障碍开启 HMR

我已经参照 webpack 官网的 Guide 写了个 Demo ，[点击访问 webpack-hmr-practice](https://gitee.com/eminoda/ssr-learn/tree/webpack-hmr-practice)

## webpack-dev-server 如何实现 HMR

精力有限，webpack 相关的不做涉及，围绕 webpack-dev-server 对 HMR 的实现做说明。

### server 服务的创建

webpack-dev-server 提供一个服务功能，首先找到 Server 类：

```js
// node_modules\webpack-dev-server\lib\Server.js
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

在里面会创建一个 express 服务，在其中开启一个 socket 套接字服务。HMR 就以此为桥梁互相通讯。

#### socket 怎么通讯？

不清楚 socket 的同学可以看下这个 Demo，体验 socket 怎么桥接服务端和客户端的通讯问题， [点击访问 sockjs](https://gitee.com/eminoda/ssr-learn/tree/sockjs)

### 注入客户端 HMR 代码

#### 添加 entry 文件

更新 compiler 时，在原有配置上会插入额外的 entry 文件。

```js
// node_modules\webpack-dev-server\lib\utils\updateCompiler.js
addEntries(webpackConfig, options);
```

##### check entry

entry 由 wepback 提供，根据配置的 hot、hotOnly 选项，加载指定的 entry 文件：

```js
// node_modules\webpack-dev-server\lib\utils\addEntries.js
if (options.hotOnly) {
  hotEntry = require.resolve("webpack/hot/only-dev-server");
} else if (options.hot) {
  hotEntry = require.resolve("webpack/hot/dev-server");
}
```

only-dev-server 和 dev-server 这两者最大的不同，就是在异常情况下，对浏览器是否进行强刷：window.location.reload();

##### client entry

由 webpack-dev-server 提供，包括 socket 、reloadApp 等代码：

```js
const additionalEntries = checkInject(options.injectClient, config, webTarget) ? [clientEntry] : [];
```

最后统统加到我们自己的 wepack 中:

```js
additionalEntries.push(hotEntry);
```

#### HotModuleReplacementPlugin

可以看到原始的 webpack 的 plugins 配置自动添加了 **HotModuleReplacementPlugin：**

```js
// node_modules\webpack-dev-server\lib\utils\addEntries.js
config.plugins.push(new webpack.HotModuleReplacementPlugin());
```

通过 **HotModuleReplacementPlugin** 给客户端添加向服务端请求用来获取 **hot-update.json** 和 **hot-update.js** 文件的代码，来实现 HMR 功能。

##### hot-update.json

```js
// node_modules\webpack\lib\web\JsonpMainTemplate.runtime.js
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

##### hot-update.js

```js
// node_modules\webpack\lib\web\JsonpMainTemplate.runtime.js
function hotDownloadUpdateChunk(chunkId) {
  var script = document.createElement("script");
  script.charset = "utf-8";
  // script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
  script.src = $require$.p + $hotChunkFilename$;
  if ($crossOriginLoading$) script.crossOrigin = $crossOriginLoading$;
  document.head.appendChild(script);
}
```

当然这两段预先埋到客户端中的代码何时触发，之后再看。

### 服务端与客户端的交互

#### 如何通过 socket 通讯

借助封装的 sockWrite 方法，服务端将发送 hot、liveReload、invalid、progress、ok 等关键词以及对应的 data 信息 send 给客户端。

像是这样：{type:'ok',msg:'foo'}

```js
// node_modules\webpack-dev-server\lib\Server.js
sockWrite(sockets, type, data) {
  sockets.forEach((socket) => {
    this.socketServer.send(socket, JSON.stringify({ type, data }));
  });
}
```

客户端拿到这些关键词匹配对应的执行逻辑

```js
// node_modules\webpack-dev-server\client\socket.js
client.onMessage(function(data) {
  var msg = JSON.parse(data);

  if (handlers[msg.type]) {
    handlers[msg.type](msg.data);
  }
});
```

#### socket 建立后的准备

socket 服务创建连接后，随着 webpack 的构建，会同步向客户端发送 webpack 的构建进度信息

```js
this.socketServer.onConnection((connection, headers) => {
  this.sockWrite([connection], 'hot');
  this.sockWrite([connection], 'liveReload', this.options.liveReload);
  this.sockWrite([connection], 'progress', this.progress);
  // ...
}
```

客户端就会接收到这些信息，并打印输出：

```text
[HMR] Waiting for update signal from WDS...
client:48 [WDS] Hot Module Replacement enabled.
client:52 [WDS] Live Reloading enabled.
[WDS] 0% - compiling.
[WDS] 10% - building (0/0 modules).
...
[WDS] 100% - Compilation completed.
```

#### 监听文件修改

webpack-dev-server 会监听本地文件的修改保存，每当 webpack 编译完成后就发送 socket ，通知客户端重载更新代码，触发 **reloadApp** 。

```js
// node_modules\webpack-dev-server\lib\Server.js
done.tap("webpack-dev-server", stats => {
  this._sendStats(this.sockets, this.getStats(stats));
  this._stats = stats;
});
```

```js
this.sockWrite(sockets, "hash", stats.hash); // 关键依据
this.sockWrite(sockets, "ok");
```

注意，服务端发送 ok 标识后，视线就该转到客户端，因为 reloadApp 的代码在客户端中。

#### reloadApp()

注意上述的 hash ，每次构建后 webpack 会将最新的 **currentHash** 通过 socket 告诉客户端，这是 HMR 是否执行的依据。

通知 **webpackHotUpdate** 事件，并传递 **currentHash** ：

```js
function reloadApp(_ref, _ref2) {
  var hotReload = _ref.hotReload,
    hot = _ref.hot,
    liveReload = _ref.liveReload;
  var isUnloading = _ref2.isUnloading,
    currentHash = _ref2.currentHash;

  if (hot) {
    log.info("[WDS] App hot update...");
    var hotEmitter = require("webpack/hot/emitter");
    hotEmitter.emit("webpackHotUpdate", currentHash);
    // ...
  }
}
```

**webpackHotUpdate** 收到 **currentHash** ，调用 **check** 方法：

```js
// node_modules\webpack\hot\only-dev-server.js
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
```

#### check()

**check** 内部会执行 **module.hot.check()**，根据 **upToDate** 更新情况判断是否继续 **check**

```js
// node_modules\webpack\hot\only-dev-server.js
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
}
```

**module.hot.check** 是 **hotCheck** 的赋值变量。代码在开始时已经通过 **HotModuleReplacementPlugin** 被打包到客户端

```js
// node_modules\webpack\lib\HotModuleReplacement.runtime.js
function hotCheck(apply) {
  if (hotStatus !== "idle") {
    throw new Error("check() is only allowed in idle status");
  }
  hotApplyOnUpdate = apply;
  hotSetStatus("check");
  return hotDownloadManifest(hotRequestTimeout).then(function(update) {
    // ...
    var promise = new Promise(function(resolve, reject) {
      hotDeferred = {
        resolve: resolve,
        reject: reject
      };
    });
    hotUpdate = {};
    hotEnsureUpdateChunk(chunkId); // hot-update.js
    hotUpdateDownloaded();
    return promise;
  });
}
```

[**hotDownloadManifest** 就是生成拉取 **hot-update.json** 的代码，参照：注入客户端 HMR 代码](#hot-update-json)

获取到的 hot-update.json 就像这样：

```js
{"h":"ba41c82ba5dfb16b4a29","c":{"app":true}}
```

这样的文件是通过 webpack 输出在内存中：

```js
// node_modules\webpack\lib\HotModuleReplacementPlugin.js
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

[之后再执行 **hotEnsureUpdateChunk** （内部调用 **hotDownloadUpdateChunk** ）向服务端获取对应的 js 的代码，参照：注入客户端 HMR 代码](#hot-update-js)

同样看下这代码如何生成：

在热更新中会执行 **HotModuleReplacementPlugin** 和 **JsonpMainTemplatePlugin**

```js
// node_modules\webpack\lib\HotModuleReplacementPlugin.js
mainTemplate.hooks.bootstrap.tap("HotModuleReplacementPlugin", (source, chunk, hash) => {
  source = mainTemplate.hooks.hotBootstrap.call(source, chunk, hash);
  // ...
  return ...
});
```

```js
// node_modules\webpack\lib\web\JsonpMainTemplatePlugin.js
mainTemplate.hooks.hotBootstrap.tap("JsonpMainTemplatePlugin", (source, chunk, hash) => {
  // ...
  const runtimeSource = Template.getFunctionContent(require("./JsonpMainTemplate.runtime"));
  return ...
});
```

这个 **JsonpMainTemplate.runtime** 有往页面 Head 中添加标签的逻辑。

最后交给 **HotModuleReplacementPlugin** 中的 **source** 输出到客户端代码中，这样就能在 html 看到新增的代码：

```html
<script charset="utf-8" src="app.a924ad7db1acc3cd4b8e.hot-update.js"></script>
```

在 Network 中看到这样的请求：

{% asset_img hrm-fetch.png %}

同时完毕后，控制台会有如下打印：

```text
[WDS] App hot update...
// hot update code
Accepting the updated printMe module!
[HMR] Updated modules:
[HMR]  - ./src/print.js
[HMR] App is up to date.
```

## 全览整个 HMR 过程（图）

{% asset_img wds-hrm.png 整个 HMR 过程 %}

1. 设置 hot ，开启 HMR 功能（会对 webpack 的构建配置做修改，添加 entry 和 plugin）
2. webpack 监听、构建本地代码
3. 将构建结果推送到内存中（client 的请求将从这里获取）
4. webpack-dev-server 开启 express 服务，并创建 stock 连接
5. 实时对客户端发送 server 端的进度状态
6. 如有代码更新，执行 check 进行检查
7. 做是否需要更新 client 代码的判断
8. 拉取 hot-update.json ,获取更新 chunk，判断 chunk 是否有不同
9. 若有差异，拉取 hot-update.js ，热替换 client 代码

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [koa2 + webpack 热更新](https://www.cnblogs.com/liuyt/p/7217024.html?utm_source=itdadao&utm_medium=referral)
- [JS 实时通信三把斧系列之三: eventsource](https://www.jianshu.com/p/3d7b0bbf435a)

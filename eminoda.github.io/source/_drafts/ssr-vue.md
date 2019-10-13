---
title: vue ssr 实践
tags:
  - ssr
  - vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

一般来说为了更好的 **SEO 排名** 和 **性能优化** 等要求，往往需要 **服务端渲染** 的支持。我的公司项目都是基于 vue 的单页面应用，那怎么实现服务端渲染呢？

社区早已有了解决方案，只是我没有用过罢了，现在就快速的看下这块的实践。

## 相关 api

有关 vue ssr 的实现都是依靠 **vue-server-renderer** 提供的功能，可以看如下 Demo：

> [点击访问：https://gitee.com/eminoda/ssr-learn/tree/vue-ssr-api](https://gitee.com/eminoda/ssr-learn/tree/vue-ssr-api)

下面会对 **简单的渲染** 和 **结合 bundle&manifest 文件做的渲染** 做说明。

### 简单渲染

这是个非常简单的例子，主要在没有其他代码的干扰下更可能示范 vue ssr 的本质。只需要 vue + htmlTemplate 就能搞定。

#### createRenderer

创建一个（模板）渲染器：

```js
const { createRenderer } = require("vue-server-renderer");
let renderer = createRenderer({
  template: templateFile
});
```

这个 templateFile 是字符串，而不是 require 的引用。这也好理解，毕竟服务端渲染的本质就是响应返回字符串。

#### 创建一个 Vue 实例

```js
let app = new Vue({
  data: {
    msg: data.msg
  },
  template: `<div>数据绑定：{{ msg }}</div>`
});
```

#### renderToString

通过渲染器 renderer ，调用 **renderToString** ，把 vue 实例注入进去，得到字符串。

当然还可以通过 content 设置一些信息，比如 SEO 的 TDK。

```js
let context = {
  title: "SSR-templateRender"
};
renderer.renderToString(app, content, (err, html) => {
  if (err) {
    reject(err);
  } else {
    resolve(html);
  }
});
```

最后你就能访问 url 看到页面内容（注意这并不是客户端 js mount 上去的）

![模板渲染](https://gitee.com/eminoda/ssr-learn/raw/vue-ssr-api/doc/templateRender.png)

### JsonBundle + Manifest

当然真实的项目还更复杂些：

- Html 引用的资源需要“动态”的挂到标签上
- 服务端 router 每次解析不同地址，还需要“配合” vue router ，做对应的模板渲染
- 甚至还需要保持 vuex 的状态；异步请求的处理

详细的项目配置，[你可以在上面的 Demo 中看到](#相关-api)，下面只是说核心部分。

#### webpack build

首先我们需要通过 webpack 构建 **客户端的 manifest 文件** 和 **服务端的 server.bundle 文件**

这里就涉及 webpack 的两个 plugin：**vue-server-renderer/client-plugin**、**vue-server-renderer/server-plugin**

```js
// webpack.client.config
plugins: [new VueSSRClientPlugin()];

// webpack.server.config
plugins: [new VueSSRServerPlugin()];
```

构建成功就会在 output 目录下生成：vue-ssr-client-manifest.json、vue-ssr-server-bundle.json 。

通过 manifest ，vue 就知道如何往模板上挂在资源文件；同时每次渲染时，vue 也能依靠 bundle 知道取那部分 js 逻辑。

#### 修改服务端路由逻辑

拦截服务端所有的请求，交给 getResponseDataByBundleRender 处理，context 内包含当前请求的 url ：

```js
router.get("*", async (ctx, next) => {
  let ssr = new SSRService({});
  let context = {
    title: "SSR-jsonBundleRender",
    url: ctx.url
  };
  ctx.body = await ssr.getResponseDataByBundleRender(context, {});
});
```

getResponseDataByBundleRender 是一个封装的方法，和上面的简单渲染实现一样，只是额外需要 bundle、manifest 文件：

```js
getResponseDataByBundleRender(content) {
  let renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false, // 推荐
    template: template,
    clientManifest: clientManifest
  });
  return new Promise((resolve, reject) => {
    renderer.renderToString(content, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
}
```

#### 客户端和服务端功能的衔接

那客户端的请求地址怎么和 vue 的路由模式搭上关系？这就要回到上面的 webpack 配置不同的入口文件：

独立创建一个创建 vue 实例的文件，用于对不同端的 entry 入口文件解耦：

```js
// src\app.js
export function createApp() {
  const app = new Vue({ router, store, render: h => h(App) });
  //   额外导出 router ，供 ssr 使用
  return { app, router, store };
}
```

server.entry.js 会将 store 注入到 window.\_\_INITIAL_STATE\_\_ 中，并且会根据请求地址，切换 vue 当前路由地址：

```js
export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();

    router.push(context.url);

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        return reject(new Error("访问页面不存在"));
      }
      Promise.all(
        matchedComponents.map(Component => {
          if (Component.asyncData) {
            return Component.asyncData({
              store,
              route: router.currentRoute
            });
          }
        })
      )
        .then(() => {
          // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
          context.state = store.state;
          resolve(app);
        })
        .catch(reject);
    }, reject);
  });
};
```

client.entry.js 会加入如下逻辑，使客户端能将 window.\_\_INITIAL_STATE\_\_ 替换成 vue store :

```js
// src\entry-client.js
const { app, store } = createApp();

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}
```

这样 vue 的状态机制就得以还原。

之后你就能看到这样的效果：

![vue-ssr](https://gitee.com/eminoda/ssr-learn/raw/vue-ssr-api/doc/vue-ssr.gif)

## 开发模式

### 官方例子 hack news

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [Vue SSR 官方文档说明](https://ssr.vuejs.org/zh/#%E4%BB%80%E4%B9%88%E6%98%AF%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E6%B8%B2%E6%9F%93-ssr-%EF%BC%9F)
- [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0)

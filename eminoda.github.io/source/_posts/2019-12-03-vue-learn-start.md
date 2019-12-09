---
title: vue 源码学习-准备工作
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-12-03 14:28:49
---

# 前言

## 初衷:heart:

从 **angular** 转到 **vue** ，到现在也用了两年多了。作为前端开发一直在“无脑”用着官方提供的 API，完成迭代需求。

表面看似熟悉这门技术框架，但根本不了解其内部机制，如同几根稻草顶着一块砖头一样 **软弱不堪**。

赶在 vue 3.0 还没有正式发布前，做最后的冲刺，以更好的姿态面对将来的挑战 :punch:

当然如果在看的你也和我一样未看过 vue 源码，希望这个系列能帮助到你。

几个小目标 :triangular_flag_on_post:：

- 看完 vue 2.x 的源码，了解内部核心原理
- 加强解决 vue 相关的问题能力
- 提升程序设计能力，学习其中的 **最佳实践**

## 感谢和参考 :sunny:

由于一直在 **搬砖**，让自己在底层技术面前依旧是新人，因为我从未深度了解它们。所以开始这段旅程前，需要很多人的指点和引导。再次感谢社区那些无私奉献的大佬们。

参考链接：

- [Vue 技术内幕--hcysun](http://hcysun.me/vue-design/) 超详细的解读，还有不错的排版，佩服作者的辛苦付出
- [停止学习框架](https://juejin.im/post/5c1a839f518825780008537d) 这是我为何重视源码的契机

# 提前准备

在开始学习之前，需要对如下工具或者语法有个概念：

- ES6

  这算是现在前端的标配，借鉴 [阮一峰老师的 ESMAScript 6 入门](http://es6.ruanyifeng.com/) 基本可以快速上手。

- flow & rollup

  vue 源码基于这两个工具做类型检查以及代码构建的，不影响阅读学习，但知道是最好的。我也准备了两篇快速入门：[flow 静态代码检查工具](https://eminoda.github.io/2018/12/12/flow-quickstart/), [rollup 5 分钟入门](https://eminoda.github.io/2018/12/11/rollup-quickstart/)

- vue api

  整个学习过程还是需要对官方 api 有个比较高的熟悉度，只有用过了，当看到源码才会有更深的理解和思考。

# Vue 对象在创建的整个过程？

如下是一个简单的 vue 对象创建示例：

```js
var app = new Vue({
  el: "#app",
  data: {
    message: "Hello Vue!"
  }
});
```

刚学习前我们一直不知道这个对象的创建内部经历了什么？以这个 Demo 为起点，我们先从 Vue 的函数 function 声明开始：

```js
// src\core\instance\index.js

function Vue(options) {
  this._init(options);
}
```

先不看内部的 \_init 方法，因为我们知道当 new 对象后，自然首先就会进入该方法。

当 function Vue 声明完后，立即会混合相关 vue 原型方法：

```js
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
```

这些 Mixin 方法会在 Vue 对象上定义一些我们熟知的 **原型方法**：

- 状态类：\$watch、\$set、\$delete
- 事件类：\$on、\$once、\$off、\$emit
- 生命周期类：\$forceUpdate、\$destroy、\_update
- 渲染类：\$nextTick、\_render

有机会我们会具体看这些方法是如何工作的。

先具体看下 **initMixin** ，因为它和一开始的函数声明关系最密切，定义了原型 **\_init** 方法：

```js
// src\core\instance\init.js

export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    // ...
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, "beforeCreate");
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, "created");
    //...
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}
```

里面定义了一系列 vue 相关的初始化工作，结合 vue 的 **生命周期图谱**，会让容易理解这些初始化方法和 beforeCreate，created 两个生命周期钩子的意义。

{% asset_img lifecycle-init.png 生命周期图谱 %}

紧接着之后的声明，在 **initGlobalAPI** 方法中知道 Vue 定义了哪些 **全局 API** 的？

```js
// src\core\index.js
initGlobalAPI(Vue);
```

包括 Vue.config、Vue.set、Vue.delete、Vue.nextTick、Vue.observable、Vue.mixin、Vue.use、Vue.extend 等，这些你都能在官网的 [全局 API](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80-API) 找到对应的说明。

注意最后的页面挂载，你能在“完整版”的 vue.js 中看到两处 **\$mount** 的方法定义。

第一处：

```js
// src\platforms\web\runtime\index.js

// public mount method
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};
```

第二处是“完整版”打包入口文件这里，再次定义了 **\$mount** 方法，集成了 render 等函数，其内部调用上面的 **\$mount** 方法。

```js
// src\platforms\web\entry-runtime-with-compiler.js

const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
  // ...
  return mount.call(this, el, hydrating);
};
```

\$mount 在 \_init() 方法中被调用，就这样我们能看到模板被挂载到页面上，其中的逻辑在 **生命周期图谱** 上也展示的很清楚：

{% asset_img lifecycle-mount.png 生命周期图谱 %}

之后，会根据数据的更新机制来完成页面的数据动态响应：

{% asset_img lifecycle-react.png 生命周期图谱 %}

当然以上的过程都简单带过了，详细原理见后续文章。

# 总结

做了 vue 代码学习的准备工作。

并结合 vue 整个生命周期过程，讲了一个简单的 vue 从声明到创建中间的所经历过程，大致对其中过程有个初步的概念。

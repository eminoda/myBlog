---
title: vue 源码学习-准备工作
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

## 初衷:heart:

从 angular 转到 vue ，到现在也用了两年多了。作为前端开发一直在“无脑”用着官方提供的 API，完成迭代需求。

表面看似熟悉这门技术框架，但根本不了解其内部机制，就和几根稻草顶着一块砖头一样 **软弱不堪**。

赶在 vue 3.0 还没有正式发布前，做最后的冲刺，以更好的姿态面对将来的挑战 :punch:

几个小目标 :triangular_flag_on_post:：

- 看完 vue 2.x 的源码，了解内部核心原理
- 加强解决 vue 相关的问题能力
- 提升程序设计能力，学习其中的 **最佳实践**

## 感谢和参考 :sunny:

由于一直在**搬砖**，让自己在技术面前依旧是**新人**，因为我从未深度了解**它们**。所以开始这段旅程前，需要很多人的指点和引导。再次感谢社区那些无私奉献的大佬们。

参考链接：

- [Vue 技术内幕--hcysun](http://hcysun.me/vue-design/) 超详细的解读，还有不错的排版，佩服作者的辛苦付出
- [停止学习框架](https://juejin.im/post/5c1a839f518825780008537d) 这是我为何重视源码的契机

## 提前准备

如果你对如下工具或者知识点不是特别熟悉，有必要事先做个学习准备：

- ES6

  这算是现在前端的标配，借鉴 [阮一峰老师的 ESMAScript 6 入门](http://es6.ruanyifeng.com/) 基本可以快速上手。

- flow & rollup

  vue 源码基于这两个工具做类型检查以及代码构建的，不影响阅读学习，但知道是最好的。

- vue api

  整个学习过程还是需要对官方 api 有个比较高的熟悉度，只有用过了，当看到源码才会有更深的理解和思考。

## Vue 对象在创建的整个过程？

这是个简单的 vue 对象创建，并实例化：

```js
var app = new Vue({
  el: "#app",
  data: {
    message: "Hello Vue!"
  }
});
```

那从声明定义，到对象创建，里面到底经历了什么？下面来简单看下：

function Vue 定义在哪里？

```js
// src\core\instance\index.js

function Vue(options) {
  this._init(options);
}
```

声明完后，立即会混合相关 vue 原型方法。

```js
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
```

initMixin 准备了对象创建后调用的 init 原型方法，并在其中还有生命周期、事件等相关初始化方法。

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

你能看到 init 中有两个 callHook ，他们是生命周期钩子的调用，结合 **生命周期图谱** 基本有个初步的猜想认识。

当然 init 是实例化后才调用的，这里不做展开。继续看余下的声明定义。

在 initGlobalAPI 方法中做些 Vue 属性定义。

```js
// src\core\index.js
initGlobalAPI(Vue);
```

```js
// src\core\global-api\index.js
export function initGlobalAPI(Vue: GlobalAPI) {
  // ...
  Object.defineProperty(Vue, "config", configDef);
  // ...
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;
  Vue.observable = <T>(obj: T): T => {
    observe(obj);
    return obj;
  };
  // ...
  initUse(Vue);
  initMixin(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}
```

定义 runtime 的 \$mount 方法：

```js
// src\platforms\web\runtime\index.js

Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};
```

最后的 vue 完整版，再次定义了 $mount 方法，集成了 render 等函数，其内部调用上面的 $mount 方法。

```js
// src\platforms\web\entry-runtime-with-compiler.js

const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
  // ...
  return mount.call(this, el, hydrating);
};
```

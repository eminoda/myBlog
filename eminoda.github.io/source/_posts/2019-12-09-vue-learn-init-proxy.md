---
title: vue 源码学习-初始化：代理
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-12-09 13:29:28
---

# 前言

紧接着 **mergeOptions** 的方法后，接下来就进入了渲染代理 **\_renderProxy** 属性的定义。

```js
if (process.env.NODE_ENV !== "production") {
  initProxy(vm);
} else {
  vm._renderProxy = vm;
}
```

在开始 initProxy 前，先对 Proxy 对象有个简单的认识。

# Proxy 对象

> Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。

我对其简单的理解：

- Proxy 作用：
  我们可以定义 handler 方式作为对象 target 的“加工处理”，定义在 Proxy 中。
- 元编程：
  如果我们 handler 处理较为不同，可能得到的最终结果会是“加工处理”后的，并且它比我们写代码更为高效。

# 初始化代理 initProxy

了解 **Proxy** 后，我们来进入到 **initProxy** 方法中看下，首先是 **Proxy** 的 **set** 定义：

```js
const isBuiltInModifier = makeMap("stop,prevent,self,ctrl,shift,alt,meta,exact");
config.keyCodes = new Proxy(config.keyCodes, {
  set(target, key, value) {
    if (isBuiltInModifier(key)) {
      warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`);
      return false;
    } else {
      target[key] = value;
      return true;
    }
  }
});
```

根据 isBuiltInModifier 的信息，基本知道该 set 方法适用于设置按键相关操作的。如果我们设置了 ctrl 等的关键字就会出现 warn 警告。

下面是 initProxy 的主方法定义：

```js
initProxy = function initProxy(vm) {
  if (hasProxy) {
    // determine which proxy handler to use
    const options = vm.$options;
    const handlers = options.render && options.render._withStripped ? getHandler : hasHandler;
    vm._renderProxy = new Proxy(vm, handlers);
  } else {
    vm._renderProxy = vm;
  }
};
```

首先会判断当前客户端是否支持 Proxy 对象，接着会判断 render.\_withStripped 来决定使用哪种 handler 方式？（getHandler or hasHandler）

```js
const getHandler = {
  get(target, key) {
    if (typeof key === "string" && !(key in target)) {
      if (key in target.$data) warnReservedPrefix(target, key);
      else warnNonPresent(target, key);
    }
    return target[key];
  }
};
```

```js
const hasHandler = {
  has(target, key) {
    const has = key in target;
    const isAllowed = allowedGlobals(key) || (typeof key === "string" && key.charAt(0) === "_" && !(key in target.$data));
    if (!has && !isAllowed) {
      // 同 handler get
      if (key in target.$data) warnReservedPrefix(target, key);
      else warnNonPresent(target, key);
    }
    return has || !isAllowed;
  }
};
```

上面涉及了几个对象属性取值的校验：

- warnReservedPrefix: 属性 key 必须是 target.\$data 对象上定义过的
- warnNonPresent: 属性 key 没有在 target 定义过，却出现在 template 模板上
- allowedGlobals:
  允许出现的定义（Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,require）

# 总结

需要注意的是，通过 Proxy 元编程方式对设置的对象做了验证拦截处理，比让我们在开发中有个更详细的错误提示。

这个对象 target 就是 vm （即整个 this 引用），最后整个代理是交付给 **vm.\_renderProxy** 属性，我们在看到相关渲染方式时再关注它的作用。

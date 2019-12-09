---
title: vue 源码学习-初始化：响应式的状态
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-12-09 13:29:56
---

# 前言

现在开始会在如下方法中，涉及 vue 数据响应相关的 api 使用：

```js
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
callHook(vm, "created");
```

我不打算在这里看探究响应式 api 的原理，只是先熟悉哪些地方出现了 api ？

# initInjections

先是 initInjections(vm); 的调用：

```js
// src\core\instance\inject.js

export function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(key => {
      defineReactive(vm, key, result[key]);
    });
    toggleObserving(true);
  }
}
```

## 解析 inject

先回顾下之前的属性合并 **mergeOptions** 方法，vue 会首先对如下属性进行“标准化”操作：

```js
normalizeProps(child, vm);
normalizeInject(child, vm);
normalizeDirectives(child);
```

比如我们定义的 inject 属性:

```js
inject: ["name"];
```

最终会被解析成：

```js
inject: {
  name: {
    from: "name";
  }
}
```

随后在 **resolveInject** 方法中就会一级级往“上”，寻找父类定义的 **provide** 属性，直至找到与 **inject** 属性中 **from** 对应的属性：

```js
const result = resolveInject(vm.$options.inject, vm);
```

```js
function resolveInject(inject: any, vm: Component) {
  const result = Object.create(null);
  // ...
  while (source) {
    if (source._provided && hasOwn(source._provided, provideKey)) {
      result[key] = source._provided[provideKey];
      break;
    }
    source = source.$parent;
  }
  // ...
  return result;
}
```

## 定义响应式

最后如果 result 存在，就会交给 **defineReactive** 定义成响应式数据：

```js
function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm);
  if (result) {
    // ...
    defineReactive(vm, key, result[key]);
  }
  // ...
}
```

# initState

**initState** 相比于 **initInjections** 和 **initProvide** 复杂，因为在它内部需要处理我们平时最常用的属性：props、methods、data、computed、watch。同时这些属性也是 vue 的数据驱动核心。

```js
function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

能看到对这些重要的属性分别有对应初始化解析的方法（initProps、initMethods、initData...）

并且传入的参数都是由 **mergeOptions** 方法中的合并属性策略来生成最后的属性对象 **vm.\$options**。

## initProps

initProps 遍历 vm.\$options.props 对象上的属性，定义为响应式：

```js
function initProps(vm: Component, propsOptions: Object) {
  // ...
  for (const key in propsOptions) {
    //...
    defineReactive(props, key, value);
  }
}
```

注意这些定义的 props 属性不能是组件定义上涉及的关键字 key,ref,slot,slot-scope,is；同时基于单项数据流的原则 props 中的属性值不建议从子组件中再次改变来影响父组件，官方建议还是使用 data、computed 来处理。

## initMethods

initMethods 最简单，检验完合法性后，最后将每个方法赋值到 vm 对象上。

```js
function initMethods(vm: Component, methods: Object) {
  for (const key in methods) {
    // 校验方法属性，不能与 props 冲突
    // ...
    vm[key] = typeof methods[key] !== "function" ? noop : bind(methods[key], vm);
  }
}
```

## initData

同样 data 属性对象也是通过遍历，来对每个属性进行校验：

```js
function initData(vm: Component) {
  let data = vm.$options.data;
  // ...
  const keys = Object.keys(data);
  let i = keys.length;
  while (i--) {
    // 校验 props、methods
  }
  observe(data, true /* asRootData */);
}
```

最后将整个 data 对象交给 **observe** 方法设置为观察对象。

## initComputed

initComputed 和前面的初始化方法略有不同。

```js
function initComputed(vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = (vm._computedWatchers = Object.create(null));

  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === "function" ? userDef : userDef.get;

    watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);

    // 校验属性，不能出现在 data、props 上
    // ...
  }
}
```

**computed** 对象上的属性，必须有个 **get** 方法，后面需要给 **Watcher** 使用。

基于我们开发中使用过 **computed** 和 **watch** 属性的场景上看，其他这两者很类似。在代码中也体现了出来，因为都创建了 **Watcher** 对象。

## initWatch

```js
function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}
```

**createWatcher** 内部就是调用 **\$watch** 方法，创建 **Watcher** 对象。

```js
vm.$watch(expOrFn, handler, options);
```

# initProvide

**provide** 属性采用 **mergeDataOrFn** 策略，最后被定义在 **vm.\$options.provide** 属性中。

**provide** 和 **inject** 都是成对出现，所以在执行完本实例的 **initInjections** 后，也将执行
**initProvide** 方法，供下个子组件使用。

```js
function initProvide(vm: Component) {
  const provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === "function" ? provide.call(vm) : provide;
  }
}
```

并将结果挂载到 **vm.\_provided** 上。

# 总结

这些 init 方法中涉及了数据响应式相关的 api ，分别是：

- defineReactive
- observe
- Watcher

这些方法都在做什么？我们下篇继续深入学习。

# Vue 初始化-生命周期

紧接着看到如下代码：

```js
initLifecycle(vm);
```

这个简单，对一些 vm 属性统一做初始化赋值。值得注意的是，这些初始化的属性在整个 Vue 生命周期上所使用。

```js
vm.$parent = parent;
vm.$root = parent ? parent.$root : vm;

vm.$children = [];
vm.$refs = {};

vm._watcher = null;
vm._inactive = null;
vm._directInactive = false;
vm._isMounted = false;
vm._isDestroyed = false;
vm._isBeingDestroyed = false;
```

上一篇： [Vue 初始化-渲染代理](./vue_learn_203_init_renderProxy.md)

下一篇： [Vue 初始化-事件](./vue_learn_205_init_events.md)

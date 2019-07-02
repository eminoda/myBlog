# Vue 初始化-总结

回头再看遍 **Vue.prototype.\_init** ，经历哪些事情

```js
Vue.prototype._init = function(options?: Object) {
  const vm: Component = this;
  //...
  if (options && options._isComponent) {
    initInternalComponent(vm, options);
  } else {
    vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
  }
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm);
  } else {
    vm._renderProxy = vm;
  }
  vm._self = vm;
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, 'beforeCreate');
  initInjections(vm); // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook(vm, 'created');

  //...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
};
```

- 作为 Vue 构造函数的入口方法，定义了许多 **初始化** 功能
- 通过 **mergeOptions** 合并了 Vue parent 和 child 的属性
- 对 vm.options 中的选项属性进行 **规范化** ，并且 **定制不同的策略** 初始化不同的属性选项
- 初始化 **组件** 等场景指定的 inject/provide
- 特定属性 prop，data，watch，computed 初始化了 **动态响应**
- 穿插在上面几个步骤，定义了 beforeCreate，created 两个生命周期

初始化就算这样告一段落，要知道 init 过程中，没有对 defineReactive、observe ... 做过解释，后续开始 **动态响应** 这块的内容。

上一篇：[Vue 初始化-provide](./vue_learn_210_init_provide.md)

下一篇：[Vue 数据响应-赋予观察属性 observe](./vue_learn_301_reactive_observe.md)

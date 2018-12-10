---
vue源码--Vue.prototype._init
---

# Vue.prototype.\_init

## code

```js
function Vue(options) {
  // 入口：调用 Vue.prototype._init
  this._init(options);
}
Vue.prototype._init = function(options) {
  var vm = this;
  // merge options
  if (options && options._isComponent) {
    initInternalComponent(vm, options); // 需要设置 _isComponent
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    );
  }
  {
    initProxy(vm);
  }
  vm._self = vm;
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, "beforeCreate");
  initInjections(vm); // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook(vm, "created");
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
};
```

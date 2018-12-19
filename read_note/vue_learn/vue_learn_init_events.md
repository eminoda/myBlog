<!-- vue_learn--初始化-事件 -->

# 初始化-事件
看下方法定义

````js
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
````

那这个 listeners 发生那些事？全局搜索 _parentListeners 只在如下处发现：
````js
function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  ...
  opts._parentListeners = vnodeComponentOptions.listeners;
  ...
}
````

而 initInternalComponent 在我们的 initMixin 方法中被调用。由于这个 if 目前不会进入，所以暂时跳过

````js
if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
} else {
    vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
    )
}
````

下一篇：[初始化-生命周期 钩子](./vue_learn_init_lifeHook.md)
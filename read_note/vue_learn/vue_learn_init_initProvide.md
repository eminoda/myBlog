<!-- vue_learn--initProvide -->
# initProvide
方法定义，和 initInjections 呼应
````js
export function initProvide(vm: Component) {
  const provide = vm.$options.provide
  // 这里会创建一个内置对象 vm._provided
  if (provide) {
    vm._provided = typeof provide === 'function' ?
      provide.call(vm) :
      provide
  }
}
````

下一篇：[初始化-总结](./vue_learn_init_end.md)
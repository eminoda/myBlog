<!-- vue_learn--initProvide 初始化状态 -->
# initProvide 初始化状态
方法定义
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
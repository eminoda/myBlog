# Vue 初始化-provide

方法定义和 initInjections 呼应

```js
export function initProvide(vm: Component) {
  const provide = vm.$options.provide;
  // 这里会创建一个内置对象 vm._provided
  if (provide) {
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide;
  }
}
```

上一篇： [Vue 初始化-initState](./vue_learn_209_init_state.md)

下一篇： [Vue 初始化-总结](./vue_learn_211_init_end.md)

<!-- vue_learn--总结 -->

# 总结

回头再看遍 **Vue.prototype.\_init** ，经历哪些事情

```js
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    ...
    if (options && options._isComponent) {
        initInternalComponent(vm, options)
    } else {
        vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
        )
    }
    if (process.env.NODE_ENV !== 'production') {
        initProxy(vm)
    } else {
        vm._renderProxy = vm
    }
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    ...
    if (vm.$options.el) {
        vm.$mount(vm.$options.el)
    }
}
```

- 作为 Vue 构造函数的入口方法，定义了许多初始化功能
- 通过 mergeOptions 合并“其他” Vue 和 Vue 示例的 options
- 合并过程中 **规范化** ，**定制不同的策略** 初始化不同的属性选项
- 初始化 **组件** 等场景指定的 inject provide
- 特定在 prop，data，watch 初始化了 **动态响应**
- 穿插在上面几个步骤，定义了 beforeCreate，created 两个生命周期

初始化就算这样告一段落，要知道 init 过程中，没有对 defineReactive、observe ... 做过解释，后续开始 **动态响应** 这块的内容。

上一篇：[Vue 初始化-provide](./vue_learn_12_initProvide.md)

下一篇：[响应式-创建观察者对象](./vue_learn_14_reactive_observe.md)

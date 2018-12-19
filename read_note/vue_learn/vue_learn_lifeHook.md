<!-- vue_learn--初始化-生命周期 钩子 -->

# 初始化-生命周期 钩子

在初始化 init 的时候，一共调用2个钩子 beforeCreate & created
````js
callHook(vm, 'beforeCreate')
...
callHook(vm, 'created')
````

如何被触发？其实就从 vm.$options[hook] 拿到具体生命周期的fn，然后 call 调用。

````js
export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
````

结合 Vue 生命周期的图谱，就能大概知道为何此处调用，参见[附录 生命周期图示](./vue_learn_appendix_life.md)

到此为止，初始化 **Vue.prototype._init beforeCreate** 之前的代码算是告一段落了，你应该注意到并没有结束，还剩两大块内容：

````js
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
````

````js
if (vm.$options.el) {
    vm.$mount(vm.$options.el)
}
````

下一篇：[初始化-initInjections](./vue_learn_init_initInjections.md)
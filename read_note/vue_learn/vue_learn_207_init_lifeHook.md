# Vue 初始化-生命周期钩子

在初始化 init 的时候，一共调用 2 个钩子 beforeCreate & created

```js
callHook(vm, 'beforeCreate');
//...
callHook(vm, 'created');
```

如何被触发？回过头，其实在 **mergeOptions** 时做了定义

```js
// E:\github\vue\src\core\util\options.js

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook;
});
```

对 parent ，child 都定义生命周期的方法，做合并处理：

```js
function mergeHook(parentVal: ?Array<Function>, childVal: ?Function | ?Array<Function>): ?Array<Function> {
  const res = childVal ? (parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal]) : parentVal;
  return res ? dedupeHooks(res) : res;
}
```

**vm.\$options[hook]** 拿到具体生命周期的 fn，然后 call 调用。

```js
// E:\github\vue\src\core\instance\lifecycle.js

export function callHook(vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm);
      } catch (e) {
        handleError(e, vm, `${hook} hook`);
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}
```

结合 Vue 生命周期的图谱，就能大概知道为何此处调用，参见 [附录 生命周期图示](./vue_learn_001_lifecycle.md)

到此为止，初始化 **Vue.prototype.\_init beforeCreate** 之前的代码算是告一段落了，你应该注意到并没有结束，还剩两大块内容：

动态响应设计的初始化：

```js
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
```

页面渲染：

```js
if (vm.$options.el) {
  vm.$mount(vm.$options.el);
}
```

上一篇： [Vue 初始化-渲染 render](./vue_learn_206_init_render.md)

下一篇： [Vue 初始化-Injections](./vue_learn_208_init_inject.md)

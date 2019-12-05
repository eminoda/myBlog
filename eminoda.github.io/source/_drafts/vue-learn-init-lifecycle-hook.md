---
title: vue 源码学习-初始化：生命周期钩子
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

顺着 \_init 代码的逻辑。因为都是 vue 相关变量属性的初始化定义，我跳过了如下代码：

```js
initLifecycle(vm);
initEvents(vm);
initRender(vm);
```

直接进入了第一个 beforeCreate 生命周期钩子的定义：

```js
callHook(vm, "beforeCreate");
```

下面看下，几种不同的周期钩子是怎么在整个 vue 执行的过程中生效的。

# lifecycle hook

## 回顾 mergeOption 处理

注意所有的钩子在 mergeOptions 阶段已被 mergeHook 策略处理过了。

并且父子 vue 上定义的钩子方法不会存在覆盖情况，他们会按父先子后的顺序存入数组中：

```js
function mergeHook(parentVal: ?Array<Function>, childVal: ?Function | ?Array<Function>): ?Array<Function> {
  const res = childVal ? (parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal]) : parentVal;
  return res ? dedupeHooks(res) : res;
}

function dedupeHooks(hooks) {
  const res = [];
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res;
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook;
});
```

## 钩子函数的包装

在实际的 vm.\$options[hook] 属性上你能看到最终的效果：

{% asset_img lifecycle-hook.png %}

以下是对 hook 钩子方法的处理，中间包裹了一个错误处理的逻辑：

```js
// src\core\instance\lifecycle.js

function callHook(vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  const handlers = vm.$options[hook];
  const info = `${hook} hook`;
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit("hook:" + hook);
  }
  popTarget();
}
```

能看到这个 error 处理中包含 call 执行操作，就这样对应的生命周期钩子得到了执行：

```js
// src\core\util\error.js

function invokeWithErrorHandling(handler: Function, context: any, args: null | any[], vm: any, info: string) {
  let res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`));
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res;
}
```

# 总结

接触了第一个生命周期钩子 beforeCreate ，进入 callHook 看了生命周期方法是如何执行起作用的。

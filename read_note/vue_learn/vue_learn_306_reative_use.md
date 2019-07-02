# Vue 数据响应-使用举例

回顾上篇结尾，全文搜索 Vue 会发现三处地方新建 Watcher 对象:

- initComputed 初始化 computed 属性
- Vue.prototype.\$watch
- Vue.prototype.\$mount mountComponent 渲染组件

这里选一例简单的 **initComputed** 先来说明

## initComputed

首先回忆下 initComputed 出现在哪里？

```js
// E:\github\vue\src\core\instance\init.js
function initMixin(Vue: Class<Component>) {
  // ...
  initState(vm);
}

function initState(vm: Component) {
  // ...
  if (opts.computed) initComputed(vm, opts.computed);
}
```

怎么和 Watcher 扯上关系？通过 **initComputed**：

```js
function initComputed(vm: Component, computed: Object) {
  const watchers = (vm._computedWatchers = Object.create(null));
  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
    }
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    }
    // ...
  }
}
```

一开始创建一个空的 watchers 对象，把它当做一个空的容器，后面填充内容。遍历 vm.\$options.computed 上的属性，设置每个属性的 getter 方法。

```js
const userDef = computed[key];
const getter = typeof userDef === 'function' ? userDef : userDef.get;
```

将 getter 当做 expOrFn 参数，交给 Watcher 实例化，这样每个 computed 上每个属性就塞到了 watchers 中。

```js
const computedWatcherOptions = { lazy: true };
// ...
watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
```

最后在 vm 引用上，对属性 key 进行校验，如果 vm.\$data 也设置过 key 则给出 warn 提示。

```js
if (!(key in vm)) {
  defineComputed(vm, key, userDef);
} else {
  warn(``);
}
```

校验通过，则会执行 defineComputed()，设置对象属性：

```js
if (typeof userDef === 'function') {
  sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : createGetterInvoker(userDef);
  sharedPropertyDefinition.set = noop;
}
```

假设 computed 上的 key 属性是一个 function，且首次无缓存，则会进入第一个表达式 createComputedGetter(key)

```js
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}
```

注意到一开始设置的 computedWatcherOptions.lazy = false ，则 createComputedGetter 最终会返回 watcher.value = undefined

```js
class Watcher {
  constructor(vm, options) {
    this.dirty = this.lazy; //false
    this.lazy = !!options.lazy; //false
    vm._watchers.push(this);
    // ...
    this.value = this.lazy ? undefined : this.get();
  }
}
```

这里留意下 watcher 上还有 this.getter 属性并且指向 expOrFn，即 computed 每个 key 属性上的 getter 方法。

同时看到构造函数 Watcher 每次初始化时，会向 **vm.\_watchers** 添加 watcher 实例，在 watcher 被触发调用时，在如下代码将被执行（当然在 initComputed 中不存在调用）

```js
vm._watchers.push(this);
```

```js
class Watcher {
  update() {
    if (this.lazy) {
      // false
      this.dirty = true;
    } else if (this.sync) {
      // false
      this.run();
    } else {
      queueWatcher(this);
    }
  }
}
```

```js
function queueWatcher() {
  // ...
  flushSchedulerQueue();
}
```

```js
// E:\github\vue\src\core\observer\scheduler.js
function flushSchedulerQueue() {
  for (index = 0; index < queue.length; index++) {
    watcher.run();
  }
}
```

```js
class Watcher {
  run() {
    if (this.active) {
      const value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`);
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }
}
```

run() 执行中，则会执行 watcher 对象上的 get()

```js

get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {

    } finally {

    return value
  }
```

这里就会用到 this 上的 getter 属性 得到结果 value ，从而计算属性 computed 的属性 key 就拿到对应的值。

上一篇：[Vue 数据响应-监听 watcher](./vue_learn_305_reactive_watcher.md)

下一篇：[Vue 渲染-render](./vue_learn_401_render_start.md)

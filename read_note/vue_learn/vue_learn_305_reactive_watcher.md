# Vue 数据响应-监听 watcher

在 Dep 中，其实都是对外暴露一些简单的方法，内部调用的其实都用到了 Watch 的 api.

```js
class Dep {
  static target: ?Watcher;
  subs: Array<Watcher>;
  depend() {
    // ...
    Dep.target.addDep(this);
  }
  notify() {
    // ...
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
```

首先看下 **构造函数**

```js
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor(vm: Component, expOrFn: string | Function, cb: Function, options?: ?Object, isRenderWatcher?: boolean) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression = process.env.NODE_ENV !== 'production' ? expOrFn.toString() : '';
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
        process.env.NODE_ENV !== 'production' && warn(`Failed watching path: "${expOrFn}" ` + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }
}
```

初始化一系列参数，并且将表达式函数 **expOrFn** 赋值给 getter ，最后根据是否拦截在来选择执行 get() 。

## Watcher.value

细看下如何定义 **Watcher.value**

```js
this.value = this.lazy ? undefined : this.get(); // 是否懒计算获取
```

**this.lazy** 根据参数列表的 options（参数列表第四个参数） 判断赋值，根据上面两处创建 Watcher 的地方，发现只有在 **initComputed** 才会 this.lazy = true.

## get()

看下相反逻辑 **this.get()** 做了什么？

```js
get () {
    // this 就是 Watcher
    pushTarget(this)
    let value
    const vm = this.vm
    try {
        value = this.getter.call(vm, vm)
    } catch (e) {
        //...
    } finally {
        // "touch" every property so they are all tracked as
        // dependencies for deep watching
        if (this.deep) {
            traverse(value)
        }
        popTarget()
        this.cleanupDeps()
    }
    return value
}
```

首先执行 **pushTarget(this)** ，回过头看下 Dep 漏掉什么代码？

```js
Dep.target = null;
const targetStack = [];

export function pushTarget(target: ?Watcher) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
```

**get()** 调用一开始，**targetStack** 队列为空，调用 pushTarget 后，会在 targetStack 中放入一个 watch 实例对象（this），并且 Dep 订阅对象的 target 指向这个 this 。

之后执行创建 Watcher 时赋值好的 **this.getter** ，即传入的 **expOrFn** ，一个表达式函数。

```js
value = this.getter.call(vm, vm);
```

执行完后，最后 finally 做些收尾动作，并返回 value 赋值给 this.value

```js
finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
        traverse(value)
    }
    popTarget()
    this.cleanupDeps()
}
return value;
```

**popTarget** 移除 targetStack 顶层元素（即前面刚放入的 watcher），Dep.target 重设置为下一个 watcher 对象。

同时会根据 this.deep 来选择是否进行深度解析这个 value 。

## cleanupDeps()

```js
cleanupDeps () {
  let i = this.deps.length
  while (i--) {
    const dep = this.deps[i]
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this)
    }
  }
  let tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
}
```

遍历 Watcher.deps 依赖列表，如果依赖 id 存在于 newDepIds，则移除当前依赖；

通过变量置换，将 newDepIds 互换 depIds，清空 newDepIds；deps 互换 newDeps，清空 newDeps；

上一篇：[Vue 数据响应-观察订阅 dep](./vue_learn_304_reactive_dep.md)

下一篇：[Vue 数据响应-总结](./vue_learn_306_reactive_end.md)

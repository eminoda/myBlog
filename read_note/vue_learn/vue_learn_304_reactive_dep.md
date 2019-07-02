# Vue 数据响应-观察订阅 dep

dep 观察者依赖被多个命令所订阅

> A dep is an observable that can have multiple directives subscribing to it.

比如：在创建 Observer 观察者、定义动态响应 defineReactive 时，就创建了 Dep 对象

```js
class Observer {
  constructor(value: any) {
    this.dep = new Dep();
  }
}
```

```js
function defineReactive() {
  const dep = new Dep();
  // ...
}
```

看下 Dep 代码：

```js
class Dep {
  static target: ?Watcher; // 这是个“共享属性”，目标是 Watcher 对象
  id: number;
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub() {}
  removeSub() {}
  depend() {}
  notify() {}
}
```

初步能想到，Dep 就是个 **事件监听** 的观察者模式。首先看下 addSub 和 removeSub：

```js
addSub (sub: Watcher) {
    this.subs.push(sub)
}
removeSub (sub: Watcher) {
    remove(this.subs, sub)
}
```

这两个方法都是对 **this.subs** 数组进行元素的增减，而 sub 就是 subscribe（订阅）的缩写，用来存放 watcher 监听对象那么一个订阅列表。

先回忆 defineReactive 中的 **setter** ，其中用到了 dep.notify()

```js
set: function reactiveSetter(newVal) {
  //...
  dep.notify();
}
```

**notify** 按照字面意思就是 **通知** 作用，注意里面调用的 watcher.update

notify 中会浅拷贝 subs ，其是一个存放 watcher 对象的监听列表，每个 watcher 创建时，会有个递增的 id 编号。

```js
notify () {
    const subs = this.subs.slice() // 浅拷贝
    if (process.env.NODE_ENV !== 'production' && !config.async) {
        // 非异步按照 id 进行排序
        subs.sort((a, b) => a.id-b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
        // 调用 watcher.update 进行监控
        subs[i].update()
    }
}
```

```js
class Watcher {
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }
}
```

当调用 getter 时，就会调用 **depend**

```js
get: function reactiveGetter() {
  //...
  if (Dep.target) {
    dep.depend();
  }
  // ...
}
```

会先判断是否有 Dep.target ，即判断有无共享属性 watcher，有的话就调用 watcher.addDep

```js
depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
}
```

```js
class Watcher {
  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
}
```

其实上面四个 Dep 的方法都和 Watcher 有关，我们再来看下 Watcher

上一篇：[Vue 数据响应-动态响应 defineReactive](./vue_learn_303_reactive_defineReactive.md)

下一篇：[Vue 数据响应-监听 watcher](./vue_learn_305_reactive_watcher.md)

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

先回忆 defineReactive 的 setter ，其中用到了 dep.notify()

```js
set: function reactiveSetter (newVal) {
    ...
    dep.notify()
}
```

**notify** 按照字面意思就是通知作用，注意里面调用的 watcher.update

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

**depend**

会先判断是否有 Dep.target ，即判断有无共享属性 watcher，有的话就调用 watcher.addDep

```js
depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
}
```

其实上面四个 Dep 的方法都和 Watcher 有关，我们再来看下 Watcher

下一篇：

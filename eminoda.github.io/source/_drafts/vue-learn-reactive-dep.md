---
title: vue 源码学习-数据响应：依赖 Dep
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

我们已经在 **Observer** 类中看到了 **Dep** 的影子，并且在 **getter/setter** 中使用了 **depend** ， **notify** 方法。

```js
class Observer {
  constructor(value: any) {
    this.dep = new Dep();
    //..
  }
}
```

```js
function defineReactive (obj, key,val){
  const dep = new Dep()
  //..
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){}
    set(){}
  }
}
```

他们到底在做什么？本篇来继续探究。

# Dep 依赖对象

**Dep** 我个人认为它是 **Depend** 的缩写，即在此对象中实现 **响应依赖关系** 的。

## 主结构

这是 **Dep** 类的代码主体：

```js
class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub: Watcher) {}

  removeSub(sub: Watcher) {}

  depend() {}

  notify() {}
}
```

此对象中的方法涉及 **队列** 的操作，既然有 **Observer** 观察者，其中肯定也会有订阅者 **subscriber** ，就像 **rxjs** 中的核心概念一样。而这个队列我称为 **订阅队列** ，即：里面存放着一堆 Watcher 监听对象。

事实上，你看到 **vue** 代码的 **flow** 类型说明也能很清楚的看出来。

## Dep 实例怎么被调用

首先是 Observer 对象中：

```js
class Observer {
  constructor(value: any) {
    this.dep = new Dep();
    //..
  }
}
```

你能看到该对象中初始化创建 **Dep** 后，就没有对 **this.dep** 拿出来做什么事情了，但事实不是这样。

将在 **observe** 方法中，将创建观察者对象 **Observer** ，并将这个实例称为 **ob** return 。那么所有拿到 **observe** 返回值的，既可以通过 **ob.dep** 调用依赖 Dep 对象

几乎所有用到 **observe** 方法的地方都没有使用它的返回值，但 **defineReactive** 中使用到了：

```js
function defineReactive() {
  //..
  let childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      //..
      if (childOb) {
        childOb.dep.depend();
        //..
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      //..
      childOb = !shallow && observe(newVal);
    }
  });
}
```

现在我们就代码定义而言，知道了这个 **childOb** 就是 **Observer** 实例，并且通过 **childOb.dep** 调用了 **Dep** 方法。

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

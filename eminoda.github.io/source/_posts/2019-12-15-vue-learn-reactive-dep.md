---
title: vue 源码学习-数据动态响应：依赖 Dep
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-12-15 16:45:35
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

这是 **Dep** 类的代码主体：

```js
// src\core\observer\dep.js
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

此对象中的方法涉及 **队列** 的操作，既然有 **Observer** 观察者，其中肯定也会有订阅者 **subscriber** ，就像 **rxjs** 中的核心概念一样。而这个队列我称为 **订阅队列** ，即：里面存放着一堆 **Watcher** 监听对象。

事实上，你看到 **vue** 代码的 **flow** 类型说明也能很清楚的看出来。

# Dep 实例怎么被调用

首先是 **Observer** 对象中：

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

几乎所有用到 **observe** 方法的地方都没有使用它的返回值，但 **defineReactive** 中使用到了，注意 **childOb** 变量：

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

现在我们就代码定义而言，知道了这个 **childOb** 就是 **Observer** 实例，并且通过 **childOb.dep** 调用了 **Dep** 方法，就这样简单实现了对象引用的依赖关联。

# \_\_ob\_\_ 和 dep 的关系

之前在 **Observer** 类中，通过 **def** 方法，增加了 **\_\_ob\_\_** 属性：

```js
def(value, "__ob__", this);
```

我们知道 **\_\_ob\_\_** 的 **value** 值就是当前 **Observer** 对象的引用 **this** ，这样定义有什么作用？

结合前面说的，我们知道 **Observer** 内含 **Dep** 对象实例 **dep** ，那么得到 **\_\_ob\_\_** 也能获取到这个实例 **dep** 属性。

这样如果遍历某对象的属性，其内含 **\_\_ob\_\_** 属性，我们就知道它是被观察化的，具备数据的动态响应特征。

下面列举几处 **\_\_ob\_\_** 调用 **dep** 的代码例子：

对观察对象中的属性值 **value** 进行判断，如果是 **Array** 则对该 **value** 进行依赖：

```js
function defineReactive (){
  // ...
  Object.defineProperty(obj, key, {
    // ...
    get(){
      if (Array.isArray(value)) {
        dependArray(value)
      }
    }
  }
}
function dependArray(value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    // ...
  }
}
```

**methodsToPatch** 是 **vue** 初始化时针对原生数组方法进行的拦截处理，里面也通过 **\_\_ob\_\_** 调用 **dep** ：

```js
methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    // ...
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});
```

当然还有 **Watch** 对象中的 **traverse** 等其他地方用到 **\_\_ob\_\_** ，我们后面再看。

# depend 和 notify

## depend 创建依赖

很多地方调用了 **depend** 方法，我们来看下它到底做了什么？

```js
depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}
```

**Dep.target** 是个 **Watcher** 对象实例，如果他存在则会执行 **addDep** 。

在 **Watcher** 类中，我们找到了该方法，发现内部最终调用了 **Dep** 的 **addSub** ：

```js
// src\core\observer\watcher.js

addDep (dep: Dep) {
  // ...
  dep.addSub(this)
}
```

**addSub** 的作用就是为 **Dep** 上的 **subs** 堆栈添加新的监听 **Watcher** 对象：

```js
addSub (sub: Watcher) {
  this.subs.push(sub)
}
```

回过头，我们再看 **defineReactive** 方法中的 **getter** 方法：

```js
get: function reactiveGetter() {
  const value = getter ? getter.call(obj) : val;
  if (Dep.target) {
    dep.depend();
    if (childOb) {
      childOb.dep.depend();
      if (Array.isArray(value)) {
        dependArray(value);
      }
    }
  }
  return value;
}
```

现在应该清楚了这段方法的作用：

1. 调用 **obj.key** 触发该 **getter** 方法
2. 判断 **getter** 是否存在，进行预执行，得到一开始的 **value**
3. 如果 **Dep.target** 监听对象存在，对当前 **Dep** 依赖实例进行依赖，触发 addDep

   3.1. 调用 **Watcher** 的 **addDep** 方法，存入当前依赖实例对象 **dep**

   3.2. 进行“依赖判断”（这个判断逻辑，Watcher 篇再说）

   3.3. 将 **Watcher** 实例对象 **this** 引用，添加至 **Dep** 依赖对象的 **subs** 订阅队列

4. 如果其指数型 **childOb** 也被赋予观察特征，那么也对其 **childOb.dep** 属性进行 **addDep**

## notify 通知依赖（触发）

接下来就讲讲 **notify** 方法：

```js
notify () {
  const subs = this.subs.slice()
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```

将之前通过 **depend** 收集的 **subs** 通过一个数组的 **slice** 浅拷贝出来。

而这个 **update** 是属于 Watcher 对象的：

```js
update () {
  // ...
  this.run()
}
```

在这个 **run** 方法中涉及了 **Watcher** 是如何实现 **数据动态响应机制** 的。

中间这个过程我们暂时不去关心，还是回到 **setter** 方法：

```js
set: function reactiveSetter(newVal) {
  const value = getter ? getter.call(obj) : val;
  if (newVal === value || (newVal !== newVal && value !== value)) {
    return;
  }
  // ...
  if (getter && !setter) return;
  if (setter) {
    setter.call(obj, newVal);
  } else {
    val = newVal;
  }
  childOb = !shallow && observe(newVal);
  dep.notify();
}
```

是否触发 **vue** 的数据更新机制，需要判断新老值是否有变化：

```js
if (newVal === value || (newVal !== newVal && value !== value)) {
  return;
}
```

如果没有变化则直接 **return** 。注意这里有个“矛盾的判断”，针对 **NaN** 结果的。

然后如果没有定义 **setter** 但定义了 **getter** 也直接 **return** ，因为一开始就通过 **getter** 预取值过了：

```js
if (getter && !setter) return;
```

如果定义了 **setter** 则通过 **call** 方式调用次：

```js
setter.call(obj, newVal);
```

注意这里有个小细节：重新对 **val** 赋值，因为对 **val** 的引用是个闭包方式（chlidOb 也是个闭包引用），以让 **getter 方法下次能取到更新后的值** ：

```js
val = newVal;
```

得到的 **newVal** 也通过 **observe** 进行观察。

```js
childOb = !shallow && observe(newVal);
```

全局结束后，遍历 **this.subs** 异步队列执行 **update** 方法，通知 Watcher 对象进行数据动态响应：

```js
dep.notify();
```

# 总结

讲了 **Dep** 对象中的 **depend** , **notify** 两个主要方法。回过头看了 **defineReactive** 方法中的 **getter/setter** 是如何触发这两个方法。

同时也加深了对 **Observer** 中定义的 **\_\_ob\_\_** 属性和 **Dep** 对象之间的关系。

下篇将通过对 **Watcher** 对象的解读，理解 **Dep** 和 **Watcher** 之间的联系。

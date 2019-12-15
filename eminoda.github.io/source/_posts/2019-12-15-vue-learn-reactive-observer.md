---
title: vue 源码学习-数据动态响应：观察者 Observer
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-12-15 16:45:29
---


# 前言

我们已经大致了解了初始化工作中 vue 到底做了哪些事情，这篇开始，进入第二大块内容 —— **数据响应**，逐步探究 **vue** 是如何实现数据的动态响应？

再次回顾状态初始化 **initState** 方法：

```js
function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  // ..
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  // ..
}
```

这里先忽略 props 、methods 、computed 、watcher 的“处理工作”，先选 **options.data** 属性作为起点，因为 **data** 使我们开发中最常用的属性，借他了解整个 **动态响应的全貌** ：

```js
function initData(vm: Component) {
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? getData(data, vm) : data || {};
  // 校验 options.data 的合法性
  // ...
  // observe data
  observe(data, true /* asRootData */);
}
```

经过 **initData** 的初始化处理，发现最终调用了观察方法 **observe(data)** ，这是数据动态响应的第一部分。

# observe 观察数据

## 代码主体

先看下方法代码定义：

```js
function observe(value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  let ob: Observer | void;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldObserve && !isServerRendering() && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}
```

## 条件判断

我们知道目前是如何调用此 **observe** 方法的：

```js
observe(data, true /* asRootData */);
```

所以目前参数列表中 **value** 就是 **options.data** ， **asRootData** 值为 **true**：

首先，回去判断某些不做观察的条件：

```js
if (!isObject(value) || value instanceof VNode) {
  return;
}
```

**不做观察的条件** ： **value** 非对象形式，并且不是 **VNode** 虚拟节点对象。

再是，判断 **value** 是否已经被观察过了：

```js
hasOwn(value, "__ob__") && value.__ob__ instanceof Observer;
```

如果 value 对象上含有 **\_\_ob\_\_** 属性，并且该属性是 **Observer** 对象，则直接返回 **\_\_ob\_\_** 属性值：

```js
if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
  ob = value.__ob__;
}
```

接下来是一段很长的判断：

```js
shouldObserve && !isServerRendering() && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue;
```

**shouldObserve** 默认为 **true** ，通过调用 **toggleObserving** 方法来切换其值：

```js
function toggleObserving(value: boolean) {
  shouldObserve = value;
}
```

**shouldObserve** 像是一个开关来控制是否来执行 **observe** 方法，你们在 **vue** 中找到几处 **toggleObserving** 开关的使用。

比如，在对 inject 处理 provide 的传值时的数据封装：

```js
function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm);
  toggleObserving(false);
  Object.keys(result).forEach(key => {
    defineReactive(vm, key, result[key]);
  });
  toggleObserving(true);
}
```

最终 **inject** 上的第一级属性被定义了响应化，但子级属性因为 **toggleObserving(false)** 而直接 **return** ，这就是为何：你更新 inject 相关值时，页面没有更新的原因（有些扯远了）。

**isServerRendering** 判断是否是 SSR 服务端渲染，本文的运行环境是浏览器中，所以这里判断为 **true** 。

后续只要 **value** 符合是 **引用类型对象**（对象字面量、数组），并且是属性可扩展，和非 vue 框架对象 （**\_isVue** 为 **false** ），则会创建 **Observer** 观察者对象：

```js
ob = new Observer(value);
```

# Observer 观察者对象

## 代码主体

这是 **Observer** 类的代码主体：

```js
class Observer {
  constructor(value: any) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      // ...
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  walk() {
    defineReactive();
  }
  observeArray() {
    observe();
  }
}
```

首先我们先看下 **Observer** 的基本属性：

```js
this.value = value;
this.dep = new Dep();
this.vmCount = 0;
```

每次新建的 Observer 对象将初始化一个 **Dep** 对象（这块下篇再看）定义为 **this.dep** ，并且还会初始化 **this.value** 待观察对象，**this.vmCount** 。

## 对象属性 \_\_ob\_\_

在 **value** 对象上新增一个观察属性 **\_\_ob\_\_**：

```js
def(value, "__ob__", this);
```

**def** 方法内部就是通过定义 **数据类型属性** ：

```js
Object.defineProperty(obj, key, {
  value: val,
  enumerable: !!enumerable,
  writable: true,
  configurable: true
});
```

注意这里的 **enumerable** 为 **false** ，会在遍历 value 是屏蔽掉当前属性 **\_\_ob\_\_** 。这个属性 **\_\_ob\_\_** 以后有什么用，我们在 **Dep** 对象中再看。

先跳过 **Array.isArray(value)** 的判断，直接调用 **this.walk** 方法：

```js
this.walk(value);
```

```js
walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
    }
}
```

**walk** 会遍历 **value** 上的所有属性（除了 **\_\_ob\_\_**），并通过 **defineReactive** 定义 **响应式数据** 。

## 数组拦截

再回到数据类型的判断：

```js
if (Array.isArray(value)) {
  if (hasProto) {
    protoAugment(value, arrayMethods);
  } else {
    copyAugment(value, arrayMethods, arrayKeys);
  }
  this.observeArray(value);
}
```

首先我们知道 **\_\_proto\_\_** 是个有争议的属性，因为他不属于 Web 规范，只是被浏览器厂商实现着，用来访问对象 [[Prototype]] 属性。

所以 **vue** 会有如下工具函数 **hasProto**

```js
"__proto__" in {};
```

判断当前环境是否支持 **hasProto** 分别调用 **protoAugment** 、 **copyAugment** 来对 **value** 数组上的每个元素进行针对数组类型的数据做响应。

根据 **Array.prototype** 创建数组（方法）对象 **arrayMethods** ，通过 **def** 设置 **mutator** 方法，如果数组数据涉及变化（ **push、unshift、splice** ）则再次调用 **notify** 触发数据响应：

```js
methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});
```

上面就是 vue 怎么对原生数组方法进行拦截的代码，有兴趣可以细看。

解析完数组队列后，最后执行 **this.observeArray** ：

```js
observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i])
    }
}
```

内部还是执行 **observe** 方法。

假设你在 data 上定义了一个数组数据，最后的结果就会长成这样：

{% asset_img arrayOb.png 数组每个元素都添加了 __ob__ %}

# defineReactive 响应式数据的定义

已经知道，无论是否是 **Array** 类型的数据， **value** 最终都会调用 **walk** 方法，执行 **defineReactive**

```js
walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
    }
}
```

## 代码主体

现在来看下 **defineReactive** 的代码：

```js
function defineReactive(obj: Object, key: string, val: any, customSetter?: ?Function, shallow?: boolean) {
  const dep = new Dep();

  // ...

  let childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      // depend ...
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      // ...
      // notify ...
    }
  });
}
```

## 创建 Dep 对象

已进入该方法，就看到了新建了 **Dep** 对象，并定义为 **dep** ，这个是依赖对象，我们目前只需知道每个对象属性都会调用 **defineReactive** 方法，并且都会创建 Dep 实例。具体下篇再细谈。

```js
const dep = new Dep();
```

## 合法验证

### 对象属性是否可配置

根据对象属性描述特征 **configurable** 来判断是否要进行数据动态响应定义：

```js
const property = Object.getOwnPropertyDescriptor(obj, key);
if (property && property.configurable === false) {
  return;
}
```

如果特性 **configurable** 为 **false** ，就没有之后的意义了（将对象属性定义为 **访问器属性** ）。

### 预取值

我们通常在 **data** 选项属性上会定义 {name:'foo'} ，是有值的，但没有定义 getter 函数。所以需要通过某种方式来事先计算一次：

```js
const getter = property && property.get;
const setter = property && property.set;
if ((!getter || setter) && arguments.length === 2) {
  val = obj[key];
}
```

那如果 **getter** 存在呢？那就会在底下的 **getter/setter** 中执行 **getter.call()** 进行执行赋值操作。

```js
const value = getter ? getter.call(obj) : val;
```

## 判断子元素是否需要观察

```js
let childOb = !shallow && observe(val);
```

如果我们的数据是这样（对象嵌套）：

```js
data:{
    user:{
        name:'eminoda',
        child:{
            name:'sxh'
        }
    }
}
```

当第一次遍历 **user** 时，当前的 **val** 就是 **child** 对象，需要继续通过 **observe** 观察。

得到 **childOb** ，供后续逻辑使用。

## 对象属性定义访问器属性

```js
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter() {},
  set: function reactiveSetter(newVal) {}
});
```

### getter

首先通过 getter ，来预执行：

```js
const value = getter ? getter.call(obj) : val;
```

然后就是判断 **Dep.target** ：

```js
if (Dep.target) {
  dep.depend();
  if (childOb) {
    childOb.dep.depend();
    if (Array.isArray(value)) {
      dependArray(value);
    }
  }
}
```

当然目前没不知道这个 **Dep.target** 是什么，不过从代码上看，当它存在时，就会调用 **depend** 来执行依赖相关操作。

### setter

第一步还是根据判断 **getter** 进行预执行操作，获得 **value** 。

之后判断 **newVal** 和 **value** 是否有变化？

```js
if (newVal === value || (newVal !== newVal && value !== value)) {
  return;
}
```

值得一提的是，**newVal !== newVal** 这样的矛盾判断有什么用？你可以运行下如下代码：

```js
Number("foo") == Number("foo"); //false
```

然后通过 **customSetter** 在开发模式打印些 warn 信息：

```js
if (process.env.NODE_ENV !== "production" && customSetter) {
  customSetter();
}
```

如果 **getter && !setter** 就没必要继续之后操作了，直接 **return** 。

如果定义了 **setter** 函数，则会执行下：

```js
if (setter) {
  setter.call(obj, newVal);
} else {
  val = newVal;
}
```

最后将这个新 **newVal** 进行观察，同时出发 **notify** 进行依赖更新：

```js
childOb = !shallow && observe(newVal);
dep.notify();
```

# 总结

本文篇幅较长，尽可能把 vue 数据动态响应的第一部分原理说明白了。

通过 **observe** 方法判断对象上，那些属性需要观察，来新建对应的 **Observer** **观察者对象。Observer** 内部循环遍历属性，调用 **definedReactive** 来定义动态响应方式。

这个动态响应的基本原理还是基于对象的访问属性 getter/setter 。

其内部真正实现数据的响应机制，还是要看之后的 **Dep** 和 **Watcher** 对象。

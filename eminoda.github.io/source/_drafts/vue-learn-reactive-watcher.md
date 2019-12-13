---
title: vue 源码学习-数据响应：监听者 Watcher
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

通过 **Observer** 和 **Dep** 对象的学习，我们大致已经对 vue 内部是如何定义数据动态响应方式的， **Dep** 内部和 **Watcher** 对象互相交织着，形成动态响应机制。

现在就开始看 **Watcher** 对象，看其中是怎么个设计方式。

# Watcher 对象

## 对象创建

既然 **Watcher** 是个对象，那肯定有 **new** 的地方，但似乎我们现在都没有看到这样 **new Watcher()** 的操作。

其实 **vue** 完成所有的初始化动作后，就会定义 **mount** 函数，内部完成渲染相关的工作，这里不做展开，到渲染函数篇在细看。

如下就是一个 Watcher 对象的创建操作：

```js
function mountComponent() {
  // ...
  callHook(vm, "beforeMount");
  // ...
  let updateComponent = () => {
    vm._update(vm._render(), hydrating);
  };
  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, "beforeUpdate");
        }
      }
    },
    true /* isRenderWatcher */
  );
}
```

当然 **Vue.prototype.\$watch** 内部也创建该对象：

```js
Vue.prototype.$watch = function() {
  // ...
  const watcher = new Watcher(vm, expOrFn, cb, options);
  // ...
};
```

我们也知道 **computed** 和 **watch** 选项属性使用上也大致相同，所以 **computed** 内部也是用 **Watcher** 创建的：

```js
function initComputed(vm: Component, computed: Object) {
  const watchers = (vm._computedWatchers = Object.create(null));
  for (const key in computed) {
    watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
  }
  // ...
}
```

## 主结构

大致知道了 **Watcher** 对象的创建，我们来看其代码：

```js
// src\core\observer\watcher.js

class Watcher {
  constructor(vm: Component, expOrFn: string | Function, cb: Function, options?: ?Object, isRenderWatcher?: boolean) {
    // ...
    this.value = this.lazy ? undefined : this.get();
  }

  get() {}

  addDep(dep: Dep) {}

  cleanupDeps() {}

  update() {}

  run() {}

  evaluate() {}

  depend() {}

  teardown() {}
}
```

## 属性初始化

如果我们以 **\$mount** 中的 **Watcher** 作为切入点，那么 **Watcher** 对象的创建后，其构造函数收到的值将是这样：

```js
class Watcher {
  // (this,function,function,{before:function},true)
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    // ...
  }
}
```

初始化基础属性：

```js
// options
if (options) {
  this.deep = !!options.deep; // false
  this.user = !!options.user; // false
  this.lazy = !!options.lazy; // false
  this.sync = !!options.sync; // false
  this.before = options.before; // false
} else {
  this.deep = this.user = this.lazy = this.sync = false; // false
}
```

```js
this.cb = cb;
this.id = ++uid; // uid for batching
this.active = true;
this.dirty = this.lazy; // for lazy watchers // false
```

除了 **this.active** 为 **true** ，其他用于判断的属性都为 **false** 。（再次强调下，这里是以 **\$mount** 中的 **new Watcher** 的参数为切入点）

初始化依赖对象：

```js
this.deps = [];
this.newDeps = [];
this.depIds = new Set();
this.newDepIds = new Set();
```

看这些属性的名字，基本能猜出：这些属性将是 **Watcher** 和 **Dep** 进行交互通讯的桥梁。

解析 **expOrFn** ，得到 **getter** 方法：

```js
if (typeof expOrFn === "function") {
  this.getter = expOrFn;
} else {
  this.getter = parsePath(expOrFn);
}
```

最后根据 **this.lazy** (false) ，运行 **get** 方法，得到 **this.value** ：

```js
this.value = this.lazy ? undefined : this.get();
```

下面我们从构造函数 **get** 方法开始，看数据响应机制是如何实现的。

# get 预取值

**get** 方法代码：

```js
get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      // ...
    } finally {
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
```

## 进栈

当 **Watcher** 对象初始化后，就会触发 **get** 方法，第一步就调用 **pushTarget** ，我们来看下内部原理：

```js
// src\core\observer\dep.js
Dep.target = null;
const targetStack = [];

function pushTarget(target: ?Watcher) {
  targetStack.push(target);
  Dep.target = target;
}
```

**vue** 声明时，就定义好了 **Dep.target** 属性，当调用 **Watcher** 调用 后，将 **Watcher** 实例引用 **this** 赋值给 **Dep.target** ，同时也放入监听堆栈队列 **targetStack** 。

## 执行 getter

定义完 **Dep.target** 后，马上执行 **this.getter** 方法：

```js
value = this.getter.call(vm, vm);
```

而这个方法就是前面提到的 **updateComponent** ，我打了个 **debugger** 来说明这问题：

{% asset_img getter.png %}

**call** 执行完后，并不会跳到最后的出栈方法 **popTarget** ，而是转到了我们前面 **definedReactive** 中定义的 **getter** 方法：

{% asset_img get.png %}

因为我们的模板可能这样：

```html
<div>{{name}}</div>
```

这样就涉及到观察对象上属性的**取值**操作，所以触发了 **getter** 。

中间触发的依赖关系待会儿再说。

## 出栈

获取到 value 后，则执行 **popTarget** 出栈：

```js
function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
```

## 刷新队列

调用 **cleanupDeps** 方法，来更新 dep 相关的属性：

```js
cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
	// 1 处理 id依赖集合
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
	// 2 处理 依赖队列
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
```

**this.deps** 是个数组，它是哪里有数据塞入的？就是在 **cleanupDeps** 方法中。

上面 **1** 和 **2** 分别是对 **id 依赖集合** 和 **依赖队列** 做置换顺序：

```js
let tmp = this.depIds; // 历史 id依赖集合
this.depIds = this.newDepIds; // depIds 得到：由 addDep 方法添加的 id依赖集合
this.newDepIds = tmp;
```

这样 **depIds** 得到最新的 **id 依赖集合** ， **newDepIds** 最后被清空。

```js
tmp = this.deps;
this.deps = this.newDeps;
this.newDeps = tmp;
this.newDeps.length = 0;
```

```js
```

# 依赖 Dep 和监听 Watcher 的关系

我认为这是真正的数据动态响应机制。

前面提到的的 **Observer** 只是对我们的对象数据进行观察； **definedReative** 只是提供了响应“动力”，或者是触发点。

而当数据真正响应后，其内部通过有 **Dep** 对象提供的 **depend、notify** 方法和 **Watcher** 之间的交互才是真正的机制。

## 添加依赖 addDep

我们知道当被观察对象的属性被调用了，则触发了 **definedReative** 中的 **getter** 方法。

内部调用了 **dep.depend()** 方法，最终执行到了 **Watcher** 的 **addDep** ：

```js
// defineReactive getter
dep.depend();

// Dep
depend () {
	Dep.target.addDep(this)
}

// Watcher
addDep (dep: Dep) {
	const id = dep.id
	if (!this.newDepIds.has(id)) {
		this.newDepIds.add(id)
		this.newDeps.push(dep)
		if (!this.depIds.has(id)) {
			dep.addSub(this)
		}
	}
}
```

我们来细看中间是什么逻辑：

程序开始执行时，**this.newDeps = []** 和 **this.newDeps，this.depIds** 为空集合，然后调用 **dep** 实例，往 **dep.subs** 订阅队列添加 **Watcher** 对象。

```js
// Dep
addSub (sub: Watcher) {
	this.subs.push(sub)
}
```

## 依赖通知 notify

当我们更新数据时，就触发了 **definedReative** 中的 **setter** 方法，调用了 **dep.notify()** 。

notify 内部调用了 **Watcher** 对象 **update** 方法：

```js
dep.notify()

notify () {
	subs[i].update()
}
```

```js
update () {
	if (this.lazy) {
		this.dirty = true
	} else if (this.sync) {
		this.run()
	} else {
		queueWatcher(this)
	}
}
```

在 **update** 方法内部，根据同步属性 **sync** 判断是执行 **run** 还是 **queueWatcher** 。

当然目前不管那么复杂的条件，就先看 **run** 方法，因为 **queueWatcher** 最终还是要执行它的。

## 依赖执行 run

这是 run 的主体代码：

```js
run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
		// ...
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
```

能看到内部又去执行了 **预期值 get** 方法。并且最后把新老 **value** 交给 **cb** 方法，这也就是我们在调用 **watch api** 时，有数据更新前后的值的原因。

```js
```

```js
```

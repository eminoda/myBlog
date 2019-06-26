<!-- vue_learn--响应式-监听 watcher -->
# 监听 watcher

在 Dep 中，其实都是对外暴露一些简单的方法，内部调用的其实都和 Watcher 相关。

````js
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

  ...
````

看下几个重点方法，首先构造函数，接受哪几个个参数
````js
constructor (
    vm: Component,
    expOrFn: string | Function, // 表达式
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
) {
    ...
}
````

初始化一些属性
````js
// options
if (options) {
    this.deep = !!options.deep
    this.user = !!options.user
    this.lazy = !!options.lazy
    this.sync = !!options.sync
    this.before = options.before
} else {
    this.deep = this.user = this.lazy = this.sync = false
}
...
````

解析 **expOrFn** 到 getter 属性上
````js
// parse expression for getter
if (typeof expOrFn === 'function') {
    this.getter = expOrFn
} else {
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(...)
    }
}
````

现在看下那几处创建了 Watcher 对象？

1. Vue.prototype.$mount

    initMixin 初始化最后调用 **原型方法 $mount**

    ````js
    function initMixin(){
        ...
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
    
    ````
    ````js
    Vue.prototype.$mount = function(){
        ...
        return mountComponent(this, el, hydrating)
    }
    ````
    ````js
    // src\core\instance\lifecycle.js
    function mountComponent (){
        ...
        callHook(vm, 'beforeMount')
        ...
        updateComponent = () => {
            vm._update(vm._render(), hydrating)
        }
        ...
        new Watcher(vm, updateComponent, noop, {
            before () {
                if (vm._isMounted) {
                    callHook(vm, 'beforeUpdate')
                }
            }
        }, true /* isRenderWatcher */)
    }
    ````

2. initComputed

    初始化initState时，处理 vm 选项上的 computed
    ````js
    const computedWatcherOptions = { lazy: true }
    function initComputed (){
        ...
        if (!isSSR) {
            // create internal watcher for the computed property.
            watchers[key] = new Watcher(
                vm,
                getter || noop,
                noop,
                computedWatcherOptions
            )
        }
        ...
    }
    ````

初步确定上面两处地方创建了 Watcher 对象，都是在初始化的时候（渲染上、计算属性上）

最后再看下如何定义 **this.value**

````js
this.value = this.lazy ? undefined : this.get() // 是否懒计算获取
````

**this.lazy** 根据参数列表的 options（参数列表第四个参数） 判断赋值，根据上面两处创建 Watcher 的地方，发现只有在 **initComputed** 才会 this.lazy = true.

看下相反逻辑 **this.get()** 做了什么？

````js
get () {
    // this 就是 Watcher
    pushTarget(this)
    let value
    const vm = this.vm
    try {
        value = this.getter.call(vm, vm)
    } catch (e) {
        ...
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
````

首先执行 **pushTarget(this)** ，回过头看下 Dep 漏掉什么代码？
````js
// 初始化时，Dep.target 为空
Dep.target = null
const targetStack = []

// 塞一个watch对象，同时刷新最新target
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

// 移除最新一个watch对象，最新target为队列最后个
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length-1]
}
````

维护一个 watcher 监听的队列 **targetStack，同时保存一个唯一的** Dep.target watcher 对象。

之后执行创建 Watcher 时定义的 **this.getter** ，来执行 **expOrFn**
````js
value = this.getter.call(vm, vm)
````

执行完后，最后 finally 做些收尾动作，并返回 value 赋值给 this.value
````js
if (this.deep) {
    traverse(value)
}
popTarget()
this.cleanupDeps()
...
return value;
````
<!-- vue_learn--initState -->
# initState

对 vm.$options 上挂在的 **props，methods，data，computed，watch** 进行初始化，同样也会进行 defineReactive 的定义。

````js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
````

## initProps
遍历 props(opts.props) 上的属性，校验命名合法性，定义 defineReactive
````js
function initProps (vm: Component, propsOptions: Object) {
  ...
  // 1
  for (const key in propsOptions) {
    const hyphenatedKey = hyphenate(key)
    // 2
    if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
      warn(...)
    }
    // 3
    defineReactive(props, key, value)
  }
  ...
}
````

## initMethods
相对简单，直接遍历 methods 上的属性。
````js
const props = vm.$options.props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      warn(...);
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
````
**bind(methods[key], vm)** 封装一个绑定 vm 作用域的函数，如果有 [bind定义中的疑问，请访问看下](https://github.com/eminoda/myBlog/issues/14)


## initData
// TODO isReserved 为何要判断 $ _
````js
function initData (vm: Component) {
  let data = vm.$options.data
  ...
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    // 检验合法
    ...
  }
  // observe data
  // 观察 data
  observe(data, true /* asRootData */)
}

````

## initComputed
````js
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  ...

  for (const key in computed) {
    // 获取定义的执行函数，放到getter中
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(...)
    }
    // TODO 为何要创建一个 Watcher 对象
    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }
    if (!(key in vm)) {
      // TODO 为何要判断不在 vm 的 key
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      warn(...)
    }
  }
}
````

## initWatch
根据条件创建 Watch 对象
````js
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    ...
    createWatcher(vm, key, handler)
  }
}
````
调用 vm.$watch
````js
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  ...
  return vm.$watch(expOrFn, handler, options)
}
````

下一篇：[初始化-initProvide](./vue_learn_init_initProvide.md)
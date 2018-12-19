<!-- vue_learn--initInjections -->
# initInjections
方法定义
````js
export function initInjections (vm: Component) {
  ...
}
````

首先会解析 inject 属性，如果没用过 inject，先看下 [provide / inject 用法介绍](https://cn.vuejs.org/v2/api/#provide-inject)
````js
const result = resolveInject(vm.$options.inject, vm)
````
````js
export function resolveInject (inject: any, vm: Component): ?Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // 1. 判断是否有 Symbol&& Reflect函数，即使没有会返回 inject 上的属性
    const keys = hasSymbol
      ? Reflect.ownKeys(inject).filter(key => {
        /* istanbul ignore next */
        return Object.getOwnPropertyDescriptor(inject, key).enumerable
      })
      : Object.keys(inject)
    // 2. 遍历 inject 属性key
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = inject[key].from
      let source = vm
      while (source) {
        //  3. 判断当前实例中 是否有 _provided 属性，一层层网上查询
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      if (!source) {
        // 4. 取默认 default 定义值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
````

可能会疑惑 _provided 在哪里定义，其实和 inject 对应的 initProvide 中处理这段逻辑。


当成功解析到inject的结果后，就执行 defineReactive 定义动态监听对象上的属性。这块内容放到第二个板块再看。
````js
if (result) {
    // 注意 这里有个控制 观察者打开监听的方法。控制 shouldObserve
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(...)
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
````

下一篇：[初始化-initState](./vue_learn_init_initState.md)
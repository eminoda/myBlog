# Vue 初始化-Injections

```js
initInjections(vm); // resolve injections before data/props
```

这里开始会有相关动态响应的方法出现，例如： observe defineReactive 、watch ，我们先一律跳过。

```js
export function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(`Avoid mutating an injected value directly since the changes will be ` + `overwritten whenever the provided component re-renders. ` + `injection being mutated: "${key}"`, vm);
        });
      } else {
        defineReactive(vm, key, result[key]);
      }
    });
    toggleObserving(true);
  }
}
```

首先会通过 **resolveInject** 解析 **vm.\$options.inject** 属性：

```js
const result = resolveInject(vm.$options.inject, vm);
```

可以先看下 [provide / inject 用法介绍](https://cn.vuejs.org/v2/api/#provide-inject)，以熟悉该属性的作用。

> provide 和 inject 主要为高阶插件/组件库提供用例。并不推荐直接用于应用程序代码中。

```js
export function resolveInject(inject: any, vm: Component): ?Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null);
    // 1. 获取 inject 对象上的属性 key
    const keys = hasSymbol
      ? Reflect.ownKeys(inject).filter(key => {
          /* istanbul ignore next */
          return Object.getOwnPropertyDescriptor(inject, key).enumerable;
        })
      : Object.keys(inject);
    // 2. 遍历 inject 属性key
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const provideKey = inject[key].from;
      let source = vm;
      while (source) {
        //  3. 判断当前实例中 是否有 _provided 属性，一层层网上查询
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break;
        }
        source = source.$parent;
      }
      if (!source) {
        // 4. 取默认 default 定义值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function' ? provideDefault.call(vm) : provideDefault;
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm);
        }
      }
    }
    return result;
  }
}
```

可能会疑惑 **\_provided** 在哪里定义，其实和 inject 对应的 initProvide 中处理这段逻辑。不过 inject/provide 是针对父子组件所用。

当成功解析到 inject 的结果后，就执行 defineReactive 定义动态监听对象上的属性。这块内容放到第二个板块再看。

```js
defineReactive(vm, key, result[key]);
```

上一篇： [Vue 初始化-生命周期钩子](./vue_learn_207_init_lifeHook.md)

下一篇： [Vue 初始化-initState](./vue_learn_209_init_state.md)

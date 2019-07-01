# Vue 初始化-initState

```js
initState(vm);
```

实现如下：

```js
export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

对 **vm.\$options** 上挂在的 **props，methods，data，computed，watch** 进行初始化。内部统一都调用了 defineReactive 进行动态绑定。

## initProps

代码如下：

```js
function initProps(vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {};
  const props = (vm._props = {});
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = (vm.$options._propKeys = []);
  const isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  for (const key in propsOptions) {
    keys.push(key);
    const value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
        warn(`"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`, vm);
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(`Avoid mutating a prop directly since the value will be ` + `overwritten whenever the parent component re-renders. ` + `Instead, use a data or computed property based on the prop's ` + `value. Prop being mutated: "${key}"`, vm);
        }
      });
    } else {
      defineReactive(props, key, value);
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key);
    }
  }
  toggleObserving(true);
}
```

先通过 **validateProp** 对 props 上的属性进行校验初始化，并会结合 [propsData](https://cn.vuejs.org/v2/api/#propsData) 判断 Boolean 类型，且未设置 default 的初始化值。

```js
const value = validateProp(key, propsOptions, propsData, vm);
```

```js
// E:\github\vue\src\core\util\props.js

function validateProp(key: string, propOptions: Object, propsData: Object, vm?: Component): any {
  const prop = propOptions[key];
  const absent = !hasOwn(propsData, key);
  let value = propsData[key];
  // boolean casting
  const booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      const stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    // skip validation for weex recycle-list child component props
    !(__WEEX__ && isObject(value) && '@binding' in value)
  ) {
    assertProp(prop, key, value, vm, absent);
  }
  return value;
}
```

最后如果 value === undefined ，则会核对 default 默认值。如果设置了 default 且为 function，则会执行获得新的 value，并且推给 observe 动态监听。

```js
function getPropDefaultValue(vm: ?Component, prop: PropOptions, key: string) {
  const def = prop.default;
  //...
  return typeof def === 'function' && getType(prop.type) !== 'Function' ? def.call(vm) : def;
}
```

最后遍历 props 所有属性，并定义动态绑定

```js
for (const key in propsOptions) {
  defineReactive(props, key, value);
}
```

## initMethods

相对简单，直接遍历 **methods** 上的属性，最后将这些属性 bind 到 vm 上。

根据如下代码的 warn，知道 methods 属性最好别和 props，vm 上的属性重名。

```js
function initMethods(vm: Component, methods: Object) {
  const props = vm.$options.props;
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof methods[key] !== 'function') {
        warn(`Method "${key}" has type "${typeof methods[key]}" in the component definition. ` + `Did you reference the function correctly?`, vm);
      }
      if (props && hasOwn(props, key)) {
        warn(`Method "${key}" has already been defined as a prop.`, vm);
      }
      if (key in vm && isReserved(key)) {
        warn(`Method "${key}" conflicts with an existing Vue instance method. ` + `Avoid defining component methods that start with _ or $.`);
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}
```

**bind(methods[key], vm)** 封装一个绑定 vm 作用域的函数，如果有 [bind 定义中的疑问，请访问看下](https://github.com/eminoda/myBlog/issues/14)

## initData

获取 **options.data** ，将 data 上的属性做个校验，如果和 methods、props 属性相同给予警告，最后交给 observe 观察。

```js
function initData(vm: Component) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
  if (!isPlainObject(data)) {
    data = {};
    process.env.NODE_ENV !== 'production' && warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
  }
  // proxy data on instance
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm);
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(`The data property "${key}" is already declared as a prop. ` + `Use prop default value instead.`, vm);
    } else if (!isReserved(key)) {
      // TODO isReserved 为何要判断 \$ \_
      proxy(vm, `_data`, key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}
```

## initComputed

[如同 computed 的描述](https://cn.vuejs.org/v2/api/#computed)：计算属性将被混入到 Vue 实例中。所有 getter 和 setter 的 this 上下文自动地绑定为 Vue 实例。

遍历所有 computed 属性，获取内部的 getter 方法，交给 watch 监控。

```js
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
```

初始化计算属性中，会对每个属性创建一个 watchers。

## initWatch

根据条件创建 Watch 对象

```js
function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key];
    //...
    createWatcher(vm, key, handler);
  }
}
```

调用 vm.\$watch

```js
function createWatcher(vm: Component, expOrFn: string | Function, handler: any, options?: Object) {
  //...
  return vm.$watch(expOrFn, handler, options);
}
```

```js
Vue.prototype.$watch = function(expOrFn: string | Function, cb: any, options?: Object): Function {
  const vm: Component = this;
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options);
  }
  options = options || {};
  options.user = true;
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value);
    } catch (error) {
      handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`);
    }
  }
  return function unwatchFn() {
    watcher.teardown();
  };
};
```

注意到 initWatch 和 initComputed 内部都是创建一个 watcher 对象来监听属性的变化，参照官网的解释，[计算属性缓存 vs 方法](https://cn.vuejs.org/v2/guide/computed.html#%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E7%BC%93%E5%AD%98-vs-%E6%96%B9%E6%B3%95)，应该能知道其中的区别。

上一篇： [Vue 初始化-Injections](./vue_learn_208_init_inject.md)

下一篇： [Vue 初始化-provide](./vue_learn_210_init_provide.md)

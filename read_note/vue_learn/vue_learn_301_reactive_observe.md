# Vue 数据响应-赋予观察属性 observe

从本文开始，结束 Vue **初始化** 流程。开始了解 Vue 如何对数据进行观察，以及动态响应的。

先来看下哪里会触发 observe 观察相关方法？

## initData

注意到 **initState** 中的 **initData** 有调用：

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
      proxy(vm, `_data`, key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}
```

## getData()

在进入 observe 之前，详细看下 initData 中会做什么操作？

首先会调用 getData() ：

```js
data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
```

在 Vue 初始化时，会对 data 选项进行对应的 mergeOptions 操作，那时返回的是一个 function。

```js
function mergeDataOrFn(parentVal: any, childVal: any, vm?: Component) {
  return function mergedDataFn() {
    return; //...
  };
}
```

getData 执行后，就会返回 merge 处理后的 vm.\$options.data ：

```js
function getData(data: Function, vm: Component): any {
  pushTarget();
  return data.call(vm, vm);
  popTarget();
}
```

然后建立一个新的 vm 内部属性 vm.\_data：

```js
data = vm._data;
```

## proxy()

初始化好 data 后，会遍历 data 上的所有属性，并对属性做命名校验，最后对 \_data 进行代理

```js
const keys = Object.keys(data);
const props = vm.$options.props;
const methods = vm.$options.methods;
let i = keys.length;
while (i--) {
  const key = keys[i];
  // ...
  proxy(vm, `_data`, key);
}
```

proxy 会在 vm[key] 上绑定 getter/setter 对象属性，并且设置的是数据源为 \_data[key]

```js
function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

## observe()

准备工作做完后，就正式调用 observe()

```js
observe(data, true /* asRootData */);
```

observe() 代码如下：

```js
export function observe(value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  let ob: Observer | void;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
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

执行流程：

- 判断被观察对象 value 是否已具备观察属性 \_\_ob\_\_，以及是否是 **Observer** 类型
- 符合条件，创建 **Observer** 对象，赋给 ob 变量
- vmCount 计数
- 最后返回 ob

之后看下 Observer 怎么创建观察者对象。

上一篇：[Vue 初始化-总结](./vue_learn_211_init_end.md)

下一篇：[Vue 数据响应-观察者 Observer](./vue_learn_302_reactive_Observer.md)

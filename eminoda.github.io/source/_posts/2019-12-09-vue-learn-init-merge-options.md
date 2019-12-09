---
title: vue 源码学习-初始化：属性合并
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-12-09 13:29:16
---

# 前言

上篇，借助生命周期图简单介绍了整个 Vue 的声明过程，这篇开始正式进入 **Vue.prototype.\_init** 方法，以其为起始点，看整个 Vue 的内部代码逻辑。

# 初始化 \_init()

先看下整个初始化的代码（因为排版，略作删减，有需要还是 clone 整个项目查看，后续不再做说明）：

```js
Vue.prototype._init = function(options?: Object) {
  const vm: Component = this;
  vm._uid = uid++;

  // ...

  vm._isVue = true;
  // merge options
  if (options && options._isComponent) {
    initInternalComponent(vm, options);
  } else {
    vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
  }
  if (process.env.NODE_ENV !== "production") {
    initProxy(vm);
  } else {
    vm._renderProxy = vm;
  }

  vm._self = vm;
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, "beforeCreate");
  initInjections(vm); // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook(vm, "created");

  // ...

  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
};
```

# 属性合并 mergeOptions

我们定义 **Vue** 对象的参数，会被 **\_init** 方法接收，并作为 options 选项对象参数：

```js
{
  el: "#app",
  data: {
    message: "Hello Vue!"
  }
}
```

```js
Vue.prototype._init = function(options?: Object) {};
```

之后会判断 options.\_isComponent ，当然现在肯定为 false ，随后程序会调用 **mergeOptions** 方法，进行合并选项参数的工作：

```js
vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
```

## Constructor 解析

如果你愿意可以看下，它是怎么对 this 上的 Constructor 引用做解析的：

```js
export function resolveConstructorOptions(Ctor: Class<Component>) {
  let options = Ctor.options;
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super);
    const cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions;
      const modifiedOptions = resolveModifiedOptions(Ctor);
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options;
}
```

最后结果就是通过递归该方法，把 vm.constructor 上的父类引用 Ctor.super 的属性和当前对象引用 Ctor 的属性做继承，合并成一个符合要求的 options 返回。

不过有些其他的概念可以说下，我们知道一个构造函数声明后，会有个 prototype 原型对象，并且原型对象有个 constructor 指针指回构造函数，代码如下：

```js
function Parent(options) {
  this.name = options.name;
  this.age = options.age;
}

function Child(options) {
  Parent.call(this, options);

  this.nickname = options.nickname;
  this.resolveConstructor(this.constructor);
}

Child.prototype.resolveConstructor = function(Ctor) {
  log("Ctor", Ctor); //Ctor.options [Function: Child]
  log("Ctor.prototype", Ctor.prototype); // Child { resolveConstructor: [Function] }
  log("Ctor.nickname", Ctor.nickname); // undefined
};
var child = new Child({ name: "eminoda", nickname: "e", age: 29 });
```

## normalize 标准化选项

解析完 **Constructor** 后，就进入 **mergeOptions** 方法了，然后迎来针对 props、inject、directives 的 **标准化解析**：

```js
export function mergeOptions(parent: Object, child: Object, vm?: Component): Object {
  // ...
  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  return options;
}
```

因为 Vue 为方便我们的“各种”方式的使用，做了多样的 api，最后都要通过标准化的转化让 vue 内部来正确使用：

下面是这三个属性的转化说明：

### props

```
props: Array<string> | Object
```

```js
function normalizeProps(options: Object, vm: ?Component) {
  const props = options.props;
  if (!props) return;
  const res = {};
  let i, val, name;
  if (Array.isArray(props)) {
    // 数组 props: ['name','age']
    i = props.length;
    while (i--) {
      val = props[i];
      // 只接受字符串的变量 key，并且转为驼峰形式
      if (typeof val === "string") {
        name = camelize(val);
        res[name] = { type: null };
      }
    }
  } else if (isPlainObject(props)) {
    // 对象字面量
    for (const key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val) ? val : { type: val };
    }
  }
}
```

### inject

```
inject: Array<string> | { [key: string]: string | Symbol | Object }
```

```js
function normalizeInject(options: Object, vm: ?Component) {
  const inject = options.inject;
  if (!inject) return;
  const normalized = (options.inject = {});
  // 无论数组还是对象，最终都将 inject 赋值成 {from:key} 的形式
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key];
      normalized[key] = isPlainObject(val) ? extend({ from: key }, val) : { from: val };
    }
  }
}
```

### directives

```
directives: Object
```

```js
function normalizeDirectives(options: Object) {
  const dirs = options.directives;
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key];
      // 如果对象上属性值为 function ，这默认定义 bind 和 update 方法
      if (typeof def === "function") {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}
```

## mergeField 字段合并

当标准化后，会分别遍历 parent 和 child 的属性字段，根据特定字段的 **合并策略** 进行 merge 操作。

```js
const options = {};
let key;
for (key in parent) {
  mergeField(key);
}
for (key in child) {
  if (!hasOwn(parent, key)) {
    mergeField(key);
  }
}
function mergeField(key) {
  const strat = strats[key] || defaultStrat;
  options[key] = strat(parent[key], child[key], vm, key);
}
```

## 合并策略 strat

这里简单说下，vue 默认会对重要的选项属性有个合并策略。

```js
// src\core\util\options.js
```

### 默认策略 defaultStrat

属性：el、propsData

以最简单的方式来合并字段，如果 child 不存在就用 parent

```js
const defaultStrat = function(parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal;
};
```

### 特殊定义

属性：lifecycle

根据预设的生命周期数组，挨个遍历初始化钩子 hook 的策略

```js
const LIFECYCLE_HOOKS = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed", "activated", "deactivated", "errorCaptured", "serverPrefetch"];
```

```js
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook;
});
```

属性：component、directive、filter 策略：

如上三个 api 设置 s 命名，定义合并策略

```js
ASSET_TYPES.forEach(function(type) {
  strats[type + "s"] = mergeAssets;
});
```

### 继承策略

属性：props、methods、inject、computed

以 child 优先，覆盖 parent 属性值

```js
function (parentVal,childVal,vm,key): ?Object {
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
    return ret
  }
}
```

### 数据合并方法策略 mergeDataOrFn

属性：data、provide

如果参数是 function 类型，会通过 call 来做预执行操作，将结果作为 parent 和 child 的合并前提。

```js
export function mergeDataOrFn(parentVal: any, childVal: any, vm?: Component): ?Function {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    return function mergedDataFn() {
      return mergeData(typeof childVal === "function" ? childVal.call(this, this) : childVal, typeof parentVal === "function" ? parentVal.call(this, this) : parentVal);
    };
  } else {
    return function mergedInstanceDataFn() {
      // instance merge
      const instanceData = typeof childVal === "function" ? childVal.call(vm, vm) : childVal;
      const defaultData = typeof parentVal === "function" ? parentVal.call(vm, vm) : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
}
```

### 数据合并策略 mergeData

用于 **mergeDataOrFn** 策略中的基础方案

会根据遍历 to、from 各自对象上的属性，互相作对比，以 to 优先

```js
function mergeData(to: Object, from: ?Object): Object {
  if (!from) return to;
  let key, toVal, fromVal;

  const keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from);

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === "__ob__") continue;
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (toVal !== fromVal && isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}
```

所有属性遍历完后，得到最终的 options 交付给 **vm.\$options** 。

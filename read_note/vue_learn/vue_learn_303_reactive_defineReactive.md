# Vue 数据响应-动态响应 defineReactive

从 observe(value) 到 new Observer(value) ，最后都调用了 defineReactive

```js
export function defineReactive(obj: Object, key: string, val: any, customSetter?: ?Function, shallow?: boolean) {
  //...
}
```

首先会创建 Dep 可观察依赖的对象：

```js
const dep = new Dep();
```

之后，判断是否可以对属性进行“修改”：

```js
const property = Object.getOwnPropertyDescriptor(obj, key);
if (property && property.configurable === false) {
  return;
}
```

获取 **obj** 上对应 key 的访问器属性 **setter/getter**：

```js
const getter = property && property.get;
const setter = property && property.set;
```

如果传入的参数只有 2 个，且当前属性 key 没有设置过访问类型属性，则会获取次 default 值：

```js
if ((!getter || setter) && arguments.length === 2) {
  val = obj[key];
}
```

之后会判断 val 是否已经是 **“深度”观察对象**（shallow：浅），在 initDate 没有涉及 val 值，暂时跳过。

```js
let childOb = !shallow && observe(val);
```

准备工作结束后，会对 obj 上每个属性设置访问器属性 **setter/getter** ：

```js
Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {},
    set: function reactiveSetter (newVal) {}
}
```

看下 setter/getter 的具体做了什么：

## setter

```js
function reactiveSetter(newVal) {
  // 1. 如果有原 getter 函数的话，就调用并算出 value(old)
  const value = getter ? getter.call(obj) : val;
  // 2. 判断 oldvalue 和 newvalue 值是否有变化
  if (newVal === value || (newVal !== newVal && value !== value)) {
    return;
  }
  //...
  // #7981: for accessor properties without setter
  if (getter && !setter) return;
  // 3. 如果有原 setter ，则调用
  if (setter) {
    setter.call(obj, newVal);
  } else {
    // 3. newVal 替换旧值
    val = newVal;
  }
  childOb = !shallow && observe(newVal);
  // 4. 通知 watch 更新，暂时先跳过
  dep.notify();
}
```

每次通过 setter 设置值时，会判断 newVal 和 oldVal 有变化，如果有设置 setter 则会用 newVal 执行次。

还会判断 newVal 是否是深度可观察属性，赋值给 childOb。

最后调用 notify() ，进行更新。

## getter

```js
function reactiveGetter() {
  // 如果有原 getter ，则调用
  const value = getter ? getter.call(obj) : val;
  if (Dep.target) {
    // 判断是否有 Watcher 对象，维护 Dep.id 等信息
    dep.depend();
    // 是否需要嵌套 执行
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

和 setter 类似，如果有预设 getter 则会执行，之后会判断当前是否有依赖 target，有的话调用 depend() ，还会判断是否有子观察属性 childOb，也会执行 depend() 。

具体 getter/setter 内 notify()、depend() 怎么实现数据响应的，就见 Dep 相关定义。

上一篇：[Vue 数据响应-观察者 Observer](./vue_learn_302_reactive_Observer.md)

下一篇：[Vue 数据响应-观察订阅 dep](./vue_learn_304_reactive_dep.md)

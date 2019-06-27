# Vue 数据响应-动态响应 defineReactive

```js
export function defineReactive(obj: Object, key: string, val: any, customSetter?: ?Function, shallow?: boolean) {
  //...
}
```

首先会创建 Dep 可观察的对象：

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

获取 **obj** 上对应 key 的访问器属性 **setter/getter**

```js
const getter = property && property.get;
const setter = property && property.set;
if ((!getter || setter) && arguments.length === 2) {
  val = obj[key];
}
```

判断 val 是否已经是 **“深度”观察对象**（shallow：浅），在 initDate 没有涉及 val 值，暂时跳过

```js
let childOb = !shallow && observe(val);
```

之后对 obj 上每个属性设置访问器属性 **setter/getter**

```js
Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {

    },
    set: function reactiveSetter (newVal) {

    }
}
```

看下 setter/getter 的具体做了什么：

**setter**

```js
function reactiveSetter (newVal) {
  // 1. 如果有原 getter 函数的话，就调用并算出 value(old)
  const value = getter ? getter.call(obj) : val
  // 2. 判断 oldvalue 和 newvalue 值是否有变化
  if (newVal === value || (newVal !== newVal && value !== value)) {
      return
  }
  ...
  // #7981: for accessor properties without setter
  if (getter && !setter) return
  // 3. 如果有原 setter ，则调用
  if (setter) {
      setter.call(obj, newVal)
  } else {
      // 3. newVal 替换旧值
      val = newVal
  }
  childOb = !shallow && observe(newVal)
  // 4. 通知 watch 更新，暂时先跳过
  dep.notify()
}

```

每次通过 setter 设置值时，会判断新老值是否有变化，对于新设置的 newVal ，如果有嵌套对象，会继续封装 observe 将其赋予可观察能力。

**getter**

```js
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
```

总结：在对象上每个 key 挂上对象属性，并且对象属性会按条件执行 getter/setter，同时维护 Dep 实例，其中会有相关 watch 功能

下一篇：

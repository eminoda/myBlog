# Vue 数据响应-观察者 Observer

```js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data
  //...
}
```

看下构造函数 constructor 内部处理：

```js
constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    // ...
}
```

这里使用了 def()，起作用是在 value 对象上定义一个数据类型的**对象属性** \_\_ob\_\_

```js
// E:\github\vue\src\core\util\lang.js

export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
```

关于 defineProperty，可以看下：[js 基础 -- 面向对象 1.描述对象属性的属性特征](https://github.com/eminoda/myBlog/issues/2)

后面会判断 value 是否有指向 Array 类型的原型引用，有则会将 **预设** 好的 arrayMethods 作为替换。

```js
if (Array.isArray(value)) {
  if (hasProto) {
    protoAugment(value, arrayMethods);
  } else {
    // E:\github\vue\src\core\observer\array.js
    copyAugment(value, arrayMethods, arrayKeys);
  }
  // 内部 再调用 observe
  this.observeArray(value);
}
```

最后经过 observeArray，遍历数组内容，再次调用 observe(items[i]) 对数组内每项元素进行观察。

需要注意的是，Vue 会遍历原生 Array 类型方法，在调用时会对数组中每项内容赋予观察属性：

```js
methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});
```

最终执行 walk(value)

```js
else {
  this.walk(value);
}
```

```js
walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
    // 定义响应式
      defineReactive(obj, keys[i])
    }
}
```

上一篇：[Vue 数据响应-赋予观察属性 observe](./vue_learn_301_reactive_observe.md)

下一篇：[Vue 数据响应-动态响应 defineReactive](./vue_learn_303_reactive_defineReactive.md)

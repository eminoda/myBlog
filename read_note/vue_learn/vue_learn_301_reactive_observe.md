# Vue 数据响应-赋予观察属性 observe

从本文开始，结束 Vue 初始化基本工作，开始了解 Vue 如何对数据进行观察，以及动态响应的。

先来看下哪里触发这个方法的？注意到 **initState** 中的 **initData** 有涉及：

```js
function initData(vm: Component) {
  //...
  observe(data, true /* asRootData */);
}
```

在对 Vue options.data 选项初始化时调用，以这个作为切入点，了解整个数据响应过程。

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

第一步先对传入 observe 的 value 进行判断，如何不是对象或者是 VNode 类型就不进行观察；

如果 value 已经被赋予观察属性 value.\_\_ob\_\_ ，则说明被观察过了，则直接 return value.\_\_ob\_\_

满足观察条件，则开始创建观察者对象：**Observer**

上一篇：[Vue 初始化-总结](./vue_learn_211_init_end.md)

下一篇：[Vue 数据响应-观察者 Observer](./vue_learn_302_reactive_Observer.md)

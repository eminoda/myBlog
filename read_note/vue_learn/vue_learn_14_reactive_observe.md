<!-- vue_learn--响应式-创建观察对象 observe -->

# Vue 数据响应-观察方法 observe

先看下哪里出发这个方法的？

```js
function initData(vm: Component) {
  //...
  observe(data, true /* asRootData */);
}
```

上面是 Vue 初始化 data 选项时调用的，以这个为起点，了解整个响应过程

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

首先 observe 会接受观察对象 value，和一个根节点标识 asRootData

如果 value 已经被赋予观察属性时，间接说明被观察过了，则直接 return value._ob_

满足观察条件，则开始创建观察者对象：**Observer**

下一篇：[响应式-观察者对象](./vue_learn_reactive_Observer.md)

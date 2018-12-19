<!-- vue_learn--响应式-创建观察对象 observe -->

# 创建观察对象 observe
先看下哪里出发这个方法的？

````js
function initData (vm: Component) {
    ...
    observe(data, true /* asRootData */)
}
````

上面是 Vue 初始化 data 选项时调用的，以这个为起点，了解整个响应过程

````js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  ...
    let ob: Observer | void
    // 校验 value 是否是 Observer对象，是则 取__ob__属性
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (
        shouldObserve &&
        !isServerRendering() &&
        (Array.isArray(value) || isPlainObject(value)) &&
        Object.isExtensible(value) &&
        !value._isVue
    ) {
        // 新建 Observer
        ob = new Observer(value)
    }
    if (asRootData && ob) {
        ob.vmCount++
    }
    return ob
}
````

一开始肯定没有 **__ob__** 属性，所以之后看下 Observer 观察者对象怎么封装响应模型的。

下一篇：[响应式-观察者对象](./vue_learn_reactive_Observer.md)
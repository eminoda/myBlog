<!-- vue_learn--响应式-定义响应方法 Observer -->
# 定义响应方法 Observer

````js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data
}
````

看下构造函数 constructor

````js
constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    ...
}
````

在观察对象 value 上定义 **__ob__** 属性，有了这个就可以算半个 **观察者** 了。
````js
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
````

然后判断 value 是否是数组类型，并且判断该数组对象是否具有原型方法，没有就再赋上。
````js
if (Array.isArray(value)) {
    if (hasProto) {
    protoAugment(value, arrayMethods)
    } else {
    copyAugment(value, arrayMethods, arrayKeys)
    }
    // 内部 再调用 observe
    this.observeArray(value)
} else {
    this.walk(value)
}
````

对于数组类型对象相对简单，直接 observe(items[i]) 逐个再创建观察者对象，着重看下 walk 方法

````js
walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
    // 定义响应式 
      defineReactive(obj, keys[i])
    }
}
````

总结：Observer 观察者，添加观察属性 __ob__，根据被观察对象分别执行 defineReactive  定义如何观察。

ok，基本就是 Observer 做的事情，有几个地方需要放在后面详细再看
- defineReactive
- this.dep = new Dep()

下一篇：[响应式-定义响应方法](./vue_learn_reactive_defineReactive.md)
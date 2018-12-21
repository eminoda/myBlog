<!-- vue_learn--响应式-定义动态响应方法 defineReactive -->
# 定义动态响应方法 defineReactive

````js
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
    const dep = new Dep()
    ...
}
````

判断是否有属性定义，这是基础
````js
const property = Object.getOwnPropertyDescriptor(obj, key)
if (property && property.configurable === false) {
    return
}
````

对 val 做初始化赋值，如果 参数列表有 obj，key，并且访问属性有setter无getter
// TODO 这里对于参数的问题，看下issue
````js
if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
}
````

判断 val 是否已经是 **“深度”观察对象**（shallow：浅）
````js
let childOb = !shallow && observe(val)
````

回到主函数 defineReactive ，重新定义 obj 中每个属性 key 的对象属性。
````js
Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {

    },
    set: function reactiveSetter (newVal) {

    }
}
````

**set** 
````js
// 1. 如果有原 getter 函数的话，就调用并算出 (old)value
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
// 通知 watch 更新，暂时先跳过
dep.notify()
````

**get**
````js
// 如果有原 getter ，则调用
const value = getter ? getter.call(obj) : val
if (Dep.target) {
    // 判断是否有 Watcher 对象，维护 Dep.id 等信息
    dep.depend()
    // 是否需要嵌套 执行
    if (childOb) {
        childOb.dep.depend()
        if (Array.isArray(value)) {
            dependArray(value)
        }
    }
}
return value
````

总结：在对象上每个 key 挂上对象属性，并且对象属性会按条件执行 getter/setter，同时维护 Dep 实例，其中会有相关 watch 功能

下一篇：
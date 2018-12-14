<!-- vue_learn--observer 定义响应式对象 -->
# 定义响应式对象 defineReactive
在 Vue.prototype.init 已经看到好几处使用了 defineReactive，现在具体看下什么作用？

````
defineReactive(vm, key, result[key], () => {
    warn(...)
})
````

方法定义
````js
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
````

判断监听对象 obj 是否可修改
````js
const dep = new Dep()

const property = Object.getOwnPropertyDescriptor(obj, key)
if (property && property.configurable === false) {
    return
}
````

如果参数只有3个（obj,key,val），未定义getter，则预先对 val 进行设置
````js
const getter = property && property.get
const setter = property && property.set
if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
}
````

如果是深度观察，就赋值给 childOb （shallow默认true）
````js
let childOb = !shallow && observe(val)
````

**observe** 观察模型，根据条件返回一个观察者 Observer，监听 value

````js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 暂不考虑其他条件，其实“默认”的情况，会正常创建并返回
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
````

**Observer** 观察者对象
````js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // Object.defineProperty的简写形式，封装过了
    // 作用在 value下增加 __ob__ 属性
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
````

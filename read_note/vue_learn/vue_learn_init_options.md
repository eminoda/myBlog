<!-- vue_learn--init初始化 选项合并 -->

# 属性合并 vm.$options
进到 mergeOptions 方法里，我们应该没有主动设置过 _isComponent，所以只看 else 中的 **mergeOptions**
````js
// merge options
if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    // TODO 到底有什么用？
    initInternalComponent(vm, options)
} else {
    vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
    )
}
````

mergeOptions 接受三个参数
````js
export function mergeOptions (parent,child,vm?) {}
````
参数列表：
- this.constructor(parent)
- new Vue({...})的options(child)
- this(vm)
    这个很重要，在 [Vue.extends时 vm作为区分](https://cn.vuejs.org/v2/api/#Vue-extend)
// TODO !vm ==true 时的场景确认

首先会对options.components进行 **命名校验**

````js
checkComponents(child)
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}
// xx-yy letter 格式的命名；一些特殊标签slot component的命名限制
function validateComponentName (name: string) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn(...)
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(...)
  }
}
````

## 属性（选项）标准化
对指定属性进行二次加工，虽然在API上提供不同的写法，但需要在Vue层做统一化。
````js
normalizeProps(child, vm)
normalizeInject(child, vm)
normalizeDirectives(child)
````

可以在 Vue 官网看到不同调用方式：
- [props：Array<string> | Object](https://cn.vuejs.org/v2/api/#props)
- [inject：Array<string> | { [key: string]: string | Symbol | Object }](https://cn.vuejs.org/v2/api/#provide-inject)
- [directives：转换成Vue.directive范式](https://cn.vuejs.org/v2/api/#Vue-directive)

## 定义合并的开始 mergeField
Vue 对特殊的选项定义了不同的 merge 策略。
首先在正式 merge 之前，会对 parent 和 child 进行一个Field的创建，里面按照定义 **merge strages** 的规则进行执行。
````js
const options = {}
let key
// 创建 parent 规则
for (key in parent) {
    mergeField(key)
}
// 如果 child 的属性重写了 parent，定义child的 Field
for (key in child) {
    if (!hasOwn(parent, key)) {
        mergeField(key)
    }
}
function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
}
````

## 几个策略方法
先熟悉几个merge工具方法：

**默认策略**：parent 和 child 两者取一
````js
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined? parentVal: childVal
}
````
**mergeDataOrFn**：判断参数是否 function 做预执行，否则 mergeData 后返回
````js
mergeDataOrFn (parentVal: any,childVal: any,vm?: Component
): ?Function {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    // 说明此处是给 extend api 使用的，extend 场景
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
````
**mergeData** 最后的 mix 式的重写操作，返回 child
````js
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
        // 递归
      mergeData(toVal, fromVal)
    }
  }
  return to
}
````

## 默认属性（选项）策略
初始化策略对象
````js
const strats = config.optionMergeStrategies// 空对象
````
可以看到 strats 下挂了一系列属性合并方法的实现方式，在执行strat(parent[key], child[key], vm, key) 时被调用。

- strats.el = strats.propsData
- strats.data
- strats.watch
- strats.props = strats.methods = strats.inject = strats.computed
- strats.provide

[选项 / DOM el](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-DOM)，
[选项 / 数据 propsData](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)
strats.el = strats.propsData
````js
strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) { warn(...) }
    return defaultStrat(parent, child)
}
````

[选项 / 数据 data](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)
````js
strats.data = function (parentVal: any,childVal: any,vm?:Component): ?Function {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
        //这里也就说明，为什么必须写 data:function(){}
      process.env.NODE_ENV !== 'production' && warn(...)

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
}
````

[选项 / 数据 watch](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)

值得注意的是有个 **nativeWatch**，如果浏览器有 Object.propotype.watch() 就直接使用。
````js
strats.watch = function (parentVal: ?Object,childVal: ?Object,vm?: Component,key: string
): ?Object {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
````

[选项 / 数据 props|methods|computed](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE),
[选项 / 组合 inject](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%BB%84%E5%90%88)

````js
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
  return ret
}
````
[选项 / 组合 provide](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%BB%84%E5%90%88) 直接使用基础merge方法
````
strats.provide = mergeDataOrFn
````

[选项 / 资源 component | directive | filter](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%BB%84%E5%90%88)
````js
strats[type + 's'] = function mergeAssets (parentVal: ?Object,childVal: ?Object,vm?: Component,key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}
````
[选项 / 生命周期钩子 beforeCreate | created | beforeMount | mounted | beforeUpdate | updated | beforeDestroy | destroyed | activated | deactivated | errorCaptured](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E9%92%A9%E5%AD%90)
````js
strats[hook] = function mergeHook(){
    return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}
````

## 最后
绕了那么一大圈，终于：
````
vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
)
````

因为 vm 是指向 this的，所以你可以在console中，输出 **vueInstance.$options** 来看merge后的参数。
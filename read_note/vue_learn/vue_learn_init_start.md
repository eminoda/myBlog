---
vue_learn--init初始化 开始
---

# Vue.prototype._init
## 从构造函数开始
在Vue构造函数中调用，定义在initMixin中。算是整个Vue的开始。
````js
function Vue (options) {
    ...
    // Vue.prototype._init
    this._init(options)
}
````

那么进入到定义处，看下里面怎么回事

````js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
      ...
  }
}
````

迎面上来 **vm**，Vue实例对象，为什么这样说？很简单因为指向了this。很多参数都挂在这个vm上。

````js
let uid = 0

const vm: Component = this
// a uid
vm._uid = uid++
vm._isVue = true
vm._self = vm
...
````

## 性能检测
// TODO Chrome性能检测，及其API调查

符合如下条件，就会在程序首位处执行检测注入的代码。打开Chrome开发者工具，在performance中就能看到程序在不同阶段的消耗。
````js
let startTag, endTag
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    startTag = `vue-perf-start:${vm._uid}`
    endTag = `vue-perf-end:${vm._uid}`
    mark(startTag)
}
//...中间执行代码
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    vm._name = formatComponentName(vm, false)
    mark(endTag)
    measure(`vue ${vm._name} init`, startTag, endTag)
}
````

我们可以在开发环境中，打开 config.performance
````js
Vue.config.performance = true;
var app = new Vue({
    el: '#app',
    data: {
        message: '页面加载于 ' + new Date().toLocaleString()
    }
})
````

## Vue全局配置
条件判断if中定义了 **&&config.performance&&**，那 Vue 是怎么关联我们设置的值呢？

参考 [js扩展--defineProperty使用场景](https://github.com/eminoda/myBlog/issues/13)
# Vue 初始化-初始化开始

先看下 Vue 构造函数下面的方法

```js
function Vue(options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
```

initMixin、stateMixin、eventsMixin、lifecycleMixin、renderMixin 定义一系列 prototype 方法，参照官方文档的 [实例方法 / 数据](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95-%E6%95%B0%E6%8D%AE)、[实例方法 / 生命周期](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95-%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F) 等章节能知道这些方法使用上有什么用。

后续看到具体调用代码时在详细跟进。

下面列出所初始化时，定义好的 **原型方法**：

```js
// initMixin
Vue.prototype._init = function() {};

// stateMixin
Vue.prototype.$set = set;
Vue.prototype.$delete = del;
Object.defineProperty(Vue.prototype, '$data', dataDef);
Object.defineProperty(Vue.prototype, '$props', propsDef);

// eventsMixin
Vue.prototype.$on = function() {};
Vue.prototype.$once = function() {};
Vue.prototype.$off = function() {};
Vue.prototype.$emit = function() {};

// lifecycleMixin
Vue.prototype._update = function() {};
Vue.prototype.$forceUpdate = function() {};
Vue.prototype.$destroy = function() {};

// renderMixin
Vue.prototype.$nextTick = function() {};
Vue.prototype._render = function() {};
```

大概了解后，然后在把注意力放在 Vue 构造函数中：

```js
function Vue(options) {
  // ...
  this._init(options);
}
```

能看到 Vue 构造函数里只有 **\_init** 一个方法，其实就是引用 **initMixin** 中定义的原型方法，所有的准备工作都在在此初始化的。

```js
// vue/src/core/instance\init.js

export function initMixin(Vue: Class<Component>) {
  Vue.prototype._init = function(options?: Object) {
    // ...
  };
}
```

就这里开始，逐步阅读 **initMixin** 中的变量 or 方法：

## vm

vm 是 Vue 的 this 引用，很多 **参数** 和 **方法** 都挂在这个 vm 上。

```js
const vm: Component = this;
vm._uid = uid++;
vm._isVue = true;
```

## 性能检测

注意到 **\_init** 方法中还有有关 **性能检测** 的代码，如下：

```js
let startTag, endTag;
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  startTag = `vue-perf-start:${vm._uid}`;
  endTag = `vue-perf-end:${vm._uid}`;
  mark(startTag);
}
//...中间执行代码
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  vm._name = formatComponentName(vm, false);
  mark(endTag);
  measure(`vue ${vm._name} init`, startTag, endTag);
}
```

我们可以在开发环境中，设置 **config.performance** ，并在控制台看到在不同阶段性能的消耗。

```js
Vue.config.performance = true;
var app = new Vue({
  el: '#app',
  data: {
    message: '页面加载于 ' + new Date().toLocaleString()
  }
});
```

那 performance 具体怎么玩，这里准备了一篇文章可以了解下： [前端性能检查 performance](https://eminoda.github.io/2019/06/08/window-performance/)

## 其他

能看到 **\_init** 方法中还有其他方法定义，比如：

**mergeOptions** 属性合并：

```js
vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
```

和一堆 **init** 子方法：

```js
vm._self = vm;
initLifecycle(vm);
initEvents(vm);
initRender(vm);
callHook(vm, 'beforeCreate');
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
callHook(vm, 'created');
```

el 标签挂载 **\$mount**：

```js
if (vm.$options.el) {
  vm.$mount(vm.$options.el);
}
```

他们到底做了什么，请看后续章节

上一篇：[框架结构](./vue_learn_103_index_frame.md)

下一篇：[Vue 初始化-选项合并](./vue_learn_202_init_options.md)

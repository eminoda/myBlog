# Vue 初始化 - 初始化开始

## 从构造函数开始

```js
import { initMixin } from './init';
// ...
function Vue(options) {
	// ...
	this._init(options);
}
```

能看到 Vue 构造函数里只有 \_init 一个方法，其是 initMixin 中定义的原型方法，所有的准备工作都在在此初始化的。

```js
// vue/src/core/instance\init.js

export function initMixin(Vue: Class<Component>) {
	Vue.prototype._init = function(options?: Object) {
		// ...
	};
}
```

## vm

vm 是 Vue 的 this 引用，很多 **参数** 和 **方法** 都挂在这个 vm 上。

```js
Vue.prototype._init = function(options?: Object) {
	const vm: Component = this;
	vm._uid = uid++;
	vm._isVue = true;
	// ...
};
```

参照官方文档的 [实例属性](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E5%B1%9E%E6%80%A7) 就能知道哪些属性是 **实例化后** 挂在在 vm 上的（包括原型，本身 prototype 就是挂在 Vue 构造函数上的）。

```js
// vue/src/core/instance\state.js

Object.defineProperty(Vue.prototype, '$data', dataDef);
Object.defineProperty(Vue.prototype, '$props', propsDef);
```

## 性能检测

注意到 \_init 方法中还有有关 **性能检测** 的代码，如下：

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

我们可以在开发环境中，设置 config.performance ，并在控制台看到在不同阶段性能的消耗。

```js
Vue.config.performance = true;
var app = new Vue({
	el: '#app',
	data: {
		message: '页面加载于 ' + new Date().toLocaleString()
	}
});
```

那 performance 具体怎么玩，这里准备了一篇文章 [前端性能检查 performance](https://eminoda.github.io/2019/06/08/window-performance/)

## 其他

能看到 \_init 方法中还有其他方法定义，mergeOptions 属性合并和一堆 init 子方法：

```js
vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
```

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

他们到底做了什么，请看后续章节

上一篇：[框架结构](./vue_learn_3_frame.md)

下一篇：[Vue 初始化 - 选项合并](./vue_learn_5_init_options.md)

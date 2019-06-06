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

\_init 方法是 initMixin 中定义的原型方法。

```js
// E:\github\vue\src\core\instance\init.js

export function initMixin(Vue: Class<Component>) {
	Vue.prototype._init = function(options?: Object) {
		// ...
	};
}
```

## vm

Vue 的实例化后的对象（this），很多参数都挂在这个 vm 上。

```js
Vue.prototype._init = function(options?: Object) {
	const vm: Component = this;
	vm._uid = uid++;
	vm._isVue = true;
	// ...
};
```

参照官方文档的 [实例属性](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E5%B1%9E%E6%80%A7) 就能知道哪些属性是挂在在 vm 上的（包括原型，本身 prototype 就是挂在 Vue 构造函数上的）。

```js
// E:\github\vue\src\core\instance\state.js

Object.defineProperty(Vue.prototype, '$data', dataDef);
Object.defineProperty(Vue.prototype, '$props', propsDef);
```

能看到 \_init 方法中还有其他方法定义

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

## 性能检测

// TODO Chrome 性能检测，及其 API 调查

符合如下条件，就会在程序首位处执行检测注入的代码。打开 Chrome 开发者工具，在 performance 中就能看到程序在不同阶段的消耗。

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

我们可以在开发环境中，打开 config.performance

```js
Vue.config.performance = true;
var app = new Vue({
	el: '#app',
	data: {
		message: '页面加载于 ' + new Date().toLocaleString()
	}
});
```

上一篇：[框架结构](./vue_learn_basejs.md)

下一篇：[Vue 初始化-选项](./vue_learn_init_start.md)

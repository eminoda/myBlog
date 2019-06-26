# Vue 初始化-生命周期

紧接着看到如下代码：

```js
initLifecycle(vm);
```

这个简单，对一些 vm 属性统一做初始化赋值。

当然虽然这叫 initLifecycle，却没有我们生命周期的那些方法。

```js
export function initLifecycle(vm: Component) {
	const options = vm.$options;

	// locate first non-abstract parent
	let parent = options.parent;
	if (parent && !options.abstract) {
		while (parent.$options.abstract && parent.$parent) {
			parent = parent.$parent;
		}
		parent.$children.push(vm);
	}

	vm.$parent = parent;
	vm.$root = parent ? parent.$root : vm;

	vm.$children = [];
	vm.$refs = {};

	vm._watcher = null;
	vm._inactive = null;
	vm._directInactive = false;
	vm._isMounted = false;
	vm._isDestroyed = false;
	vm._isBeingDestroyed = false;
}
```

上一篇： [Vue 初始化-渲染代理](./vue_learn_6_init_renderProxy.md)

下一篇： [Vue 初始化-事件](./vue_learn_8_init_events.md)

# Vue 初始化 - 渲染代理

## initProxy

接着 mergeOptions 后赋值给 vm.\$options ， 将看到如下代码：

```js
if (process.env.NODE_ENV !== 'production') {
	initProxy(vm);
} else {
	vm._renderProxy = vm;
}
```

在非生产环境，就会走到 if 分支，执行 **initProxy** ，其作用定义一个 vm.\_renderProxy 渲染代理的函数

```js
initProxy = function initProxy(vm) {
	if (hasProxy) {
		// determine which proxy handler to use
		const options = vm.$options;
		const handlers = options.render && options.render._withStripped ? getHandler : hasHandler;
		vm._renderProxy = new Proxy(vm, handlers);
	} else {
		vm._renderProxy = vm;
	}
};
```

// TODO ptions.render && options.render.\_withStripped 哪里定义？

render 和 render.\_withStripped 哪里定义先放放， 因为从头扫过来没有发现这两个属性， 但无论怎么样，当符合条件 **options.render && options.render.\_withStripped**，这两个方法总会则一声明定义，并且交给支持 Proxy 的客户端代理执行。（关于 proxy 可以参考 [js ES6 -- proxy](https://github.com/eminoda/myBlog/issues/11)）

```js
const getHandler = {
	// 定义一个 get function
	get(target, key) {
		if (typeof key === 'string' && !(key in target)) {
			if (key in target.$data) warnReservedPrefix(target, key);
			else warnNonPresent(target, key);
		}
		return target[key];
	}
};
```

结合 warnReservedPrefix ，warnNonPresent 就会明白 getHandler 无非就是提供不符合预期的 warn

```js
const warnNonPresent = (target, key) => {
	warn(
		`Property or method "${key}" is not defined on the instance but ` +
			'referenced during render. Make sure that this property is reactive, ' +
			'either in the data option, or for class-based components, by ' +
			'initializing the property. ' +
			'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
		target
	);
};

const warnReservedPrefix = (target, key) => {
	warn(`Property "${key}" must be accessed with "$data.${key}" because ` + 'properties starting with "$" or "_" are not proxied in the Vue instance to ' + 'prevent conflicts with Vue internals' + 'See: https://vuejs.org/v2/api/#data', target);
};
```

**hasHandler** 暂时跳过， 作用其实和 getHandler 类似， 只是方法名和使用场景不同。

```js
const hasHandler = {
	has(target, key) {
		const has = key in target;
		const isAllowed = allowedGlobals(key) || (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
		if (!has && !isAllowed) {
			if (key in target.$data) warnReservedPrefix(target, key);
			else warnNonPresent(target, key);
		}
		return has || !isAllowed;
	}
};
```

那哪里调用 vm.\_renderProxy？ target 是哪个对象参数？

```js
// src\core\instance\render.js
Vue.prototype._render = function(): VNode {
    ...
    vnode = render.call(vm._renderProxy, vm.$createElement)
    ...
}

function initRender(vm: Component) {
    ...
    // createElement 渲染函数
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
    ....
}
```

可能你也会有和我一样的疑问： \_render 哪里冒出来的， 执行顺序不对啊？ 其实看下 vue instance/index.js

```js
// E:\github\vue\src\core\instance\index.js

function Vue(options) {
    ...
    this._init(options)
}
...
renderMixin(Vue)
```

一开始在 **函数声明** 的时候就初始化了这些方法， 只不过我这边阅读代码的顺序不可能那么跳跃， 这里做个备注。

上一篇： [Vue 初始化 - 选项合并](./vue_learn_5_init_options.md)

下一篇： [Vue 初始化 - 生命周期](./vue_learn_7_init_life.md)

# Vue 初始化-选项合并

选项 options 合并的代码如下：

```js
// merge options
if (options && options._isComponent) {
	// TODO initInternalComponent

	// optimize internal component instantiation
	// since dynamic options merging is pretty slow, and none of the
	// internal component options needs special treatment.
	initInternalComponent(vm, options);
} else {
	vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
}
```

目前我们没有主动设置过 \_isComponent， 暂时只看 else 中的逻辑。

首先注意到 **mergeOptions** 中需要三个参数：

-   parent -- resolveConstructorOptions(vm.constructor)
-   child -- new Vue({...}) 的 options
-   vm -- this

我们先来看下 **resolveConstructorOptions** ， 用来解析构造函数的 options 属性（如果你对 constructor 很陌生， 可以参考 [js 基础 -- 面向对象 3. 原型那些事](https://github.com/eminoda/myBlog/issues/4) ）：

内部通过 **递归 resolveConstructorOptions** 将对象父子的属性做继承覆盖

```js
export function resolveConstructorOptions(Ctor: Class<Component>) {
	let options = Ctor.options;
	if (Ctor.super) {
		// 递归 super
		const superOptions = resolveConstructorOptions(Ctor.super);
		const cachedSuperOptions = Ctor.superOptions;
		if (superOptions !== cachedSuperOptions) {
			// super option changed,
			// need to resolve new options.
			Ctor.superOptions = superOptions;
			// check if there are any late-modified/attached options (#4976)
			const modifiedOptions = resolveModifiedOptions(Ctor);
			// update base extend options
			if (modifiedOptions) {
				extend(Ctor.extendOptions, modifiedOptions);
			}
			options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
			if (options.name) {
				options.components[options.name] = Ctor;
			}
		}
	}
	return options;
}
```

**resolveModifiedOptions** : 遍历 Ctor 中的所有 options 属性， 和 Ctor.sealedOptions 做对比， return 有差异的结果

```js
function resolveModifiedOptions(Ctor: Class<Component>): ?Object {
	// TODO resolveModifiedOptions sealedOptions 哪里设置？
	let modified;
	const latest = Ctor.options;
	const sealed = Ctor.sealedOptions;
	for (const key in latest) {
		if (latest[key] !== sealed[key]) {
			if (!modified) modified = {};
			modified[key] = latest[key];
		}
	}
	return modified;
}
```

## mergeOptions

处理完 constructor 上那些参数后， 进入 mergeOptions 中看下具体逻辑：

```js
export function mergeOptions(parent: Object, child: Object, vm?: Component): Object {
	if (process.env.NODE_ENV !== 'production') {
		checkComponents(child);
	}

	if (typeof child === 'function') {
		child = child.options;
	}

	normalizeProps(child, vm);
	normalizeInject(child, vm);
	normalizeDirectives(child);

	// Apply extends and mixins on the child options,
	// but only if it is a raw options object that isn't
	// the result of another mergeOptions call.
	// Only merged options has the _base property.
	if (!child._base) {
		if (child.extends) {
			parent = mergeOptions(parent, child.extends, vm);
		}
		if (child.mixins) {
			for (let i = 0, l = child.mixins.length; i < l; i++) {
				parent = mergeOptions(parent, child.mixins[i], vm);
			}
		}
	}

	const options = {};
	let key;
	for (key in parent) {
		mergeField(key);
	}
	for (key in child) {
		if (!hasOwn(parent, key)) {
			mergeField(key);
		}
	}

	function mergeField(key) {
		const strat = strats[key] || defaultStrat;
		options[key] = strat(parent[key], child[key], vm, key);
	}
	return options;
}
```

### 命名校验 checkComponents

对每个 options 属性进行“合法性”的命名校验

```js
function checkComponents(options: Object) {
	for (const key in options.components) {
		validateComponentName(key);
	}
}
```

规范的命名格式； 一些特殊属性命名限制： slot、 component、 html 相关标签等

```js
function validateComponentName(name: string) {
	if (!new RegExp('^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$').test(name)) {
		warn('Invalid component name: "' + name + '". Component names ' + 'should conform to valid custom element name in html5 specification.');
	}
	// \vue\src\shared\util.js
	// \vue\src\platforms\web\util\element.js
	if (isBuiltInTag(name) || config.isReservedTag(name)) {
		warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + name);
	}
}
```

### 标准化选项 normalizeXX

```js
normalizeProps(child, vm);
normalizeInject(child, vm);
normalizeDirectives(child);
```

对指定属性（**props、 inject、 directives**）进行二次标准化加工。 由于提供给使用方多样的 API 定义， 则需要在这层做 **统一化** 处理， 以便后续能直接拿标准的 options 做数据处理。

可以在 Vue 官网看到不同 **使用方式**：

-   [props](https://cn.vuejs.org/v2/api/#props)
-   [inject](https://cn.vuejs.org/v2/api/#provide-inject)
-   [directives](https://cn.vuejs.org/v2/api/#Vue-directive)

这里只拿 **normalizeProps** 做个说明， 看些如何将不同的设置转成标准化参数。

props 的输入参数类型： Array\<string\> | Object

```js
function normalizeProps(options: Object, vm: ?Component) {
	const props = options.props;
	if (!props) return;
	const res = {};
	let i, val, name;
	// 判断是否 array 类型
	// 如：props: ['size', 'myMessage']
	if (Array.isArray(props)) {
		i = props.length;
		while (i--) {
			val = props[i];
			// 校验类型，初始化 res ，定义 type
			if (typeof val === 'string') {
				name = camelize(val);
				res[name] = { type: null };
			} else if (process.env.NODE_ENV !== 'production') {
				warn('props must be strings when using array syntax.');
			}
		}
		// 判断是否是 字面量对象
	} else if (isPlainObject(props)) {
		// 遍历对象属性，赋值给 res
		for (const key in props) {
			val = props[key];
			name = camelize(key);
			res[name] = isPlainObject(val) ? val : { type: val };
		}
	} else if (process.env.NODE_ENV !== 'production') {
		warn(`Invalid value for option "props": expected an Array or an Object, ` + `but got ${toRawType(props)}.`, vm);
	}
	options.props = res;
}
```

## 合并字段 mergeField

合并完 options 后，通过 mergeField 中定义的策略， 对 parent、 child 中的每个属性 key 选择对应的执行方式。

```js
const options = {};
let key;
for (key in parent) {
	mergeField(key);
}
for (key in child) {
	if (!hasOwn(parent, key)) {
		mergeField(key);
	}
}

function mergeField(key) {
	const strat = strats[key] || defaultStrat;
	options[key] = strat(parent[key], child[key], vm, key);
}
```

具体 mergeField 的 strats 策略模式有哪些， 下面详细了解下。

## 合并（key）策略 strats

### 默认策略

当 strats[key] 没有定义策略时， 使用默认策略， parent[val] 和 child[val] 两者取一。

```js
const defaultStrat = function(parentVal: any, childVal: any): any {
	return childVal === undefined ? parentVal : childVal;
};
```

### 预设好的策略

Vue 对以下 api 属性做了预设好的属性取值策略：

-   strats.el = strats.propsData // defaultStrat
-   strats.data // mergeDataOrFn
-   strats.provide // mergeDataOrFn
-   strats.watch // 通过 extend
-   strats.props = strats.methods = strats.inject = strats.computed // 通过 extend

**mergeDataOrFn**

对 parentVal 和 childVal 对空值校验，最后判断是否是可执行 function，执行后交给 mergeData

```js
export function mergeDataOrFn(parentVal: any, childVal: any, vm?: Component) {
	if (!vm) {
		// in a Vue.extend merge, both should be functions
		if (!childVal) {
			return parentVal;
		}
		if (!parentVal) {
			return childVal;
		}
		// when parentVal & childVal are both present,
		// we need to return a function that returns the
		// merged result of both functions... no need to
		// check if parentVal is a function here because
		// it has to be a function to pass previous merges.
		return function mergedDataFn() {
			return mergeData(typeof childVal === 'function' ? childVal.call(this, this) : childVal, typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal);
		};
	} else {
		return function mergedInstanceDataFn() {
			// instance merge
			const instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
			const defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;
			if (instanceData) {
				return mergeData(instanceData, defaultData);
			} else {
				return defaultData;
			}
		};
	}
}
```

**mergeData**

层层遍历父（from）子（to）对象的属性 key， 最后用子对象做 overwrite 操作

```js
function mergeData(to: Object, from: ?Object): Object {
	if (!from) return to;
	let key, toVal, fromVal;
	const keys = Object.keys(from);
	// 遍历父属性
	for (let i = 0; i < keys.length; i++) {
		key = keys[i]; // parent key
		toVal = to[key]; // child key val

		fromVal = from[key]; // parent key val
		// parent 的 key 不存在于 child 中，则将该 key 新设置到 child 里
		if (!hasOwn(to, key)) {
			set(to, key, fromVal);
		} else if (toVal !== fromVal && isPlainObject(toVal) && isPlainObject(fromVal)) {
			// 递归
			mergeData(toVal, fromVal);
		}
	}
	return to;
}
```

具体比如： watch、 props， 甚至是生命周期 strats[hook] 的 mergeHook 里的逻辑没有单独列出， 不过基本都是通过 extend 让子对象继承/重写父对象的属性。

经过 mergeOptions 后， 把 options 参数赋值给最终的 vm.\$options 。

```js
vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
```

因为 vm 是指向 this 的， 所以你可以在 console 中， 输出 **vueInstance.\$options** 来看 merge 后的参数。

上一篇： [Vue 初始化 - 初始化开始](./vue_learn_4_init_start.md)

下一篇： [Vue 初始化 - 渲染代理](./vue_learn_6_init_renderProxy.md)

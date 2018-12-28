<!-- vue_learn--响应式-渲染 render -->

# 渲染 render

看了之前的 reactive 响应相关内容，大致了解几个方法是干嘛的，但还不知道哪里开始，具体怎么做的。

这里拎出响应入口 render，按照这个起点看下程序怎么把这些串起来的。

## 入口

依旧从 init 初始化方法开始，看下 \$mount 怎么和响应挂上钩的

```js
var app = new Vue({
    el: "#app",
    ...
});
```

```js
export function initMixin (Vue: Class<Component>) {
    Vue.prototype._init = function (options?: Object) {
        ...
        // 会进入该条件
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
}
```

## \$mount

在初始化 **声明** 阶段，第一个 \$mount 会被定义在 Vue 上，在 mountComponent 中定义了和响应相关的事宜。

```js
// src\platforms\web\runtime\index.js
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
	el = el && inBrowser ? query(el) : undefined;
	return mountComponent(this, el, hydrating);
};
```

紧接着，$mount 会被赋值给变量 mount 中做暂存。重新定义原型方法 Vue.prototype.$mount，作为公用的方法 \$mount。（见 [vm.\$mount( [elementOrSelector] )](https://cn.vuejs.org/v2/api/#vm-mount)）

```js
//src\platforms\web\entry-runtime-with-compiler.js
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function(
	el?: string | Element,
	hydrating?: boolean
): Component {
	el = el && query(el);
	...
	const options = this.$options;
	// resolve template/el and convert to render function
	if (!options.render) {
		let template = options.template;
		if (template) {
			...
		} else if (el) {
			template = getOuterHTML(el);
		}
		if (template) {
			...
			options.render = render;
			options.staticRenderFns = staticRenderFns;
			...
		}
	}
	return mount.call(this, el, hydrating);
};
```

由于初始化的时候没有定义 render，所以会进入第一个判断 !options.render，然后获取 template 模板并会校验模板的合法性。

获取到 template 后，准备渲染相关方法

```js
// 当 html 模板解析 ok
if (template) {
    ...
    // 调用 模板编译方法
      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
      ...
    }
```

**compileToFunctions** 由 createCompiler 方法延伸出来

```js
// src\platforms\web\compiler\index.js
import { createCompiler } from "compiler/index";
const { compile, compileToFunctions } = createCompiler(baseOptions);
export { compile, compileToFunctions };
```

而 **createCompiler** 其实就是 createCompilerCreator 的变量

```js
// src\compiler\index.js
import { createCompilerCreator } from "./create-compiler";
export const createCompiler = createCompilerCreator(function baseCompile(
	template: string,
	options: CompilerOptions
): CompiledResult {
    const ast = parse(template.trim(), options);
	...
	const code = generate(ast, options);
	return {
        ast,
		render: code.render,
		staticRenderFns: code.staticRenderFns
	};
});
```

**createCompilerCreator** 的具体实现，接受一个 **baseCompile** 基本编译函数方法，通过偏函数形式返回最初 if(template) 时所使用的 **compileToFunctions**

```js
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      ...

      if (options) {
        ...
      }

      const compiled = baseCompile(template, finalOptions)
      ...
      return compiled
    }
    // 这里要注意了，返回2个函数，其中一个便是 template 使用的 compileToFunctions
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

在看看最终调用的 **createCompileToFunctionFn**

```js
export function createCompileToFunctionFn(compile: Function): Function {
	const cache = Object.create(null);

	return function compileToFunctions(
		template: string,
		options?: CompilerOptions,
		vm?: Component
	): CompiledFunctionResult {
        options = extend({}, options);
        ...
		const key = options.delimiters
			? String(options.delimiters) + template
			: template;
		if (cache[key]) {
			return cache[key];
		}
		// compile
        const compiled = compile(template, options);
        ...
		return (cache[key] = res);
	};
}
```

和起点入口的 **compileToFunctions** 放在一起做个关联比较，绕了那么多全，终于走到头了（原来高阶函数该这么玩）。之后就要看 render 中细节怎么做渲染的。

```js
const { render, staticRenderFns } = compileToFunctions(
	template,
	{
		shouldDecodeNewlines,
		shouldDecodeNewlinesForHref,
		delimiters: options.delimiters,
		comments: options.comments
	},
	this
);
```

熟悉代码的执行“路径”后，接下来拎出几个方法，看下如何和响应式扯上关系

compileToFunctions 内部会运行传入的方法 compile

```js
function compile(template: string, options?: CompilerOptions): CompiledResult {
    ...
    return compiled;
}
```

简单看下编译后的结果：

![compiled](./imgs/compiled.png)

这里的 ast 暂时当做类似浏览器引擎解析做的语法解析，主要这里定义了 render 方法，并且用 with 把执行域放在了 this 下。

既然有了 render ，就能在第一次声明 \$mount 中执行相关逻辑（runtime 中那个）

```js
return mount.call(this, el, hydrating)
...
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
...
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
    ...
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
    new Watcher(vm, updateComponent, noop, {...}, true /* isRenderWatcher */)
  ...
}
```

再回到 Watch，其实定义的 updateComponent 在其内部执行了 this.get()，即运行了 render()

在 \_update 中还会执行 **Vue.prototype.\_\_patch\_\_** ，将渲染后的模板替换到页面上。

响应化好像也没输出太多内容，在模板具体如何解析的章节，再细看。

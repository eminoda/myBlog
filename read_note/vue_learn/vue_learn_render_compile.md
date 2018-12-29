<!-- vue_learn--渲染 模板编译函数 -->

# 模板编译函数 compileToFunctions

之前熟悉了整个 render 大致的流程。现在具体方法具体分析。

从 \$mount 最开始调用的 **compileToFunctions** 开始看

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

**createCompiler** 中具有上面需要的 compileToFunctions

```js
const { compile, compileToFunctions } = createCompiler(baseOptions);
```

createCompiler 是 **createCompilerCreator** 的引用，并且该方法定义了 **function baseCompile**。

```js
export const createCompiler = createCompilerCreator(function baseCompile(template: string, options: CompilerOptions): CompiledResult {
    ...
    // $mount 调用时使用到的 render，staticRenderFns，到下面看这些属性怎么返回。
    return {
        ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
    };
});
```

再进入到 **createCompilerCreator** 方法实现的地方，这里就会返回最终使用的 **compileToFunctions**

```js
export function createCompilerCreator(baseCompile: Function): Function {
    return function createCompiler(baseOptions: CompilerOptions) {
        function compile(){
            ...
            // 这里使用了 baseCompile
            const compiled = baseCompile(template, finalOptions);
            ...
        }
        return {
            compile,
            compileToFunctions: createCompileToFunctionFn(compile)
        };
    }
}
```

**createCompileToFunctionFn** 确认完缓存后，并调用 compile ，在 compile 会返回 compiled（根据 baseCompile 运行完的编译结果）其包含 render，staticRenderFns 方法

```js
export function createCompileToFunctionFn(compile: Function) {
    const cache = Object.create(null);
    return function compileToFunctions(template: string, options?: CompilerOptions, vm?: Component) {
        options = extend({}, options)
        ...
        // 定义模板缓存，$mount 是个公用方法
        // check cache
        const key = options.delimiters? String(options.delimiters) + template: template
        if (cache[key]) {
            return cache[key]
        }
        // compile
        const compiled = compile(template, options)
        ...
        const res = {}
        const fnGenErrors = []
        res.render = createFunction(compiled.render, fnGenErrors)
        res.staticRenderFns = compiled.staticRenderFns.map(code => {
            return createFunction(code, fnGenErrors)
        })
        ...
        // 做缓存
        return (cache[key] = res)
    };
}
```

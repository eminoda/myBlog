---
title: vue 源码学习-渲染：抽象语法树 AST
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

上篇，我们已经了解了复杂的渲染方法之间调用的过程链路，这里我们从 **编译器创建工厂方法 createCompilerCreator** 开始，看 vue 怎么对模板解析的。

```js
// return { compile, compileToFunctions }
const createCompiler = createCompilerCreator(function baseCompile(template: string, options: CompilerOptions): CompiledResult {
  // ...
});
```

# 基础编译方法 baseCompile

## 代码主体

```js
function baseCompile(template: string, options: CompilerOptions): CompiledResult {
  const ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
}
```

**baseCompile** 方法很简单，对 **template** 进行模板解析，然后通过 **generate** 生成对应的 **code** 代码执行函数。

但其实这两个小方法 **parse** ，**generate** 内部却也很复杂。

## 解析模板 parse

```js
// src\compiler\parser\index.js

function parse(template: string, options: CompilerOptions) {
  // ...
}
```

### 参数列表

**template** 之前分析过了，我们也很清楚知道它是什么。

来看下 **options** 的实际对象参数。

如下是 **compileToFunctions** 调用时的特定参数：

```js
{
  outputSourceRange: process.env.NODE_ENV !== 'production', // true/false
  shouldDecodeNewlines, //inBrowser ? getShouldDecode(false) : false
  shouldDecodeNewlinesForHref, //inBrowser ? getShouldDecode(true) : false
  delimiters: options.delimiters, // ["{{", "}}"]
  comments: options.comments // true/false
}
```

**shouldDecodeNewlines** 和 **shouldDecodeNewlinesForHref** 就是用来判断 **a 标签** 和 **非 a 标签** 是否在当前浏览器采用了 **换行符** 。

后两个比较简单， **delimiters** 模板插值标识符， **comments** 是否隐藏注释。

另外 **baseCompile** 在 **createCompilerCreator** 方法中还做了一次 **options** 的合并操作：

```js
function createCompilerCreator(baseCompile: Function): Function {
  return function createCompiler(baseOptions: CompilerOptions) {
    function compile(template: string, options?: CompilerOptions): CompiledResult {
      const finalOptions = Object.create(baseOptions);
      // ...
      const compiled = baseCompile(template.trim(), finalOptions);
      // ...
      return comiled;
    }
  };
}
```

这个 **baseOptions** 就是在如下过程中注入的：

```js
// src\platforms\web\compiler\index.js

const { compile, compileToFunctions } = createCompiler(baseOptions);
```

最后合并成 **finalOptions** 给下面的 **parse** 方法使用。

### parse 初始化

这些参数作用都标注了注释：

```js
warn = options.warn || baseWarn; // 警告函数

// 判断 html tag 标签名
platformIsPreTag = options.isPreTag || no; // (tag: ?string): boolean => tag === 'pre'
platformMustUseProp = options.mustUseProp || no;
platformGetTagNamespace = options.getTagNamespace || no; // 根据 tag ，判断 svg or math
const isReservedTag = options.isReservedTag || no; // (tag: string): ?boolean => { return isHTMLTag(tag) || isSVG(tag) }
```

**mustUseProp** 用来判断 html 标签的合法性，看了下面的代码定义，很容易理解：

```js
const acceptValue = makeMap("input,textarea,option,select,progress");
export const mustUseProp = (tag: string, type: ?string, attr: string): boolean => {
  return (attr === "value" && acceptValue(tag) && type !== "button") || (attr === "selected" && tag === "option") || (attr === "checked" && tag === "input") || (attr === "muted" && tag === "video");
};
```

针对 **options.modules** 属性做解析：

```js
transforms = pluckModuleFunction(options.modules, "transformNode");
preTransforms = pluckModuleFunction(options.modules, "preTransformNode");
postTransforms = pluckModuleFunction(options.modules, "postTransformNode");
```

你可以在 **pluckModuleFunction** 方法上看到它实现了什么效果：

```js
function pluckModuleFunction<F: Function>(modules: ?Array<Object>, key: string): Array<F> {
  return modules ? modules.map(m => m[key]).filter(_ => _) : [];
}
```

### parseHTML

这个方法一样很复杂，无论是 **options** 的定义，还是方法内部的逻辑。

```js
function parse (){
  // ...
  parseHTML(template, {
    // ...
    start (tag, attrs, unary, start, end) {}
    end (tag, start, end) {
    chars (text: string, start: number, end: number) {}
    comment (text: string, start, end) {}
  }
}
```

```js
// src\compiler\parser\html-parser.js
function parseHTML(html, options) {
  // ...
  while (html) {
    // ...
  }
}
```

我们逐个查看，先看进入 **while** 递归：

```js
last = html;


```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

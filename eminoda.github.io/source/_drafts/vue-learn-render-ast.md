---
title: vue 源码学习-渲染：抽象语法树 AST
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

上篇，我们已经了解了复杂的渲染方法之间调用的过程链路，这里我们从 **编译器创建工厂方法 createCompilerCreator** 中的参数 **基础编译方法 baseCompile** 方法开始，看 vue 怎么对模板解析的。

```js
// src\compiler\index.js
// return { compile, compileToFunctions }
const createCompiler = createCompilerCreator(function baseCompile(template: string, options: CompilerOptions): CompiledResult {
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
});
```

为什么选取 **baseCompile** ？因为该方法包括 **vue** 渲染的核心： **template** 模板解析，以及通过 **generate** 生成对应**渲染函数**相关参数，最终将生成 **compiled** 编译对象。

```js
const compiled = baseCompile(template.trim(), finalOptions);
```

这篇将详细了解 vue 中的 **AST 抽象语法树的机制** 。

# 模板解析 parse

## 代码主体

```js
// src\compiler\parser\index.js

function parse(template: string, options: CompilerOptions) {
  // ...
  let root;

  parseHTML(template, {
    /**/
  });
  return root;
}
```

## 参数列表

```js
template: string, options: CompilerOptions
```

**template** 之前分析过了，我们也很清楚知道它是什么。

来看下 **options** 的实际对象参数。

如下是 **compileToFunctions** 调用时的特定参数：

```js
// src\platforms\web\entry-runtime-with-compiler.js
const { render, staticRenderFns } = compileToFunctions(template, {
  outputSourceRange: process.env.NODE_ENV !== "production", // true/false
  shouldDecodeNewlines, //inBrowser ? getShouldDecode(false) : false
  shouldDecodeNewlinesForHref, //inBrowser ? getShouldDecode(true) : false
  delimiters: options.delimiters, // ["{{", "}}"]
  comments: options.comments // true/false
});
```

**shouldDecodeNewlines** 和 **shouldDecodeNewlinesForHref** 就是用来判断 **a 标签** or **非 a 标签** 测试当前浏览器是否会解析换行符 **换行符** 。

后两个比较简单， **delimiters** 模板插值标识符， **comments** 是否隐藏注释。

另外 **baseCompile** 在 **createCompilerCreator** 方法中还做了一次 **options** 的合并操作，赋值给 **finalOptions** ：

```js
function createCompilerCreator(baseCompile: Function): Function {
  return function createCompiler(baseOptions: CompilerOptions) {
    function compile(template: string, options?: CompilerOptions): CompiledResult {
      // 注意：finalOptions 最终参数
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

## parse 初始化

这些参数作用都标注了注释：

```js
function parse(template: string, options: CompilerOptions): ASTElement | void {
  warn = options.warn || baseWarn; // 警告函数

  // 判断 html tag 标签名
  platformIsPreTag = options.isPreTag || no; // (tag: ?string): boolean => tag === 'pre'
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no; // 根据 tag ，判断 svg or math
  const isReservedTag = options.isReservedTag || no; // (tag: string): ?boolean => { return isHTMLTag(tag) || isSVG(tag) }
}
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

## parseHTML

这个方法一样很复杂，无论是 **options** 中的方法定义，还是方法内部的逻辑。

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

进入 **parseHTML** 方法后，就是个 **while** 循环，主要功能就是解析 html 模板：

```js
// src\compiler\parser\html-parser.js
function parseHTML(html, options) {
  // ...
  while (html) {
    // ...
  }
}
```

我们逐个查看：

### 注释解析

先看第一个 **if** 循环：

```js
if (!lastTag || !isPlainTextElement(lastTag)) {
  let textEnd = html.indexOf("<");
  if (textEnd === 0) {
    // ...
  }
  if (textEnd >= 0) {
    // ...
  }
  if (textEnd < 0) {
    // ...
  }
  if (text) {
    advance(text.length);
  }

  if (options.chars && text) {
    options.chars(text, index - text.length, index);
  }
}
```

先判断当前标签 **lastTag** 是否存在，并且是否是 **makeMap('script,style,textarea', true)** ，符合条件进入该 **if** 循环。

通过 indexOf 获取 html 的第一位字符是否以 **<** 开头，进入子逻辑：

```js
if (textEnd === 0) {
  // <!--  -->
  if (comment.test(html)) {
  }
  // <!--[if !IE]>-->
  if (conditionalComment.test(html)) {
  }
  // <!DOCTYPE html>
  const doctypeMatch = html.match(doctype);
  if (doctypeMatch) {
  }
  // ...
}
```

通过正则，判断当前 **html** 是否是注释、浏览器条件注释，DOCTYPE 。并且如果命中则会通过 **advance** 方法将指针 **index** ，以及 **html** 内容进行切割更新：

```js
function advance(n) {
  index += n;
  html = html.substring(n);
}
```

随后会开始结束 end 标签和开始 start 标签的判断：

```js
// End tag:
const endTagMatch = html.match(endTag);
if (endTagMatch) {
  // ...
}

// Start tag:
const startTagMatch = parseStartTag();
if (startTagMatch) {
  // ...
}
```

### 解析开始标签

我们先从 startTag 相关方法开始看，毕竟有开始才会有结束：

```js
const startTagMatch = parseStartTag();
if (startTagMatch) {
  handleStartTag(startTagMatch);
  if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
    advance(1);
  }
  continue;
}
```

#### parseStartTag

通过 **parseStartTag** 方法进行解析，会根据 **startTagOpen** 正则拿到匹配的结果 **match** 。并且内部也有个 **while** 循环逐个解析开始标签内的属性信息：

```js
function parseStartTag() {
  const start = html.match(startTagOpen);
  if (start) {
    const match = {
      tagName: start[1],
      attrs: [],
      start: index
    };
    advance(start[0].length);
    let end, attr;
    while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
      attr.start = index;
      advance(attr[0].length);
      attr.end = index;
      match.attrs.push(attr);
    }
    if (end) {
      match.unarySlash = end[1];
      advance(end[0].length);
      match.end = index;
      return match;
    }
  }
}
```

为了更容易理解，我截取了几张图：

假设当前的 html 为：

```html
<div userName="eminoda"><span v-if="isOk">hello</span><span>world</span></div>
```

{% asset_img parseStart1.png start结果 %}

并且这个开始标签内是含有属性的，经过 while 解析后，得到 attr ：

{% asset_img parseStart2.png attr结果 %}

当解析完整个标签，则返回最后的 match 对象：

{% asset_img parseStart3.png end结果 %}

随后将 **match** 结果交给 **handleStartTag** 方法处理：

#### handleStartTag

```js
function handleStartTag(match) {
  const tagName = match.tagName;
  const unarySlash = match.unarySlash;

  if (expectHTML) {
    // ...
  }

  const unary = isUnaryTag(tagName) || !!unarySlash;

  const l = match.attrs.length;
  const attrs = new Array(l);
  for (let i = 0; i < l; i++) {
    const args = match.attrs[i];
    const value = args[3] || args[4] || args[5] || "";
    const shouldDecodeNewlines = tagName === "a" && args[1] === "href" ? options.shouldDecodeNewlinesForHref : options.shouldDecodeNewlines;
    attrs[i] = {
      name: args[1],
      value: decodeAttr(value, shouldDecodeNewlines)
    };
  }

  if (!unary) {
    stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
    lastTag = tagName;
  }

  if (options.start) {
    options.start(tagName, attrs, unary, match.start, match.end);
  }
}
```

我们直接看内部的 **for** 循环，遍历前面的 **attrs** 属性数组，将属性值赋值到 **value** 属性上。

{% asset_img handleStart1.png 遍历attrs %}

然后将结果 push 到 **stack** 堆栈上，并更新 **lastTag** 字段：

{% asset_img handleStart2.png stacks %}

#### options.start

最后调用 options.start 方法：

```js
function start(tag, attrs, unary, start, end) {
  // ...
  let element: ASTElement = createASTElement(tag, attrs, currentParent);
  // ...
  // apply pre-transforms
  for (let i = 0; i < preTransforms.length; i++) {
    element = preTransforms[i](element, options) || element;
  }

  // ...
  // process pre、for、if、once、rawAttrs

  if (!root) {
    root = element;
  }

  if (!unary) {
    currentParent = element;
    stack.push(element);
  } else {
    closeElement(element);
  }
}
```

创建 **ASTElement** 元素，这里使我们第一次接触到 ast 相关方法：

```js
function createASTElement(tag: string, attrs: Array<ASTAttr>, parent: ASTElement | void): ASTElement {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs), // 数组转对象
    rawAttrsMap: {},
    parent,
    children: []
  };
}
```

然后是一系列的 **process** 处理：

第一个是 **processPre** 方法：

```js
// inVPre 默认 false
if (!inVPre) {
  processPre(element);
  if (element.pre) {
    inVPre = true; //开关
  }
}
if (platformIsPreTag(element.tag)) {
  inPre = true;
}
```

解析元素是否有 **v-pre** ，它能加快模板解析的速度。当然会排除 **tag** 为 **pre** 的情况。为什么会有性能提升，你看之后的判断就能明白：

```js
if (inVPre) {
  processRawAttrs(element);
} else if (!element.processed) {
  // structural directives
  processFor(element);
  processIf(element);
  processOnce(element);
}
```

之后会挨个解析 **v-for、v-if、v-once** 等指令。

这里以 **processIf** 举例，看最终会对 element 加工成什么样：

```js
function processIf(el) {
  const exp = getAndRemoveAttr(el, "v-if");
  // ...
}
```

{% asset_image processIf-1.png %}

经过 **getAndRemoveAttr** 方法， **el** 上的 **attrsList** 上的 **v-if** 就被移除了。

```js
if (exp) {
  el.if = exp;
  addIfCondition(el, {
    exp: exp,
    block: el
  });
} else {
  if (getAndRemoveAttr(el, "v-else") != null) {
    el.else = true;
  }
  const elseif = getAndRemoveAttr(el, "v-else-if");
  if (elseif) {
    el.elseif = elseif;
  }
}
```

然后通过 **addIfCondition** 方法，往 **el** 添加 **ifConditions** 数组，用于存放当前元素对象 **{exp,block}** 。

{% asset_image processIf-2.png %}

之后按相同的逻辑，判断 **v-else** ，以及 **v-else-if** 。

最后将解析后的 **AST element** 推到 stack 中。

### 开始和结束标签中间的处理

```js
if (textEnd >= 0) {
  rest = html.slice(textEnd);
  while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {
    // ...
    rest = html.slice(textEnd);
  }
  text = html.substring(0, textEnd);
}
```

**textEnd** 会在一开始的 **html.indexOf("<");** 进行重新赋值，然后 **rest** 会得到最新的 **html** 内容：

```html
<!-- html -->
hello</span><span>world</span></div>
<!-- rest -->
</span><span>world</span></div>
```

根据 **while** 判断 **rest** 是否是结束标签，开始标签，注释等情况，获取 **text** 文本信息。

之后通过 **advance** 将指针往后移动，并且调用 **options.chars** :

```js
if (textEnd < 0) {
  text = html;
}

if (text) {
  advance(text.length);
}

if (options.chars && text) {
  options.chars(text, index - text.length, index);
}
```

下面是 **chars** 方法：

```js
function chars(text: string, start: number, end: number) {
  // ...
  const children = currentParent.children;
  // ...
  if (text) {
    // ...
    let res;
    let child: ?ASTNode;
    if (!inVPre && text !== " " && (res = parseText(text, delimiters))) {
      child = {
        type: 2,
        expression: res.expression,
        tokens: res.tokens,
        text
      };
    } else if (text !== " " || !children.length || children[children.length - 1].text !== " ") {
      child = {
        type: 3,
        text
      };
    }
    if (child) {
      if (process.env.NODE_ENV !== "production" && options.outputSourceRange) {
        child.start = start;
        child.end = end;
      }
      children.push(child);
    }
  }
}
```

根据不同条件，往 **currentParent.children** 添加新编制的 **child** 对象。

### 解析结束标签

假设我们的 html 已经解析到 **</foo>** 标签，那么将进入 end 方法判断：

```js
function end(tag, start, end) {
  const element = stack[stack.length - 1];
  // pop stack
  stack.length -= 1;
  currentParent = stack[stack.length - 1];
  closeElement(element);
}
```

将堆栈 **stack** 最后个元素出栈，获取最新 **stack** 最后个元素，更新当前父级元素 **currentParent** 。

## 最后的返回值

最后得到这样的解析对象 ：

{% asset_image root.png %}

当然 **parseHtml** 中还有很多细节未涉及，不过就搞懂这个方法而言已经够了。

# 生成器 generate

接下来我们看渲染方法的生成器 **generate** ：

```js
function generate(ast: ASTElement | void, options: CompilerOptions): CodegenResult {
  const state = new CodegenState(options);
  const code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  };
}
```

## 生成元素 genElement

```js
function genElement(el: ASTElement, state: CodegenState): string {
  // ...
}
```

我们能看到 vue 会针对结构化指令有不同的生成方式，这里还是单举 v-if 指令作说明：

```js
// ...
else if (el.if && !el.ifProcessed) {
  return genIf(el, state)
}
// ...
```

**genIf** 方法中会触发 **genIfConditions** 条件解析方法：

```js
function genIf(el: any, state: CodegenState, altGen?: Function, altEmpty?: string): string {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty);
}
```

不知还是否记得前面在 **parseHTML** 方法中， **v-if** 指令在 **element** 中 添加了 **ifConditions** 属性，构建了 **{exp,block}** 对象。

这里在 **genIfConditions** 方法中就会通过 **\${}** 表达式拿出 **exp** 生成字符串供后续使用。

```js
function genIfConditions(conditions: ASTIfConditions, state: CodegenState, altGen?: Function, altEmpty?: string): string {
  if (!conditions.length) {
    return altEmpty || "_e()";
  }

  const condition = conditions.shift();
  if (condition.exp) {
    return `(${condition.exp})?${genTernaryExp(condition.block)}:${genIfConditions(conditions, state, altGen, altEmpty)}`;
  } else {
    return `${genTernaryExp(condition.block)}`;
  }
}
```

无论调用哪个 **getXXX** 方法，最终都会进入到此 **else** 判断中：

```js
else {
  // component or element
  let code
  if (el.component) {
    code = genComponent(el.component, el, state)
  } else {
    let data
    if (!el.plain || (el.pre && state.maybeComponent(el))) {
      data = genData(el, state)
    }

    const children = el.inlineTemplate ? null : genChildren(el, state, true)
    code = `_c('${el.tag}'${
      data ? `,${data}` : '' // data
    }${
      children ? `,${children}` : '' // children
    })`
  }
  // module transforms
  for (let i = 0; i < state.transforms.length; i++) {
    code = state.transforms[i](el, code)
  }
  return code
}
```

## 得到 code 结果

最后我们的 **code** 就会长成这样：

```js
"_c('div',{attrs:{"userName":"eminoda"}},[(isOk)?_c('span',[_v("hello")]):_e(),_c('span',[_v("world")])])"
```

最后 **generate** 返回这样的对象：

```js
return {
  render: `with(this){return ${code}}`,
  staticRenderFns: state.staticRenderFns
};
```

# 再次回顾整个链路

上面一部分讲的是 **baseCompile** 方法中的 **AST** 解析：

```js
// src\compiler\index.js
function baseCompile(template: string, options: CompilerOptions): CompiledResult {
  const ast = parse(template.trim(), options);
  // ...
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
}
```

通过 **parse** 、 **generate** 处理，我们将解析 **AST Element** 对象，得到这样的结果 **{ast,render,staticRenderFns}** 。

**编译创建器** **createCompiler** 会在 js 声明后执行：

```js
const { compile, compileToFunctions } = createCompiler(baseOptions);
```

**createCompiler** 则是 **编译器创建工厂** **createCompilerCreator** 的引用

```js
const createCompiler = createCompilerCreator(function baseCompile(template: string, options: CompilerOptions): CompiledResult {
  // ...
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
});
```

当调用 **createCompilerCreator** 方法后，就会进入 **createCompiler** 方法：

```js
function createCompilerCreator(baseCompile: Function): Function {
  return function createCompiler(baseOptions: CompilerOptions) {
    function compile(template: string, options?: CompilerOptions): CompiledResult {
      //...
      const compiled = baseCompile(template.trim(), finalOptions);
      //...
      return compiled;
    }
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    };
  };
}
```

注意的是 **createCompiler** 中，会定义一个 **compile** 内部 **编译方法** ，在他里面将根据前面的 **baseCompile** 结果得到 **编译结果对象** **compiled** 作为 **compile** 方法执行后的返回值。

注意执行 **createCompileToFunctionFn** 方法后，除了会得到 **compile** 方法引用外，会有 **compileToFunctions** 属性，并且它会接受前面定义的 **compile** 方法，并在执行 **createCompileToFunctionFn** 方法：

```js
function createCompileToFunctionFn(compile: Function): Function {
  const cache = Object.create(null);

  return function compileToFunctions(template: string, options?: CompilerOptions, vm?: Component): CompiledFunctionResult {
    // ...
    const compiled = compile(template, options);
    // ...
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors);
    });
    return (cache[key] = res);
  };
}
```

通过 **createFunction** 来创建一个 **Function** 对象，为 **render** 和 **staticRenderFns** 属性提供运行基础。

同时这两个属性就是最开始调用 **compileToFunctions** 的返回结果：

```js
const { render, staticRenderFns } = compileToFunctions(template, {}, this);
options.render = render;
options.staticRenderFns = staticRenderFns;
```

# 总结

想必各位已经头晕了，面对如此复杂的函数引用嵌套，相信随着编程能力的提升会渐渐理解吧。

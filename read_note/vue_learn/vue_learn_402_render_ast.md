# Vue 渲染-词法解析 AST

compileToFunctions 是由 **createCompilerCreator** 编译器工厂方法所创建的属性之一。

该工厂方法依赖一个基础编译方法 **baseCompile** ，其包含 **ast** 解析和最后在使用的 **render** 方法：

```js
export const createCompiler = createCompilerCreator(function baseCompile(template: string, options: CompilerOptions): CompiledResult {
  const ast = parse(template.trim(), options);
  //...
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
});
```

## AST parse

```js
// E:\github\vue\src\compiler\index.js
const ast = parse(template.trim(), options);
```

首先通过 parse 把模板解析成 ast

> AST：抽象语法树（abstract syntax tree ）

看下 parse 方法的主体结构：

```js
function parse(template, options) {
  //...
  let root;
  //...
  // 交给此方法
  parseHTML(template, {
    //...
  });
  //...
  return root;
}
```

## parseHTML

进入 while 循环，会有一波波正则匹配，其实就是判断不同种类的 html 标签针对做不同的处理。相关正则可以 [点击这链接，看下正则 Demo](https://github.com/eminoda/myBlog/issues/10) 做个简单的入门。

```js
function parseHTML(html, options) {
    //...
    while (html) {
        last = html
        // Make sure we're not in a plaintext content element like script/style
        // 判断标签不存在（首次解析），或者 内容不为sripct、style
        if (!lastTag || !isPlainTextElement(lastTag)) {
            // 注释
            if (comment.test(html)) {
                // 切割 html
            advance(//...);
            }
            // CDATA
            if(conditionalComment.test(html)){
            advance(//...);
            }
            // doctype
            const doctypeMatch = html.match(doctype)
            if (doctypeMatch) {
            advance(doctypeMatch[0].length)
            continue
            }
            if (endTagMatch) {
                //...
            }
            const startTagMatch = parseStartTag();
            if(startTagMatch){
                handleStartTag(startTagMatch);
                //...
                continue;
            }
        }
    }
    // 有关 html 一些修正
    //...
}
```

忽略注释、doctype 等解析，先来看 startTagMatch，它是由 **parseStartTag** 解析 **开始标签** 的 html，赋值给 **startTagMatch**

```js
const startTagMatch = parseStartTag();
```

解析出来的 match 大致这样：

```js
{
    attrs: [
        [" id="app"", "id", "=", "app", undefined, undefined, index: 0, input: "html"]
    ],
    end: 29,
    start: 0,
    tagName: "div",
    unarySlash: ""
}
```

具体看 **parseStartTag** 怎么解析开始标签

```js
function parseStartTag() {
  const start = html.match(startTagOpen);
  if (start) {
    const match = {
      tagName: start[1], //div
      attrs: [],
      start: index // 0
    };
    advance(start[0].length); // html 去除开头标签部分 如：<div
    let end, attr;
    // 判断起始的标签结尾or含属性（读完开头标签所有内容，break）
    while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
      advance(attr[0].length);
      match.attrs.push(attr);
    }
    if (end) {
      match.unarySlash = end[1]; // 闭合标签相关问题
      advance(end[0].length);
      match.end = index;
      return match;
    }
  }
}
```

简单来说，对于 html 最终的处理结果，就像经历了一次“剃头”

```html
<div id="app">content</div>
```

变成，concent 前的 \<div\> 不是漏写，而是被解析掉了：

```html
   content
</div>
```

通过 **handleStartTag** 做进一步处理

```js
if (startTagMatch) {
    handleStartTag(startTagMatch);
    //...
    continue;
}
```

**handleStartTag** 使用 match 参数，标准化 attr ，并且运行 parseHTML.start

```js
function handleStartTag(match) {
  const tagName = match.tagName;
  const unarySlash = match.unarySlash;

  //...

  const l = match.attrs.length;
  const attrs = new Array(l);
  for (let i = 0; i < l; i++) {
    const args = match.attrs[i];
    // [" id="app"", "id", "=", "app", undefined, undefined, index: 0, input: "html"]
    // 获取当前属性的value
    const value = args[3] || args[4] || args[5] || '';
    //...
    // 将 attrs 从 regex 的结果进行标准化
    attrs[i] = {
      name: args[1],
      value: decodeAttr(value, shouldDecodeNewlines) //这里会对IE特殊 quirks
    };
  }
  //...
  if (options.start) {
    options.start(tagName, attrs, unary, match.start, match.end);
  }
}
```

**start** 实现：

```js
start (tag, attrs, unary) {
    //...
    // 定义 AST格式的 element
    let element: ASTElement = createASTElement(tag, attrs, currentParent)
    //...
    // apply pre-transforms
    for (let i = 0; i < preTransforms.length; i++) {
        // class style module 指令的转换
        // 具体看下 options.modules src\platforms\web\compiler\modules\index.js
        element = preTransforms[i](element, options) || element
    }
    //...
    // vue 结构化的指令标签
    if (inVPre) {
        processRawAttrs(element)
    } else if (!element.processed) {
        // structural directives
        processFor(element)
        processIf(element)
        processOnce(element)
        // element-scope stuff
        processElement(element, options)
    }
    //...
    // 经历一系列的处理，得到最新的 element
}
```

就这样层层解析 html 标签，直到最后处理 html 结尾标签。**endTagMatch**

## code render

```js
export function generate(ast: ASTElement | void, options: CompilerOptions): CodegenResult {
  const state = new CodegenState(options);
  const code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  };
}
```

通过 with ，把 this 对象注入到 code 中使用，作为最后的 render function.

上一篇：[Vue 渲染-render](./vue_learn_401_render_start.md)

<!-- 下一篇：[Vue 渲染-render](./vue_learn_401_render_start.md) -->

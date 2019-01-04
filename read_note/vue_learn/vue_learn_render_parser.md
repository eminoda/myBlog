<!-- vue_learn--渲染 基础编译 baseCompile -->

# 基础编译 baseCompile

**compile** 在 render 中贯彻从头至尾，看下如果作用于 template

## parse

```js
//E:\github\vue\src\compiler\index.js
const ast = parse(template.trim(), options);
```

首先通过 parse 把模板解析成 ast

> AST：抽象语法树（abstract syntax tree ）

看下 parse 如何定义

```js
function parse(template,options){
    ...
    let root;
    ...
    // 交给此方法
    parseHTML(template,{...})
    ...
    return root;
}
```

**parseHTML**

```js
function parseHTML(html, options) {
    ...
    while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    // 判断标签不存在（首次解析），或者 内容不为sripct、style
    if (!lastTag || !isPlainTextElement(lastTag)) {
        // 注释
        if (comment.test(html)) {
            // 切割 html
           advance(...);
        }
        // CDATA
        if(conditionalComment.test(html)){
           advance(...);
        }
        // doctype
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }
        if (endTagMatch) {
            ...
        }
        if(startTagMatch){
            ...
            // 这里会处理一些逻辑
            handleStartTag(startTagMatch);
        }
    }
    // 有关 html 一些修正
    ...
}
```

```js
function handleStartTag(match) {
    ...
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
}
```

---
title: Html 中 Document 的 nodeType 类型
tags:
  - js
  - html
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
---

# 前言

看到 **vue AST** 抽象语法树中有这样的定义：

```js
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
```

中间根据的 **child.type** 难道是随意定义的吗？我不敢瞎揣测，不过既然是对 **document** 树的解析，那必然会和 **document** 扯上关系。

这时我尝试在 F12 中输出 **document** 看到了 **nodeType** 属性和这个 **child.type** 相似。

个人认为可能有所关系，不过不重要，因为这篇主要讲 **document** 中的 **nodeType** 节点类型。

# nodeType 的分类

我在 **MDN** 上搜索 **nodeType** ，看到如下表格：

{% asset_img nodeType.png %}

当然还有一些类型已经废弃，这里不再列举。

通过 nodeType 来定义我们 document 上节点的节点类型，通过代码，你讲看到具体的输出：

这是一段很简单的 **html** 文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Document</title>
  </head>
  <body>
    <div id="app">
      <!-- 注释 -->
      <span>eminoda</span>
    </div>
  </body>
</html>
```

然后我简单定义了个工具方法，示意 nodeType ：

```js
function printNodeType(dom) {
  // console.log(`nodeName=${dom.nodeName},nodeType=${dom.nodeType}`);
  let type = dom.nodeType;
  switch (type) {
    case Node.ELEMENT_NODE:
      console.log(`Node.ELEMENT_NODE=${type}, NodeName=${dom.nodeName}`); // 1
      break;
    case Node.TEXT_NODE:
      console.log(`Node.TEXT_NODE=${type}, NodeName=${dom.nodeName}`); // 3
      break;
    case Node.CDATA_SECTION_NODE:
      console.log(`Node.CDATA_SECTION_NODE=${type}, NodeName=${dom.nodeName}`); // 4
      break;
    case Node.PROCESSING_INSTRUCTION_NODE:
      console.log(`Node.PROCESSING_INSTRUCTION_NODE=${type}, NodeName=${dom.nodeName}`); // 7
      break;
    case Node.COMMENT_NODE:
      console.log(`Node.COMMENT_NODE=${type}, NodeName=${dom.nodeName}`); // 8
      break;
    case Node.DOCUMENT_NODE:
      console.log(`Node.DOCUMENT_NODE=${type}, NodeName=${dom.nodeName}`); // 9
      break;
    case Node.DOCUMENT_TYPE_NODE:
      console.log(`Node.DOCUMENT_TYPE_NODE=${type}, NodeName=${dom.nodeName}`); // 10
      break;
    case Node.DOCUMENT_FRAGMENT_NODE:
      console.log(`Node.DOCUMENT_FRAGMENT_NODE=${type}, NodeName=${dom.nodeName}`); // 11
      break;
  }
}
```

为了使得全部的节点类型输出顺利，我单独针对部分类型处理：

```js
// Node.DOCUMENT_NODE=9, NodeName=#document
printNodeType(document);

// Node.DOCUMENT_TYPE_NODE=10, NodeName=html
printNodeType(document.doctype);

//Node.DOCUMENT_FRAGMENT_NODE=11, NodeName=#document-fragment
printNodeType(document.createDocumentFragment());

let xmlDomParser = new DOMParser().parseFromString("<xml></xml>", "application/xml");
// Node.CDATA_SECTION_NODE=4, NodeName=#cdata-section
printNodeType(xmlDomParser.createCDATASection("cdata"));

// Node.PROCESSING_INSTRUCTION_NODE=7, NodeName=xml-stylesheet
printNodeType(xmlDomParser.createProcessingInstruction("xml-stylesheet", 'href="mycss.css" type="text/css"'));
```

然后是常规的 html 元素：

```js
let domRoot = document.getElementById("app");
queryChildrenNode(domRoot);
// Node.ELEMENT_NODE=1, NodeName=SPAN
// <span>eminoda</span>

// Node.TEXT_NODE=3, NodeName=#text
// eminoda

// Node.COMMENT_NODE=8, NodeName=#comment
// <!-- 注释 -->
function queryChildrenNode(parentDom) {
  for (let i = 0; i < parentDom.childNodes.length; i++) {
    let dom = parentDom.childNodes[i];
    printNodeType(dom);
    queryChildrenNode(dom);
  }
}
```

# 回过头看 vue

为什么 vue 中的 type 属性只出现了 2、3 （默认 1）？

如果你熟悉其中的 **parseHTML** 方法，如下应该就是其答案：

```js
let textEnd = html.indexOf('<')
if (textEnd === 0) {
// Comment:
if (comment.test(html)) {
    // ..
}

// http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
if (conditionalComment.test(html)) {
    // ..
}

// Doctype:
const doctypeMatch = html.match(doctype)
if (doctypeMatch) {
    // ..
}
```

首先在对 html 解析时，会优先对 注释（COMMENT_NODE，CDATA_SECTION_NODE） 、文档类型（DOCUMENT_NODE， DOCUMENT_TYPE_NODE） 进行判断；另外 vue 本身就是虚拟 Dom 机制，所以也就不需要 DOCUMENT_FRAGMENT_NODE 。

最后只要匹配 ELEMENT_NODE 和 TEXT_NODE 类型即可（值为 1，3）。

我们知道 innerHtml 会有 **双大括号** 表达式，vue 就空出 2 专门用来对表达式解析。

# 总结

我只是看 vue 渲染代码时，好奇为什么 type 是这样的取值方式。也许是错的，不过希望各位对 nodeType 这个 document 上的属性有所认识。

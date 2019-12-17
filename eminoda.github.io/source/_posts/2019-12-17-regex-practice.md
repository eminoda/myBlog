---
title: 从简到难，示例几则 vue 中的正则表达式
tags:
  - js
  - regexp
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2019-12-17 10:58:43
---


# 前言

正则一直是令我头大的问题，简单入门的那些还好，但是一旦复杂起来真是连百度都不知道他的用意，只能一小段一小段的试。

这篇会列举几个 vue 源码中的几个正则表达式，为什么选取这些呢？

因为我近段时间在深入学习 vue 的代码，同时觉得这些表达式也是非常具有实战性的，相信对我们以后实现业务逻辑会有很大的启发和帮助。

# 几个基础概念

如果你对正则表达式如下概念不熟悉，有必要的话可以再回顾下。（当然只针对下面例子涉及的概念）

## 部分正则规则

### 常用符号

| 字符       | 含义                                       |
| ---------- | ------------------------------------------ |
| \          | 转义字符。匹配数据不想被正则规则解析       |
| ^          | 匹配输入的开始。注意，和在 [] 中定义的不同 |
| \$         | 匹配输入的结束                             |
| ?          | 0 or 1 **次，等价** {0,1}                  |
| .          | 换行 \n 之外的单个字符                     |
| x &#124; y | ‘x’或者‘y’                                 |

### 多次匹配

| 字符  | 含义                                   |
| ----- | -------------------------------------- |
| \*    | 0 or 多次 **等价** {0,}                |
| +     | 1 or 多次，至少出现一次。**等价** {1,} |
| {n}   | 匹配重复出现 n 次                      |
| {n,m} | n<= 匹配出现次数 <=m                   |

### 任意字符

| 字符   | 含义                                           |
| ------ | ---------------------------------------------- |
| [xyz]  | 匹配方括号中的任意字符                         |
| [^xyz] | 匹配任何没有包含在方括号中的字符（反向字符集） |

### 特殊字符

| 字符 | 含义                                                                 |
| ---- | -------------------------------------------------------------------- |
| \b   | 匹配一个词的边界（前后没有其他字符）                                 |
| \s   | 匹配任何空白字符（空格、制表符、换页符等），**等价** [ \f\n\r\t\v]。 |
| \S   | 匹配任何非空白字符。**等价** [^ \f\n\r\t\v]。                        |
| \w   | 匹配包括下划线的任何单词字符。**等价** “[A-Za-z0-9_]”。              |
| \W   | 匹配任何非单词字符。**等价** “[^a-za-z0-9_]”。                       |

### 特殊规则

| 字符   | 含义                                        |
| ------ | ------------------------------------------- |
| (x)    | 捕获括号（**匹配 'x' 并且记住匹配项**）     |
| (?:x)  | 非捕获括号（**匹配 'x' 但是不记住匹配项**） |
| x(?=y) | 正向肯定查找                                |
| x(?!y) | 正向否定查找                                |

## test exec match 区别

- test 不需要知道匹配内容，只需判断正则是否命中的场景
- exec 进行搜索匹配，返回匹配结果
- match 是 String 对象方法，和 exec 类似

看几个小 demo ：

```js
// 基本使用
let numRE = /[0-9]+/;
let data2 = "abc123efg456";

console.log(numRE.test(data2)); // true
console.log(numRE.exec(data2)); // [ '123', index: 3, input: 'abc123efg456' ]
console.log(data2.match(numRE)); // [ '123', index: 3, input: 'abc123efg456' ]

// 对比 exec ， match
let numGobalRE = /[0-9]+/g;

console.log(numGobalRE.test(data2)); // true
console.log(numGobalRE.exec(data2)); // [ '456', index: 9, input: 'abc123efg456' ]
console.log(data2.match(numGobalRE)); // [ '123', '456' ]
```

在全局模式下， **match** 不会有额外 **索引 index** 、 **被匹配数据 input** 的输出。并且只有所有匹配的数据。

## 非括号捕获

匹配 (?:x) 中 x 表达式，但不记住选项。

```js
/**
 * 非括号捕获
 */
const nonCapturingRE = /(?:abc){1}/;
// [ 'abc', index: 0, input: 'abc' ]
console.log("abcefg".match(nonCapturingRE));

/**
 * 括号捕获
 */
const capturingRE = /(abc){1}/;
// [ 'abc', 'abc', index: 0, input: 'abcefg' ]
console.log("abcefg".match(capturingRE));
```

似乎从结果上看，这两者没什么区别。我通过调用字符串 replace 方法后，你再看下：

```js
let result1 = "abcefg".replace(nonCapturingRE, "hello $1 "); // hello $1 efg
let result2 = "abcefg".replace(capturingRE, "hello $1 "); // hello abc efg
```

你应该能看到其中的区别了吧。

## replace

**replace** 作为 **String** 对象中的方法，相比都经常使用。

但如果将 **replace** 第一个参数传入正则表达式，第二个参数而一个函数 **Fn** ，那是否知道 **Fn** 的参数列表有什么特殊作用吗？

```js
string.replace(Regexp, Function);
```

**Function** 的参数说明：

- match 匹配内容
- $1,$2 ... 括号捕获内容
- offset 匹配开始位置
- string 源字符串

结合 **括号捕获** 和 **非括号捕获** 应该很容易明白：

```js
var re = /(\w+)\s(\w+)/;
var str = "John Smith";
var newstr = str.replace(re, function(...args) {
  console.log(args); // ["John Smith", "John", "Smith", 0, "John Smith"]
});
```

```js
var re = /(?:\w+)\s(\w+)/; // 将其中一个调整为 非括号捕获
console.log(args); // ["John Smith", "Smith", 0, "John Smith"]
```

# html 注释判断

vue 会解析我们 html 模板，html 中的注释肯定没有任何意义，所以有必要将它过滤掉。

那怎么匹配出现的注释内容呢？

```html
<!-- 我是个注释 -->
<div>hello</div>

<!--[if !IE]>-->
<div>我是个低端浏览器</div>
```

直接上正则逻辑：

```js
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

// 匹配注释
if (comment.test(html)) {
  const commentEnd = html.indexOf("-->"); // 记录注释右关闭起始位置

  if (commentEnd >= 0) {
    advance(commentEnd + 3); // 挪3位长度，即解析完整个注释
    continue;
  }
}

// 匹配浏览器注释
if (conditionalComment.test(html)) {
  const conditionalEnd = html.indexOf("]>"); // 记录注释右关闭起始位置

  if (conditionalEnd >= 0) {
    advance(conditionalEnd + 2); // 挪2位长度，即解析完整个注释
    continue;
  }
}
```

上面摘自 **vue** 中 **parseHtml** 方法，相对简单。

利用 **test** 判断当前 **html** 内容是否符合预期，配合“固定”注释的左右标识，记录当前注释结束为止，为下次新的 **html** 解析做准备。

# 驼峰表达式转换

```js
const camelizeRE = /-(\w)/g;
const camelize = str => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
};
```

我们可能会用 **abc-def** 的方式定义对象的属性名，或者 **vue** 中非规范的定义， **vue** 框架就会有统一的处理，将 **abc-def** 统一转化为 **abcDef** **驼峰写法**。

# 解析 html 属性 KV

```js
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
```

我们先看这段正则的匹配输出结果：

```js
'id="app" class="foo">hello</div>'.match(attribute);
// ["id="app"", "id", "=", "app", undefined, undefined, index: 0, input: "id="app" class="red" disabled></div>", groups: undefined]

"id='app' class='foo'>hello</div>".match(attribute);
// ["id='app'", "id", "=", undefined, "app", undefined, index: 0, input: "id='app' class='red' disabled></div>", groups: undefined]

"  disabled>hello</div>".match(attribute);
// ["  disabled", "disabled", undefined, undefined, undefined, undefined, index: 0, input: "disabled>hello</div>", groups: undefined]
```

按照顺序，开始分析：

我先把这个正则简化下：

```regext
/A(B)(?:C(?(?(D)|(E)|(F))))/
```

第一部分 **A** ，匹配任何空白字符，并且空白符可出现 or 未出现过：

```regexp
^\s*
```

随后跟着一个 **括号捕获** 表达式 **B**：

```regexp
([^\s"'<>\/=]+)
```

用 **[]** 中括号包裹，并且里面匹配的内容至少要出现一次。

注意内部内容的 **^** 并不是说明以其开头，而是 **非 \s"'<>/=** 这些字符，从而 **取出属性的 key**。

后面将是个复杂的 **非括号捕获** ：

```regexp
(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?
```

我们先分析其中三个括号捕获 **DEF**：

```regexp
"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)
```

仔细看不难发现，**D** 和 **E** 是针对不同的引号（双引号、单引号）包裹内容来匹配的，并且内部不能出现外部的引号。

**F** 和之前的 **B** 类似，唯独去除了斜杠限制。

```regexp
(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+))
```

最后针对 **DEF** 的结果，来做非括号匹配。就能 **取出属性的 value**

既然知道了属性的 key、value 取值方式，那么 **C** 的作用也显而易见了：

```regexp
(?:\s*(=)\s*(?(D)|(E)|(F)))
```

用等号 = 作为分隔符，取出整个 **key=value** 的值。

那么再回头看之前正则对应的输出结果就容易些了。

# 正则的封装

讲个轻松些的，如下是个判断 html 起始标签的正则：

```regexp
/^<((?:[a-zA-Z_][\-\.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*\:)?[a-zA-Z_][\-\.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)/
```

能发现整个正则表达式很长，虽然逻辑不复杂，但看起来真的很揪心。

我们看看 vue 是怎么做的？

```js
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
```

使用正则的 **source** 属性，我们能拿到正则表达式的字符串，同时需要注意所有交付给 **new RegExp** 的参数，对其中的斜杠需要作次转义。

这样通过 es6 的 **``** 表达式和 **RegExp** 对象，将原先繁琐的正则表达式优化成多个变量定义，现在我们能按其意思快速的理解正则了。

# 总结

上面这些例子只是个引子，我希望同我一样惧怕正则表达式的同学能正视它，因为表面看上去它很复杂，但其实耐心些，像主流框架些的正则都是能挖掘很多内含的东西。

希望这篇文章能让你的正则能力提升一个台阶。

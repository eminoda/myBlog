---
title: 从简到难，快速理解几个正则表达式
tags:
  - js
  - regexp
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
---

# 前言

正则一直是令我头大的问题，简单入门的那些还好，但是一旦复杂起来真是连百度都不知道他的用意，只能一小段一小段的试。

这篇会列举几个 vue 源码中的几个正则表达式，为什么选取这些呢？

因为我近段时间在深入学习 vue 的代码，同时觉得这些表达式也是非常具有实战性的，相信对我们以后实现业务逻辑会有很大的启发和帮助。

# 几个基础概念

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

# 属性判断

```js
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
```

按照顺序，开始分析：

第一部分，匹配任何空白字符，并且空白符可出现 or 未出现过：

```regexp
^\s*
```

随后跟着一个 **括号捕获** 表达式：

```regexp
([^\s"'<>\/=]+)
```

用 **[]** 中括号包裹，并且里面匹配的内容至少要出现一次。

注意内部内容的 **^** 并不是说明以其开头，而是 **非 \s"'<>/=** 这些字符。

后面将是个复杂的 **非括号捕获** ：

```regexp
(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?
```

我们按照从内到外三部分继续分析：

最内层一个 **括号捕获** ：

```regexp
([^\s"'=<>`]+)
```

和前面 **[]** 内的说明一样，只是去除了 **/** 斜杠的元素，代表支持斜杠的取值。



```regexp

```

```regexp

```

```regexp

```

```regexp

```

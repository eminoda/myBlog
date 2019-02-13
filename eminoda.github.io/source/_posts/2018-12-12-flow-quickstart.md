---
title: flow 静态代码检查工具
date: 2018-12-12 10:39:24
tags: flow
categories:
    - 开发
    - node
thumb_img: flow.png
---

和上一篇一样 [rollup 5 分钟入门](https://eminoda.github.io/2018/12/11/rollup-quickstart/)，这也是快速入门，目的就是为了看 Vue 代码。

当然如果你有 **Typescript** 的经验，很快就能知道是怎么一回事了。

# FLow

**Flow** 是一个对 js 做静态类型检查的工具，可以让整个代码更稳定，正确。

> Flow is a static type checker for your JavaScript code. It does a lot of work to make you more productive. Making you code faster, smarter, more confidently, and to a bigger scale.

## 简单的示例

1. 安装

    ```
    npm install flow -D
    ```

2. 环境配置

    package.json

    ```
    "scripts": {
        "start": "rollup -c ./script/rollup.config.js --environment TARGET:dev",
        "flow": "flow check"
    }
    ```

    .flowconfig 可以通过 **flow init** 生成

    ```
     [ignore]

     [include]
     ./src/.\*

     [libs]

     [lints]

     [options]

     [strict]

    ```

3. 配合 rollup，运行

    ```
    // 检查代码，如果Error将会输出在控台
    npm run flow
    // 执行rollup构建
    npm run start
    ```

    rollup.config.js

    ```js
    const flow = require('rollup-plugin-flow-no-whitespace');
    export default {
    	input: './src/main.js',
    	output: {
    		file: './packages/output.bundle.js',
    		format: 'cjs',
    		name: 'test'
    	},
    	plugins: [flow()]
    };
    ```

    output.bundle.js 输出文件（能看到类型检查的代码被 ignore 了）

    ```js
    'use strict';

    //
    function foo(x) {
    	if (x) {
    		return x;
    	}
    	return 'default string';
    }

    function Test() {
    	this.name = 'test';
    	this.say = foo();
    }

    module.exports = Test;
    ```

## [.flowconfig](https://flow.org/en/docs/config/)

.flowconfig 文件中的路径相对于该文件所处的位置

所有配置参考 [OCaml regular expressions](http://caml.inria.fr/pub/docs/manual-ocaml/libref/Str.html#TYPEregexp)

举例：

```
[include]
# 当前目录相对路径为：/path/to/root/
../externalFile.js              # /path/to/externalFile.js
../externalDir/                 # /path/to/externalDir/
../otherProject/*.js            # /path/to/otherProject/下，所有.js后缀的文件
../otherProject/**/coolStuff/   # /path/to/otherProject下，已coolStuff/开头的路径

[ignore]
.*/__tests__/.*                 # 忽略所有__tests__下的文件
.*/src/\(foo\|bar\)/.*          # 忽略 src/foo or src/bar
.*\.ignore\.js                  # 忽略 指定.ignore.js文件
```

## 更多信息

贴出最常用的一些配置，详细还是要[参阅官网](https://flow.org/en/docs/types/)

### [CLI](https://flow.org/en/docs/cli/)

```
flow check
flow init
```

| cli          | 说明                                                          |
| ------------ | ------------------------------------------------------------- |
| check        | 开始审查 Does a full Flow check and prints the results        |
| init         | 初始化配置文件                                                |
| ast          | Print the AST                                                 |
| autocomplete | Queries autocompletion information                            |
| server       | Runs a Flow server in the foreground                          |
| start        | Starts a Flow server                                          |
| status       | (default) Shows current Flow errors by asking the Flow server |
| stop         | Stops a Flow server                                           |
| version      | Print version information                                     |
| --help       | This list of options                                          |

### Type Annotations 类型标注

```
function concat(a: string, b: string) {
  return a + b;
}
concat("A", "B"); // Works!
concat(1, 2); // Error!
```

### Primitive Types 基本数据类型

-   Booleans - boolean
-   Strings - string
-   Numbers - number
-   null - null
-   undefined - void
-   Symbols （Flow 暂不支持）

### Maybe Types 可能的类型

```
function acceptsMaybeString(value: ?string) {
  // ...
}
acceptsMaybeString("bar");     // Works!
acceptsMaybeString(undefined); // Works!
acceptsMaybeString(null);      // Works!
```

### Optional object properties 对象参数可选

```
// @flow
function acceptsObject(value: { foo?: string }) {
  // ...
}

acceptsObject({ foo: "bar" });     // Works!
acceptsObject({ foo: undefined }); // Works!
acceptsObject({ foo: null });      // Error!
acceptsObject({});                 // Works!
```

### Optional function parameters 参数列表参数可选

```
// @flow
function acceptsOptionalString(value?: string) {
  // ...
}

acceptsOptionalString("bar");     // Works!
acceptsOptionalString(undefined); // Works!
acceptsOptionalString(null);      // Error!
acceptsOptionalString();          // Works!
```

### Literal Types 文字（常量）类型

```
// @flow
function acceptsTwo(value: 2) {
  // ...
}

acceptsTwo(2);   // Works!
// $ExpectError
acceptsTwo(3);   // Error!
// $ExpectError
acceptsTwo("2"); // Error!
```

多个可能值

```
// @flow
function getColor(name: "success" | "warning" | "danger") {
  switch (name) {
    case "success" : return "green";
    case "warning" : return "yellow";
    case "danger"  : return "red";
  }
}

getColor("success"); // Works!
getColor("danger");  // Works!
// $ExpectError
getColor("error");   // Error!
```

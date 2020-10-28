---
title: webpack import 循环引用，导致引用变量 undefined
tags: webpack
categories:
  - 开发
  - 前端开发
---

# 前言

记得两三年前，刚试手用 **webpack** 构建一个 **web** 项目，就遇到了个坑：**import 的 js 文件其引用居然是 undefined**。

那时工期也不是很充裕，为了解决 **bug**，把导入的 **js** 直接 copy 到当前文件，代码肯定是冗余了，但至少解决了问题。谁知，今年居然遇到了两次类似的问题（死鱼脸），还是印证了那句：

> 出来混的，有些债迟早要还的！

我尝试百度了下，都没有靠谱的解决方案，很崩溃：

{% asset_img baidu.png %}

那么现在探究下其中的原因了。

# Demo 示例

抛开复杂的项目结构，用简单的代码示例来还原问题场景：

```js
// webpack.config.js
module.exports = {
  entry: './src/main.js',
  // ...
};
```

```js
// main.js
import a from './a';
console.log(a); // 1
```

```js
// a.js
import b from './b';
export default b;
```

```js
// b.js
import a from './a';
console.log('a:', a); // undefined
// 会导致在此文件中，相关与 a 的操作不符合预期
export default 1;
```

相信各位看了，基本猜到问题的点了：没错，就是 **循环引用** 。

**webpack** 的入口文件为 **main.js**，随后他们的引用方式为： main.js --> a.js --> **b.js --> a.js --> b.js**

问题就出在 **a.js** 被循环引用了，**b.js** 中导入的 **a.js**，其引用值为 **undefined**，虽然我们希望它得到最后的 **1** 结果。

接下来就看 **webpack** 是如何处理文件的 **import** 导入，以及循环引用为何会引发这样的问题。

# webpack 如何处理文件导入和引用

首先，我们的整个 Demo 会被 **webpack** 解析成如下代码结构：

```js
(function (modules) {
  var installedModules = {}; // The require function

  function __webpack_require__(moduleId) {} // expose the modules object (__webpack_modules__)
  // ...
  return __webpack_require__((__webpack_require__.s = './src/main.js'));
})({
  './src/a.js': function (module, __webpack_exports__, __webpack_require__) {},
  './src/b.js': function (module, __webpack_exports__, __webpack_require__) {},
  './src/main.js': function (module, __webpack_exports__, __webpack_require__) {},
});
```

这是个立即执行函数，当浏览器加载该 js 后将被触发执行。

随后将根据入口 **entry** 文件 **main.js** ，执行 **\_\_webpack_require\_\_** 方法：

```js
function __webpack_require__(moduleId) {
  // Check if module is in cache
  if (installedModules[moduleId]) {
    return installedModules[moduleId].exports;
  } // Create a new module (and put it into the cache)
  var module = (installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {},
  }); // Execute the module function

  modules[moduleId].call(module.exports, module, module.exports, __webpack_require__); // Flag the module as loaded

  module.l = true; // Return the exports of the module

  return module.exports;
} // expose the modules object (__webpack_modules__)
```

在这个 **\_\_webpack_require\_\_** 中，无非就改了如下几件事：

- 判断全局 **installedModules** 是否有对应的 **moduleId** 值，有的话就导出其引用
- 如果没有，就执行 **modules[moduleId]** 方法，最后返回该模块 module 的引用

我们可以打几个断点，更细致的看下其中的过程：

1.  进入 **bundle** 文件，执行立即函数，调用 **\_\_webpack_require\_\_** 方法，并传入参数：**'./src/main.js'**

    {% asset_img w1.png %}

    由于初次调用，**installedModules[moduleId]** 肯定为空，接着通过 **modules[moduleId].call** 借用函数调用。

    被 **call** 的函数就是最开始，传入立即执行函数的参数，根据 **moduleId** 来对应的函数：

    ```js
    {
        './src/a.js': function (module, **webpack_exports**, **webpack_require**) {},
        './src/b.js': function (module, **webpack_exports**, **webpack_require**) {},
        './src/main.js': function (module, **webpack_exports**, **webpack_require**) {},
    }
    ```

2.  随后执行对应的 **call** 函数

    {% asset_img w2.png %}

    能看到 **main.js** 里导入了 **a.js**，则又会调用 **\_\_webpack_require\_\_** 方法

    {% asset_img w3.png %}

    注意，这里对 **a.js** 的调用并没有结束（返回值还没有拿到），由于 **a.js** 中又导入了 **b.js**，所以又会同上述步骤再执行 **b.js** 对应的函数。

3.  **b.js** 中由于引用了 **a.js**，导致循环引用，问题就来了

    前面 webpack 执行过程大概是这样：

    ```shell
    webpack_require(main.js)
        modules[main.js].call
            # import a from './a.js'
            webpack_require(a.js)
                modules[a.js].call
                    # import b from './b.js'
                     webpack_require(b.js)
                        modules[b.js].call
                            # 打住，这里开始要注意了
                            # import a from './a.js'
                            webpack_require(a.js)

    ```

    但到 **modules[b.js].call** 时就不同了，因为先前 **webpack_require(a.js)** 被执行过了，在 **modules[b.js].call** 环节执行 **webpack_require(a.js)** 后，**installedModules[moduleId]** 判断为 **true** 了：

    {% asset_img w4.png %}

    而最开始第一次导入 **a.js** 时，其返回值还没有拿到，所以此时为 **true** 后，返回值就为 **undefined** ，这就是为何 Demo 出问题的原因。

# 怎么避免

不可避免项目中会遇到这样重复循环引用的情况，那怎么避免，或者怎么从设计上绕过去？

推荐一个 npm 模块：**circular-dependency-plugin**，我们可以在 webpack 配置文件中添加对应的 plugins，在构建时避免循环引用的问题。

```js
const CircularDependencyPlugin = require('circular-dependency-plugin');
module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin(),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
  ],
};
```

随后，我们的控制台就能看到如下错误引用的信息：

```
ERROR in Circular dependency detected:
src\b.js -> src\a.js -> src\b.js
```


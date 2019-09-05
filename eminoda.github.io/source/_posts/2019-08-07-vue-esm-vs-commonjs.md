---
title: ES Module 和 CommonJS 的区别
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2019-08-07 18:24:23
---

## 从一个错误开始

在开始前，先补充一个知识点，看如下 Vue 报错日志：

> [Vue warn]: You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.

这个错误牵扯到针对不同的 vue 版本，业务代码写法也会有区别。

官网有详细的说明，[对不同构建版本的解释](https://cn.vuejs.org/v2/guide/installation.html#%E5%AF%B9%E4%B8%8D%E5%90%8C%E6%9E%84%E5%BB%BA%E7%89%88%E6%9C%AC%E7%9A%84%E8%A7%A3%E9%87%8A)

这里列出其中两个版本：

| 版本                  | CommonJs              | ES Module          |
| --------------------- | --------------------- | ------------------ |
| 完整版（运行 + 编译） | vue.common.js         | vue.esm.js         |
| 运行版                | vue.runtime.common.js | vue.runtime.esm.js |

安装 Vue 后，就能在 **node_modules/vue/dist/** 下看到所有的版本文件

### 报错时的代码

webpack.js

```js
resolve: {
  alias: {
    vue$: 'vue/dist/vue.runtime.common.js';
  }
}
```

app.js

```js
const template = `<div></div>`;
new Vue({ template }).$mount('#app');
```

构建时，选择了运行 runtime 版本，他没有编译器功能，所以编译后出现了如上错误。

runtime 版本缺如下代码：

```js
// node_modules/vue/src/platforms/web/entry-runtime-with-compiler.js
const mount = Vue.prototype.$mount; // 公共 $mount 方法
Vue.prototype.$mount = function() {
  // 会初始化 render 方法
};
```

### 解决方式

#### 改用完整版

```js
resolve: {
  alias: {
    vue$: 'vue/dist/vue.esm.js';
  }
}
```

#### 提供 render 函数

```js
new Vue({ render: h => h(App) });
```

版本依旧使用：vue.runtime.common.js

**优势**：运行时版本相比完整版体积要小大约 30%，所以应该尽可能使用这个版本（这也是官方推荐的）。

## ES Module 和 CommonJS 区别

前奏很漫长，似乎和这篇文章没什么关系。但要注意到这里 runtime 的版本用的是 ES Module 的方式。

### CommonJS

Node 中一个模块加载方案，在服务端运行时，同步加载。注意，虽说取出模块内部的子方法，但在运行加载时，是取出所有的 fs 内容。

```js
let { stat, exists, readFile } = require('fs');
```

### ES Module

js 在模块管理上一直百家齐放，什么 CommonJS、CMD、AMD、UMD ...

为了统一模块的加载方式，ES6 推出了模块 Module 的概念，归根结底尽量使得在前端构建编译时，能确定各个模块之间的依赖。可以做“静态优化”。

```js
// esm 举例
import Vue from 'vue';
```

有没有试过 CommonJS 的模块引入方式？

```js
const Vue = require('vue');
const App = require('./App.vue');

// import Vue from 'vue';
// import App from './App.vue';
import router from './router';

new Vue({ router, render: h => h(App) }).$mount('#app');
```

然后就报错了...，看下控制台 App 对象的信息：

{% asset_img esm.png demo %}

注意到 App 导出方式是使用 exports default 方式，所以在 CommonJS 引用时，会多个 default 属性。

## ES Module 中一个错误

比较下面两种 esm export 写法：

### 对象字面量导出

```js
export default {
  a: 1,
  b: 2
};
```

```js
import { a, b } from './test';
console.log(a); // undefined
```

### 正确写法

```js
const test = {
  a: 1,
  b: 2
};
export default test;
```

```js
import test from './test2';
```

esm 是不支持前者这种导出方式，只是构建工具可能“会出错”，导致我们一致认为这种方式是没有问题的。

### 正确的 export 姿势

**default** 默认导出

```js
export default 1;

export default function test(){}

export default Test{}
```

```js
export var a = 1;

export function test() {}

export class Test {}
```

#### 最佳实践

1. 在前端代码中，统一为 ES Module 加载方式
2. 在使用 export default 默认方式时，不要使用对象字面量

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [阮一峰-Module 的语法](http://es6.ruanyifeng.com/#docs/module)
- [js 模块化 CommonJS、AMD、CMD、UMD 是什么意思](http://www.xgllseo.com/?p=5595)
- [深入解析 ES Module](https://zhuanlan.zhihu.com/p/40733281)

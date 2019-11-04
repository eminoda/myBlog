---
title: vue 基础-起步&安装
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

此系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# vue 介绍

是一个渐进式框架，容易上手，相比于其他主流框架（react、angular）学习成本低。

本人是从 angular.js 转到 vue 的，切身体会告诉我一门技术能快速投入业务编码工作尤为重要。但后续使用了 angular2 才方知某些方面是 vue 不及前两者的。比如：angular 中的 Typescript、rxjs、Dependency injection 等，或者 React 里 JSX、virtual Dom、状态机等（没用过就不扯了），总之他们随便抓来一个够玩一阵的了。

所以学好 Vue 也是最快速了解整个前端框架发展趋势的前提，毕竟他们三者有太多相似之处了。

# 安装

## 兼容性

在 vue 中使用了诸如 defineProperty 的对象方法，导致只有支持 ES5 的浏览器才运行正常。像 IE8 及以下版本就不支持。

## cli

官方提供了 [vue-cli](https://cli.vuejs.org/) 工具，可以方便快速的构建整个 vue 应用。

```shell
# 安装
npm install -g @vue/cli
# 新建项目
vue create hello-world
# 启动服务
npm run serve
```

如果不是特殊要求，还是不要用 script 方式，毕竟不能确保第三方 cdn 的服务不会出问题。

# 不同构建版本的解释

## 版本区别

| 版本                 | UMD                | CommonJS              | ES Module (构建工具使用) | ES Module (用于浏览器) |
| -------------------- | ------------------ | --------------------- | ------------------------ | ---------------------- |
| 完整版               | vue.js             | vue.common.js         | vue.esm.js               | vue.esm.browser.js     |
| 运行时版             | vue.runtime.js     | vue.runtime.common.js | vue.runtime.esm.js       | -                      |
| 完整版（生产压缩）   | vue.min.js         | -                     | -                        | vue.esm.browser.min.js |
| 运行时版（生产压缩） | vue.runtime.min.js | -                     | -                        | -                      |

## 术语介绍

**完整版**：同时包含编译器 + 运行时的版本。

**编译器**：用来将模板字符串编译成为 JavaScript **渲染函数**的代码。

**运行时**：用来创建 Vue 实例、渲染并处理虚拟 DOM 等的代码。基本上就是**除去编译器**的其它一切。

**UMD**：可以使用 script 在浏览器端使用的脚本。

**CommonJS**：配合 Browserify 或 webpack 1 构建的脚本。

**ES Module** 分别有两种：

- 构建工具使用：配合 webpack 2 或 Rollup 现在主流构建工具使用的脚本，结合 tree-shaking 实现代码进一步的简化。
- 浏览器直接使用：现代浏览器，可设置 <script type="module"\> 直接导入。

## ES Moudle vs CommonJS

首先要知道 node.js 内部的模块引用方式，就是通过 CommonJS 来加载的。

ES Moudle 就是社区为了统一模块加载方案，用来取代 CommonJS 和 AMD 规范的新方案。

由于这个方案设计思想就是：尽量使得代码静态化，在编译时期就能确保各个模块间的依赖关系。这就是为何配合 webpack 等现代打包工具的 tree-shaking 特性能让代码体积更小的原因之一。

举个代码例子说明 CommonJS vs ESM

{% asset_img build-diff.png 左：ESM，右：CommonJS %}

## 运行时 + 编译器 vs. 只包含运行时

来看下含有编译器的完整版和运行版的区别：

首先我使用未压缩的完整版 js 大小为 852kb，运行版为 753kb （仅供参考）。

其次，代码实现区别：

```js
// 需要编译器
new Vue({
  template: "<div>{{ hi }}</div>"
});
// 不需要编译器
new Vue({
  render(h) {
    return h("div", this.hi);
  }
});
```

区别就是多了个 render 函数，如果你按“需要编译器”的写法，就会出现如下错误：

```js
vue.runtime.common.dev.js:621 [Vue warn]: You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.

(found in <Root>)
```

值得注意的是：使用 vue-loader 或 vueify 的时候，\*.vue 会由 webpack 交给他们做构建，实际上会在构建时预编译成 JavaScript（即不需要编译器的），如果非需要，在 webpack 配置 resolve 参数即可：

```js
resolve: {
    alias: {
      // vue$: 'vue/dist/vue.esm.js' // 完整版
      vue$: 'vue/dist/vue.runtime.common.js'
    },
    extensions: ['.js', '.vue', '.json'],
    modules: ['node_modules']
  }
```

# 总结

简单介绍 Vue，以及 Vue 安装时的一些细节。同时就 Vue 不同的版本文件做了说明举例。

---
title: vue 基础-起步&安装
tags: vue
categories:
    - 开发
    - 前端开发
thumb_img: vue.png
---

> 记录自己再次回炉 vue 的基础笔记，除了官网那部分知识点外，还会加入自己的一些理解。

# 安装

## 兼容性

在 vue 中使用了诸如 defineProperty 的对象方法，导致只有支持 ES5 的浏览器才运行正常。像 IE8 及以下版本就不支持。

## cli

官方提供了 [vue-cli](https://cli.vuejs.org/) 工具，可以方便快速的构建整个 vue 应用。

```js
npm install -g @vue/cli

vue create hello-world

npm run serve
```

如果不是特殊要求，还是不要用 script 方式，毕竟也能确保第三方 cdn 的服务不会出问题。

# 不同构建版本的解释

## 版本区别

| 版本              | UMD                | CommonJS              | ES Module (构建工具使用) | ES Module (用于浏览器) |
| ----------------- | ------------------ | --------------------- | ------------------------ | ---------------------- |
| 完整版            | vue.js             | vue.common.js         | vue.esm.js               | vue.esm.browser.js     |
| runtime           | vue.runtime.js     | vue.runtime.common.js | vue.runtime.esm.js       | -                      |
| 完整版 + product  | vue.min.js         | -                     | -                        | vue.esm.browser.min.js |
| runtime + product | vue.runtime.min.js | -                     | -                        | -                      |

完整版：同时包含编译器 + 运行时的版本。

编译器：用来将模板字符串编译成为 JavaScript **渲染函数**的代码。

运行时：用来创建 Vue 实例、渲染并处理虚拟 DOM 等的代码。基本上就是**除去编译器**的其它一切。

UMD：可以使用 script 在浏览器端使用的脚本
CommonJS：配合 Browserify 或 webpack 1 构建的脚本
ES Module 有两种：

-   配合 webpack 2 或 Rollup 现在主流构建工具使用的脚本，配合 tree-shaking 实现代码进一步的简化。
-   浏览器直接使，可设置 <script type="module"\> 直接导入。

## ES Moudle vs CommonJS

举个代码例子说明 CommonJS vs ESM

{% asset_img build-diff.png 左：ESM，右：CommonJS %}

## 运行时 + 编译器 vs. 只包含运行时

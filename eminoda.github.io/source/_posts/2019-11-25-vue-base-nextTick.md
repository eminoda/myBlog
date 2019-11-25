---
layout: new
title: vue 基础- $nextTick 使用的场景
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-25 13:29:16
---


# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

在开发时，是不是遇到过这样的场景，响应数据明明已经更新，但无法通过 dom 获取到。最后使用 nextTick 方法“包裹”后就能拿到。如果你不太清楚其中的原因，这篇或许能解开你的疑惑。

# 先来看个例子

这个例子很简单，主要来测试 nextTick 的作用。

定义了一个异步数据获取的方法 asyncDataFetch ，你可以把它当成一个接口请求，在执行 updateMsg 后，调用该方法，并最后通过 \$refs 的方式来获取页面上的文本。

{% asset_img demo-html.png  页面模板 %}
{% asset_img demo-methods.png  方法定义 %}

虽然我们已经把接口返回的数据赋值给 this.asyncData ,但实际却没有在 \$refs 中获取到 （html-2）。

从调试 console 中看到，其在 nextTick 方法中（html-3）被成功获取。

{% asset_img demo.png  浏览器输出 %}

# 异步更新队列

> 为什么例子中，明明把数据赋值给响应对象，但 html-2 中却没有更新呢？

这其实要回到 **vue 异步更新队列** 的解释中，查看原因。

虽然我们通过 this.someData = 'new value' 执行了赋值，但该响应数据并不是同步响应到页面模板中（即更新到页面 Dom 里）。

vue 更新 Dom 是一个异步过程，所以即使我们看到页面的渲染虽然被“刷新”了，但其实并不是数据一刷新，页面就被刷新，这尤其需要我们注意。

在这个异步队列中，vue 会根据不同的“异步” api 的支持情况来选择以最佳的方式执行 tick 。这些 api 包括：Promise、MutationObserver、setImmdiate、setTimeout。如果你了解浏览器的事件循环机制，将会对理解这个异步队列容易许多。

# nextTick

好，知道 vue 中数据的更新时异步这一个概念后，那么为什么在 nextTick 执行相关代码能达到预期效果就基本知道大概了。

如下是一段 nextTick 相关源码片段，你可以在 vue\src\core\util\next-tick.js 找到：

{% asset_img nextTick.png  源码 %}

它会有什么作用呢？

一旦调用了 nextTick ，就会把我们定义的 callback 函数方法推到 callbacks 这样一个全局变量中，这个 callbacks 就是 **异步更新队列**。

然后会执行 timerFunc 一个异步 tick 方式封装。

如果当前客户端不支持 Promise、MutationObserver 等 api 方法时，将采用 setTimeout 后备方式：

{% asset_img callbacks-execute.png  setTimeout 方式 %}

当 vue 开始执行更新相关操作时，通过 flushCallbacks 方法来“清空”这个队列，内部执行每个队列元素：

{% asset_img callbacks.png  源码 %}

由于操作 dom 的成本非常高， vue 在数据 watch 层做了很多优化处理来优化整个过程的计算操作。

# 总结

说了为何使用 nextTick 能解决开发中一些“奇怪”的问题，并抛出 vue 的异步事件队列这个概念来解释这个原因。

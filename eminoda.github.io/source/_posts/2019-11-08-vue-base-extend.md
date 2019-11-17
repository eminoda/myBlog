---
title: vue 基础- extends 实现代码复用
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-08 12:58:33
---

# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

**extends** 是 **选项/组合** 类别下的选项属性之一，而不是 **Vue.extend** 全局 API，这个事先说下，以免概念上有个混淆。

# 代码复用

目前的前端有个非常重要的思想，就是“组件化”，对于代码层面就是最终 html、css、js 这些元素都会被挪到一起来实现一个较为完整的功能。就比如 element-ui ，若你想实现一个分页栏，直接拿 <el-pagination\> 就可以搞定。

如果你要对数据进行过滤处理、通过标签有些特殊功能，对应可以自定义一些过滤器、指令。

这些举例都有个共同的特性就是 **代码复用** 。那些随处可见的好处就不说了。这里提个问题，怎么在 vue 里只针对 js 功能进行复用呢？（可能讲的有些局限）

答案就是 extends ，一个普普通通的属性，可我在掉了一撮头发后才用到。

# extends

类型可是：Object | Function

允许声明扩展另一个组件(可以是一个简单的选项对象或构造函数)，而无需使用 Vue.extend。这主要是为了便于扩展单文件组件。这和 mixins 类似。

# 场景

简单举几个例子

## 使用在 lifecycle 生命周期上

有一些需求（例如，控制 mint-ui loadmore 组件的高度），当元素挂载到 dom 节点后，需要控制页面某些区域的固定高度。

以前我们是这样做的，所有需要控制高度的页面都有这段类似的代码。

{% asset_img life-js.png %}

{% asset_img life-html.png %}

**那当使用了 extends 后，就可以简化成：**

使用 extends 调用封装方法 heightControl ，哪个 vue 模块要用就添加这行代码就行了 ：

{% asset_img life-extends-1.png %}

heightControl 就是原来的 mounted 中全部的定义：

{% asset_img life-extends-2.png %}

## 简化 methods 方法

再举一个例子，我们会有注册、忘记密码有获取短信的功能，他们在接口一样，参数类似。那么就会在两个页面上有相似度 99% 的模板化代码（boilerplate code）。

{% asset_img code-diff.png %}

**那当使用了 extends 后，就可以简化成：**

{% asset_img methods-extends-1.png %}

重写 methods 属性，将公用获取短信的方法列出，实现一个较为公用化的发送短信功能：

{% asset_img methods-extends-2.png %}

# 总结

通过这两个例子，说了下 extends 简单的场景运用，例子虽少，但的确是我平时优化后觉得很有用的实践。相信通过该属性能让代码的复用性更高，减轻以后的工作量。

如果你能 get 到其中的点，并觉得此文有帮助，就分享给其他同学吧。

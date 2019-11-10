---
title: vue 基础-生命周期 lifecycle
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-10 23:57:55
---


# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

平时开发中，我真的不太使用生命周期相关的方法。但必须明确的是，生命周期在整个 vue 具有非常重要的作用，如果你了解它将对理解整个 vue 会更容易；同时在遇到问题时也能有个导向性的判断。

此篇简单说下生命周期的过程，以及方法调用。

# 生命周期的整个过程

借用 vue 官网的图，仔细全览下基本就对生命周期的过程有个粗略的认识了。

{% asset_img lifecycle.png vue 官网的生命周期图 %}

我这里没必要重复细说了，按我自己理解讲这个过程：

1. new 一个 Vue 实例
2. 初始化 event（$on、$off 等） 和 lifecycle
3. **触发钩子** beforeCreate
4. 初始化 inject、data、computed、watch、provide
5. **触发钩子** created
6. 判断 el 属性（是否调用 $mount，你在源码能看到两个 $mount 的声明），判断 template 属性（决定渲染模板）
7. **触发钩子** beforeMount
8. 替换 el 标签内容，实现元素挂载
9. **触发钩子** mounted
10. definedReactive 响应式的定义在初始化的时候已经完毕了，当数据更新，**触发钩子** beforeUpdate 、 updated
11. 销毁时，触发钩子 beforeDestroy
12. 移除事件监听、绑定数据
13. 销毁完， **触发钩子** destroyd

# 钩子触发顺序

这个例子，调用了所有生命周期的钩子，用来说明他们的执行顺序（注意 activated 和 deactivated 是 keepalive 专用的）：

```html
<template>
  <div style="backgound:#fff;text-align:center;">
    <mt-header title="举例" :fixed="false"></mt-header>
    <mt-button type="default" @click="currentComponent = currentComponent == 'vv-button' ? 'vv-button2' : 'vv-button'">test keepalive</mt-button>
    <mt-button type="danger" @click="$destroy()">destroy</mt-button>
    <div style="margin-top:10px;">
      <keep-alive>
        <component v-bind:is="currentComponent"></component>
      </keep-alive>
    </div>
  </div>
</template>
```

直接看下图，当 created 时，开启一个 timer 定时器用来确认组件的销毁情况。

```js
created() {
  console.log('component [Test] ', 'created');
  this.timer = setInterval(() => {
    console.log('component [Test] working ...');
  }, 1000)
}
```

{% asset_img lifecycle-hook.gif lifecycle hook 顺序 %}

{% asset_img lifecycle-hook.png lifecycle hook 顺序 %}

# 有什么细节问题

## beforeCreate 和数据响应式

因为 beforeCreate 是最开始初始化的，数据响应和相关事件和监听在其后，所以有类似功能处理需要避免。

## created 获取不到 dom 元素

它是指完成了数据观察、相关属性方法的计算，并没有把我们的模板替换到 html 上，不要试图在这个钩子里调用 dom 相关的 api。

如果你想获取整个客户端的高度的话，建议放在 mounted 中。

## 不要忘记移除掉定时器等

beforeDestroy 不是没有用，在这环节中，vue 的实例仍然有效，你可以移除定义的 timer ，以免引起不必要的错误。

# 总结

生命周期贯穿整个 vue 的设计思想，理解好它能写出让别人能更容易“看得懂的”代码，千万不能张冠李戴的乱用。

另外上面那张 **vue 整个生命周期的图** ，正如官网所说，随着我们使用的深入，它的意义会越来越大。

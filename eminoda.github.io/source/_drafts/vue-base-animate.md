---
title: vue 基础-动画效果
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

此系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 单元素/组件的过渡

先来看段代码：

```html
<div id="demo">
  <button v-on:click="show = !show">
    Toggle
  </button>
  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</div>
```

```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
```

当点击 button 后，会控制 show 的值来切换 v-if 所要渲染的模板。

vue 提供了 transition 属性，来对如下特殊的指令或者标签做“出入场”的动效：

- v-if
- v-show
- 动态组件
- 组件 root 节点

那动效怎么产生的呢？

1. 自动嗅探目标元素是否应用了 CSS 过渡或动画，如果是，在恰当的时机添加/删除 CSS 类名。

   - 当显示时：添加样式 xx-enter-active xx-enter-to
   - 当离开时：添加样式 xx-leave-active xx-leave-to

   {% asset_img enter.png %}

2. 如果过渡组件提供了 JavaScript 钩子函数，这些钩子函数将在恰当的时机被调用。
3. 如果没有找到 JavaScript 钩子并且也没有检测到 CSS 过渡/动画，DOM 操作 (插入/删除) 在下一帧中立即执行。(注意：此指浏览器逐帧动画机制，和 Vue 的 nextTick 概念不同)

## 过渡的类名

在进入/离开的过渡中，会有 6 个 class 切换：

v-enter --> v-enter-active --> v-enter-to --> v-leave --> v-leave-active --> v-leave-to

{% asset_img transition.png %}

## 自定义过渡的类名

用于配合第三方 animate 类库时使用。

```html
<link href="https://cdn.jsdelivr.net/npm/animate.css@3.5.1" rel="stylesheet" type="text/css" />

<div id="example-3">
  <button @click="show = !show">
    Toggle render
  </button>
  <transition name="custom-classes-transition" enter-active-class="animated tada" leave-active-class="animated bounceOutRight">
    <p v-if="show">hello</p>
  </transition>
</div>
```

{% asset_img custom-enter.png %}

## JavaScript 钩子

```html
<transition v-on:before-enter="beforeEnter" v-on:enter="enter" v-on:after-enter="afterEnter" v-on:enter-cancelled="enterCancelled" v-on:before-leave="beforeLeave" v-on:leave="leave" v-on:after-leave="afterLeave" v-on:leave-cancelled="leaveCancelled">
  <!-- ... -->
</transition>
```

```js
methods: {
  // --------
  // 进入中
  // --------

  beforeEnter: function (el) {
    // ...
  },
  // 当与 CSS 结合使用时
  // 回调函数 done 是可选的
  enter: function (el, done) {
    // ...
    done()
  },
  afterEnter: function (el) {
    // ...
  },
  enterCancelled: function (el) {
    // ...
  },

  // --------
  // 离开时
  // --------

  beforeLeave: function (el) {
    // ...
  },
  // 当与 CSS 结合使用时
  // 回调函数 done 是可选的
  leave: function (el, done) {
    // ...
    done()
  },
  afterLeave: function (el) {
    // ...
  },
  // leaveCancelled 只用于 v-show 中
  leaveCancelled: function (el) {
    // ...
  }
}

```

注意：当只用 JavaScript 过渡的时候，在 enter 和 leave 中必须使用 done 进行回调。否则，它们将被同步调用，过渡会立即完成。
```html

```

```html

```

```html

```

```html

```

```html

```

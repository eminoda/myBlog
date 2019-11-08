---
title: vue 基础-动画效果
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-06 14:17:38
---


# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 单元素/组件的过渡

## 示例

vue 提供了 transition 组件标签，来对如下特殊的指令或者标签做 **“进入/离开”过渡** 效果：

- v-if
- v-show
- 动态组件
- 组件 root 节点

先来看段代码，当点击 button 后，会控制 show 的值来切换 v-if 所要渲染的模板：

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

实际效果：

{% asset_img toggle.gif v-if transition 效果 %}

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

## css 过渡 & css 动画

### 过渡

我们可以根据出入场过渡效果，在 css 这样定义：

```css
/* 元素 enter 过渡整个过程 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
/* 元素 leave 过渡整个过程 */
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
/* 元素 enter 过渡开始、 leave 过渡结束 */
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
```

以上这些都属于 css 过渡的效果。

### 动画

除了过渡效果，我们还能设置 **animation** 标签指定 css 动画效果。

```css
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
```

### 同时使用过渡和动画

当然这两者都是 css 范畴的特效知识，根据实际需要使用。

不过可能出现 animation 完成，但 transition 还在继续的情况，对于这种情况需要设置 type=animation|transition 来区分 vue 所要监听的类型。

我们先来看下两种动效单独的使用情况（动画稍显夸张，只为说明现象）：

**animation**

```css
.bounce-enter-active {
  animation: bounce-in 1s;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
    background: pink;
  }
  50% {
    transform: scale(1);
    background: pink;
  }
  100% {
    transform: scale(2);
    background: pink;
  }
}
```

{% asset_img animation.gif animation %}

粉色方框按照 animation 设置的进度，逐步放大，直至结束，用时 1s。
**transition**

```css
.bounce-enter {
  width: 300px;
}
.bounce-enter-active {
  background: red;
  transition: width 3s;
}
.bounce-enter-to {
  width: 100px;
  height: 100px;
}
```

{% asset_img transition.gif transition %}

红框从 300px 缩小至 100px，用时 3s。

**一起使用**

{% asset_img together.gif 一起使用 %}

因为动效在时间 duration 中存在重叠交叉，所以会出现上面这样变扭的效果，可以动过 type animation|transition 来指定 vue 监听动效的类型加以控制。

比如，我们设置了 animation 就 **屏蔽了 transition 的效果**，就会和单使用 animation 一样了。

```html
<transition name="bounce" type="animation">
  <p v-if="show" class="item">hello</p>
</transition>
```

## 自定义过渡的类名

用于配合第三方 animate 类库时使用。可以根据我们的需要细化效果的展示。

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

可以在标签上绑定过渡各个时期的钩子，通过 js 来调用触发相关事件的事件。

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

# 多个元素的过渡

举个多元素过渡的例子：

```html
<transition>
  <table v-if="items.length > 0">
    <!-- ... -->
  </table>
  <p v-else>Sorry, no items found.</p>
</transition>
```

## key

如果存在数据就显示 table 内容，不存在就显示一个无数据的文案，然后通过 transition 动效切换不同效果。

但是如果当相同标签元素切换时，就需要通过 key 来区分他们的不同。

```html
<transition>
  <button v-if="isEditing" key="save">
    Save
  </button>
  <!-- <button v-else key="save"> -->
  <button v-else key="edit">
    Edit
  </button>
</transition>
```

如果相同元素模板的 key 一致，效果如下：

{% asset_img key.gif 相同 key %}

注意，这不是期望的效果。可能你会感觉到生硬，因为相同 key 的元素切换时没有过渡效果。

设置不同 key 后，动效得以生效：

{% asset_img key2.gif 不同 key %}

## 过渡模式

在两个元素切换的时候，可能我们需要更细致的过渡模式，比如上例中：第一个 button 离开，第二个 button 进来之间的过程中，都被重新绘制了，间隙虽然很短，但能明显看到产生了类似滑动的效果（不符合原始意图）。

vue 提供了 mode 过渡模式：

- in-out：新元素先进行过渡，完成之后当前元素过渡离开。
- out-in：当前元素先进行过渡，完成之后新元素过渡进入。

{% asset_img key3.gif out-in mode %}

当使用 out-in mode 时，第二个元素等待第一个元素消失后才入场，使得原始意图符合预期。

# 多个组件的过渡

同时 transition 也可以作用于“动态组件”的过渡效果。

```html
<transition name="component-fade" mode="out-in">
  <component v-bind:is="view"></component>
</transition>
```

# 列表过渡

与 transition 不同的是，列表过渡需要使用 <transition-group\> 标签。

```html
<button @click="check">add</button>
<transition-group name="fade" tag="div">
  <span v-for="(item,index) in items" :key="index">
    <span>{{item}}</span>
  </span>
</transition-group>
```

{% asset_img group.gif 随机添加数字 %}

能注意到这里设置了 tag='div' ，可以让最后的列表内容包裹在一个 div 标签内。

## 列表排序过渡

<transition-group\> 另一个不同是，可以设置 v-move 属性，类似 v-enter、v-leave。

```html
.fade-move { transition: transform 1s; }
```

## 其他

vue 内置还使用了 FLIP 动画队列，基于数据驱动的方式，能做更多的动画效果展示。这里不再做展开。[有兴趣请查看官网示例](https://cn.vuejs.org/v2/guide/transitioning-state.html)

# 总结

简单说了 transation 和 transation-group 单元素和多元素的过渡用法，初步对 vue 在动效上的实现有了一点了解。

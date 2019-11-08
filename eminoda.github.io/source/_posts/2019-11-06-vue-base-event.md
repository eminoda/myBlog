---
title: vue 基础-事件处理
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-06 14:17:26
---


# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 事件处理

## 监听事件

利用 v-on 指令，绑定 dom 原生的一些事件。

```html
<button v-on:click="counter += 1">Add 1</button>
<p>The button above has been clicked {{ counter }} times.</p>
```

绑定一个 method 方法：

```html
<button v-on:click="say">say</button>
```

可以对 say 方法设置具体参数：

```html
<button v-on:click="say('hello')">say</button>
```

注意如果，如果没有指定参数，对应的 method 中定义的方法会接受到 event 事件参数：

```js
methods: {
    say: function (event) {
      alert(event.target.tagName);//BUTTON
    }
  }
```

可以向方法中，传入原始的 DOM 事件，\$event

```html
<button v-on:click="say($event)">say</button>
```

## 事件修饰符

最常用的莫过于 event.preventDefault() 或 event.stopPropagation()

举个例子，vue 事件处理，我们代码可能这样处理：

```html
<a href="http://www.baidu.com" @click="stopJump">链接跳转</a>
```

```js
stopJump: function(event) {
    event.preventDefault();
    console.log('haha, just here');
}
```

但有了事件修饰符，可以简化成这样：

```html
<a href="http://www.baidu.com" @click.prevent="stopJump">链接跳转</a>
```

有如下修饰符：

-   .stop
-   .prevent
-   .capture
-   .self
-   .once
-   .passive [说明参考](https://www.cnblogs.com/ziyunfei/p/5545439.html) [说明参考 2](http://ju.outofmemory.cn/entry/302263)
-   .once

## 按键修饰符

```html
<input v-on:keyup.enter="submit" />
```

```html
<input v-on:keyup.13="submit" />
```

Vue 提供了绝大多数常用的按键码的别名：

-   .enter
-   .tab
-   .delete (捕获“删除”和“退格”键)
-   .esc
-   .space
-   .up
-   .down
-   .left
-   .right

还可以通过全局 config.keyCodes

```js
Vue.config.keyCodes.f1 = 112;
```

## 系统修饰符

-   .ctrl
-   .alt
-   .shift
-   .meta (在 Mac 系统键盘上，meta 对应 command 键 (⌘)。在 Windows 系统键盘 meta 对应 Windows 徽标键 (⊞)。)

一些快捷键的定义：

```html
<!-- Alt + C -->
<input @keyup.alt.67="clear" />

<!-- Ctrl + Click -->
<div @click.ctrl="doSomething">Do something</div>
```

-   exact 有些特殊，用于精确控制按键

```html
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button @click.ctrl.exact="onCtrlClick">A</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button @click.exact="onClick">A</button>
```

还有最后一部分，鼠标按钮修饰符

-   .left
-   .right
-   .middle

## 为什么在 HTML 中监听事件?

你可能注意到这种事件监听的方式违背了关注点分离 (separation of concern) 这个长期以来的优良传统。但不必担心，因为所有的 Vue.js 事件处理方法和表达式都严格绑定在当前视图的 ViewModel 上，它不会导致任何维护上的困难。实际上，使用 v-on 有几个好处：

-   扫一眼 HTML 模板便能轻松定位在 JavaScript 代码里对应的方法。

-   因为你无须在 JavaScript 里手动绑定事件，你的 ViewModel 代码可以是非常纯粹的逻辑，和 DOM 完全解耦，更易于测试。

-   当一个 ViewModel 被销毁时，所有的事件处理器都会自动被删除。你无须担心如何清理它们。

# 总结

举例说明事件处理的几种实现方式；罗列了事件修饰符的多种分类。最后说了 HTML 模板中直接使用 v-on 事件的好处。

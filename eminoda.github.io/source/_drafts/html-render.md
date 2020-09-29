---
title: 浏览器的渲染
tags:
---

# 渲染

## 渲染树（Render Tree）

浏览器通过解析 HTML 和 CSS 后，形成对应的 DOM 树和 CSSOM 树。

从根节点开始解析 DOM 树节点并匹配对应的 CSSOM 样式规则，选择**可见的**的节点，最终结合成一颗**渲染树**。

{% asset_img render-tree-construction.png %}

从上图能看到渲染树的特点：

- 渲染树中不包含 head、script、link、meta 之类不可见的节点
- CSS 定义的样式规则将和实际的 DOM 匹配，并且被 **display:none** 修饰的节点最终不会出现在渲染树中

## 渲染阶段

{% asset_img render-order.png %}

根据上图，整个渲染阶段分为三部分：

- 渲染树的形成：通过 DOM 和 CSSOM 形成渲染树
- 布局 Layout（自动重排 Reflow）：基于页面的流式布局，遍历渲染树节点，不断计算节点最终的位置，几何信息，样式等属性后，输出一个“盒模型”
- 绘制 Paint（栅格化）：将节点位置，大小根据屏幕的窗口大小换算成真实的像素，同颜色等属性一同“画到”页面上

## 回流和重绘

### 基本概念

- 回流 Reflow：某些元素位置、几何形状的更改需要浏览器重新计算相关元素。
- 重绘 Repaint：将回流重排好的元素绘制到页面上，但也因某些 js、css 的修改导致渲染树发生变化，浏览器需要再次绘制页面。

两者的关系：**触发回流一定会触发重绘, 而触发重绘却不一定会触发回流**

在各种文章中看到回流和重绘的概念描述，但一直不了解其真正含义。此图很形象的展示了 Mozilla 页面的渲染过程。

{% asset_img Mozilla.gif %}

### 触发回流条件

- 首次布局渲染页面
- 改变浏览器窗口大小
- 改变字体
- 网页内容变化
- 触发 CSS 伪类
- 操作 DOM
- style 样式表发生变化
- 调用 DOM 元素的 offsetXX, clientXX，scrollXX，getClientRects 等属性方法，获取元素当前的位置度量信息（[参见](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)）

### 如何测试网页性能

都知道频繁的渲染过程会影响网页性能，但怎么知道网页渲染内容了呢？我们可以通过 Chrome 的 F12，选择 Rendering 来查看网页的性能。

{% asset_img performance1.png %}

{% asset_img performance2.png %}

- Paint flashing: 以绿色高亮重绘区域
- Layout Shift Regions: 以蓝色高亮布局发生变化的区域

**一个简单的 Demo：**

{% asset_img performance.gif %}

能从图中看到，这些操作触发了浏览器的重绘：

- 鼠标移至按钮上，触发了默认的 hover 效果（出现绿框）
- 改变元素 color 属性（出现绿框）
- 修改元素 top 属性，不断改变元素位置影响布局（出现绿框，篮框）

### 提升渲染性能

**布局/回流** 和 **绘制/重绘** 是页面渲染必须会经过的两个过程，不断触发它们肯定会增加性能的消耗。

浏览器会对这些操作做优化（把它们放到一个队列，批量进行操作），但如果我们调用上面提到的 offsetXX, clientXX，scrollXX，getClientRects 等属性方法就会强制刷新这个队列。

下面列举一些简单优化方式：

- 不要使用 table 布局
  table 布局会加重 HTML 流式解析过程，同时内部元素改动会触发整个 table 重绘

- 将需更改的 class 放到最里层
  明确元素位置，减少父类元素不必要渲染判断

- 使用 fixed、absolute 属性修饰复杂多变的处理（动画）
  将改变范围降到最低程度，避免影响到父级元素

- 合并，减少 DOM 操作；通过虚拟 DOM 来代替

# 多线程

# 脚本的加载

## link 和 script

**注：均放在 head 标签内。**

**考个问题：css 定义在 head 中，需加载 5 秒，请问页面的内容会先进行展示吗？**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- 延迟5秒 -->
    <link rel="stylesheet" href="/css/demo.css?t=5000" />
  </head>
  <body>
    <div class="layout">我被渲染出来了</div>
  </body>
</html>
```

我原先以为页面内容会优先渲染，css 加载完成后才改变内容样式。其实这是错的。

{% asset_img link.gif %}

从上图看到，页面加载后，body 内元素就已经解析好了，只是没有渲染到页面上。随后 CSS 文件加载后，带有样色的内容才被渲染到页面上。

**延迟的 link 的加载阻断了页面渲染，但并没有影响 HTML 的解析**，当 CSS 加载后，DOM 完成解析，CSSOM 和 DOM 形成渲染树，最后将内容渲染到页面上。

**反问，将 link 替换成 script 效果也一样吗？**

{% asset_img script.gif %}

与 link 不同，**script 的加载会阻断页面 HTML 的解析**，script 中的 js 文件加载完后，页面才开始后续的解析，body 内容才出现。

## head 和 body

相比学前端时都听过这样的话：

> css 写在 head 里，js 写在 body 结束标签前

知道了上面 **link 和 script** 的区别后，对于前半句应该明白其中的含义，下面来看下后半句的原因：

## 动态脚本

### head 和 body 中的脚本

我一直错误的以为 head 中的

一般的，脚本将按照他们在 HTML 的定义顺序进行加载和执行（head 中的脚本先于 body）。

虽然我们知道资源是异步加载的，但实际上 head 中需等待的脚本将阻断 \<body> 中内容的渲染显示；

同样，在 \<body> 中的脚本如果不合时宜的放在主内容之前，也将影响渲染显示。

所以《高性能 Javascript》提到通过改变 script 引入顺序，来优化网页性能：

> 在 \</body> 闭合标签之前，将所有的 \<script> 标签放在页面底部。这样能确保 **在脚本执行前页面已经渲染完成。**

我们可以在 script 定义 defer、async，使整个脚本加载方式更加友好，变成真正的异步脚本。比如：被修饰的脚本在 head 中，将不会阻断 body 内容的展示。

注意：defer 修饰的脚本将延迟到 body 中所有定义的脚本之后，**DOM（页面内容）加载完之前触发**；async 不会像 defer 一样等待 body 中的脚本，而是当前脚本一加载完毕就触发。

```html
<head>
  <link rel="stylesheet" href="/css/fast.css" />
  <!-- 如果上面没有其他响应慢的脚本，解析到此处加载完后将立马执行 -->
  <script async src="/js/scriptAsync.js"></script>
  <!-- 1 秒，延迟到 DOM 加载完毕 -->
  <script defer src="/js/scriptDefer.js"></script>
  <!-- 1 秒 -->
  <script src="/js/scriptCommon.js"></script>
</head>
<body>
  <script>
    // 等待 head 中脚本执行完后，才会到 body
    console.log('js run in <body>');
  </script>
  <script>
    window.onload = function () {
      console.log('[ready] window');
      clearInterval(timer);
    };
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[ready] document');
    });
  </script>
  <!-- 8 秒，即使再慢也会等待 -->
  <script src="/js/bodyEndScriptSlow.js"></script>
  <script>
    // 这之后将执行 defer
    console.log('js run in </body>');
  </script>
</body>
```

加载顺序：

```
fast.css
scriptAsync.js
scriptCommon.js

js run in <body>
bodyEndScriptSlow.js
js run in </body>

scriptDefer.js
[ready] document
[ready] window
```

## 内联脚本

对于直接定义在 script 内部的代码将直接运行。不过，如果这些代码定义在某些异步脚本之后，**还是会等他们加载完毕后再执行**。

```html
<head>
  <script>
    console.log('js run in <head>');
  </script>
  <script src="/js/scriptCommon.js"></script>
  <script>
    // 等待上面脚本加载
    console.log('js run in </head>');
  </script>
</head>
<body>
  <script>
    console.log('js run in <body>');
  </script>
  <script src="/js/bodyEndScriptSlow.js"></script>
  <script>
    // 等待上面脚本加载
    console.log('js run in </body>');
  </script>
</body>
```

最终顺序为：

```
js run in <head>
scriptCommon.js
js run in </head>

js run in <body>
bodyEndScriptSlow.js
js run in </body>
```

## 动态脚本

上面的 **内联脚本**

```html
<head></head>
<body></body>
```

# 感谢&参考

- [渲染树构建、布局及绘制](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn)
- [性能优化 - 回流与重绘的调试与优化](https://anran758.github.io/blog/2018/01/15/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96-%E5%9B%9E%E6%B5%81%E4%B8%8E%E9%87%8D%E6%B1%87/)
- [浏览器的工作原理：新式网络浏览器幕后揭秘](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/#Layout)
- [](https://juejin.im/post/6844903569087266823)

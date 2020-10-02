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

下图很形象的展示了 Mozilla 页面的渲染过程。

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

都知道频繁的渲染过程会影响网页性能，但怎么知道网页开始渲染内容了呢？

我们可以通过 Chrome 的 F12，选择 Rendering 来查看网页的性能。

{% asset_img performance1.png %}

{% asset_img performance2.png %}

- Paint flashing: 以绿色高亮重绘区域
- Layout Shift Regions: 以蓝色高亮布局发生变化的区域

结合上面的方法，用 **一个简单的 Demo** 来示意：

{% asset_img performance.gif %}

能从图中看到，这些操作 **触发了浏览器的重绘**：

- 鼠标移至按钮上，触发了默认的 hover 效果（出现绿框）
- 改变元素 color 属性（出现绿框）
- 修改元素 top 属性，不断改变元素位置影响布局（出现绿框，篮框）

### 提升渲染性能

**布局/回流** 和 **绘制/重绘** 是页面渲染必须会经过的两个过程，不断触发它们肯定会增加性能的消耗。

浏览器会对这些操作做优化（把它们放到一个队列，批量进行操作），但如果我们调用上面提到的 offsetXX, clientXX，scrollXX，getClientRects 等属性方法就会强制刷新这个队列，导致这些队列批量优化无效。

下面列举一些简单优化方式：

- 不要使用 table 布局
  table 布局会破坏 HTML 流式解析过程，甚至内部元素改动会触发整个 table 重绘

- 将需更改的 class 放到最里层
  明确元素位置，减少父类元素不必要渲染判断

- 使用 fixed、absolute 属性修饰复杂多变的处理（动画）
  将改变范围降到最低程度，避免影响到父级元素

- 合并，减少 DOM 操作；通过虚拟 DOM 来代替

# 浏览器的多线程

# 脚本的加载

## link 和 script 加载文件的差异

**注：均放在 head 标签内。**

> 考个问题：CSS 定义在 head 中，其需加载 5 秒，请问页面加载后内容会先优先展示吗？

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

我原先以为页面内容会优先渲染，CSS 加载完成后才改变内容样式。其实这是错的。

{% asset_img link.gif %}

从上图看到，页面加载后，body 内元素就已经解析好了，只是没有渲染到页面上。随后 CSS 文件加载后，带有样色的内容才被渲染到页面上。

**延迟的 link 的加载阻断了页面渲染，但并没有影响 HTML 的解析**，当 CSS 加载后，DOM 完成解析，CSSOM 和 DOM 形成渲染树，最后将内容渲染到页面上。

> 反问，将 link 替换成 script 效果也一样吗？

{% asset_img script.gif %}

与 link 不同，**script 的加载会阻断页面 HTML 的解析**，浏览器解析完 script 后，会等待 js 文件加载完后，页面才开始后续的解析，body 内容才出现。

## head 和 body

学前端时相信都听过这样的名言：

> CSS 写在 head 里，js 写在 body 结束标签前

知道了上面 **link 和 script** 的区别后，应该明白前半句的含义，下面来解释下后半句。

**下面 script 均在 body 中**。

### 页面渲染 和 script 加载

先看下脚本在 body 中的一般情况：

在 body 内部的首位分别加载两个 js 文件，前者延迟 3 秒，后者延迟 5 秒，为了清楚他们的“工作”情况，在 head 中添加了定时器示意。

```html
<html lang="en">
  <head>
    <script>
      var t = 0;
      var timer = setInterval(function () {
        t++;
        console.log('已加载 ', t, ' 秒');
        if (t == 10) {
          clearInterval(timer);
        }
      }, 1 * 1000);
    </script>
  </head>
  <body>
    <script>
      var foo = 0;
      console.log('init foo', foo);
    </script>
    <script src="/js/addTen.js?t=3000"></script>
    <div>我被渲染了</div>
    <script src="/js/addOne.js?t=5000"></script>
  </body>
</html>
```

{% asset_img script-load1.gif %}

能看到 body 中定义的内联脚本首先工作，初始化 foo 变量。

随后加载 addTen.js，并阻断页面渲染。3 秒后，输出 js 内容（foo 赋值为 10），页面并重新开始解析，展示 div 内容。

最后加载 addOne.js ，继续等待 2 秒后，输出 js 内容（foo 赋值为 11）。

{% asset_img script-load2.png %}

### 多个 script 文件的加载

> 如果前一个 js 文件加载慢于后一个，会有怎么个效果？

```html
<script src="/js/addTen.js?t=5000"></script>
<div>我被渲染了</div>
<script src="/js/addOne.js?t=1000"></script>
```

两个 script 标签并线加载，1 秒后 addOne.js 首先加载完毕，等待 4s 秒后，addTen.js 加载完后，页面直接渲染（因为 script 已经全部完成）。

{% asset_img script-load3.png %}

### 简单总结下

1. 无论在 head 还是 body 中，浏览器会等待 script 文件的加载（阻断页面解析渲染）
2. 多个 script 的文件加载是异步的，不存在互相影响（后一个文件不需要等待前一个加载完后才下载），**执行顺序同定义顺序**

所以建议 script 放在 body 结束标签之前，确保页面内容全部解析完成并开始渲染。

## DOM 的 DOMContentLoaded 事件

**DOMContentLoaded** 事件可以来确定整个 DOM 是否全部加载完成，下面我们简单测试下：

```html
<script>
  document.addEventListener('DOMContentLoaded', function () {
    console.log('[ready] document');
  });
</script>
<!-- ... -->
<script src="/js/addTen.js?t=5000"></script>
<div>我被渲染了</div>
<script src="/js/addOne.js?t=1000"></script>
```

最终输出：

```
addTen.js
addTen.js?t=5000:3 foo 10
addOne.js?t=1000:1 addOne.js
addOne.js?t=1000:3 foo 11
[ready] document
```

**DOMContentLoaded** 事件的定义是异步回调方式，当 DOM 加载完成后触发，即使写在最前面，也会等待后面的 script 加载完成后才触发。

## 动态脚本

能看到无论 script 放在那个位置，浏览器都会等待他们直至 body 内的文件全部加载完。

那有什么 **真正的异步** 脚本加载吗？（不会阻断页面解析）

> 那就是 **动态脚本**。

如果你接触过第三方网页统计脚本，那将比较了解，下面给段示例代码：

```html
<script>
  document.addEventListener('DOMContentLoaded', function () {
    console.log('[ready] document');
  });
</script>
<script>
  var newScript = document.createElement('script');
  newScript.type = 'text/javascript';
  newScript.src = '/js/dynamicScript.js?t=8000';
  document.getElementsByTagName('head')[0].appendChild(newScript);
  // 脚本加载完毕
  if (newScript.readyState) {
    newScript.onreadystatechange = function () {
      if (newScript.readyState == 'loaded' || newScript.readyState == 'complete') {
        console.log('dynamicScript.js loaded');
      }
    };
  } else {
    newScript.onload = function () {
      console.log('dynamicScript.js loaded');
    };
  }
</script>
<script src="/js/addTen.js?t=5000"></script>
<div>我被渲染了</div>
<script src="/js/addOne.js?t=1000"></script>
```

最终输出：

```
addTen.js
addTen.js?t=5000:3 foo 10
addOne.js?t=1000:1 addOne.js
addOne.js?t=1000:3 foo 11
[ready] document
已加载  5  秒
已加载  6  秒
已加载  7  秒
已加载  8  秒
dynamicScript.js?t=8000:1 dynamicScript.js is running
dynamicScript.js loaded
已加载  9  秒
已加载  10  秒
```

{% asset_img script-load4.png %}

定义了需要加载 8 秒的 dynamicScript.js 文件，所有的 script 加载方式依旧异步，但 dynamicScript.js 在 **DOMContentLoaded** 触发后，最后才执行，浏览器并没有等待它的加载完成。

我们也可以将它放在 head 中。这种通过脚本来动态修改 DOM 结构的加载方式是 **无阻塞式** 的，不受其他脚本加载的影响。

## defer 和 async

我们可以在 script 定义 **defer** 、 **async** ，使整个脚本加载方式更加友好。比如：**被修饰的脚本在 head 中，将不会阻断 body 内容的展示**。

注意： **defer** 修饰的脚本将延迟到 body 中所有定义的脚本之后，**DOM（页面内容）加载完之前触发**； **async** 不会像 **defer** 一样等待 body 中的脚本，而是当前脚本一加载完毕就触发。

```html
<head>
  <!-- 如果上面没有其他响应慢的脚本，解析到此处加载完后将立马执行 -->
  <script async src="/js/scriptAsync.js?t=3000"></script>
  <!-- 1 秒，延迟到 DOM 加载完毕 -->
  <script defer src="/js/scriptDefer.js?t=1000"></script>
</head>
<body>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[ready] document');
    });
  </script>
  <script>
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = '/js/dynamicScript.js?t=8000';
    document.getElementsByTagName('head')[0].appendChild(newScript);
    // 脚本加载完毕
    if (newScript.readyState) {
      newScript.onreadystatechange = function () {
        if (newScript.readyState == 'loaded' || newScript.readyState == 'complete') {
          console.log('dynamicScript.js loaded');
        }
      };
    } else {
      newScript.onload = function () {
        console.log('dynamicScript.js loaded');
      };
    }
  </script>
  <script>
    console.log('init foo', 0);
    var foo = 0;
  </script>
  <script src="/js/addTen.js?t=5000"></script>
  <div>我被渲染了</div>
  <script src="/js/addOne.js?t=1000"></script>
</body>
```

加载顺序：

```
已加载  1  秒
已加载  2  秒
scriptAsync.js?t=3000:1 scriptAsync.js
已加载  3  秒
已加载  4  秒
addTen.js?t=5000:1 addTen.js
addTen.js?t=5000:3 foo 10
addOne.js?t=1000:1 addOne.js
addOne.js?t=1000:3 foo 11
scriptDefer.js?t=1000:1 scriptDefer.js
[ready] document
已加载  5  秒
已加载  6  秒
已加载  7  秒
已加载  8  秒
dynamicScript.js?t=8000:1 dynamicScript.js is running
dynamicScript.js loaded
已加载  9  秒
已加载  10  秒
```

# 感谢&参考

- [渲染树构建、布局及绘制](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn)
- [性能优化 - 回流与重绘的调试与优化](https://anran758.github.io/blog/2018/01/15/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96-%E5%9B%9E%E6%B5%81%E4%B8%8E%E9%87%8D%E6%B1%87/)
- [浏览器的工作原理：新式网络浏览器幕后揭秘](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/#Layout)
- [](https://juejin.im/post/6844903569087266823)

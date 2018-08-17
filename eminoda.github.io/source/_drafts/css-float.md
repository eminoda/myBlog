---
title: css 浮动[译]
tags: css
categories:
  - 前端
  - css
no_sketch: true
---

> [原文链接](https://css-tricks.com/all-about-floats/)

## 什么是Float
Float是CSS用于定位的属性。为了彻底明白它意图和来源，可以参考印刷设计。在印刷布局中，通常图片会有被包裹在文本里的需求。这通常称之为“图文混排（字体环绕）”，如下图：
{% asset_img print-layout.png %}

在页面布局程序设计中，可以告知保存文本的框以遵循文本换行，或忽略它。忽略文本换行将允许单词在图像上方流动，就像它甚至不存在一样。这是该图像是页面流的一部分（或不是）的区别。网页设计非常相似。

{% asset_img web-text-wrap.png %}

在网页设计中，页面元素依托css的float属性，使得图片被排版在文字里。浮动的元素依旧是网页流式的一部分。和绝对定位是有区别的。
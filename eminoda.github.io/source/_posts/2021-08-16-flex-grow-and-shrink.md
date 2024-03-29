---
title: 浅谈 flex-grow 和 flex-shrink 是这么回事
date: 2021-08-16 23:50:06
tags:
---

# 前言

之前面试被问到如下问题：

> flex: 1 0 auto;

你知道它是什么意思么？虽然知道是有关伸缩的几个属性占位，但因为平时只写 **flex: 1**，一直没关注过这个语法糖其他表达式有什么规则，只要无奈回答：不知道。

可能这是个八股文，网上查查便知道，但写完这篇后，我觉得不应该发生在一个 web 开发的“老人”身上。

**先了解下 flex 有哪几种写法：**

```css
flex: none /* value 'none' case */
flex: <'flex-grow'> /* One value syntax, variation 1 */
flex: <'flex-basis'> /* One value syntax, variation 2 */
flex: <'flex-grow'> <'flex-basis'> /* Two values syntax, variation 1 */
flex: <'flex-grow'> <'flex-shrink'> /* Two values syntax, variation 2 */
flex: <'flex-grow'> <'flex-shrink'> <'flex-basis'> /* Three values syntax */
flex: inherit
```

**flex** 语法糖中出现了 **flex-grow**，**flex-shrink**，**flex-basis** 三个属性，如果你也不太了解的话，就随着下面的代码示例牢记在脑子里吧。

# flex-grow

> 它指定了 **flex** 容器中剩余空间的多少应该分配给项目（flex 增长系数），默认为 0（无效）

先来看张动图：

{% asset_image flex-grow.gif 增长示例 %}

代码如下（下面所有示例将基于此做略微改动）：

```html
<!-- html -->
<div class="flex-content">
  <div class="flex-item">1</div>
  <div class="flex-item" num="2">2</div>
  <div class="flex-item">1</div>
</div>
```

```css
/* 父级容器 */
.flex-content {
  display: flex;
  justify-content: space-around;
  width: 800px;
}
```

```css
/* 子元素 */
.flex-content .flex-item {
  width: 200px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  background-color: #ffa940;
  border: 1px solid #000;
  border-radius: 10px;
  color: #fff;
  box-sizing: border-box;
}
.flex-content .flex-item {
}
/* 特别样式 */
.flex-content .flex-item[num="2"] {
  flex-grow: 1;
}
```

能看到随着 **flex-grow** 改变，中间元素从 200px 到填充整个区域做着切换。

**TLDR**：弹性盒子内（display: flex），所有子元素（项目 item）的宽度总和不超过父级宽度的话，剩下的空间将被 **flex-grow** 修饰的元素按照一个规则进行增长。

这个就当热身，下面正式开始了。

## 不同 width 下的变化

**父级宽度（600px）= 子元素宽度之和：**

```css
.flex-content {
  width: 600px;
}
.flex-content .flex-item {
  flex-grow: 1;
}
```

每个子元素将保持不变，因为没有多余空间供元素增长，所以即使设置了 **flex-grow** 也没效果。

{% asset_image flex-grow-width-1.png %}

**父级宽度（800px）> 子元素宽度之和：**

每个元素的增长率为 1/(1+1+1)，多余空间为：800-200\*3=200。

所以每个元素最终宽度为：200+200\*1/3 = 266.66

```css
.flex-content {
  width: 800px;
}
.flex-content .flex-item {
  flex-grow: 1;
}
```

{% asset_image flex-grow-width-2.png %}

**父级宽度（400px）< 子元素宽度之和：**

由于子元素宽度总和大于父级，所以原本的宽度 200px 将失效，子元素宽度将为：400/3 = 133.33

{% asset_image flex-grow-width-3.png %}

## 只有其中一元素设置了 flex-grow

**只有其中一元素设置了 flex-grow**

```css
.flex-content {
  width: 800px;
}
.flex-content .flex-item {
  /* flex-grow: 1; */
}
.flex-content .flex-item[num="2"] {
  flex-grow: 1;
}
```

第 1 个和第 2 个元素保持原 200px（默认不增长），多余空间为：800-200\*2 = 400，中间元素将增长到 400px

{% asset_image flex-grow-only-1.png %}

**当 flex-grow 值为小数：**

为小数时，分母默认为 1，即此时增长率为 0.5/1，中间元素将增长到：200+0.5/1\*200=300

{% asset_image flex-grow-only-2.png %}

```css
.flex-content .flex-item[num="2"] {
  flex-grow: 0.5;
}
```

# flex-shrink

> 指定了 flex 元素的收缩规则。flex 元素仅在默认宽度之和大于容器的时候才会发生收缩，其收缩的大小是依据 flex-shrink 的值。默认值为 1。

## 在不同 width 下的变化

**父级宽度（600px）= 子元素宽度之和（600px）：**

两者宽度相同，不做收缩处理。

```css
.flex-content {
  display: flex;
  justify-content: space-around;
  width: 600px;
}
.flex-content .flex-item {
  flex-shrink: 1;
}
```

{% asset_image flex-shrink-width-2.png %}

**父级宽度（500px）< 子元素宽度之和（600px）：**

```css
.flex-content {
  display: flex;
  justify-content: space-around;
  width: 500px;
}
.flex-content .flex-item {
  flex-shrink: 1;
}
```

缺少空间为 100px，每个元素收缩率为：1/(1\*3)，即收缩长度为：200-100\*1/(1\*3) = 166.67

{% asset_image flex-shrink-width-1.png %}

## 只有其中一元素设置了 flex-shrink

**flex-shrink 为整数时：**

缺少空间为：200\*3 - 500 = 100，中间元素将收缩到 200-100\*(2/4)=150，第 1 个和第 2 个元素为 200-100\*(1/4)=175

```css
.flex-content .flex-item[num="2"] {
  flex-shrink: 2;
}
```

{% asset_image flex-shrink-value-1.png %}

**flex-shrink 为小数时：**

中间元素将收缩到 200-100\*0.5/(2+.5)=180

```css
.flex-content .flex-item {
  flex-shrink: 0.5;
}
```

{% asset_image flex-shrink-value-2.png %}

# flex-basis

> 指定了 flex 元素在主轴方向上的初始大小。如果不使用 box-sizing 改变盒模型的话，那么这个属性就决定了 flex 元素的内容盒（content-box）的尺寸。

上面的例子中子元素都以 **width** 来初始化他们的宽度，但在 **flex** 布局中，还是强烈建议使用 **flex-basis**，一方面 **flex-basis** 的优先级高于 width，另一方面避免两者混用在不同浏览器展示形态的不同。

## flex-basis 优先级高于 width

**flex-basis** 设置 100px，width 设置 200px，最终增长的宽度是基于 **flex-basis**：

{% asset_image flex-basis-width-1.png %}

注意，当 **flex-basis** 为 auto 时，则会以 **width** 设置的值为基数来计算。

## 三个属性的简写

参照 flex 语法：

```css
flex: none /* value 'none' case */
flex: <'flex-grow'> /* One value syntax, variation 1 */
flex: <'flex-basis'> /* One value syntax, variation 2 */
flex: <'flex-grow'> <'flex-basis'> /* Two values syntax, variation 1 */
flex: <'flex-grow'> <'flex-shrink'> /* Two values syntax, variation 2 */
flex: <'flex-grow'> <'flex-shrink'> <'flex-basis'> /* Three values syntax */
flex: inherit
```

所以可以自行感受如下这些简写是什么含义：

**可增长**

```css
.flex-content {
  width: 800px;
}
.flex-content .flex-item {
  /* 等同于 flex-grow: 1; */
  flex: 1;
}
```

{% asset_image flex-grow-width-2.png %}

**设置基础宽度**

```css
.flex-content {
  width: 600px;
}
.flex-content .flex-item {
  /* 等同于 flex-basis:200px */
  flex: 200px;
}
```

{% asset_image flex-grow-width-1.png %}

**可增长+设置基础宽度**

```css
.flex-content {
  width: 800px;
}
.flex-content .flex-item {
  /* 等同于 */
  /* flex-grow: 1; */
  /* flex-basis:200px; */
  flex: 1 200px;
}
```

{% asset_image flex-grow-width-2.png %}

**可增长+可缩小**

```css
.flex-content {
  width: 500px;
}
.flex-content .flex-item {
  /* 等同于 */
  /* flex-basis: 200px; */
  /* flex-grow: 1; */
  /* flex-shrink:1; */
  flex: 1 1 200px;
}
```

{% asset_image flex-shrink-width-1.png %}

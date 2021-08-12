---
title: 浅谈 flex-grow 和 flex-shrink 是这么回事
tags:
---

# 前言

之前面试被问到如下问题：

> flex: 1 0 auto;

你知道它是什么意思么？虽然知道是有关伸缩的几个属性占位，但因为平时只写 **flex: 1**，一直没关注过这个语法糖具体是什么规则，只要无奈回答：不知道。

可能这是个八股文，网上查查便知道，但写完这篇后我觉得不应该发生在一个 web 开发的“老人”身上。

**flex 有如下写法：**

```css
flex: none /* value 'none' case */
flex: <'flex-grow'> /* One value syntax, variation 1 */
flex: <'flex-basis'> /* One value syntax, variation 2 */
flex: <'flex-grow'> <'flex-basis'> /* Two values syntax, variation 1 */
flex: <'flex-grow'> <'flex-shrink'> /* Two values syntax, variation 2 */
flex: <'flex-grow'> <'flex-shrink'> <'flex-basis'> /* Three values syntax */
flex: inherit
```

如果你也对 flex-grow，flex-shrink，flex-basis 这三个属性不太了解的话，就随着下面的代码示例牢记在脑子里吧。

# flex-grow

> 它指定了 flex 容器中剩余空间的多少应该分配给项目（flex 增长系数），默认为 0（无效）

**TLDR**：弹性盒子内（display: flex），所有子元素（项目 item）的宽度总和不超过父级宽度的话，剩下的空间将被 **flex-grow** 修饰的元素按照一个规则进行验伸长。

先来看张动图：

{% asset_image flex-grow.gif 伸长示例 %}

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

能看到随着 flex-grow 改变，中间元素从 200px 到填充整个区域做着切换。这个就当热身，下面正式开始了。

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

每个子元素将保持不变，因为没有多余空间供元素伸长，所以即使设置了 flex-grow 也没效果。

{% asset_image flex-grow-width-1.png %}

**父级宽度（800px）> 子元素宽度之和：**

每个元素的伸长率为 1/(1+1+1)，多余空间为：800-200\*3=200。

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

第 1 个和第 2 个元素保持原 200px，多余空间为：800-200\*2 = 400，中间元素将伸长到 400px（伸长率 1/1）

{% asset_image flex-grow-only-1.png %}

**当 flex-grow 值为小数：**

为小数时，分母默认为 1，即此时伸长率为 0.5/1，中间元素将伸长到：200+0.5/1\*200=300

{% asset_image flex-grow-only-2.png %}

```css
.flex-content .flex-item[num="2"] {
  flex-grow: 0.5;
}
```

# flex-shrink

## 元素设置 flex-shrink 后，在不同 width 下的变化

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

## 不同 flex-shrink 值，缩小的比例

```css
.flex-content .flex-item[num="2"] {
  flex-shrink: 1;
}
```

```css
.flex-content .flex-item[num="2"] {
  flex-shrink: 2;
}
```

```css
.flex-content .flex-item {
  flex-shrink: 0.5;
}
```

```css

```

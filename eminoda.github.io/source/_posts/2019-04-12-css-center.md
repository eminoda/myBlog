---
title: css 水平和垂直居中的几种方式
tags: css
categories:
  - 开发
  - css
thumb_img: css.png
date: 2019-04-12 00:00:32
---

简单列举 css 中水平和垂直的居中方式，网上资料大把，十几种实现方式，这里拿其中常用的几种作为复习巩固。

# 水平居中

{% asset_img c-1.jpg 水平 %}

## text-align 方式

```html
<p>1. text-align 方式</p>
<div class="demo-content" style="text-align: center">
	<span>非块级元素 inline-block; 也适用</span>
	<div style="display:inline-block;">非块级元素</div>
</div>
```

## 定宽 + margin auto 方式

```html
<p>2. 定宽 + margin auto 方式</p>
<div class="demo-content" style="">
	<div style="margin:0 auto;width:200px;text-align: center;">自身定宽</div>
</div>
```

## flex 方式

弹性布局方式也是最快容易上手，也好配置

```html
<p>3. flex 方式</p>
<div class="demo-content" style="display: flex;justify-content: center;">
	<div style="">利用 justify-content 方式</div>
</div>
```

## position + float 方式

比较骚气的操作，通过父子标签设置相对定位，再通过相反的浮动偏移量进行居中

```html
<p>4. position + float 方式</p>
<div class="demo-content" style="clear: both;overflow: hidden;">
	<div style="float:left;position:relative;left:50%">
		<div style="float:right;position:relative;;left:-50%">多设置了一个元素，与父元素交错</div>
	</div>
</div>
```

# 垂直居中

{% asset_img h-1.jpg 垂直-1 %}

## line-height 方式

```html
<p>1. line-height 方式</p>
<div class="demo-content" style="height:100px;">
	<span class="border" style="line-height: 100px;">内联元素设置和父级一致的行高</span>
</div>
```

## table 方式

除了一定要显示 **表格** 的界面，基本个人不怎么用这玩意，div 用得太多了，导致太陌生了

```html
<p>2. table 方式</p>
<div class="demo-content">
	<div style="height:100px; display: table;">
		<div class="border" style="display: table-cell;vertical-align: middle;">
			<div>父级设置 table 布局，子级使用 table cell，设置垂直居中属性</div>
		</div>
	</div>
</div>
```

## flex 方式

同水平布局，配置的问题

```html
<p>3. flex 方式</p>
<div class="demo-content">
	<div class="border" style="height:100px;display: flex;align-items: center;">
		<div>使用 flex，设置 align-items</div>
	</div>
</div>
```

{% asset_img h-2.jpg 垂直-2 %}

## position + margin 偏移 方式

```html
<p>4. position + margin 偏移 方式</p>
<div class="demo-content">
	<div class="border" style="height:100px;position: relative;">
		<div style="position: absolute;top: 0;line-height: 50px;margin-top: 25px;">偏移本元素的 1/2 高</div>
	</div>
</div>
```

## position + margin auto 方式

```html
<p>5. position + margin auto 方式</p>
<div class="demo-content">
	<div class="border" style="height:100px;position: relative;">
		<div style="position: absolute;margin:auto;top: 0;bottom: 0;height: 50px;line-height: 50px;">position 上下都为 0，margin auto</div>
	</div>
</div>
```

## position + transform

算是 css3 比较骚气的方法，如果兼容没有问题，通过 transform 做到 **中心定位** 也是最方便和理解的

```html
<p>6. position + transform</p>
<div class="demo-content">
	<div class="border" style="height:100px;position: relative;">
		<div style="position: absolute;top: 50%;left:50%; transform: translate(-50%,-50%);height: 50px;line-height: 50px;">
			translate 本元素的 -1/2
		</div>
	</div>
</div>
```

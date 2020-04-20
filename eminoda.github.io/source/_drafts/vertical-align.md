---
title: 垂直居中里的 vertical-align
tags: css
categories:
  - 开发
  - 前端开发
thumb_img: css.png
---

# vertical-align

> 属性 vertical-align 用来指定行内元素（inline）或表格单元格（table-cell）元素的垂直对齐方式。

# 认识基线

因为，**行盒子的基线是个变量** ；同时，vertical-align 是 **相对父元素的值**。

所以行内的基线会随着内部的内容而不断调整，可以对比下面几个例子体会下：

分别定义三个 span 字体不同的行内元素（20px、30px、40px），看他们在整行内如何布局？

```html
<div class="wrap">
  <span class="bl">baseline</span>
  <span class="item font20">20</span>
  <span class="item font30">30</span>
  <span class="item font40">40</span>
</div>
```

{% asset_img baseline1.png %}

能看到他们每个“字”的底部都在 **红线** 上，这条线就是 **基线 baseline** 。

如果通过 vertical-align 调整某个元素的垂直对齐方式，那么他们将发生变化：

```css
.font40 {
  font-size: 40px;
  vertical-align: middle;
}
```

{% asset_img baseline2.png %}

我们只修改 40px 的元素的对齐方式为 middle，那么其基线将在它的垂直区域的中间，前面其他元素则会按这个新基线做对齐（注意红线）。

那如果所有元素都改为 middle 呢？

```html
<div class="wrap">
  <span middle class="bl">baseline</span>
  <span middle class="item font20">20</span>
  <span middle class="item font30">30</span>
  <span middle class="item font40">40</span>
</div>
```

```css
[middle] {
  vertical-align: middle;
}
```

{% asset_img baseline3.png %}

能看到他们彼此间都按照新的基线在对齐，像一个横过来的金字塔。

# 看些案例

## image 和 inline element 对齐问题

**为何 image 底下会有白底？**

{% asset_img baseline4.png %}

代码如下：

```html
<div class="wrap">
  <div style="border: 1px solid green;"><img src="./img.png" alt="" width="100px" height="100px" /> <span>我是 inline 元素</span></div>
</div>
```

因为 span 标签的文字并不是按 border 的线和 image 图片进行对齐的，行内元素未对 vertical-align 做设置前，这个基线就是行内元素内文字底部的线（它和 image 是对齐的，图中红线）。

即使 span 没有设置 padding 等属性，但它上下还会留些空白，所以造成了 image 底部有白底。

**怎么使得 inline element 垂直居中**

将 div 内中的 image 和 span 分别设置 middle ，就可以让他们垂直居中。

```html
<img middle src="./img.png" alt="" width="100px" height="100px" /> <span middle>我是 inline 元素</span>
```

这里提一点：image 标签是 inline element，不同的是置换行内元素 replace inline element（此元素有其特有的显示方式，css 渲染模型不考虑对其渲染）

{% asset_img baseline5.png %}

## inline-block 对齐

试问，两个一样的行内块级元素，如果一个里面有文字，一个没有，最后对齐方式如何？

```css
li {
  border: 1px solid #c2c2c2;
  width: 100px;
  height: 100px;
  margin-right: 20px;
  display: inline-block;
}
```

```html
<div class="wrap">
  <li>我里面有文字</li>
  <li></li>
</div>
```

直接上图：
{% asset_img baseline6.png %}

是不是很奇怪？

其实内部如何有内容的话，其基线将是按照内部 inline 元素的基线对齐；而 inline-block 元素的基线则是元素底部，所以出现了图中对齐结果。

怎么更改？

只要将有内容的元素设置 top 对齐方式，则他们两个都被挪到了父元素下：

```css
vertical-align: top;
```

{% asset_img baseline7.png %}

# 参考文章

- [Vertical-Align，你应该知道的一切](https://zcfy.cc/article/vertical-align-all-you-need-to-know)
- [关于 vertical-align 你应该知道的一切](https://juejin.im/post/5e64ee1df265da573e6734ed)
- [replace inline element](https://www.w3.org/TR/CSS21/visudet.html#inline-replaced-width)

---
title: css border-image 属性
tags: css
categories:
  - 开发
  - 前端开发
thumb_img: css.png
---

# 边框设置背景图

## 边框设置背景图和 background 不一样

首先为 border 设置背景图并不是像 background 一样，可以维护 url() 或者 color。

```css
border: 20px solid url('./border-source.png'); //error

background: red;
background: url('./border-source.png');
```

专门设置边框图片需要使用 **border-image** 属性，但是其中设置会有些麻烦（我刚接触这属性完全没头绪）。

下面由浅入深，尽可能这这个属性描述清楚。

## border-image-source 引用资源

比如，我们有个这样的图片（中间画了很多颜色线条），将它放到边框 border 中作为背景图该怎么做？

{% asset_img border-source.png %}

首先 **border-image-source** 和 **background-image** 一样，都是具体引用资源的属性。

思考如下代码，**会有怎么样的显示：**

```html
<style>
  .border-linear {
    width: 100px;
    height: 100px;
    border: 20px solid red;
    display: inline-block;
    border-image-source: url('./border-source.png');
  }
</style>
<div class="border-linear">
  自定义边框
</div>
```

**是不是很奇怪？只出来四个角。**

{% asset_img border-image1.png %}

## border-image-slice 切割素材

这里就要明白 **border-image** 一些属性概念：

{% asset_img border-image.png %}

如上图，我们的（图片）资源将被切割成 9 块内容。其中 1~8 将作为边框内容，9 是在 **border-image** 值中出现 fill 时填充到边框内部的元素上。

1~4 （corner region）作为边框四个角，5~8 （edge region）在四条边上按照特定的方式显示。

那怎么让这个边框“正常”些呢？这里就涉及第二个属性：**border-image-slice**。

现在添加该属性，并设置 1px：

```css
border-image-slice: 1;
```

应该有点味道了，**但为什么全是灰色的呢？**

{% asset_img border-image2.png %}

首先 **border-image-slice** 设置为 1，其表示将截取背景图 5~8 位置中 1px 的“素材”；同时，我们 border 的宽度为 30px，按照这属性的定义，这 1px 的内容将在 30px 的宽度中按照特定的方式重复。

这里提到的特定方式是指 **border-image-repeat** 对应的 stretch | repeat | round | space 。

**那怎么将图片资源按照预期显示呢？**

我们图片资源单边的宽度正好也是 30px，那么现在就将 **border-image-slice** 设置为 30px，按照预期将填充到 border 的四个 30px 宽度的边框中。

```css
border-image-slice: 30;
```

{% asset_img border-image3.png %}

**border-image-slice 也可以分别设置四条边：**

和 padding 一样，支持：上下+左右、上+右+下+左、上+左右+下 这几种形式，我们这里就将上下的边设置的比原先图片资源的单边宽小（< 30px），看效果如何：

```
border-image-slice: 10 30;
```

{% asset_img border-image4.png %}

能看到上下的边按照图片资源的宽度进行裁剪，宽度为 10px，而左右的边和原先单边宽度一致，所以就出现上图的样子。

## fill 填充

> 9 是在 **border-image** 值中出现 fill 时填充到边框内部的元素上。

下面来说下 fill 值：

其实很简单，只要在 **border-image-slice** 属性值上的任意位置出现 **fill** 字段即可，那么对于当前元素背景图的内容将使用 **border-image-source** 的资源。

我先把资源图的中间加些内容：

{% asset_img border-source2.png %}

当设置 fill 后：

```css
border-image-slice: 30 30 fill;
```

{% asset_img border-image5.png %}

好像很酷，马上就有个疑问：**和 background 一起使用，会怎么样？**

```css
border-image-slice: 30 30 fill;
background-color: seagreen; /* 没出来*/
background-image: url('./border-source.png'); /* 没出来*/
```

最后还是以 border 的资源为主。

## border-image-width 和 border-width

上面已经涉及过 border-width 的问题了，截取的素材宽度 < 边框宽度，素材将在边框中重复。

但如果我们设置了 **border-image-width** 呢？

下面分别设置 **border-image-width**：按大于、小于 border-width 看效果：

```css
border-image-width: 40px;
```

{% asset_img border-image6.png %}

```css
border-image-width: 8px;
```

{% asset_img border-image7.png %}

能看到已经按照 **border-image-slice** 切割后的素材按照 **border-image-width** 进行填。

如果 **border-image-width** 大于 **border-width** 则会“侵蚀”元素 padding or content 区域；小于则会将 slice 的素材缩小到 **border-image-width** 的宽度中。

## 简写

border-image-source，border-image-slice 之类的属性是可以用 border-image 一个属性来表示的，和 background 一样。

格式如下：

> <'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>

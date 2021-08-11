---
title: 使用 canvas 绘制网格背景
tags:
  - canvas
categories:
  - 开发
  - 前端开发
thumb_img: canvas.png
date: 2021-08-11 16:28:01
---


# 前言

有没有很好奇，类似 **processOn** 这类作图网站中，**网格背景** 是怎么做的呢？

{% asset_img processon.png 网格背景 %}

如果你 F12 看过它的代码，你将发现原来不是通过 **background-image** 之类 **css** 属性做的，而是通过 **canvas** 实现的。

{% asset_img processon-2.png 网格背景 %}

这篇主要讲如何通过 **canvas** 来绘制出这样的 **网格背景**，以及中间碰到的一个 **线条模糊的问题**。

# 手把手写代码

## 1. 创建 ctx 对象

这边将新建一个和屏幕尺寸相同的 **canvas** 画布：

```js
const canvasEl = document.createElement("canvas");
const sh = screen.height;
const sw = screen.width;
canvasEl.width = sw;
canvasEl.height = sh;
const ctx = canvasEl.getContext("2d");
```

## 2. 绘制网格

先简单说下思路：

根据 **canvas** 画布尺寸，以 **10px** 为间距，分别绘制横纵坐标的线条。

比如绘制横向线条，先将“画笔”移至起点坐标 (0, y)，然后通过线条方法 **lineTo** 绘制屏幕宽度的线条，即绘制 (0, y) 至 (screen.width, y) 的直线。

然后 **y** 会按照间距 **10px** 逐渐递增，直至绘制完整个屏幕。

下面根据横纵两个方向，封装了 **draw** 方法：

```js
const draw = function (isColumn) {
  const gutter = 10;
  const limit = isColumn ? sh : sw;

  let i = 0;
  while (i * gutter + gutter <= limit) {
    i++;
    const point = i * gutter;

    // 清空子路径列表开始一个新路径
    ctx.beginPath();

    // 分割线
    ctx.strokeStyle = point % 100 !== 0 ? "#f0f0f0" : "#d6e4ff";

    // 将一个新的子路径的起始点移动到(x，y)坐标
    if (isColumn) {
      ctx.moveTo(0, point);
    } else {
      ctx.moveTo(point, 0);
    }
    // 使用直线连接子路径的终点到x，y坐标
    if (isColumn) {
      ctx.lineTo(sw, point);
    } else {
      ctx.lineTo(point, sh);
    }
    // 根据当前的画线样式，绘制当前或已经存在的路径的方法
    ctx.stroke();
  }
};
```

很顺利你将得到 **canvas** 绘制的网格图形：

{% asset_img grid.png 网格背景 %}

# 线条模糊

如果你观察比较细腻，能发现上面的网格图形并不是很清晰，可以仔细观察下面的图：

{% asset_img grid-3.png 对比 %}

**为什么会有这样的情况出现呢？**

因为调用 **lineTo** 是从 A 点到 B 点，轨迹是点到点的连线。当绘制 1px 线条时，是以这个轨迹连线为中间线左右各渲染 0.5px 的线条。这会使得一个像素点只渲染了一半，而另一半会用一个比较弱的颜色填充，导致绘制出模糊的线条。

**怎么改？**

只要在 **moveTo** 时，将坐标偏移 0.5px（即将线条轨迹偏移 0.5 位置），然后调用 **lineTo** 时，也将坐标偏移 0.5px。

这样，最终绘制线条的时候，将在一个完整的像素区域进行渲染了。

{% asset_img canvas-0.5.png 选自：https://www.jianshu.com/p/c0970eecd843 %}

**有没有便捷的方法？**

使用 **translate** 偏移 x 和 y 坐标值，然后绘制后再调用 **setTransform** 重置回来：

```js
ctx.translate(0.5, 0.5);
//...
ctx.setTransform(1, 0, 0, 1, 0, 0);
```

# 参考

- [canvas 画布解决 1px 线条模糊问题](https://www.jianshu.com/p/c0970eecd843)
- [Drawing a 1px thick line in canvas creates a 2px thick line](https://stackoverflow.com/questions/13879322/drawing-a-1px-thick-line-in-canvas-creates-a-2px-thick-line)
- [CanvasRenderingContext2D.setTransform()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setTransform)

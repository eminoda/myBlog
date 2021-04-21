---
title: 如何用 cavans 实现签名手写板
tags:
  - canvas
categories:
  - 开发
  - 前端开发
thumb_img: canvas-jSignature.png
date: 2021-04-21 15:16:20
---


# 前言

web 手写板是个比较常见的需求了，多用在需要用户进行签名认证的业务中。

**canvas** 作为 H5 的新标签，适用于 **动态绘制** 复杂的 **高分辨率** 图形，是此类需求的最好方案。

但在实际开发中，遇到了几个问题：

- 如何用 canvas 做笔迹跟随？
- 有没有第三方签名插件？
- 横竖屏切换问题？

这篇围绕这几个问题进行解答说明。

# canvas 笔迹跟随

[MDN 提供了 Canvas 入门的详细文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)，基本常用 API 的都能直接找到。

## 创建 canvas 画布及画笔样式

```js
var canvasEl = document.createElement('canvas');
var ctx = canvasEl.getContext('2d');
var rootEl = document.getElementById('signature');
rootEl.appendChild(canvasEl);
```

```js
ctx.strokeStyle = '#000';
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.shadowBlur = 1;
ctx.shadowColor = '#000';
```

## 定义“画笔”事件

首先，结合 getBoundingClientRect 能获取画笔在画布中的坐标值

```js
function getPoint(event) {
  var touches = event.touches[0];
  var rect = canvasEl.getBoundingClientRect();
  var x = touches.clientX - rect.left;
  var y = touches.clientY - rect.top;
  return [x, y];
}
```

根据画笔绘制过程，拆分为三个状态：开始绘制（记录 canvas 起始点），笔迹跟随，绘制完成（事件释放）

```js
// 开始签名
function startEvent(event) {
  ctx.beginPath.apply(ctx, getPoint(event));
  canvasEl.addEventListener('touchmove', drawSign, false);
  canvasEl.addEventListener('touchend', removeEvent, false);
}
// 轨迹移动
function removeEvent(event) {
  ctx.closePath();
  canvasEl.removeEventListener('touchmove', drawSign, false);
  canvasEl.removeEventListener('touchend', removeEvent, false);
}
function drawSign(event) {
  var point = getPoint(event);
  ctx.lineTo.apply(ctx, point);
  ctx.stroke();
}

canvasEl.addEventListener('touchstart', startEvent, false);
```

## 效果如下

{% asset_img canvas-demo.gif 笔迹跟随 %}

# jSignature

上面虽然完成了功能，只是简单的 Demo，实际更偏向使用更稳定的第三方插件： **jSignature** 是个比较好的选择。

它依赖 **jQuery** ，对于不支持 **canvas** 的浏览器有降级处理，同时对笔迹绘制，图形导出有优化，对比我们 Demo，其有更好的稳定性和扩展性。

**jSignature** 提供了[线上 demo](http://brinley.github.io/jSignature/)，可以直接看效果。

伪代码如下（Vue）：

```html
<template>
  <div id="content">
    <!-- 画布 -->
    <div id="signature"></div>
    <!-- 操作栏... -->
  </div>
</template>
<script>
  export default {
    methods: {
      submit() {
        // 获取签名图片
        var data = $('#signature').jSignature('getData', 'image');
        var base64Img = 'data:' + data.join(',');
      },
    },
    mounted() {
      // 渲染画布
      const $sigdiv = $('#signature').jSignature({ height: height + 'px', width: width + 'px' });
    },
  };
</script>
```

最后页面效果如下：

{% asset_img jsign-demo.png jSignature-demo %}

# 屏幕旋转问题

## 如何切换横屏

这个问题很简单，对 css 添加个属性 **transform** 旋转属性便可，但会发现旋转 90° 后页面出现了异常：

{% asset_img rotate-error.gif 旋转异常 %}

顶部导航栏栏，按钮操作栏都消失了，画布也错位。

## 旋转后，页面显示异常

这是因为旋转的整个元素按着页面中心进行旋转（横竖屏切换），之后需要重新对页面旋转后的宽高进行置换：

```css
#app {
  height: 360px;
  width: 640px;
}
```

由于宽高调整后，旋转的中心改变了，需要对偏移量进行修复。

{% asset_img rotate-device.png 旋转中心 %}

这个偏移量起始先对未旋转前的页面计算旋转中心点（已重置过宽高），假设坐标原点在左上角，那么坐标值为：(320,180)

当旋转 90° 后，坐标值更换为：(180，320)，需要对 320-180=140 进行偏移重置。那么 css 样式更新为：

```css
#app {
  height: 360px;
  width: 640px;
  transform: rotate(90deg);
  position: absolute;
  top: 140px;
  left: -140px;
}
```

最后旋转后的页面将恢复正常：

{% asset_img rotate-fix.png 偏移重置后 %}

## 画布错位

当绘制签名时，会发现画布显示异常，绘制位置和实际笔迹出现的位置不同（被旋转 90°），而且画布也非旋转后的大小。

{% asset_img rotate-canvas-error.gif 画布错位 %}

旋转后画布实际区域如下：

{% asset_img rotate-error.png 画布实际区域 %}

虽然 **画板区域** 是在页面旋转后生成，但画布所挂载的节点受旋转的影响。所以对于画布需要“撤销”旋转的 90° 影响，同时画布在生成前需要根据旋转后实际呈现的高宽指定生成。

代码如下：

```js
// 计算画布宽高（去除顶部和底部导航*系数）
calcBoard(isHorizontal, ratio = '0.8') {
    // 顶部，底部导航
    const titleRect = $('.van-nav-bar')[0].getBoundingClientRect();
    const bottomRect = $('#tools')[0].getBoundingClientRect();
    // 横版
    if (this.isHorizontal) {
        return {
            height: window.innerHeight,
            width: (window.innerWidth - titleRect.width - bottomRect.width) * ratio,
        };
    }
    // 竖版
    return {
        height: (window.innerHeight - titleRect.height - bottomRect.height) * ratio,
        width: window.innerWidth,
    };
},
// 反转画布绘制区域
canvanRevert(isHorizontal, boardHeight) {
    if (isHorizontal) {
        // 固定旋转点
        // 偏移画布高度+title高度
        const titleRect = $('.van-nav-bar')[0].getBoundingClientRect();
        $('#signature .jSignature').css({
            transform: 'rotate(-90deg)',
            position: 'absolute',
            'transform-origin': `0 0`,
            // header + 画板高度
            top: titleRect.width + boardHeight + 'px',
        });
    } else {
        $('#signature .jSignature').css({
            transform: 'none',
            position: 'unset',
        });
    }
}
```

```js
// 获取画板宽高
const { height, width } = this.calcBoard(isHorizontal);
// 绘制画板
$('#signature').jSignature({ height: height + 'px', width: width + 'px' });
// 反转画布绘制区域
this.canvanRevert(this.isHorizontal, width);
```

最后，签名绘制和笔迹呈现保持了一致。

## tip 弹框错位

虽然上面对画布区域进行了“额外处理”使整个页面显示正常，但实际交互中会有一些 tip 或者弹框提示，这些元素由于是新挂载到页面某些节点上的，没有受旋转影响，就会有如下非预期展示：

{% asset_img tip.png tip异常 %}

而我们不可能见一个修改一个，需要全局的观察这类元素变动，进行错位展示的重置。

这时我们可以借助 **MutationObserver** 来对这些元素进行监听，来反转 90° 重置：

```js
listenElementChange() {
    const self = this;
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == 'attributes') {
            const targetEl = $('.van-toast');
            // 匹配 toast
            if (targetEl[0] == mutation.target) {
                if (mutation.target.getAttribute('class').indexOf('van-fade') !== -1) {
                targetEl.css({
                    transform: self.isHorizontal ? 'rotate(90deg)' : '',
                });
                }
            }
            }
        });
    });

    observer.observe(window.document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['style'],
    });
}
```

解决上述几个问题后，最后效果如下：

{% asset_img jsign-rotate-demo.gif 完整效果 %}

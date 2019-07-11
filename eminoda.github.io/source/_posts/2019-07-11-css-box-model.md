---
title: css 盒子模型
tags: css
categories:
  - 开发
  - css
thumb_img: css.png
date: 2019-07-11 16:09:18
---


## 盒子模型

浏览器引擎会根据 css 的盒子模型标准，将 css 中的颜色，大小，位置等属性定义在盒子中来渲染显示。

### 四个边界

- 内容边界 content edge
- 内边距边界 padding edge
- 边框边界 border edge
- 外边框边界 margin edge

{% asset_img css-box-edge.png 各边界 %}

### 四个区域

- 内容区域 content area （白色）
- 内边距区域 padding area （蓝色）
- 边框区域 border area （浅粉色）
- 外边距区域 margin area （绿色）

{% asset_img css-box-content.png 各区域 %}

## 浏览器对内容区域的计算

IE 和 Chrome 对内容区域的长宽计算方式是不同的

**Chrome**

```html
<style>
  .demo2 .box-content {
    margin: 20px;
    padding: 20px;
    border: 5px solid #ffcc99;
    background-color: #6699ff;
    color: #333;
  }
</style>
<div class="demo2">
  <div class="box-content"><div style="background-color: #fff">长宽取值</div></div>
</div>
```

当前元素内容区域的宽 = 内边距区域 + 边框区域 + 内容区域 = 20\*2 + 5\*2 + 64 = 114

{% asset_img css-box-width.png chrome %}

**IE**

说是 IE8 以下的内容宽度计算 = 边框区域 + 内容区域 （但我没有试过）

## box-sizing 属性

有时候会有这样的情况：修改内部元素的 padding、border 会影响父元素的长宽

```html
<style>
  .demo3 .item {
    display: inline-block;
    margin-right: 10px;
    width: 100px;
    height: 100px;
    background-color: #6699ff;
  }
</style>
<div class="demo3">
  <div class="item">
    <div class="text-item">1</div>
  </div>
  <div class="item">
    <div class="text-item">2</div>
  </div>
  <div class="item">
    <div class="text-item">3</div>
  </div>
  <div class="item">
    <div class="text-item">4</div>
  </div>
</div>
```

{% asset_img box-sizing1.png 正常情况 %}

父元素的宽 = item 的宽 + margin = (100+10)\*4 + 2 = 442

当如果对 item 添加如下样式，就会影响到父元素

```css
.demo3 .item {
  /* ... */
  padding-right: 10px;
  border: 5px solid red;
}
```

{% asset_img box-sizing2.png 父元素变宽 %}

多增加了：padding + border = (10+5\*2)\*4 = 80

如果要修正这一问题，就需要了解 **box-sizing** 中的两个属性的不同：

- content-box
  默认值。实际宽度 = content + padding + border

- border-box
  实际宽度 = content , content 内含 padding + border

```css
.demo3 .item {
  /* ... */
  padding-right: 10px;
  border: 5px solid red;
  box-sizing: border-box; /* 子元素中 */
}
```

{% asset_img box-sizing3.png box-sizing %}

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [CSS 基础框盒模型介绍 MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model)
- [CSS 解决高度自适应问题 cnblogs](https://www.cnblogs.com/zhujl/archive/2012/03/20/2408976.html)
- [CSS 盒模型完整介绍 segmentfault](https://segmentfault.com/a/1190000013069516)
- [对 html 与 body 的一些研究与理解 张鑫旭](https://www.zhangxinxu.com/wordpress/2009/09/%E5%AF%B9html%E4%B8%8Ebody%E7%9A%84%E4%B8%80%E4%BA%9B%E7%A0%94%E7%A9%B6%E4%B8%8E%E7%90%86%E8%A7%A3/)

---
title: css 盒子模型
tags: css
categories:
  - 开发
  - css
thumb_img: css.png
---

## 盒子模型

浏览器引擎会根据 css 的盒子模型标准，将 css 中的颜色，大小，位置等属性定义在盒子中来渲染显示。

## 四个边界

- 内容边界 content edge
- 内边距边界 padding edge
- 边框边界 border edge
- 外边框边界 margin edge

{% asset_img css-box-edge.png 组成部分 %}

## 四个区域

### 内容区域 content area

由 **内容边界** 限制。比如：通过 width、min-width、max-width、height、min-height，和 max-height 控制。

### 内边距区域 padding area

由 **内边距边界** 限制

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [CSS 基础框盒模型介绍 MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model)
- [CSS 解决高度自适应问题](https://www.cnblogs.com/zhujl/archive/2012/03/20/2408976.html)

---
title: flex 弹性布局
tags: css
categories:
  - 前端
  - css
no_sketch: true
---

传统布局通过position，float，display来实现各种排版，但如果要更“简便”，“高效”的实现某些布局，可能flex是个好选择。
flex弹性布局，我没怎么用过，也这是写这篇的文章的主要目的，重在熟悉它。虽然我们的PC端依旧在**各种无脑数据**暗示下还要兼容IE8，但还是要对未来有信息。

## flex简介
Flexbox Layout是W3C前几年推出的一种布局方式，其意更高效的实现页面布局，在未知布局的高宽等因素下弹性的适应页面。

{% asset_img caniuse.png 兼容性 %}

[如上图，兼容性](https://caniuse.com/#feat=flexbox)在国内可能不太友好，你懂的。

flex不是一个简单的属性参数，定义flex的元素相当于一个容器，可称为flex container，内部子项称为flex items。
一个标准有规则的布局通常有排列方向，通过flex-flow direction定义，下图主要介绍flex的主要核心：
{% asset_img flexbox.png  %}

- main axis：主轴，串起flexbox内部item元素。当然不一定是水平，根据flex-direction改变。
- main-start/end：flexbox容器内item所在的位置
- main size：flex item的宽高的大小
- cross axis：纵轴，相对于main axis
- cross-start/end：相对于main-start/end
- cross size：flex item的宽高的大小

## flex container
可在flex父容器定义的属性
### display
当定义flex时，及时block元素也将按照弹性布局的那种direction来呈现。

{% asset_img display.png 定义flex的区别 %}
````html
<div>
    <div class="my-item">1</div>
    <div class="my-item">2</div>
    <div class="my-item">3</div>
</div>
<div class="line"></div>
<div class="flex-container">
    <div class="my-item">1</div>
    <div class="my-item">2</div>
    <div class="my-item">3</div>
</div>
````
````css
.flex-container {
    display: flex;
}
````

### flex-direction
定义items在 main-axis 或者 cross-axis 的排列方向

{% asset_img flex-direction.png flex-direction %}

````
flex-direction: row | row-reverse | column | column-reverse;
````

{% asset_img flex-direction2.png %}

### flex-wrap
当items的宽度超过container的宽度，将选择是否换行显示

{% asset_img flex-wrap.png flex-wrap %}

````
flex-wrap: nowrap | wrap | wrap-reverse;
````
**注意，如果定义nowrap，即使item有width，也会被container做自适应，也就是item定义的width无效**

{% asset_img flex-wrap2.png %}

### flex-flow(flex-direction+flex-wrap)
简写语法糖，就像border，backgound一样。
````
flex-flow: <‘flex-direction’> || <‘flex-wrap’>
flex-flow: row | row-reverse | column | column-reverse || nowrap | wrap | wrap-reverse
````

### justify-content
内容（水平）排版间隔
{% asset_img justify-content.png justify-content %}

````
justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
````
- flex-start: 默认，从左开始排版
- flex-end: 默认，从右开始排版，注意和**flex-direction: row-reverse**的不同
- center：居中
- space-between：每个item左右距离平均分配，首末item紧贴边缘
- space-around：每个item左右距离平均分配，首末item距离边缘是items之前距离的一半
- space-evenly：main axis的main-start到item，item到end中间的间距一致。[兼容不太友好](https://developer.mozilla.org/zh-CN/docs/Web/CSS/justify-content)

{% asset_img justify-content2.png %}

### align-items
（纵向）对齐方式
{% asset_img align-items.png align-items %}
````
align-items: flex-start | flex-end | center | baseline | stretch;
````
- flex-start：cross-start开始排列
- flex-end：cross-end开始排列
- center：垂直居中
- baseline：按照基准线
- stretch：垂直平铺

{% asset_img align-items2.png %}

### align-content
大致相对于justify-content
{% asset_img align-content.png align-content %}
````
align-content: flex-start | flex-end | center | space-between | space-around | stretch;
````
- flex-start: cross-start开始排列
- flex-end: cross-end开始排列
- center：上下内容均等，items中间无缝隙
- space-between：上下紧贴，中间items均分高度
- space-around：每个item上下距离平均分配，首末item距离边缘是items之前距离的一半
- stretch：高度平铺沾满
{% asset_img align-content2.png %}

## flex item
针对flex子元素项
### order
指定item的顺序自定义
{% asset_img order.png order %}
````
order: <integer>; /* default is 0 */
````

### flex-grow
定义item和其他item的倍数关系
{% asset_img flex-grow.png flex-grow %}
````
flex-grow: <number>; /* default 0 */
````

### flex-shrink
flex-grow的反义词，收缩
````
flex-shrink: <number>; /* default 1 */
````

### flex-basis
特殊指定item的size，可以（半分比、rem、px等形式）。auto将根据main-size分配
````
flex-basis: <length> | auto; /* default auto */
````

### flex
语法糖
````
flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]//Default is 0 1 auto
````

### align-self
和align-items相同，只是针对单个item
{% asset_img align-self.png align-self %}
````
align-self: auto | flex-start | flex-end | center | baseline | stretch;
````

## 应用场景
### 面板
{% asset_img example1.png %}
### 导航栏
{% asset_img example2.png %}
### 三段式布局
{% asset_img example3.png %}

## 适配问题
需要添加浏览器前缀，当然如果你使用预编译css工具，基本可以自动生成
````
display: -webkit-box;
display: -moz-box;
display: -ms-flexbox;
display: -webkit-flex;
display: flex;

-webkit-box-flex: $values;
-moz-box-flex:  $values;
-webkit-flex:  $values;
-ms-flex:  $values;
flex:  $values;

-webkit-box-ordinal-group: $val;  
-moz-box-ordinal-group: $val;     
-ms-flex-order: $val;     
-webkit-order: $val;  
order: $val;
````
## 参考
[Flex css tricks](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
[Flex 布局教程--阮一峰](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?utm_source=tuicool))
[Flex--mozilla](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)

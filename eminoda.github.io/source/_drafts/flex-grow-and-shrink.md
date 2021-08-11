---
title: flex-grow-and-shrink
tags:
---

# 代码

```html
<div class="flex-content">
  <div class="flex-item">1</div>
  <div class="flex-item" num="2">2</div>
  <div class="flex-item">1</div>
</div>
```

```css
.flex-content {
  display: flex;
  justify-content: space-around;
  width: 800px;
}
```

```css
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
.flex-content .flex-item[num="2"] {
  /* flex-grow: 2; */
  /* flex-shrink: 3; */
}
```

# flex-grow

## 元素设置 flex-grow 后，在不同 width 下的变化

```css
.flex-content {
  width: 600px;
}
.flex-content .flex-item {
  width: 200px;
  flex-grow: 1;
}
```

1. 总宽度等于元素之和
2. 总宽度大于元素之和
3. 总宽度小于元素之和

## 只有其中一元素设置了 flex-grow

```css
.flex-content {
  width: 800px;
}
.flex-content .flex-item[num="2"] {
  flex-grow: 1;
}
.flex-content .flex-item[num="2"] {
  flex-grow: 2;
}
```

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
